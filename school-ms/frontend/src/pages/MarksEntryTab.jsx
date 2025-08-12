
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Box, Typography, Grid, TextField, Button, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, Select, InputLabel, FormControl, Snackbar, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const MarksEntryTab = ({ exams, classes, subjects, sections, blueprintUnits }) => {
  // Dropdown selections
  const [selectedExam, setSelectedExam] = useState('');
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [filteredSections, setFilteredSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  // Question paper and marks
  const [questions, setQuestions] = useState([]); // [{questionNumber, unitName, marks, maxMarks}]
  const [marks, setMarks] = useState([]); // [{questionNumber, obtainedMarks}]
  const [saveStatus, setSaveStatus] = useState({ open: false, success: true, message: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [pendingStudent, setPendingStudent] = useState(null);

  // Bulk upload
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkErrors, setBulkErrors] = useState([]);

  // Auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Exam change: filter classes, reset downstream
  useEffect(() => {
    if (selectedExam) {
      setFilteredClasses(classes.filter(cls => String(cls.examId) === String(selectedExam) || !cls.examId));
    } else {
      setFilteredClasses([]);
    }
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedSection('');
    setSelectedStudent('');
    setFilteredSubjects([]);
    setFilteredSections([]);
    setStudents([]);
    setQuestions([]);
    setMarks([]);
  }, [selectedExam, classes]);

  // Class change: filter subjects, sections, reset downstream
  useEffect(() => {
    if (selectedClass) {
      setFilteredSubjects(subjects.filter(subj => String(subj.classId) === String(selectedClass)));
      setFilteredSections(sections.filter(sec => String(sec.classId) === String(selectedClass)));
    } else {
      setFilteredSubjects([]);
      setFilteredSections([]);
    }
    setSelectedSubject('');
    setSelectedSection('');
    setSelectedStudent('');
    setStudents([]);
    setQuestions([]);
    setMarks([]);
  }, [selectedClass, subjects, sections]);

  // Subject change: reset downstream
  useEffect(() => {
    setSelectedSection('');
    setSelectedStudent('');
    setStudents([]);
    setQuestions([]);
    setMarks([]);
  }, [selectedSubject]);

  // Section change: fetch students
  useEffect(() => {
    if (selectedClass && selectedSection) {
      axios.get('/api/students', {
        params: { classId: selectedClass, section: selectedSection },
        headers: getAuthHeaders(),
      }).then(res => setStudents(res.data || []))
        .catch(() => setStudents([]));
    } else {
      setStudents([]);
    }
    setSelectedStudent('');
    setQuestions([]);
    setMarks([]);
  }, [selectedSection, selectedClass]);

  // Student change: fetch marks and question paper
  useEffect(() => {
    if (selectedExam && selectedClass && selectedSubject && selectedStudent) {
      // Fetch question paper
      axios.get('/api/question-paper-format', {
        params: { examId: selectedExam, classId: selectedClass, subjectId: selectedSubject },
        headers: getAuthHeaders(),
      }).then(res => {
        setQuestions(res.data || []);
        // Fetch marks for student
        axios.get('/api/marks-entry', {
          params: { studentId: selectedStudent, examId: selectedExam, classId: selectedClass, subjectId: selectedSubject },
          headers: getAuthHeaders(),
        }).then(mres => {
          setMarks(mres.data || (res.data || []).map(q => ({ questionNumber: q.questionNumber, obtainedMarks: '' })));
          setUnsaved(false);
        }).catch(() => {
          setMarks((res.data || []).map(q => ({ questionNumber: q.questionNumber, obtainedMarks: '' })));
          setUnsaved(false);
        });
      }).catch(() => {
        setQuestions([]);
        setMarks([]);
      });
    } else {
      setQuestions([]);
      setMarks([]);
      setUnsaved(false);
    }
  }, [selectedExam, selectedClass, selectedSubject, selectedStudent]);

  // Handle marks change
  const handleMarkChange = (idx, value) => {
    setMarks(mks => mks.map((m, i) => i === idx ? { ...m, obtainedMarks: value } : m));
    setUnsaved(true);
  };

  // Save marks for student
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post('/api/marks-entry', {
        studentId: selectedStudent,
        examId: selectedExam,
        classId: selectedClass,
        subjectId: selectedSubject,
        marks,
      }, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
      setSaveStatus({ open: true, success: true, message: 'Marks saved successfully.' });
      setUnsaved(false);
    } catch (err) {
      let message = 'Failed to save marks.';
      if (err.response) {
        message = err.response.data?.message || JSON.stringify(err.response.data) || message;
      } else if (err.request) {
        message = 'No response from server.';
      } else {
        message = err.message;
      }
      setSaveStatus({ open: true, success: false, message });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle student switch with unsaved data
  const handleStudentSelect = (id) => {
    if (unsaved) {
      setPendingStudent(id);
      setShowSwitchDialog(true);
    } else {
      setSelectedStudent(id);
    }
  };
  const confirmSwitchStudent = () => {
    setSelectedStudent(pendingStudent);
    setShowSwitchDialog(false);
    setPendingStudent(null);
  };
  const cancelSwitchStudent = () => {
    setShowSwitchDialog(false);
    setPendingStudent(null);
  };

  // Marks validation
  const questionMaxMap = useMemo(() => {
    const map = {};
    questions.forEach(q => { map[q.questionNumber] = q.marks; });
    return map;
  }, [questions]);
  const marksError = marks.some((m, idx) => parseFloat(m.obtainedMarks) > parseFloat(questionMaxMap[m.questionNumber] || 0));

  // Per-unit summary
  const unitSummary = useMemo(() => {
    const map = {};
    questions.forEach((q, idx) => {
      const obtained = marks[idx]?.obtainedMarks ? parseFloat(marks[idx].obtainedMarks) : 0;
      map[q.unitName] = (map[q.unitName] || 0) + obtained;
    });
    return map;
  }, [questions, marks]);

  // UI
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Marks Entry</Typography>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        {/* Exam dropdown */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Exam</InputLabel>
            <Select value={selectedExam} label="Exam" onChange={e => setSelectedExam(e.target.value)}>
              {exams.map(exam => <MenuItem key={exam.id} value={exam.id}>{exam.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        {/* Class dropdown */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select value={selectedClass} label="Class" onChange={e => setSelectedClass(e.target.value)} disabled={!selectedExam}>
              {filteredClasses.map(cls => <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        {/* Subject dropdown */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Subject</InputLabel>
            <Select value={selectedSubject} label="Subject" onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedClass}>
              {filteredSubjects.map(subj => <MenuItem key={subj.id} value={subj.id}>{subj.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        {/* Section dropdown */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Section</InputLabel>
            <Select value={selectedSection} label="Section" onChange={e => setSelectedSection(e.target.value)} disabled={!selectedSubject}>
              {filteredSections.map(sec => <MenuItem key={sec.id} value={sec.id}>{sec.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        {/* Student dropdown */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Student</InputLabel>
            <Select value={selectedStudent} label="Student" onChange={e => handleStudentSelect(e.target.value)} disabled={!selectedSection}>
              {students.map(stu => <MenuItem key={stu.id} value={stu.id}>{stu.id} - {stu.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {/* Bulk upload/download controls */}
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" sx={{ mr: 2 }} onClick={() => setBulkDialogOpen(true)}>Bulk Upload</Button>
        <Button variant="outlined" onClick={() => {/* TODO: implement template download */}}>Download Template</Button>
      </Box>
      {/* Student list */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Student</InputLabel>
            <Select value={selectedStudent} label="Student" onChange={e => handleStudentSelect(e.target.value)} disabled={!selectedSection}>
              {students.map(stu => <MenuItem key={stu.id} value={stu.id}>{stu.id} - {stu.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {/* Marks entry table */}
      {selectedStudent && questions.length > 0 && (
        <TableContainer component={Card} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Q#</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Max Marks</TableCell>
                <TableCell>Marks Obtained</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questions.map((q, idx) => (
                <TableRow key={q.questionNumber}>
                  <TableCell>{q.questionNumber}</TableCell>
                  <TableCell>{q.unitName}</TableCell>
                  <TableCell>{q.marks}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={marks[idx]?.obtainedMarks || ''}
                      onChange={e => handleMarkChange(idx, e.target.value)}
                      inputProps={{ min: 0, max: q.marks }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Per-unit summary */}
      {selectedStudent && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Summary (Per Unit)</Typography>
          <TableContainer component={Card}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Unit</TableCell>
                  <TableCell>Obtained</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(unitSummary).map(([unit, obtained]) => (
                  <TableRow key={unit}>
                    <TableCell>{unit}</TableCell>
                    <TableCell>{obtained}</TableCell>
                    <TableCell>{blueprintUnits.find(u => u.name === unit)?.marks || ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {/* Save button and error/warning */}
      {selectedStudent && (
        <Box sx={{ mb: 2 }}>
          {marksError && <Typography color="error">One or more marks exceed the allowed maximum for a question.</Typography>}
          <Button variant="contained" color="primary" onClick={handleSave} disabled={isSaving || marksError} startIcon={isSaving ? <CircularProgress size={18} /> : null}>
            Save
          </Button>
        </Box>
      )}
      {/* Switch student warning dialog */}
      <Dialog open={showSwitchDialog} onClose={cancelSwitchStudent}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <Typography>You have unsaved marks for this student. Switching to another student will discard these changes. Continue?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelSwitchStudent}>Cancel</Button>
          <Button onClick={confirmSwitchStudent} color="primary">Continue</Button>
        </DialogActions>
      </Dialog>
      {/* Bulk upload dialog (placeholder) */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Upload Marks</DialogTitle>
        <DialogContent>
          <Typography>Upload your Excel file here. Errors will be reported below.</Typography>
          {/* TODO: File input and upload logic */}
          {bulkErrors.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography color="error">Errors:</Typography>
              <ul>
                {bulkErrors.map((err, idx) => <li key={idx}>{err}</li>)}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for save status */}
      <Snackbar open={saveStatus.open} autoHideDuration={3000} onClose={() => setSaveStatus(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSaveStatus(s => ({ ...s, open: false }))} severity={saveStatus.success ? 'success' : 'error'} sx={{ width: '100%' }}>
          {saveStatus.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MarksEntryTab;
