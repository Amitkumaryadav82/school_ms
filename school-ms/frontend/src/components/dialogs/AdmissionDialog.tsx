import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  MenuItem,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Divider,
  Typography,
  Box,
  Paper,
  Stack
} from '@mui/material';
import {
  Person as PersonIcon,
  People as PeopleIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { AdmissionApplication } from '../../services/admissionService';
import { validateAdmission } from '../../utils/admissionValidation.js';
import BaseDialog from './BaseDialog';

interface AdmissionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AdmissionApplication) => Promise<void>;
  initialData?: Partial<AdmissionApplication>;
  loading?: boolean;
}

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B', 'C', 'D'];
const genders = ['MALE', 'FEMALE', 'OTHER'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AdmissionDialog: React.FC<AdmissionDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState<Partial<AdmissionApplication>>(
    initialData || {
      studentName: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gradeApplying: '1',
      section: 'A',
      parentName: '',
      contactNumber: '', // This will be used for parent/guardian contact only
      email: '',
      address: '',
      gender: 'MALE',
      bloodGroup: '',
      medicalConditions: '',
      previousSchool: '',
      previousGrade: '',
      previousPercentage: '75',
      status: 'PENDING',
    }
  );

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      const editMode = initialData?.id || (initialData && Object.keys(initialData).length > 0 && initialData.studentName);
      setIsEditMode(!!editMode);

      if (initialData && Object.keys(initialData).length > 0) {
        let firstName = initialData.firstName || '';
        let lastName = initialData.lastName || '';

        if ((!firstName || !lastName) && initialData.studentName) {
          const nameParts = initialData.studentName.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        }

        setFormData({
          ...initialData,
          id: initialData.id,
          firstName: firstName,
          lastName: lastName,
          studentName: initialData.studentName || '',
          dateOfBirth: initialData.dateOfBirth || '',
          gradeApplying: initialData.gradeApplying || '1',
          section: initialData.section || 'A',
          parentName: initialData.parentName || '',
          contactNumber: initialData.contactNumber || '',
          email: initialData.email || '',
          address: initialData.address || '',
          gender: initialData.gender || 'MALE',
          bloodGroup: initialData.bloodGroup || '',
          medicalConditions: initialData.medicalConditions || '',
          previousSchool: initialData.previousSchool || '',
          previousGrade: initialData.previousGrade || '',
          previousPercentage: String(initialData.previousPercentage || 75),
          status: initialData.status || 'PENDING'
        });
      } else {
        setFormData({
          studentName: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gradeApplying: '1',
          section: 'A',
          parentName: '',
          contactNumber: '',
          email: '',
          address: '',
          gender: 'MALE',
          bloodGroup: '',
          medicalConditions: '',
          previousSchool: '',
          previousGrade: '',
          previousPercentage: '75',
          status: 'PENDING',
        });
      }
      setErrors({});
    }
  }, [open, initialData]);

  useEffect(() => {
    if (formData.firstName || formData.lastName) {
      const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
      setFormData(prev => ({
        ...prev,
        studentName: fullName
      }));
    }
  }, [formData.firstName, formData.lastName]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }> | SelectChangeEvent<string>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = () => {
    const dataToValidate = {
      ...formData,
      submissionDate: formData.submissionDate || new Date().toISOString().split('T')[0]
    };

    const validationErrors = validateAdmission(dataToValidate as AdmissionApplication);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(dataToValidate as AdmissionApplication);
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit Application' : 'New Admission Application'}
      onSubmit={handleSubmit}
      submitLabel={isEditMode ? 'Update' : 'Submit'}
      loading={loading}
      maxWidth="md"
      fullWidth
    >
      <Grid container spacing={3}>
        {/* Student Information Section */}
        <Grid item xs={12}>
          <Paper 
            elevation={1}
            sx={{ 
              p: 3, 
              mb: 2,
              borderRadius: 2,
              borderTop: '5px solid #1976d2',  /* Primary color border at the top */
              bgcolor: '#f5f9ff'  /* Light primary background */
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3, 
              pb: 1, 
              borderBottom: '1px solid #e0e0e0' 
            }}>
              <PersonIcon sx={{ fontSize: 28, mr: 1, color: '#1976d2' }} />
              <Typography variant="h6" fontWeight="500" color="#1976d2">
                STUDENT INFORMATION
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName || ''}
                  onChange={handleChange('firstName')}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName || ''}
                  onChange={handleChange('lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={handleChange('dateOfBirth')}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth || 'Select date from calendar'}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    value={formData.gender || 'MALE'}
                    onChange={handleChange('gender')}
                    label="Gender"
                  >
                    {genders.map((gender) => (
                      <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Grade Applying"
                  value={formData.gradeApplying || ''}
                  onChange={handleChange('gradeApplying')}
                  error={!!errors.gradeApplying}
                  helperText={errors.gradeApplying}
                  required
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      Grade {grade}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Section"
                  value={formData.section || 'A'}
                  onChange={handleChange('section')}
                >
                  {sections.map((section) => (
                    <MenuItem key={section} value={section}>
                      Section {section}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Parent/Guardian Information */}
        <Grid item xs={12}>
          <Paper 
            elevation={1}
            sx={{ 
              p: 3,
              mb: 2,
              borderRadius: 2,
              borderTop: '5px solid #f50057',  /* Secondary color border at the top */
              bgcolor: '#fff9fb'  /* Light secondary background */
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3, 
              pb: 1, 
              borderBottom: '1px solid #e0e0e0' 
            }}>
              <PeopleIcon sx={{ fontSize: 28, mr: 1, color: '#f50057' }} />
              <Typography variant="h6" fontWeight="500" color="#f50057">
                PARENT/GUARDIAN INFORMATION
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Parent/Guardian Name"
                  value={formData.parentName || ''}
                  onChange={handleChange('parentName')}
                  error={!!errors.parentName}
                  helperText={errors.parentName || 'Full name of parent or guardian'}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px dashed #f50057', 
                  borderRadius: 1,
                  mb: 2
                }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="500"
                    color="#f50057"
                    sx={{ mb: 2 }}
                  >
                    Contact Information
                  </Typography>
                  
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.contactNumber || ''}
                      onChange={handleChange('contactNumber')}
                      error={!!errors.contactNumber}
                      helperText={errors.contactNumber || "e.g. +1234567890"}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleChange('email')}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                    />
                  </Stack>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px dashed #f50057', 
                  borderRadius: 1
                }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="500"
                    color="#f50057"
                    sx={{ mb: 2 }}
                  >
                    Residence Information
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Home Address"
                    multiline
                    rows={4}
                    value={formData.address || ''}
                    onChange={handleChange('address')}
                    error={!!errors.address}
                    helperText={errors.address || 'Complete residential address'}
                    required
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Additional Information Section */}
        <Grid item xs={12}>
          <Paper 
            elevation={1}
            sx={{ 
              p: 3, 
              borderRadius: 2,
              borderTop: '5px solid #4caf50',  /* Green color border at the top */
              bgcolor: '#f5fbf5'  /* Light green background */
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pb: 1,
              borderBottom: '1px solid #e0e0e0',
              mb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ fontSize: 28, mr: 1, color: '#4caf50' }} />
                <Typography variant="h6" fontWeight="500" color="#4caf50">
                  ADDITIONAL INFORMATION
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide Additional Fields' : 'Show More Fields'}
              </Typography>
            </Box>
            
            {showAdvanced && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Blood Group"
                    value={formData.bloodGroup || ''}
                    onChange={handleChange('bloodGroup')}
                  >
                    <MenuItem value="">Not Specified</MenuItem>
                    {bloodGroups.map((group) => (
                      <MenuItem key={group} value={group}>{group}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Medical Conditions"
                    multiline
                    rows={2}
                    value={formData.medicalConditions || ''}
                    onChange={handleChange('medicalConditions')}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Previous School"
                    value={formData.previousSchool || ''}
                    onChange={handleChange('previousSchool')}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Previous Grade"
                    value={formData.previousGrade || ''}
                    onChange={handleChange('previousGrade')}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Previous Percentage/GPA"
                    type="number"
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    value={formData.previousPercentage || 75}
                    onChange={handleChange('previousPercentage')}
                  />
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <FormHelperText sx={{ textAlign: 'center' }}>
            Fields marked with * are required. Submission date will be set automatically.
          </FormHelperText>
        </Grid>
      </Grid>
    </BaseDialog>
  );
};

export default AdmissionDialog;