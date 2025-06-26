// Helper functions for staff data processing
import { StaffMember } from '../services/staffService';

/**
 * Extract role name from a staff member regardless of the data structure
 */
export const getRoleNameFromStaff = (staff: StaffMember): string => {
  if (!staff) return 'Unknown';
  let roleName: string | undefined = undefined;
  
  console.log('Extracting role from staff:', staff);
  
  // Check if role is an object with name property (primary case from API)
  if (typeof staff.role === 'object' && staff.role) {
    console.log('Role is an object:', staff.role);
    if ((staff.role as any).name) {
      roleName = (staff.role as any).name;
    } else if ((staff.role as any).roleName) {
      roleName = (staff.role as any).roleName;
    }
  }
  // Check if role is a direct string (compatibility case)
  else if (typeof staff.role === 'string') {
    console.log('Role is a string:', staff.role);
    roleName = staff.role;
  }
  
  // If we didn't get a role name yet, check staffRole object (backup case)
  if (!roleName && (staff as any).staffRole) {
    console.log('Checking staffRole object:', (staff as any).staffRole);
    const staffRole = (staff as any).staffRole;
    if (typeof staffRole === 'object') {
      if (staffRole.name) {
        roleName = staffRole.name;
      } else if (staffRole.roleName) {
        roleName = staffRole.roleName;
      }
    } else if (typeof staffRole === 'string') {
      roleName = staffRole;
    }
  }
  
  // Enhanced fallback strategies for role name
  if (!roleName) {
    console.log('Using additional fallback strategies for role extraction');
    
    // Try direct property access for backward compatibility
    roleName = (staff as any).roleName || 
               (staff as any).stringRole || 
               (staff as any).roleType ||
               (staff as any).designation;
  }
  
  // Try to extract from nested objects if still not found
  if (!roleName && staff) {
    console.log('Trying deeper object inspection for role');
    const roleFields = ['role', 'staffRole', 'userRole', 'position', 'designation'];
    
    for (const field of roleFields) {
      const value = (staff as any)[field];
      if (value) {
        if (typeof value === 'string') {
          roleName = value;
          break;
        } else if (typeof value === 'object') {
          // Look for common name fields in the object
          const nameFields = ['name', 'roleName', 'type', 'value', 'title'];
          for (const nameField of nameFields) {
            if (value[nameField] && typeof value[nameField] === 'string') {
              roleName = value[nameField];
              break;
            }
          }
          if (roleName) break;
        }
      }
    }
  }
  
  // If all else fails, set a default based on other fields
  if (!roleName) {
    // Try to determine from department
    if (staff.department?.toLowerCase().includes('teach')) {
      roleName = 'TEACHER';
    } else if (staff.department?.toLowerCase().includes('admin')) {
      roleName = 'ADMIN';
    } else if (staff.department?.toLowerCase().includes('principal')) {
      roleName = 'PRINCIPAL';
    }
  }
  
  console.log('Final resolved role name:', roleName || 'Unknown');
  
  // If still no role name, default to "Unknown"
  return roleName || "Unknown";
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
