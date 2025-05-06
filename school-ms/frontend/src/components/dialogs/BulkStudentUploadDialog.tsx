import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle,
  Divider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { Student } from '../../services/studentService';
import { parse } from 'papaparse';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import * as XLSX from 'xlsx';

interface BulkStudentUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (students: Student[]) => Promise<void>;
  loading: boolean;
}

interface StudentValidationError {
  index: number;
  field: string;
  message: string;
}

const REQUIRED_FIELDS = ['studentId', 'name', 'email', 'grade', 'phoneNumber'];
const SAMPLE_CSV = `studentId,name,grade,section,email,phoneNumber,dateOfBirth,gender,address,parentName,parentEmail,parentPhone
S001,John Smith,9,A,john.smith@example.com,1234567890,2010-05-15,MALE,123 Main St,Robert Smith,robert.smith@example.com,9876543210
S002,Jane Doe,9,A,jane.doe@example.com,0987654321,2010-03-20,FEMALE,456 Oak Ave,Mary Doe,mary.doe@example.com,1234567890`;

const BulkStudentUploadDialog: React.FC<BulkStudentUploadDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading
}) => {
  const [csvData, setCsvData] = useState<string>('');
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [validationErrors, setValidationErrors] = useState<StudentValidationError[]>([]);
  const [parseStatus, setParseStatus] = useState<'initial' | 'success' | 'error'>('initial');
  const [fileName, setFileName] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCsvChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvData(event.target.value);
    setParseStatus('initial');
    setParsedStudents([]);
    setValidationErrors([]);
    setFileName('');
  };

  const validateStudent = (student: any, index: number): StudentValidationError[] => {
    const errors: StudentValidationError[] = [];

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!student[field]) {
        errors.push({
          index,
          field,
          message: `Missing required field: ${field}`
        });
      }
    });

    // Validate email format
    if (student.email && !/^\S+@\S+\.\S+$/.test(student.email)) {
      errors.push({
        index,
        field: 'email',
        message: 'Invalid email format'
      });
    }

    return errors;
  };

  const handleParseCSV = () => {
    try {
      const result = parse(csvData, { header: true, skipEmptyLines: true });
      
      if (result.errors.length > 0) {
        setValidationErrors(result.errors.map((error, index) => ({
          index,
          field: 'csv',
          message: error.message
        })));
        setParseStatus('error');
        return;
      }

      const students = result.data as Student[];
      const allErrors: StudentValidationError[] = [];
      
      students.forEach((student, index) => {
        const studentErrors = validateStudent(student, index);
        allErrors.push(...studentErrors);
      });

      if (allErrors.length > 0) {
        setValidationErrors(allErrors);
        setParseStatus('error');
      } else {
        setParsedStudents(students);
        setParseStatus('success');
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setValidationErrors([{
        index: 0,
        field: 'csv',
        message: 'Failed to parse CSV: ' + (error instanceof Error ? error.message : String(error))
      }]);
      setParseStatus('error');
    }
  };

  const handleSubmit = async () => {
    if (parsedStudents.length === 0 || parseStatus !== 'success') {
      return;
    }
    
    try {
      await onSubmit(parsedStudents);
      // Reset form after successful submission
      setCsvData('');
      setParsedStudents([]);
      setParseStatus('initial');
      setFileName('');
    } catch (error) {
      console.error('Failed to submit students:', error);
    }
  };

  const handleSampleDownload = () => {
    // Create a Blob from the CSV string
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    
    // Create an invisible anchor element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'student_upload_template.csv');
    
    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = e.target?.result;
      
      try {
        // Handle Excel files (xlsx, xls)
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to CSV
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          setCsvData(csv);
        } 
        // Handle CSV files directly
        else if (file.name.endsWith('.csv')) {
          setCsvData(data as string);
        }
        else {
          throw new Error('Unsupported file format. Please use CSV, XLSX, or XLS files.');
        }
        
        // Reset states
        setParseStatus('initial');
        setParsedStudents([]);
        setValidationErrors([]);
      } catch (error) {
        console.error('Error reading file:', error);
        setValidationErrors([{
          index: 0,
          field: 'file',
          message: 'Failed to read file: ' + (error instanceof Error ? error.message : String(error))
        }]);
        setParseStatus('error');
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
    
    // Reset the input to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Bulk Student Upload</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Upload your CSV/Excel file or paste CSV data below to add multiple students at once.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Required fields: Student ID, Name, Grade, Email, and Phone Number
          </Typography>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Tooltip title="Download sample CSV template">
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleSampleDownload}
              startIcon={<DownloadIcon />}
            >
              Download Template
            </Button>
          </Tooltip>
          
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <Tooltip title="Upload CSV or Excel file">
            <Button
              variant="contained"
              size="small"
              onClick={handleFileUpload}
              startIcon={<FileUploadIcon />}
              color="primary"
            >
              Upload File
            </Button>
          </Tooltip>
        </Box>
        
        {fileName && (
          <Alert severity="info" sx={{ mb: 2 }}>
            File loaded: {fileName}
          </Alert>
        )}

        <TextField
          label="CSV Data"
          multiline
          rows={10}
          value={csvData}
          onChange={handleCsvChange}
          fullWidth
          variant="outlined"
          placeholder="studentId,name,grade,section,email,phoneNumber,dateOfBirth,gender,address,parentName,parentEmail,parentPhone"
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleParseCSV}
            disabled={!csvData.trim() || loading}
          >
            Parse Data
          </Button>
        </Box>

        {parseStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <AlertTitle>Data Successfully Parsed</AlertTitle>
            Found {parsedStudents.length} valid student records ready to be imported.
          </Alert>
        )}

        {parseStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Validation Errors</AlertTitle>
            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
              {validationErrors.map((error, index) => (
                <li key={index}>
                  {`Row ${error.index + 1}, ${error.field}: ${error.message}`}
                </li>
              ))}
            </Box>
          </Alert>
        )}

        {parsedStudents.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mt: 2, maxHeight: '200px', overflow: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom>
              Preview of Parsed Data ({parsedStudents.length} students)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {parsedStudents.slice(0, 5).map((student, index) => (
              <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'background.paper' }}>
                <Typography variant="body2">
                  <strong>ID:</strong> {student.studentId}, 
                  <strong> Name:</strong> {student.name}, 
                  <strong> Grade:</strong> {student.grade}{student.section ? `-${student.section}` : ''}, 
                  <strong> Email:</strong> {student.email}
                </Typography>
              </Box>
            ))}
            {parsedStudents.length > 5 && (
              <Chip 
                label={`${parsedStudents.length - 5} more students`} 
                size="small" 
                sx={{ mt: 1 }} 
              />
            )}
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          disabled={parsedStudents.length === 0 || parseStatus !== 'success' || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          {loading ? 'Importing...' : 'Import Students'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkStudentUploadDialog;