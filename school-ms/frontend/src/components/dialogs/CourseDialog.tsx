import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Course } from '../../services/courseService';
import { validateCourse } from '../../utils/validation';
import BaseDialog from './BaseDialog';
import { useApi } from '../../hooks/useApi';
import { teacherService } from '../../services/teacherService';

interface CourseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Course) => Promise<void>;
  initialData?: Course | null;
  loading?: boolean;
}

const CourseDialog: React.FC<CourseDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState<Course>({
    name: '',
    department: '',
    teacherId: 0,
    credits: 0,
    capacity: 30,
    enrolled: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
      });
    } else {
      // Reset to defaults when dialog is opened for new course
      setFormData({
        name: '',
        department: '',
        teacherId: 0,
        credits: 0,
        capacity: 30,
        enrolled: 0
      });
    }
  }, [initialData, open]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: teachers } = useApi(() => teacherService.getAll(), {
    cacheKey: 'teachers',
  });

  const handleChange = (field: keyof Course) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'teacherId' || field === 'credits' || field === 'capacity' || field === 'enrolled' 
      ? Number(e.target.value)
      : e.target.value;
    
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = () => {
    const validationErrors = validateCourse(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Course' : 'New Course'}
      onSubmit={handleSubmit}
      submitLabel={initialData ? 'Update' : 'Create'}
      loading={loading}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Course Name"
            value={formData.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Department"
            value={formData.department}
            onChange={handleChange('department')}
            error={!!errors.department}
            helperText={errors.department}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Teacher</InputLabel>
            <Select
              value={formData.teacherId}
              onChange={handleChange('teacherId') as any}
              label="Teacher"
              required
            >
              {teachers?.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Credits"
            type="number"
            value={formData.credits}
            onChange={handleChange('credits')}
            error={!!errors.credits}
            helperText={errors.credits}
            required
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange('capacity')}
            error={!!errors.capacity}
            helperText={errors.capacity}
            required
            inputProps={{ min: 1 }}
          />
        </Grid>
        {initialData && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Currently Enrolled"
              type="number"
              value={formData.enrolled}
              onChange={handleChange('enrolled')}
              error={!!errors.enrolled}
              helperText={errors.enrolled}
              inputProps={{ min: 0, max: formData.capacity }}
            />
          </Grid>
        )}
      </Grid>
    </BaseDialog>
  );
};

export default CourseDialog;