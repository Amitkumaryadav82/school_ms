// Helper functions for staff data processing
import { StaffMember } from '../services/staffService';

/**
 * Extract role name from a staff member regardless of the data structure
 */
export const getRoleNameFromStaff = (staff: StaffMember): string => {
  let roleName: string | undefined = undefined;
  
  // Check if role is an object with name property (primary case from API)
  if (typeof staff.role === 'object' && staff.role) {
    if ((staff.role as any).name) {
      roleName = (staff.role as any).name;
    } else if ((staff.role as any).roleName) {
      roleName = (staff.role as any).roleName;
    }
  }
  // Check if role is a direct string (compatibility case)
  else if (typeof staff.role === 'string') {
    roleName = staff.role;
  }
  
  // If we didn't get a role name yet, check staffRole object (backup case)
  if (!roleName && (staff as any).staffRole) {
    const staffRole = (staff as any).staffRole;
    if (staffRole.name) {
      roleName = staffRole.name;
    } else if (staffRole.roleName) {
      roleName = staffRole.roleName;
    }
  }
  
  // Last resort checks
  if (!roleName) {
    if ((staff as any).roleName) {
      roleName = (staff as any).roleName;
    }
  }
  
  if (!roleName) {
    console.warn('Unable to extract role name from staff member:', {
      staffId: staff.staffId,
      name: `${staff.firstName} ${staff.lastName}`,
      role: staff.role,
      staffRole: (staff as any).staffRole
    });
    return '';
  }
  
  return roleName;
};

/**
 * Format role for display (handles uppercase with underscores)
 */
export const formatRole = (role: string): string => {
  if (!role) return '';
  
  // First handle uppercase roles with underscores (like "ADMIN_OFFICER")
  if (role === role.toUpperCase() && role.includes('_')) {
    return role.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Handle already properly capitalized roles (like "Teacher")
  return role;
};

/**
 * Get avatar color based on role
 */
export const getAvatarColor = (role: any): string => {
  // Extract role name from any format
  let roleName: string;
  
  // Handle string role
  if (typeof role === 'string') {
    roleName = role;
  } 
  // Handle object role with name property
  else if (role && typeof role === 'object') {
    if (role.name) {
      roleName = role.name;
    } else if (role.roleName) {
      roleName = role.roleName;
    } else {
      return '#9e9e9e'; // Default gray color if no role info
    }
  } else {
    return '#9e9e9e'; // Default gray color if no role info
  }

  const roleUpper = roleName.toUpperCase();
  
  // Handle both formats: with underscores and without
  switch(roleUpper) {
    case 'TEACHER':
    case 'TEACHERS':
      return '#2196f3'; // blue
    case 'PRINCIPAL':
    case 'PRINCIPALS':
      return '#9c27b0'; // purple
    case 'ADMIN':
    case 'ADMINISTRATOR':
      return '#00bcd4'; // cyan
    case 'LIBRARIAN':
      return '#4caf50'; // green
    case 'ACCOUNT_OFFICER':
    case 'ACCOUNTANT':
      return '#f44336'; // red
    case 'MANAGEMENT':
    case 'MANAGER':
      return '#ff9800'; // orange
    default:
      return '#9e9e9e'; // gray
  }
};
