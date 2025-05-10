import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  AssignmentTurnedIn as GradeIcon,
} from '@mui/icons-material';
import { useApi, useApiMutation } from '../hooks/useApi';
import { teacherService, Teacher } from '../services/teacherService';
import DataTable, { Column } from '../components/DataTable';
import TeacherDialog from '../components/dialogs/TeacherDialog';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate, formatStatus, createActionColumn } from '../utils/tableFormatters';
import Permission from '../components/Permission';
import { useNotification } from '../context/NotificationContext';
import { hasPermission } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';

const Teachers: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const {
    data: teachers,
    loading,
    error,
    refresh,
  } = useApi(() => teacherService.getAllTeachers(), {
    cacheKey: 'teachers',
  });

  const { mutate: createTeacher, loading: createLoading } = useApiMutation(
    (data: Teacher) => teacherService.createTeacher(data),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Teacher created successfully' });
        setDialogOpen(false);
        refresh();
      },
    }
  );

  const { mutate: updateTeacher, loading: updateLoading } = useApiMutation(
    (data: Teacher) => teacherService.updateTeacher(data.id!, data),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Teacher updated successfully' });
        setDialogOpen(false);
        setSelectedTeacher(null);
        refresh();
      },
    }
  );

  const { mutate: deleteTeacher } = useApiMutation(
    (id: number) => teacherService.deleteTeacher(id),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Teacher deleted successfully' });
        refresh();
      },
    }
  );

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDialogOpen(true);
  };

  const handleDelete = async (teacher: Teacher) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      await deleteTeacher(teacher.id!);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTeacher(null);
  };

  const handleSubmit = async (data: Teacher) => {
    if (selectedTeacher) {
      await updateTeacher({ ...data, id: selectedTeacher.id });
    } else {
      await createTeacher(data);
    }
  };

  const columns: Column<Teacher>[] = [
    { id: 'employeeId', label: 'ID', sortable: true },
    { id: 'name', label: 'Name', sortable: true },
    { id: 'department', label: 'Department', sortable: true },
    {
      id: 'subjects',
      label: 'Subjects',
      format: (subjects: string[]) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {subjects?.map((subject) => (
            <Chip key={subject} label={subject} size="small" />
          ))}
        </Box>
      ),
    },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'phoneNumber', label: 'Contact', sortable: true },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      format: formatStatus,
    },
    createActionColumn<Teacher>(
      (row) => hasPermission(user?.role || '', 'EDIT_TEACHER') && handleEdit(row),
      (row) => hasPermission(user?.role || '', 'DELETE_TEACHER') && handleDelete(row),
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
          <Permission permissions={['MANAGE_SCHEDULE']}>
            <Tooltip title="Schedule">
              <IconButton
                size="small"
                onClick={() => {
                  // Navigate to schedule management
                }}
              >
                <ScheduleIcon />
              </IconButton>
            </Tooltip>
          </Permission>
          <Permission permissions={['MANAGE_GRADES']}>
            <Tooltip title="Grade Management">
              <IconButton
                size="small"
                onClick={() => {
                  // Navigate to grade management
                }}
              >
                <GradeIcon />
              </IconButton>
            </Tooltip>
          </Permission>
        </>
      )
    ),
  ];

  if (loading && !teachers) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Teachers</Typography>
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', mr: 2, display: 'inline-block' }}>
            * To add new teachers, please use the Staff Management page
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            component="a"
            href="/staff" // Assuming this is the correct path to the Staff page
          >
            Go to Staff Management
          </Button>
        </Box>
      </Box>

      <Paper>
        <DataTable
          columns={columns}
          data={teachers || []}
          loading={loading}
          onRefresh={refresh}
          searchPlaceholder="Search teachers..."
        />
      </Paper>

      <TeacherDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        initialData={selectedTeacher}
        loading={createLoading || updateLoading}
      />
    </Box>
  );
};

export default Teachers;
