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
import { SubjectMaster, SubjectType } from '../../../types/examConfiguration';
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

  const handleSearch = () => {
    // Search is now automatic via useEffect - no need for API call
    setPage(0);
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
      await loadAllSubjects(); // Reload all subjects
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
      await loadAllSubjects(); // Reload all subjects
    } catch (err: any) {
      setError(err.message || 'Failed to update subject status');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSave = async () => {
    setModalOpen(false);
    await loadAllSubjects(); // Reload all subjects
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

  if (loading && allSubjects.length === 0) {
    return <Loading />;
  }

  const paginatedSubjects = getPaginatedSubjects();

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              Subject Master Management
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddSubject}
            >
              Add Subject
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Search and Filter Section */}
          <Box mb={3}>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, code, or description"
                size="small"
                sx={{ minWidth: 250 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Subject Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as SubjectType | '')}
                  label="Subject Type"
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
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                size="small"
              >
                Clear Filters
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Showing {paginatedSubjects.length} of {filteredSubjects.length} subjects
              {searchTerm || typeFilter || statusFilter ? ` (filtered from ${allSubjects.length} total)` : ''}
            </Typography>
          </Box>

          {/* Results Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject Code</TableCell>
                  <TableCell>Subject Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" py={3}>
                        {loading ? 'Loading subjects...' : 
                         filteredSubjects.length === 0 && allSubjects.length === 0 ? 'No subjects found' :
                         'No subjects match your search criteria'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSubjects.map((subject) => (
                    <TableRow key={subject.id} hover>
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
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {subject.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={subject.isActive}
                              onChange={() => handleStatusToggle(subject)}
                              size="small"
                              disabled={loading}
                            />
                          }
                          label={getStatusChip(subject.isActive)}
                          labelPlacement="start"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewSubject(subject)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Subject">
                          <IconButton
                            size="small"
                            onClick={() => handleEditSubject(subject)}
                            disabled={loading}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Subject">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteSubject(subject)}
                            disabled={loading}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
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
                onChange={(_, newPage) => setPage(newPage - 1)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Subject Modal */}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectMasterList;
