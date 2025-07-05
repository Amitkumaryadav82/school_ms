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
  Tabs,
  Tab,
} from '@mui/material';
import {
  ClassConfigurationRequest,
  ClassConfiguration,
} from '../../../types/examConfiguration';
import classConfigurationService from '../../../services/classConfigurationService';

interface ClassConfigurationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: ClassConfiguration) => void;
  configuration?: ClassConfiguration | null;
  mode: 'create' | 'edit' | 'copy';
  sourceConfig?: ClassConfiguration | null;
}

interface ValidationErrors {
  className?: string;
  section?: string;
  academicYear?: string;
  description?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const DebugClassConfigurationModal: React.FC<ClassConfigurationModalProps> = ({
  open,
  onClose,
  onSave,
  configuration,
  mode,
  sourceConfig,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Basic configuration state
  const [formData, setFormData] = useState<ClassConfigurationRequest>({
    className: '',
    section: '',
    academicYear: new Date().getFullYear().toString(),
    description: '',
    isActive: true,
  });

  // Form state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Options
  const classOptions = [
    'Pre-KG', 'LKG', 'UKG', 
    '1st', '2nd', '3rd', '4th', '5th', 
    '6th', '7th', '8th', '9th', '10th',
    '11th', '12th'
  ];
  const sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Simple useEffect without complex dependencies
  useEffect(() => {
    if (open && configuration && mode === 'edit') {
      setFormData({
        className: configuration.className,
        section: configuration.section,
        academicYear: configuration.academicYear,
        description: configuration.description || '',
        isActive: configuration.isActive,
      });
    } else if (open && sourceConfig && mode === 'copy') {
      setFormData({
        className: '',
        section: '',
        academicYear: new Date().getFullYear().toString(),
        description: sourceConfig.description || '',
        isActive: true,
      });
    } else if (open) {
      setFormData({
        className: '',
        section: '',
        academicYear: new Date().getFullYear().toString(),
        description: '',
        isActive: true,
      });
    }
    
    // Reset errors when modal opens
    if (open) {
      setErrors({});
      setSubmitError('');
      setActiveTab(0);
    }
  }, [open, configuration?.id, mode, sourceConfig?.id]); // Stable dependencies

  const validateBasicForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.className.trim()) {
      newErrors.className = 'Class name is required';
    }
    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
    }
    if (!formData.academicYear || parseInt(formData.academicYear) < 2020) {
      newErrors.academicYear = 'Valid academic year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBasicFormChange = (field: keyof ClassConfigurationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateBasicForm()) {
      setActiveTab(0);
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      let savedConfig: ClassConfiguration;

      if (mode === 'edit' && configuration) {
        savedConfig = await classConfigurationService.updateConfiguration(configuration.id!, formData);
      } else {
        savedConfig = await classConfigurationService.createConfiguration(formData);
      }

      onSave(savedConfig);
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

        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Basic Configuration" />
          <Tab label="Subject Assignment (Coming Soon)" disabled />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.className}>
                <InputLabel>Class</InputLabel>
                <Select
                  value={formData.className}
                  label="Class"
                  onChange={(e) => handleBasicFormChange('className', e.target.value)}
                >
                  {classOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {errors.className && <FormHelperText>{errors.className}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.section}>
                <InputLabel>Section</InputLabel>
                <Select
                  value={formData.section}
                  label="Section"
                  onChange={(e) => handleBasicFormChange('section', e.target.value)}
                >
                  {sectionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {errors.section && <FormHelperText>{errors.section}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Academic Year"
                value={formData.academicYear}
                onChange={(e) => handleBasicFormChange('academicYear', e.target.value)}
                error={!!errors.academicYear}
                helperText={errors.academicYear || 'e.g., 2024-25'}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => handleBasicFormChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              Subject Assignment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coming soon - For now, create the configuration and use the separate Subject Assignment tab.
            </Typography>
          </Box>
        </TabPanel>
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
          {loading ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Create')} Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DebugClassConfigurationModal;
