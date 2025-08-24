import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, Alert, Autocomplete, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';
import { libraryService, BookIssue, Book } from '../../services/libraryService';
import { studentService, Student } from '../../services/studentService';
import { staffService, StaffMember } from '../../services/staffService';

type Props = {
  open: boolean;
  onClose: () => void;
  onCompleted?: () => void;
};

const IssueReturnDialog: React.FC<Props> = ({ open, onClose, onCompleted }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState<Partial<BookIssue>>({ status: 'Issued', issueType: 'Student', issueDate: dayjs().format('YYYY-MM-DD') });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleOptions, setPeopleOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [selectedPerson, setSelectedPerson] = useState<{ label: string; value: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    libraryService.getBooksByStatus('Available').then(res => setBooks(res));
    // Load initial people list for default type
    loadPeople('Student');
  }, [open]);

  const availableByTitle = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of books) {
      const key = (b.title || '').trim().toLowerCase();
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [books]);

  const loadPeople = async (type: 'Student' | 'Staff') => {
    setPeopleLoading(true);
    try {
      if (type === 'Student') {
        const students = await studentService.getAllStudents();
        setPeopleOptions(
          students.map((s: Student) => ({
            label: `${s.name}${s.studentId ? ` (${s.studentId})` : ''}`,
            value: s.studentId || String(s.id || '')
          }))
        );
      } else {
        const staff = await staffService.getAll();
        setPeopleOptions(
          staff.map((m: StaffMember) => ({
            label: `${(m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim())}${m.staffId ? ` (${m.staffId})` : m.id ? ` (ID:${m.id})` : ''}`,
            value: m.staffId || String(m.id || '')
          }))
        );
      }
    } catch (e) {
      console.warn('Failed to load people list', e);
      setPeopleOptions([]);
    } finally {
      setPeopleLoading(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'issueType') {
      // Reset selection and reload people list when type changes
      setSelectedPerson(null);
      setForm(prev => ({ ...prev, issuedTo: undefined }));
      loadPeople(value as 'Student' | 'Staff');
    }
  };

  const handleIssue = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload: BookIssue = {
        id: undefined,
        bookId: Number(form.bookId),
        // Send identifier value (studentId or employee numeric id as string)
        issuedTo: String(form.issuedTo || selectedPerson?.value || ''),
        issueType: String(form.issueType || 'Student'),
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        status: 'Issued'
      };
      await libraryService.issueBook(payload);
      onCompleted?.();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Issue failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Issue Book</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField select fullWidth label="Book" name="bookId" value={form.bookId || ''} onChange={onChange}>
              {books.map(b => {
                const count = availableByTitle.get((b.title || '').trim().toLowerCase()) || 1;
                return (
                  <MenuItem key={b.id} value={b.id}>
                    {b.title} — {b.author} {`(Available copies: ${count})`}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              value={selectedPerson}
              onChange={(_, newValue) => {
                setSelectedPerson(newValue);
                setForm(prev => ({ ...prev, issuedTo: newValue?.value }));
              }}
              options={peopleOptions}
              loading={peopleLoading}
              isOptionEqualToValue={(opt, val) => opt.value === val.value}
              getOptionLabel={(opt) => opt?.label || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Issued To"
                  placeholder="Type to filter by name"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {peopleLoading ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Type" name="issueType" value={form.issueType || 'Student'} onChange={onChange}>
              <MenuItem value="Student">Student</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              fullWidth
              label="Issue Date"
              name="issueDate"
              value={form.issueDate || ''}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              fullWidth
              label="Due Date"
              name="dueDate"
              value={form.dueDate || ''}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              helperText={!form.dueDate ? 'Leave blank to auto-calc (5 working days)' : ' '}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleIssue} disabled={submitting || !form.bookId || !form.issuedTo}>Issue</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssueReturnDialog;
