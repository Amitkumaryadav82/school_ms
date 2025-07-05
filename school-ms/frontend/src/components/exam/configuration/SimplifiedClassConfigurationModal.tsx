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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  ClassConfigurationRequest,
  ClassConfiguration,
  ConfigurationSubject,
  ConfigurationSubjectRequest,
  SubjectMaster,
  SubjectType,
} from '../../../types/examConfiguration';
import classConfigurationService from '../../../services/classConfigurationService';
import subjectMasterService from '../../../services/subjectMasterService';
import configurationSubjectService from '../../../services/configurationSubjectService';

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
        // Load existing subjects for edit mode
        loadExistingSubjects(configuration.id!);
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
        // Copy subjects from source config
        if (sourceConfig.id) {
          loadExistingSubjects(sourceConfig.id);
        }
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

  const loadExistingSubjects = async (configurationId: number) => {
    try {
      const existingSubjects = await configurationSubjectService.getSubjectsByConfiguration(configurationId);
      
      // Convert ConfigurationSubject to SubjectFormData
      const formSubjects: SubjectFormData[] = existingSubjects.map(subject => ({
        subjectMasterId: subject.subjectMasterId,
        totalMarks: subject.totalMarks,
        passingMarks: subject.passingMarks,
        theoryMarks: subject.theoryMarks || 0,
        practicalMarks: subject.practicalMarks || 0,
        subjectType: subject.effectiveSubjectType,
      }));
      
      setAssignedSubjects(formSubjects);
    } catch (error) {
      console.error('Failed to load existing subjects:', error);
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
      const totalMarks = 100;
      const passingMarks = 40;
      
      let theoryMarks = 0;
      let practicalMarks = 0;
      
      switch (availableSubject.subjectType) {
        case SubjectType.THEORY:
          theoryMarks = totalMarks;
          practicalMarks = 0;
          break;
        case SubjectType.PRACTICAL:
          theoryMarks = 0;
          practicalMarks = totalMarks;
          break;
        case SubjectType.BOTH:
          theoryMarks = 70;
          practicalMarks = 30;
          break;
        default:
          theoryMarks = totalMarks;
          practicalMarks = 0;
      }

      const newSubject: SubjectFormData = {
        subjectMasterId: availableSubject.id!,
        totalMarks,
        passingMarks,
        theoryMarks,
        practicalMarks,
        subjectType: availableSubject.subjectType,
      };
      setAssignedSubjects(prev => [...prev, newSubject]);
    }
  };

  const handleRemoveSubject = (index: number) => {
    setAssignedSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index: number, field: keyof SubjectFormData, value: any) => {
    setAssignedSubjects(prev => prev.map((subject, i) => {
      if (i === index) {
        if (field === 'subjectMasterId') {
          // When subject is changed, update the subject type and reset marks accordingly
          const selectedSubject = availableSubjects.find(s => s.id === value);
          if (selectedSubject) {
            let theoryMarks = 0;
            let practicalMarks = 0;
            
            switch (selectedSubject.subjectType) {
              case SubjectType.THEORY:
                theoryMarks = subject.totalMarks;
                practicalMarks = 0;
                break;
              case SubjectType.PRACTICAL:
                theoryMarks = 0;
                practicalMarks = subject.totalMarks;
                break;
              case SubjectType.BOTH:
                theoryMarks = Math.floor(subject.totalMarks * 0.7);
                practicalMarks = subject.totalMarks - theoryMarks;
                break;
            }

            return {
              ...subject,
              [field]: value,
              subjectType: selectedSubject.subjectType,
              theoryMarks,
              practicalMarks,
            };
          }
        } else if (field === 'totalMarks') {
          // When total marks change, update theory/practical proportionally
          const newTotalMarks = Number(value);
          let theoryMarks = subject.theoryMarks;
          let practicalMarks = subject.practicalMarks;
          
          if (subject.subjectType === SubjectType.THEORY) {
            theoryMarks = newTotalMarks;
            practicalMarks = 0;
          } else if (subject.subjectType === SubjectType.PRACTICAL) {
            theoryMarks = 0;
            practicalMarks = newTotalMarks;
          } else if (subject.subjectType === SubjectType.BOTH) {
            // Maintain the same proportion
            const oldTotal = subject.totalMarks;
            if (oldTotal > 0) {
              theoryMarks = Math.floor((subject.theoryMarks / oldTotal) * newTotalMarks);
              practicalMarks = newTotalMarks - theoryMarks;
            } else {
              theoryMarks = Math.floor(newTotalMarks * 0.7);
              practicalMarks = newTotalMarks - theoryMarks;
            }
          }

          return {
            ...subject,
            [field]: value,
            theoryMarks,
            practicalMarks,
          };
        }
        return { ...subject, [field]: value };
      }
      return subject;
    }));
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
      console.log('Assigned subjects:', assignedSubjects);

      let savedConfig: ClassConfiguration;

      // Step 1: Save the basic class configuration
      if (mode === 'edit' && configuration) {
        savedConfig = await classConfigurationService.updateConfiguration(configuration.id!, formData);
      } else {
        savedConfig = await classConfigurationService.createConfiguration(formData);
      }

      console.log('Saved configuration:', savedConfig);

      // Step 2: Handle subjects for edit mode vs create mode
      if (mode === 'edit' && configuration?.id) {
        // For edit mode: first delete existing subjects, then add new ones
        try {
          const existingSubjects = await configurationSubjectService.getSubjectsByConfiguration(configuration.id);
          
          // Delete existing subjects
          for (const subject of existingSubjects) {
            if (subject.id) {
              await configurationSubjectService.deleteConfigurationSubject(subject.id);
            }
          }
        } catch (error) {
          console.warn('Failed to delete some existing subjects:', error);
        }
      }

      // Step 3: Save assigned subjects if any
      if (assignedSubjects.length > 0) {
        const subjectRequests: ConfigurationSubjectRequest[] = assignedSubjects.map(subject => ({
          classConfigurationId: savedConfig.id!,
          subjectMasterId: subject.subjectMasterId,
          effectiveSubjectType: subject.subjectType,
          totalMarks: subject.totalMarks,
          passingMarks: subject.passingMarks,
          theoryMarks: subject.theoryMarks > 0 ? subject.theoryMarks : undefined,
          practicalMarks: subject.practicalMarks > 0 ? subject.practicalMarks : undefined,
          theoryPassingMarks: subject.subjectType !== SubjectType.PRACTICAL && subject.theoryMarks > 0 
            ? Math.floor(subject.passingMarks * (subject.theoryMarks / subject.totalMarks)) 
            : undefined,
          practicalPassingMarks: subject.subjectType !== SubjectType.THEORY && subject.practicalMarks > 0 
            ? Math.floor(subject.passingMarks * (subject.practicalMarks / subject.totalMarks)) 
            : undefined,
          isActive: true,
        }));

        console.log('Saving subjects:', subjectRequests);

        // Save each subject (could be optimized with batch API if available)
        const savedSubjects: ConfigurationSubject[] = [];
        const failedSubjects: string[] = [];

        for (const subjectRequest of subjectRequests) {
          try {
            const savedSubject = await configurationSubjectService.createConfigurationSubject(subjectRequest);
            savedSubjects.push(savedSubject);
          } catch (error) {
            console.error('Failed to save subject:', subjectRequest, error);
            const subject = availableSubjects.find(s => s.id === subjectRequest.subjectMasterId);
            failedSubjects.push(subject?.subjectName || `Subject ID ${subjectRequest.subjectMasterId}`);
          }
        }

        console.log('Saved subjects:', savedSubjects);
        
        if (failedSubjects.length > 0) {
          setSubmitError(
            `Configuration saved successfully, but failed to save these subjects: ${failedSubjects.join(', ')}. ` +
            `You can add them later by editing this configuration.`
          );
          // Don't close the modal yet, let user see the error
          return;
        }
      }

      // Success - close modal and notify parent
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
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div">
          {getTitle()}
        </Typography>
        {mode === 'copy' && sourceConfig && (
          <Typography variant="body2" color="text.secondary">
            Copying from {sourceConfig.className} ({sourceConfig.academicYear})
          </Typography>
        )}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
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

          <Grid item xs={12} sm={4}>
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

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Description (optional)"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              placeholder="Brief description..."
            />
          </Grid>
        </Grid>

        {/* Subject Assignment */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Subjects & Marks
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSubject}
            disabled={unassignedSubjects.length === 0}
            size="small"
          >
            Add Subject
          </Button>
        </Box>

        {unassignedSubjects.length === 0 && assignedSubjects.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            All available subjects have been assigned. To add more subjects, first create them in Subject Master.
          </Alert>
        )}

        {availableSubjects.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No subjects available. Please create subjects in Subject Master before configuring classes.
          </Alert>
        )}

        {assignedSubjects.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>{assignedSubjects.length}</strong> subjects assigned • Total: <strong>{getTotalMarks()}</strong> marks
            </Typography>
          </Alert>
        )}

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Subject</strong></TableCell>
                <TableCell align="center"><strong>Type</strong></TableCell>
                <TableCell align="center"><strong>Total</strong></TableCell>
                <TableCell align="center"><strong>Pass</strong></TableCell>
                <TableCell align="center"><strong>Theory</strong></TableCell>
                <TableCell align="center"><strong>Practical</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedSubjects.map((subject, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={subject.subjectMasterId}
                        onChange={(e) => handleSubjectChange(index, 'subjectMasterId', Number(e.target.value))}
                        displayEmpty
                      >
                        {availableSubjects
                          .filter(s => s.id === subject.subjectMasterId || 
                                     !assignedSubjects.some(assigned => assigned.subjectMasterId === s.id))
                          .map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {s.subjectName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {s.subjectCode}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    {getSubjectTypeChip(subject.subjectType)}
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      value={subject.totalMarks}
                      onChange={(e) => handleSubjectChange(index, 'totalMarks', Number(e.target.value))}
                      inputProps={{ min: 1, style: { textAlign: 'center' } }}
                      sx={{ width: 70 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      value={subject.passingMarks}
                      onChange={(e) => handleSubjectChange(index, 'passingMarks', Number(e.target.value))}
                      inputProps={{ min: 1, max: subject.totalMarks, style: { textAlign: 'center' } }}
                      sx={{ width: 70 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      value={subject.theoryMarks}
                      onChange={(e) => handleSubjectChange(index, 'theoryMarks', Number(e.target.value))}
                      inputProps={{ min: 0, max: subject.totalMarks, style: { textAlign: 'center' } }}
                      sx={{ width: 70 }}
                      disabled={subject.subjectType === SubjectType.PRACTICAL}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      value={subject.practicalMarks}
                      onChange={(e) => handleSubjectChange(index, 'practicalMarks', Number(e.target.value))}
                      inputProps={{ min: 0, max: subject.totalMarks, style: { textAlign: 'center' } }}
                      sx={{ width: 70 }}
                      disabled={subject.subjectType === SubjectType.THEORY}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveSubject(index)}
                      color="error"
                      sx={{ '&:hover': { backgroundColor: 'error.light', color: 'white' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {assignedSubjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No subjects assigned yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Click "Add Subject" to start building your class configuration
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.className || !formData.academicYear}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Saving...' : (mode === 'edit' ? 'Update Configuration' : 'Create Configuration')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimplifiedClassConfigurationModal;
