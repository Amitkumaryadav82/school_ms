import React, { useState } from 'react';
import {
  TextField,
  Grid,
  MenuItem,
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
      dateOfBirth: '',
      gradeApplying: '',
      parentName: '',
      contactNumber: '',
      email: '',
      address: '',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof AdmissionApplication) => (
    e: React.ChangeEvent<HTMLInputElement>
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
    const validationErrors = validateAdmission(formData as AdmissionApplication);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData as AdmissionApplication);
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Application' : 'New Admission Application'}
      onSubmit={handleSubmit}
      submitLabel={initialData ? 'Update' : 'Submit'}
      loading={loading}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Student Name"
            value={formData.studentName}
            onChange={handleChange('studentName')}
            error={!!errors.studentName}
            helperText={errors.studentName}
            required
          />
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
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Grade Applying"
            value={formData.gradeApplying}
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
            label="Contact Number"
            value={formData.contactNumber}
            onChange={handleChange('contactNumber')}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber}
            required
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
    </BaseDialog>
  );
};

export default AdmissionDialog;