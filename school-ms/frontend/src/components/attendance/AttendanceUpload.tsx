import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  Checkbox,
  Link
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  CloudUpload,
  GetApp,
  Check,
  Error,
  Description,
  Delete,
  Refresh
} from '@mui/icons-material';
import { useApiMutation } from '../../hooks/useApi';
import { teacherAttendanceService } from '../../services/teacherAttendanceService';
import { useNotification } from '../../context/NotificationContext';

const AttendanceUpload: React.FC = () => {
  const { showNotification } = useNotification();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadValidation, setUploadValidation] = useState<{ errors: string[], warnings: string[] }>({
    errors: [],
    warnings: []
  });
  const [skipValidation, setSkipValidation] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    successCount?: number;
    failureCount?: number;
    message?: string;
  } | null>(null);

  // API mutations
  const { mutateAsync: uploadFile, isLoading: isUploading } = useApiMutation(
    (file: File) => teacherAttendanceService.uploadAttendanceFile(file),
    {
      onSuccess: (data) => {
        setUploadResult({
          success: true,
          successCount: data.successCount || 0,
          failureCount: data.failureCount || 0,
          message: 'File uploaded and processed successfully'
        });
        showNotification('Attendance data uploaded successfully', 'success');
        setActiveStep(3); // Move to success step
      },
      onError: (error) => {
        setUploadResult({
          success: false,
          message: error.message || 'Failed to upload attendance data'
        });
        showNotification(`Upload failed: ${error.message}`, 'error');
      }
    }
  );

  const { mutateAsync: downloadTemplate, isLoading: isDownloading } = useApiMutation(
    () => teacherAttendanceService.downloadAttendanceTemplate(),
    {
      onSuccess: (data) => {
        // Create a download link for the template
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `attendance_template_${dayjs().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        showNotification('Template downloaded successfully', 'success');
      },
      onError: (error) => {
        showNotification(`Failed to download template: ${error.message}`, 'error');
      }
    }
  );

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // Validate file type (CSV only)
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        showNotification('Please upload a CSV file', 'error');
        return;
      }
      
      setSelectedFile(file);
      
      // Perform basic validation
      validateFile(file);
      
      // Move to next step
      setActiveStep(1);
    }
  };

  // Validate the uploaded file
  const validateFile = (file: File) => {
    // This would be a more comprehensive validation in a real implementation
    // Here we're just simulating validation results
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // File size check
    if (file.size > 5 * 1024 * 1024) {
      warnings.push('File size exceeds 5MB. Large files may take longer to process.');
    }
    
    // For demonstration purposes, let's add some example validations
    if (file.name !== 'attendance_template.csv' && !file.name.includes('attendance')) {
      warnings.push('File name does not match the expected template name pattern.');
    }
    
  setUploadValidation({ errors, warnings });
  };  // Handle download template
  const handleDownloadTemplate = async () => {
    try {
      // Pass empty params object to satisfy the API mutation parameter requirement
      await downloadTemplate({});
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      showNotification('Please select a file to upload', 'error');
      return;
    }
    
    // Check if there are validation errors and if we should proceed
    if (uploadValidation.errors.length > 0 && !skipValidation) {
      showNotification('Please fix validation errors or check "Skip validation"', 'error');
      return;
    }
    
    try {
      setActiveStep(2); // Move to uploading step
      await uploadFile(selectedFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      setActiveStep(1); // Move back to validation step
    }
  };

  // Reset the upload process
  const handleReset = () => {
    setSelectedFile(null);
    setUploadValidation({ errors: [], warnings: [] });
    setSkipValidation(false);
    setUploadResult(null);
    setActiveStep(0);
  };

  return (
    <Box>
      <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
        Bulk Attendance Upload
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {/* Step 1: Select File */}
              <Step>
                <StepLabel>Select Attendance File</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Upload a CSV file containing teacher attendance data. Make sure the file 
                      follows the required format.
                    </Typography>
                    
                    <LocalizationProvider dateAdapter={AdapterDayjs}>                      <DatePicker
                        label="Attendance Date"
                        value={selectedDate}
                        onChange={(newDate) => newDate && setSelectedDate(dayjs(newDate as any))}
                        sx={{ width: '100%', mb: 2 }}
                      />
                    </LocalizationProvider>
                    
                    <input
                      type="file"
                      accept=".csv"
                      id="attendance-file-input"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        component="label"
                        htmlFor="attendance-file-input"
                        startIcon={<CloudUpload />}
                      >
                        Select File
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<GetApp />}
                        onClick={handleDownloadTemplate}
                        disabled={isDownloading}
                      >
                        Download Template
                      </Button>
                    </Box>
                    
                    {isDownloading && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography variant="body2">Downloading template...</Typography>
                      </Box>
                    )}
                  </Box>
                </StepContent>
              </Step>
              
              {/* Step 2: Validate File */}
              <Step>
                <StepLabel>Validate</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Selected File: <strong>{selectedFile?.name}</strong>
                    </Typography>
                    
                    {uploadValidation.errors.length > 0 && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <AlertTitle>Validation Errors</AlertTitle>
                        <List dense>
                          {uploadValidation.errors.map((error, index) => (
                            <ListItem key={index}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <Error fontSize="small" color="error" />
                              </ListItemIcon>
                              <ListItemText primary={error} />
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    )}
                    
                    {uploadValidation.warnings.length > 0 && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <AlertTitle>Warnings</AlertTitle>
                        <List dense>
                          {uploadValidation.warnings.map((warning, index) => (
                            <ListItem key={index}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <Error fontSize="small" color="warning" />
                              </ListItemIcon>
                              <ListItemText primary={warning} />
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    )}
                    
                    {uploadValidation.errors.length === 0 && uploadValidation.warnings.length === 0 && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <AlertTitle>File Validated</AlertTitle>
                        The file has passed all validation checks and is ready to upload.
                      </Alert>
                    )}
                    
                    {uploadValidation.errors.length > 0 && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={skipValidation}
                            onChange={(e) => setSkipValidation(e.target.checked)}
                          />
                        }
                        label="Skip validation and upload anyway"
                      />
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={uploadValidation.errors.length > 0 && !skipValidation}
                      >
                        Upload
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveStep(0)}
                      >
                        Back
                      </Button>
                    </Box>
                  </Box>
                </StepContent>
              </Step>
              
              {/* Step 3: Uploading */}
              <Step>
                <StepLabel>Uploading</StepLabel>
                <StepContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography>
                      Uploading and processing attendance data...
                    </Typography>
                  </Box>
                </StepContent>
              </Step>
              
              {/* Step 4: Complete */}
              <Step>
                <StepLabel>Complete</StepLabel>
                <StepContent>
                  {uploadResult && (
                    <Box sx={{ mb: 2 }}>
                      {uploadResult.success ? (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          <AlertTitle>Upload Successful</AlertTitle>
                          <Typography variant="body2">
                            Successfully processed {uploadResult.successCount} attendance records.
                            {uploadResult.failureCount && uploadResult.failureCount > 0 && 
                              ` ${uploadResult.failureCount} records failed.`}
                          </Typography>
                        </Alert>
                      ) : (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          <AlertTitle>Upload Failed</AlertTitle>
                          <Typography variant="body2">
                            {uploadResult.message || 'An error occurred during the upload.'}
                          </Typography>
                        </Alert>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<Refresh />}
                          onClick={handleReset}
                        >
                          Upload Another File
                        </Button>
                      </Box>
                    </Box>
                  )}
                </StepContent>
              </Step>
            </Stepper>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Instructions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Check fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Download the template CSV file" 
                    secondary="Use our template for the correct format"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Check fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Fill in the attendance data" 
                    secondary="Enter data for each teacher in the CSV file"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Check fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Upload the completed file" 
                    secondary="Upload the file and validate the data"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Check fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Review and confirm" 
                    secondary="Verify the upload results"
                  />
                </ListItem>
              </List>
              
              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                Valid attendance status codes:
              </Typography>
              <Typography variant="body2">
                P - Present<br />
                A - Absent<br />
                H - Half Day<br />
                L - On Leave<br />
                HD - Holiday
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Need help? Check the <Link href="#" underline="hover">documentation</Link> or 
                contact system administrator.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttendanceUpload;
// Remove this unused and erroneous function, as showNotification is already provided by useNotification context.

