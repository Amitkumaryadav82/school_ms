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
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useApi, useApiMutation } from '../hooks/useApi';
import { courseService, Course } from '../services/courseService';
import DataTable, { Column } from '../components/DataTable';
import CourseDialog from '../components/dialogs/CourseDialog';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate, formatStatus, createActionColumn } from '../utils/tableFormatters';
import Permission from '../components/Permission';
import { useNotification } from '../context/NotificationContext';
import { hasPermission } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';

const Courses: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const {
    data: courses,
    loading,
    error,
    refresh,
  } = useApi(() => courseService.getAll(), {
    cacheKey: 'courses',
  });

  const { mutate: createCourse, loading: createLoading } = useApiMutation(
    (data: Course) => courseService.create(data),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Course created successfully' });
        setDialogOpen(false);
        refresh();
      },
    }
  );

  const { mutate: updateCourse, loading: updateLoading } = useApiMutation(
    (data: Course) => courseService.update(data.id!, data),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Course updated successfully' });
        setDialogOpen(false);
        setSelectedCourse(null);
        refresh();
      },
    }
  );

  const { mutate: deleteCourse } = useApiMutation(
    (id: number) => courseService.delete(id),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Course deleted successfully' });
        refresh();
      },
    }
  );

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setDialogOpen(true);
  };

  const handleDelete = async (course: Course) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await deleteCourse(course.id!);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCourse(null);
  };

  const handleSubmit = async (data: Course) => {
    if (selectedCourse) {
      await updateCourse({ ...data, id: selectedCourse.id });
    } else {
      await createCourse(data);
    }
  };

  const columns: Column<Course>[] = [
    { id: 'id', label: 'ID', sortable: true },
    { id: 'name', label: 'Name', sortable: true },
    { id: 'department', label: 'Department', sortable: true },
    { id: 'teacherId', label: 'Teacher ID', sortable: true },
    { id: 'credits', label: 'Credits', sortable: true },
    {
      id: 'capacity',
      label: 'Capacity',
      sortable: true,
    },
    {
      id: 'enrolled',
      label: 'Enrolled',
      sortable: true,
    },
    createActionColumn<Course>(
      (row) => hasPermission(user?.role || '', 'EDIT_COURSE') && handleEdit(row),
      (row) => hasPermission(user?.role || '', 'DELETE_COURSE') && handleDelete(row),
      (row) => (
        <>
          <Permission permissions={['MANAGE_ENROLLMENTS', 'VIEW_ENROLLMENTS']}>
            <Tooltip title="Students">
              <IconButton
                size="small"
                onClick={() => {
                  // Navigate to student enrollment view
                }}
              >
                <PeopleIcon />
              </IconButton>
            </Tooltip>
          </Permission>
          <Permission permissions={['MANAGE_ASSIGNMENTS']}>
            <Tooltip title="Assignments">
              <IconButton
                size="small"
                onClick={() => {
                  // Navigate to assignment management
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
        </>
      )
    ),
  ];

  if (loading && !courses) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Courses</Typography>
        <Permission permission="CREATE_COURSE">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            New Course
          </Button>
        </Permission>
      </Box>

      <Paper>
        <DataTable
          columns={columns}
          data={courses || []}
          loading={loading}
          onRefresh={refresh}
          searchPlaceholder="Search courses..."
        />
      </Paper>

      <CourseDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        initialData={selectedCourse}
        loading={createLoading || updateLoading}
      />
    </Box>
  );
};

export default Courses;