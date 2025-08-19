import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { StaffMember, TeacherDetails } from '../../services/staffService';
import BaseDialog from './BaseDialog';
import api from '../../services/api';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

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

// Helper to build a fresh empty form for "Add" mode
const buildEmptyForm = (): Partial<StaffMember> => ({
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
  emergencyContact: '',
  profileImage: '',
  // Payroll fields
  pfUAN: '',
  gratuity: '',
  serviceEndDate: '',
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
    // no id in add mode
    department: '',
    specialization: '',
    subjects: '',
    teachingExperience: 0,
    isClassTeacher: false,
    classAssignedId: 0,
    className: ''
  }
});

const StaffDialog: React.FC<StaffDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState<Partial<StaffMember>>(initialData || buildEmptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Normalized subject mapping state
  const [allSubjects, setAllSubjects] = useState<{ id: number; name: string; code?: string }[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [pendingSubjectIds, setPendingSubjectIds] = useState<number[]>([]);
  const [subjectsSaving, setSubjectsSaving] = useState(false);

  // Class-section mapping state
  const [allClasses, setAllClasses] = useState<{ id: number; name: string }[]>([]);
  const [sectionsByClass, setSectionsByClass] = useState<Record<number, string[]>>({});
  const [classMappings, setClassMappings] = useState<{ classId: number; className: string; section: string; academicYear?: string }[]>([]);
  const [newClassId, setNewClassId] = useState<number | ''>('');
  const [newSection, setNewSection] = useState<string>('');
  const [classesSaving, setClassesSaving] = useState(false);
  
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

  // Load static lists once
  useEffect(() => {
    const loadStatics = async () => {
      try {
        const subs = await api.get<{ id: number; name: string; code?: string }[]>('/api/exam/subjects');
        setAllSubjects(subs);
      } catch (e) {
        console.error('Failed to load subjects list', e);
      }
      try {
        const classes = await api.get<{ id: number; name: string }[]>('/api/classes');
        setAllClasses(classes);
      } catch (e) {
        console.error('Failed to load classes list', e);
      }
    };
    loadStatics();
  }, []);

  // Reset to clean slate whenever the dialog opens in Add mode
  useEffect(() => {
    if (open && !initialData) {
      setFormData(buildEmptyForm());
      setErrors({});
      // Clear mapping state to avoid leaking from previous edit session
      setSelectedSubjectIds([]);
      setClassMappings([]);
      setNewClassId('');
      setNewSection('');
    }
  }, [open, initialData]);

  // When a class is chosen in the builder, ensure its sections are loaded
  const ensureSectionsLoaded = async (classId: number) => {
    if (!classId || sectionsByClass[classId]) return;
    try {
      const secs = await api.get<string[]>(`/api/classes/${classId}/sections`);
      setSectionsByClass((prev) => ({ ...prev, [classId]: secs }));
    } catch (e) {
      console.error('Failed to load sections for class', classId, e);
    }
  };

  // Load existing mappings when teacherDetails is present
  useEffect(() => {
    const tdId = formData.teacherDetails?.id;
    if (!tdId) {
      setSelectedSubjectIds([]);
      setClassMappings([]);
      return;
    }
    (async () => {
      try {
        const mapped = await api.get<{ id: number; name: string }[]>(`/api/staff/teachers/${tdId}/subjects`);
        setSelectedSubjectIds(mapped.map(m => m.id));
      } catch (e) {
        console.warn('No existing subject mapping or failed to load');
        setSelectedSubjectIds([]);
      }
      try {
        const mappedClasses = await api.get<{ classId: number; className: string; section: string; academicYear?: string }[]>(`/api/staff/teachers/${tdId}/classes`);
        setClassMappings(mappedClasses);
        // Preload sections for those classes
        for (const m of mappedClasses) {
          await ensureSectionsLoaded(m.classId);
        }
      } catch (e) {
        console.warn('No existing class mapping or failed to load');
        setClassMappings([]);
      }
    })();
  }, [formData.teacherDetails?.id]);

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
      // For normalized subjects, ensure at least one is selected if teacherDetails exists
      if ((formData.teacherDetails?.id && selectedSubjectIds.length === 0)) {
        newErrors['teacherDetails.subjects'] = 'Select at least one subject';
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
    } as any;
    
    // Add teacher details if role is TEACHER
    if ((dataToSubmit.role || 'TEACHER') === 'TEACHER') {
      dataToSubmit.teacherDetails = {
        id: formData.teacherDetails?.id || 0,
        department: formData.teacherDetails?.department || '',
        specialization: formData.teacherDetails?.specialization || '',
        subjects: formData.teacherDetails?.subjects || '',
        teachingExperience: formData.teacherDetails?.teachingExperience || 0,
        isClassTeacher: formData.teacherDetails?.isClassTeacher || false,
        classAssignedId: formData.teacherDetails?.classAssignedId || 0,
        className: formData.teacherDetails?.className || ''
      } as any;

      // Include pending mappings so parent can persist after creation
      (dataToSubmit as any).__subjectIds = selectedSubjectIds;
      (dataToSubmit as any).__classMappings = classMappings.map(m => ({ classId: m.classId, section: m.section, academicYear: m.academicYear || '2025-2026' }));
    }

    onSubmit(dataToSubmit);
  };

  const isTeacher = formData.role === 'TEACHER';

  const addClassMapping = async () => {
    if (!newClassId || !newSection) return;
    const clazz = allClasses.find(c => c.id === newClassId);
    if (!clazz) return;
    if (classMappings.some(m => m.classId === newClassId && m.section === newSection)) return;
    setClassMappings(prev => [...prev, { classId: newClassId, className: clazz.name, section: newSection, academicYear: '2025-2026' }]);
    setNewSection('');
  };

  const removeClassMapping = (idx: number) => {
    setClassMappings(prev => prev.filter((_, i) => i !== idx));
  };

  const saveSubjectMapping = async () => {
    const tdId = formData.teacherDetails?.id;
    if (!tdId) return;
    try {
      setSubjectsSaving(true);
      await api.put<void>(`/api/staff/teachers/${tdId}/subjects`, selectedSubjectIds);
    } catch (e) {
      console.error('Failed to save subjects mapping', e);
    } finally {
      setSubjectsSaving(false);
    }
  };

  const addPendingSubjects = () => {
    if (!pendingSubjectIds?.length) return;
    setSelectedSubjectIds(prev => Array.from(new Set([...(prev || []), ...pendingSubjectIds])));
    setPendingSubjectIds([]);
  };

  const removeSubject = (id: number) => {
    setSelectedSubjectIds(prev => (prev || []).filter(sid => sid !== id));
  };

  const saveClassMappings = async () => {
    const tdId = formData.teacherDetails?.id;
    if (!tdId) return;
    try {
      setClassesSaving(true);
      const payload = classMappings.map(m => ({ classId: m.classId, section: m.section, academicYear: m.academicYear }));
      await api.put<void>(`/api/staff/teachers/${tdId}/classes`, payload);
    } catch (e) {
      console.error('Failed to save class mappings', e);
    } finally {
      setClassesSaving(false);
    }
  };

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
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Teaching Subjects</Typography>
              <Alert severity="info" sx={{ mb: 1 }}>
                Select one or more subjects and click Add. Your selection will be saved when you create or update this staff member.
              </Alert>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <FormControl fullWidth error={!!errors['teacherDetails.subjects']}>
                  <InputLabel>Subjects</InputLabel>
                  <Select
                    multiple
                    value={pendingSubjectIds}
                    onChange={(e) => setPendingSubjectIds(e.target.value as number[])}
                    label="Subjects"
                    renderValue={(selected) => (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {(selected as number[]).map(id => {
                          const subj = allSubjects.find(s => s.id === id);
                          return <Chip key={id} label={subj ? (subj.code ? `${subj.code} - ${subj.name}` : subj.name) : id} />
                        })}
                      </Stack>
                    )}
                  >
                    {allSubjects.map(s => (
                      <MenuItem key={s.id} value={s.id}>{s.code ? `${s.code} - ${s.name}` : s.name}</MenuItem>
                    ))}
                  </Select>
                  {errors['teacherDetails.subjects'] && (
                    <FormHelperText>{errors['teacherDetails.subjects']}</FormHelperText>
                  )}
                </FormControl>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={addPendingSubjects} disabled={!pendingSubjectIds.length}>Add</Button>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                {selectedSubjectIds.map(id => {
                  const subj = allSubjects.find(s => s.id === id);
                  const label = subj ? (subj.code ? `${subj.code} - ${subj.name}` : subj.name) : String(id);
                  return (
                    <Chip
                      key={id}
                      label={label}
                      onDelete={() => removeSubject(id)}
                      deleteIcon={<DeleteIcon />}
                    />
                  );
                })}
              </Stack>
              <Box sx={{ mt: 1 }}>
                <Button variant="contained" size="small" onClick={saveSubjectMapping} disabled={!formData.teacherDetails?.id || subjectsSaving}>Save Subjects</Button>
              </Box>
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

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Class Assignments</Typography>
              {!formData.teacherDetails?.id && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  You can add class assignments now; they will be saved when you create this staff member.
                </Alert>
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={newClassId}
                    label="Class"
                    onChange={async (e) => {
                      const val = Number(e.target.value);
                      setNewClassId(val);
                      setNewSection('');
                      await ensureSectionsLoaded(val);
                    }}
                  >
                    {allClasses.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 160 }} disabled={!newClassId}>
                  <InputLabel>Section</InputLabel>
                  <Select value={newSection} label="Section" onChange={(e) => setNewSection(String(e.target.value))}>
                    {(newClassId && sectionsByClass[newClassId] ? sectionsByClass[newClassId] : []).map(sec => (
                      <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" startIcon={<AddIcon />} disabled={!newClassId || !newSection} onClick={addClassMapping}>Add</Button>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                {classMappings.map((m, idx) => (
                  <Chip
                    key={`${m.classId}-${m.section}`}
                    label={`${m.className} - ${m.section}`}
                    onDelete={() => removeClassMapping(idx)}
                    deleteIcon={<DeleteIcon />}
                  />
                ))}
              </Stack>
            </Grid>
          </>
        )}
      </Grid>
    </BaseDialog>
  );
};

export default StaffDialog;