import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    School as SchoolIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import BaseTable, { BaseTableColumn } from '../components/common/BaseTable';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import { useNotification } from '../context/NotificationContext';
import { useSimplifiedApi, useSimplifiedApiMutation } from '../hooks/useSimplifiedApi';
import { ConsolidatedCourse, consolidatedCourseService } from '../services/consolidatedCourseService';

/**
 * A dialog for creating or editing courses
 */
interface CourseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (course: ConsolidatedCourse) => void;
  initialData?: ConsolidatedCourse;
  loading?: boolean;
}

const CourseDialog: React.FC<CourseDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false
}) => {
  const [course, setCourse] = useState<ConsolidatedCourse>(initialData || {
    name: '',
    department: '',
    teacherId: 0,
    credits: 0,
    capacity: 30,
    enrolled: 0
  });
  
  // Simple form handler - in a real app, use Formik or React Hook Form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourse(prev => ({
      ...prev,
      [name]: name === 'teacherId' || name === 'credits' || name === 'capacity' || name === 'enrolled' 
        ? parseInt(value) || 0 
        : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(course);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? 'Edit Course' : 'Add Course'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Course Name"
              name="name"
              value={course.name}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Department"
              name="department"
              value={course.department}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Teacher ID"
              name="teacherId"
              value={course.teacherId}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Credits"
              name="credits"
              value={course.credits}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Capacity"
              name="capacity"
              value={course.capacity}
              onChange={handleChange}
              required
            />
            {initialData && (
              <TextField
                fullWidth
                type="number"
                label="Enrolled"
                name="enrolled"
                value={course.enrolled}
                onChange={handleChange}
                required
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

/**
 * Consolidated Course View using the new BaseTable component and consolidated course service
 */
const ConsolidatedCourseView: React.FC = () => {
  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ConsolidatedCourse | null>(null);
  const { showNotification } = useNotification();
  
  // API calls
  const { 
    data: courses, 
    loading, 
    error, 
    refetch: refreshCourses 
  } = useSimplifiedApi(
    () => consolidatedCourseService.getAll(),
    { 
      cacheKey: 'all-courses',
      showErrorNotification: true,
      transform: response => response.data
    }
  );
  
  // API mutations
  const { mutate: createCourse, loading: createLoading } = useSimplifiedApiMutation(
    (course: ConsolidatedCourse) => consolidatedCourseService.create(course),
    {
      onSuccess: () => {
        showNotification({ 
          message: 'Course created successfully', 
          type: 'success' 
        });
        refreshCourses();
        setDialogOpen(false);
      }
    }
  );
  
  const { mutate: updateCourse, loading: updateLoading } = useSimplifiedApiMutation(
    (params: { id: number; course: ConsolidatedCourse }) => 
      consolidatedCourseService.update(params.id, params.course),
    {
      onSuccess: () => {
        showNotification({ 
          message: 'Course updated successfully', 
          type: 'success' 
        });
        refreshCourses();
        setDialogOpen(false);
      }
    }
  );
  
  const { mutate: deleteCourse, loading: deleteLoading } = useSimplifiedApiMutation(
    (id: number) => consolidatedCourseService.delete(id),
    {
      onSuccess: () => {
        showNotification({ 
          message: 'Course deleted successfully', 
          type: 'success' 
        });
        refreshCourses();
        setConfirmDeleteOpen(false);
      }
    }
  );
  
  // Stats API
  const { 
    data: stats
  } = useSimplifiedApi(
    () => consolidatedCourseService.getStats(),
    { 
      cacheKey: 'course-stats',
      transform: response => response.data
    }
  );
  
  // Table columns configuration
  const columns: BaseTableColumn<ConsolidatedCourse>[] = [
    {
      id: 'id',
      label: 'ID',
      sortable: true,
      minWidth: 70
    },
    {
      id: 'name',
      label: 'Course Name',
      sortable: true,
      minWidth: 150
    },
    {
      id: 'department',
      label: 'Department',
      sortable: true,
      minWidth: 120,
      format: (value) => (
        <Chip 
          label={value} 
          color="primary" 
          size="small" 
          icon={<SchoolIcon />} 
        />
      )
    },
    {
      id: 'teacherId',
      label: 'Teacher ID',
      sortable: true,
      minWidth: 100
    },
    {
      id: 'credits',
      label: 'Credits',
      sortable: true,
      minWidth: 80,
      align: 'right'
    },
    {
      id: 'capacity',
      label: 'Capacity',
      sortable: true,
      minWidth: 80,
      align: 'right'
    },
    {
      id: 'enrolled',
      label: 'Enrolled',
      sortable: true,
      minWidth: 80,
      align: 'right'
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      minWidth: 120,
      align: 'center',
      format: (_, row: ConsolidatedCourse) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={() => handleEdit(row)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={() => handleDeleteClick(row)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];
  
  // Event handlers
  const handleAddClick = () => {
    setSelectedCourse(null);
    setDialogOpen(true);
  };
  
  const handleEdit = (course: ConsolidatedCourse) => {
    setSelectedCourse(course);
    setDialogOpen(true);
  };
  
  const handleDeleteClick = (course: ConsolidatedCourse) => {
    setSelectedCourse(course);
    setConfirmDeleteOpen(true);
  };
  
  const handleSubmit = async (course: ConsolidatedCourse) => {
    if (selectedCourse?.id) {
      await updateCourse({ id: selectedCourse.id, course });
    } else {
      await createCourse(course);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (selectedCourse?.id) {
      await deleteCourse(selectedCourse.id);
    }
  };
  
  // Render
  if (loading && !courses) {
    return <Loading />;
  }

  if (error && !courses) {
    return <ErrorMessage message="Failed to load course data." onRetry={refreshCourses} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Course Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Course
        </Button>
      </Stack>
      
      {stats && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Course Statistics
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
            <StatsCard title="Total Courses" value={stats.totalCourses} />
            <StatsCard title="Total Capacity" value={stats.totalCapacity} />
            <StatsCard title="Total Enrolled" value={stats.totalEnrolled} />
            <StatsCard title="Fill Rate" value={stats.fillRate} />
          </Stack>
        </Box>
      )}

      <BaseTable
        columns={columns}
        data={courses || []}
        loading={loading}
        onRefresh={refreshCourses}
        searchEnabled={true}
        searchPlaceholder="Search courses..."
        defaultSortBy="name"
        defaultSortDirection="asc"
        title="Course List"
        emptyMessage="No courses found"
      />

      {/* Course Dialog */}
      <CourseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedCourse || undefined}
        loading={createLoading || updateLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the course "{selectedCourse?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained" 
            disabled={deleteLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Stats card component
interface StatsCardProps {
  title: string;
  value: string | number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value }) => (
  <Box 
    sx={{ 
      p: 2, 
      bgcolor: 'background.paper', 
      borderRadius: 1, 
      boxShadow: 1,
      minWidth: 150
    }}
  >
    <Typography variant="subtitle2" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h5">
      {value}
    </Typography>
  </Box>
);

export default ConsolidatedCourseView;
