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
  Chip
} from '@mui/material';
import { SubjectMaster, SubjectMasterRequest, SubjectType } from '../../../types/examConfiguration';
import subjectMasterService from '../../../services/subjectMasterService';
import Loading from '../../Loading';

interface SubjectMasterModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  subject?: SubjectMaster;
  mode: 'add' | 'edit' | 'view';
}

const SubjectMasterModal: React.FC<SubjectMasterModalProps> = ({
  open,
  onClose,
  onSave,
  subject,
  mode
}) => {
  const [formData, setFormData] = useState<SubjectMasterRequest>({
    subjectCode: '',
    subjectName: '',
    description: '',
    subjectType: SubjectType.THEORY,
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const isReadOnly = mode === 'view';
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (subject && (mode === 'edit' || mode === 'view')) {
      setFormData({
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        description: subject.description || '',
        subjectType: subject.subjectType,
        isActive: subject.isActive
      });
    } else {
      // Reset form for add mode
      setFormData({
        subjectCode: '',
        subjectName: '',
        description: '',
        subjectType: SubjectType.THEORY,
        isActive: true
      });
    }
    setError(null);
    setValidationErrors([]);
  }, [subject, mode, open]);

  const handleInputChange = (field: keyof SubjectMasterRequest, value: any) => {
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
    const errors = subjectMasterService.validateSubjectRequest(formData);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const checkDuplicates = async (): Promise<boolean> => {
    try {
      // Check code uniqueness
      if (!isEdit || formData.subjectCode !== subject?.subjectCode) {
        const codeExists = await subjectMasterService.existsByCode(formData.subjectCode);
        if (codeExists) {
          setValidationErrors(['Subject code already exists']);
          return false;
        }
      }

      // Check name uniqueness  
      if (!isEdit || formData.subjectName !== subject?.subjectName) {
        const nameExists = await subjectMasterService.existsByName(formData.subjectName);
        if (nameExists) {
          setValidationErrors(['Subject name already exists']);
          return false;
        }
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to validate subject');
      return false;
    }
  };

  const handleSave = async () => {
    if (isReadOnly) {
      onClose();
      return;
    }

    setError(null);
    setValidationErrors([]);

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Check for duplicates
      const isUnique = await checkDuplicates();
      if (!isUnique) {
        return;
      }

      // Save the subject
      if (isEdit && subject?.id) {
        await subjectMasterService.updateSubject(subject.id, formData);
      } else {
        await subjectMasterService.createSubject(formData);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} subject`);
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'add': return 'Add New Subject';
      case 'edit': return 'Edit Subject';
      case 'view': return 'View Subject';
      default: return 'Subject';
    }
  };

  const getSubjectTypeOptions = () => [
    { value: SubjectType.THEORY, label: 'Theory Only', description: 'Theory-based subjects with written examinations' },
    { value: SubjectType.PRACTICAL, label: 'Practical Only', description: 'Skill-based subjects with hands-on examinations' },
    { value: SubjectType.BOTH, label: 'Theory & Practical', description: 'Subjects with both theory and practical components' }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: isReadOnly ? 400 : 500 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{getModalTitle()}</Typography>
          {isReadOnly && subject && (
            <Chip
              label={subject.isActive ? 'Active' : 'Inactive'}
              color={subject.isActive ? 'success' : 'error'}
              size="small"
            />
          )}
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
          <Grid item xs={12} sm={6}>
            <Box mb={1}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Subject Code *
              </Typography>
              <TextField
                value={formData.subjectCode}
                onChange={(e) => handleInputChange('subjectCode', e.target.value.toUpperCase())}
                fullWidth
                required
                disabled={isReadOnly}
                placeholder="e.g., MATH101, PHY201"
                inputProps={{ maxLength: 20 }}
                variant="outlined"
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                Unique code for the subject (e.g., MATH101, PHY201)
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box mb={1}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Subject Name *
              </Typography>
              <TextField
                value={formData.subjectName}
                onChange={(e) => handleInputChange('subjectName', e.target.value)}
                fullWidth
                required
                disabled={isReadOnly}
                placeholder="Full name of the subject"
                inputProps={{ maxLength: 100 }}
                variant="outlined"
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                Full name of the subject
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required disabled={isReadOnly}>
              <InputLabel>Subject Type</InputLabel>
              <Select
                value={formData.subjectType}
                label="Subject Type"
                onChange={(e) => handleInputChange('subjectType', e.target.value)}
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
          </Grid>

          <Grid item xs={12}>
            <Box mb={1}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Description
              </Typography>
              <TextField
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                fullWidth
                multiline
                rows={3}
                disabled={isReadOnly}
                placeholder="Optional description of the subject"
                inputProps={{ maxLength: 500 }}
                variant="outlined"
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                Optional description of the subject
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  disabled={isReadOnly}
                />
              }
              label="Active"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Only active subjects can be used in configurations
            </Typography>
          </Grid>

          {isReadOnly && subject && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Created: {subject.createdAt ? new Date(subject.createdAt).toLocaleDateString() : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Updated: {subject.updatedAt ? new Date(subject.updatedAt).toLocaleDateString() : '-'}
                </Typography>
              </Grid>
              {subject.configurationCount !== undefined && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    This subject is used in {subject.configurationCount} configuration(s)
                    {subject.isInUse && ' and is currently active in the system.'}
                  </Alert>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {isReadOnly ? 'Close' : 'Cancel'}
        </Button>
        {!isReadOnly && (
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SubjectMasterModal;
