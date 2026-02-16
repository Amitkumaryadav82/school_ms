import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../services/api';

interface ClassItem {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  code: string;
  name: string;
}

interface TimetableRequirement {
  id: number;
  classId: number;
  sectionId: number;
  subjectId: number;
  weeklyPeriods: number;
  notes?: string;
  subjectCode?: string;
  subjectName?: string;
}

const TimetableRequirementsPage: React.FC = () => {
  const [classes, setClasses] = React.useState<ClassItem[]>([]);
  const [classId, setClassId] = React.useState<number | ''>('');
  const [sections, setSections] = React.useState<string[]>([]);
  const [section, setSection] = React.useState<string>('');
  const [requirements, setRequirements] = React.useState<TimetableRequirement[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingReq, setEditingReq] = React.useState<TimetableRequirement | null>(null);
  const [selectedSubject, setSelectedSubject] = React.useState<number | ''>('');
  const [weeklyPeriods, setWeeklyPeriods] = React.useState<number>(5);
  const [notes, setNotes] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [success, setSuccess] = React.useState<string>('');

  // Load classes on mount
  React.useEffect(() => {
    (async () => {
      try {
        const cls = await api.get<ClassItem[]>('/api/classes');
        setClasses(cls);
        if (cls.length) setClassId(cls[0].id);
      } catch (e) {
        console.error('Failed to load classes', e);
      }
    })();
  }, []);

  // Load subjects on mount
  React.useEffect(() => {
    (async () => {
      try {
        const subs = await api.get<Subject[]>('/api/subjects');
        setSubjects(subs);
      } catch (e) {
        console.error('Failed to load subjects', e);
      }
    })();
  }, []);

  // Load sections when class changes
  React.useEffect(() => {
    (async () => {
      if (!classId) {
        setSections([]);
        setSection('');
        return;
      }
      try {
        // Get sections for this class
        const response = await api.get<any>(`/api/timetable/class-sections?classId=${classId}`);
        setSections(response);
        if (response.length) setSection(response[0]);
      } catch (e) {
        console.error('Failed to load sections', e);
      }
    })();
  }, [classId]);

  // Load requirements when class/section changes
  const loadRequirements = React.useCallback(async () => {
    if (!classId || !section) return;
    try {
      setLoading(true);
      const reqs = await api.get<TimetableRequirement[]>(
        `/api/timetable/requirements?classId=${classId}&section=${section}`
      );
      setRequirements(reqs);
    } catch (e) {
      console.error('Failed to load requirements', e);
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, [classId, section]);

  React.useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  const handleAdd = () => {
    setEditingReq(null);
    setSelectedSubject('');
    setWeeklyPeriods(5);
    setNotes('');
    setDialogOpen(true);
  };

  const handleEdit = (req: TimetableRequirement) => {
    setEditingReq(req);
    setSelectedSubject(req.subjectId);
    setWeeklyPeriods(req.weeklyPeriods);
    setNotes(req.notes || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!classId || !section || !selectedSubject || weeklyPeriods < 1) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        classId: Number(classId),
        section: String(section),
        subjectId: Number(selectedSubject),
        weeklyPeriods: Number(weeklyPeriods),
        notes: notes || null
      };

      if (editingReq) {
        await api.put(`/api/timetable/requirements/${editingReq.id}`, payload);
        setSuccess('Requirement updated successfully');
      } else {
        await api.post('/api/timetable/requirements', payload);
        setSuccess('Requirement added successfully');
      }

      setDialogOpen(false);
      await loadRequirements();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save requirement');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return;

    try {
      await api.delete(`/api/timetable/requirements/${id}`);
      setSuccess('Requirement deleted successfully');
      await loadRequirements();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to delete requirement');
    }
  };

  const getTotalPeriods = () => {
    return requirements.reduce((sum, req) => sum + req.weeklyPeriods, 0);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Timetable Requirements
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Define how many periods per week each subject needs for each class/section. This is used by the auto-generate feature.
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Class</InputLabel>
          <Select value={classId} label="Class" onChange={(e) => setClassId(Number(e.target.value))}>
            {classes.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }} disabled={!sections.length}>
          <InputLabel>Section</InputLabel>
          <Select value={section} label="Section" onChange={(e) => setSection(String(e.target.value))}>
            {sections.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} disabled={!classId || !section}>
          Add Requirement
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Subject Code</TableCell>
                  <TableCell>Subject Name</TableCell>
                  <TableCell align="center">Weekly Periods</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requirements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">
                        No requirements configured. Click "Add Requirement" to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  requirements.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.subjectCode}</TableCell>
                      <TableCell>{req.subjectName}</TableCell>
                      <TableCell align="center">{req.weeklyPeriods}</TableCell>
                      <TableCell>{req.notes || '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleEdit(req)} color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(req.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {requirements.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Total periods per week:</strong> {getTotalPeriods()} periods
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tip: With 5 working days and 8 periods per day, you have 40 slots per week (minus lunch breaks).
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingReq ? 'Edit Requirement' : 'Add Requirement'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={(e) => setSelectedSubject(Number(e.target.value))}
              >
                {subjects.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="number"
              label="Weekly Periods"
              size="small"
              fullWidth
              value={weeklyPeriods}
              onChange={(e) => setWeeklyPeriods(parseInt(e.target.value || '0', 10))}
              inputProps={{ min: 1, max: 40 }}
              helperText="How many periods per week this subject needs"
            />

            <TextField
              label="Notes (Optional)"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Includes lab sessions, Core subject, etc."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingReq ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TimetableRequirementsPage;
