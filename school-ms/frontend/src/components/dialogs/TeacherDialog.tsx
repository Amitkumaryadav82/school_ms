import React, { useState } from 'react';
import {
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from '@mui/material';
import { Teacher } from '../../services/teacherService';
import { validateTeacher } from '../../utils/validation';
import BaseDialog from './BaseDialog';

interface TeacherDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Teacher) => Promise<void>;
  initialData?: Partial<Teacher>;
  loading?: boolean;
}

const departments = [
  'Mathematics',
  'Science',
  'English',
  'Social Studies',
  'Physical Education',
  'Arts',
  'Music',
  'Computer Science',
  'Languages',
];

const qualifications = [
  'Bachelor of Education',
  'Master of Education',
  'PhD in Education',
  'Bachelor of Science',
  'Master of Science',
  'Bachelor of Arts',
  'Master of Arts',
  'Teaching Certification',
];

const TeacherDialog: React.FC<TeacherDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState<Partial<Teacher>>(
    initialData || {
      name: '',
      employeeId: '',
      department: '',
      subjects: [],
      qualifications: [],
      dateOfBirth: '',
      gender: '',
      email: '',
      phoneNumber: '',
      address: '',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSubject, setNewSubject] = useState('');
  const [newQualification, setNewQualification] = useState('');

  const handleChange = (field: keyof Teacher) => (
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

  const handleAddSubject = () => {
    if (newSubject && !formData.subjects?.includes(newSubject)) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...(prev.subjects || []), newSubject],
      }));
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects?.filter((s) => s !== subject),
    }));
  };

  const handleAddQualification = () => {
    if (
      newQualification &&
      !formData.qualifications?.includes(newQualification)
    ) {
      setFormData((prev) => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), newQualification],
      }));
      setNewQualification('');
    }
  };

  const handleRemoveQualification = (qualification: string) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications?.filter((q) => q !== qualification),
    }));
  };

  const handleSubmit = () => {
    const validationErrors = validateTeacher(formData as Teacher);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData as Teacher);
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Teacher' : 'New Teacher'}
      onSubmit={handleSubmit}
      submitLabel={initialData ? 'Update' : 'Create'}
      loading={loading}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Name"
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
            label="Employee ID"
            value={formData.employeeId}
            onChange={handleChange('employeeId')}
            error={!!errors.employeeId}
            helperText={errors.employeeId}
            required
            disabled={!!initialData}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.department}>
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.department}
              onChange={handleChange('department') as any}
              label="Department"
              required
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange('dateOfBirth')}
            error={!!errors.dateOfBirth}
            helperText={errors.dateOfBirth}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              value={formData.gender}
              onChange={handleChange('gender') as any}
              label="Gender"
              required
            >
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange('phoneNumber')}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Add Subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
            helperText="Press Enter to add subject"
          />
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.subjects?.map((subject) => (
              <Chip
                key={subject}
                label={subject}
                onDelete={() => handleRemoveSubject(subject)}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Add Qualification</InputLabel>
            <Select
              value={newQualification}
              onChange={(e) => setNewQualification(e.target.value)}
              onClose={() => {
                if (newQualification) {
                  handleAddQualification();
                }
              }}
              label="Add Qualification"
            >
              {qualifications.map((qual) => (
                <MenuItem key={qual} value={qual}>
                  {qual}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.qualifications?.map((qualification) => (
              <Chip
                key={qualification}
                label={qualification}
                onDelete={() => handleRemoveQualification(qualification)}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={3}
            value={formData.address}
            onChange={handleChange('address')}
            error={!!errors.address}
            helperText={errors.address}
            required
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
};

export default TeacherDialog;