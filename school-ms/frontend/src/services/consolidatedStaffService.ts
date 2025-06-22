import { api } from './api';
import { EmploymentStatus, StaffMember } from './staffService'; // Reuse existing types

/**
 * Consolidated Staff Service that works with the new consolidated backend endpoints.
 * This service is meant to eventually replace the existing staff service.
 */
export const consolidatedStaffService = {
  // Get all staff members
  getAll: () => api.get<StaffMember[]>('staff'),
  
  // Get paginated staff
  getPaginated: (page = 0, size = 10, sortBy = 'lastName', sortDir = 'asc') => 
    api.get<{content: StaffMember[], totalElements: number, totalPages: number}>('staff/paginated', {
      params: { page, size, sortBy, sortDir }
    }),
  
  // Get a specific staff member by ID
  getById: (id: number) => api.get<StaffMember>(`staff/${id}`),
  
  // Get staff by staff ID (employee ID)
  getByStaffId: (staffId: string) => api.get<StaffMember>(`staff/staff-id/${staffId}`),
  
  // Get staff by email
  getByEmail: (email: string) => api.get<StaffMember>(`staff/email/${email}`),
  
  // Get staff by role
  getByRole: (roleName: string) => api.get<StaffMember[]>(`staff/role/${roleName}`),
  
  // Get active staff
  getActiveStaff: () => api.get<StaffMember[]>('staff/active'),
  
  // Get all teachers
  getAllTeachers: () => api.get<StaffMember[]>('staff/teachers'),
  
  // Search staff by name
  searchByName: (query: string) => api.get<StaffMember[]>('staff/search', {
    params: { query }
  }),
  
  // Create a new staff member
  create: (staffMember: StaffMember) => {
    // Ensure proper data formatting
    const formattedStaff = {
      ...staffMember,
      // Convert date strings to ISO format if needed
      joinDate: staffMember.joinDate ? new Date(staffMember.joinDate).toISOString().split('T')[0] : undefined,
      dateOfBirth: staffMember.dateOfBirth ? new Date(staffMember.dateOfBirth).toISOString().split('T')[0] : undefined
    };
    
    return api.post<StaffMember>('staff', formattedStaff);
  },
  
  // Update an existing staff member
  update: (id: number, staffMember: StaffMember) => {
    // Ensure proper data formatting
    const formattedStaff = {
      ...staffMember,
      // Convert date strings to ISO format if needed
      joinDate: staffMember.joinDate ? new Date(staffMember.joinDate).toISOString().split('T')[0] : undefined,
      dateOfBirth: staffMember.dateOfBirth ? new Date(staffMember.dateOfBirth).toISOString().split('T')[0] : undefined
    };
    
    return api.put<StaffMember>(`staff/${id}`, formattedStaff);
  },
    // Update staff employment status
  updateEmploymentStatus: (id: number, status: EmploymentStatus) => 
    api.put<StaffMember>(`staff/${id}/status?status=${status}`),
  
  // Activate a staff member
  activateStaff: (id: number) => api.put<StaffMember>(`staff/${id}/activate`),
  
  // Deactivate a staff member
  deactivateStaff: (id: number) => api.put<StaffMember>(`staff/${id}/deactivate`),
  
  // Delete a staff member
  delete: (id: number) => api.delete(`staff/${id}`),
  
  // Bulk create staff members
  bulkCreate: (staffMembers: StaffMember[]) => {
    // Format dates in the staff data
    const formattedStaff = staffMembers.map(staff => ({
      ...staff,
      joinDate: staff.joinDate ? new Date(staff.joinDate).toISOString().split('T')[0] : undefined,
      dateOfBirth: staff.dateOfBirth ? new Date(staff.dateOfBirth).toISOString().split('T')[0] : undefined
    }));
    
    return api.post<StaffMember[]>('staff/bulk-upload', formattedStaff);
  },
  
  // Get staff statistics
  getStats: () => api.get<{
    totalStaff: number,
    activeStaff: number,
    inactiveStaff: number,
    roleDistribution: Record<string, number>,
    statusDistribution: Record<string, number>
  }>('staff/stats')
};

export default consolidatedStaffService;
