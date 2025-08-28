import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, TextField, Chip, LinearProgress, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import dayjs from 'dayjs';
import { Attendance, attendanceService } from '../../services/attendanceService';
import { Student } from '../../services/studentService';
import { holidayService } from '../../services/holidayService';

type Props = {
  open: boolean;
  onClose: () => void;
  student: Student | null;
};

const statusColor = (status?: Attendance['status']) => {
  const map: Record<string, any> = {
    PRESENT: 'success',
    ABSENT: 'error',
    LATE: 'warning',
    EXCUSED: 'info',
  };
  return status ? map[status] || 'default' : 'default';
};

const short = (s?: Attendance['status']) => s === 'PRESENT' ? 'P' : s === 'ABSENT' ? 'A' : s === 'LATE' ? 'L' : s === 'EXCUSED' ? 'E' : '';

const StudentAttendanceDialog: React.FC<Props> = ({ open, onClose, student }) => {
  const now = dayjs();
  const [month, setMonth] = useState<number>(now.month() + 1);
  const [year, setYear] = useState<number>(now.year());
  const [summary, setSummary] = useState<any | null>(null);
  const [records, setRecords] = useState<Attendance[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEnd = useMemo(() => {
    const start = dayjs(`${year}-${String(month).padStart(2,'0')}-01`).format('YYYY-MM-DD');
    const end = dayjs(start).endOf('month').format('YYYY-MM-DD');
    return { start, end };
  }, [month, year]);

  const load = async () => {
    if (!student?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [sum, recs] = await Promise.all([
        attendanceService.getStudentAttendanceSummary(student.id, startEnd.start, startEnd.end),
        attendanceService.getStudentAttendanceByDateRange(String(student.id), startEnd.start, startEnd.end)
      ]);
      setSummary(sum);
      setRecords(recs);
    } catch (e: any) {
      setError(e?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, month, year, student?.id]);

  const daysInMonth = dayjs(`${year}-${String(month).padStart(2,'0')}-01`).daysInMonth();
  const byDay: Record<number, Attendance['status']> = {} as any;
  (records || []).forEach(r => { const d = dayjs(r.date).date(); byDay[d] = r.status; });

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

  const handleDownloadCSV = async () => {
    if (!student?.id) return;
    const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const start = dayjs(startStr);
    const dim = start.daysInMonth();
    const recMap: Record<string, Attendance> = {};
    (records || []).forEach(r => { recMap[r.date] = r; });

    const endStr = start.endOf('month').format('YYYY-MM-DD');
    let holidays: string[] = [];
    try {
      const hs = await holidayService.getByRange(start.format('YYYY-MM-DD'), endStr);
      holidays = hs.map(h => h.date);
    } catch (_) {
      // ignore holiday load error, proceed without
    }
    const isSunday = (d: dayjs.Dayjs) => d.day() === 0;
    let workingDays = 0;
    for (let d = 1; d <= dim; d++) {
      const date = start.date(d);
      const iso = date.format('YYYY-MM-DD');
      if (!isSunday(date) && !holidays.includes(iso)) workingDays++;
    }

    const presentDays = (records || []).filter(r => r.status === 'PRESENT').length;
    const absentDays = (records || []).filter(r => r.status === 'ABSENT').length;
    const lateDays = (records || []).filter(r => r.status === 'LATE').length;
    const percent = workingDays > 0 ? ((presentDays * 100) / workingDays) : 0;

    const lines: (string | number)[][] = [];
    lines.push(['StudentId','Student Name','Grade','Section','Year','Month']);
    lines.push([
      student.studentId || '',
      student.name || '',
      student.grade || '',
      student.section || '',
      year,
      month
    ]);
    lines.push(['Total Days','Present','Absent','Late','Percent']);
    lines.push([workingDays, presentDays, absentDays, lateDays, percent.toFixed(1)]);
    lines.push([]);
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
    downloadCSV(`student-daily-${student.id}-${year}-${month}.csv`, header, dataRows);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { overflow: 'visible' } }}>
      <DialogTitle>Attendance - {student ? `${student.name} (${student.studentId})` : ''}</DialogTitle>
      <DialogContent sx={{ overflow: 'visible' }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" rowGap={2}>
          <TextField
            select
            size="small"
            label="Month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            variant="outlined"
            InputLabelProps={{ shrink: true, sx: { overflow: 'visible', whiteSpace: 'nowrap', zIndex: 1 } }}
            sx={{ minWidth: 200, '& .MuiOutlinedInput-notchedOutline legend': { width: 'auto' } }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            variant="outlined"
            InputLabelProps={{ shrink: true, sx: { overflow: 'visible', whiteSpace: 'nowrap', zIndex: 1 } }}
            sx={{ minWidth: 180, '& .MuiOutlinedInput-notchedOutline legend': { width: 'auto' } }}
          >
            {Array.from({ length: 9 }, (_, i) => now.year() - 4 + i).map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={load}>Refresh</Button>
          <Button variant="text" onClick={handleDownloadCSV} disabled={!student?.id}>Download CSV</Button>
        </Stack>

        {loading && <LinearProgress />}
        {error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}

        {summary && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">Present: {summary.presentDays} | Absent: {summary.absentDays} | Late: {summary.lateDays}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>Attendance: {Number(summary.attendancePercentage || 0).toFixed(1)}%</Typography>
            <LinearProgress sx={{ mt: 0.5 }} variant="determinate" value={Math.min(100, Math.max(0, Number(summary.attendancePercentage || 0)))} />
          </Box>
        )}

        <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Box component="table" sx={{ borderCollapse: 'collapse', width: 'max-content' }}>
            <Box component="thead">
              <Box component="tr">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                  <Box key={d} component="th" sx={{ px: 1, py: 0.5, textAlign: 'center' }}>{d}</Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              <Box component="tr">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                  <Box key={d} component="td" sx={{ px: 1, py: 0.5, textAlign: 'center' }}>
                    {byDay[d] ? (
                      <Chip size="small" label={short(byDay[d])} color={statusColor(byDay[d]) as any} />
                    ) : (
                      <Typography variant="caption" color="text.disabled">-</Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Legend: <Chip size="small" label="P" color="success" sx={{ mx: 0.5 }} /> Present
            <Chip size="small" label="A" color="error" sx={{ mx: 0.5 }} /> Absent
            <Chip size="small" label="L" color="warning" sx={{ mx: 0.5 }} /> Late
            <Chip size="small" label="E" color="info" sx={{ mx: 0.5 }} /> Excused
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentAttendanceDialog;
