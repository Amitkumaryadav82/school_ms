import React, { useState, useEffect, useCallback } from 'react';
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
  Tabs,
  Tab,
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
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon
} from '@mui/icons-material';
import {
  ClassConfigurationRequest,
  ClassConfiguration,
  ConfigurationSubject,
  ConfigurationSubjectRequest,
  SubjectMaster,
  SubjectType,
  CopyConfigurationRequest,
} from '../../../types/examConfiguration';
import classConfigurationService from '../../../services/classConfigurationService';
import configurationSubjectService from '../../../services/configurationSubjectService';
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

const EnhancedClassConfigurationModal: React.FC<ClassConfigurationModalProps> = ({
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

  // Subject assignment state
  const [subjects, setSubjects] = useState<ConfigurationSubject[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectMaster[]>([]);
  const [showAddSubjectForm, setShowAddSubjectForm] = useState(false);
  const [editingSubjectIndex, setEditingSubjectIndex] = useState<number | null>(null);
  
  // Add subject form state
  const [newSubjectForm, setNewSubjectForm] = useState({
    subjectMasterId: 0,
    effectiveSubjectType: SubjectType.THEORY,
    totalMarks: 100,
    passingMarks: 40,
    theoryMarks: 0,
    practicalMarks: 0,
    theoryPassingMarks: 0,
    practicalPassingMarks: 0,
  });

  // Copy functionality
  const [sourceConfigurations, setSourceConfigurations] = useState<ClassConfiguration[]>([]);
  const [selectedCopySource, setSelectedCopySource] = useState<ClassConfiguration | null>(null);

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

  const resetForm = useCallback(() => {
    setFormData({
      className: '',
      section: '',
      academicYear: new Date().getFullYear().toString(),
      description: '',
      isActive: true,
    });
    setSubjects([]);
    setSelectedCopySource(null);
    setActiveTab(0);
    setErrors({});
    setSubmitError('');
    setShowAddSubjectForm(false);
    setEditingSubjectIndex(null);
  }, []);

  const loadAvailableSubjects = useCallback(async () => {
    try {
      const allSubjects = await subjectMasterService.getAllActiveSubjects();
      setAvailableSubjects(allSubjects);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  }, []);

  const loadSourceConfigurations = useCallback(async () => {
    try {
      const configs = await classConfigurationService.getAllActiveConfigurations();
      setSourceConfigurations(configs.filter(c => c.id !== configuration?.id));
    } catch (error) {
      console.error('Failed to load source configurations:', error);
    }
  }, [configuration?.id]);

  const loadConfigurationSubjects = useCallback(async (configId: number) => {
    try {
      const configSubjects = await configurationSubjectService.getSubjectsByConfiguration(configId);
      setSubjects(configSubjects);
    } catch (error) {
      console.error('Failed to load configuration subjects:', error);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    
    // Load available subjects and source configurations only once when modal opens
    loadAvailableSubjects();
    loadSourceConfigurations();
  }, [open, loadAvailableSubjects, loadSourceConfigurations]);

  useEffect(() => {
    if (!open) return;

    if (configuration && mode === 'edit') {
      setFormData({
        className: configuration.className,
        section: configuration.section,
        academicYear: configuration.academicYear,
        description: configuration.description || '',
        isActive: configuration.isActive,
      });
      if (configuration.id) {
        loadConfigurationSubjects(configuration.id);
      }
    } else if (sourceConfig && mode === 'copy') {
      setFormData({
        className: '',
        section: '',
        academicYear: new Date().getFullYear().toString(),
        description: sourceConfig.description || '',
        isActive: true,
      });
      setSelectedCopySource(sourceConfig);
    } else if (mode === 'create') {
      resetForm();
    }
  }, [open, configuration?.id, mode, sourceConfig?.id, loadConfigurationSubjects, resetForm]);

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

  const handleAddSubject = () => {
    setNewSubjectForm({
      subjectMasterId: 0,
      effectiveSubjectType: SubjectType.THEORY,
      totalMarks: 100,
      passingMarks: 40,
      theoryMarks: 0,
      practicalMarks: 0,
      theoryPassingMarks: 0,
      practicalPassingMarks: 0,
    });
    setEditingSubjectIndex(null);
    setShowAddSubjectForm(true);
  };

  const handleEditSubject = (subject: ConfigurationSubject, index: number) => {
    setNewSubjectForm({
      subjectMasterId: subject.subjectMasterId,
      effectiveSubjectType: subject.effectiveSubjectType,
      totalMarks: subject.totalMarks,
      passingMarks: subject.passingMarks,
      theoryMarks: subject.theoryMarks || 0,
      practicalMarks: subject.practicalMarks || 0,
      theoryPassingMarks: subject.theoryPassingMarks || 0,
      practicalPassingMarks: subject.practicalPassingMarks || 0,
    });
    setEditingSubjectIndex(index);
    setShowAddSubjectForm(true);
  };

  const handleSaveSubject = () => {
    const subjectMaster = availableSubjects.find(s => s.id === newSubjectForm.subjectMasterId);
    if (!subjectMaster) return;

    const newSubject: ConfigurationSubject = {
      classConfigurationId: 0,
      subjectMasterId: newSubjectForm.subjectMasterId,
      subjectCode: subjectMaster.subjectCode,
      subjectName: subjectMaster.subjectName,
      subjectType: subjectMaster.subjectType,
      effectiveSubjectType: newSubjectForm.effectiveSubjectType,
      totalMarks: newSubjectForm.totalMarks,
      passingMarks: newSubjectForm.passingMarks,
      theoryMarks: newSubjectForm.theoryMarks,
      practicalMarks: newSubjectForm.practicalMarks,
      theoryPassingMarks: newSubjectForm.theoryPassingMarks,
      practicalPassingMarks: newSubjectForm.practicalPassingMarks,
      isActive: true,
    };

    if (editingSubjectIndex !== null) {
      setSubjects(prev => prev.map((s, index) => index === editingSubjectIndex ? newSubject : s));
    } else {
      setSubjects(prev => [...prev, newSubject]);
    }

    setShowAddSubjectForm(false);
    setEditingSubjectIndex(null);
  };

  const handleDeleteSubject = (subjectIndex: number) => {
    setSubjects(prev => prev.filter((_, index) => index !== subjectIndex));
  };

  const handleSubjectFormChange = (field: string, value: any) => {
    setNewSubjectForm(prev => ({ ...prev, [field]: value }));
  };

  const validateSubjectForm = (): boolean => {
    return newSubjectForm.subjectMasterId > 0 && 
           newSubjectForm.totalMarks > 0 && 
           newSubjectForm.passingMarks > 0 &&
           newSubjectForm.passingMarks <= newSubjectForm.totalMarks;
  };

  const handleCopyFromSource = async () => {
    if (!selectedCopySource) return;

    try {
      setLoading(true);
      const sourceSubjects = await configurationSubjectService.getSubjectsByConfiguration(selectedCopySource.id!);
      setSubjects(sourceSubjects.map(s => ({ ...s, id: undefined, classConfigurationId: 0 })));
    } catch (error) {
      setSubmitError('Failed to copy subjects from source configuration');
    } finally {
      setLoading(false);
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
        // Update existing configuration
        savedConfig = await classConfigurationService.updateConfiguration(configuration.id!, formData);
        
        // Update subjects if any changes
        if (subjects.length > 0) {
          // Delete existing subjects and recreate them
          const existingSubjects = await configurationSubjectService.getSubjectsByConfiguration(savedConfig.id!);
          await Promise.all(existingSubjects.map(s => configurationSubjectService.deleteConfigurationSubject(s.id!)));
          
          // Create new subjects
          const subjectRequests = subjects.map(s => ({
            classConfigurationId: savedConfig.id!,
            subjectMasterId: s.subjectMasterId,
            effectiveSubjectType: s.effectiveSubjectType,
            totalMarks: s.totalMarks,
            passingMarks: s.passingMarks,
            theoryMarks: s.theoryMarks,
            practicalMarks: s.practicalMarks,
            theoryPassingMarks: s.theoryPassingMarks,
            practicalPassingMarks: s.practicalPassingMarks,
          }));
          
          await Promise.all(subjectRequests.map(req => 
            configurationSubjectService.createConfigurationSubject(req)
          ));
        }
      } else {
        // Create new configuration
        savedConfig = await classConfigurationService.createConfiguration(formData);
        
        // Create subjects
        if (subjects.length > 0) {
          const subjectRequests = subjects.map(s => ({
            classConfigurationId: savedConfig.id!,
            subjectMasterId: s.subjectMasterId,
            effectiveSubjectType: s.effectiveSubjectType,
            totalMarks: s.totalMarks,
            passingMarks: s.passingMarks,
            theoryMarks: s.theoryMarks,
            practicalMarks: s.practicalMarks,
            theoryPassingMarks: s.theoryPassingMarks,
            practicalPassingMarks: s.practicalPassingMarks,
          }));
          
          await Promise.all(subjectRequests.map(req => 
            configurationSubjectService.createConfigurationSubject(req)
          ));
        }
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
    return subjects.reduce((total, subject) => total + (subject.totalMarks || 0), 0);
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

  const isFormValid = () => {
    return validateBasicForm();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>{getTitle()}</DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Basic Configuration" />
            <Tab label="Subject Assignment" />
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

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => handleBasicFormChange('isActive', e.target.checked)}
                    />
                  }
                  label="Active Configuration"
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
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Subject Assignment</Typography>
                <Box display="flex" gap={1}>
                  {mode === 'copy' && selectedCopySource && (
                    <Button
                      variant="outlined"
                      startIcon={<CopyIcon />}
                      onClick={handleCopyFromSource}
                      disabled={loading}
                    >
                      Copy from {selectedCopySource.className} {selectedCopySource.section}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddSubject}
                  >
                    Add Subject
                  </Button>
                </Box>
              </Box>

              {mode === 'copy' && !selectedCopySource && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Autocomplete
                    options={sourceConfigurations}
                    getOptionLabel={(option) => `${option.className} ${option.section} - ${option.academicYear}`}
                    value={selectedCopySource}
                    onChange={(_, value) => setSelectedCopySource(value)}
                    renderInput={(params) => (
                      <TextField {...params} label="Copy subjects from" fullWidth />
                    )}
                  />
                </Alert>
              )}

              {subjects.length > 0 && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Total Subjects: {subjects.length} | Total Marks: {getTotalMarks()}
                  </Typography>
                </Box>
              )}

              {showAddSubjectForm && (
                <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
                  <Typography variant="h6" gutterBottom>
                    {editingSubjectIndex !== null ? 'Edit Subject' : 'Add Subject'}
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Subject</InputLabel>
                        <Select
                          value={newSubjectForm.subjectMasterId}
                          label="Subject"
                          onChange={(e) => handleSubjectFormChange('subjectMasterId', Number(e.target.value))}
                        >
                          {availableSubjects
                            .filter(s => !subjects.some(existing => existing.subjectMasterId === s.id) || 
                                       (editingSubjectIndex !== null && subjects[editingSubjectIndex]?.subjectMasterId === s.id))
                            .map((subject) => (
                            <MenuItem key={subject.id} value={subject.id}>
                              {subject.subjectName} ({subject.subjectCode})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Subject Type</InputLabel>
                        <Select
                          value={newSubjectForm.effectiveSubjectType}
                          label="Subject Type"
                          onChange={(e) => handleSubjectFormChange('effectiveSubjectType', e.target.value)}
                        >
                          <MenuItem value={SubjectType.THEORY}>Theory Only</MenuItem>
                          <MenuItem value={SubjectType.PRACTICAL}>Practical Only</MenuItem>
                          <MenuItem value={SubjectType.BOTH}>Theory + Practical</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Total Marks"
                        type="number"
                        value={newSubjectForm.totalMarks}
                        onChange={(e) => handleSubjectFormChange('totalMarks', Number(e.target.value))}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Passing Marks"
                        type="number"
                        value={newSubjectForm.passingMarks}
                        onChange={(e) => handleSubjectFormChange('passingMarks', Number(e.target.value))}
                        inputProps={{ min: 1, max: newSubjectForm.totalMarks }}
                      />
                    </Grid>

                    {newSubjectForm.effectiveSubjectType === SubjectType.BOTH && (
                      <>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="Theory Marks"
                            type="number"
                            value={newSubjectForm.theoryMarks}
                            onChange={(e) => handleSubjectFormChange('theoryMarks', Number(e.target.value))}
                            inputProps={{ min: 0, max: newSubjectForm.totalMarks }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="Practical Marks"
                            type="number"
                            value={newSubjectForm.practicalMarks}
                            onChange={(e) => handleSubjectFormChange('practicalMarks', Number(e.target.value))}
                            inputProps={{ min: 0, max: newSubjectForm.totalMarks }}
                          />
                        </Grid>
                      </>
                    )}

                    <Grid item xs={12}>
                      <Box display="flex" gap={2} justifyContent="flex-end">
                        <Button onClick={() => setShowAddSubjectForm(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSaveSubject}
                          disabled={!validateSubjectForm()}
                        >
                          {editingSubjectIndex !== null ? 'Update' : 'Add'} Subject
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Theory</TableCell>
                      <TableCell>Practical</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Pass</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjects.map((subject, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {subject.subjectName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {subject.subjectCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getSubjectTypeChip(subject.effectiveSubjectType || subject.subjectType)}
                        </TableCell>
                        <TableCell>{subject.theoryMarks || 0}</TableCell>
                        <TableCell>{subject.practicalMarks || 0}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {subject.totalMarks}
                          </Typography>
                        </TableCell>
                        <TableCell>{subject.passingMarks}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditSubject(subject, index)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteSubject(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {subjects.length === 0 && (
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
            disabled={loading || !isFormValid()}
          >
            {loading ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Create')} Configuration
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default EnhancedClassConfigurationModal;
