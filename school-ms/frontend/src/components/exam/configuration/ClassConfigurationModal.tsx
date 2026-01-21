import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Divider,
} from '@mui/material';
import {
  ClassConfigurationRequest,
  ClassConfiguration,
  CopyConfigurationRequest,
} from '../../../types/examConfiguration';
import classConfigurationService from '../../../services/classConfigurationService';

interface ClassConfigurationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: ClassConfiguration) => void;
  configuration?: ClassConfiguration | null;
  mode: 'create' | 'edit' | 'copy';
  sourceConfig?: ClassConfiguration | null; // For copy mode
}

interface ValidationErrors {
  className?: string;
  section?: string;
  academicYear?: string;
  description?: string;
}

const ClassConfigurationModal: React.FC<ClassConfigurationModalProps> = ({
  open,
  onClose,
  onSave,
  configuration,
  mode,
  sourceConfig,
}) => {
  const [formData, setFormData] = useState<ClassConfigurationRequest>({
    className: '',
    section: '',
    academicYear: new Date().getFullYear().toString(),
    description: '',
    isActive: true,
  });

  const [copyData, setCopyData] = useState<CopyConfigurationRequest>({
    sourceClassConfigId: 0,
    sourceConfigurationId: 0,
    targetClassConfigId: 0,
    targetClassName: '',
    targetSection: '',
    targetAcademicYear: new Date().getFullYear().toString(),
    includeSubjects: true,
    overwriteExisting: false,
    adjustMarks: false,
    marksAdjustmentFactor: 1.0,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Common class and section options
  const classOptions = [
    'Pre-KG', 'LKG', 'UKG', 
    '1st', '2nd', '3rd', '4th', '5th', 
    '6th', '7th', '8th', '9th', '10th',
    '11th', '12th'
  ];

  const sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F'];

  useEffect(() => {
    if (configuration && mode === 'edit') {
      setFormData({
        className: configuration.className,
        section: configuration.section,
        academicYear: configuration.academicYear,
        description: configuration.description || '',
        isActive: configuration.isActive,
      });
    } else if (sourceConfig && mode === 'copy') {
      setCopyData({
        sourceClassConfigId: sourceConfig.id || 0,
        sourceConfigurationId: sourceConfig.id || 0,
        targetClassConfigId: 0,
        targetClassName: '',
        targetSection: '',
        targetAcademicYear: new Date().getFullYear().toString(),
        includeSubjects: true,
        overwriteExisting: false,
        adjustMarks: false,
        marksAdjustmentFactor: 1.0,
      });
    } else {
      // Reset for create mode
      setFormData({
        className: '',
        section: '',
        academicYear: new Date().getFullYear().toString(),
        description: '',
        isActive: true,
      });
    }
    setErrors({});
    setSubmitError('');
  }, [open, configuration, mode, sourceConfig]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (mode === 'copy') {
      if (!copyData.targetClassName?.trim()) {
        newErrors.className = 'Class name is required';
      }
      if (!copyData.targetSection?.trim()) {
        newErrors.section = 'Section is required';
      }
      if (!copyData.targetAcademicYear || parseInt(copyData.targetAcademicYear) < 2020) {
        newErrors.academicYear = 'Valid academic year is required';
      }
    } else {
      if (!formData.className.trim()) {
        newErrors.className = 'Class name is required';
      }
      if (!formData.section?.trim()) {
        newErrors.section = 'Section is required';
      }
      if (!formData.academicYear || parseInt(formData.academicYear) < 2020) {
        newErrors.academicYear = 'Valid academic year is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError('');

    try {
      let result: ClassConfiguration;

      if (mode === 'copy') {
        const copyResult = await classConfigurationService.copyConfiguration(copyData);
        // Create a ClassConfiguration object from the copy result
        result = {
          id: copyResult.copiedSubjects[0]?.classConfigurationId,
          className: copyData.targetClassName || '',
          section: copyData.targetSection,
          academicYear: copyData.targetAcademicYear || '',
          isActive: true,
          subjectCount: copyResult.totalCopied
        };
      } else if (mode === 'edit' && configuration) {
        result = await classConfigurationService.updateConfiguration(configuration.id!, formData);
      } else {
        result = await classConfigurationService.createConfiguration(formData);
      }

      onSave(result);
      onClose();
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Failed to save configuration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: keyof ClassConfigurationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCopyChange = (field: keyof CopyConfigurationRequest, value: any) => {
    setCopyData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'edit':
        return 'Edit Class Configuration';
      case 'copy':
        return `Copy Configuration from ${sourceConfig?.className} ${sourceConfig?.section}`;
      default:
        return 'Create Class Configuration';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        {mode === 'copy' ? (
          // Copy mode form
          <Box>
            <Typography variant="h6" gutterBottom>
              Source Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Copying from: {sourceConfig?.className} {sourceConfig?.section} ({sourceConfig?.academicYear})
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Target Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth error={!!errors.className}>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={copyData.targetClassName}
                    onChange={(e) => handleCopyChange('targetClassName', e.target.value)}
                    label="Class"
                  >
                    {classOptions.map((className) => (
                      <MenuItem key={className} value={className}>
                        {className}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.className && <FormHelperText>{errors.className}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth error={!!errors.section}>
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={copyData.targetSection}
                    onChange={(e) => handleCopyChange('targetSection', e.target.value)}
                    label="Section"
                  >
                    {sectionOptions.map((section) => (
                      <MenuItem key={section} value={section}>
                        {section}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.section && <FormHelperText>{errors.section}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Academic Year"
                  value={copyData.targetAcademicYear}
                  onChange={(e) => handleCopyChange('targetAcademicYear', e.target.value)}
                  error={!!errors.academicYear}
                  helperText={errors.academicYear}
                  placeholder="e.g., 2023-2024"
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          // Create/Edit mode form
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.className}>
                <InputLabel>Class</InputLabel>
                <Select
                  value={formData.className}
                  onChange={(e) => handleFormChange('className', e.target.value)}
                  label="Class"
                >
                  {classOptions.map((className) => (
                    <MenuItem key={className} value={className}>
                      {className}
                    </MenuItem>
                  ))}
                </Select>
                {errors.className && <FormHelperText>{errors.className}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.section}>
                <InputLabel>Section</InputLabel>
                <Select
                  value={formData.section}
                  onChange={(e) => handleFormChange('section', e.target.value)}
                  label="Section"
                >
                  {sectionOptions.map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </Select>
                {errors.section && <FormHelperText>{errors.section}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Academic Year"
                value={formData.academicYear}
                onChange={(e) => handleFormChange('academicYear', e.target.value)}
                error={!!errors.academicYear}
                helperText={errors.academicYear}
                placeholder="e.g., 2023-2024"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Optional description for this class configuration..."
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Saving...' : mode === 'copy' ? 'Copy Configuration' : 'Save Configuration'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassConfigurationModal;
