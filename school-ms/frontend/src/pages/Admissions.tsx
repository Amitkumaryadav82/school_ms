import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Alert, AlertTitle, Dialog, 
  DialogTitle, DialogContent, DialogActions, CircularProgress, 
  List, ListItem, ListItemText, Divider 
} from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { AdmissionApplication, admissionService } from '../services/admissionService';
import api from '../services/api.jsx';
import DataTable from '../components/DataTable.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Permission from '../components/Permission';
import { useApi } from '../hooks/useApi.ts';
import { formatDate } from '../utils/tableFormatters.tsx';
import environment from '../config/environment.jsx';

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
    format: (row: T) => (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {onEdit && (
          <Button
            size="small"
            onClick={() => onEdit(row)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            size="small"
            color="error"
            onClick={() => onDelete(row)}
          >
            Delete
          </Button>
        )}
        {extraActions && extraActions(row)}
      </Box>
    ),
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
    loading,
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

  const handleEdit = (application: AdmissionApplication) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  const handleSave = async (application: AdmissionApplication) => {
    try {
      if (application.id) {
        await admissionService.updateApplication(application.id, application);
        showNotification({
          type: 'success',
          message: 'Application updated successfully',
        });
      } else {
        await admissionService.createApplication(application);
        showNotification({
          type: 'success',
          message: 'New application created successfully',
        });
      }
      setIsDialogOpen(false);
      refresh();
    } catch (err) {
      showNotification({
        type: 'error',
        message: `Failed to save application: ${err.message}`,
      });
    }
  };

  // Helper function to run API diagnostics for debugging
  const runApiTests = async () => {
    setDebugLoading(true);
    setDebugResults([]);
    
    const endpoints = [
      { name: 'Get all admissions (singular)', fn: () => api => api.get('/admission') },
      { name: 'Get all admissions (plural)', fn: () => api => api.get('/admissions') },
      { name: 'Get all admissions (with API prefix)', fn: () => api => api.get('/api/admission') },
      { name: 'Get all admissions (with API prefix, plural)', fn: () => api => api.get('/api/admissions') },
      { name: 'Get all admissions (with v1 prefix)', fn: () => api => api.get('/api/v1/admission') },
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 Testing endpoint: ${endpoint.name}`);
        const response = await endpoint.fn()(api);
        results.push({
          name: endpoint.name,
          success: true,
          status: response.status,
          data: response.data
        });
      } catch (e) {
        results.push({
          name: endpoint.name,
          success: false,
          status: e.status || e.response?.status || 'Error',
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
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => {
              // Additional actions like approve/reject can be added here
            }}
          >
            Process
          </Button>
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

  if (loading) {
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
      
      {/* Admission dialog would be implemented here */}
    </Box>
  );
};

export default Admissions;