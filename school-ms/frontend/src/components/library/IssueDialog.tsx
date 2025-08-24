import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid } from '@mui/material';
import dayjs from 'dayjs';
import { Book, BookIssue, libraryService } from '../../services/libraryService';

interface Props {
  open: boolean;
  onClose: () => void;
  book?: Book | null;
  onIssued?: (issue: BookIssue) => void;
}

const IssueDialog: React.FC<Props> = ({ open, onClose, book, onIssued }) => {
  const [issuedTo, setIssuedTo] = useState('');
  const [issueType, setIssueType] = useState<'Student' | 'Staff'>('Student');
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    if (!open) {
      setIssuedTo('');
      setIssueType('Student');
    }
  }, [open]);

  const handleIssue = async () => {
    if (!book?.id || !issuedTo) return;
    const payload: BookIssue = {
      bookId: book.id,
      issuedTo,
      issueType,
      status: 'Issued'
    } as BookIssue;
    setIssuing(true);
    try {
      const created = await libraryService.issueBook(payload);
      onIssued?.(created);
      onClose();
    } finally {
      setIssuing(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Issue Book</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="Book" value={book?.title || ''} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth select label="Issue To" value={issueType} onChange={(e) => setIssueType(e.target.value as any)}>
              <MenuItem value="Student">Student</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label={issueType === 'Student' ? 'Student ID' : 'Staff ID'} value={issuedTo} onChange={(e) => setIssuedTo(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Issue Date" value={dayjs().format('YYYY-MM-DD')} disabled />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleIssue} disabled={!issuedTo || issuing}>Issue</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssueDialog;
