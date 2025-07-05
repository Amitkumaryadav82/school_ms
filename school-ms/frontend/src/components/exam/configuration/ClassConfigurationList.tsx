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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
  FileCopy as CopyIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { ClassConfiguration, ClassConfigurationFilter } from '../../../types/examConfiguration';
import classConfigurationService from '../../../services/classConfigurationService';
import ClassConfigurationModal from './SimplifiedClassConfigurationModal';
import Loading from '../../Loading';
import ErrorMessage from '../../ErrorMessage';

interface ClassConfigurationListProps {
  onConfigurationSelect?: (configuration: ClassConfiguration) => void;
  onManageSubjects?: (configuration: ClassConfiguration) => void;
  selectionMode?: boolean;
  selectedConfigurations?: number[];
}

const ClassConfigurationList: React.FC<ClassConfigurationListProps> = ({
  onConfigurationSelect,
  onManageSubjects,
  selectionMode = false,
  selectedConfigurations = []
}) => {
  // State management
  const [allConfigurations, setAllConfigurations] = useState<ClassConfiguration[]>([]);
  const [filteredConfigurations, setFilteredConfigurations] = useState<ClassConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classNameFilter, setClassNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Class options for dropdown
  const classOptions = [
    'Pre-KG', 'LKG', 'UKG', 
    '1st', '2nd', '3rd', '4th', '5th', 
    '6th', '7th', '8th', '9th', '10th',
    '11th', '12th'
  ];

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConfiguration, setSelectedConfiguration] = useState<ClassConfiguration | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'copy'>('create');

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configurationToDelete, setConfigurationToDelete] = useState<ClassConfiguration | null>(null);

  // Load all configurations once on component mount
  useEffect(() => {
    loadAllConfigurations();
  }, []);

  // Apply client-side filtering when filters change
  useEffect(() => {
    applyFilters();
  }, [allConfigurations, classNameFilter, statusFilter]);

  const loadAllConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all active configurations without pagination
      const allConfigs = await classConfigurationService.getAllActiveConfigurations();
      setAllConfigurations(allConfigs);
    } catch (err: any) {
      setError(err.message || 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allConfigurations];

    // Apply class name filter
    if (classNameFilter) {
      filtered = filtered.filter(config => 
        config.className === classNameFilter
      );
    }

    // Apply status filter
    if (statusFilter !== '') {
      const isActive = statusFilter === 'true';
      filtered = filtered.filter(config => config.isActive === isActive);
    }

    setFilteredConfigurations(filtered);
  };

  const handleClearFilters = () => {
    setClassNameFilter('');
    setStatusFilter('');
  };

  const handleAddConfiguration = () => {
    setSelectedConfiguration(undefined);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEditConfiguration = (configuration: ClassConfiguration) => {
    setSelectedConfiguration(configuration);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleViewConfiguration = (configuration: ClassConfiguration) => {
    if (onManageSubjects) {
      onManageSubjects(configuration);
    }
  };

  const handleCopyConfiguration = (configuration: ClassConfiguration) => {
    setSelectedConfiguration(configuration);
    setModalMode('copy');
    setModalOpen(true);
  };

  const handleDeleteConfiguration = (configuration: ClassConfiguration) => {
    setConfigurationToDelete(configuration);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!configurationToDelete) return;

    try {
      setLoading(true);
      await classConfigurationService.deleteConfiguration(configurationToDelete.id!);
      await loadAllConfigurations();
      setDeleteDialogOpen(false);
      setConfigurationToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (configuration: ClassConfiguration) => {
    try {
      setLoading(true);
      await classConfigurationService.updateConfigurationStatus(configuration.id!, !configuration.isActive);
      await loadAllConfigurations();
    } catch (err: any) {
      setError(err.message || 'Failed to update configuration status');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSave = async () => {
    setModalOpen(false);
    await loadAllConfigurations();
  };

  const getStatusChip = (isActive: boolean) => {
    return (
      <Chip
        label={isActive ? 'Active' : 'Inactive'}
        color={isActive ? 'success' : 'error'}
        size="small"
      />
    );
  };

  const canDeleteConfiguration = (config: ClassConfiguration) => {
    return classConfigurationService.canDeleteConfiguration(config);
  };

  if (loading && allConfigurations.length === 0) {
    return <Loading />;
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h1">
              Class Configurations
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddConfiguration}
              disabled={loading}
            >
              Add Configuration
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Class Name</InputLabel>
              <Select
                value={classNameFilter}
                label="Class Name"
                onChange={(e) => setClassNameFilter(e.target.value as string)}
              >
                <MenuItem value="">All Classes</MenuItem>
                {classOptions.map((className) => (
                  <MenuItem key={className} value={className}>
                    {className}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as string)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={loading}
            >
              Clear Filters
            </Button>
          </Box>

          {/* Results info */}
          <Typography variant="body2" color="text.secondary" mb={2}>
            Showing {filteredConfigurations.length} of {allConfigurations.length} configurations
          </Typography>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class</TableCell>
                  <TableCell>Academic Year</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Subjects</TableCell>
                  <TableCell>Total Marks</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredConfigurations.map((config: ClassConfiguration) => (
                  <TableRow
                    key={config.id}
                    hover
                    sx={{
                      backgroundColor: selectedConfigurations.includes(config.id!)
                        ? 'action.selected'
                        : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {config.className}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {config.academicYear}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.isActive}
                            onChange={() => handleStatusToggle(config)}
                            size="small"
                          />
                        }
                        label={getStatusChip(config.isActive)}
                        sx={{ margin: 0 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {config.subjectCount || 0} subjects
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {config.totalMarks || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {config.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title="Manage Subjects">
                          <IconButton
                            size="small"
                            onClick={() => handleViewConfiguration(config)}
                            color="primary"
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditConfiguration(config)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Copy">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyConfiguration(config)}
                          >
                            <CopyIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteConfiguration(config)}
                            disabled={!canDeleteConfiguration(config).canDelete}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>

                        {selectionMode && onConfigurationSelect && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onConfigurationSelect(config)}
                          >
                            Select
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredConfigurations.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {allConfigurations.length === 0 ? 'No configurations found' : 'No configurations match the current filters'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit/Copy Modal */}
      <ClassConfigurationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        configuration={selectedConfiguration}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the configuration "{configurationToDelete?.className} - {configurationToDelete?.academicYear}"?
            This action cannot be undone.
          </Typography>
          {configurationToDelete && !canDeleteConfiguration(configurationToDelete).canDelete && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {canDeleteConfiguration(configurationToDelete).reason}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            disabled={configurationToDelete ? !canDeleteConfiguration(configurationToDelete).canDelete : true}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassConfigurationList;
