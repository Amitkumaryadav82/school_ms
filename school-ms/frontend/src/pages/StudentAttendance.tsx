import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, Tabs, Tab, Divider, Grid, Card, CardHeader, CardContent, Stack, LinearProgress } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { attendanceService, Attendance } from '../services/attendanceService';
import { holidayService } from '../services/holidayService';
import { Student, studentService } from '../services/studentService';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle, Edit, HighlightOff, Save } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const gradeOptions = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
const sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F'];

type Status = Attendance['status'];

const statusColor = (status?: Status) => {
  const map: Record<string, any> = {
    PRESENT: 'success',
    ABSENT: 'error',
    LATE: 'warning',
    EXCUSED: 'info',
  };
  return status ? map[status] || 'default' : 'default';
};

const statusIcon = (status?: Status) => {
  const map: Record<string, JSX.Element> = {
    PRESENT: <CheckCircle fontSize="small" />,
    ABSENT: <HighlightOff fontSize="small" />,
  } as any;
  return status ? map[status] : undefined;
};

const StudentAttendance: React.FC = () => {
  const { showNotification } = useNotification();
  const { currentUser } = useAuth();
  const isStudent = !!currentUser?.roles?.some(r => String(r).toUpperCase().includes('STUDENT'));
  const [activeTab, setActiveTab] = useState<number>(0); // 0 = Daily, 1 = Reports
  const [reportTab, setReportTab] = useState<number>(0); // 0 = Section, 1 = Student
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [grade, setGrade] = useState<string>('1');
  const [section, setSection] = useState<string>('A');
  const [students, setStudents] = useState<Student[]>([]);
  const [attnMap, setAttnMap] = useState<Record<number, Attendance & { id?: number }>>({});
  const [edit, setEdit] = useState<Record<number, boolean>>({});
  const [draft, setDraft] = useState<Record<number, Partial<Attendance>>>({});
  // Reports state
  const [reportMonth, setReportMonth] = useState<number>(dayjs().month() + 1);
  const [reportYear, setReportYear] = useState<number>(dayjs().year());
  const [sectionReport, setSectionReport] = useState<any | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<any | null>(null);
  const [studentSummary, setStudentSummary] = useState<any | null>(null);
  const [studentMonthlyRecords, setStudentMonthlyRecords] = useState<Attendance[] | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');

  useEffect(() => {
    const load = async () => {
      try {
        if (isStudent) {
          // For students, load only their own profile (via /api/students/me) and attendance for the day
          try {
            const me = await api.get<any>('/api/students/me');
            const meFront: Student = {
              id: me.id,
              studentId: me.studentId,
              name: `${me.firstName} ${me.lastName}`.trim(),
              grade: String(me.grade),
              section: me.section,
              email: me.email,
              phoneNumber: me.contactNumber,
            } as any;
            setStudents([meFront]);
            setGrade(String(me.grade));
            setSection(me.section);
            setSelectedStudentId(me.id);
            const existing = await attendanceService.getStudentAttendanceByDateRange(String(me.id), date.format('YYYY-MM-DD'), date.format('YYYY-MM-DD'));
            const map: Record<number, any> = {};
            if (existing && existing.length) {
              map[me.id] = existing[0];
            }
            setAttnMap(map);
          } catch (e:any) {
            showNotification(e.message || 'Failed to load your profile', 'error');
          }
        } else {
          // Prefer filtered fetch from backend to avoid large list and ensure section accuracy
          const filtered = await studentService.getByGradeAndSection(grade, section);
          setStudents(filtered);
          // load existing attendance for class & date
          const existing = await attendanceService.getSectionAttendance(grade, section, date.format('YYYY-MM-DD'));
          const map: Record<number, any> = {};
          existing.forEach((a: any) => { map[a.studentId] = a; });
          setAttnMap(map);
        }
      } catch (e: any) {
        showNotification(e.message || 'Failed to load students/attendance', 'error');
      }
    };
    load();
  }, [grade, section, date, isStudent]);

  // When changing grade/section, clear any selected student and summary in Reports tab
  useEffect(() => {
    setSelectedStudentId('');
    setStudentSummary(null);
  }, [grade, section]);

  const loadReports = async () => {
    try {
      if (!isStudent) {
        const [rep, stats] = await Promise.all([
          attendanceService.generateMonthlyReport(parseInt(grade, 10), section, reportYear, reportMonth),
          attendanceService.getMonthlyStats(parseInt(grade, 10), section, reportYear, reportMonth)
        ]);
        setSectionReport(rep);
        setMonthlyStats(stats);
      }
      // For Student tab, also fetch summary + daily when a student is selected (or self for student role)
      const targetId = isStudent ? students[0]?.id : (selectedStudentId || (students.find(s => !!s.id)?.id ?? undefined));
      const start = dayjs(`${reportYear}-${String(reportMonth).padStart(2,'0')}-01`).format('YYYY-MM-DD');
      const end = dayjs(start).endOf('month').format('YYYY-MM-DD');
      if (targetId) {
        const recs = await attendanceService.getStudentAttendanceByDateRange(String(targetId), start, end);
        setStudentMonthlyRecords(recs);
        // compute summary client-side for students; for staff use backend summary
        if (isStudent) {
          const present = recs.filter(r => r.status === 'PRESENT').length;
          const absent = recs.filter(r => r.status === 'ABSENT').length;
          const late = recs.filter(r => r.status === 'LATE').length;
          // working days will be reflected in CSV; summary here is based on records available
          const total = present + absent + late + recs.filter(r => r.status === 'EXCUSED').length;
          const percentage = total > 0 ? (present * 100) / total : 0;
          setStudentSummary({ presentDays: present, absentDays: absent, lateDays: late, attendancePercentage: percentage } as any);
        } else {
          const sum = await attendanceService.getStudentAttendanceSummary(targetId, start, end);
          setStudentSummary(sum);
        }
      } else {
        setStudentSummary(null);
        setStudentMonthlyRecords(null);
      }
    } catch (e: any) {
      showNotification(e.message || 'Failed to load reports', 'error');
    }
  };

  // CSV helpers
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const escape = (v: any) => {
      const s = v == null ? '' : String(v);
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };
    const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadSectionCSV = () => {
    if (!sectionReport) return;
    const headers = ['Grade','Section','Year','Month','StudentId','Student Name','Present','Absent','Late','Percent'];
    const idMap = new Map<number, string>();
    students.forEach(s => { if (s.id != null) idMap.set(s.id, s.studentId); });
    const rows = sectionReport.studentDetails.map((d: any) => [
      grade,
      section,
      reportYear,
      reportMonth,
      idMap.get(d.studentId as number) || String(d.studentId),
      d.studentName,
      d.presentDays,
      d.absentDays,
      d.lateDays,
      d.attendancePercentage.toFixed(1)
    ]);
    downloadCSV(`section-attendance-${grade}${section}-${reportYear}-${reportMonth}.csv`, headers, rows);
  };

  const downloadStudentDailyCSV = async () => {
    if (!selectedStudentId) return;
    const startStr = `${reportYear}-${String(reportMonth).padStart(2,'0')}-01`;
    const start = dayjs(startStr);
    const dim = start.daysInMonth();
    const recMap: Record<string, Attendance> = {};
    if (studentMonthlyRecords) {
      studentMonthlyRecords.forEach(r => { recMap[r.date] = r; });
    }

    // Fetch holidays in range and compute working days: exclude Sundays and listed holidays
    const endStr = start.endOf('month').format('YYYY-MM-DD');
    let holidays: string[] = [];
    try {
      const hs = await holidayService.getByRange(start.format('YYYY-MM-DD'), endStr);
      holidays = hs.map(h => h.date);
    } catch (_) {
      // if holiday fetch fails, proceed without subtracting
    }

    const isSunday = (d: dayjs.Dayjs) => d.day() === 0;
    let workingDays = 0;
    for (let d = 1; d <= dim; d++) {
      const date = start.date(d);
      const iso = date.format('YYYY-MM-DD');
      if (!isSunday(date) && !holidays.includes(iso)) workingDays++;
    }

    // Build summary from records, but base Total Days on working days
    const presentDays = studentMonthlyRecords ? studentMonthlyRecords.filter(r => r.status === 'PRESENT').length : (studentSummary ? studentSummary.presentDays : 0);
    const absentDays = studentMonthlyRecords ? studentMonthlyRecords.filter(r => r.status === 'ABSENT').length : (studentSummary ? studentSummary.absentDays : 0);
    const lateDays = studentMonthlyRecords ? studentMonthlyRecords.filter(r => r.status === 'LATE').length : (studentSummary ? studentSummary.lateDays : 0);
    const totalDays = workingDays;
    const percent = totalDays > 0 ? ((presentDays * 100) / totalDays) : 0;

    const selectedStudent = students.find(s => s.id === selectedStudentId);

    const lines: (string | number)[][] = [];
    // Summary header
    lines.push(['StudentId','Student Name','Grade','Section','Year','Month']);
    lines.push([
      selectedStudent ? selectedStudent.studentId : '',
      selectedStudent ? selectedStudent.name : '',
      grade,
      section,
      reportYear,
      reportMonth
    ]);
    lines.push(['Total Days','Present','Absent','Late','Percent']);
    lines.push([totalDays, presentDays, absentDays, lateDays, percent.toFixed(1)]);
    // Spacer
    lines.push([]);
    // Daily table: Date, Present, Absent (only for working days)
    lines.push(['Date','Present','Absent']);
    for (let d = 1; d <= dim; d++) {
      const dateStr = start.date(d).format('YYYY-MM-DD');
      const dateObj = start.date(d);
      if (isSunday(dateObj) || holidays.includes(dateStr)) {
        continue; // skip non-working days
      }
      const rec = recMap[dateStr];
      const present = rec?.status === 'PRESENT' ? 1 : 0;
      const absent = rec?.status === 'ABSENT' ? 1 : 0;
      lines.push([dateStr, present, absent]);
    }

  const header = lines[0].map(v => String(v));
  const dataRows = lines.slice(1);
  downloadCSV(`student-daily-${selectedStudentId}-${reportYear}-${reportMonth}.csv`, header, dataRows);
  };

  const onToggleEdit = (studentNumericId: number) => {
    const current = attnMap[studentNumericId];
    setEdit(prev => ({ ...prev, [studentNumericId]: !prev[studentNumericId] }));
    if (!edit[studentNumericId]) {
      setDraft(prev => ({ ...prev, [studentNumericId]: current ? { ...current } : { date: date.format('YYYY-MM-DD'), status: 'PRESENT' } }));
    }
  };

  const onChangeDraft = (studentNumericId: number, field: keyof Attendance, value: any) => {
    setDraft(prev => ({ ...prev, [studentNumericId]: { ...prev[studentNumericId], [field]: value } }));
  };

  const saveOne = async (studentNumericId: number, studentExternalId: string) => {
    try {
      const d = draft[studentNumericId];
      if (!d) return;
      if (attnMap[studentNumericId]?.id) {
        // update
        const updated = await attendanceService.updateAttendance(attnMap[studentNumericId].id!, d as any);
        setAttnMap(prev => ({ ...prev, [studentNumericId]: updated as any }));
      } else {
        // create via params API
        await attendanceService.markStudentAttendanceParams(studentNumericId, {
          date: (d.date as string) || date.format('YYYY-MM-DD'),
          status: (d.status as Status) || 'PRESENT',
          remarks: d.remarks as string | undefined,
        });
        // refresh single
        const fresh = await attendanceService.getSectionAttendance(grade, section, date.format('YYYY-MM-DD'));
        const map: Record<number, any> = {};
        fresh.forEach((a: any) => { map[a.studentId] = a; });
        setAttnMap(map);
      }
      setEdit(prev => ({ ...prev, [studentNumericId]: false }));
      showNotification('Saved', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Failed to save attendance', 'error');
    }
  };

  const markAllPresent = async () => {
    try {
      await attendanceService.markClassDefault(parseInt(grade, 10), section, {
        date: date.format('YYYY-MM-DD'),
        defaultStatus: 'PRESENT',
      });
      const fresh = await attendanceService.getSectionAttendance(grade, section, date.format('YYYY-MM-DD'));
      const map: Record<string, any> = {};
      fresh.forEach((a: any) => { map[a.studentId] = a; });
      setAttnMap(map);
      showNotification('Marked all present', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Failed to mark all', 'error');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" component="h1">{isStudent ? 'My Attendance' : 'Student Attendance'}</Typography>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mt: 2 }}>
          <Tab label={isStudent ? 'Overview' : 'Daily'} />
          <Tab label="Reports" onClick={() => { if (!sectionReport) loadReports(); }} />
        </Tabs>
        <Divider sx={{ mb: 2 }} />
        {activeTab === 0 && !isStudent && (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2, mb: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              value={date}
              onChange={(d) => d && setDate(d as Dayjs)}
              sx={{ width: 200 }}
            />
          </LocalizationProvider>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="grade-label">Grade</InputLabel>
            <Select labelId="grade-label" value={grade} label="Grade" onChange={(e: SelectChangeEvent) => setGrade(e.target.value)}>
              {gradeOptions.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="section-label">Section</InputLabel>
            <Select labelId="section-label" value={section} label="Section" onChange={(e: SelectChangeEvent) => setSection(e.target.value)}>
              {sectionOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>

          {!isStudent && <Button variant="outlined" onClick={markAllPresent}>Mark All Present</Button>}
        </Box>
        )}

        {activeTab === 0 && !isStudent && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Student ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map(s => {
                const numericId = s.id!; // ensured by backend mapping
                const rec = attnMap[numericId];
                const editing = !!edit[numericId];
                return (
                  <TableRow key={s.studentId}>
                    <TableCell>{s.studentId}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>
                      {editing ? (
                        <FormControl fullWidth size="small">
                          <Select
                            value={(draft[numericId]?.status as any) || rec?.status || ''}
                            onChange={(e) => onChangeDraft(numericId, 'status', e.target.value as Status)}
                          >
                            {(['PRESENT','ABSENT','LATE','EXCUSED'] as Status[]).map(st => (
                              <MenuItem key={st} value={st}>{st}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <Chip icon={statusIcon(rec?.status)} label={rec?.status || 'Not Marked'} color={statusColor(rec?.status)} size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <TextField size="small" fullWidth value={draft[numericId]?.remarks || rec?.remarks || ''} onChange={(e) => onChangeDraft(numericId, 'remarks', e.target.value)} />
                      ) : (
                        rec?.remarks || '-'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editing ? (
                        <Tooltip title="Save">
                          <Button size="small" variant="contained" startIcon={<Save />} onClick={() => saveOne(numericId, s.studentId)}>Save</Button>
                        </Tooltip>
                      ) : (
                        <Tooltip title={rec ? 'Edit' : 'Mark'}>
                          <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => onToggleEdit(numericId)}>
                            {rec ? 'Edit' : 'Mark'}
                          </Button>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        )}

        {activeTab === 0 && isStudent && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>Date: {date.format('YYYY-MM-DD')}</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students[0] && (
                    <TableRow>
                      <TableCell>
                        <Chip icon={statusIcon(attnMap[students[0].id!]?.status)} label={attnMap[students[0].id!]?.status || 'Not Marked'} color={statusColor(attnMap[students[0].id!]?.status)} size="small" />
                      </TableCell>
                      <TableCell>{attnMap[students[0].id!]?.remarks || '-'}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="grade-label-r">Grade</InputLabel>
                    <Select labelId="grade-label-r" value={grade} label="Grade" onChange={(e: SelectChangeEvent) => setGrade(e.target.value)}>
                      {gradeOptions.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="section-label-r">Section</InputLabel>
                    <Select labelId="section-label-r" value={section} label="Section" onChange={(e: SelectChangeEvent) => setSection(e.target.value)}>
                      {sectionOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item>
                  <TextField
                    size="small"
                    label="Month (1-12)"
                    type="number"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(Math.max(1, Math.min(12, Number(e.target.value))))}
                    sx={{ width: 140 }}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    size="small"
                    label="Year"
                    type="number"
                    value={reportYear}
                    onChange={(e) => setReportYear(Number(e.target.value))}
                    sx={{ width: 120 }}
                  />
                </Grid>
                <Grid item>
                  <Button variant="contained" onClick={loadReports}>Load Reports</Button>
                </Grid>
              </Grid>
            </Paper>
            {/* Reports sub-tabs */}
            <Paper variant="outlined" sx={{ px: 2 }}>
              <Tabs value={reportTab} onChange={(_, v) => setReportTab(v)}>
                {!isStudent && <Tab label="Section Report" />}
                <Tab label={isStudent ? 'My Report' : 'Student Report'} />
              </Tabs>
            </Paper>

            {reportTab === 0 && !isStudent && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader
                      title="Section Monthly Report"
                      subheader={sectionReport ? `Average: ${sectionReport.averageAttendancePercentage.toFixed(1)}%` : 'Run a report to view details'}
                      action={sectionReport ? (
                        <Button size="small" variant="outlined" onClick={downloadSectionCSV}>Download CSV</Button>
                      ) : null}
                    />
                    <CardContent>
                      {sectionReport ? (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Student</TableCell>
                                <TableCell align="right">Present</TableCell>
                                <TableCell align="right">Absent</TableCell>
                                <TableCell align="right">Late</TableCell>
                                <TableCell align="right">%</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sectionReport.studentDetails.map((d: any) => (
                                <TableRow key={d.studentId} hover>
                                  <TableCell>{d.studentName}</TableCell>
                                  <TableCell align="right">{d.presentDays}</TableCell>
                                  <TableCell align="right">{d.absentDays}</TableCell>
                                  <TableCell align="right">{d.lateDays}</TableCell>
                                  <TableCell align="right">{d.attendancePercentage.toFixed(1)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No data yet. Choose Grade/Section/Month and click "Load Reports".</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="Monthly Stats" />
                    <CardContent>
                      {monthlyStats ? (
                        <Stack spacing={1.5}>
                          <Typography>Total Students: {monthlyStats.totalStudents}</Typography>
                          <Box>
                            <Typography sx={{ mb: 0.5 }}>Average Attendance: {monthlyStats.averageAttendance}%</Typography>
                            <LinearProgress variant="determinate" value={Math.min(100, Math.max(0, Number(monthlyStats.averageAttendance)))} />
                          </Box>
                          <Box>
                            <Typography sx={{ mb: 0.5 }}>100%</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {monthlyStats.studentsWith100Percent.length ? monthlyStats.studentsWith100Percent.map((n: string) => (
                                <Chip key={n} label={n} size="small" />
                              )) : <Typography variant="body2" color="text.secondary">None</Typography>}
                            </Stack>
                          </Box>
                          <Box>
                            <Typography sx={{ mb: 0.5 }}>Below 75%</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {monthlyStats.studentsBelow75Percent.length ? monthlyStats.studentsBelow75Percent.map((n: string) => (
                                <Chip key={n} label={n} color="warning" size="small" />
                              )) : <Typography variant="body2" color="text.secondary">None</Typography>}
                            </Stack>
                          </Box>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Stats will appear after loading a report.</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {((!isStudent && reportTab === 1) || (isStudent && reportTab === 0)) && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader
                      title={isStudent ? 'My Monthly Report' : 'Student Report'}
                      action={studentSummary && selectedStudentId ? (
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="outlined" onClick={downloadStudentDailyCSV}>Download Daily CSV</Button>
                        </Stack>
                      ) : null}
                    />
                    <CardContent>
                      <Stack spacing={1.5}>
                        {!isStudent && (
                          <FormControl size="small" sx={{ minWidth: 240 }}>
                            <InputLabel id="student-select">Student</InputLabel>
                            <Select
                              labelId="student-select"
                              value={selectedStudentId === '' ? '' : selectedStudentId}
                              label="Student"
                              onChange={async (e) => {
                                const val = e.target.value as number | '';
                                setSelectedStudentId(val);
                                const start = dayjs(`${reportYear}-${String(reportMonth).padStart(2,'0')}-01`).format('YYYY-MM-DD');
                                const end = dayjs(start).endOf('month').format('YYYY-MM-DD');
                                if (val && typeof val === 'number') {
                                  try {
                                    const [sum, recs] = await Promise.all([
                                      attendanceService.getStudentAttendanceSummary(val, start, end),
                                      attendanceService.getStudentAttendanceByDateRange(String(val), start, end)
                                    ]);
                                    setStudentSummary(sum);
                                    setStudentMonthlyRecords(recs);
                                  } catch (err: any) {
                                    showNotification(err.message || 'Failed to load student report', 'error');
                                  }
                                } else {
                                  setStudentSummary(null);
                                  setStudentMonthlyRecords(null);
                                }
                              }}
                            >
                              {students.map(st => (
                                <MenuItem key={st.id} value={st.id!}>{st.name} ({st.studentId})</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}

                        {studentSummary ? (
                          <Box>
                            <Typography variant="body2">Present: {studentSummary.presentDays} | Absent: {studentSummary.absentDays} | Late: {studentSummary.lateDays}</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>Attendance: {studentSummary.attendancePercentage.toFixed(1)}%</Typography>
                            <LinearProgress sx={{ mt: 0.5 }} variant="determinate" value={Math.min(100, Math.max(0, Number(studentSummary.attendancePercentage)))} />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Select a student to view their monthly summary.</Typography>
                        )}

                        {studentMonthlyRecords ? (
                          <>
                            <TableContainer component={Paper} variant="outlined" sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                              <Table size="small" stickyHeader>
                                <TableHead>
                                  <TableRow>
                                    {Array.from({ length: dayjs(`${reportYear}-${String(reportMonth).padStart(2,'0')}-01`).daysInMonth() }, (_, i) => i + 1).map(day => (
                                      <TableCell key={day} align="center">{day}</TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    {(() => {
                                      const start = dayjs(`${reportYear}-${String(reportMonth).padStart(2,'0')}-01`);
                                      const dim = start.daysInMonth();
                                      const byDay: Record<number, Attendance['status']> = {} as any;
                                      studentMonthlyRecords.forEach(r => { const d = dayjs(r.date).date(); byDay[d] = r.status; });
                                      const short = (s?: Attendance['status']) => s === 'PRESENT' ? 'P' : s === 'ABSENT' ? 'A' : s === 'LATE' ? 'L' : s === 'EXCUSED' ? 'E' : '';
                                      return Array.from({ length: dim }, (_, i) => i + 1).map(d => (
                                        <TableCell key={d} align="center">
                                          {byDay[d] ? (
                                            <Chip size="small" label={short(byDay[d])} color={statusColor(byDay[d]) as any} />
                                          ) : (
                                            <Typography variant="caption" color="text.disabled">-</Typography>
                                          )}
                                        </TableCell>
                                      ));
                                    })()}
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                              Legend: <Chip size="small" label="P" color="success" sx={{ mr: 1 }} /> Present
                              <Chip size="small" label="A" color="error" sx={{ mx: 1 }} /> Absent
                              <Chip size="small" label="L" color="warning" sx={{ mx: 1 }} /> Late
                              <Chip size="small" label="E" color="info" sx={{ mx: 1 }} /> Excused
                            </Typography>
                          </>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        )}

        
      </Paper>
    </Box>
  );
};

export default StudentAttendance;
