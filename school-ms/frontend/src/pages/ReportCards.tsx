import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, CardContent, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Snackbar, Alert, Typography, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../services/api';

type Exam = { id: number; name: string; startDate?: string };
 type ClassItem = { id: number; name: string };

type MatrixSubject = { subjectId: number; subjectName: string; totalMaxMarks: number };
 type MatrixCell = { subjectId: number; theoryMarks?: number; practicalMarks?: number; absent?: boolean };
 type MatrixRow = { studentId: number; studentName: string; rollNumber: string; cells: MatrixCell[] };
 type MarksMatrixResponse = { subjects: MatrixSubject[]; students: MatrixRow[] };

type Student = { id: number; firstName: string; lastName: string; studentId?: string };
 type SectionItem = { id: number; name: string };

const ReportCards: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [year, setYear] = useState<string>('');
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [mode, setMode] = useState<'SECTION' | 'STUDENT'>('SECTION');
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<Record<number, { student: Student; exams: Record<number, { examName: string; subjects: MatrixSubject[]; cells: Record<number, MatrixCell> }> }>>({});
  const [examMenuOpen, setExamMenuOpen] = useState(false);

  const printableRef = useRef<HTMLDivElement>(null);

  // Load exams and classes
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
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
  }, []);

  // Derive years from exams
  const years = useMemo(() => {
    const set = new Set<string>();
    (exams || []).forEach(e => {
      const y = e.startDate ? new Date(e.startDate).getFullYear().toString() : '';
      if (y) set.add(y);
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [exams]);

  // Filter exams by year for the multiselect
  const yearExams = useMemo(() => {
    if (!year) return [] as Exam[];
    return (exams || []).filter(e => e.startDate && new Date(e.startDate).getFullYear().toString() === year);
  }, [year, exams]);

  // When class changes, load sections
  useEffect(() => {
    const loadSections = async () => {
      if (!selectedClass) { setSections([]); setSelectedSection(0); return; }
      try {
        const sectionsRaw = await api.get<string[]>(`/api/classes/${selectedClass}/sections`);
        setSections((sectionsRaw || []).map((name, i) => ({ id: i + 1, name })));
      } catch (e: any) {
        setError(e.message || 'Failed to load sections');
      }
    };
    loadSections();
  }, [selectedClass]);

  // Load students when section selected
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass || !selectedSection) { setStudents([]); return; }
      const cls = classes.find(c => c.id === selectedClass);
      const gradeMatch = cls?.name?.match(/\d+/);
      const gradeNumber = gradeMatch ? parseInt(gradeMatch[0], 10) : undefined;
      const sectionName = sections.find(s => s.id === selectedSection)?.name;
      if (!gradeNumber || !sectionName) return;
      try {
        const studs = await api.get<Student[]>(`/api/students/grade/${gradeNumber}/section/${encodeURIComponent(sectionName)}`);
        setStudents(studs);
      } catch (e: any) {
        setError(e.message || 'Failed to load students');
      }
    };
    loadStudents();
  }, [selectedClass, selectedSection, classes, sections]);

  const handleExamSelect = (e: SelectChangeEvent<number[]>) => {
    const value = e.target.value as unknown as number[];
    setSelectedExamIds(value);
    // Auto-close after selection so user doesn't have to click elsewhere
    setExamMenuOpen(false);
  };

  // Generate report data using existing matrix endpoint per exam
  const handleGenerate = async () => {
    if (!year || selectedExamIds.length === 0 || !selectedClass || !selectedSection) {
      setError('Please select year, exam(s), class and section.');
      return;
    }
    if (mode === 'STUDENT' && !selectedStudentId) {
      setError('Please select a student.');
      return;
    }
    try {
      setLoading(true);
      const cls = classes.find(c => c.id === selectedClass);
      const gradeMatch = cls?.name?.match(/\d+/);
      const gradeNumber = gradeMatch ? parseInt(gradeMatch[0], 10) : undefined;
      const sectionName = sections.find(s => s.id === selectedSection)?.name;
      if (!gradeNumber || !sectionName) return;

      const data: Record<number, { student: Student; exams: Record<number, { examName: string; subjects: MatrixSubject[]; cells: Record<number, MatrixCell> }> }> = {};
      for (const examId of selectedExamIds) {
        const resp = await api.get<MarksMatrixResponse>('/api/exams/marks/matrix', {
          examId, classId: selectedClass, grade: gradeNumber, section: sectionName,
        });
        const examName = (exams.find(e => e.id === examId)?.name) || `Exam ${examId}`;
        // Map students
        (resp.students || []).forEach(st => {
          const student: Student = { id: st.studentId as any, firstName: st.studentName.split(' ')[0] || st.studentName, lastName: st.studentName.split(' ').slice(1).join(' '), studentId: st.rollNumber };
          if (!data[st.studentId]) data[st.studentId] = { student, exams: {} };
          // Flatten cells for quick lookup
          const cellMap: Record<number, MatrixCell> = {};
          (st.cells || []).forEach(c => { cellMap[c.subjectId] = c; });
          data[st.studentId].exams[examId] = { examName, subjects: resp.subjects || [], cells: cellMap };
        });
      }
      // Filter to single student if in STUDENT mode
      if (mode === 'STUDENT') {
        const only: typeof data = {};
        if (data[selectedStudentId]) {
          only[selectedStudentId] = data[selectedStudentId];
        } else {
          // If the student didn't appear (no marks yet), still create an empty shell for printing
          const st = students.find(s => s.id === selectedStudentId);
          if (st) {
            only[selectedStudentId] = { student: st, exams: {} };
          }
        }
        setReportData(only);
      } else {
        setReportData(data);
      }
      // Scroll to printable
      setTimeout(() => printableRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e: any) {
      setError(e.message || 'Failed to generate report cards');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    // Export a consolidated CSV of all students across selected exams
    const header = ['Student', 'Roll', 'Exam', 'Subject', 'Theory', 'Practical', 'Total', 'Max Total'];
    const lines: string[] = [header.join(',')];
    Object.values(reportData).forEach(({ student, exams }) => {
      Object.entries(exams).forEach(([examId, info]) => {
        info.subjects.forEach(s => {
          const cell = info.cells[s.subjectId] || { theoryMarks: 0, practicalMarks: 0 };
          const th = cell.theoryMarks || 0; const pr = cell.practicalMarks || 0;
          lines.push([
            `${student.firstName} ${student.lastName}`, student.studentId || '', info.examName, s.subjectName,
            th, pr, th + pr, s.totalMaxMarks || ''
          ].join(','));
        });
      });
    });
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ReportCards_${year}_Class${selectedClass}.csv`; a.style.display = 'none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const hasData = Object.keys(reportData).length > 0;

  const templateStyles = (
    <style>{`
      @media print {
        .no-print{ display:none !important; }
        .card { page-break-after: always; }
        .print-only{ display:block !important; }
        .screen-only{ display:none !important; }
      }
      @media screen {
        .print-only{ display:none; }
        .screen-only{ display:block; }
      }
      .card {
        border: 1px solid #ddd;
        border-radius: 8px;
        margin: 16px 0;
        padding: 16px;
        background: #fff;
      }
      .card h2 { margin: 4px 0; font-size: 20px; }
      .meta { color: #555; margin-bottom: 8px; }
      table.rc { width: 100%; border-collapse: collapse; }
      table.rc th, table.rc td { border: 1px solid #bbb; padding: 6px; font-size: 13px; }
      table.rc th { background: #f6f7fb; }
      .totals { margin-top: 8px; font-weight: 600; }
      .school-title { font-weight: 700; font-size: 22px; color: #2a4d8f; }
      .header-line { height: 3px; background: linear-gradient(90deg,#2a4d8f,#4b79cf); margin: 6px 0 12px; }
    `}</style>
  );

  const renderCard = (entry: { student: Student; exams: Record<number, { examName: string; subjects: MatrixSubject[]; cells: Record<number, MatrixCell> }> }) => {
    const { student, exams } = entry;
    return (
      <div className="card">
        <div className="school-title">School Management System</div>
        <div className="header-line" />
        <h2>Report Card - AY {year}</h2>
        <div className="meta">
          <strong>Student:</strong> {student.firstName} {student.lastName} &nbsp; | &nbsp;
          <strong>Roll:</strong> {student.studentId || '-'}
        </div>
        {Object.entries(exams).map(([exId, info]) => {
          // Compute totals
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

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Report Cards</Typography>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
  <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={12}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={mode}
              onChange={(_, val) => { if (val) setMode(val); }}
              aria-label="report mode"
              sx={{ mb: 1 }}
            >
              <ToggleButton value="SECTION" aria-label="Entire Section">Entire Section</ToggleButton>
              <ToggleButton value="STUDENT" aria-label="Individual Student">Individual Student</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={(e) => { setYear(e.target.value); setSelectedExamIds([]); }}>
                {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small" disabled={!year}>
              <InputLabel>Exams</InputLabel>
              <Select
                multiple
                open={examMenuOpen}
                onOpen={() => setExamMenuOpen(true)}
                onClose={() => setExamMenuOpen(false)}
                value={selectedExamIds as any}
                label="Exams"
                onChange={handleExamSelect as any}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as number[]).map(id => <Chip key={id} size="small" label={(yearExams.find(e => e.id === id)?.name) || id} />)}
                  </Box>
                )}
              >
                {yearExams.map(ex => (
                  <MenuItem key={ex.id} value={ex.id}>
                    {ex.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select value={selectedClass} label="Class" onChange={e => { setSelectedClass(Number(e.target.value)); setSelectedSection(0); }}>
                <MenuItem value={0}>Select Class</MenuItem>
                {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" disabled={!selectedClass}>
              <InputLabel>Section</InputLabel>
              <Select value={selectedSection} label="Section" onChange={e => setSelectedSection(Number(e.target.value))}>
                <MenuItem value={0}>Select Section</MenuItem>
                {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          {mode === 'STUDENT' && (
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small" disabled={!selectedSection}>
                <InputLabel>Student</InputLabel>
                <Select value={selectedStudentId} label="Student" onChange={e => setSelectedStudentId(Number(e.target.value))}>
                  <MenuItem value={0}>Select Student</MenuItem>
                  {students.map(st => (
                    <MenuItem key={st.id} value={st.id}>{st.firstName} {st.lastName} {st.studentId ? `(${st.studentId})` : ''}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          {mode === 'SECTION' && (
            <Grid item xs={12} sm={6} md={2} sx={{ display:'flex', justifyContent: { xs:'flex-start', md:'flex-end' } }}>
              <Button variant="contained" size="small" onClick={handleGenerate} disabled={loading}>
                {loading ? <CircularProgress size={18} /> : 'Generate'}
              </Button>
            </Grid>
          )}
        </Grid>
        {mode === 'STUDENT' && (
          <Box sx={{ mt: 1, display:'flex', gap: 1 }}>
            <Button variant="contained" size="small" onClick={handleGenerate} disabled={loading}>
              {loading ? <CircularProgress size={18} /> : 'Generate'}
            </Button>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleDownloadCsv} disabled={!hasData} title="Download CSV">
              CSV
            </Button>
            <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={handlePrint} disabled={!hasData} title="Print">
              Print
            </Button>
          </Box>
        )}
      </Paper>

      {/* Actions */}
      {hasData && mode === 'SECTION' && (
        <>
          <Box className="no-print screen-only" sx={{ mb: 2 }}>
            <Alert severity="success">Report cards are ready. You can download the CSV or print all now.</Alert>
          </Box>
          <Box className="no-print" sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleDownloadCsv}>Download CSV (Section)</Button>
            <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={handlePrint}>Print All</Button>
          </Box>
        </>
      )}

      {/* Printable area */}
      {templateStyles}
      <div ref={printableRef} className={mode === 'SECTION' ? 'print-only' : ''}>
        {hasData ? (
          Object.values(reportData).sort((a, b) => (a.student.studentId || '').localeCompare(b.student.studentId || '')).map((entry) => (
            <div key={entry.student.id}>{renderCard(entry)}</div>
          ))
        ) : (
          <Card className="screen-only"><CardContent><Typography color="text.secondary">Select options and click Generate to build report cards.</Typography></CardContent></Card>
        )}
      </div>
    </Box>
  );
};

export default ReportCards;
