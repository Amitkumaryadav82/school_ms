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
import { StaffMember } from '../../services/staffService';
import { parse } from 'papaparse';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import * as XLSX from 'xlsx';

interface BulkStaffUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (staffMembers: StaffMember[]) => Promise<void>;
  loading: boolean;
}

interface StaffValidationError {
  index: number;
  field: string;
  message: string;
}

const REQUIRED_FIELDS = ['staffId', 'firstName', 'lastName', 'email', 'phoneNumber', 'role', 'joinDate'];
const SAMPLE_CSV = `staffId,firstName,lastName,email,phoneNumber,role,joinDate,address,dateOfBirth,gender,qualifications,emergencyContact,bloodGroup,isActive
EMP001,John,Smith,john.smith@example.com,1234567890,Teacher,2022-05-15,123 Main St,1985-03-20,MALE,B.Ed in Mathematics,9876543210,A+,true
EMP002,Jane,Doe,jane.doe@example.com,9876543210,Librarian,2021-06-10,456 Elm St,1990-07-12,FEMALE,Master in Library Science,1234567890,O+,true
EMP003,Robert,Johnson,robert.johnson@example.com,5551234567,Admin Officer,2020-03-15,789 Oak Ave,1982-11-30,MALE,MBA,7778889999,B-,true`;

const BulkStaffUploadDialog: React.FC<BulkStaffUploadDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading
}) => {
  const [csvData, setCsvData] = useState<string>('');
  const [parsedStaff, setParsedStaff] = useState<StaffMember[]>([]);
  const [validationErrors, setValidationErrors] = useState<StaffValidationError[]>([]);
  const [parseStatus, setParseStatus] = useState<'initial' | 'success' | 'error'>('initial');
  const [fileName, setFileName] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCsvChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvData(event.target.value);
    setParseStatus('initial');
    setParsedStaff([]);
    setValidationErrors([]);
    setFileName('');
  };

  const validateStaffMember = (staff: any, index: number): StaffValidationError[] => {
    const errors: StaffValidationError[] = [];

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!staff[field]) {
        errors.push({
          index,
          field,
          message: `Missing required field: ${field}`
        });
      }
    });

    // Validate email format
    if (staff.email && !/^\S+@\S+\.\S+$/.test(staff.email)) {
      errors.push({
        index,
        field: 'email',
        message: 'Invalid email format'
      });
    }

    // Validate role (must be one of the predefined roles)
    const validRoles = ['Teacher', 'Principal', 'Admin Officer', 'Management', 'Account Officer', 'Librarian'];
    if (staff.role && !validRoles.includes(staff.role)) {
      errors.push({
        index,
        field: 'role',
        message: `Invalid role: ${staff.role}. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Validate date format for joinDate
    if (staff.joinDate && !/^\d{4}-\d{2}-\d{2}$/.test(staff.joinDate)) {
      errors.push({
        index,
        field: 'joinDate',
        message: 'Invalid date format for joinDate. Use YYYY-MM-DD'
      });
    }

    // Validate date format for dateOfBirth if provided
    if (staff.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(staff.dateOfBirth)) {
      errors.push({
        index,
        field: 'dateOfBirth',
        message: 'Invalid date format for dateOfBirth. Use YYYY-MM-DD'
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

      const staffMembers = result.data as StaffMember[];
      const allErrors: StaffValidationError[] = [];
      
      staffMembers.forEach((staff, index) => {
        const staffErrors = validateStaffMember(staff, index);
        allErrors.push(...staffErrors);
      });

      if (allErrors.length > 0) {
        setValidationErrors(allErrors);
        setParseStatus('error');
      } else {
        // Process isActive field (convert string to boolean)
        const processedStaffMembers = staffMembers.map(staff => ({
          ...staff,
          isActive: typeof staff.isActive === 'string' ? 
            staff.isActive.toLowerCase() === 'true' : 
            Boolean(staff.isActive)
        }));
        
        setParsedStaff(processedStaffMembers);
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
    if (parsedStaff.length === 0 || parseStatus !== 'success') {
      return;
    }
    
    try {
      await onSubmit(parsedStaff);
      // Reset form after successful submission
      setCsvData('');
      setParsedStaff([]);
      setParseStatus('initial');
      setFileName('');
    } catch (error) {
      console.error('Failed to submit staff data:', error);
    }
  };

  const handleSampleDownload = () => {
    // Create a Blob from the CSV string
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    
    // Create an invisible anchor element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'staff_upload_template.csv');
    
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
        setParsedStaff([]);
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
      <DialogTitle>Bulk Staff Upload</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Upload your CSV/Excel file or paste CSV data below to add or update multiple staff members at once.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Required fields: Staff ID, First Name, Last Name, Email, Phone Number, Role, and Join Date
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
          
          <Tooltip title="Staff roles must be one of: Teacher, Principal, Admin Officer, Management, Account Officer, or Librarian">
            <IconButton size="small" color="info">
              <HelpOutlineIcon />
            </IconButton>
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
          placeholder="staffId,firstName,lastName,email,phoneNumber,role,joinDate,address,dateOfBirth,gender,qualifications,emergencyContact,bloodGroup,isActive"
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
            Found {parsedStaff.length} valid staff records ready to be imported.
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

        {parsedStaff.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mt: 2, maxHeight: '200px', overflow: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom>
              Preview of Parsed Data ({parsedStaff.length} staff members)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {parsedStaff.slice(0, 5).map((staff, index) => (
              <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'background.paper' }}>
                <Typography variant="body2">
                  <strong>ID:</strong> {staff.staffId}, 
                  <strong> Name:</strong> {staff.firstName} {staff.lastName}, 
                  <strong> Role:</strong> {staff.role}, 
                  <strong> Email:</strong> {staff.email}
                  <strong> Status:</strong> {staff.isActive ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            ))}
            {parsedStaff.length > 5 && (
              <Chip 
                label={`${parsedStaff.length - 5} more staff members`} 
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
          disabled={parsedStaff.length === 0 || parseStatus !== 'success' || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          {loading ? 'Importing...' : 'Import Staff Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkStaffUploadDialog;