import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { libraryService } from '../../services/libraryService';

interface Props {
  open: boolean;
  onClose: () => void;
  onUploaded?: (summary: any) => void;
}

const BulkUploadDialog: React.FC<Props> = ({ open, onClose, onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await libraryService.uploadBooksCsv(file);
      setResult(res);
      onUploaded?.(res);
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Upload Books (CSV)</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="body2">
            CSV columns expected: title, author, category, status (header row optional).
          </Typography>
          <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
            Choose CSV File
            <input type="file" accept=".csv" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </Button>
          {file && <Typography variant="caption">Selected: {file.name}</Typography>}
          {error && <Alert severity="error">{error}</Alert>}
          {result && (
            <Alert severity="success">
              Uploaded. Summary: {JSON.stringify(result)}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleUpload} disabled={!file || loading} variant="contained">{loading ? 'Uploading…' : 'Upload'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkUploadDialog;
