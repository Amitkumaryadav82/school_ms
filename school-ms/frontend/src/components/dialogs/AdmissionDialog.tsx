import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  MenuItem,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Typography,
  Box
} from '@mui/material';
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
      contactNumber: '',
      email: '',
      address: '', // Added address field with empty default
      gender: 'MALE',
      bloodGroup: '',
      medicalConditions: '',
      previousSchool: '',
      previousGrade: '',
      previousPercentage: 75,
      status: 'PENDING',
    }
  );

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Reset form data when dialog opens with new initialData
  useEffect(() => {
    if (open) {
      console.log("Dialog opened with initialData:", initialData);
      
      // Check if we're in edit mode
      const editMode = initialData?.id || (initialData && Object.keys(initialData).length > 0 && initialData.studentName);
      setIsEditMode(!!editMode);
      console.log("Is edit mode:", !!editMode);
      
      if (initialData && Object.keys(initialData).length > 0) {
        // Split the student name into first and last name if not already set
        let firstName = initialData.firstName || '';
        let lastName = initialData.lastName || '';
        
        if ((!firstName || !lastName) && initialData.studentName) {
          const nameParts = initialData.studentName.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        }
        
        // For edit mode, use the provided initialData
        setFormData({
          ...initialData,
          // Ensure these fields have default values
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
          address: initialData.address || '', // Handle the address field
          gender: initialData.gender || 'MALE',
          bloodGroup: initialData.bloodGroup || '',
          medicalConditions: initialData.medicalConditions || '',
          previousSchool: initialData.previousSchool || '',
          previousGrade: initialData.previousGrade || '',
          previousPercentage: initialData.previousPercentage || 75,
          status: initialData.status || 'PENDING'
        });
        console.log("Form data set for edit mode:", initialData);
      } else {
        // For new mode, use empty defaults
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
          address: '', // Added address field with empty default
          gender: 'MALE',
          bloodGroup: '',
          medicalConditions: '',
          previousSchool: '',
          previousGrade: '',
          previousPercentage: 75,
          status: 'PENDING',
        });
        console.log("Form data reset for new mode");
      }
      setErrors({});
    }
  }, [open, initialData]);

  useEffect(() => {
    // Update full name when first or last name changes
    if (formData.firstName || formData.lastName) {
      const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
      setFormData(prev => ({
        ...prev,
        studentName: fullName
      }));
    }
  }, [formData.firstName, formData.lastName]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
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
    console.log("Submitting form data:", formData);
    
    // Add current date if submissionDate isn't set
    const dataToValidate = {
      ...formData,
      submissionDate: formData.submissionDate || new Date().toISOString().split('T')[0]
    };
    
    const validationErrors = validateAdmission(dataToValidate as AdmissionApplication);
    if (Object.keys(validationErrors).length > 0) {
      console.log("Validation errors:", validationErrors);
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
      <Grid container spacing={2}>
        {/* Basic Student Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">Student Information</Typography>
        </Grid>
        
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
            helperText={errors.dateOfBirth || 'YYYY-MM-DD format'}
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
        
        {/* Parent/Guardian Information */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Divider />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            Parent/Guardian Information
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Parent/Guardian Name"
            value={formData.parentName || ''}
            onChange={handleChange('parentName')}
            error={!!errors.parentName}
            helperText={errors.parentName}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Contact Number"
            value={formData.contactNumber || ''}
            onChange={handleChange('contactNumber')}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber || "e.g. +1234567890"}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={2}
            value={formData.address || ''}
            onChange={handleChange('address')}
            error={!!errors.address}
            helperText={errors.address}
            required
          />
        </Grid>
        
        {/* Additional Information - Health */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Additional Information
            </Typography>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer' }}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide Additional Fields' : 'Show More Fields'}
            </Typography>
          </Box>
        </Grid>
        
        {showAdvanced && (
          <>
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
          </>
        )}
        
        <Grid item xs={12} sx={{ mt: 2 }}>
          <FormHelperText>
            Fields marked with * are required. Submission date will be set automatically.
          </FormHelperText>
        </Grid>
      </Grid>
    </BaseDialog>
  );
};

export default AdmissionDialog;