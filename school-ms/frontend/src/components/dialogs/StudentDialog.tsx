import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  FormHelperText,
  Tooltip,
  IconButton,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { Student } from '../../services/studentService';
import { validateStudent } from '../../utils/validation';
import BaseDialog from './BaseDialog';

interface StudentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Student) => Promise<void>;
  initialData?: Partial<Student>;
  loading?: boolean;
}

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B', 'C', 'D'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Get current date in YYYY-MM-DD format for default value
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Get a date 10 years ago in YYYY-MM-DD format for default DOB
const getDefaultDOB = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 10); // Set to 10 years ago as a reasonable default
  return date.toISOString().split('T')[0];
};

const StudentDialog: React.FC<StudentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>(
    initialData || {
      name: '',
      studentId: '',
      grade: '',
      section: '',
      dateOfBirth: getDefaultDOB(), // Use a date in the past instead of current date
      gender: '',
      bloodGroup: '',
      address: '',
      email: '',
      parentName: '',
      phoneNumber: '', // This is required by the API
      parentPhone: '+91', // Changed from parentContact to match interface
      emergencyContact: '', // Changed from additionalContact to match interface
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form to current date when dialog opens
  useEffect(() => {
    if (open && !initialData) {
      setFormData(prev => ({
        ...prev,
        dateOfBirth: getDefaultDOB()
      }));
    }
  }, [open, initialData]);

  const handleChange = (field: keyof Student) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;
    
    // Enforce +91 prefix for parent phone
    if (field === 'parentPhone' && !value.startsWith('+91')) {
      value = '+91' + value.replace(/^\+91/, '');
    }
    
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    console.log("Validating form data:", formData); // Debug logging
    const validationErrors = validateStudent(formData as Student);
    console.log("Validation errors:", validationErrors); // Debug logging
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }
    return true;
  }

  const handleSubmit = () => {
    console.log("Submit button clicked");
    
    // Create a copy of formData for submission
    const submitData = {
      ...formData,
      // Ensure phoneNumber is set (required by backend)
      phoneNumber: formData.parentPhone || '',
    };
    
    // Validate date of birth is in the past
    const dob = new Date(submitData.dateOfBirth || '');
    const today = new Date();
    if (dob >= today) {
      setErrors(prev => ({
        ...prev,
        dateOfBirth: 'Date of birth must be in the past'
      }));
      console.log("Date of birth validation failed - must be in the past");
      return;
    }
    
    console.log("Preparing data for submission:", submitData);
    
    // Create a validation context that tells validateStudent whether we're
    // creating or updating a student
    const isEdit = !!initialData?.id;
    
    // Perform validation - with context about whether this is an edit operation
    const validationErrors = validateStudent(submitData as Student, { isEdit });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log("Form validation failed");
      return;
    }
    
    console.log("Form validation successful, submitting data");
    // Log exact data being sent to the API for debugging
    console.log("Submitting data to API:", JSON.stringify(submitData, null, 2));
    onSubmit(submitData as Student);
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Student' : 'Add New Student'}
      submitLabel={initialData ? 'Update' : 'Submit'}
      onSubmit={handleSubmit}
      maxWidth="md"
      loading={loading}
      disableSubmitButton={false}
    >
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={2}>
          {/* Student Information Section */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={formData.studentId}
                  onChange={handleChange('studentId')}
                  error={!!errors.studentId}
                  helperText={errors.studentId || "Student ID cannot be changed after creation"}
                  required
                  disabled={!!initialData?.id}
                  InputProps={{
                    endAdornment: !initialData?.id && (
                      <InputAdornment position="end">
                        <Tooltip title="Enter a unique Student ID. This cannot be changed later.">
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.grade}>
                  <InputLabel>Grade</InputLabel>
                  <Select
                    value={formData.grade}
                    onChange={handleChange('grade') as any}
                    label="Grade"
                    required
                  >
                    {grades.map((grade) => (
                      <MenuItem key={grade} value={grade}>
                        Grade {grade}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.grade && <FormHelperText>{errors.grade}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={formData.section}
                    onChange={handleChange('section') as any}
                    label="Section"
                  >
                    {sections.map((section) => (
                      <MenuItem key={section} value={section}>
                        Section {section}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange('dateOfBirth')}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Date of Birth field is required">
                          <IconButton size="small" edge="end">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender}
                    onChange={handleChange('gender') as any}
                    label="Gender"
                    required
                  >
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Blood Group</InputLabel>
                  <Select
                    value={formData.bloodGroup}
                    onChange={handleChange('bloodGroup') as any}
                    label="Blood Group"
                  >
                    {bloodGroups.map((group) => (
                      <MenuItem key={group} value={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
            
          {/* Parent/Guardian Information Section */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Parent/Guardian Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Parent/Guardian Name"
                    value={formData.parentName}
                    onChange={handleChange('parentName')}
                    error={!!errors.parentName}
                    helperText={errors.parentName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Parent Phone"
                    value={formData.parentPhone}
                    onChange={handleChange('parentPhone')}
                    error={!!errors.parentPhone}
                    helperText={errors.parentPhone || "Must start with +91 followed by 10 digits"}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Tooltip title="Indian mobile number format: +91 followed by 10 digits">
                            <IconButton size="small">
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                {/* Ensure Emergency Contact and Email are in same row with equal width */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Number"
                    value={formData.emergencyContact}
                    onChange={handleChange('emergencyContact')}
                    error={!!errors.emergencyContact}
                    helperText={errors.emergencyContact}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={handleChange('address')}
                    error={!!errors.address}
                    helperText={errors.address}
                    required
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </BaseDialog>
  );
};

export default StudentDialog;