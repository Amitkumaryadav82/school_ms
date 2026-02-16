import React from 'react';
import {
  Box,
  Paper,
  Typography,
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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import api from '../../services/api';

interface Teacher {
  id: number;
  name: string;
}

interface AffectedPeriod {
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
  periodNo: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  timeSlot: string;
}

interface TeacherSuggestion {
  teacherId: number;
  teacherName: string;
  department: string;
  currentDayLoad: number;
  maxDayLoad: number;
  isOverloaded: boolean;
  warningMessage: string | null;
}

interface Substitution {
  id: number;
  date: string;
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
  periodNo: number;
  subjectCode: string;
  subjectName: string;
  originalTeacherId: number;
  originalTeacherName: string;
  substituteTeacherId: number;
  substituteTeacherName: string;
  reason: string;
  notes: string;
}

const TeacherSubstitutionsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = React.useState<number | ''>('');
  const [affectedPeriods, setAffectedPeriods] = React.useState<AffectedPeriod[]>([]);
  const [substitutions, setSubstitutions] = React.useState<Substitution[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedPeriod, setSelectedPeriod] = React.useState<AffectedPeriod | null>(null);
  const [suggestions, setSuggestions] = React.useState<TeacherSuggestion[]>([]);
  const [selectedSubstitute, setSelectedSubstitute] = React.useState<number | ''>('');
  const [reason, setReason] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [success, setSuccess] = React.useState<string>('');
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);

  // Load teachers on mount
  React.useEffect(() => {
    (async () => {
      try {
        const response = await api.get<any[]>('/api/school-staff');
        const teacherList = response
          .filter((s: any) => s.teacherDetailsId)
          .map((s: any) => ({
            id: s.teacherDetailsId,
            name: `${s.firstName} ${s.lastName}`
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

  const handleTeacherSelect = async (teacherId: number) => {
    setSelectedTeacher(teacherId);
    try {
      setLoading(true);
      const periods = await api.get<AffectedPeriod[]>(
        `/api/timetable/substitutions/affected-periods?teacherId=${teacherId}&date=${selectedDate}`
      );
      setAffectedPeriods(periods);
    } catch (e) {
      console.error('Failed to load affected periods', e);
      setAffectedPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubstitution = async (period: AffectedPeriod) => {
    setSelectedPeriod(period);
    setSelectedSubstitute('');
    setReason('');
    setNotes('');
    setSuggestions([]);
    setDialogOpen(true);

    // Load suggestions
    try {
      setLoadingSuggestions(true);
      const suggs = await api.get<TeacherSuggestion[]>(
        `/api/timetable/substitutions/suggest-teachers?classId=${period.classId}&section=${period.sectionName}&periodNo=${period.periodNo}&subjectId=${period.subjectId}&date=${selectedDate}`
      );
      setSuggestions(suggs);
    } catch (e) {
      console.error('Failed to load suggestions', e);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSaveSubstitution = async () => {
    if (!selectedPeriod || !selectedSubstitute) {
      setError('Please select a substitute teacher');
      return;
    }

    try {
      const payload = {
        date: selectedDate,
        classId: selectedPeriod.classId,
        section: selectedPeriod.sectionName,
        periodNo: selectedPeriod.periodNo,
        originalTeacherId: selectedTeacher,
        substituteTeacherId: selectedSubstitute,
        reason: reason || 'Teacher on leave',
        notes: notes || null
      };

      await api.post('/api/timetable/substitutions', payload);
      setSuccess('Substitution created successfully');
      setDialogOpen(false);
      await loadSubstitutions();
      await handleTeacherSelect(Number(selectedTeacher));
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create substitution');
    }
  };

  const handleDeleteSubstitution = async (id: number) => {
    if (!confirm('Are you sure you want to delete this substitution?')) return;

    try {
      await api.delete(`/api/timetable/substitutions/${id}`);
      setSuccess('Substitution deleted successfully');
      await loadSubstitutions();
      if (selectedTeacher) {
        await handleTeacherSelect(Number(selectedTeacher));
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to delete substitution');
    }
  };

  const getSelectedSuggestion = () => {
    return suggestions.find((s) => s.teacherId === selectedSubstitute);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Teacher Substitutions
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Manage temporary teacher replacements when a teacher is absent. The system suggests eligible substitute teachers prioritized by workload.
      </Alert>

      {/* Date and Teacher Selection */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          type="date"
          label="Date"
          size="small"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 300 }}>
          <InputLabel>Absent Teacher</InputLabel>
          <Select
            value={selectedTeacher}
            label="Absent Teacher"
            onChange={(e) => handleTeacherSelect(Number(e.target.value))}
          >
            {teachers.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Affected Periods */}
      {selectedTeacher && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Affected Periods
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : affectedPeriods.length === 0 ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              No classes scheduled for this teacher on this date.
            </Alert>
          ) : (
            <TableContainer sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {affectedPeriods.map((period, idx) => {
                    const hasSubstitution = substitutions.some(
                      (s) =>
                        s.classId === period.classId &&
                        s.sectionId === period.sectionId &&
                        s.periodNo === period.periodNo
                    );

                    return (
                      <TableRow key={idx}>
                        <TableCell>{period.timeSlot}</TableCell>
                        <TableCell>{period.periodNo}</TableCell>
                        <TableCell>{period.className}</TableCell>
                        <TableCell>{period.sectionName}</TableCell>
                        <TableCell>
                          {period.subjectCode} - {period.subjectName}
                        </TableCell>
                        <TableCell align="center">
                          {hasSubstitution ? (
                            <Chip
                              label="Covered"
                              color="success"
                              size="small"
                              icon={<CheckCircleIcon />}
                            />
                          ) : (
                            <Chip label="Needs Cover" color="warning" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {!hasSubstitution && (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => handleAddSubstitution(period)}
                            >
                              Assign
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Existing Substitutions */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
        Substitutions for {new Date(selectedDate).toLocaleDateString()}
      </Typography>

      {substitutions.length === 0 ? (
        <Alert severity="info">No substitutions recorded for this date.</Alert>
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
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {substitutions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.periodNo}</TableCell>
                  <TableCell>
                    {sub.className} - {sub.sectionName}
                  </TableCell>
                  <TableCell>
                    {sub.subjectCode} - {sub.subjectName}
                  </TableCell>
                  <TableCell>{sub.originalTeacherName}</TableCell>
                  <TableCell>{sub.substituteTeacherName}</TableCell>
                  <TableCell>{sub.reason}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleDeleteSubstitution(sub.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Assign Substitution Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Assign Substitute Teacher</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedPeriod && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Period:</strong> {selectedPeriod.periodNo} ({selectedPeriod.timeSlot})
              </Typography>
              <Typography variant="body2">
                <strong>Class:</strong> {selectedPeriod.className} - {selectedPeriod.sectionName}
              </Typography>
              <Typography variant="body2">
                <strong>Subject:</strong> {selectedPeriod.subjectCode} - {selectedPeriod.subjectName}
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
                  {suggestions.map((s) => (
                    <MenuItem key={s.teacherId} value={s.teacherId}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <span>
                          {s.teacherName} ({s.department})
                        </span>
                        <Chip
                          label={`${s.currentDayLoad}/${s.maxDayLoad} periods`}
                          size="small"
                          color={s.isOverloaded ? 'warning' : 'success'}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {getSelectedSuggestion()?.warningMessage && (
                <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
                  {getSelectedSuggestion()?.warningMessage}
                </Alert>
              )}

              {suggestions.length === 0 && !loadingSuggestions && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  No eligible substitute teachers found. All teachers who teach this subject are either busy or overloaded.
                </Alert>
              )}

              <TextField
                label="Reason"
                size="small"
                fullWidth
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Sick leave, Personal leave"
                sx={{ mb: 2 }}
              />

              <TextField
                label="Notes (Optional)"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSubstitution} disabled={!selectedSubstitute}>
            Assign
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
