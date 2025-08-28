import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Stack, TextField, MenuItem, Autocomplete, InputAdornment, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Loading from '../../components/Loading';
import PaymentHistory from '../../components/PaymentHistory';
import { Student, studentService } from '../../services/studentService';
import feeService from '../../services/feeService';
import { Payment } from '../../types/payment.types';

type Props = {
  open: boolean;
  onClose: () => void;
  student: Student | null;
};

const CONTROL_WIDTH = 160;
const monthOptions = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

const StudentFeeReportsDialog: React.FC<Props> = ({ open, onClose, student }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportPayments, setReportPayments] = useState<Payment[]>([]);

  const [reportsGrade, setReportsGrade] = useState<string>('');
  const [reportsSection, setReportsSection] = useState<string>('');
  const [reportsMonth, setReportsMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [reportsYear, setReportsYear] = useState<string>(String(new Date().getFullYear()));
  const [reportsStudent, setReportsStudent] = useState<Student | null>(null);

  // Load all students when opened
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        const all = await studentService.getAll();
        if (!mounted) return;
        setStudents(all || []);
      } catch (_) {
        setStudents([]);
      }
    })();
    return () => { mounted = false; };
  }, [open]);

  // Default the filters to the provided student when dialog opens
  useEffect(() => {
    if (open && student) {
      setReportsStudent(student as any);
      if (student.grade != null) setReportsGrade(String(student.grade));
      if ((student as any).section) setReportsSection((student as any).section);
    }
  }, [open, student]);

  const reportClassOptions = useMemo(() => {
    const set = new Set<string>();
    (students || []).forEach(s => { if (s.grade != null) set.add(String(s.grade)); });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [students]);

  const reportSectionOptions = useMemo(() => {
    const set = new Set<string>();
    (students || [])
      .filter(s => (reportsGrade ? String(s.grade) === String(reportsGrade) : true))
      .forEach(s => { if ((s as any).section) set.add((s as any).section); });
    return Array.from(set).sort();
  }, [students, reportsGrade]);

  const reportFilteredStudents = useMemo(() => {
    return (students || []).filter(s =>
      (reportsGrade ? String(s.grade) === String(reportsGrade) : true) &&
      (reportsSection ? (s as any).section === reportsSection : true)
    );
  }, [students, reportsGrade, reportsSection]);

  // Helper CSV export when server export not used
  const exportPaymentsToCsv = (rows: Payment[], filename: string) => {
    const escape = (v: any) => {
      const s = v === null || v === undefined ? '' : String(v);
      const needsQuote = /[",\n]/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuote ? `"${escaped}"` : escaped;
    };
    const headers = [
      'Receipt Number','Payment Date','Student Name','Student ID','Grade','Section','Amount','Method','Status'
    ];
    const lines = rows.map(r => [
      r.receiptNumber || '',
      r.paymentDate ? new Date(r.paymentDate).toISOString().slice(0,10) : '',
      (r as any).studentName || (r as any).student?.name || '',
      r.studentId || (r as any).student?.id || '',
      (r as any).studentGrade || (r as any).grade || '',
      (r as any).studentSection || (r as any).section || '',
      (r.amountPaid ?? r.amount ?? 0),
      r.paymentMethod || '',
      r.paymentStatus || ''
    ].map(escape).join(','));
    const csv = [headers.map(escape).join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.setAttribute('download', filename); document.body.appendChild(link); link.click(); link.remove();
  };

  // Load payments for current filters
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        setLoading(true);
        let base: Payment[] = [];
        if (reportsStudent?.id) {
          base = await feeService.getPaymentsByStudentId(Number(reportsStudent.id));
        } else if (reportsGrade) {
          base = await feeService.getFilteredPayments({ grade: reportsGrade, section: reportsSection || undefined });
        } else {
          base = await feeService.getAllPayments();
        }

        // Enrich with student details
        const enriched = base.map(p => {
          const s = (students || []).find(st => Number((st as any).id ?? (st as any).studentId) === Number(p.studentId));
          return {
            ...p,
            studentName: (p as any).studentName || (p as any)?.student?.name || (s ? (s as any).name : ''),
            studentGrade: (p as any).studentGrade || (p as any)?.grade || (s && (s as any).grade ? String((s as any).grade) : ''),
            studentSection: (p as any).studentSection || (p as any)?.section || ((s as any)?.section || ''),
          } as Payment;
        });

        // Client-side month/year filter
        const m = reportsMonth ? parseInt(reportsMonth, 10) : undefined;
        const y = reportsYear ? parseInt(reportsYear, 10) : undefined;
        const filtered = enriched.filter(p => {
          if (!m && !y) return true;
          const dt = p.paymentDate ? new Date(p.paymentDate) : null;
          if (!dt || isNaN(dt.getTime())) return false;
          const monthOk = m ? (dt.getMonth() + 1) === m : true;
          const yearOk = y ? dt.getFullYear() === y : true;
          return monthOk && yearOk;
        });
        setReportPayments(filtered);
      } catch (e) {
        setReportPayments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, reportsGrade, reportsSection, reportsStudent?.id, reportsMonth, reportsYear, students]);

  const handleDownloadCsv = async () => {
    try {
      if (reportsStudent?.id) {
        await feeService.downloadStudentReportCsv({
          studentId: Number(reportsStudent.id),
          month: reportsMonth ? Number(reportsMonth) : undefined,
          year: reportsYear ? Number(reportsYear) : undefined,
        });
        return;
      }
      if (reportsGrade) {
        await feeService.downloadClassSectionReportCsv({
          grade: Number(reportsGrade),
          section: reportsSection || undefined,
          month: reportsMonth ? Number(reportsMonth) : undefined,
          year: reportsYear ? Number(reportsYear) : undefined,
        });
        return;
      }
      const y = reportsYear || String(new Date().getFullYear());
      const m = reportsMonth ? (monthOptions.find(x => x.value === reportsMonth)?.label || reportsMonth) : 'ALL';
      exportPaymentsToCsv(reportPayments, `Report-${m}-${y}.csv`);
    } catch (_) {
      // no-op; the service already handles download errors in UI elsewhere
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Fee Payments - {student?.name} {student?.studentId ? `(${student.studentId})` : ''}</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'nowrap', columnGap: 1, overflowX: 'auto', overflowY: 'visible', minHeight: 64, mb: 1 }}>
          <TextField select label="Class" size="small" value={reportsGrade}
            onChange={(e) => { setReportsGrade(e.target.value); setReportsSection(''); }}
            sx={{ width: CONTROL_WIDTH, minWidth: CONTROL_WIDTH }}>
            <MenuItem value="">Select</MenuItem>
            {reportClassOptions.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </TextField>
          <TextField select label="Section (optional)" size="small" value={reportsSection}
            onChange={(e) => setReportsSection(e.target.value)} disabled={!reportsGrade}
            sx={{ width: CONTROL_WIDTH, minWidth: CONTROL_WIDTH }}>
            <MenuItem value="">All</MenuItem>
            {reportSectionOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <Autocomplete
            size="small"
            sx={{ width: CONTROL_WIDTH, minWidth: CONTROL_WIDTH }}
            options={reportFilteredStudents}
            getOptionLabel={(option) => `${option.name} (${option.studentId || option.id})`}
            value={reportsStudent}
            onChange={(event, newValue) => setReportsStudent(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Student (optional)" placeholder="Search name/ID" variant="outlined" size="small" />
            )}
          />
          <TextField select label="Month" size="small" value={reportsMonth}
            onChange={(e) => setReportsMonth(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: CONTROL_WIDTH, minWidth: CONTROL_WIDTH }}
            InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon fontSize="small" color="action" /></InputAdornment> }}>
            <MenuItem value="">All</MenuItem>
            {monthOptions.map(m => (<MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>))}
          </TextField>
          <TextField label="Year" type="number" size="small" value={reportsYear}
            onChange={(e) => setReportsYear(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: CONTROL_WIDTH, minWidth: CONTROL_WIDTH }}
            inputProps={{ min: 2000, max: new Date().getFullYear() + 1 }} />
          <Button size="small" variant="contained" startIcon={<CloudDownloadIcon />} onClick={handleDownloadCsv}
            sx={{ whiteSpace: 'nowrap', px: 1, minWidth: CONTROL_WIDTH, width: CONTROL_WIDTH, height: 32 }}>
            Download CSV
          </Button>
        </Stack>

        {loading ? (
          <Loading />
        ) : (
          <PaymentHistory
            payments={reportPayments}
            onViewReceipt={() => {}}
            onDownloadReceipt={() => {}}
            onVoidPayment={undefined as any}
            isAdmin={false}
            showStudentDetails={true}
            showClassSection={false}
          />
        )}
        {(!loading && reportPayments.length === 0) && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No payments match the selected filters.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentFeeReportsDialog;
