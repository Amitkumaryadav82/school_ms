import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { parse } from 'papaparse';
import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { StaffMember } from '../../services/staffService';

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
const SAMPLE_CSV = `staffId,firstName,middleName,lastName,email,phoneNumber,role,joinDate,address,dateOfBirth,gender,department,designation,qualifications,emergencyContact,bloodGroup,isActive,pfUAN,gratuity,serviceEndDate,basicSalary,hra,da,profileImage
EMP001,John,M,Smith,john.smith@example.com,1234567890,Teacher,2022-05-15,123 Main St,1985-03-20,MALE,Mathematics,Senior Teacher,B.Ed in Mathematics,9876543210,A+,true,UAN12345678,GR12345,,50000,15000,5000,profile1.jpg
EMP002,Jane,,Doe,jane.doe@example.com,9876543210,Librarian,2021-06-10,456 Elm St,1990-07-12,FEMALE,Library,Head Librarian,Master in Library Science,1234567890,O+,true,UAN23456789,GR23456,,45000,13000,4500,profile2.jpg
EMP003,Robert,K,Johnson,robert.johnson@example.com,5551234567,Admin Officer,2020-03-15,789 Oak Ave,1982-11-30,MALE,Administration,Senior Manager,MBA,7778889999,B-,true,UAN34567890,GR34567,,60000,18000,6000,profile3.jpg`;

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

  // Validate staff member data
  const validateStaffMember = (staff: StaffMember, index: number) => {
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
    
    // Validate service end date if provided
    if (staff.serviceEndDate && !/^\d{4}-\d{2}-\d{2}$/.test(staff.serviceEndDate)) {
      errors.push({
        index,
        field: 'serviceEndDate',
        message: 'Invalid date format for serviceEndDate. Use YYYY-MM-DD'
      });
    }
    
    // Validate numeric fields
    const numericFields = ['basicSalary', 'hra', 'da'];
    numericFields.forEach(field => {
      if (staff[field] && isNaN(Number(staff[field]))) {
        errors.push({
          index,
          field,
          message: `${field} must be a valid number`
        });
      }
    });

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
        // Process boolean and numeric fields
        const processedStaffMembers = staffMembers.map(staff => {
          // Process boolean fields
          const isActiveValue = typeof staff.isActive === 'string' ? 
            String(staff.isActive).toLowerCase() === 'true' : 
            Boolean(staff.isActive);
            
          // Process numeric fields
          const basicSalary = staff.basicSalary !== undefined && staff.basicSalary !== null && staff.basicSalary !== 0 ? 
            Number(staff.basicSalary) : undefined;
            
          const hra = staff.hra !== undefined && staff.hra !== null && staff.hra !== 0 ? 
            Number(staff.hra) : undefined;
            
          const da = staff.da !== undefined && staff.da !== null && staff.da !== 0 ? 
            Number(staff.da) : undefined;
          
          // Make sure all date fields are properly formatted as strings
          const processDateField = (dateValue: string | undefined): string | undefined => {
            if (!dateValue || dateValue.trim() === '') return undefined;
            
            // If already in YYYY-MM-DD format, return as is
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
            
            // Try to parse and format the date
            try {
              const date = new Date(dateValue);
              return date.toISOString().split('T')[0]; // Get YYYY-MM-DD part
            } catch (e) {
              return undefined;
            }
          };
          
          return {
            ...staff,
            isActive: isActiveValue,
            basicSalary,
            hra,
            da,
            joinDate: processDateField(staff.joinDate),
            dateOfBirth: processDateField(staff.dateOfBirth),
            serviceEndDate: processDateField(staff.serviceEndDate),
          };
        });
        
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
    
    // Append, click and remove
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
      
      if (typeof data === 'string') {
        // For CSV files, just set the data directly
        if (file.name.endsWith('.csv')) {
          setCsvData(data);
        }
        // For Excel files, convert to CSV first
        else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          try {
            const workbook = XLSX.read(data, {type: 'binary'});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            setCsvData(csv);
          } catch (error) {
            console.error('Error parsing Excel file:', error);
            setValidationErrors([{
              index: 0,
              field: 'file',
              message: 'Failed to parse Excel file: ' + (error instanceof Error ? error.message : String(error))
            }]);
            setParseStatus('error');
          }
        } else {
          setValidationErrors([{
            index: 0,
            field: 'file',
            message: 'Unsupported file format. Please upload a CSV or Excel file.'
          }]);
          setParseStatus('error');
        }
      }
    };
    
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
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

        {parseStatus === 'success' && parsedStaff.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Data Summary
            </Typography>
            <Typography variant="body2" gutterBottom>
              Total records: {parsedStaff.length}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {Object.keys(parsedStaff[0]).map((field) => (
                <Chip 
                  key={field} 
                  label={field} 
                  color={REQUIRED_FIELDS.includes(field) ? 'primary' : 'default'} 
                  size="small" 
                />
              ))}
            </Box>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="primary" 
          variant="contained" 
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
          disabled={parseStatus !== 'success' || parsedStaff.length === 0 || loading}
          onClick={handleSubmit} 
        >
          {loading ? 'Uploading...' : 'Upload Staff Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkStaffUploadDialog;
