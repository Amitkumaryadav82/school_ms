import api from './api';

export interface StaffMember {
  id?: number;
  staffId: string;
  firstName: string;
  lastName;
  fullName?: string;
  email: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  joinDate: string;
  role: string;
  roleId?: number;
  isActive?: boolean;
  qualifications?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  profileImage?: string;
  teacherDetails?: TeacherDetails;
  designations?: StaffDesignation[];
}

export interface TeacherDetails {
  id?: number;
  department?: string;
  specialization?: string;
  subjects?: string;
  teachingExperience?: number;
  isClassTeacher?: boolean;
  classAssignedId?: number;
  className?: string;
}

export interface StaffDesignation {
  id?: number;
  name: string;
  description?: string;
  assignedDate?: string;
  isActive?: boolean;
}

// Role to ID mapping - using the correct case that matches the backend database
export const ROLE_ID_MAP = {
  'Teacher': 1,
  'Principal': 2,
  'Admin Officer': 3,
  'Management': 4,
  'Account Officer': 5,
  'Librarian': 6
};

// Helper function to format staff data for API submission
const prepareStaffData = (staffMember: StaffMember): any => {
  // Create a copy to avoid modifying the original
  const formattedStaff = { ...staffMember };
  
  // Set fullName from firstName and lastName
  formattedStaff.fullName = `${staffMember.firstName} ${staffMember.lastName}`;
  
  // Ensure dates are in proper format (YYYY-MM-DD)
  if (formattedStaff.dateOfBirth) {
    const date = new Date(formattedStaff.dateOfBirth);
    if (!isNaN(date.getTime())) {
      formattedStaff.dateOfBirth = date.toISOString().split('T')[0];
    }
  }
  
  if (formattedStaff.joinDate) {
    const date = new Date(formattedStaff.joinDate);
    if (!isNaN(date.getTime())) {
      formattedStaff.joinDate = date.toISOString().split('T')[0];
    }
  }
  
  // If designations is undefined, set to empty array to match API expectation
  if (!formattedStaff.designations) {
    formattedStaff.designations = [];
  }
  
  // IMPORTANT: Ensure role and roleId are always properly set and consistent
  if (!formattedStaff.role || formattedStaff.role.trim() === '') {
    // If role is missing or empty, default to Teacher
    formattedStaff.role = 'Teacher';
    formattedStaff.roleId = ROLE_ID_MAP['Teacher'];
  } else if (ROLE_ID_MAP[formattedStaff.role]) {
    // If role is valid, ensure roleId matches
    formattedStaff.roleId = ROLE_ID_MAP[formattedStaff.role];
  } else {
    // If role string doesn't match known roles, default to Teacher
    console.warn(`Unknown role "${formattedStaff.role}" - defaulting to Teacher`);
    formattedStaff.role = 'Teacher';
    formattedStaff.roleId = ROLE_ID_MAP['Teacher'];
  }
  
  // Log the data being sent to the API for debugging
  console.log('Staff data being sent to API:', JSON.stringify(formattedStaff, null, 2));
  
  return formattedStaff;
};

export const staffService = {
  // Get all staff members
  getAll: () => api.get<StaffMember[]>('staff'),
  
  // Get staff member by ID
  getById: (id: number) => api.get<StaffMember>(`staff/${id}`),
  
  // Get staff member by staff ID
  getByStaffId: (staffId: string) => api.get<StaffMember>(`staff/staff-id/${staffId}`),
  
  // Get staff by email
  getByEmail: (email: string) => api.get<StaffMember>(`staff/email/${email}`),
  
  // Get staff by role
  getByRole: (roleName: string) => api.get<StaffMember[]>(`staff/role/${roleName}`),
  
  // Get active staff
  getActiveStaff: () => api.get<StaffMember[]>('staff/active'),
  
  // Get all teachers
  getAllTeachers: () => api.get<StaffMember[]>('staff/teachers'),
  
  // Get all principals
  getAllPrincipals: () => api.get<StaffMember[]>('staff/principals'),
  
  // Get all admin officers
  getAllAdminOfficers: () => api.get<StaffMember[]>('staff/admin-officers'),
  
  // Get all management staff
  getAllManagementStaff: () => api.get<StaffMember[]>('staff/management'),
  
  // Get all account officers
  getAllAccountOfficers: () => api.get<StaffMember[]>('staff/account-officers'),
  
  // Get all librarians
  getAllLibrarians: () => api.get<StaffMember[]>('staff/librarians'),
  
  // Create a new staff member
  create: (staffMember: StaffMember) => {
    const formattedData = prepareStaffData(staffMember);
    return api.post<StaffMember>('staff', formattedData);
  },
  
  // Bulk create/update multiple staff members
  bulkCreate: (staffMembers: StaffMember[]) => {
    // Format each staff member before sending
    const formattedStaffMembers = staffMembers.map(staff => prepareStaffData(staff));
    return api.post<{ created: number, updated: number, errors: any[] }>('staff/bulk', formattedStaffMembers);
  },
  
  // Update an existing staff member
  update: (id: number, staffMember: StaffMember) => {
    const formattedData = prepareStaffData(staffMember);
    return api.put<StaffMember>(`staff/${id}`, formattedData);
  },
  
  // Delete a staff member
  delete: (id: number) => api.delete(`staff/${id}`)
};