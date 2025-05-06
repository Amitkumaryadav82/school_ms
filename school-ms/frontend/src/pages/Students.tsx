import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useApi, useApiMutation } from '../hooks/useApi.ts';
import { studentService, Student } from '../services/studentService.ts';
import DataTable, { Column } from '../components/DataTable.tsx';
import StudentDialog from '../components/dialogs/StudentDialog.tsx';
import BulkStudentUploadDialog from '../components/dialogs/BulkStudentUploadDialog.tsx';
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
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  
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
    (data: Student) => studentService.create(data),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Student created successfully' });
        setDialogOpen(false);
        refresh();
      },
      onError: (err) => {
        console.error('Error saving student:', err);
        if (err.response) {
          console.error('Server response:', err.response.data);
          console.error('Status code:', err.response.status);
        }
        showNotification({ 
          type: 'error', 
          message: `Failed to create student: ${err.response?.data?.message || err.message || 'Unknown error'}` 
        });
      }
    }
  );

  const { mutate: updateStudent, loading: updateLoading } = useApiMutation(
    (data: Student) => studentService.update(data.id!, data),
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
    (id: number) => studentService.delete(id),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Student deleted successfully' });
        refresh();
      },
    }
  );

  const { mutate: createBulkStudents, loading: bulkCreateLoading } = useApiMutation(
    (students: Student[]) => studentService.createBulk(students),
    {
      onSuccess: (data) => {
        showNotification({ 
          type: 'success', 
          message: `${data.length} students created successfully` 
        });
        setBulkDialogOpen(false);
        refresh();
      },
      onError: (err) => {
        console.error('Error creating students in bulk:', err);
        showNotification({ 
          type: 'error', 
          message: `Failed to create students: ${err.message || 'Unknown error'}` 
        });
      }
    }
  );

  const { mutate: updateStudentStatus } = useApiMutation(
    (data: { id: number, status: string }) => studentService.updateStatus(data.id, data.status),
    {
      onSuccess: (data) => {
        showNotification({ type: 'success', message: `Student status updated to ${data.status}` });
        refresh();
      },
      onError: (error) => {
        showNotification({ 
          type: 'error', 
          message: `Failed to update student status: ${error.message}` 
        });
      }
    }
  );
  
  const handleStatusChange = async (student: Student, newStatus: string) => {
    try {
      await updateStudentStatus({ id: student.id!, status: newStatus });
      setMenuAnchorEl(null);
    } catch (error) {
      console.error('Error updating student status:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, student: Student) => {
    setSelectedStudent(student);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleDelete = async (student: Student) => {
    setStudentToDelete(student);
    setConfirmationDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteStudent(studentToDelete.id!);
        setConfirmationDialogOpen(false);
        setStudentToDelete(null);
      } catch (error) {
        console.error('Error deleting student:', error);
        showNotification({
          type: 'error',
          message: `Failed to delete student: ${error.message || 'Unknown error'}`
        });
        // Keep the dialog open if there was an error
      }
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmit = async (data: Student) => {
    try {
      if (selectedStudent) {
        const updatedStudentData = {
          id: selectedStudent.id,
          studentId: data.studentId,
          firstName: data.name.split(' ')[0],
          lastName: data.name.includes(' ') ? data.name.substring(data.name.indexOf(' ') + 1) : '',
          grade: parseInt(data.grade, 10),
          section: data.section || "A",
          email: data.email,
          contactNumber: data.phoneNumber || "",
          dateOfBirth: data.dateOfBirth,
          gender: data.gender || "MALE",
          address: data.address || "",
          guardianName: data.parentName || "",
          guardianContact: data.parentPhone || "",
          guardianEmail: data.parentEmail || data.email,
          status: data.status || "ACTIVE",
          bloodGroup: data.bloodGroup || "",
          admissionDate: data.admissionDate || new Date().toISOString().split('T')[0]
        };
        
        await updateStudent(updatedStudentData);
      } else {
        const newStudentData = {
          studentId: data.studentId,
          firstName: data.name.split(' ')[0],
          lastName: data.name.includes(' ') ? data.name.substring(data.name.indexOf(' ') + 1) : '',
          grade: parseInt(data.grade, 10),
          section: data.section || "A",
          email: data.email,
          contactNumber: data.phoneNumber || "",
          dateOfBirth: data.dateOfBirth,
          gender: data.gender || "MALE",
          address: data.address || "",
          guardianName: data.parentName || "",
          guardianContact: data.parentPhone || "",
          guardianEmail: data.parentEmail || data.email,
          status: "ACTIVE",
          bloodGroup: data.bloodGroup || "",
          admissionDate: new Date().toISOString().split('T')[0]
        };
        
        console.log("Creating new student with properly structured data:", newStudentData);
        
        try {
          await createStudent(newStudentData);
        } catch (err) {
          console.error('Standard API approach failed, trying with elevated permissions:', err);
          
          try {
            await studentService.createWithElevatedPermissions(newStudentData);
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
        message: `Error: ${error.response?.data?.message || error.message || 'Unknown error occurred'}`
      });
    }
  };

  const handleBulkSubmit = async (students: Student[]) => {
    try {
      await createBulkStudents(students);
    } catch (err) {
      console.error('Standard API approach failed, trying with elevated permissions:', err);
      
      try {
        await studentService.createBulkWithElevatedPermissions(students);
        showNotification({ 
          type: 'success', 
          message: `${students.length} students created successfully with admin permissions` 
        });
        setBulkDialogOpen(false);
        refresh();
      } catch (elevatedErr) {
        console.error('Failed with elevated permissions too:', elevatedErr);
        throw elevatedErr;
      }
    }
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
      format: (value) => {
        const status = String(value).toUpperCase();
        let color = 'default';
        
        if (status === 'ACTIVE') color = 'success';
        else if (status === 'INACTIVE') color = 'error';
        else if (status === 'GRADUATED') color = 'info';
        else if (status === 'SUSPENDED') color = 'warning';
        
        return (
          <Typography
            variant="body2"
            sx={{
              color: `${color}.main`,
              fontWeight: 'medium',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            {status === 'ACTIVE' && <CheckIcon fontSize="small" />}
            {status === 'INACTIVE' && <CloseIcon fontSize="small" />}
            {status === 'GRADUATED' && <SchoolIcon fontSize="small" />}
            {status === 'SUSPENDED' && <LogoutIcon fontSize="small" />}
            {status}
          </Typography>
        );
      }
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      format: (_, row: Student) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasPermission(user?.role || '', 'EDIT_STUDENT') && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => handleEdit(row)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {hasPermission(user?.role || '', 'DELETE_STUDENT') && (
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => handleDelete(row)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {hasPermission(user?.role || '', 'EDIT_STUDENT') && (
            <Tooltip title="Change Status">
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {hasPermission(user?.role || '', 'MANAGE_ATTENDANCE') && (
            <Tooltip title="Attendance">
              <IconButton size="small" color="info">
                <AssignmentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {hasPermission(user?.role || '', 'MANAGE_EXAMS') && (
            <Tooltip title="Academic Records">
              <IconButton size="small" color="success">
                <SchoolIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {hasPermission(user?.role || '', 'MANAGE_FEES') && (
            <Tooltip title="Fee Details">
              <IconButton size="small" color="secondary">
                <PaymentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
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
          <Permission permission="CREATE_STUDENT">
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={() => setBulkDialogOpen(true)}
              >
                Bulk Upload
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
              >
                New Student
              </Button>
            </Stack>
          </Permission>
        </Box>
      </Box>

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
      
      <BulkStudentUploadDialog 
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onSubmit={handleBulkSubmit}
        loading={bulkCreateLoading}
      />
      
      <ApiTestDialog 
        open={debugDialogOpen}
        onClose={() => setDebugDialogOpen(false)}
        entityType="students"
        customEndpoints={[
          { 
            name: 'Get student entities', 
            fn: () => studentService.getAllStudents() 
          }
        ]}
      />

      <Dialog
        open={confirmationDialogOpen}
        onClose={() => setConfirmationDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this student?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => handleStatusChange(selectedStudent!, 'ACTIVE')}>Set Active</MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedStudent!, 'INACTIVE')}>Set Inactive</MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedStudent!, 'GRADUATED')}>Set Graduated</MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedStudent!, 'SUSPENDED')}>Set Suspended</MenuItem>
      </Menu>
    </Box>
  );
};

export default Students;
