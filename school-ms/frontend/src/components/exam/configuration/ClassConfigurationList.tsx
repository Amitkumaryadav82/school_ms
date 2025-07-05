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
  Pagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FileCopy as CopyIcon
} from '@mui/icons-material';
import { ClassConfiguration, ClassConfigurationFilter } from '../../../types/examConfiguration';
import classConfigurationService from '../../../services/classConfigurationService';
import ClassConfigurationModal from './ClassConfigurationModal';
import Loading from '../../Loading';
import ErrorMessage from '../../ErrorMessage';

interface ClassConfigurationListProps {
  onConfigurationSelect?: (configuration: ClassConfiguration) => void;
  selectionMode?: boolean;
  selectedConfigurations?: number[];
}

const ClassConfigurationList: React.FC<ClassConfigurationListProps> = ({
  onConfigurationSelect,
  selectionMode = false,
  selectedConfigurations = []
}) => {
  // State management
  const [configurations, setConfigurations] = useState<ClassConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('');
  const [classNameFilter, setClassNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConfiguration, setSelectedConfiguration] = useState<ClassConfiguration | undefined>();
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'copy'>('add');

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configurationToDelete, setConfigurationToDelete] = useState<ClassConfiguration | null>(null);

  useEffect(() => {
    loadConfigurations();
  }, [page, searchTerm, academicYearFilter, classNameFilter, statusFilter, activeTab]);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filter: ClassConfigurationFilter = {
        searchTerm: searchTerm || undefined,
        academicYear: academicYearFilter || undefined,
        className: classNameFilter || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'true'
      };

      let response;
      if (activeTab === 0) {
        // All configurations
        response = await classConfigurationService.searchConfigurations(filter, page, pageSize);
      } else if (activeTab === 1) {
        // Active only
        response = await classConfigurationService.getAllConfigurationsPaginated(page, pageSize);
      } else {
        // In use only
        const inUseConfigs = await classConfigurationService.getConfigurationsInUse();
        response = {
          content: inUseConfigs.slice(page * pageSize, (page + 1) * pageSize),
          totalElements: inUseConfigs.length,
          totalPages: Math.ceil(inUseConfigs.length / pageSize),
          size: pageSize,
          number: page,
          first: page === 0,
          last: page >= Math.ceil(inUseConfigs.length / pageSize) - 1
        };
      }

      setConfigurations(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err.message || 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadConfigurations();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setAcademicYearFilter('');
    setClassNameFilter('');
    setStatusFilter('');
    setPage(0);
  };

  const handleAddConfiguration = () => {
    setSelectedConfiguration(undefined);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleEditConfiguration = (configuration: ClassConfiguration) => {
    setSelectedConfiguration(configuration);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleViewConfiguration = (configuration: ClassConfiguration) => {
    setSelectedConfiguration(configuration);
    setModalMode('view');
    setModalOpen(true);
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
      await loadConfigurations();
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
      await loadConfigurations();
    } catch (err: any) {
      setError(err.message || 'Failed to update configuration status');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSave = async () => {
    setModalOpen(false);
    await loadConfigurations();
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

  if (loading && configurations.length === 0) {
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

          {/* Tabs */}
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="All Configurations" />
            <Tab label="Active Only" />
            <Tab label="In Use" />
          </Tabs>

          {/* Filters */}
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              label="Search configurations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            
            <TextField
              label="Academic Year"
              value={academicYearFilter}
              onChange={(e) => setAcademicYearFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
              placeholder="e.g., 2023-2024"
            />

            <TextField
              label="Class Name"
              value={classNameFilter}
              onChange={(e) => setClassNameFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            />

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
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </Button>

            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </Box>

          {/* Results info */}
          <Typography variant="body2" color="text.secondary" mb={2}>
            Showing {configurations.length} of {totalElements} configurations
          </Typography>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class & Section</TableCell>
                  <TableCell>Academic Year</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Subjects</TableCell>
                  <TableCell>Total Marks</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configurations.map((config) => (
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
                        {config.className} {config.section}
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
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleViewConfiguration(config)}
                          >
                            <ViewIcon />
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
                {configurations.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No configurations found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, value) => setPage(value - 1)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
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
            Are you sure you want to delete the configuration "{configurationToDelete?.className} {configurationToDelete?.section} - {configurationToDelete?.academicYear}"?
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
            disabled={configurationToDelete && !canDeleteConfiguration(configurationToDelete).canDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassConfigurationList;
