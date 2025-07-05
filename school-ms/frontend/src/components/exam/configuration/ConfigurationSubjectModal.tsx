import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Alert,
  Grid,
  Chip,
  Autocomplete,
  Divider
} from '@mui/material';
import { 
  ConfigurationSubject, 
  ConfigurationSubjectRequest, 
  SubjectType, 
  SubjectMaster,
  ClassConfiguration 
} from '../../../types/examConfiguration';
import configurationSubjectService from '../../../services/configurationSubjectService';
import subjectMasterService from '../../../services/subjectMasterService';
import Loading from '../../Loading';

interface ConfigurationSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  configurationSubject?: ConfigurationSubject;
  classConfiguration: ClassConfiguration;
  mode: 'add' | 'edit' | 'view';
}

const ConfigurationSubjectModal: React.FC<ConfigurationSubjectModalProps> = ({
  open,
  onClose,
  onSave,
  configurationSubject,
  classConfiguration,
  mode
}) => {
  const [formData, setFormData] = useState<ConfigurationSubjectRequest>({
    classConfigurationId: classConfiguration.id || 0,
    subjectMasterId: 0,
    effectiveSubjectType: SubjectType.THEORY,
    totalMarks: 100,
    passingMarks: 35,
    theoryMarks: undefined,
    practicalMarks: undefined,
    theoryPassingMarks: undefined,
    practicalPassingMarks: undefined,
    isActive: true
  });

  const [availableSubjects, setAvailableSubjects] = useState<SubjectMaster[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectMaster | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const isReadOnly = mode === 'view';
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      loadAvailableSubjects();
      if (configurationSubject && (mode === 'edit' || mode === 'view')) {
        populateForm(configurationSubject);
      } else {
        resetForm();
      }
    }
  }, [configurationSubject, mode, open, classConfiguration]);

  useEffect(() => {
    // Auto-calculate marks distribution when effective subject type changes
    if (formData.effectiveSubjectType && formData.totalMarks) {
      calculateMarksDistribution();
    }
  }, [formData.effectiveSubjectType, formData.totalMarks]);

  const loadAvailableSubjects = async () => {
    try {
      const subjects = await subjectMasterService.getAllActiveSubjects();
      setAvailableSubjects(subjects);
    } catch (err: any) {
      setError('Failed to load subjects');
    }
  };

  const populateForm = (configSubject: ConfigurationSubject) => {
    setFormData({
      classConfigurationId: configSubject.classConfigurationId,
      subjectMasterId: configSubject.subjectMasterId,
      effectiveSubjectType: configSubject.effectiveSubjectType,
      totalMarks: configSubject.totalMarks,
      passingMarks: configSubject.passingMarks,
      theoryMarks: configSubject.theoryMarks,
      practicalMarks: configSubject.practicalMarks,
      theoryPassingMarks: configSubject.theoryPassingMarks,
      practicalPassingMarks: configSubject.practicalPassingMarks,
      isActive: configSubject.isActive
    });

    // Find and set the selected subject
    const subject = availableSubjects.find(s => s.id === configSubject.subjectMasterId);
    setSelectedSubject(subject || null);
  };

  const resetForm = () => {
    setFormData({
      classConfigurationId: classConfiguration.id || 0,
      subjectMasterId: 0,
      effectiveSubjectType: SubjectType.THEORY,
      totalMarks: 100,
      passingMarks: 35,
      theoryMarks: undefined,
      practicalMarks: undefined,
      theoryPassingMarks: undefined,
      practicalPassingMarks: undefined,
      isActive: true
    });
    setSelectedSubject(null);
    setError(null);
    setValidationErrors([]);
  };

  const calculateMarksDistribution = () => {
    const { effectiveSubjectType, totalMarks } = formData;
    
    setFormData(prev => {
      const updated = { ...prev };
      
      switch (effectiveSubjectType) {
        case SubjectType.THEORY:
          updated.theoryMarks = totalMarks;
          updated.practicalMarks = undefined;
          updated.theoryPassingMarks = Math.ceil(totalMarks * 0.35); // 35% default
          updated.practicalPassingMarks = undefined;
          break;
          
        case SubjectType.PRACTICAL:
          updated.theoryMarks = undefined;
          updated.practicalMarks = totalMarks;
          updated.theoryPassingMarks = undefined;
          updated.practicalPassingMarks = Math.ceil(totalMarks * 0.35); // 35% default
          break;
          
        case SubjectType.BOTH:
          // Default 70-30 split for theory-practical
          updated.theoryMarks = Math.ceil(totalMarks * 0.7);
          updated.practicalMarks = totalMarks - updated.theoryMarks;
          updated.theoryPassingMarks = Math.ceil(updated.theoryMarks * 0.35);
          updated.practicalPassingMarks = Math.ceil(updated.practicalMarks * 0.35);
          break;
      }
      
      return updated;
    });
  };

  const handleSubjectChange = (subject: SubjectMaster | null) => {
    if (isReadOnly) return;
    
    setSelectedSubject(subject);
    if (subject) {
      setFormData(prev => ({
        ...prev,
        subjectMasterId: subject.id!,
        effectiveSubjectType: subject.subjectType // Default to subject's original type
      }));
    }
  };

  const handleInputChange = (field: keyof ConfigurationSubjectRequest, value: any) => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.subjectMasterId) {
      errors.push('Subject selection is required');
    }
    
    if (!formData.totalMarks || formData.totalMarks < 1) {
      errors.push('Total marks must be at least 1');
    }
    
    if (!formData.passingMarks || formData.passingMarks < 1) {
      errors.push('Passing marks must be at least 1');
    }
    
    if (formData.passingMarks > formData.totalMarks) {
      errors.push('Passing marks cannot exceed total marks');
    }
    
    // Validate marks distribution based on effective subject type
    switch (formData.effectiveSubjectType) {
      case SubjectType.THEORY:
        if (!formData.theoryMarks || formData.theoryMarks !== formData.totalMarks) {
          errors.push('Theory marks must equal total marks for theory-only subjects');
        }
        if (formData.practicalMarks) {
          errors.push('Practical marks should not be set for theory-only subjects');
        }
        break;
        
      case SubjectType.PRACTICAL:
        if (!formData.practicalMarks || formData.practicalMarks !== formData.totalMarks) {
          errors.push('Practical marks must equal total marks for practical-only subjects');
        }
        if (formData.theoryMarks) {
          errors.push('Theory marks should not be set for practical-only subjects');
        }
        break;
        
      case SubjectType.BOTH:
        if (!formData.theoryMarks || !formData.practicalMarks) {
          errors.push('Both theory and practical marks are required');
        } else if (formData.theoryMarks + formData.practicalMarks !== formData.totalMarks) {
          errors.push('Theory marks + Practical marks must equal total marks');
        }
        break;
    }
    
    // Validate passing marks for components
    if (formData.theoryMarks && formData.theoryPassingMarks && formData.theoryPassingMarks > formData.theoryMarks) {
      errors.push('Theory passing marks cannot exceed theory marks');
    }
    
    if (formData.practicalMarks && formData.practicalPassingMarks && formData.practicalPassingMarks > formData.practicalMarks) {
      errors.push('Practical passing marks cannot exceed practical marks');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit && configurationSubject?.id) {
        await configurationSubjectService.updateConfigurationSubject(configurationSubject.id, formData);
      } else {
        await configurationSubjectService.createConfigurationSubject(formData);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} subject configuration`);
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'add': return 'Add Subject to Class';
      case 'edit': return 'Edit Subject Configuration';
      case 'view': return 'View Subject Configuration';
      default: return 'Subject Configuration';
    }
  };

  const getSubjectTypeOptions = () => [
    { value: SubjectType.THEORY, label: 'Theory Only', description: 'Written examinations only' },
    { value: SubjectType.PRACTICAL, label: 'Practical Only', description: 'Hands-on examinations only' },
    { value: SubjectType.BOTH, label: 'Theory & Practical', description: 'Both written and practical components' }
  ];

  const renderMarksFields = () => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box mb={1}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Total Marks *
            </Typography>
            <TextField
              value={formData.totalMarks}
              onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value) || 0)}
              fullWidth
              required
              disabled={isReadOnly}
              type="number"
              inputProps={{ min: 1, max: 1000 }}
              variant="outlined"
              size="small"
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box mb={1}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Passing Marks *
            </Typography>
            <TextField
              value={formData.passingMarks}
              onChange={(e) => handleInputChange('passingMarks', parseInt(e.target.value) || 0)}
              fullWidth
              required
              disabled={isReadOnly}
              type="number"
              inputProps={{ min: 1, max: formData.totalMarks }}
              variant="outlined"
              size="small"
            />
          </Box>
        </Grid>

        {formData.effectiveSubjectType === SubjectType.THEORY && (
          <>
            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Theory Marks *
                </Typography>
                <TextField
                  value={formData.theoryMarks || ''}
                  onChange={(e) => handleInputChange('theoryMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.totalMarks }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Theory Passing Marks *
                </Typography>
                <TextField
                  value={formData.theoryPassingMarks || ''}
                  onChange={(e) => handleInputChange('theoryPassingMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.theoryMarks }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
          </>
        )}

        {formData.effectiveSubjectType === SubjectType.PRACTICAL && (
          <>
            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Practical Marks *
                </Typography>
                <TextField
                  value={formData.practicalMarks || ''}
                  onChange={(e) => handleInputChange('practicalMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.totalMarks }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Practical Passing Marks *
                </Typography>
                <TextField
                  value={formData.practicalPassingMarks || ''}
                  onChange={(e) => handleInputChange('practicalPassingMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.practicalMarks }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
          </>
        )}

        {formData.effectiveSubjectType === SubjectType.BOTH && (
          <>
            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Theory Marks *
                </Typography>
                <TextField
                  value={formData.theoryMarks || ''}
                  onChange={(e) => handleInputChange('theoryMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.totalMarks - (formData.practicalMarks || 0) }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Practical Marks *
                </Typography>
                <TextField
                  value={formData.practicalMarks || ''}
                  onChange={(e) => handleInputChange('practicalMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.totalMarks - (formData.theoryMarks || 0) }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Theory Passing Marks *
                </Typography>
                <TextField
                  value={formData.theoryPassingMarks || ''}
                  onChange={(e) => handleInputChange('theoryPassingMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.theoryMarks }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Practical Passing Marks *
                </Typography>
                <TextField
                  value={formData.practicalPassingMarks || ''}
                  onChange={(e) => handleInputChange('practicalPassingMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.practicalMarks }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: isReadOnly ? 500 : 600 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{getModalTitle()}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {classConfiguration.className} - {classConfiguration.section} ({classConfiguration.academicYear})
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && <Loading />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" component="div">
              Please fix the following errors:
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box mb={1}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Subject *
              </Typography>
              <Autocomplete
                options={availableSubjects}
                getOptionLabel={(option) => `${option.subjectCode} - ${option.subjectName}`}
                value={selectedSubject}
                onChange={(_, newValue) => handleSubjectChange(newValue)}
                disabled={isReadOnly || isEdit} // Disable in edit mode
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select a subject"
                    variant="outlined"
                    size="small"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {option.subjectCode} - {option.subjectName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.subjectType} | {option.description}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
              {selectedSubject && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Original Type: {selectedSubject.subjectType}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box mb={1}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Subject Type for This Class *
              </Typography>
              <FormControl fullWidth size="small" disabled={isReadOnly}>
                <Select
                  value={formData.effectiveSubjectType}
                  onChange={(e) => handleInputChange('effectiveSubjectType', e.target.value)}
                  variant="outlined"
                >
                  {getSubjectTypeOptions().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {option.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedSubject && formData.effectiveSubjectType !== selectedSubject.subjectType && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    Note: You are overriding the subject's default type ({selectedSubject.subjectType}) 
                    to {formData.effectiveSubjectType} for this class only.
                  </Typography>
                </Alert>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Marks Configuration</Typography>
            {renderMarksFields()}
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive || false}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  disabled={isReadOnly}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Active</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Only active subject configurations can be used for examinations
                  </Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        {!isReadOnly && (
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
          >
            {isEdit ? 'Update' : 'Add'} Subject
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Enhanced version of ConfigurationSubjectModal that can work with both standalone and embedded usage
interface ConfigurationSubjectModalEnhancedProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ConfigurationSubjectRequest) => void; // Return data instead of saving directly
  configurationId?: number; // Optional for embedded usage
  configurationSubject?: ConfigurationSubject;
  mode: 'add' | 'edit';
  excludeSubjectIds?: number[]; // Exclude already selected subjects
}

const ConfigurationSubjectModalEnhanced: React.FC<ConfigurationSubjectModalEnhancedProps> = ({
  open,
  onClose,
  onSave,
  configurationId,
  configurationSubject,
  mode,
  excludeSubjectIds = []
}) => {
  const [formData, setFormData] = useState<ConfigurationSubjectRequest>({
    classConfigurationId: 0,
    subjectMasterId: 0,
    effectiveSubjectType: SubjectType.THEORY,
    totalMarks: 100,
    passingMarks: 35,
    theoryMarks: undefined,
    practicalMarks: undefined,
    theoryPassingMarks: undefined,
    practicalPassingMarks: undefined,
    isActive: true
  });

  const [availableSubjects, setAvailableSubjects] = useState<SubjectMaster[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectMaster | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const isReadOnly = mode === 'view';
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      loadAvailableSubjects();
      if (configurationSubject && (mode === 'edit' || mode === 'view')) {
        populateForm(configurationSubject);
      } else {
        resetForm();
      }
    }
  }, [configurationSubject, mode, open]);

  useEffect(() => {
    // Auto-calculate marks distribution when effective subject type changes
    if (formData.effectiveSubjectType && formData.totalMarks) {
      calculateMarksDistribution();
    }
  }, [formData.effectiveSubjectType, formData.totalMarks]);

  const loadAvailableSubjects = async () => {
    try {
      const subjects = await subjectMasterService.getAllActiveSubjects();
      setAvailableSubjects(subjects);
    } catch (err: any) {
      setError('Failed to load subjects');
    }
  };

  const populateForm = (configSubject: ConfigurationSubject) => {
    setFormData({
      classConfigurationId: configSubject.classConfigurationId,
      subjectMasterId: configSubject.subjectMasterId,
      effectiveSubjectType: configSubject.effectiveSubjectType,
      totalMarks: configSubject.totalMarks,
      passingMarks: configSubject.passingMarks,
      theoryMarks: configSubject.theoryMarks,
      practicalMarks: configSubject.practicalMarks,
      theoryPassingMarks: configSubject.theoryPassingMarks,
      practicalPassingMarks: configSubject.practicalPassingMarks,
      isActive: configSubject.isActive
    });

    // Find and set the selected subject
    const subject = availableSubjects.find(s => s.id === configSubject.subjectMasterId);
    setSelectedSubject(subject || null);
  };

  const resetForm = () => {
    setFormData({
      classConfigurationId: 0,
      subjectMasterId: 0,
      effectiveSubjectType: SubjectType.THEORY,
      totalMarks: 100,
      passingMarks: 35,
      theoryMarks: undefined,
      practicalMarks: undefined,
      theoryPassingMarks: undefined,
      practicalPassingMarks: undefined,
      isActive: true
    });
    setSelectedSubject(null);
    setError(null);
    setValidationErrors([]);
  };

  const calculateMarksDistribution = () => {
    const { effectiveSubjectType, totalMarks } = formData;
    
    setFormData(prev => {
      const updated = { ...prev };
      
      switch (effectiveSubjectType) {
        case SubjectType.THEORY:
          updated.theoryMarks = totalMarks;
          updated.practicalMarks = undefined;
          updated.theoryPassingMarks = Math.ceil(totalMarks * 0.35); // 35% default
          updated.practicalPassingMarks = undefined;
          break;
          
        case SubjectType.PRACTICAL:
          updated.theoryMarks = undefined;
          updated.practicalMarks = totalMarks;
          updated.theoryPassingMarks = undefined;
          updated.practicalPassingMarks = Math.ceil(totalMarks * 0.35); // 35% default
          break;
          
        case SubjectType.BOTH:
          // Default 70-30 split for theory-practical
          updated.theoryMarks = Math.ceil(totalMarks * 0.7);
          updated.practicalMarks = totalMarks - updated.theoryMarks;
          updated.theoryPassingMarks = Math.ceil(updated.theoryMarks * 0.35);
          updated.practicalPassingMarks = Math.ceil(updated.practicalMarks * 0.35);
          break;
      }
      
      return updated;
    });
  };

  const handleSubjectChange = (subject: SubjectMaster | null) => {
    if (isReadOnly) return;
    
    setSelectedSubject(subject);
    if (subject) {
      setFormData(prev => ({
        ...prev,
        subjectMasterId: subject.id!,
        effectiveSubjectType: subject.subjectType // Default to subject's original type
      }));
    }
  };

  const handleInputChange = (field: keyof ConfigurationSubjectRequest, value: any) => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.subjectMasterId) {
      errors.push('Subject selection is required');
    }
    
    if (!formData.totalMarks || formData.totalMarks < 1) {
      errors.push('Total marks must be at least 1');
    }
    
    if (!formData.passingMarks || formData.passingMarks < 1) {
      errors.push('Passing marks must be at least 1');
    }
    
    if (formData.passingMarks > formData.totalMarks) {
      errors.push('Passing marks cannot exceed total marks');
    }
    
    // Validate marks distribution based on effective subject type
    switch (formData.effectiveSubjectType) {
      case SubjectType.THEORY:
        if (!formData.theoryMarks || formData.theoryMarks !== formData.totalMarks) {
          errors.push('Theory marks must equal total marks for theory-only subjects');
        }
        if (formData.practicalMarks) {
          errors.push('Practical marks should not be set for theory-only subjects');
        }
        break;
        
      case SubjectType.PRACTICAL:
        if (!formData.practicalMarks || formData.practicalMarks !== formData.totalMarks) {
          errors.push('Practical marks must equal total marks for practical-only subjects');
        }
        if (formData.theoryMarks) {
          errors.push('Theory marks should not be set for practical-only subjects');
        }
        break;
        
      case SubjectType.BOTH:
        if (!formData.theoryMarks || !formData.practicalMarks) {
          errors.push('Both theory and practical marks are required');
        } else if (formData.theoryMarks + formData.practicalMarks !== formData.totalMarks) {
          errors.push('Theory marks + Practical marks must equal total marks');
        }
        break;
    }
    
    // Validate passing marks for components
    if (formData.theoryMarks && formData.theoryPassingMarks && formData.theoryPassingMarks > formData.theoryMarks) {
      errors.push('Theory passing marks cannot exceed theory marks');
    }
    
    if (formData.practicalMarks && formData.practicalPassingMarks && formData.practicalPassingMarks > formData.practicalMarks) {
      errors.push('Practical passing marks cannot exceed practical marks');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit && configurationSubject?.id) {
        await configurationSubjectService.updateConfigurationSubject(configurationSubject.id, formData);
      } else {
        await configurationSubjectService.createConfigurationSubject(formData);
      }

      onSave(formData); // Return data via onSave callback
      onClose();
    } catch (err: any) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} subject configuration`);
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'add': return 'Add Subject to Class';
      case 'edit': return 'Edit Subject Configuration';
      case 'view': return 'View Subject Configuration';
      default: return 'Subject Configuration';
    }
  };

  const getSubjectTypeOptions = () => [
    { value: SubjectType.THEORY, label: 'Theory Only', description: 'Written examinations only' },
    { value: SubjectType.PRACTICAL, label: 'Practical Only', description: 'Hands-on examinations only' },
    { value: SubjectType.BOTH, label: 'Theory & Practical', description: 'Both written and practical components' }
  ];

  const renderMarksFields = () => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box mb={1}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Total Marks *
            </Typography>
            <TextField
              value={formData.totalMarks}
              onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value) || 0)}
              fullWidth
              required
              disabled={isReadOnly}
              type="number"
              inputProps={{ min: 1, max: 1000 }}
              variant="outlined"
              size="small"
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box mb={1}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Passing Marks *
            </Typography>
            <TextField
              value={formData.passingMarks}
              onChange={(e) => handleInputChange('passingMarks', parseInt(e.target.value) || 0)}
              fullWidth
              required
              disabled={isReadOnly}
              type="number"
              inputProps={{ min: 1, max: formData.totalMarks }}
              variant="outlined"
              size="small"
            />
          </Box>
        </Grid>

        {formData.effectiveSubjectType === SubjectType.THEORY && (
          <>
            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Theory Marks *
                </Typography>
                <TextField
                  value={formData.theoryMarks || ''}
                  onChange={(e) => handleInputChange('theoryMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.totalMarks }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Theory Passing Marks *
                </Typography>
                <TextField
                  value={formData.theoryPassingMarks || ''}
                  onChange={(e) => handleInputChange('theoryPassingMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.theoryMarks }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
          </>
        )}

        {formData.effectiveSubjectType === SubjectType.PRACTICAL && (
          <>
            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Practical Marks *
                </Typography>
                <TextField
                  value={formData.practicalMarks || ''}
                  onChange={(e) => handleInputChange('practicalMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.totalMarks }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Practical Passing Marks *
                </Typography>
                <TextField
                  value={formData.practicalPassingMarks || ''}
                  onChange={(e) => handleInputChange('practicalPassingMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.practicalMarks }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
          </>
        )}

        {formData.effectiveSubjectType === SubjectType.BOTH && (
          <>
            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Theory Marks *
                </Typography>
                <TextField
                  value={formData.theoryMarks || ''}
                  onChange={(e) => handleInputChange('theoryMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.totalMarks - (formData.practicalMarks || 0) }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Practical Marks *
                </Typography>
                <TextField
                  value={formData.practicalMarks || ''}
                  onChange={(e) => handleInputChange('practicalMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.totalMarks - (formData.theoryMarks || 0) }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Theory Passing Marks *
                </Typography>
                <TextField
                  value={formData.theoryPassingMarks || ''}
                  onChange={(e) => handleInputChange('theoryPassingMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.theoryMarks }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Practical Passing Marks *
                </Typography>
                <TextField
                  value={formData.practicalPassingMarks || ''}
                  onChange={(e) => handleInputChange('practicalPassingMarks', parseInt(e.target.value) || undefined)}
                  fullWidth
                  required
                  disabled={isReadOnly}
                  type="number"
                  inputProps={{ min: 1, max: formData.practicalMarks }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: isReadOnly ? 500 : 600 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{getModalTitle()}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {classConfiguration.className} - {classConfiguration.section} ({classConfiguration.academicYear})
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && <Loading />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" component="div">
              Please fix the following errors:
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box mb={1}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Subject *
              </Typography>
              <Autocomplete
                options={availableSubjects}
                getOptionLabel={(option) => `${option.subjectCode} - ${option.subjectName}`}
                value={selectedSubject}
                onChange={(_, newValue) => handleSubjectChange(newValue)}
                disabled={isReadOnly || isEdit} // Disable in edit mode
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select a subject"
                    variant="outlined"
                    size="small"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {option.subjectCode} - {option.subjectName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.subjectType} | {option.description}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
              {selectedSubject && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Original Type: {selectedSubject.subjectType}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box mb={1}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Subject Type for This Class *
              </Typography>
              <FormControl fullWidth size="small" disabled={isReadOnly}>
                <Select
                  value={formData.effectiveSubjectType}
                  onChange={(e) => handleInputChange('effectiveSubjectType', e.target.value)}
                  variant="outlined"
                >
                  {getSubjectTypeOptions().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {option.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedSubject && formData.effectiveSubjectType !== selectedSubject.subjectType && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    Note: You are overriding the subject's default type ({selectedSubject.subjectType}) 
                    to {formData.effectiveSubjectType} for this class only.
                  </Typography>
                </Alert>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Marks Configuration</Typography>
            {renderMarksFields()}
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive || false}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  disabled={isReadOnly}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Active</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Only active subject configurations can be used for examinations
                  </Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        {!isReadOnly && (
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
          >
            {isEdit ? 'Update' : 'Add'} Subject
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfigurationSubjectModal;
