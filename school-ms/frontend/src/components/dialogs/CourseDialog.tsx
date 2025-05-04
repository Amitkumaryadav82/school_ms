import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Box,
} from '@mui/material';
import { Course } from '../../services/courseService';
import { Teacher } from '../../services/teacherService';
import { validateCourse } from '../../utils/validation';
import BaseDialog from './BaseDialog';
import { useApi } from '../../hooks/useApi';
import { teacherService } from '../../services/teacherService';

interface CourseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Course) => Promise<void>;
  initialData?: Partial<Course>;
  loading?: boolean;
}

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const terms = ['FIRST', 'SECOND', 'THIRD', 'FOURTH'];

const CourseDialog: React.FC<CourseDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState<Partial<Course>>(
    initialData || {
      name: '',
      courseCode: '',
      description: '',
      grade: '',
      term: 'FIRST',
      credits: 0,
      capacity: 30,
      assignedTeachers: [],
      status: 'ACTIVE',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: teachers } = useApi(() => teacherService.getAllTeachers(), {
    cacheKey: 'teachers',
  });

  const handleChange = (field: keyof Course) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleTeacherChange = (event: any) => {
    const selectedTeacherIds = event.target.value as number[];
    const selectedTeachers = teachers?.filter((teacher) =>
      selectedTeacherIds.includes(teacher.id!)
    );
    setFormData((prev) => ({
      ...prev,
      assignedTeachers: selectedTeachers || [],
    }));
  };

  const handleSubmit = () => {
    const validationErrors = validateCourse(formData as Course);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData as Course);
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
            label="Course Code"
            value={formData.courseCode}
            onChange={handleChange('courseCode')}
            error={!!errors.courseCode}
            helperText={errors.courseCode}
            required
            disabled={!!initialData}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange('description')}
            error={!!errors.description}
            helperText={errors.description}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.grade}>
            <InputLabel>Grade</InputLabel>
            <Select
              value={formData.grade}
              onChange={handleChange('grade') as any}
              label="Grade"
              required
            >
              {grades.map((grade) => (
                <MenuItem key={grade} value={grade}>
                  Grade {grade}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Term</InputLabel>
            <Select
              value={formData.term}
              onChange={handleChange('term') as any}
              label="Term"
              required
            >
              {terms.map((term) => (
                <MenuItem key={term} value={term}>
                  {term.charAt(0) + term.slice(1).toLowerCase()} Term
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
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Assigned Teachers</InputLabel>
            <Select
              multiple
              value={formData.assignedTeachers?.map((t) => t.id!) || []}
              onChange={handleTeacherChange}
              label="Assigned Teachers"
              renderValue={(selected: number[]) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((teacherId) => {
                    const teacher = teachers?.find((t) => t.id === teacherId);
                    return (
                      teacher && (
                        <Chip
                          key={teacherId}
                          label={`${teacher.name} (${teacher.department})`}
                        />
                      )
                    );
                  })}
                </Box>
              )}
            >
              {teachers?.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.name} - {teacher.department}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </BaseDialog>
  );
};

export default CourseDialog;