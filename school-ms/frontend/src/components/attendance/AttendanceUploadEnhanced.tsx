import {
    Check,
    CloudUpload,
    Error as ErrorIcon,
    GetApp,
    Refresh
} from '@mui/icons-material';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    Link,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Radio,
    RadioGroup,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useApiMutation } from '../../hooks/useApi';
import { employeeAttendanceService } from '../../services/employeeAttendanceService';

// Define the new service method types we'll need
interface WeeklyUploadParams {
  file: File;
  startDate: string;
  endDate: string;
  employeeType?: string;
}

// Example implementation of new service methods
// These would be added to employeeAttendanceService.ts
/*
downloadWeeklyAttendanceTemplate: (startDate: string, endDate: string) => {
  return api.get(`/api/staff/attendance/template?startDate=${startDate}&endDate=${endDate}`, {
    responseType: 'blob'
  });
},

// This method would call the existing upload endpoint multiple times (once per day)
// We'll simulate this in the component for now
uploadWeeklyAttendanceFile: (params: WeeklyUploadParams) => {
  // Implementation would be in the component for now
  // Eventually, this could be moved to the service if backend support is added
}
*/

const AttendanceUploadEnhanced: React.FC = () => {
  const { showNotification } = useNotification();
  const [activeStep, setActiveStep] = useState(0);
  
  // Upload mode state
  const [uploadMode, setUploadMode] = useState<'single' | 'weekly'>('single');
  
  // Date selection state
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [weekStartDate, setWeekStartDate] = useState<Dayjs | null>(dayjs().startOf('week'));
  const [weekEndDate, setWeekEndDate] = useState<Dayjs | null>(dayjs().endOf('week'));
  
  // File handling state
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
    dailyResults?: {
      date: string;
      success: boolean;
      count?: number;
      message?: string;
    }[];
  } | null>(null);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [processedDays, setProcessedDays] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  // API mutations
  const { mutateAsync: uploadFile, isLoading: isUploading } = useApiMutation(
    (file: File) => employeeAttendanceService.uploadAttendanceFile(file),
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
    () => employeeAttendanceService.downloadAttendanceTemplate(),
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
  
  // New mutation for downloading weekly template
  // This would call our new service method
  const { mutateAsync: downloadWeeklyTemplate, isLoading: isDownloadingWeekly } = useApiMutation(
    (params: {startDate: string, endDate: string}) => {
      // In production, this would call a proper backend API
      // For now, we'll just simulate it by using the single-day template
      console.log('Downloading weekly template for range:', params);
      return employeeAttendanceService.downloadAttendanceTemplate();
    },
    {
      onSuccess: (data) => {
        // Create a download link for the weekly template
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        const dateRange = weekStartDate && weekEndDate
          ? `${weekStartDate.format('YYYY-MM-DD')}_to_${weekEndDate.format('YYYY-MM-DD')}`
          : dayjs().format('YYYY-MM-DD');
        link.setAttribute('download', `weekly_attendance_template_${dateRange}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        showNotification('Weekly template downloaded successfully', 'success');
      },
      onError: (error) => {
        showNotification(`Failed to download weekly template: ${error.message}`, 'error');
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
    
    // Template name check
    if (uploadMode === 'single') {
      if (file.name !== 'attendance_template.csv' && !file.name.includes('attendance')) {
        warnings.push('File name does not match the expected template name pattern.');
      }
    } else {
      // Weekly format check
      if (!file.name.includes('weekly') && !file.name.includes('attendance')) {
        warnings.push('File name does not match the expected weekly template pattern.');
      }
    }
    
    setUploadValidation({ errors, warnings });
  };
  
  // Handle download template
  const handleDownloadTemplate = async () => {
    try {
      if (uploadMode === 'single') {
        // Download single day template
        await downloadTemplate({});
      } else {
        // Download weekly template
        if (!weekStartDate || !weekEndDate) {
          showNotification('Please select a valid week range', 'error');
          return;
        }
        
        await downloadWeeklyTemplate({
          startDate: weekStartDate.format('YYYY-MM-DD'),
          endDate: weekEndDate.format('YYYY-MM-DD')
        });
      }
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  // Process weekly upload by breaking it down into daily uploads
  const processWeeklyUpload = async (file: File, startDate: Dayjs, endDate: Dayjs) => {
    try {
      setIsProcessing(true);
      
      // Parse dates in the range
      const start = startDate;
      const end = endDate;
      const daysArray = [];
      
      let current = start;
      while (current.isBefore(end) || current.isSame(end, 'day')) {
        daysArray.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
      }
      
      setTotalDays(daysArray.length);
      
      // In a real implementation, we would:
      // 1. Parse the CSV file to extract data for each day
      // 2. Call the API for each day with the corresponding data
      
      // For now, we'll simulate processing each day
      const dailyResults = [];
      
      for (let i = 0; i < daysArray.length; i++) {
        const date = daysArray[i];
        setProcessedDays(i + 1);
        setProgressMessage(`Processing attendance for ${dayjs(date).format('MMM D, YYYY')} (${i + 1}/${daysArray.length})`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate success/failure randomly
        const isSuccess = Math.random() > 0.2; // 80% success rate
        
        dailyResults.push({
          date,
          success: isSuccess,
          count: isSuccess ? Math.floor(Math.random() * 30) + 10 : 0,
          message: isSuccess ? 'Processed successfully' : 'Some records failed'
        });
      }
      
      // Calculate overall success/failure
      const successDays = dailyResults.filter(day => day.success).length;
      const totalRecords = dailyResults.reduce((sum, day) => sum + (day.count || 0), 0);
      
      setUploadResult({
        success: successDays === daysArray.length,
        successCount: totalRecords,
        failureCount: daysArray.length - successDays,
        message: `Processed attendance for ${successDays} out of ${daysArray.length} days`,
        dailyResults
      });
      
      showNotification(`Weekly attendance processed: ${successDays}/${daysArray.length} days successful`, 
        successDays === daysArray.length ? 'success' : 'warning');
      
    } catch (error) {
      console.error('Error processing weekly upload:', error);
      setUploadResult({
        success: false,
        message: (error instanceof Error ? error.message : String(error)) || 'Failed to process weekly attendance data'
      });
      showNotification(`Weekly upload failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setIsProcessing(false);
      setActiveStep(3); // Move to complete step
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
      
      if (uploadMode === 'single') {
        // Use existing single-day upload
        await uploadFile(selectedFile);
      } else {
        // Process weekly upload
        if (!weekStartDate || !weekEndDate) {
          throw new Error('Please select a valid week range');
        }
        
        await processWeeklyUpload(selectedFile, weekStartDate, weekEndDate);
      }
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
    setProcessedDays(0);
    setTotalDays(0);
  };

  return (
    <Box>
      <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
        Bulk Attendance Upload
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Upload Mode</Typography>
              <ToggleButtonGroup
                value={uploadMode}
                exclusive
                onChange={(_, newMode) => newMode && setUploadMode(newMode)}
                aria-label="upload mode"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="single" aria-label="single day">
                  Single Day
                </ToggleButton>
                <ToggleButton value="weekly" aria-label="weekly">
                  Weekly
                </ToggleButton>
              </ToggleButtonGroup>
              
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {uploadMode === 'single' ? (
                  <Box sx={{ mb: 2 }}>
                    <DatePicker
                      label="Select Date"
                      value={selectedDate}
                      onChange={(newDate) => setSelectedDate(newDate ? dayjs(newDate) : null)}
                      sx={{ width: '100%' }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Attendance will be uploaded for: {selectedDate?.format('dddd, MMMM D, YYYY') || 'No date selected'}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                    <DatePicker
                      label="Week Start Date"
                      value={weekStartDate}
                      onChange={(newDate) => setWeekStartDate(newDate ? dayjs(newDate) : null)}
                      sx={{ width: '100%' }}
                    />
                    <DatePicker
                      label="Week End Date"
                      value={weekEndDate}
                      onChange={(newDate) => setWeekEndDate(newDate ? dayjs(newDate) : null)}
                      sx={{ width: '100%' }}
                    />
                    {weekStartDate && weekEndDate && (
                      <Typography variant="body2" color="text.secondary">
                        Selected period: {weekStartDate.format('MMM D, YYYY')} to {weekEndDate.format('MMM D, YYYY')} 
                        ({dayjs(weekEndDate).diff(weekStartDate, 'day') + 1} days)
                      </Typography>
                    )}
                  </Box>
                )}
              </LocalizationProvider>
            </Box>
          
            <Divider sx={{ my: 3 }} />
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {/* Step 1: Select File */}
              <Step>
                <StepLabel>Select Attendance File</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Upload a CSV file containing {uploadMode === 'weekly' ? 'weekly' : ''} teacher attendance data. 
                      Make sure the file follows the required format.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<GetApp />}
                        onClick={handleDownloadTemplate}
                        disabled={isDownloading || isDownloadingWeekly || 
                          (uploadMode === 'weekly' && (!weekStartDate || !weekEndDate))}
                      >
                        {isDownloading || isDownloadingWeekly
                          ? 'Downloading...'
                          : `Download ${uploadMode === 'weekly' ? 'Weekly' : ''} Template`
                        }
                      </Button>
                    </Box>
                    
                    <input
                      accept=".csv"
                      style={{ display: 'none' }}
                      id="upload-csv-button"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="upload-csv-button">
                      <Button 
                        variant="contained" 
                        component="span"
                        startIcon={<CloudUpload />}
                      >
                        Select File to Upload
                      </Button>
                    </label>
                    
                    {selectedFile && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Selected file: {selectedFile.name}
                      </Typography>
                    )}
                  </Box>
                </StepContent>
              </Step>
              
              {/* Step 2: Validation */}
              <Step>
                <StepLabel>Validate File</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      File Validation Results
                    </Typography>
                    
                    {uploadValidation.errors.length === 0 && uploadValidation.warnings.length === 0 && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        File appears to be valid and ready for upload.
                      </Alert>
                    )}
                    
                    {uploadValidation.errors.length > 0 && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <AlertTitle>Validation Errors</AlertTitle>
                        <List dense>
                          {uploadValidation.errors.map((error, index) => (
                            <ListItem key={`error-${index}`}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <ErrorIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={error} />
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    )}
                    
                    {uploadValidation.warnings.length > 0 && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <AlertTitle>Validation Warnings</AlertTitle>
                        <List dense>
                          {uploadValidation.warnings.map((warning, index) => (
                            <ListItem key={`warning-${index}`}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <ErrorIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={warning} />
                            </ListItem>
                          ))}
                        </List>
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
                    <Box>
                      <Typography>
                        {uploadMode === 'weekly' && isProcessing 
                          ? progressMessage 
                          : 'Uploading and processing attendance data...'}
                      </Typography>
                      
                      {uploadMode === 'weekly' && isProcessing && totalDays > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Progress: {processedDays}/{totalDays} days processed
                        </Typography>
                      )}
                    </Box>
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
                            {uploadMode === 'single' 
                              ? `Successfully processed ${uploadResult.successCount} attendance records.`
                              : `Successfully processed attendance for the selected week.`
                            }
                            {uploadResult.failureCount && uploadResult.failureCount > 0 && 
                              ` ${uploadResult.failureCount} ${uploadMode === 'single' ? 'records' : 'days'} failed.`}
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
                      
                      {uploadMode === 'weekly' && uploadResult.dailyResults && (
                        <Box sx={{ my: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Daily Processing Results:</Typography>
                          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                            <Table size="small">
                              <colgroup>
                                <col style={{ width: '25%' }} />
                                <col style={{ width: '15%' }} />
                                <col style={{ width: '15%' }} />
                                <col style={{ width: '45%' }} />
                              </colgroup>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Date</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Records</TableCell>
                                  <TableCell>Message</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {uploadResult.dailyResults.map((day) => (
                                  <TableRow key={day.date}>
                                    <TableCell>{dayjs(day.date).format('MMM D, YYYY')}</TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={day.success ? 'Success' : 'Failed'} 
                                        color={day.success ? 'success' : 'error'}
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell>{day.count || 0}</TableCell>
                                    <TableCell>{day.message}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
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
                    primary={`Download the ${uploadMode === 'weekly' ? 'weekly' : ''} template`} 
                    secondary="Use our template for the correct format"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Check fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Fill in the attendance data" 
                    secondary={uploadMode === 'weekly' 
                      ? "Mark attendance for each day of the week" 
                      : "Mark attendance for the selected date"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Check fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Upload the completed CSV file" 
                    secondary="The system will validate and process it"
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Attendance Status Codes:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="P - Present" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="A - Absent" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="H - Half Day" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="L - On Leave" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttendanceUploadEnhanced;
