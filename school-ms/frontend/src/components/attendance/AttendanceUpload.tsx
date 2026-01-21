import {
    Check,
    CloudUpload,
    Error,
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
    FormControlLabel,
    Grid,
    Link,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useApiMutation } from '../../hooks/useApi';
import { employeeAttendanceService, BulkAttendanceRequest, EmployeeAttendanceStatus } from '../../services/employeeAttendanceService';
import { useApi } from '../../hooks/useApi';
import { staffService } from '../../services/staffService';

const AttendanceUpload: React.FC = () => {
  const { showNotification } = useNotification();
  const [activeStep, setActiveStep] = useState(0);
  
  // Upload mode state
  const [uploadMode, setUploadMode] = useState<'single' | 'weekly'>('single');
  
  // Date selection state
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [weekStartDate, setWeekStartDate] = useState<Dayjs | null>(dayjs().startOf('week'));
  const [weekEndDate, setWeekEndDate] = useState<Dayjs | null>(dayjs().endOf('week'));
  
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

  // Fetch staff data for template generation
  const { data: staffMembers, error: staffError } = useApi(() => {
    return staffService.getAll();
  }, { dependencies: [] });
  
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
      onError: (error: any) => {
        setUploadResult({
          success: false,
          message: error?.message || 'Failed to upload attendance data'
        });
        showNotification(`Upload failed: ${error?.message || 'Unknown error'}`, 'error');
      }
    }
  );

  const { mutateAsync: markBulkAttendance, isLoading: isMarkingBulk } = useApiMutation(
    (bulkRequest: BulkAttendanceRequest) => employeeAttendanceService.markBulkAttendance(bulkRequest),
    {
      onSuccess: (data) => {
        console.log('Successfully marked bulk attendance:', data);
      },
      onError: (error) => {
        console.error('Failed to mark bulk attendance:', error);
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
      onError: (error: any) => {
        showNotification(`Failed to download template: ${error?.message || 'Unknown error'}`, 'error');
      }
    }
  );
  
  // Function to generate and download weekly template
  const generateWeeklyTemplate = () => {
    if (!weekStartDate || !weekEndDate || !staffMembers) {
      showNotification('Missing required data for template generation', 'error');
      return;
    }
    
    try {
      // Generate dates in range
      const start = weekStartDate;
      const end = weekEndDate;
      const daysArray: string[] = [];
      
      let current = start;
      while (current.isBefore(end) || current.isSame(end, 'day')) {
        daysArray.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
      }
      
      // Generate CSV header
      let csvContent = 'EmployeeId,Name,Department,';
      
      // Add date columns
      daysArray.forEach(date => {
        csvContent += `${dayjs(date).format('ddd (MM/DD)')},`;
      });
      
      csvContent += 'Remarks\n';
      
      // Add staff rows
      staffMembers.forEach(staff => {
        const staffId = staff.id || 'N/A';
        const staffName = staff.name || 'Unknown';
        const department = (staff.department?.name || staff.department || 'N/A');
        
        csvContent += `${staffId},${staffName},${department},`;
        
        // Add empty cells for dates
        daysArray.forEach(() => {
          csvContent += ',';
        });
        
        csvContent += '\n';
      });
      
      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const dateRange = `${weekStartDate.format('YYYY-MM-DD')}_to_${weekEndDate.format('YYYY-MM-DD')}`;
      link.setAttribute('download', `weekly_attendance_template_${dateRange}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Weekly template downloaded successfully', 'success');
    } catch (error) {
      console.error('Error generating weekly template:', error);
      showNotification('Failed to generate weekly template', 'error');
    }
  };

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
        // Generate and download weekly template
        if (!weekStartDate || !weekEndDate) {
          showNotification('Please select a valid week range', 'error');
          return;
        }
        
        generateWeeklyTemplate();
      }
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };
  
  // Process weekly upload by breaking it down into daily uploads
  const processWeeklyUpload = async (file: File) => {
    if (!weekStartDate || !weekEndDate || !staffMembers) {
      throw new globalThis.Error('Missing required data for weekly upload');
    }
    
    try {
      setIsProcessing(true);
      
      // Parse dates in the range
      const start = weekStartDate;
      const end = weekEndDate;
      const daysArray = [];
      
      let current = start;
      while (current.isBefore(end) || current.isSame(end, 'day')) {
        daysArray.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
      }
      
      setTotalDays(daysArray.length);
      
      // Read and parse the CSV file
      const fileContent = await file.text();
      const lines = fileContent.split('\\n');
      
      if (lines.length < 2) {
        throw new globalThis.Error('CSV file is empty or has invalid format');
      }
      
      // Parse header to find date columns
      const headers = lines[0].split(',');
      const dateColumnIndices: { [key: string]: number } = {};
      
      for (let i = 3; i < headers.length - 1; i++) {
        // Expected format: "Mon (06/30)" etc.
        const dateCol = headers[i].trim();
        const dateMatch = dateCol.match(/\((\d{2}\/\d{2})\)/);
        
        if (dateMatch && dateMatch[1]) {
          // Convert MM/DD to current year's date
          const [month, day] = dateMatch[1].split('/');
          const fullDate = `${weekStartDate.year()}-${month}-${day}`;
          dateColumnIndices[fullDate] = i;
        }
      }
      
      // Process each day
      const dailyResults = [];
      let totalSuccessRecords = 0;
      
      for (let i = 0; i < daysArray.length; i++) {
        const date = daysArray[i];
        setProcessedDays(i + 1);
        setProgressMessage(`Processing attendance for ${dayjs(date).format('MMM D, YYYY')} (${i + 1}/${daysArray.length})`);
        
        // Skip if we don't have a column for this day
        if (!dateColumnIndices[date]) {
          dailyResults.push({
            date,
            success: false,
            count: 0,
            message: 'No data column found for this date'
          });
          continue;
        }
        
        // Create bulk attendance map for this day
        const attendanceMap: Record<number, EmployeeAttendanceStatus> = {};
        let validEntriesCount = 0;
        
        // Process each employee row
        for (let j = 1; j < lines.length; j++) {
          if (!lines[j].trim()) continue;
          
          const columns = lines[j].split(',');
          const employeeId = parseInt(columns[0]);
          
          if (isNaN(employeeId)) continue;
          
          // Get attendance status for this day
          const statusCode = columns[dateColumnIndices[date]]?.trim().toUpperCase();
          if (!statusCode) continue;
          
          // Map status codes to attendance status
          let status: EmployeeAttendanceStatus;
          switch (statusCode) {
            case 'P':
              status = EmployeeAttendanceStatus.PRESENT;
              break;
            case 'A':
              status = EmployeeAttendanceStatus.ABSENT;
              break;
            case 'H':
              status = EmployeeAttendanceStatus.HALF_DAY;
              break;
            case 'L':
              status = EmployeeAttendanceStatus.ON_LEAVE;
              break;
            default:
              continue; // Skip invalid codes
          }
          
          attendanceMap[employeeId] = status;
          validEntriesCount++;
        }
        
        if (validEntriesCount === 0) {
          dailyResults.push({
            date,
            success: false,
            count: 0,
            message: 'No valid entries found for this date'
          });
          continue;
        }
        
        try {
          // Call the bulk attendance API for this day
          const bulkRequest: BulkAttendanceRequest = {
            attendanceDate: date,
            attendanceMap: attendanceMap,
            remarks: `Uploaded via weekly bulk upload on ${dayjs().format('YYYY-MM-DD')}`
          };
          
          const result = await markBulkAttendance(bulkRequest);
          
          totalSuccessRecords += validEntriesCount;
          dailyResults.push({
            date,
            success: true,
            count: validEntriesCount,
            message: `Successfully processed ${validEntriesCount} records`
          });
        } catch (error: unknown) {
          console.error(`Error processing date ${date}:`, error);
          const err = error as Error;
          const errorMessage = err?.message || 'Unknown error';
          dailyResults.push({
            date,
            success: false,
            count: 0,
            message: `Error: ${errorMessage}`
          });
        }
      }
      
      // Calculate overall success/failure
      const successDays = dailyResults.filter(day => day.success).length;
      
      setUploadResult({
        success: successDays > 0,
        successCount: totalSuccessRecords,
        failureCount: daysArray.length - successDays,
        message: `Processed attendance for ${successDays} out of ${daysArray.length} days`,
        dailyResults
      });
      
      showNotification(
        `Weekly attendance processed: ${successDays}/${daysArray.length} days successful`,
        successDays > 0 ? (successDays === daysArray.length ? 'success' : 'warning') : 'error'
      );
      
    } catch (error: unknown) {
      console.error('Error processing weekly upload:', error);
      const err = error as Error;
      const errorMessage = err?.message || 'Failed to process weekly attendance data';
      const notificationMessage = err?.message || 'Unknown error';
      setUploadResult({
        success: false,
        message: errorMessage
      });
      showNotification(`Weekly upload failed: ${notificationMessage}`, 'error');
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
        await processWeeklyUpload(selectedFile);
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
    setProgressMessage('');
    setIsProcessing(false);
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
                        disabled={isDownloading || 
                          (uploadMode === 'weekly' && (!weekStartDate || !weekEndDate))}
                      >
                        {isDownloading
                          ? 'Downloading...'
                          : `Download ${uploadMode === 'weekly' ? 'Weekly' : ''} Template`
                        }
                      </Button>
                    </Box>
                    
                    {isDownloading && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Downloading {uploadMode === 'weekly' ? 'weekly' : ''} template...
                        </Typography>
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
                      : "Enter data for each teacher in the CSV file"}
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
                L - On Leave
              </Typography>
              
              {uploadMode === 'weekly' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Weekly Upload Format
                  </Typography>
                  <Typography variant="body2">
                    For weekly attendance, each day column should be filled with the status codes listed above.
                    Leave a cell empty if no attendance is recorded for that day.
                  </Typography>
                </Box>
              )}
              
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

