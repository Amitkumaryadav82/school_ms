import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Grid, FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress, Snackbar, Alert, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../services/api';
import { Student } from '../../services/studentService';

type Exam = { id: number; name: string; startDate?: string };
type ClassItem = { id: number; name: string };
type MatrixSubject = { subjectId: number; subjectName: string; totalMaxMarks: number };
type MatrixCell = { subjectId: number; theoryMarks?: number; practicalMarks?: number; absent?: boolean };
type MatrixRow = { studentId: number; studentName: string; rollNumber: string; cells: MatrixCell[] };
type MarksMatrixResponse = { subjects: MatrixSubject[]; students: MatrixRow[] };

type Props = {
  open: boolean;
  onClose: () => void;
  student: Student | null;
};

const StudentAcademicDialog: React.FC<Props> = ({ open, onClose, student }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [year, setYear] = useState<string>('');
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [examMenuOpen, setExamMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [report, setReport] = useState<{
    student?: { id: number; name: string; roll?: string };
    exams: Record<number, { examName: string; subjects: MatrixSubject[]; cells: Record<number, MatrixCell> }>;
  } | null>(null);

  const printableRef = useRef<HTMLDivElement>(null);

  // Load exams/classes when dialog opens
  useEffect(() => {
    if (!open) return;
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const ex = await api.get<Exam[]>('/api/exams');
        const cls = await api.get<ClassItem[]>('/api/exam-configs/classes');
        setExams(ex);
        setClasses(cls);
      } catch (e: any) {
        setError(e.message || 'Failed to load exams/classes');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [open]);

  // Derive years from exams
  const years = useMemo(() => {
    const setY = new Set<string>();
    (exams || []).forEach(e => {
      const y = e.startDate ? new Date(e.startDate).getFullYear().toString() : '';
      if (y) setY.add(y);
    });
    const arr = Array.from(setY).sort((a, b) => Number(b) - Number(a));
    // default to latest year
    if (!year && arr.length) setYear(arr[0]);
    return arr;
  }, [exams]);

  // Exams for the chosen year
  const yearExams = useMemo(() => {
    if (!year) return [] as Exam[];
    return (exams || []).filter(e => e.startDate && new Date(e.startDate).getFullYear().toString() === year);
  }, [year, exams]);

  const templateStyles = (
    <style>{`
      @media print { .no-print{ display:none !important; } .card { page-break-after: always; } }
      .card { border:1px solid #ddd; border-radius:8px; margin: 8px 0; padding: 16px; background:#fff; }
      .card h2 { margin: 4px 0; font-size: 20px; }
      .meta { color:#555; margin-bottom: 8px; }
      table.rc { width:100%; border-collapse: collapse; }
      table.rc th, table.rc td { border: 1px solid #bbb; padding: 6px; font-size: 13px; }
      table.rc th { background: #f6f7fb; }
      .totals { margin-top: 8px; font-weight: 600; }
      .school-title { font-weight: 700; font-size: 20px; color: #2a4d8f; }
      .header-line { height: 3px; background: linear-gradient(90deg,#2a4d8f,#4b79cf); margin: 6px 0 12px; }
    `}</style>
  );

  const handleGenerate = async () => {
    if (!student?.id) { setError('Missing student'); return; }
    if (!year || selectedExamIds.length === 0) { setError('Please select year and exam(s).'); return; }

    // Map student grade/section to backend inputs
    const gradeMatch = String(student.grade || '').match(/\d+/);
    const gradeNumber = gradeMatch ? parseInt(gradeMatch[0], 10) : Number(student.grade) || undefined;
    const sectionName = String(student.section || '').trim();
    const classId = classes.find(c => (c.name || '').match(/\d+/)?.[0] === String(gradeNumber))?.id || classes[0]?.id;
    if (!gradeNumber || !sectionName || !classId) { setError('Unable to resolve class/section for this student'); return; }

    try {
      setLoading(true);
      const data: { student?: { id: number; name: string; roll?: string }; exams: Record<number, { examName: string; subjects: MatrixSubject[]; cells: Record<number, MatrixCell> }> } = { exams: {} };
      for (const examId of selectedExamIds) {
        const resp = await api.get<MarksMatrixResponse>('/api/exams/marks/matrix', {
          examId, classId, grade: gradeNumber, section: sectionName,
        });
        const examName = (exams.find(e => e.id === examId)?.name) || `Exam ${examId}`;
        // find this student in matrix
        const row = (resp.students || []).find(r => Number(r.studentId) === Number(student.id));
        if (row && !data.student) {
          data.student = { id: Number(row.studentId), name: row.studentName, roll: row.rollNumber };
        }
        // build subjects/cells map; even if no row yet, keep subjects for layout
        const cellMap: Record<number, MatrixCell> = {};
        if (row) (row.cells || []).forEach(c => { cellMap[c.subjectId] = c; });
        data.exams[examId] = { examName, subjects: resp.subjects || [], cells: cellMap };
      }
      if (!data.student) {
        // fallback to provided student info
        data.student = { id: student.id, name: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(), roll: student.studentId } as any;
      }
      setReport(data);
      setTimeout(() => printableRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to generate academic record');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleDownloadCsv = () => {
    if (!report) return;
    const header = ['Student', 'Roll', 'Exam', 'Subject', 'Theory', 'Practical', 'Total', 'Max Total'];
    const lines: string[] = [header.join(',')];
    const studentName = report.student?.name || '';
    const roll = report.student?.roll || '';
    Object.entries(report.exams).forEach(([_, info]) => {
      info.subjects.forEach(s => {
        const cell = info.cells[s.subjectId] || { theoryMarks: 0, practicalMarks: 0 };
        const th = cell.theoryMarks || 0; const pr = cell.practicalMarks || 0;
        lines.push([studentName, roll, info.examName, s.subjectName, String(th), String(pr), String(th + pr), String(s.totalMaxMarks || '')].join(','));
      });
    });
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Academic_${year}_${student?.studentId || student?.id}.csv`; a.style.display = 'none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const renderCard = (entry: { student: { id: number; name: string; roll?: string }; exams: Record<number, { examName: string; subjects: MatrixSubject[]; cells: Record<number, MatrixCell> }> }) => {
    const { student: st, exams } = entry;
    return (
      <div className="card">
        <div className="school-title">School Management System</div>
        <div className="header-line" />
        <h2>Report Card - AY {year}</h2>
        <div className="meta"><strong>Student:</strong> {st.name} &nbsp; | &nbsp; <strong>Roll:</strong> {st.roll || '-'}</div>
        {Object.entries(exams).map(([exId, info]) => {
          let examTotal = 0; let examMax = 0;
          return (
            <Box key={exId} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 0.5 }}>{info.examName}</Typography>
              <table className="rc">
                <thead>
                  <tr><th>Subject</th><th>Th</th><th>Pr</th><th>Total</th><th>Max</th></tr>
                </thead>
                <tbody>
                  {info.subjects.map(s => {
                    const cell = info.cells[s.subjectId] || { theoryMarks: 0, practicalMarks: 0 };
                    const th = cell.theoryMarks || 0; const pr = cell.practicalMarks || 0; const tot = th + pr; const mx = s.totalMaxMarks || 0;
                    examTotal += tot; examMax += mx;
                    return <tr key={s.subjectId}><td>{s.subjectName}</td><td style={{textAlign:'center'}}>{th}</td><td style={{textAlign:'center'}}>{pr}</td><td style={{textAlign:'center'}}>{tot}</td><td style={{textAlign:'center'}}>{mx}</td></tr>;
                  })}
                </tbody>
              </table>
              <div className="totals">Total: {examTotal} / {examMax} &nbsp; | &nbsp; Percentage: {examMax>0?((examTotal*100/examMax).toFixed(2)+'%'):'-'}</div>
            </Box>
          );
        })}
      </div>
    );
  };

  const studentDisplayName = student?.name || `${student?.firstName || ''} ${student?.lastName || ''}`.trim();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Academic Records - {studentDisplayName} {student?.studentId ? `(${student.studentId})` : ''}</DialogTitle>
      <DialogContent>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>{error}</Alert>
        </Snackbar>

        <Box className="no-print" sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Year</InputLabel>
                <Select value={year} label="Year" onChange={(e) => { setYear(e.target.value); setSelectedExamIds([]); }}>
                  {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8} md={6}>
              <FormControl fullWidth size="small" disabled={!year}>
                <InputLabel>Exams</InputLabel>
                <Select
                  multiple
                  open={examMenuOpen}
                  onOpen={() => setExamMenuOpen(true)}
                  onClose={() => setExamMenuOpen(false)}
                  value={selectedExamIds as any}
                  label="Exams"
                  onChange={(e) => setSelectedExamIds(e.target.value as any)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map(id => <Chip key={id} size="small" label={(yearExams.find(e => e.id === id)?.name) || id} />)}
                    </Box>
                  )}
                >
                  {yearExams.map(ex => (
                    <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={'auto' as any}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" size="small" onClick={handleGenerate} disabled={loading || !student}> {loading ? <CircularProgress size={18} /> : 'Generate'} </Button>
                <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleDownloadCsv} disabled={!report}>CSV</Button>
                <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={handlePrint} disabled={!report}>Print</Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {templateStyles}
        <div ref={printableRef}>
          {report ? (
            renderCard({ student: report.student as any, exams: report.exams })
          ) : (
            <Typography color="text.secondary">Select options and click Generate to view the academic record.</Typography>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentAcademicDialog;
