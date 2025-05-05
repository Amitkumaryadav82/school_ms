import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Button, Paper, Alert, AlertTitle, Dialog, 
  DialogTitle, DialogContent, DialogActions, CircularProgress, 
  List, ListItem, ListItemText, Divider, Checkbox, FormControl,
  InputLabel, Select, MenuItem, SelectChangeEvent, IconButton,
  Tooltip, TextField, Grid, Chip, OutlinedInput, Autocomplete
} from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { AdmissionApplication, admissionService } from '../services/admissionService';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Permission from '../components/Permission';
import AdmissionDialog from '../components/dialogs/AdmissionDialog';
import AuthErrorDialog from '../components/debug/AuthErrorDialog';
import { useApi } from '../hooks/useApi';
import { formatDate } from '../utils/tableFormatters';
import environment from '../config/environment';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearIcon from '@mui/icons-material/Clear';

// Helper function to format status with appropriate styling
const formatStatus = (status: string) => {
  let color = '';
  switch (status.toUpperCase()) {
    case 'APPROVED':
      color = 'success.main';
      break;
    case 'REJECTED':
      color = 'error.main';
      break;
    case 'UNDER_REVIEW':
      color = 'info.main';
      break;
    case 'WAITLISTED':
      color = 'warning.dark';
      break;
    default:
      color = 'warning.main';
  }
  return <Typography variant="body2" color={color}>{status}</Typography>;
};

// Helper for creating consistent action column definition
const createActionColumn = <T extends object>(
  onEdit?: (row: T) => void,
  onDelete?: (row: T) => void,
  extraActions?: (row: T) => React.ReactNode
) => {
  return {
    id: 'actions',
    label: 'Actions',
    sortable: false,
    align: 'right',
    format: (value: any, row: T) => {
      // Check if row exists before rendering actions
      if (!row) {
        console.warn('Action column received undefined row data');
        return null;
      }
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {/* Standard actions */}
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => {
                  if (row) onEdit(row);
                }}
                sx={{ mr: 0.5 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && row && (
            <Button
              size="small"
              color="error"
              onClick={() => {
                if (row) onDelete(row);
              }}
            >
              Delete
            </Button>
          )}
          
          {/* Custom actions */}
          {extraActions && row && extraActions(row)}
        </Box>
      );
    },
  };
};

// Status options for dropdown
const statusOptions = [
  { value: 'PENDING', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WAITLISTED', label: 'Waitlisted' }
];

// Grade options for filtering
const gradeOptions = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `Grade ${i + 1}`
}));

const Admissions = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugResults, setDebugResults] = useState<any[]>([]);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<any>(null);
  
  // New state for multi-selection and bulk actions
  const [selectedApplications, setSelectedApplications] = useState<AdmissionApplication[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('PENDING');
  
  // Confirmation dialog for bulk actions
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [confirmDialogAction, setConfirmDialogAction] = useState<() => Promise<void>>(() => Promise.resolve());

  // New state for filtering
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{
    name: string;
    grade: string[];
    status: string[];
    dateRange: {
      start: string;
      end: string;
    };
  }>({
    name: '',
    grade: [],
    status: [],
    dateRange: {
      start: '',
      end: ''
    }
  });
  
  // Flag to indicate if filters are active
  const [filtersActive, setFiltersActive] = useState(false);

  // Debug logging on component mount
  useEffect(() => {
    console.log('🔍 Admissions component mounted');
    console.log('👤 User:', user);
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        console.log('🔑 Token payload:', {
          exp: new Date(tokenData.exp * 1000).toLocaleString(),
          roles: tokenData.roles || tokenData.authorities || tokenData.role || 'Not found in token',
          sub: tokenData.sub || tokenData.username
        });
      } catch (e) {
        console.log('⚠️ Could not parse token');
      }
    }
    
    // Log information about the API endpoints
    admissionService.getDebugInfo().then(info => {
      console.log('📝 API connection info:', info);
    });
    
    return () => {
      console.log('🔍 Admissions component unmounted');
    };
  }, [user]);

  // Modified useApi call with detailed error logging
  const {
    data: admissions,
    loading: apiLoading,
    error,
    refresh,
  } = useApi<AdmissionApplication[]>(() => {
    console.log('🔄 Calling admissionService.getAllApplications() with multiple fallbacks');
    // Log user and auth state
    console.log('🔑 Current user role:', user?.role);
    console.log('🔒 Auth token present:', !!localStorage.getItem('token'));
    
    return admissionService.getAllApplications();
  }, [], (err) => {
    console.error('❌ Error in useApi for admissions:', err);
    setErrorDetails(err);
    return [];
  });

  // Filter the admissions data based on applied filters
  const filteredAdmissions = useMemo(() => {
    if (!admissions) return [];
    if (!filtersActive) return admissions;

    return admissions.filter(app => {
      // Filter by name/email (case-insensitive search)
      const nameMatches = !filters.name || 
        (app.studentName?.toLowerCase().includes(filters.name.toLowerCase())) ||
        (app.email?.toLowerCase().includes(filters.name.toLowerCase())) ||
        (app.parentName?.toLowerCase().includes(filters.name.toLowerCase()));
      
      // Filter by grade
      const gradeMatches = filters.grade.length === 0 || 
        filters.grade.includes(app.gradeApplying?.toString());
      
      // Filter by status
      const statusMatches = filters.status.length === 0 ||
        filters.status.includes(app.status);
      
      // Filter by date range
      let dateMatches = true;
      if (filters.dateRange.start || filters.dateRange.end) {
        const appDate = app.submissionDate ? new Date(app.submissionDate) : null;
        if (appDate) {
          if (filters.dateRange.start) {
            const startDate = new Date(filters.dateRange.start);
            if (appDate < startDate) dateMatches = false;
          }
          if (filters.dateRange.end && dateMatches) {
            const endDate = new Date(filters.dateRange.end);
            endDate.setHours(23, 59, 59); // End of the day
            if (appDate > endDate) dateMatches = false;
          }
        }
      }
      
      return nameMatches && gradeMatches && statusMatches && dateMatches;
    });
  }, [admissions, filters, filtersActive]);

  const handleCreate = () => {
    setSelectedApplication({
      studentName: '',
      dateOfBirth: '',
      gradeApplying: '',
      parentName: '',
      contactNumber: '',
      email: '',
      address: '',
      status: 'PENDING',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = async (application: AdmissionApplication) => {
    console.log('Edit clicked for application:', application);
    
    if (!application) {
      console.error('Error: Attempted to edit undefined application');
      return;
    }

    // Set loading state while fetching complete details
    setLoading(true);
    
    try {
      // Create an enhanced application object with sensible defaults for editing
      const enhancedApplication = {
        ...application,
        id: application.id, // Ensure ID is preserved
        studentName: application.studentName || '',
        dateOfBirth: application.dateOfBirth || '2005-01-01', // Default DOB if not available
        gradeApplying: application.gradeApplying || '1',
        parentName: application.parentName !== 'Not available' ? application.parentName : '', 
        contactNumber: application.contactNumber || '',
        email: application.email || '',
        address: application.address || '',
        status: application.status || 'PENDING',
      };
      
      console.log('Enhanced application object for editing:', enhancedApplication);
      setSelectedApplication(enhancedApplication);
      
      // If we have an ID, try to get additional details from backend, but don't block UI
      if (application.id) {
        try {
          const detailedData = await admissionService.getApplicationById(application.id);
          console.log('Retrieved detailed application data:', detailedData);
          
          // Only update if we got meaningful data back
          if (detailedData && detailedData.studentName) {
            setSelectedApplication(detailedData);
          }
        } catch (detailError) {
          console.warn('Could not fetch complete details, using basic data:', detailError);
          // We already set the enhanced application above, so we can continue
        }
      }
    } catch (error) {
      console.error('Error preparing application for edit:', error);
      showNotification({
        type: 'warning',
        message: 'Could not load complete application details. Some fields may be missing.'
      });
    } finally {
      setLoading(false);
      setIsDialogOpen(true);
    }
  };

  const handleSave = async (application: AdmissionApplication) => {
    try {
      if (application.id) {
        console.log('Attempting to update application:', application);
        await admissionService.updateApplication(application.id, application);
        showNotification({
          type: 'success',
          message: 'Application updated successfully',
        });
      } else {
        // Enhanced error logging for create operation
        console.log('Submitting application data:', application);
        
        // Validate required fields before submission
        const missingFields = [];
        if (!application.studentName) missingFields.push('Student Name');
        if (!application.dateOfBirth) missingFields.push('Date of Birth');
        if (!application.gradeApplying) missingFields.push('Grade');
        if (!application.parentName) missingFields.push('Parent/Guardian Name');
        if (!application.contactNumber) missingFields.push('Contact Number');
        if (!application.email) missingFields.push('Email');
        if (!application.address) missingFields.push('Address');
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Extra date validation for the backend's expected format
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(application.dateOfBirth)) {
          throw new Error('Date of Birth must be in YYYY-MM-DD format');
        }
        
        const result = await admissionService.createApplication(application);
        console.log('Submission successful, response:', result);
        showNotification({
          type: 'success',
          message: 'New application created successfully',
        });
      }
      setIsDialogOpen(false);
      refresh();
    } catch (error: any) {
      console.error('Error saving application:', error);
      
      // Handle auth errors with detailed dialog
      if (error.status === 403) {
        setAuthError(error);
      } else {
        // General error handling
        let errorMessage = error.message || 'An error occurred while saving the application';
        
        if (error.originalError?.response?.data) {
          console.log('Backend validation errors:', error.originalError.response.data);
          
          // Display specific backend validation errors if available
          if (error.originalError.response.data.message) {
            errorMessage = `Validation error: ${error.originalError.response.data.message}`;
          }
          
          // Handle Spring Boot validation error format - safely check if errors is an array
          if (error.originalError.response.data.errors) {
            try {
              // Check if errors is an array we can map over
              if (Array.isArray(error.originalError.response.data.errors)) {
                const validationErrors = error.originalError.response.data.errors
                  .map(e => e.defaultMessage || e.field)
                  .join(', ');
                errorMessage = `Validation errors: ${validationErrors}`;
              } 
              // Check if errors is an object with field names as keys
              else if (typeof error.originalError.response.data.errors === 'object') {
                const errorObj = error.originalError.response.data.errors;
                const errorMessages = [];
                
                for (const field in errorObj) {
                  if (errorObj.hasOwnProperty(field)) {
                    errorMessages.push(`${field}: ${errorObj[field]}`);
                  }
                }
                
                if (errorMessages.length > 0) {
                  errorMessage = `Validation errors: ${errorMessages.join(', ')}`;
                }
              }
            } catch (parseError) {
              console.error('Error parsing validation errors:', parseError);
              // Fall back to using the general message
            }
          }
        }
        
        showNotification({
          type: 'error',
          message: errorMessage,
        });
      }
    }
  };

  // Add processing actions for approving, rejecting, and creating students
  const handleProcessAdmission = async (application: AdmissionApplication, status: string) => {
    try {
      setLoading(true);
      
      let reason = '';
      if (status === 'REJECTED') {
        reason = prompt('Please provide a reason for rejection:') || '';
      }
      
      console.log(`Processing admission ${application.id} with status: ${status}, reason: ${reason}`);
      
      // Convert action to backend status enum value
      const action = status === 'APPROVED' ? 'APPROVE' : 'REJECT';
      await admissionService.processAdmission(application.id, action, reason);
      
      showNotification({
        type: 'success',
        message: `Application status changed to ${status.toLowerCase()} successfully`
      });
      
      // Refresh the list to show updated status
      refresh();
    } catch (err: any) {
      console.error(`Error updating application status to ${status}:`, err);
      
      // Handle auth errors with detailed dialog
      if (err.status === 403) {
        setAuthError(err);
      } else {
        showNotification({
          type: 'error',
          message: `Failed to update application status: ${err.message}`
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateStudent = async (application: AdmissionApplication) => {
    try {
      setLoading(true);
      
      // Check if application status is approved
      if (application.status !== 'APPROVED') {
        // If not approved, approve it first
        await admissionService.processAdmission(application.id, 'APPROVE');
      }
      
      // Create student from the application
      const student = await admissionService.createStudentFromAdmission(application.id);
      
      showNotification({
        type: 'success',
        message: `Student created successfully from application`
      });
      
      // Navigate to the student detail page or refresh the list
      // Optionally: navigate to student page
      // history.push(`/students/${student.id}`);
      
      refresh();
    } catch (err) {
      console.error('Error creating student from application:', err);
      showNotification({
        type: 'error',
        message: `Failed to create student: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // New handlers for multi-selection features
  const handleSelectApplication = (application: AdmissionApplication, checked: boolean) => {
    if (checked) {
      setSelectedApplications(prev => [...prev, application]);
    } else {
      setSelectedApplications(prev => prev.filter(app => app.id !== application.id));
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked && admissions) {
      setSelectedApplications([...admissions]);
    } else {
      setSelectedApplications([]);
    }
  };
  
  const handleBulkStatusChange = (e: SelectChangeEvent) => {
    setBulkStatus(e.target.value);
  };
  
  const handleBulkActionSubmit = async () => {
    try {
      setLoading(true);
      
      // Confirm before proceeding with bulk action
      setConfirmDialogMessage(
        `Are you sure you want to change the status of ${selectedApplications.length} application(s) to ${
          statusOptions.find(opt => opt.value === bulkStatus)?.label || bulkStatus
        }?`
      );
      
      // Set the action to execute when confirmed
      setConfirmDialogAction(() => async () => {
        const results = await Promise.allSettled(
          selectedApplications.map(application => {
            // Don't update applications that already have this status
            if (application.status === bulkStatus) return Promise.resolve();
            
            // For rejected, we need to prompt for a reason, which doesn't work well in bulk
            // So we'll use a generic reason
            const reason = bulkStatus === 'REJECTED' ? 'Rejected in bulk update' : undefined;
            
            // Convert status to action for the API
            const action = bulkStatus === 'APPROVED' ? 'APPROVE' : 'REJECT';
            return admissionService.processAdmission(application.id, action, reason);
          })
        );
        
        // Count successes and failures
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        showNotification({
          type: failed > 0 ? 'warning' : 'success',
          message: `Status update complete: ${successful} successful, ${failed} failed`
        });
        
        // Clear selections and refresh the data
        setSelectedApplications([]);
        refresh();
      });
      
      setConfirmDialogOpen(true);
    } catch (error) {
      showNotification({
        type: 'error',
        message: `Failed to process bulk action: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Status update handler for single application
  const handleStatusChange = (application: AdmissionApplication, status: string) => {
    // Convert status to action for the API
    if (status === 'APPROVED') {
      handleProcessAdmission(application, 'APPROVED');
    } else if (status === 'REJECTED') {
      handleProcessAdmission(application, 'REJECTED');
    } else {
      // For other statuses, use the updateStatus method directly
      (async () => {
        try {
          setLoading(true);
          await admissionService.updateStatus(application.id, status);
          showNotification({
            type: 'success',
            message: `Status updated to ${status.toLowerCase()}`
          });
          refresh();
        } catch (error) {
          showNotification({
            type: 'error',
            message: `Failed to update status: ${error.message}`
          });
        } finally {
          setLoading(false);
        }
      })();
    }
  };

  // New handlers for filtering
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    setFiltersActive(true);
    setFilterDialogOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      grade: [],
      status: [],
      dateRange: {
        start: '',
        end: ''
      }
    });
    setFiltersActive(false);
  };
  
  // CSV Export functionality
  const handleExportCSV = () => {
    try {
      // Use filtered data if filters are active, otherwise use all data
      const dataToExport = filtersActive ? filteredAdmissions : admissions || [];
      
      if (dataToExport.length === 0) {
        showNotification({
          type: 'warning',
          message: 'No data to export'
        });
        return;
      }
      
      // Define CSV headers
      const headers = [
        'ID',
        'Student Name',
        'Date of Birth',
        'Email',
        'Contact Number',
        'Parent/Guardian Name',
        'Parent/Guardian Contact',
        'Address',
        'Grade Applying',
        'Previous School',
        'Previous Grade',
        'Previous Percentage',
        'Submission Date',
        'Status'
      ];
      
      // Convert data to CSV rows
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(app => {
          return [
            app.id || '',
            `"${app.studentName || ''}"`,
            app.dateOfBirth || '',
            `"${app.email || ''}"`,
            app.contactNumber || '',
            `"${app.parentName || ''}"`,
            app.guardianContact || app.contactNumber || '',
            `"${app.address || ''}"`,
            app.gradeApplying || '',
            `"${app.previousSchool || ''}"`,
            app.previousGrade || '',
            app.previousPercentage || '',
            app.submissionDate ? new Date(app.submissionDate).toISOString().split('T')[0] : '',
            app.status || 'PENDING'
          ].join(',');
        })
      ];
      
      // Create CSV content
      const csvContent = csvRows.join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `admissions_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification({
        type: 'success',
        message: `Exported ${dataToExport.length} records to CSV`
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showNotification({
        type: 'error',
        message: 'Failed to export CSV: ' + (error.message || 'Unknown error')
      });
    }
  };

  // Helper function to run API diagnostics for debugging
  const runApiTests = async () => {
    setDebugLoading(true);
    setDebugResults([]);
    
    const endpoints = [
      { name: 'Get all admissions (singular)', fn: () => api.get('/admission') },
      { name: 'Get all admissions (plural)', fn: () => api.get('/admissions') },
      { name: 'Get health check', fn: () => api.get('/health') },
      { name: 'Get auth status', fn: () => api.get('/auth/status') },
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 Testing endpoint: ${endpoint.name}`);
        const response = await endpoint.fn();
        results.push({
          name: endpoint.name,
          success: true,
          status: 'OK',
          data: response
        });
      } catch (e) {
        results.push({
          name: endpoint.name,
          success: false,
          status: e.status || 'Error',
          error: e.message || JSON.stringify(e)
        });
      }
    }
    
    setDebugResults(results);
    setDebugLoading(false);
  };

  // Define columns for DataTable
  const columns = [
    {
      id: 'selector',
      label: (
        <Checkbox 
          checked={admissions?.length > 0 && selectedApplications.length === admissions?.length}
          indeterminate={selectedApplications.length > 0 && selectedApplications.length < (admissions?.length || 0)}
          onChange={(e) => handleSelectAll(e.target.checked)}
          size="small"
        />
      ),
      sortable: false,
      width: 50,
      format: (value: any, row: AdmissionApplication) => (
        <Checkbox 
          checked={selectedApplications.some(app => app.id === row.id)}
          onChange={(e) => handleSelectApplication(row, e.target.checked)}
          size="small"
        />
      )
    },
    {
      id: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      id: 'studentName',
      label: 'Student Name',
      sortable: true,
    },
    {
      id: 'gradeApplying',
      label: 'Grade',
      sortable: true,
    },
    {
      id: 'parentName',
      label: 'Parent Name',
      sortable: true,
    },
    {
      id: 'submissionDate',
      label: 'Submitted On',
      sortable: true,
      format: formatDate,
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      format: (value: string, row: AdmissionApplication) => (
        <Permission permission="MANAGE_ADMISSIONS">
          <FormControl size="small" fullWidth>
            <Select
              value={value || 'PENDING'}
              onChange={(e) => handleStatusChange(row, e.target.value)}
              displayEmpty
              variant="standard"
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 0, 
                  color: () => {
                    switch (value?.toUpperCase()) {
                      case 'APPROVED': return 'success.main';
                      case 'REJECTED': return 'error.main';
                      case 'UNDER_REVIEW': return 'info.main';
                      case 'WAITLISTED': return 'warning.dark';
                      default: return 'warning.main';
                    }
                  }
                }
              }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Permission>
      ),
    },
    createActionColumn<AdmissionApplication>(
      (row) => handleEdit(row),
      undefined, // No delete action
      (row) => (
        <Permission permission="MANAGE_ADMISSIONS">
          <Tooltip title="Create Student">
            <IconButton
              size="small"
              onClick={() => handleCreateStudent(row)}
              color="secondary"
            >
              <PersonAddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Permission>
      )
    ),
  ];

  // Filter dialog component
  const renderFilterDialog = () => {
    return (
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Filter Admissions</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Search by Name or Email"
                fullWidth
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Enter student name, email, or parent name"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="grade-filter-label">Filter by Grade</InputLabel>
                <Select
                  labelId="grade-filter-label"
                  multiple
                  value={filters.grade}
                  onChange={(e) => handleFilterChange('grade', e.target.value)}
                  input={<OutlinedInput label="Filter by Grade" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={`Grade ${value}`} 
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {gradeOptions.map((grade) => (
                    <MenuItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Filter by Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  multiple
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  input={<OutlinedInput label="Filter by Status" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={statusOptions.find(s => s.value === value)?.label || value} 
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date Range From"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={filters.dateRange.start}
                onChange={(e) => 
                  handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })
                }
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date Range To"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={filters.dateRange.end}
                onChange={(e) => 
                  handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters} color="secondary">
            Clear All Filters
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters} variant="contained" color="primary">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Confirmation dialog component
  const renderConfirmDialog = () => {
    return (
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={async () => {
              setConfirmDialogOpen(false);
              await confirmDialogAction();
            }} 
            color="primary" 
            variant="contained" 
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Debug dialog component
  const renderDebugDialog = () => {
    return (
      <Dialog 
        open={debugDialogOpen} 
        onClose={() => setDebugDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>API Endpoint Diagnostics</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Testing different API endpoints to find which one works with your backend.
          </Typography>
          
          {debugLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {debugResults.length > 0 && (
            <List>
              {debugResults.map((result, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText 
                      primary={`${result.name} - ${result.success ? '✅ Success' : '❌ Failed'} (${result.status})`}
                      secondary={
                        <Box 
                          component="pre" 
                          sx={{ 
                            mt: 1, 
                            p: 1, 
                            bgcolor: 'grey.100', 
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            overflow: 'auto',
                            maxHeight: 200
                          }}
                        >
                          {result.success 
                            ? JSON.stringify(result.data, null, 2) 
                            : result.error
                              ? `Error: ${result.error}` 
                              : 'No response data'
                          }
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Authentication Information</Typography>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2">
                <strong>User:</strong> {user ? JSON.stringify(user) : 'Not logged in'}
              </Typography>
              <Typography variant="body2">
                <strong>Token present:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2">
                <strong>API URL:</strong> {environment.apiUrl}
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={runApiTests} disabled={debugLoading} color="primary">
            Run API Tests
          </Button>
          <Button onClick={() => setDebugDialogOpen(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (apiLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorMessage 
          title="Error Loading Admissions" 
          message={error.message || "Couldn't load admissions data"} 
        />
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={refresh}>
            Try Again
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => setDebugDialogOpen(true)}
          >
            Diagnostics
          </Button>
        </Box>
        
        {errorDetails && (
          <Paper elevation={0} variant="outlined" sx={{ p: 3, mt: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>HTTP Status: {errorDetails.status || 'Unknown'}</AlertTitle>
              {errorDetails.message}
            </Alert>
            
            <Typography variant="subtitle1">Debug Information:</Typography>
            <Box component="pre" sx={{ 
              p: 2, 
              bgcolor: 'grey.100', 
              borderRadius: 1,
              overflowX: 'auto'
            }}>
              {JSON.stringify(errorDetails.originalError || errorDetails, null, 2)}
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Possible Solutions:</Typography>
              <ul>
                <li>Verify the API endpoint path is correct</li>
                <li>Check that your user account has permission to access admissions</li>
                <li>Ensure your authentication token is valid and not expired</li>
                <li>Verify the backend server is running and accessible</li>
              </ul>
            </Box>
          </Paper>
        )}
        
        {renderDebugDialog()}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admission Applications
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Export Button */}
          <Tooltip title="Export to CSV">
            <IconButton 
              color="primary" 
              onClick={handleExportCSV}
              disabled={(!filteredAdmissions || filteredAdmissions.length === 0) && (!admissions || admissions.length === 0)}
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
          
          {/* Filter Button */}
          <Tooltip title={filtersActive ? "Edit Filters" : "Filter Applications"}>
            <IconButton 
              color={filtersActive ? "secondary" : "default"} 
              onClick={() => setFilterDialogOpen(true)}
            >
              <FilterAltIcon />
            </IconButton>
          </Tooltip>
          
          {/* Clear Filters Button - only show when filters are active */}
          {filtersActive && (
            <Tooltip title="Clear All Filters">
              <IconButton 
                color="error" 
                onClick={handleClearFilters}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Button
            variant="text"
            color="secondary"
            onClick={() => setDebugDialogOpen(true)}
            sx={{ ml: 1 }}
          >
            Debug
          </Button>
          
          <Permission permission="MANAGE_ADMISSIONS">
            <Button
              variant="contained"
              onClick={handleCreate}
            >
              New Application
            </Button>
          </Permission>
        </Box>
      </Box>
      
      {/* Filter Status Bar - show when filters are active */}
      {filtersActive && (
        <Paper sx={{ p: 1.5, mb: 2, bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 1 }}>
              Filters:
            </Typography>
            
            {filters.name && (
              <Chip 
                label={`Search: "${filters.name}"`} 
                size="small" 
                onDelete={() => handleFilterChange('name', '')} 
                color="primary"
                variant="outlined"
              />
            )}
            
            {filters.status.length > 0 && (
              <Chip 
                label={`Status: ${filters.status.length} selected`} 
                size="small" 
                onDelete={() => handleFilterChange('status', [])}
                color="primary"
                variant="outlined" 
              />
            )}
            
            {filters.grade.length > 0 && (
              <Chip 
                label={`Grade: ${filters.grade.length} selected`} 
                size="small"
                onDelete={() => handleFilterChange('grade', [])}
                color="primary"
                variant="outlined"
              />
            )}
            
            {(filters.dateRange.start || filters.dateRange.end) && (
              <Chip 
                label={`Date Range: ${filters.dateRange.start || 'Any'} to ${filters.dateRange.end || 'Any'}`} 
                size="small"
                onDelete={() => handleFilterChange('dateRange', { start: '', end: '' })}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          
          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
            {filteredAdmissions.length} record{filteredAdmissions.length !== 1 ? 's' : ''} found
          </Typography>
        </Paper>
      )}
      
      {/* Bulk Actions Section */}
      {selectedApplications.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {selectedApplications.length} application(s) selected
            </Typography>
            <FormControl size="small" sx={{ minWidth: 200, mr: 2 }}>
              <InputLabel id="bulk-status-select-label">Change Status To</InputLabel>
              <Select
                labelId="bulk-status-select-label"
                id="bulk-status-select"
                value={bulkStatus}
                label="Change Status To"
                onChange={handleBulkStatusChange}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button 
              variant="contained" 
              onClick={handleBulkActionSubmit}
              disabled={loading || selectedApplications.length === 0}
            >
              Apply Status Change
            </Button>
          </Box>
          <Button 
            variant="outlined" 
            onClick={() => setSelectedApplications([])}
            color="secondary"
          >
            Clear Selection
          </Button>
        </Paper>
      )}
      
      <DataTable
        columns={columns}
        data={filteredAdmissions || []}
        pagination
        emptyMessage={filtersActive ? "No applications match your filter criteria" : "No applications found"}
      />
      
      {renderDebugDialog()}
      {renderConfirmDialog()}
      {renderFilterDialog()}
      
      <AdmissionDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSave}
        initialData={selectedApplication}
        loading={loading}
      />

      {authError && (
        <AuthErrorDialog 
          error={authError}
          onClose={() => setAuthError(null)}
        />
      )}
    </Box>
  );
};

export default Admissions;