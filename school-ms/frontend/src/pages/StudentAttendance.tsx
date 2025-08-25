import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { attendanceService, Attendance } from '../services/attendanceService';
import { Student, studentService } from '../services/studentService';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle, Edit, HighlightOff, Save } from '@mui/icons-material';

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
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [grade, setGrade] = useState<string>('1');
  const [section, setSection] = useState<string>('A');
  const [students, setStudents] = useState<Student[]>([]);
  const [attnMap, setAttnMap] = useState<Record<number, Attendance & { id?: number }>>({});
  const [edit, setEdit] = useState<Record<number, boolean>>({});
  const [draft, setDraft] = useState<Record<number, Partial<Attendance>>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const all = await studentService.getAll();
        const filtered = all.filter(s => s.grade === grade && (s.section || 'A') === section);
        setStudents(filtered);
        // load existing attendance for class & date
        const existing = await attendanceService.getSectionAttendance(grade, section, date.format('YYYY-MM-DD'));
  const map: Record<number, any> = {};
  existing.forEach((a: any) => { map[a.studentId] = a; });
        setAttnMap(map);
      } catch (e: any) {
        showNotification(e.message || 'Failed to load students/attendance', 'error');
      }
    };
    load();
  }, [grade, section, date]);

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
        <Typography variant="h5" component="h1">Student Attendance</Typography>
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

          <Button variant="outlined" onClick={markAllPresent}>Mark All Present</Button>
        </Box>

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
      </Paper>
    </Box>
  );
};

export default StudentAttendance;
