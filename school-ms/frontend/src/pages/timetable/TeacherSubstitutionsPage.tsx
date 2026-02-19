import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import api from '../../services/api';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
}

interface ClassNeedingSubstitution {
  slotId: number;
  classId: number;
  sectionId: number;
  periodNo: number;
  subjectId: number;
  className: string;
  sectionName: string;
  subjectCode: string;
  subjectName: string;
  hasSubstitute: boolean;
}

interface SuggestedTeacher {
  id: number;
  name: string;
  department: string;
  currentLoad: number;
  maxLoad: number;
  isOverloaded: boolean;
  warningMessage?: string;
}

interface Substitution {
  id: number;
  date: string;
  classId: number;
  sectionId: number;
  periodNo: number;
  originalTeacherId: number;
  substituteTeacherId: number;
  reason: string;
  approvedBy: string;
  className: string;
  sectionName: string;
  subjectCode: string;
  subjectName: string;
  originalTeacherName: string;
  substituteTeacherName: string;
}

const TeacherSubstitutionsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = React.useState<number | ''>('');
  const [classesNeedingSub, setClassesNeedingSub] = React.useState<ClassNeedingSubstitution[]>([]);
  const [substitutions, setSubstitutions] = React.useState<Substitution[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedClass, setSelectedClass] = React.useState<ClassNeedingSubstitution | null>(null);
  const [suggestedTeachers, setSuggestedTeachers] = React.useState<SuggestedTeacher[]>([]);
  const [selectedSubstitute, setSelectedSubstitute] = React.useState<number | ''>('');
  const [reason, setReason] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [success, setSuccess] = React.useState<string>('');
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);

  // Load teachers on mount
  React.useEffect(() => {
    (async () => {
      try {
        const staff = await api.get<any[]>('/api/staff');
        const teacherList = staff
          .filter((s) => s.teacherDetailsId)
          .map((s) => ({
            id: s.teacherDetailsId,
            firstName: s.firstName,
            lastName: s.lastName,
            department: s.department || 'N/A'
          }));
        setTeachers(teacherList);
      } catch (e) {
        console.error('Failed to load teachers', e);
      }
    })();
  }, []);

  // Load substitutions when date changes
  React.useEffect(() => {
    loadSubstitutions();
  }, [selectedDate]);

  // Load classes needing substitution when teacher or date changes
  React.useEffect(() => {
    if (selectedTeacher) {
      loadClassesNeedingSubstitution();
    } else {
      setClassesNeedingSub([]);
    }
  }, [selectedTeacher, selectedDate]);

  const loadSubstitutions = async () => {
    try {
      setLoading(true);
      const subs = await api.get<Substitution[]>(
        `/api/timetable/substitutions?date=${selectedDate}`
      );
      setSubstitutions(subs);
    } catch (e) {
      console.error('Failed to load substitutions', e);
      setSubstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClassesNeedingSubstitution = async () => {
    if (!selectedTeacher) return;

    try {
      setLoading(true);
      const classes = await api.get<ClassNeedingSubstitution[]>(
        `/api/timetable/substitutions/needed?teacherId=${selectedTeacher}&date=${selectedDate}`
      );
      setClassesNeedingSub(classes);
    } catch (e) {
      console.error('Failed to load classes', e);
      setClassesNeedingSub([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubstitute = async (classItem: ClassNeedingSubstitution) => {
    setSelectedClass(classItem);
    setSelectedSubstitute('');
    setReason('Teacher on leave');
    setDialogOpen(true);

    // Load suggested teachers
    try {
      setLoadingSuggestions(true);
      const suggestions = await api.get<SuggestedTeacher[]>(
        `/api/timetable/substitutions/suggest?classId=${classItem.classId}&section=${classItem.sectionName}&periodNo=${classItem.periodNo}&date=${selectedDate}&subjectId=${classItem.subjectId}`
      );
      setSuggestedTeachers(suggestions);
    } catch (e) {
      console.error('Failed to load suggestions', e);
      setSuggestedTeachers([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSaveSubstitution = async () => {
    if (!selectedClass || !selectedSubstitute) {
      setError('Please select a substitute teacher');
      return;
    }

    try {
      const payload = {
        date: selectedDate,
        classId: selectedClass.classId,
        section: selectedClass.sectionName,
        periodNo: selectedClass.periodNo,
        originalTeacherId: selectedTeacher,
        substituteTeacherId: selectedSubstitute,
        reason: reason || 'Teacher on leave'
      };

      await api.post('/api/timetable/substitutions', payload);
      setSuccess('Substitution assigned successfully');
      setDialogOpen(false);
      await loadSubstitutions();
      await loadClassesNeedingSubstitution();
    } catch (e: any) {
      const status = e.response?.status;
      if (status === 409) {
        setError('A substitution already exists for this class/period');
      } else if (status === 422) {
        setError('Selected teacher is not available at this time (teaching another class)');
      } else {
        setError(e.response?.data?.message || 'Failed to assign substitution');
      }
    }
  };

  const handleDeleteSubstitution = async (id: number) => {
    if (!confirm('Are you sure you want to remove this substitution?')) return;

    try {
      await api.delete(`/api/timetable/substitutions/${id}`);
      setSuccess('Substitution removed successfully');
      await loadSubstitutions();
      await loadClassesNeedingSubstitution();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to remove substitution');
    }
  };

  const getSelectedTeacherWarning = (teacher: SuggestedTeacher) => {
    if (!teacher.warningMessage) return null;

    return (
      <Alert
        severity={teacher.isOverloaded ? 'warning' : 'info'}
        icon={teacher.isOverloaded ? <WarningIcon /> : <InfoIcon />}
        sx={{ mt: 2 }}
      >
        {teacher.warningMessage}
      </Alert>
    );
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Teacher Substitutions
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Manage temporary teacher replacements when a teacher is absent. The system suggests available teachers with lighter workload.
      </Alert>

      {/* Date and Teacher Selection */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            type="date"
            label="Date"
            size="small"
            fullWidth
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl size="small" fullWidth>
            <InputLabel>Absent Teacher</InputLabel>
            <Select
              value={selectedTeacher}
              label="Absent Teacher"
              onChange={(e) => setSelectedTeacher(Number(e.target.value))}
            >
              <MenuItem value="">
                <em>Select teacher on leave</em>
              </MenuItem>
              {teachers.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.firstName} {t.lastName} ({t.department})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Classes Needing Substitution */}
      {selectedTeacher && (
        <Card sx={{ mb: 3, bgcolor: 'warning.light' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Classes Needing Substitution
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : classesNeedingSub.length === 0 ? (
              <Typography color="text.secondary">
                No classes scheduled for this teacher on this date.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classesNeedingSub.map((cls) => (
                      <TableRow key={`${cls.classId}-${cls.periodNo}`}>
                        <TableCell>{cls.periodNo}</TableCell>
                        <TableCell>
                          {cls.className} - {cls.sectionName}
                        </TableCell>
                        <TableCell>
                          {cls.subjectCode} - {cls.subjectName}
                        </TableCell>
                        <TableCell>
                          {cls.hasSubstitute ? (
                            <Chip label="Assigned" color="success" size="small" />
                          ) : (
                            <Chip label="Needs Substitute" color="warning" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {!cls.hasSubstitute && (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<PersonAddIcon />}
                              onClick={() => handleAssignSubstitute(cls)}
                            >
                              Assign
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Substitutions */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Substitutions for {new Date(selectedDate).toLocaleDateString()}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Original Teacher</TableCell>
                <TableCell>Substitute Teacher</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {substitutions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      No substitutions for this date. Select an absent teacher above to assign substitutes.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                substitutions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.periodNo}</TableCell>
                    <TableCell>
                      {sub.className} - {sub.sectionName}
                    </TableCell>
                    <TableCell>
                      {sub.subjectCode} - {sub.subjectName}
                    </TableCell>
                    <TableCell>{sub.originalTeacherName}</TableCell>
                    <TableCell>
                      <strong>{sub.substituteTeacherName}</strong>
                    </TableCell>
                    <TableCell>{sub.reason}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleDeleteSubstitution(sub.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Assign Substitute Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Assign Substitute Teacher</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedClass && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Class:</strong> {selectedClass.className} - {selectedClass.sectionName}
              </Typography>
              <Typography variant="body2">
                <strong>Period:</strong> {selectedClass.periodNo}
              </Typography>
              <Typography variant="body2">
                <strong>Subject:</strong> {selectedClass.subjectCode} - {selectedClass.subjectName}
              </Typography>
            </Box>
          )}

          {loadingSuggestions ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Substitute Teacher</InputLabel>
                <Select
                  value={selectedSubstitute}
                  label="Substitute Teacher"
                  onChange={(e) => setSelectedSubstitute(Number(e.target.value))}
                >
                  {suggestedTeachers.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name} ({t.department}) - {t.currentLoad} periods today
                      {t.isOverloaded && ' ⚠️ OVERLOADED'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedSubstitute && (
                <>
                  {getSelectedTeacherWarning(
                    suggestedTeachers.find((t) => t.id === selectedSubstitute)!
                  )}
                </>
              )}

              <TextField
                label="Reason"
                size="small"
                fullWidth
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Teacher on leave, Medical emergency"
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSubstitution} disabled={!selectedSubstitute}>
            Assign Substitute
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

export default TeacherSubstitutionsPage;
