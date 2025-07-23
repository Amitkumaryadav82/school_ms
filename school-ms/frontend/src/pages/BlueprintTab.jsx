import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Icon } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getBlueprint, addUnit, updateUnit, deleteUnit } from '../services/blueprintService';
  import { getSubjectsForClass } from '../services/examConfigService';


const BlueprintTab = ({ exams = [], selectedExam, setSelectedExam, selectedClass, setSelectedClass, classes = [], subjects }) => {
  // Exam selection for blueprint
  const handleExamSelect = (e) => {
    setSelectedExam(e.target.value);
  };
  // Use classes prop for class dropdown options
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [units, setUnits] = useState([]);
  const [unitDialog, setUnitDialog] = useState({ open: false, mode: 'add', unit: { name: '', marks: 0, questions: [] } });
  const [error, setError] = useState('');



  useEffect(() => {
    if (selectedClass) {
      getSubjectsForClass(selectedClass).then(setSubjectOptions);
    } else {
      setSubjectOptions([]);
      setSelectedSubject('');
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedExam && selectedClass && selectedSubject) {
      getBlueprint(Number(selectedExam), Number(selectedClass), Number(selectedSubject)).then(setUnits).catch(() => setUnits([]));
    } else {
      setUnits([]);
    }
  }, [selectedExam, selectedClass, selectedSubject]);

  // No need to sync prop to local state, use selectedClass prop directly

  // Ensure selectedSubject is a number for correct lookup
  const theoryMarks = subjectOptions.find(s => s.id === Number(selectedSubject))?.theoryMarks ?? 0;
  const totalUnitMarks = units.reduce((sum, u) => sum + (u.marks || 0), 0);

  // Ensure totalMarks is always defined at the top of the component
  const totalMarks = unitDialog && unitDialog.unit && Array.isArray(unitDialog.unit.questions)
    ? unitDialog.unit.questions.reduce((sum, q) => sum + (q.count * q.marksPerQuestion), 0)
    : 0;

  const handleSaveUnit = async () => {
    if (!selectedExam) {
      setError('Please select an exam before saving a unit.');
      return;
    }
    if (!unitDialog.unit.name.trim()) {
      setError('Unit name is required');
      return;
    }
    if (!unitDialog.unit.questions || unitDialog.unit.questions.length === 0) {
      setError('At least one question type is required');
      return;
    }
    const newTotal = totalUnitMarks - (unitDialog.mode === 'edit' ? units.find(u => u.id === unitDialog.unit.id)?.marks || 0 : 0) + totalMarks;
    // Debug log for validation values
    console.log('[DEBUG] totalUnitMarks:', totalUnitMarks, 'totalMarks:', totalMarks, 'theoryMarks:', theoryMarks, 'newTotal:', newTotal);
    if (newTotal > theoryMarks) {
      setError('Total unit marks cannot exceed theory marks');
      return;
    }
    setError('');
    // Remove id from unit and questions for new records
    const { id, ...unitWithoutId } = unitDialog.unit;
    const questions = Array.isArray(unitDialog.unit.questions)
      ? unitDialog.unit.questions.map(({ id, ...q }) => q)
      : [];
    const payload = {
      ...unitWithoutId,
      marks: totalMarks,
      schoolClass: { id: Number(selectedClass) },
      subject: { id: Number(selectedSubject) },
      exam: { id: Number(selectedExam) },
      questions
    };
    console.log('[DEBUG] Saving unit with payload:', payload);
    if (unitDialog.mode === 'add') {
      await addUnit(payload);
    } else {
      await updateUnit(unitDialog.unit.id, payload);
    }
    getBlueprint(Number(selectedExam), Number(selectedClass), Number(selectedSubject)).then(setUnits);
    setUnitDialog({ open: false, mode: 'add', unit: { name: '', marks: 0, questions: [] } });
  };

  const handleDeleteUnit = async (id) => {
    // Prevent API call if subject is not selected
    if (!selectedExam || !selectedClass || !selectedSubject) {
      setError('Please select exam, class, and subject before deleting a unit.');
      return;
    }
    await deleteUnit(id);
    getBlueprint(Number(selectedExam), Number(selectedClass), Number(selectedSubject)).then(setUnits);
  };

  return (
    <Box mt={2}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <TextField
          select
          label="Select Exam"
          value={selectedExam}
          onChange={handleExamSelect}
          size="small"
          sx={{ minWidth: 180 }}
          SelectProps={{ native: true }}
        >
          <option value="">Select Exam</option>
          {exams.map(exam => (
            <option key={exam.id} value={exam.id}>{exam.name}</option>
          ))}
        </TextField>
      </Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Select Class"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Select Subject"
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            fullWidth
            SelectProps={{ native: true }}
            disabled={!selectedClass}
          >
            <option value="">Select Subject</option>
            {subjectOptions.map(subj => (
              <option key={subj.id} value={subj.id}>{subj.name}</option>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button variant="contained" startIcon={<AddIcon />} disabled={!selectedSubject || !selectedClass} onClick={() => setUnitDialog({ open: true, mode: 'add', unit: { name: '', marks: 0 } })}>Add Unit/Chapter</Button>
        </Grid>
      </Grid>
      {selectedSubject && (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Unit/Chapter Name</TableCell>
                <TableCell>Number of Questions</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {units.map(unit => (
                <TableRow key={unit.id}>
                  <TableCell>{unit.name}</TableCell>
                  <TableCell>{Array.isArray(unit.questions) ? unit.questions.reduce((sum, q) => sum + (q.count || 0), 0) : 0}</TableCell>
                  <TableCell>{unit.marks}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => {
                      // Ensure only nested structure is used, strip flat fields
                      const cleanedUnit = {
                        id: unit.id,
                        name: unit.name,
                        marks: unit.marks,
                        questions: unit.questions || [],
                        schoolClass: unit.schoolClass && unit.schoolClass.id ? { id: unit.schoolClass.id } : undefined,
                        subject: unit.subject && unit.subject.id ? { id: unit.subject.id } : undefined,
                        exam: unit.exam && unit.exam.id ? { id: unit.exam.id } : undefined,
                      };
                      setUnitDialog({ open: true, mode: 'edit', unit: cleanedUnit });
                    }}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteUnit(unit.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell></TableCell>
                <TableCell><strong>{totalUnitMarks} / {theoryMarks}</strong></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={unitDialog.open} onClose={() => setUnitDialog({ open: false, mode: 'add', unit: { name: '', marks: 0, questions: [] } })}>
        <DialogTitle>{unitDialog.mode === 'add' ? 'Add Unit/Chapter' : 'Edit Unit/Chapter'}</DialogTitle>
        <DialogContent>
          <TableContainer component={Card} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Unit/Chapter Name</TableCell>
                  <TableCell>Number of Questions</TableCell>
                  <TableCell>Marks per Question</TableCell>
                  {/* No Actions column in dialog */}
                </TableRow>
                <TableRow>
                  <TableCell>
                    <TextField
                      value={unitDialog.unit.name}
                      onChange={e => setUnitDialog({ ...unitDialog, unit: { ...unitDialog.unit, name: e.target.value } })}
                      placeholder="Unit Name"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={unitDialog.unit.questions && unitDialog.unit.questions[0] ? unitDialog.unit.questions[0].count : ''}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        const questions = unitDialog.unit.questions && unitDialog.unit.questions.length > 0 ? [...unitDialog.unit.questions] : [{ count: 0, marksPerQuestion: 0 }];
                        questions[0].count = val;
                        setUnitDialog({ ...unitDialog, unit: { ...unitDialog.unit, questions } });
                      }}
                      placeholder="Questions"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={unitDialog.unit.questions && unitDialog.unit.questions[0] ? unitDialog.unit.questions[0].marksPerQuestion : ''}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        const questions = unitDialog.unit.questions && unitDialog.unit.questions.length > 0 ? [...unitDialog.unit.questions] : [{ count: 0, marksPerQuestion: 0 }];
                        questions[0].marksPerQuestion = val;
                        setUnitDialog({ ...unitDialog, unit: { ...unitDialog.unit, questions } });
                      }}
                      placeholder="Marks/Question"
                      size="small"
                    />
                  </TableCell>
                  {/* No Actions column in dialog */}
                </TableRow>
              </TableHead>
              <TableBody>
                {units.map(unit => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.name}</TableCell>
                    <TableCell>{unit.questions && unit.questions[0] ? unit.questions[0].count : ''}</TableCell>
                    <TableCell>{unit.questions && unit.questions[0] ? unit.questions[0].marksPerQuestion : ''}</TableCell>
                    {/* No edit/delete icons in dialog */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Total Marks: {totalMarks}
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnitDialog({ open: false, mode: 'add', unit: { name: '', marks: 0, questions: [] } })}>Cancel</Button>
          <Button onClick={handleSaveUnit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlueprintTab;
