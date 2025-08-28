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
  MenuItem,
  FormControl,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
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
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useApi, useApiMutation } from '../hooks/useApi';
import { studentService, Student } from '../services/studentService';
import feeService from '../services/feeService';
import DataTable, { Column } from '../components/DataTable';
import StudentDialog from '../components/dialogs/StudentDialog';
import BulkStudentUploadDialog from '../components/dialogs/BulkStudentUploadDialog';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate, formatStatus, createActionColumn } from '../utils/tableFormatters';
import Permission from '../components/Permission';
import { useNotification } from '../context/NotificationContext';
import { hasPermission } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';
import ApiTestDialog from '../components/debug/ApiTestDialog';
import StudentFeeDetails from '../components/StudentFeeDetails';
import { StudentFeeDetails as StudentFeeDetailsType } from '../types/payment.types';
import api from '../services/api';
import StudentAttendanceDialog from '../components/dialogs/StudentAttendanceDialog';
import StudentAcademicDialog from '../components/dialogs/StudentAcademicDialog';
import StudentFeeReportsDialog from '../components/dialogs/StudentFeeReportsDialog';

const Students: React.FC = () => {
  type DeletionImpact = {
    attendanceCount: number;
    paymentsCount: number;
    feePaymentsCount: number;
    paymentSchedulesCount: number;
    feeAssignmentsCount: number;
  };
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Partial<Student> | undefined>(undefined);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [deletionImpact, setDeletionImpact] = useState<DeletionImpact | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | undefined>(undefined);
  const [feeDetailsDialogOpen, setFeeDetailsDialogOpen] = useState(false);
  const [selectedStudentFeeDetails, setSelectedStudentFeeDetails] = useState<StudentFeeDetailsType | null>(null);
  const [loadingFeeDetails, setLoadingFeeDetails] = useState(false);
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [feeDetailsOpen, setFeeDetailsOpen] = useState(false);
  const [feeDetailsLoading, setFeeDetailsLoading] = useState(false);
  const [studentFeeDetails, setStudentFeeDetails] = useState<StudentFeeDetailsType | null>(null);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [academicDialogOpen, setAcademicDialogOpen] = useState(false);
  const [feeReportsOpen, setFeeReportsOpen] = useState(false);

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
      onError: (err: unknown) => {
        console.error('Error saving student:', err);
        const axiosError = err as any;
        if (axiosError.response) {
          console.error('Server response:', axiosError.response.data);
          console.error('Status code:', axiosError.response.status);
        }
        showNotification({
          type: 'error',
          message: `Failed to create student: ${axiosError.response?.data?.message || (err as Error)?.message || 'Unknown error'}`
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
        setSelectedStudent(undefined);
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

  const handleStatusChange = async (student: Partial<Student>, newStatus: string) => {
    try {
      if (student.id) {
        await updateStudentStatus({ id: student.id, status: newStatus });
      }
      setMenuAnchorEl(null);
    } catch (error) {
      console.error('Error updating student status:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, student: Partial<Student>) => {
    setSelectedStudent(student);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleOpenAttendance = (student: Student) => {
    setSelectedStudent(student);
    setAttendanceDialogOpen(true);
  };

  const handleOpenAcademic = (student: Student) => {
    setSelectedStudent(student);
    setAcademicDialogOpen(true);
  };

  const handleDelete = async (student: Student) => {
    setStudentToDelete(student);
    setDeletionImpact(null);
    setConfirmationDialogOpen(true);
    // Fetch deletion impact for a better confirmation prompt
    try {
    const resp = await api.get<DeletionImpact>(`/api/students/${student.id}/deletion-impact`);
    // support either axios {data} or a plain object
    const impact = (resp && (resp as any).data) ? (resp as any).data as DeletionImpact : (resp as unknown as DeletionImpact);
    setDeletionImpact(impact);
    } catch (e) {
      console.warn('Could not fetch deletion impact:', e);
    }
  };

  const handleFeeDetailsClick = async (student: Student) => {
    // New behavior: open the Fee Reports dialog with current student preselected
    if (!student.id) {
      showNotification({ type: 'error', message: 'Cannot open fee reports: Student ID is missing' });
      return;
    }
    if (!hasPermission(user?.role || '', 'VIEW_FEES') && !hasPermission(user?.role || '', 'MANAGE_FEES')) {
      showNotification({ type: 'error', message: 'You do not have permission to view fee details.' });
      return;
    }
    setSelectedStudent(student);
    setFeeReportsOpen(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteStudent(studentToDelete.id!);
        setConfirmationDialogOpen(false);
        setStudentToDelete(undefined);
        setDeletionImpact(null);
      } catch (error: unknown) {
        console.error('Error deleting student:', error);
        const axiosError = error as any;
        const serverMessage = axiosError?.response?.data?.message || (error as Error)?.message || 'Unknown error';
        showNotification({
          type: 'error',
          message: `Failed to delete student: ${serverMessage}`
        });
        // Keep the dialog open if there was an error
      }
    }
  };

  const disableStudent = async () => {
    if (!studentToDelete?.id) return;
    try {
      await updateStudentStatus({ id: studentToDelete.id, status: 'INACTIVE' });
      setConfirmationDialogOpen(false);
      setStudentToDelete(undefined);
      setDeletionImpact(null);
    } catch (e) {
      showNotification({ type: 'error', message: (e as Error)?.message || 'Failed to update status' });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedStudent(undefined);
  };

  const handleFeeDetailsDialogClose = () => {
    setFeeDetailsDialogOpen(false);
    setSelectedStudentFeeDetails(null);
  };

  const handleSubmit = async (data: Student) => {
    try {
      if (selectedStudent) {
        // For updating existing student
        await updateStudent({
          ...data,
          id: selectedStudent.id
        });
      } else {
        // For creating new student
        console.log("Creating new student with properly structured data:", data);

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
    } catch (error: unknown) {
      console.error('Error in handleSubmit:', error);
      const axiosError = error as any;
      showNotification({
        type: 'error',
        message: `Error: ${axiosError.response?.data?.message || (error as Error)?.message || 'Unknown error occurred'}`
      });
    }
  };

  const handleBulkSubmit = async (students: Student[]) => {
    try {
      await createBulkStudents(students);
    } catch (err: unknown) {
      console.error('Standard API approach failed, trying with elevated permissions:', err);

      try {
        await studentService.createBulkWithElevatedPermissions(students);
        showNotification({
          type: 'success',
          message: `${students.length} students created successfully with admin permissions`
        });
        setBulkDialogOpen(false);
        refresh();
      } catch (elevatedErr: unknown) {
        console.error('Failed with elevated permissions too:', elevatedErr);
        throw elevatedErr;
      }
    }
  };

  const handleFeeDetailsOpen = async (studentId: number) => {
    setFeeDetailsLoading(true);
    setFeeDetailsOpen(true);
    try {
      const feeDetails = await feeService.getStudentFeeDetails(studentId);
      setStudentFeeDetails(feeDetails);
    } catch (error) {
      console.error('Error fetching fee details:', error);
      showNotification({
        type: 'error',
        message: `Failed to fetch fee details: ${(error as Error)?.message || 'Unknown error'}`
      });
    } finally {
      setFeeDetailsLoading(false);
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
      format: (value, row: Student) => {
        const status = String(value).toUpperCase();

        if (hasPermission(user?.role || '', 'EDIT_STUDENT')) {
          return (
            <FormControl size="small" fullWidth>
              <Select
                value={status}
                onChange={(e) => handleStatusChange(row, e.target.value)}
                displayEmpty
                variant="standard"
                sx={{
                  '& .MuiSelect-select': {
                    py: 0,
                    color: () => {
                      switch (status) {
                        case 'ACTIVE': return 'success.main';
                        case 'INACTIVE': return 'error.main';
                        case 'GRADUATED': return 'info.main';
                        case 'SUSPENDED': return 'warning.dark';
                        default: return 'text.primary';
                      }
                    }
                  }
                }}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="GRADUATED">Graduated</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
              </Select>
            </FormControl>
          );
        } else {
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

          {hasPermission(user?.role || '', 'MANAGE_ATTENDANCE') && (
            <Tooltip title="Attendance">
              <IconButton size="small" color="info" onClick={() => handleOpenAttendance(row)}>
                <AssignmentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

      {hasPermission(user?.role || '', 'MANAGE_EXAMS') && (
            <Tooltip title="Academic Records">
        <IconButton size="small" color="success" onClick={() => handleOpenAcademic(row)}>
                <SchoolIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {(hasPermission(user?.role || '', 'MANAGE_FEES') || hasPermission(user?.role || '', 'VIEW_FEES')) && (
            <Tooltip title="Fee Details">
              <IconButton size="small" color="secondary" onClick={() => handleFeeDetailsClick(row)}>
                <PaymentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  if (loading) return <Loading />;

  if (error) {
    // Properly handle potential string error by explicitly checking type first
    const errorMessage = typeof error === 'string'
      ? error
      : (error as Error)?.message || String(error) || "Couldn't load student data";

    return (
      <Box sx={{ p: 3 }}>
        <ErrorMessage
          title="Error Loading Students"
          message={errorMessage}
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

      <StudentAttendanceDialog
        open={attendanceDialogOpen}
        onClose={() => setAttendanceDialogOpen(false)}
        student={selectedStudent as any || null}
      />

      <StudentAcademicDialog
        open={academicDialogOpen}
        onClose={() => setAcademicDialogOpen(false)}
        student={selectedStudent as any || null}
      />

      <StudentFeeReportsDialog
        open={feeReportsOpen}
        onClose={() => setFeeReportsOpen(false)}
        student={selectedStudent as any || null}
      />

      <BulkStudentUploadDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onSubmit={handleBulkSubmit}
        loading={bulkCreateLoading}
      />

      {/* Confirmation dialog with deletion impact and disable option */}
      <Dialog
        open={confirmationDialogOpen}
        onClose={() => setConfirmationDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this student? Related records will be removed where applicable.
          </DialogContentText>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>The following will be deleted with the student:</Typography>
            <ul style={{ marginTop: 0 }}>
              <li>Attendance: {deletionImpact ? deletionImpact.attendanceCount : '…'}</li>
              <li>Payments: {deletionImpact ? deletionImpact.paymentsCount : '…'}</li>
              <li>Fee Payments: {deletionImpact ? deletionImpact.feePaymentsCount : '…'}</li>
              <li>Payment Schedules: {deletionImpact ? deletionImpact.paymentSchedulesCount : '…'}</li>
              <li>Fee Assignments: {deletionImpact ? deletionImpact.feeAssignmentsCount : '…'}</li>
            </ul>
            <Alert severity="info" sx={{ mt: 1 }}>
              Alternatively, you can disable the student to keep records but prevent usage.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={disableStudent} color="warning" variant="outlined">
            Disable Instead
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={feeDetailsDialogOpen}
        onClose={handleFeeDetailsDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Fee Details</DialogTitle>
        <DialogContent>
          {loadingFeeDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : selectedStudentFeeDetails ? (
            <StudentFeeDetails feeDetails={selectedStudentFeeDetails} />
          ) : (
            <Typography>No fee details available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFeeDetailsDialogClose} color="primary">
            Close
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
