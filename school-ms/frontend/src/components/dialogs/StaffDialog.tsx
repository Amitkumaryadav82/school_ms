import React, { useState } from 'react';
import {
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Box,
  Typography,
  Divider,
  FormHelperText,
} from '@mui/material';
import { StaffMember, TeacherDetails } from '../../services/staffService';
import BaseDialog from './BaseDialog';

interface StaffDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StaffMember) => Promise<void>;
  initialData?: Partial<StaffMember>;
  loading?: boolean;
}

const roles = [
  'TEACHER',
  'PRINCIPAL',
  'ADMIN_OFFICER',
  'MANAGEMENT',
  'ACCOUNT_OFFICER',
  'LIBRARIAN',
];

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

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const StaffDialog: React.FC<StaffDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState<Partial<StaffMember>>(
    initialData || {
      staffId: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      gender: 'MALE',
      joinDate: new Date().toISOString().split('T')[0],
      role: 'TEACHER',
      isActive: true,
      qualifications: '',
      bloodGroup: '',
      teacherDetails: {
        department: '',
        specialization: '',
        subjects: '',
        teachingExperience: 0,
        isClassTeacher: false
      }
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof StaffMember) => (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
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

  const handleTeacherDetailsChange = (field: keyof TeacherDetails) => (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    setFormData((prev) => ({
      ...prev,
      teacherDetails: {
        ...prev.teacherDetails!,
        [field]: e.target.value,
      },
    }));
    if (errors[`teacherDetails.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`teacherDetails.${field}`]: '',
      }));
    }
  };

  const handleTeacherCheckboxChange = (field: keyof TeacherDetails) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      teacherDetails: {
        ...prev.teacherDetails!,
        [field]: e.target.checked,
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Basic validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.staffId) newErrors.staffId = 'Staff ID is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number';
    }
    
    // Teacher-specific validation
    if (formData.role === 'TEACHER') {
      if (!formData.teacherDetails?.department) {
        newErrors['teacherDetails.department'] = 'Department is required';
      }
      if (!formData.teacherDetails?.subjects) {
        newErrors['teacherDetails.subjects'] = 'At least one subject is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Create a complete data object with all required properties
    const dataToSubmit: StaffMember = {
      id: formData.id || 0,
      staffId: formData.staffId || '',
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      fullName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email || '',
      phoneNumber: formData.phoneNumber || '',
      address: formData.address || '',
      dateOfBirth: formData.dateOfBirth || '',
      gender: formData.gender || 'MALE',
      joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
      role: formData.role || 'TEACHER',
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      qualifications: formData.qualifications || '',
      emergencyContact: formData.emergencyContact || '',
      bloodGroup: formData.bloodGroup || '',
      profileImage: formData.profileImage || '',
      designations: []
    };
    
    // Add teacher details only if the role is TEACHER
    if (dataToSubmit.role === 'TEACHER') {
      dataToSubmit.teacherDetails = {
        id: formData.teacherDetails?.id || 0,
        department: formData.teacherDetails?.department || '',
        specialization: formData.teacherDetails?.specialization || '',
        subjects: formData.teacherDetails?.subjects || '',
        teachingExperience: formData.teacherDetails?.teachingExperience || 0,
        isClassTeacher: formData.teacherDetails?.isClassTeacher || false,
        classAssignedId: formData.teacherDetails?.classAssignedId || 0,
        className: formData.teacherDetails?.className || ''
      };
    }

    onSubmit(dataToSubmit);
  };

  const isTeacher = formData.role === 'TEACHER';

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Staff Member' : 'Add Staff Member'}
      onSubmit={handleSubmit}
      submitLabel={initialData ? 'Update' : 'Create'}
      loading={loading}
      maxWidth="md"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Personal Information</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={handleChange('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Staff ID"
            value={formData.staffId}
            onChange={handleChange('staffId')}
            error={!!errors.staffId}
            helperText={errors.staffId}
            required
            disabled={!!initialData?.id}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role || 'TEACHER'}
              onChange={handleChange('role') as any}
              label="Role"
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.replace('_', ' ')}
                </MenuItem>
              ))}
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
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange('dateOfBirth')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              value={formData.gender || 'MALE'}
              onChange={handleChange('gender') as any}
              label="Gender"
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
            label="Join Date"
            type="date"
            value={formData.joinDate}
            onChange={handleChange('joinDate')}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Blood Group</InputLabel>
            <Select
              value={formData.bloodGroup || ''}
              onChange={handleChange('bloodGroup') as any}
              label="Blood Group"
            >
              {bloodGroups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Qualifications"
            multiline
            rows={2}
            value={formData.qualifications}
            onChange={handleChange('qualifications')}
            placeholder="E.g., Bachelor of Education, Master's in Mathematics"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={2}
            value={formData.address}
            onChange={handleChange('address')}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Emergency Contact"
            value={formData.emergencyContact}
            onChange={handleChange('emergencyContact')}
          />
        </Grid>

        {isTeacher && (
          <>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2 }}>Teacher Details</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors['teacherDetails.department']}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.teacherDetails?.department || ''}
                  onChange={handleTeacherDetailsChange('department') as any}
                  label="Department"
                  required
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
                {errors['teacherDetails.department'] && (
                  <FormHelperText>{errors['teacherDetails.department']}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Specialization"
                value={formData.teacherDetails?.specialization}
                onChange={handleTeacherDetailsChange('specialization')}
                placeholder="E.g., Calculus, Algebra, Literature"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subjects"
                value={formData.teacherDetails?.subjects}
                onChange={handleTeacherDetailsChange('subjects')}
                error={!!errors['teacherDetails.subjects']}
                helperText={errors['teacherDetails.subjects'] || "Enter comma-separated subjects, e.g., 'Mathematics, Physics'"}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teaching Experience (years)"
                type="number"
                value={formData.teacherDetails?.teachingExperience || 0}
                onChange={handleTeacherDetailsChange('teachingExperience')}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class Teacher</InputLabel>
                <Select
                  value={formData.teacherDetails?.isClassTeacher ? "yes" : "no"}
                  onChange={(e) => {
                    handleTeacherCheckboxChange('isClassTeacher')(
                      { target: { checked: e.target.value === "yes" } } as React.ChangeEvent<HTMLInputElement>
                    );
                  }}
                  label="Class Teacher"
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
    </BaseDialog>
  );
};

export default StaffDialog;