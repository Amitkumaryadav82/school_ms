import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, LinearProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { libraryService } from '../../services/libraryService';

type Props = {
  open: boolean;
  onClose: () => void;
  onUploaded?: (summary: Record<string, any>) => void;
};

const sampleCsv = `title,author,category,status,copies\nThe Pragmatic Programmer,Andrew Hunt,Programming,Available,3\nClean Code,Robert C. Martin,Programming,Available,2`;

const BulkBookUploadDialog: React.FC<Props> = ({ open, onClose, onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, any> | null>(null);

  const onSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a CSV file.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const summary = await libraryService.uploadBooksCsv(file);
      setResult(summary as any);
      onUploaded?.(summary as any);
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'books-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Bulk Upload Books (CSV)</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 1 }}>
          CSV columns: title, author, category, status, copies (status optional; defaults to Available, copies optional; defaults to 1)
        </Typography>
        <Button startIcon={<DownloadIcon />} size="small" onClick={downloadTemplate} sx={{ mb: 2 }}>
          Download template
        </Button>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>Select CSV
            <input type="file" accept=".csv" hidden onChange={onSelect} />
          </Button>
          <Typography variant="body2">{file?.name || 'No file chosen'}</Typography>
        </Box>
        {uploading && <LinearProgress sx={{ mt: 2 }} />}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {result && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Uploaded: created {String(result.created || 0)}, updated {String(result.updated || 0)}, skipped {String(result.skipped || 0)}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={handleUpload} disabled={uploading || !file}>Upload</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkBookUploadDialog;
