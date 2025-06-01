import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  CircularProgress,
} from '@mui/material';
import { useApi } from '../../hooks/useApi';
import { studentService } from '../../services/studentService';
import { validateEnrollment } from '../../utils/validation';
import { SelectChangeEvent } from '@mui/material';

interface EnrollmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
}

const EnrollmentDialog: React.FC<EnrollmentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: students } = useApi(() => studentService.getAllStudents(), {
    cacheKey: 'students',
  });

  // Courses service removed
  const courses = [];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        enrollmentDate: initialData.enrollmentDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData]);
  // Create separate handlers for different input types
  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateEnrollment(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Edit Enrollment' : 'New Enrollment'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth error={!!errors.studentId}>
              <InputLabel>Student</InputLabel>              <Select
                name="studentId"
                value={formData.studentId}
                onChange={handleSelectChange}
                label="Student"
              >                {students?.map(student => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.studentId && (
                <FormHelperText>{errors.studentId}</FormHelperText>
              )}
            </FormControl>            <FormControl fullWidth error={!!errors.courseId}>
              <InputLabel>Course</InputLabel>
              <Select
                name="courseId"
                value={formData.courseId}
                onChange={handleSelectChange}
                label="Course"
                disabled
              >
                <MenuItem value="">
                  <em>Courses module has been removed</em>
                </MenuItem>
              </Select>
              {errors.courseId && (
                <FormHelperText>{errors.courseId}</FormHelperText>
              )}
            </FormControl>

            <TextField
              name="enrollmentDate"
              label="Enrollment Date"
              type="date"
              value={formData.enrollmentDate}
              onChange={handleTextFieldChange}
              error={!!errors.enrollmentDate}
              helperText={errors.enrollmentDate}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <FormControl fullWidth error={!!errors.status}>
              <InputLabel>Status</InputLabel>              <Select
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                label="Status"
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="WITHDRAWN">Withdrawn</MenuItem>
              </Select>
              {errors.status && (
                <FormHelperText>{errors.status}</FormHelperText>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : initialData ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EnrollmentDialog;