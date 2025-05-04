import api from './api';

export interface StaffMember {
  id?: number;
  staffId: string;
  firstName: string;
  lastName: string;
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

export const staffService = {
  // Get all staff members
  getAll: () => api.get<StaffMember[]>('/staff'),
  
  // Get staff member by ID
  getById: (id: number) => api.get<StaffMember>(`/staff/${id}`),
  
  // Get staff member by staff ID
  getByStaffId: (staffId: string) => api.get<StaffMember>(`/staff/staff-id/${staffId}`),
  
  // Get staff by email
  getByEmail: (email: string) => api.get<StaffMember>(`/staff/email/${email}`),
  
  // Get staff by role
  getByRole: (roleName: string) => api.get<StaffMember[]>(`/staff/role/${roleName}`),
  
  // Get active staff
  getActiveStaff: () => api.get<StaffMember[]>('/staff/active'),
  
  // Get all teachers
  getAllTeachers: () => api.get<StaffMember[]>('/staff/teachers'),
  
  // Get all principals
  getAllPrincipals: () => api.get<StaffMember[]>('/staff/principals'),
  
  // Get all admin officers
  getAllAdminOfficers: () => api.get<StaffMember[]>('/staff/admin-officers'),
  
  // Get all management staff
  getAllManagementStaff: () => api.get<StaffMember[]>('/staff/management'),
  
  // Get all account officers
  getAllAccountOfficers: () => api.get<StaffMember[]>('/staff/account-officers'),
  
  // Get all librarians
  getAllLibrarians: () => api.get<StaffMember[]>('/staff/librarians'),
  
  // Create a new staff member
  create: (staffMember: StaffMember) => api.post<StaffMember>('/staff', staffMember),
  
  // Update an existing staff member
  update: (id: number, staffMember: StaffMember) => api.put<StaffMember>(`/staff/${id}`, staffMember),
  
  // Delete a staff member
  delete: (id: number) => api.delete(`/staff/${id}`)
};