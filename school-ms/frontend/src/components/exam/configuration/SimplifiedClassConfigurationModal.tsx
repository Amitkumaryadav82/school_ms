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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  ClassConfigurationRequest,
  ClassConfiguration,
  ConfigurationSubject,
  SubjectMaster,
  SubjectType,
} from '../../../types/examConfiguration';
import classConfigurationService from '../../../services/classConfigurationService';
import subjectMasterService from '../../../services/subjectMasterService';

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
  academicYear?: string;
  description?: string;
}

interface SubjectFormData {
  subjectMasterId: number;
  totalMarks: number;
  passingMarks: number;
  theoryMarks: number;
  practicalMarks: number;
  subjectType: SubjectType;
}

const SimplifiedClassConfigurationModal: React.FC<ClassConfigurationModalProps> = ({
  open,
  onClose,
  onSave,
  configuration,
  mode,
  sourceConfig,
}) => {
  // Basic configuration state
  const [formData, setFormData] = useState<ClassConfigurationRequest>({
    className: '',
    academicYear: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`, // 2025-26 format
    description: '',
    isActive: true,
  });

  // Subject assignment state
  const [availableSubjects, setAvailableSubjects] = useState<SubjectMaster[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<SubjectFormData[]>([]);

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

  // Load available subjects when modal opens
  useEffect(() => {
    if (open) {
      loadAvailableSubjects();
      resetForm();
      
      if (configuration && mode === 'edit') {
        setFormData({
          className: configuration.className,
          academicYear: configuration.academicYear,
          description: configuration.description || '',
          isActive: configuration.isActive,
        });
        // TODO: Load existing subjects for edit mode
      } else if (sourceConfig && mode === 'copy') {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const academicYearFormat = `${currentYear}-${nextYear.toString().slice(-2)}`;
        
        setFormData({
          className: '',
          academicYear: academicYearFormat, // Use YYYY-YY format
          description: sourceConfig.description || '',
          isActive: true,
        });
        // TODO: Copy subjects from source config
      }
    }
  }, [open, configuration, mode, sourceConfig]);

  const loadAvailableSubjects = async () => {
    try {
      const subjects = await subjectMasterService.getAllActiveSubjects();
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const resetForm = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const academicYearFormat = `${currentYear}-${nextYear.toString().slice(-2)}`;
    
    setFormData({
      className: '',
      academicYear: academicYearFormat, // Use YYYY-YY format
      description: '',
      isActive: true,
    });
    setAssignedSubjects([]);
    setErrors({});
    setSubmitError('');
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.className.trim()) {
      newErrors.className = 'Class is required';
    }
    
    // Validate academic year format: YYYY-YY
    const academicYearPattern = /^\d{4}-\d{2}$/;
    if (!formData.academicYear || !academicYearPattern.test(formData.academicYear)) {
      newErrors.academicYear = 'Academic year must be in format YYYY-YY (e.g., 2025-26)';
    } else {
      const [startYear, endYearShort] = formData.academicYear.split('-');
      const startYearNum = parseInt(startYear);
      const expectedEndYear = (startYearNum + 1).toString().slice(-2);
      
      if (startYearNum < 2020 || endYearShort !== expectedEndYear) {
        newErrors.academicYear = 'Invalid academic year. End year should be start year + 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (field: keyof ClassConfigurationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddSubject = () => {
    // Get first available subject that hasn't been assigned
    const availableSubject = availableSubjects.find(s => 
      !assignedSubjects.some(assigned => assigned.subjectMasterId === s.id)
    );
    
    if (availableSubject) {
      const newSubject: SubjectFormData = {
        subjectMasterId: availableSubject.id!,
        totalMarks: 100,
        passingMarks: 40,
        theoryMarks: availableSubject.subjectType === SubjectType.BOTH ? 70 : 100,
        practicalMarks: availableSubject.subjectType === SubjectType.BOTH ? 30 : 0,
        subjectType: availableSubject.subjectType,
      };
      setAssignedSubjects(prev => [...prev, newSubject]);
    }
  };

  const handleRemoveSubject = (index: number) => {
    setAssignedSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index: number, field: keyof SubjectFormData, value: any) => {
    setAssignedSubjects(prev => prev.map((subject, i) => 
      i === index ? { ...subject, [field]: value } : subject
    ));
  };

  const getSubjectName = (subjectMasterId: number): string => {
    const subject = availableSubjects.find(s => s.id === subjectMasterId);
    return subject ? `${subject.subjectName} (${subject.subjectCode})` : 'Unknown Subject';
  };

  const getSubjectTypeChip = (subjectType: SubjectType) => {
    const colors = {
      [SubjectType.THEORY]: 'primary',
      [SubjectType.PRACTICAL]: 'secondary',
      [SubjectType.BOTH]: 'success'
    } as const;

    return (
      <Chip
        label={subjectType}
        color={colors[subjectType]}
        size="small"
        variant="outlined"
      />
    );
  };

  const getTotalMarks = () => {
    return assignedSubjects.reduce((total, subject) => total + subject.totalMarks, 0);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError('');

    try {
      // Debug logging to see what's being sent
      console.log('Submitting form data:', formData);
      console.log('Academic year value:', formData.academicYear);
      console.log('Academic year type:', typeof formData.academicYear);
      console.log('Academic year length:', formData.academicYear.length);

      let savedConfig: ClassConfiguration;

      if (mode === 'edit' && configuration) {
        savedConfig = await classConfigurationService.updateConfiguration(configuration.id!, formData);
      } else {
        savedConfig = await classConfigurationService.createConfiguration(formData);
      }

      // TODO: Save assigned subjects here
      // For now, just return the basic configuration
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
        return `Copy Configuration from ${sourceConfig?.className}`;
      default:
        return 'Create Class Configuration';
    }
  };

  const unassignedSubjects = availableSubjects.filter(s => 
    !assignedSubjects.some(assigned => assigned.subjectMasterId === s.id)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        {/* Basic Configuration */}
        <Typography variant="h6" gutterBottom>
          Basic Configuration
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.className}>
              <InputLabel>Class</InputLabel>
              <Select
                value={formData.className}
                label="Class"
                onChange={(e) => handleFormChange('className', e.target.value)}
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
            <TextField
              fullWidth
              label="Academic Year"
              value={formData.academicYear}
              onChange={(e) => {
                let value = e.target.value;
                // Remove any non-digit characters except dash
                value = value.replace(/[^\d-]/g, '');
                
                // Auto-format as user types
                if (value.length <= 4) {
                  // Just the year part
                  value = value;
                } else if (value.length === 5 && !value.includes('-')) {
                  // Insert dash after 4 digits
                  value = value.slice(0, 4) + '-' + value.slice(4);
                } else if (value.includes('-')) {
                  // Already has dash, limit to YYYY-YY format
                  const parts = value.split('-');
                  if (parts.length === 2) {
                    const yearPart = parts[0].slice(0, 4);
                    const endPart = parts[1].slice(0, 2);
                    value = yearPart + (endPart ? '-' + endPart : '-');
                  }
                }
                
                // Limit total length
                if (value.length <= 7) {
                  handleFormChange('academicYear', value);
                }
              }}
              onBlur={(e) => {
                let value = e.target.value;
                // Auto-complete if user enters just year
                if (/^\d{4}$/.test(value)) {
                  const year = parseInt(value);
                  const nextYear = year + 1;
                  const formattedValue = `${year}-${nextYear.toString().slice(-2)}`;
                  handleFormChange('academicYear', formattedValue);
                }
              }}
              error={!!errors.academicYear}
              helperText={errors.academicYear || 'Format: YYYY-YY (e.g., 2025-26)'}
              placeholder="2025-26"
              inputProps={{
                maxLength: 7,
                pattern: '[0-9]{4}-[0-9]{2}'
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Subject Assignment */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Subject Assignment
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSubject}
            disabled={unassignedSubjects.length === 0}
          >
            Add Subject
          </Button>
        </Box>

        {assignedSubjects.length > 0 && (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Total Subjects: {assignedSubjects.length} | Total Marks: {getTotalMarks()}
            </Typography>
          </Box>
        )}

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Total Marks</TableCell>
                <TableCell>Passing Marks</TableCell>
                <TableCell>Theory</TableCell>
                <TableCell>Practical</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedSubjects.map((subject, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={subject.subjectMasterId}
                        onChange={(e) => handleSubjectChange(index, 'subjectMasterId', Number(e.target.value))}
                      >
                        {availableSubjects
                          .filter(s => s.id === subject.subjectMasterId || 
                                     !assignedSubjects.some(assigned => assigned.subjectMasterId === s.id))
                          .map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.subjectName} ({s.subjectCode})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {getSubjectTypeChip(subject.subjectType)}
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={subject.totalMarks}
                      onChange={(e) => handleSubjectChange(index, 'totalMarks', Number(e.target.value))}
                      inputProps={{ min: 1 }}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={subject.passingMarks}
                      onChange={(e) => handleSubjectChange(index, 'passingMarks', Number(e.target.value))}
                      inputProps={{ min: 1, max: subject.totalMarks }}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={subject.theoryMarks}
                      onChange={(e) => handleSubjectChange(index, 'theoryMarks', Number(e.target.value))}
                      inputProps={{ min: 0, max: subject.totalMarks }}
                      sx={{ width: 80 }}
                      disabled={subject.subjectType === SubjectType.PRACTICAL}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={subject.practicalMarks}
                      onChange={(e) => handleSubjectChange(index, 'practicalMarks', Number(e.target.value))}
                      inputProps={{ min: 0, max: subject.totalMarks }}
                      sx={{ width: 80 }}
                      disabled={subject.subjectType === SubjectType.THEORY}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Remove Subject">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveSubject(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {assignedSubjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No subjects assigned. Click "Add Subject" to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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

export default SimplifiedClassConfigurationModal;
