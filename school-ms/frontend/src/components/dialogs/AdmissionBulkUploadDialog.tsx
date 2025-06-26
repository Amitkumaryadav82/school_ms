import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ErrorIcon from '@mui/icons-material/Error';
import GetAppIcon from '@mui/icons-material/GetApp';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Paper,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { AdmissionApplication, admissionService } from '../../services/admissionService';

interface AdmissionBulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (admissions: AdmissionApplication[]) => void;
}

const AdmissionBulkUploadDialog: React.FC<AdmissionBulkUploadDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResults, setUploadResults] = useState<AdmissionApplication[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Successful and failed uploads
  const successfulUploads = uploadResults.filter(result => !result.status.toString().includes('Error'));
  const failedUploads = uploadResults.filter(result => result.status.toString().includes('Error'));

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      
      // Check if file is CSV
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        setError('Please upload a CSV file.');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await admissionService.downloadCsvTemplate();
    } catch (error) {
      setError('Failed to download template. Please try again.');
      console.error('Template download error:', error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const results = await admissionService.uploadCsv(file);
      setUploadResults(results);
      setShowResults(true);
      
      // Only call success if there are successful uploads
      if (results.filter(r => !r.status.toString().includes('Error')).length > 0) {
        onSuccess(results.filter(r => !r.status.toString().includes('Error')));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setUploadResults([]);
    setShowResults(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Bulk Upload Admission Applications</DialogTitle>
      <DialogContent>
        {!showResults ? (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Instructions</AlertTitle>
              <Typography variant="body2">
                Upload a CSV file containing multiple admission applications. 
                Please ensure your CSV file follows the required format.
              </Typography>
              <Button
                startIcon={<GetAppIcon />}
                onClick={handleDownloadTemplate}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Download Template
              </Button>
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <input
                type="file"
                accept=".csv"
                id="csv-upload-input"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="csv-upload-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={loading}
                >
                  Select CSV File
                </Button>
              </label>
              {file && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {file.name}
                </Typography>
              )}
              <Tooltip title="Use the template provided to ensure your data is formatted correctly.">
                <IconButton sx={{ ml: 1 }}>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {loading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
              </Box>
            )}
          </>
        ) : (
          <Box>
            <Alert 
              severity={failedUploads.length > 0 ? (successfulUploads.length > 0 ? "warning" : "error") : "success"}
              sx={{ mb: 2 }}
            >
              <AlertTitle>
                {failedUploads.length === 0 
                  ? "Upload Successful" 
                  : (successfulUploads.length > 0 
                    ? "Partially Successful" 
                    : "Upload Failed")}
              </AlertTitle>
              Successfully uploaded {successfulUploads.length} out of {uploadResults.length} records.
              {failedUploads.length > 0 && ` ${failedUploads.length} records failed to upload.`}
            </Alert>
            
            {successfulUploads.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Successfully uploaded applications ({successfulUploads.length})
                </Typography>
                <Paper variant="outlined" sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                  <List dense>
                    {successfulUploads.map((result, index) => (
                      <ListItem key={index} secondaryAction={
                        <CheckCircleIcon color="success" fontSize="small" />
                      }>
                        <ListItemText 
                          primary={result.studentName} 
                          secondary={`Grade: ${result.gradeApplying}, Email: ${result.email}`} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </>
            )}
            
            {failedUploads.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, color: 'error.main' }}>
                  Failed uploads ({failedUploads.length})
                </Typography>
                <Paper variant="outlined" sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                  <List dense>
                    {failedUploads.map((result, index) => (
                      <ListItem key={index} secondaryAction={
                        <ErrorIcon color="error" fontSize="small" />
                      }>
                        <ListItemText 
                          primary={result.studentName || 'Unknown'} 
                          secondary={result.status} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!showResults ? (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              variant="contained" 
              disabled={!file || loading}
              startIcon={<CloudUploadIcon />}
            >
              Upload
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AdmissionBulkUploadDialog;
