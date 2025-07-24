import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, TextField, Button, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, IconButton, Select, InputLabel, FormControl } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
const QuestionPaperFormatTab = ({ exams, classes, subjects, selectedExam, setSelectedExam, selectedClass, setSelectedClass, selectedSubject, setSelectedSubject, blueprintUnits }) => {
  // Always log exams prop for debugging
  console.log('[QPF] exams:', exams);
  const [totalQuestions, setTotalQuestions] = useState(1);
  const [questions, setQuestions] = useState([{ marks: '', unit: '' }]);
  const [error, setError] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  // Get theory marks for selected subject, default to 100 if not selected
  const theoryMarks = useMemo(() => {
    if (!selectedSubject) return 100;
    const subj = subjects.find(s => String(s.id) === String(selectedSubject));
    return subj ? subj.theoryMarks ?? subj.maxMarks ?? 100 : 100;
  }, [selectedSubject, subjects]);

  // Update questions array when totalQuestions changes
  const handleTotalQuestionsChange = (e) => {
    let n = parseInt(e.target.value) || 1;
    if (n < 1) n = 1;
    setTotalQuestions(n);
    setQuestions(qs => {
      const arr = [...qs];
      while (arr.length < n) arr.push({ marks: '', unit: '' });
      return arr.slice(0, n);
    });
  };

  // Handle question field change
  const handleQuestionChange = (idx, field, value) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  // Remove a question
  const handleRemoveQuestion = (idx) => {
    setQuestions(qs => qs.filter((_, i) => i !== idx));
    setTotalQuestions(n => Math.max(1, n - 1));
  };

  // Add a question
  const handleAddQuestion = () => {
    setQuestions(qs => [...qs, { marks: '', unit: '' }]);
    setTotalQuestions(n => n + 1);
  };

  // Per-unit marks validation
  const unitMarksMap = useMemo(() => {
    const map = {};
    questions.forEach(q => {
      if (q.unit && q.marks) {
        map[q.unit] = (map[q.unit] || 0) + parseFloat(q.marks);
      }
    });
    return map;
  }, [questions]);

  const blueprintUnitMarks = useMemo(() => {
    const map = {};
    blueprintUnits.forEach(u => {
      map[u.name] = u.marks;
    });
    return map;
  }, [blueprintUnits]);

  // Validate per-unit marks
  const perUnitError = Object.entries(unitMarksMap).some(([unit, marks]) => {
    return blueprintUnitMarks[unit] !== undefined && marks !== blueprintUnitMarks[unit];
  });

  // Validate total marks
  const totalMarks = questions.reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0);
  const marksError = theoryMarks > 0 && totalMarks > theoryMarks;

  // Summary data
  const summary = questions.map((q, idx) => ({
    unit: q.unit,
    question: idx + 1,
    marks: q.marks
  }));

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Question Paper Format</Typography>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Exam</InputLabel>
            <Select
              value={selectedExam}
              label="Exam"
              onChange={e => {
                setSelectedExam(e.target.value);
                setSelectedClass('');
                setSelectedSubject('');
              }}
              disabled={exams.length === 0}
            >
              {exams && exams.map(exam => (
                <MenuItem key={exam.id} value={exam.id}>{exam.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select
              value={selectedClass}
              label="Class"
              onChange={e => {
                setSelectedClass(e.target.value);
                setSelectedSubject('');
              }}
              disabled={classes.length === 0 || !selectedExam}
            >
              {classes.map(cls => (
                <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Subject</InputLabel>
            <Select
              value={selectedSubject}
              label="Subject"
              onChange={e => setSelectedSubject(e.target.value)}
              disabled={!selectedClass}
            >
              {subjects.map(subj => (
                <MenuItem key={subj.id} value={subj.id}>{subj.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="Total Questions"
            type="text"
            size="small"
            value={totalQuestions}
            onChange={e => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              setTotalQuestions(val === '' ? 1 : Math.max(1, parseInt(val)));
              setQuestions(qs => {
                const n = val === '' ? 1 : Math.max(1, parseInt(val));
                const arr = [...qs];
                while (arr.length < n) arr.push({ marks: '', unit: '' });
                return arr.slice(0, n);
              });
            }}
            fullWidth
            disabled={!selectedSubject}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography color={marksError ? 'error' : 'text.secondary'}>
            Total Marks: {totalMarks} / {theoryMarks}
          </Typography>
        </Grid>
      </Grid>
      {marksError && <Typography color="error" sx={{ mb: 2 }}>Total marks exceed subject's theory marks!</Typography>}
      {perUnitError && <Typography color="error" sx={{ mb: 2 }}>Per-unit marks do not match blueprint marks!</Typography>}
      <TableContainer component={Card} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Q#</TableCell>
              <TableCell>Marks</TableCell>
              <TableCell>Unit Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((q, idx) => (
              <TableRow key={idx}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    value={q.marks}
                    onChange={e => handleQuestionChange(idx, 'marks', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={q.unit}
                      onChange={e => handleQuestionChange(idx, 'unit', e.target.value)}
                    >
                      {blueprintUnits.map(u => (
                        <MenuItem key={u.name} value={u.name}>{u.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleRemoveQuestion(idx)} disabled={questions.length === 1}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="outlined" onClick={handleAddQuestion} sx={{ mb: 2, mr: 2 }}>Add Question</Button>
      <Button variant="contained" onClick={() => setShowSummary(true)} sx={{ mb: 2 }}>Show Summary</Button>
      {showSummary && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Summary</Typography>
          <TableContainer component={Card}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Unit Name</TableCell>
                  <TableCell>Question #</TableCell>
                  <TableCell>Marks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>{row.question}</TableCell>
                    <TableCell>{row.marks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default QuestionPaperFormatTab;
