import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Chip, Checkbox, ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const mockClasses = [
  { id: 1, name: 'Class 1' },
  { id: 2, name: 'Class 2' },
  { id: 3, name: 'Class 3' },
  { id: 4, name: 'Class 4' },
  { id: 5, name: 'Class 5' },
  { id: 6, name: 'Class 6' },
  { id: 7, name: 'Class 7' },
  { id: 8, name: 'Class 8' },
  { id: 9, name: 'Class 9' },
  { id: 10, name: 'Class 10' },
  { id: 11, name: 'Class 11' },
  { id: 12, name: 'Class 12' },
];

const initialExams = [];

const ExamManagementTab = () => {
  const [exams, setExams] = useState(initialExams);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', classIds: [] });
  const [error, setError] = useState('');
  const [deleteIndex, setDeleteIndex] = useState(null);

  // Validation helpers
  const isNameUnique = (name, idx) => !exams.some((e, i) => e.name === name && i !== idx);
  const isDateValid = (start, end) => start && end && new Date(start) < new Date(end);

  // Handlers
  const handleOpenModal = (exam = null, idx = null) => {
    setError('');
    setEditIndex(idx);
    setForm(
      exam
        ? { ...exam, classIds: [...exam.classIds] }
        : { name: '', startDate: '', endDate: '', classIds: [] }
    );
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditIndex(null);
    setForm({ name: '', startDate: '', endDate: '', classIds: [] });
    setError('');
  };

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return setError('Exam Name is required.');
    if (!isNameUnique(form.name, editIndex)) return setError('Exam Name must be unique.');
    if (!form.startDate || !form.endDate) return setError('Start and End Date are required.');
    if (!isDateValid(form.startDate, form.endDate)) return setError('Start Date must be before End Date.');
    if (!form.classIds.length) return setError('At least one class must be selected.');
    const newExam = { ...form };
    if (editIndex !== null) {
      setExams(exams => exams.map((e, i) => (i === editIndex ? newExam : e)));
    } else {
      setExams(exams => [...exams, newExam]);
    }
    handleCloseModal();
  };

  const handleDelete = idx => {
    setDeleteIndex(idx);
  };

  const confirmDelete = () => {
    setExams(exams => exams.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Exam Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          Add Exam
        </Button>
      </Box>
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam Name</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Classes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No exams created yet.</TableCell>
              </TableRow>
            ) : (
              exams.map((exam, idx) => (
                <TableRow key={idx}>
                  <TableCell>{exam.name}</TableCell>
                  <TableCell>{exam.startDate}</TableCell>
                  <TableCell>{exam.endDate}</TableCell>
                  <TableCell>
                    {exam.classIds.map(cid => {
                      const cls = mockClasses.find(c => c.id === cid);
                      return cls ? <Chip key={cid} label={cls.name} size="small" sx={{ mr: 0.5 }} /> : null;
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenModal(exam, idx)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(idx)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editIndex !== null ? 'Edit Exam' : 'Add Exam'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Exam Name"
              value={form.name}
              onChange={e => handleFormChange('name', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={e => handleFormChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={e => handleFormChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <Select
              label="Classes"
              multiple
              value={form.classIds}
              onChange={e => {
                const value = e.target.value;
                if (value.includes('all')) {
                  handleFormChange('classIds', form.classIds.length === mockClasses.length ? [] : mockClasses.map(c => c.id));
                } else {
                  handleFormChange('classIds', value);
                }
              }}
              renderValue={selected =>
                selected.length === mockClasses.length
                  ? 'All Classes'
                  : selected.map(cid => {
                      const cls = mockClasses.find(c => c.id === cid);
                      return cls ? cls.name : cid;
                    }).join(', ')
              }
              fullWidth
              required
            >
              <MenuItem value="all">
                <Checkbox checked={form.classIds.length === mockClasses.length} indeterminate={form.classIds.length > 0 && form.classIds.length < mockClasses.length} />
                <ListItemText primary="Select All" />
              </MenuItem>
              {mockClasses.map(cls => (
                <MenuItem key={cls.id} value={cls.id}>
                  <Checkbox checked={form.classIds.indexOf(cls.id) > -1} />
                  <ListItemText primary={cls.name} />
                </MenuItem>
              ))}
            </Select>
            {error && <Typography color="error">{error}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editIndex !== null ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteIndex !== null} onClose={() => setDeleteIndex(null)}>
        <DialogTitle>Delete Exam</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this exam?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteIndex(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamManagementTab;
