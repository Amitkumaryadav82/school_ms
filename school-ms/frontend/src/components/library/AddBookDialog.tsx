import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack, Alert } from '@mui/material';
import { libraryService, BookStatus } from '../../services/libraryService';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
};

const AddBookDialog: React.FC<Props> = ({ open, onClose, onAdded }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<BookStatus>(BookStatus.AVAILABLE);
  const [copies, setCopies] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');

  const reset = () => {
    setTitle('');
    setAuthor('');
    setCategory('');
    setStatus(BookStatus.AVAILABLE);
  setSubmitting(false);
    setError('');
    setTitleError('');
  setCopies(1);
  };

  const handleClose = () => {
    if (!submitting) {
      reset();
      onClose();
    }
  };

  const checkTitle = async (val: string) => {
    const t = val.trim();
    if (!t) { setTitleError(''); return false; }
    try {
      const res = await libraryService.titleExists(t);
      const exists = (res as any).exists ?? (res as any).data?.exists;
      if (exists) {
        setTitleError('A book with this title already exists');
        return true;
      }
      setTitleError('');
      return false;
    } catch {
      // do not block on network error
      setTitleError('');
      return false;
    }
  };

  const submit = async () => {
    setError('');
    if (!title.trim() || !author.trim() || !category.trim()) {
      setError('Please fill all required fields');
      return;
    }
    if (!Number.isFinite(copies) || copies < 1 || copies > 1000) {
      setError('Copies must be a number between 1 and 1000');
      return;
    }
    const dup = await checkTitle(title);
    if (dup) return;
    setSubmitting(true);
    try {
  await libraryService.createBook({ title: title.trim(), author: author.trim(), category: category.trim(), status, copies });
      onAdded?.();
      reset();
      onClose();
    } catch (e: any) {
      const msg = e?.message || 'Failed to add book';
      setError(msg);
      if (String(msg).toLowerCase().includes('already exists')) {
        setTitleError('A book with this title already exists');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Book</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
            onBlur={() => checkTitle(title)}
            required
            error={!!titleError}
            helperText={titleError || ' '}
            autoFocus
            fullWidth
            size="small"
      margin="dense"
          />
          <TextField
            label="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            fullWidth
            size="small"
      margin="dense"
            helperText={' '}
          />
          <TextField
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            fullWidth
            size="small"
      margin="dense"
            helperText={' '}
          />
          <TextField
            label="Copies"
            type="number"
            inputProps={{ min: 1, max: 1000, step: 1 }}
            value={copies}
            onChange={(e) => setCopies(parseInt(e.target.value || '1', 10))}
            fullWidth
            size="small"
      margin="dense"
            helperText={' '}
          />
          <TextField
            label="Status"
            select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookStatus)}
            fullWidth
            size="small"
      margin="dense"
            helperText={' '}
          >
            <MenuItem value={BookStatus.AVAILABLE}>Available</MenuItem>
            <MenuItem value={BookStatus.ISSUED}>Issued</MenuItem>
            <MenuItem value={BookStatus.LOST}>Lost</MenuItem>
            <MenuItem value={BookStatus.DAMAGED}>Damaged</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
        <Button onClick={submit} variant="contained" disabled={submitting}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBookDialog;
