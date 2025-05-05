import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Alert, AlertTitle, Dialog, 
  DialogTitle, DialogContent, DialogActions, CircularProgress, 
  List, ListItem, ListItemText, Divider 
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {onEdit && (
            <Button
              size="small"
              onClick={() => {
                // Only call onEdit if row exists
                if (row) onEdit(row);
              }}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          )}
          {onDelete && row && (
            <Button
              size="small"
              color="error"
              onClick={() => {
                // Only call onDelete if row exists
                if (row) onDelete(row);
              }}
            >
              Delete
            </Button>
          )}
          {extraActions && row && extraActions(row)}
        </Box>
      );
    },
  };
};

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
  const handleProcessAdmission = async (application: AdmissionApplication, action: 'APPROVE' | 'REJECT') => {
    try {
      setLoading(true);
      
      let reason = '';
      if (action === 'REJECT') {
        reason = prompt('Please provide a reason for rejection:') || '';
      }
      
      console.log(`Processing admission ${application.id} with action: ${action}, reason: ${reason}`);
      await admissionService.processAdmission(application.id, action, reason);
      
      showNotification({
        type: 'success',
        message: `Application ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`
      });
      
      // Refresh the list to show updated status
      refresh();
    } catch (err: any) {
      console.error(`Error ${action.toLowerCase()}ing application:`, err);
      
      // Handle auth errors with detailed dialog
      if (err.status === 403) {
        setAuthError(err);
      } else {
        showNotification({
          type: 'error',
          message: `Failed to ${action.toLowerCase()} application: ${err.message}`
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
      format: formatStatus,
    },
    createActionColumn<AdmissionApplication>(
      (row) => handleEdit(row),
      undefined, // No delete action
      (row) => (
        <Permission permission="MANAGE_ADMISSIONS">
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={() => handleProcessAdmission(row, 'APPROVE')}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleProcessAdmission(row, 'REJECT')}
            >
              Reject
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => handleCreateStudent(row)}
            >
              Create Student
            </Button>
          </Box>
        </Permission>
      )
    ),
  ];

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
        <Box>
          <Button
            variant="text"
            color="secondary"
            onClick={() => setDebugDialogOpen(true)}
            sx={{ mr: 2 }}
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
      
      <DataTable
        columns={columns}
        data={admissions || []}
        pagination
      />
      
      {renderDebugDialog()}
      
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