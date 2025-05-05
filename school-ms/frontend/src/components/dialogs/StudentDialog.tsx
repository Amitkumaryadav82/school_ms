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

const StudentDialog: React.FC<StudentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  // Get current date in YYYY-MM-DD format for default value
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<Partial<Student>>(
    initialData || {
      name: '',
      studentId: '',
      grade: '',
      section: '',
      dateOfBirth: getCurrentDate(), // Set default to current date as per requirement
      gender: '',
      bloodGroup: '',
      address: '',
      email: '',
      parentName: '',
      parentContact: '+91', // Prefill with India's country code
      additionalContact: '', // Added additional contact field
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
        dateOfBirth: getCurrentDate()
      }));
    }
  }, [open, initialData]);

  const handleChange = (field: keyof Student) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;
    
    // Enforce +91 prefix for parent contact
    if (field === 'parentContact' && !value.startsWith('+91')) {
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
    const validationErrors = validateStudent(formData as Student);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }
    return true;
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData as Student);
    }
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
                  helperText={errors.studentId}
                  required
                  disabled={!!initialData}
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
                    label="Parent Contact"
                    value={formData.parentContact}
                    onChange={handleChange('parentContact')}
                    error={!!errors.parentContact}
                    helperText={errors.parentContact || "Must start with +91 followed by 10 digits"}
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
                {/* Ensure Additional Contact and Email are in same row with equal width */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Additional Contact Number"
                    value={formData.additionalContact}
                    onChange={handleChange('additionalContact')}
                    error={!!errors.additionalContact}
                    helperText={errors.additionalContact}
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