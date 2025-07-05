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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { SubjectMaster, SubjectType, SubjectMasterFilter } from '../../../types/examConfiguration';
import subjectMasterService from '../../../services/subjectMasterService';
import SubjectMasterModal from './SubjectMasterModal';
import Loading from '../../Loading';
import ErrorMessage from '../../ErrorMessage';

interface SubjectMasterListProps {
  onSubjectSelect?: (subject: SubjectMaster) => void;
  selectionMode?: boolean;
  selectedSubjects?: number[];
}

const SubjectMasterList: React.FC<SubjectMasterListProps> = ({
  onSubjectSelect,
  selectionMode = false,
  selectedSubjects = []
}) => {
  // State management
  const [allSubjects, setAllSubjects] = useState<SubjectMaster[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<SubjectMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<SubjectType | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectMaster | undefined>();
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectMaster | null>(null);

  // Load all subjects once on component mount
  useEffect(() => {
    loadAllSubjects();
  }, []);

  // Filter subjects whenever search criteria change
  useEffect(() => {
    filterSubjects();
    setPage(0); // Reset to first page when filters change
  }, [allSubjects, searchTerm, typeFilter, statusFilter]);

  const loadAllSubjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all subjects without pagination for client-side filtering
      const subjects = await subjectMasterService.getAllSubjects();
      setAllSubjects(subjects);
    } catch (err: any) {
      setError(err.message || 'Failed to load subjects');
      setAllSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSubjects = () => {
    let filtered = [...allSubjects];

    // Apply search term filter (search in name, code, and description)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(subject =>
        subject.subjectName.toLowerCase().includes(term) ||
        subject.subjectCode.toLowerCase().includes(term) ||
        (subject.description && subject.description.toLowerCase().includes(term))
      );
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(subject => subject.subjectType === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== '') {
      const isActive = statusFilter === 'true';
      filtered = filtered.filter(subject => subject.isActive === isActive);
    }

    setFilteredSubjects(filtered);
  };

  // Get paginated subjects for display
  const getPaginatedSubjects = () => {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSubjects.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredSubjects.length / pageSize);
    } catch (err: any) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadSubjects();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setPage(0);
  };

  const handleAddSubject = () => {
    setSelectedSubject(undefined);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleEditSubject = (subject: SubjectMaster) => {
    setSelectedSubject(subject);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleViewSubject = (subject: SubjectMaster) => {
    setSelectedSubject(subject);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDeleteSubject = (subject: SubjectMaster) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!subjectToDelete) return;

    try {
      setLoading(true);
      await subjectMasterService.deleteSubject(subjectToDelete.id!);
      await loadSubjects();
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (subject: SubjectMaster) => {
    try {
      setLoading(true);
      await subjectMasterService.updateSubjectStatus(subject.id!, !subject.isActive);
      await loadSubjects();
    } catch (err: any) {
      setError(err.message || 'Failed to update subject status');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSave = async () => {
    setModalOpen(false);
    await loadSubjects();
  };

  const getSubjectTypeChip = (type: SubjectType) => {
    const typeInfo = {
      [SubjectType.THEORY]: { label: 'Theory', color: 'primary' as const },
      [SubjectType.PRACTICAL]: { label: 'Practical', color: 'secondary' as const },
      [SubjectType.BOTH]: { label: 'Both', color: 'default' as const }
    };

    const info = typeInfo[type];
    return <Chip label={info.label} color={info.color} size="small" />;
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

  if (loading && subjects.length === 0) {
    return <Loading />;
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h1">
              Subject Master
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSubject}
              disabled={loading}
            >
              Add Subject
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              label="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value as SubjectType | '')}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value={SubjectType.THEORY}>Theory</MenuItem>
                <MenuItem value={SubjectType.PRACTICAL}>Practical</MenuItem>
                <MenuItem value={SubjectType.BOTH}>Both</MenuItem>
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
            Showing {subjects.length} of {totalElements} subjects
          </Typography>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Configurations</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow
                    key={subject.id}
                    hover
                    sx={{
                      backgroundColor: selectedSubjects.includes(subject.id!)
                        ? 'action.selected'
                        : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {subject.subjectCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {subject.subjectName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getSubjectTypeChip(subject.subjectType)}
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
                        label={getStatusChip(subject.isActive)}
                        sx={{ margin: 0 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {subject.configurationCount || 0}
                        {subject.isInUse && (
                          <Chip label="In Use" size="small" color="warning" sx={{ ml: 1 }} />
                        )}
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
                        {subject.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleViewSubject(subject)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
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
                            disabled={subject.isInUse}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>

                        {selectionMode && onSubjectSelect && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onSubjectSelect(subject)}
                          >
                            Select
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {subjects.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No subjects found
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

      {/* Add/Edit Modal */}
      <SubjectMasterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        subject={selectedSubject}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the subject "{subjectToDelete?.subjectName}"?
            This action cannot be undone.
          </Typography>
          {subjectToDelete?.isInUse && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This subject is currently in use and cannot be deleted.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            disabled={subjectToDelete?.isInUse}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectMasterList;
