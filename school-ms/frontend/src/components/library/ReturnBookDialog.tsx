import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Alert, Typography, Autocomplete, CircularProgress } from '@mui/material';
import { libraryService, BookIssue } from '../../services/libraryService';

type Props = {
  open: boolean;
  onClose: () => void;
  onCompleted?: () => void;
};

const ReturnBookDialog: React.FC<Props> = ({ open, onClose, onCompleted }) => {
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [issueId, setIssueId] = useState<number | ''>('');
  const [selected, setSelected] = useState<BookIssue | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returnDate, setReturnDate] = useState<string>(new Date().toISOString().slice(0,10));

  const loadIssues = async () => {
    setLoading(true);
    try {
      let res = await libraryService.getActiveBookIssues();
      if (!Array.isArray(res) || res.length === 0) {
        // Fallback: load all and filter client-side for active/issued
        const all = await libraryService.getAllBookIssues();
        res = (all || []).filter((i: BookIssue) => (i.status || '').toLowerCase() === 'issued' || !i.returnDate);
      }
      setIssues(res);
    } catch {
      setIssues([]);
    } finally {
      setSelected(null);
      setIssueId('');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadIssues();
  }, [open]);

  const handleReturn = async () => {
    if (!issueId) return;
    setSubmitting(true);
    setError(null);
    try {
      await libraryService.returnBook(issueId, returnDate);
      onCompleted?.();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Return failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Return Book</DialogTitle>
      <DialogContent sx={{ pt: 2, overflow: 'visible' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={1.5}>
          <Grid item xs={12} sx={{ mt: 1 }}>
            <Autocomplete
              size="small"
              fullWidth
              options={issues}
              value={selected}
              onChange={(e, val) => { setSelected(val); setIssueId(val?.id ?? ''); }}
              getOptionLabel={(i) => i ? `${i.bookTitle || `Book ${i.bookId}`} — ${i.issuedTo} (${i.issueType})` : ''}
              isOptionEqualToValue={(o, v) => !!o && !!v && o.id === v.id}
              disablePortal
              loading={loading}
              filterOptions={(options, state) => {
                const q = state.inputValue.toLowerCase();
                if (!q) return options;
                return options.filter(o => (
                  ((o.bookTitle || `Book ${o.bookId}`).toLowerCase().includes(q)) ||
                  ((o.issuedTo || '').toLowerCase().includes(q))
                ));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Active Issues" placeholder="Type book or name to search" InputLabelProps={{ shrink: true }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          </Grid>
          {selected && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Issued on {selected.issueDate} • Due {selected.dueDate}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              type="date"
              fullWidth
              label="Return Date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleReturn} disabled={submitting || !issueId}>Return</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnBookDialog;
