import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import { Student } from '../../services/studentService';
import { parse } from 'papaparse';

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

  const handleCsvChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvData(event.target.value);
    setParseStatus('initial');
    setParsedStudents([]);
    setValidationErrors([]);
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
    } catch (error) {
      console.error('Failed to submit students:', error);
    }
  };

  const handleSampleData = () => {
    setCsvData(SAMPLE_CSV);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Bulk Student Upload</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Paste your CSV data below or upload a CSV file to add multiple students at once.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Required fields: Student ID, Name, Grade, Email, and Phone Number
          </Typography>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleSampleData}
          >
            Show Sample Format
          </Button>
        </Box>

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
            Parse CSV
          </Button>
        </Box>

        {parseStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <AlertTitle>CSV Successfully Parsed</AlertTitle>
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
        >
          {loading ? <CircularProgress size={24} /> : 'Import Students'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkStudentUploadDialog;