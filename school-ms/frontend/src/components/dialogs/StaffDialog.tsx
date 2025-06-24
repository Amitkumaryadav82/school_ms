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
      // Initialize new fields
      pfUAN: '',
      gratuity: '',
      serviceEndDate: '',
      // Salary details
      basicSalary: 0,
      hra: 0,
      da: 0,
      ta: 0,
      otherAllowances: 0,
      pfContribution: 0,
      taxDeduction: 0,
      netSalary: 0,
      salaryAccountNumber: '',
      bankName: '',
      ifscCode: '',
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
  
  // Add useEffect to update formData when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('StaffDialog initialData:', initialData);
      
      setFormData(prev => {
        // Extract role from potentially nested objects
        let roleValue: string = 'TEACHER'; // Default
        
        if (initialData.role) {
          if (typeof initialData.role === 'object' && initialData.role !== null) {
            const roleObj = initialData.role as any;
            roleValue = roleObj.name || roleObj.role || roleValue;
          } else if (typeof initialData.role === 'string') {
            roleValue = initialData.role;
          }
        } else if (initialData.staffRole) {
          // Check for staffRole as fallback
          if (typeof initialData.staffRole === 'object' && initialData.staffRole !== null) {
            const staffRoleObj = initialData.staffRole as any;
            roleValue = staffRoleObj.name || staffRoleObj.role || roleValue;
          } else {
            roleValue = String(initialData.staffRole);
          }
        }

        // Convert role to uppercase for consistency with dropdown options
        roleValue = roleValue.toUpperCase().replace(/ /g, '_');
        
        // Extract phone number
        const phoneNumberValue = initialData.phoneNumber || initialData.phone || '';
        
        // Extract blood group - try different property access methods
        let bloodGroupValue = '';
        if (initialData.bloodGroup !== undefined) {
          bloodGroupValue = initialData.bloodGroup;
        } else if (typeof initialData === 'object' && initialData !== null) {
          // Try case-insensitive match
          for (const key in initialData) {
            if (key.toLowerCase() === 'bloodgroup') {
              const val = (initialData as any)[key];
              if (val !== undefined) bloodGroupValue = String(val);
              break;
            }
          }
        }
        
        // Extract qualifications with similar approach
        let qualificationsValue = '';
        if (initialData.qualifications !== undefined) {
          qualificationsValue = initialData.qualifications;
        } else if (typeof initialData === 'object' && initialData !== null) {
          // Try case-insensitive match
          for (const key in initialData) {
            if (key.toLowerCase() === 'qualifications') {
              const val = (initialData as any)[key];
              if (val !== undefined) qualificationsValue = String(val);
              break;
            }
          }
        }        // Extract emergencyContact
        const emergencyContactValue = initialData.emergencyContact || '';
        
        // Extract PF UAN
        const pfUANValue = initialData.pfUAN || '';
        
        // Extract Gratuity
        const gratuityValue = initialData.gratuity || '';
        
        // Extract Salary Details
        const basicSalaryValue = initialData.basicSalary || 0;
        const hraValue = initialData.hra || 0;
        const daValue = initialData.da || 0;
        const taValue = initialData.ta || 0;
        const otherAllowancesValue = initialData.otherAllowances || 0;        console.log('StaffDialog initialData DETAILS:', {
          emergencyContact: initialData.emergencyContact,
          pfUAN: initialData.pfUAN,
          gratuity: initialData.gratuity,
          basicSalary: initialData.basicSalary,
          hra: initialData.hra,
          da: initialData.da,
          ta: initialData.ta
        });
        
        console.log('Normalized values:', {
          role: roleValue,
          phoneNumber: phoneNumberValue,
          bloodGroup: bloodGroupValue,
          qualifications: qualificationsValue,
          emergencyContact: emergencyContactValue,
          pfUAN: pfUANValue,
          gratuity: gratuityValue,
          basicSalary: basicSalaryValue,
          hra: hraValue,
          da: daValue,
          ta: taValue,
          otherAllowances: otherAllowancesValue
        });        // Log exactly what we're getting from backend
        console.log('DETAILED DEBUG - StaffDialog initialData field values:', {
          emergencyContact: initialData.emergencyContact,
          emergencyContactType: typeof initialData.emergencyContact,
          pfUAN: initialData.pfUAN,
          pfUANType: typeof initialData.pfUAN,
          gratuity: initialData.gratuity,
          gratuityType: typeof initialData.gratuity,
          basicSalary: initialData.basicSalary,
          basicSalaryType: typeof initialData.basicSalary
        });

        // Create new form data with the normalized values
        return {
          ...prev,
          ...initialData,
          role: roleValue,
          phoneNumber: phoneNumberValue,
          bloodGroup: bloodGroupValue,
          qualifications: qualificationsValue,
          emergencyContact: emergencyContactValue,
          pfUAN: pfUANValue,
          gratuity: gratuityValue,
          basicSalary: basicSalaryValue,
          hra: hraValue,
          da: daValue,
          ta: taValue,
          otherAllowances: otherAllowancesValue,
        };
      });
    }
  }, [initialData]);

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
    
    // Validate PF UAN (alphanumeric)
    if (formData.pfUAN && !/^[a-zA-Z0-9]+$/.test(formData.pfUAN)) {
      newErrors.pfUAN = 'PF UAN must be alphanumeric only';
    }
    
    // Validate Gratuity (alphanumeric)
    if (formData.gratuity && !/^[a-zA-Z0-9]+$/.test(formData.gratuity)) {
      newErrors.gratuity = 'Gratuity must be alphanumeric only';
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
      fullName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
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
      designations: [],
      // Add new fields
      pfUAN: formData.pfUAN || '',
      gratuity: formData.gratuity || '',
      serviceEndDate: formData.serviceEndDate || '',
      // Salary details
      basicSalary: formData.basicSalary || 0,
      hra: formData.hra || 0,
      da: formData.da || 0,
      ta: formData.ta || 0,
      otherAllowances: formData.otherAllowances || 0,
      pfContribution: formData.pfContribution || 0,
      taxDeduction: formData.taxDeduction || 0,
      netSalary: formData.netSalary || 0,
      salaryAccountNumber: formData.salaryAccountNumber || '',
      bankName: formData.bankName || '',
      ifscCode: formData.ifscCode || ''
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

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="PF UAN"
            value={formData.pfUAN}
            onChange={handleChange('pfUAN')}
            placeholder="Enter PF UAN"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Gratuity"
            value={formData.gratuity}
            onChange={handleChange('gratuity')}
            placeholder="Enter Gratuity"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Service End Date"
            type="date"
            value={formData.serviceEndDate}
            onChange={handleChange('serviceEndDate')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2 }}>Salary Details</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Basic Salary"
            type="number"
            value={formData.basicSalary}
            onChange={handleChange('basicSalary')}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="HRA"
            type="number"
            value={formData.hra}
            onChange={handleChange('hra')}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="DA"
            type="number"
            value={formData.da}
            onChange={handleChange('da')}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="TA"
            type="number"
            value={formData.ta}
            onChange={handleChange('ta')}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Other Allowances"
            type="number"
            value={formData.otherAllowances}
            onChange={handleChange('otherAllowances')}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="PF Contribution"
            type="number"
            value={formData.pfContribution}
            onChange={handleChange('pfContribution')}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tax Deduction"
            type="number"
            value={formData.taxDeduction}
            onChange={handleChange('taxDeduction')}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Net Salary"
            type="number"
            value={formData.netSalary}
            onChange={handleChange('netSalary')}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Salary Account Number"
            value={formData.salaryAccountNumber}
            onChange={handleChange('salaryAccountNumber')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Bank Name"
            value={formData.bankName}
            onChange={handleChange('bankName')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="IFSC Code"
            value={formData.ifscCode}
            onChange={handleChange('ifscCode')}
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
                <Select                  value={formData.teacherDetails?.isClassTeacher ? "yes" : "no"}
                  onChange={(e) => {
                    handleTeacherCheckboxChange('isClassTeacher')(
                      { target: { checked: String(e.target.value) === "yes" } } as React.ChangeEvent<HTMLInputElement>
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