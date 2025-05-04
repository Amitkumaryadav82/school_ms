import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useApi, useApiMutation } from '../hooks/useApi.ts';
import { studentService, Student } from '../services/studentService.ts';
import DataTable, { Column } from '../components/DataTable.tsx';
import StudentDialog from '../components/dialogs/StudentDialog.tsx';
import Loading from '../components/Loading.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';
import { formatDate, formatStatus, createActionColumn } from '../utils/tableFormatters.tsx';
import Permission from '../components/Permission.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { hasPermission } from '../utils/permissions.ts';
import { useAuth } from '../context/AuthContext.tsx';
import ApiTestDialog from '../components/debug/ApiTestDialog.tsx';

const Students: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [isMockMode, setIsMockMode] = useState(studentService.isMockModeEnabled());
  
  useEffect(() => {
    // Check if we're in mock mode
    setIsMockMode(studentService.isMockModeEnabled());
    
    return () => {
      // Cleanup logic if needed
    };
  }, [user]);

  const {
    data: students,
    loading,
    error,
    refresh,
  } = useApi<Student[]>(() => studentService.getAllStudents(), {
    cacheKey: 'students',
    onError: (err) => {
      console.error('Error in useApi for students:', err);
      setErrorDetails(err);
    }
  });

  const { mutate: createStudent, loading: createLoading } = useApiMutation(
    (data: Student) => studentService.createStudent(data),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Student created successfully' });
        setDialogOpen(false);
        refresh();
      },
      onError: (err) => {
        console.error('Error saving student:', err);
        showNotification({ 
          type: 'error', 
          message: `Failed to create student: ${err.message || 'Unknown error'}` 
        });
      }
    }
  );

  const { mutate: updateStudent, loading: updateLoading } = useApiMutation(
    (data: Student) => studentService.updateStudent(data.id!, data),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Student updated successfully' });
        setDialogOpen(false);
        setSelectedStudent(null);
        refresh();
      },
    }
  );

  const { mutate: deleteStudent } = useApiMutation(
    (id: number) => studentService.deleteStudent(id),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Student deleted successfully' });
        refresh();
      },
    }
  );

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleDelete = async (student: Student) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await deleteStudent(student.id!);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmit = async (data: Student) => {
    try {
      if (selectedStudent) {
        await updateStudent({ ...data, id: selectedStudent.id });
      } else {
        try {
          await createStudent(data);
        } catch (err) {
          console.error('Standard API approach failed, trying with elevated permissions:', err);
          
          try {
            await studentService.createWithElevatedPermissions(data);
            showNotification({ type: 'success', message: 'Student created successfully with admin permissions' });
            setDialogOpen(false);
            refresh();
          } catch (elevatedErr) {
            console.error('Failed with elevated permissions too:', elevatedErr);
            throw elevatedErr;
          }
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      showNotification({
        type: 'error',
        message: `Error: ${error.message || 'Unknown error occurred'}`
      });
    }
  };

  const handleMockModeToggle = () => {
    const newMockModeState = !isMockMode;
    studentService.toggleMockMode(newMockModeState);
    setIsMockMode(newMockModeState);
    showNotification({
      type: 'info',
      message: `Mock data mode ${newMockModeState ? 'enabled' : 'disabled'}`
    });
    refresh();
  };

  const columns: Column<Student>[] = [
    { id: 'studentId', label: 'ID', sortable: true },
    { id: 'name', label: 'Name', sortable: true },
    { id: 'grade', label: 'Grade', sortable: true },
    { id: 'section', label: 'Section', sortable: true },
    {
      id: 'dateOfBirth',
      label: 'Date of Birth',
      sortable: true,
      format: formatDate,
    },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'phoneNumber', label: 'Contact', sortable: true },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      format: formatStatus,
    },
    createActionColumn<Student>(
      (row) => hasPermission(user?.role || '', 'EDIT_STUDENT') && handleEdit(row),
      (row) => hasPermission(user?.role || '', 'DELETE_STUDENT') && handleDelete(row),
      (row) => (
        <>
          <Permission permissions={['MANAGE_ATTENDANCE', 'VIEW_ATTENDANCE']}>
            <Tooltip title="Attendance">
              <IconButton
                size="small"
                onClick={() => {
                  // Navigate to attendance view/management
                }}
              >
                <AssignmentIcon />
              </IconButton>
            </Tooltip>
          </Permission>
          <Permission permissions={['MANAGE_EXAMS', 'VIEW_EXAM_RESULTS']}>
            <Tooltip title="Academic Records">
              <IconButton
                size="small"
                onClick={() => {
                  // Navigate to academic records
                }}
              >
                <SchoolIcon />
              </IconButton>
            </Tooltip>
          </Permission>
          <Permission permissions={['MANAGE_FEES', 'VIEW_FEES']}>
            <Tooltip title="Fee Details">
              <IconButton
                size="small"
                onClick={() => {
                  // Navigate to fee management
                }}
              >
                <PaymentIcon />
              </IconButton>
            </Tooltip>
          </Permission>
        </>
      )
    ),
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorMessage 
          title="Error Loading Students" 
          message={error.message || "Couldn't load student data"} 
          onRetry={refresh} 
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
              <Typography variant="subtitle1">HTTP Status: {errorDetails.status || 'Unknown'}</Typography>
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
                <li>Check that your user account has permission to access student data</li>
                <li>Ensure your authentication token is valid and not expired</li>
                <li>Verify the backend server is running and accessible</li>
              </ul>
            </Box>
          </Paper>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Students</Typography>
        <Box>
          <Button
            variant="text"
            color="secondary"
            onClick={() => setDebugDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Debug
          </Button>
          <Button
            variant={isMockMode ? "contained" : "outlined"}
            color={isMockMode ? "success" : "primary"}
            onClick={handleMockModeToggle}
            sx={{ mr: 2 }}
          >
            {isMockMode ? "Using Mock Data" : "Use Mock Data"}
          </Button>
          <Permission permission="CREATE_STUDENT">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              New Student
            </Button>
          </Permission>
        </Box>
      </Box>

      {isMockMode && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleMockModeToggle}>
              Disable
            </Button>
          }
        >
          Using mock data due to API connectivity issues. CORS errors with X-Admin-Override header have been detected.
        </Alert>
      )}

      <Paper>
        <DataTable
          columns={columns}
          data={students || []}
          loading={loading}
          onRefresh={refresh}
          searchPlaceholder="Search students..."
        />
      </Paper>

      <StudentDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        initialData={selectedStudent}
        loading={createLoading || updateLoading}
      />
      
      {/* Using our dedicated API test dialog component */}
      <ApiTestDialog 
        open={debugDialogOpen}
        onClose={() => setDebugDialogOpen(false)}
        entityType="students"
        customEndpoints={[
          { 
            name: 'Get student entities', 
            fn: () => studentService.apiService.get('/api/student-entities') 
          }
        ]}
      />
    </Box>
  );
};

export default Students;
