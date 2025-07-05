import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import {
  ClassConfiguration,
  ConfigurationSubject,
  SubjectType
} from '../../../types/examConfiguration';
import configurationSubjectService from '../../../services/configurationSubjectService';
import classConfigurationService from '../../../services/classConfigurationService';
import ConfigurationSubjectModal from './ConfigurationSubjectModal';
import Loading from '../../Loading';
import ErrorMessage from '../../ErrorMessage';

interface SubjectAssignmentManagementProps {
  selectedConfiguration: ClassConfiguration;
  onBack: () => void;
}

const SubjectAssignmentManagement: React.FC<SubjectAssignmentManagementProps> = ({
  selectedConfiguration,
  onBack
}) => {
  const [subjects, setSubjects] = useState<ConfigurationSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<ConfigurationSubject | undefined>();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  // Copy functionality states
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [sourceConfigurations, setSourceConfigurations] = useState<ClassConfiguration[]>([]);
  const [selectedSourceConfig, setSelectedSourceConfig] = useState<number | ''>('');
  const [copyPreview, setCopyPreview] = useState<ConfigurationSubject[]>([]);
  const [loadingCopy, setLoadingCopy] = useState(false);
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<ConfigurationSubject | null>(null);

  useEffect(() => {
    loadSubjects();
    loadSourceConfigurations();
  }, [selectedConfiguration.id]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await configurationSubjectService.getSubjectsByConfiguration(selectedConfiguration.id!);
      setSubjects(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const loadSourceConfigurations = async () => {
    try {
      const response = await classConfigurationService.getAllActiveConfigurations();
      // Filter out the current configuration
      setSourceConfigurations(response.filter(config => config.id !== selectedConfiguration.id));
    } catch (err: any) {
      console.error('Failed to load source configurations:', err);
    }
  };

  const handleAddSubject = () => {
    setSelectedSubject(undefined);
    setModalMode('add');
    setSubjectModalOpen(true);
  };

  const handleEditSubject = (subject: ConfigurationSubject) => {
    setSelectedSubject(subject);
    setModalMode('edit');
    setSubjectModalOpen(true);
  };

  const handleDeleteSubject = (subject: ConfigurationSubject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!subjectToDelete) return;

    try {
      setLoading(true);
      await configurationSubjectService.deleteConfigurationSubject(subjectToDelete.id!);
      await loadSubjects();
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (subject: ConfigurationSubject) => {
    try {
      setLoading(true);
      await configurationSubjectService.updateConfigurationSubjectStatus(subject.id!, !subject.isActive);
      await loadSubjects();
    } catch (err: any) {
      setError(err.message || 'Failed to update subject status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectModalSave = async () => {
    setSubjectModalOpen(false);
    await loadSubjects();
  };

  const handleCopySubjects = () => {
    setCopyModalOpen(true);
    setSelectedSourceConfig('');
    setCopyPreview([]);
  };

  const handleSourceConfigChange = async (sourceConfigId: number) => {
    setSelectedSourceConfig(sourceConfigId);
    setLoadingCopy(true);
    
    try {
      const preview = await configurationSubjectService.previewCopySubjects(sourceConfigId, selectedConfiguration.id!);
      setCopyPreview(preview);
    } catch (err: any) {
      setError(err.message || 'Failed to load copy preview');
    } finally {
      setLoadingCopy(false);
    }
  };

  const confirmCopySubjects = async () => {
    if (!selectedSourceConfig) return;

    try {
      setLoadingCopy(true);
      await configurationSubjectService.copySubjects(selectedSourceConfig as number, selectedConfiguration.id!);
      setCopyModalOpen(false);
      await loadSubjects();
    } catch (err: any) {
      setError(err.message || 'Failed to copy subjects');
    } finally {
      setLoadingCopy(false);
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

  if (loading && subjects.length === 0) {
    return <Loading />;
  }

  return (
    <Box>
      <Card>
        <CardContent>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={onBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h5" component="h1">
                  Subject Assignments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedConfiguration.className} {selectedConfiguration.section} - {selectedConfiguration.academicYear}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleCopySubjects}
                disabled={loading}
              >
                Copy from Another Class
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSubject}
                disabled={loading}
              >
                Add Subject
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Summary */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {subjects.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Subjects
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {getTotalMarks()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Marks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {subjects.filter(s => s.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Subjects
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Subjects Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject</TableCell>
                  <TableCell>Subject Type</TableCell>
                  <TableCell>Theory Marks</TableCell>
                  <TableCell>Practical Marks</TableCell>
                  <TableCell>Total Marks</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {subject.subjectMasterName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getSubjectTypeChip(subject.effectiveSubjectType || subject.subjectType)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {subject.theoryMarks || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {subject.practicalMarks || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {subject.totalMarks || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={subject.isActive}
                            onChange={() => handleStatusToggle(subject)}
                            size="small"
                          />
                        }
                        label={
                          <Chip
                            label={subject.isActive ? 'Active' : 'Inactive'}
                            color={subject.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        }
                        sx={{ margin: 0 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditSubject(subject)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteSubject(subject)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {subjects.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No subjects assigned to this configuration
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Subject Modal */}
      <ConfigurationSubjectModal
        open={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        onSave={handleSubjectModalSave}
        configurationId={selectedConfiguration.id!}
        configurationSubject={selectedSubject}
        mode={modalMode}
      />

      {/* Copy Subjects Modal */}
      <Dialog open={copyModalOpen} onClose={() => setCopyModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Copy Subjects from Another Class</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Source Configuration</InputLabel>
              <Select
                value={selectedSourceConfig}
                label="Source Configuration"
                onChange={(e) => handleSourceConfigChange(Number(e.target.value))}
              >
                {sourceConfigurations.map((config) => (
                  <MenuItem key={config.id} value={config.id}>
                    {config.className} {config.section} - {config.academicYear}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {loadingCopy && (
              <Box display="flex" justifyContent="center" py={2}>
                <Loading />
              </Box>
            )}

            {copyPreview.length > 0 && (
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Copy Preview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" color="text.secondary" mb={2}>
                  The following subjects will be copied:
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Theory</TableCell>
                        <TableCell>Practical</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {copyPreview.map((subject, index) => (
                        <TableRow key={index}>
                          <TableCell>{subject.subjectMasterName}</TableCell>
                          <TableCell>
                            {getSubjectTypeChip(subject.effectiveSubjectType || subject.subjectType)}
                          </TableCell>
                          <TableCell>{subject.theoryMarks || 0}</TableCell>
                          <TableCell>{subject.practicalMarks || 0}</TableCell>
                          <TableCell>{subject.totalMarks || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    {copyPreview.length} subject(s) will be copied.
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyModalOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmCopySubjects}
            variant="contained"
            disabled={copyPreview.length === 0 || loadingCopy}
          >
            Copy Subjects ({copyPreview.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the subject "{subjectToDelete?.subjectMasterName}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectAssignmentManagement;
