import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Chip, Checkbox, ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';



const API_BASE = '/api';
const ExamManagementTab = ({ classes = [] }) => {
  const [exams, setExams] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', classIds: [] });
  const [error, setError] = useState('');
  const [deleteIndex, setDeleteIndex] = useState(null);

  // Fetch exams from backend
  useEffect(() => {
    fetch(`${API_BASE}/exams`, { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load exams'))
      .then(setExams)
      .catch(() => setExams([]));
  }, []);

  // Always get latest token for every request
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Handler to open the modal for add/edit
  const handleOpenModal = (exam = null, idx = null) => {
    if (exam) {
      setForm({ ...exam });
      setEditIndex(idx);
    } else {
      setForm({ name: '', startDate: '', endDate: '', classIds: [] });
      setEditIndex(null);
    }
    setError('');
    setModalOpen(true);
  };

  // Handler to close the modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setForm({ name: '', startDate: '', endDate: '', classIds: [] });
    setEditIndex(null);
    setError('');
  };

  // Handler for form field changes
  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Handler to save (add or update) an exam
  const handleSave = () => {
    if (!form.name || !form.startDate || !form.endDate || !form.classIds.length) {
      setError('All fields are required.');
      return;
    }
    const payload = {
      name: form.name,
      description: form.description || '',
      startDate: form.startDate,
      endDate: form.endDate,
      classIds: form.classIds
    };
    const method = editIndex !== null ? 'PUT' : 'POST';
    const url = editIndex !== null && exams[editIndex]?.id ? `${API_BASE}/exams/${exams[editIndex].id}` : `${API_BASE}/exams`;
    fetch(url, {
      method,
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to save exam'))
      .then(() => {
        // Refresh exams
        fetch(`${API_BASE}/exams`, { headers: getAuthHeaders() })
          .then(r => r.ok ? r.json() : [])
          .then(setExams);
        handleCloseModal();
      })
      .catch(() => setError('Unable to save exam.'));
  };

  // Handler to delete an exam (open confirmation dialog)
  // Handler to delete an exam (open confirmation dialog)
  const handleDelete = (idx) => {
    const exam = exams[idx];
    if (!exam?.id) {
      setError('Invalid exam selected.');
      return;
    }
    setDeleteIndex(idx);
  };

  // Handler to confirm deletion
  const confirmDelete = () => {
    const exam = exams[deleteIndex];
    if (!exam?.id) {
      setDeleteIndex(null);
      return;
    }
    fetch(`${API_BASE}/exams/${exam.id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
      .then(() => {
        fetch(`${API_BASE}/exams`, { headers: getAuthHeaders() })
          .then(r => r.ok ? r.json() : [])
          .then(setExams);
        setDeleteIndex(null);
      })
      .catch(() => setDeleteIndex(null));
  };

  // ...existing code...

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Exam Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          Add Exam
        </Button>
      </Box>
      {error && (
        <Box mb={2}><Typography color="error">{error}</Typography></Box>
      )}
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
                      const cls = classes.find(c => c.id === cid);
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
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, ml: 0.2 }} color="text.secondary">Classes *</Typography>
              <Select
                label="Classes"
                multiple
                value={form.classIds}
                onChange={e => {
                  const value = e.target.value;
                  if (value.includes('all')) {
                    handleFormChange('classIds', form.classIds.length === classes.length ? [] : classes.map(c => c.id));
                  } else {
                    handleFormChange('classIds', value);
                  }
                }}
                renderValue={selected =>
                  selected.length === classes.length
                    ? 'All Classes'
                    : selected.map(cid => {
                        const cls = classes.find(c => c.id === cid);
                        return cls ? cls.name : cid;
                      }).join(', ')
                }
                fullWidth
                required
              >
                <MenuItem value="all">
                  <Checkbox checked={form.classIds.length === classes.length} indeterminate={form.classIds.length > 0 && form.classIds.length < classes.length} />
                  <ListItemText primary="Select All" />
                </MenuItem>
                {classes.map(cls => (
                  <MenuItem key={cls.id} value={cls.id}>
                    <Checkbox checked={form.classIds.indexOf(cls.id) > -1} />
                    <ListItemText primary={cls.name} />
                  </MenuItem>
                ))}
              </Select>
            </Box>
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
          <Typography>Deleting this exam will also delete all related blueprints. Are you sure you want to proceed?</Typography>
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
