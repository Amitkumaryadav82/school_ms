import config from '../config/environment';
import { api } from './api';

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PROBATION = 'PROBATION',
  TERMINATED = 'TERMINATED',
  LEAVE_OF_ABSENCE = 'LEAVE_OF_ABSENCE',
  RETIRED = 'RETIRED',
  CONTRACT = 'CONTRACT',
  RESIGNED = 'RESIGNED',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED'
}

// List of allowed employment statuses for the UI
export const ALLOWED_EMPLOYMENT_STATUSES = [
  EmploymentStatus.ACTIVE,
  EmploymentStatus.TERMINATED,
  EmploymentStatus.RETIRED,
  EmploymentStatus.RESIGNED
];

export interface TeacherDetails {
  id?: number;
  department: string;
  specialization?: string;
  subjects: string;
  subjectsTaught?: string; // Add this field to handle multiple data patterns
  teachingExperience: number;
  isClassTeacher: boolean;
  classAssignedId?: number;
  className?: string;
}

export interface StaffRole {
  id?: number;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// More flexible role interface to match API response
export interface ApiStaffRole extends StaffRole {
  roleName?: string;
  [key: string]: any; // Allow additional properties
}

export interface StaffMember {
  [key: string]: any; // Add index signature for dynamic property access
  id?: number;
  staffId?: string;
  firstName: string;
  lastName: string;
  middleName?: string; 
  fullName?: string;
  email: string;
  phoneNumber?: string;
  phone?: string; // Some endpoints use phone, others use phoneNumber
  // Based on the API response, role can be either:
  // 1. A string (direct value from database)
  // 2. A StaffRole object with name, description, etc.
  role: string | StaffRole | ApiStaffRole | any;
  // For backward compatibility with the API that returns staffRole instead of role
  staffRole?: StaffRole | ApiStaffRole;
  roleId?: number;
  joinDate?: string;
  joiningDate?: string; // Backend uses joiningDate, frontend uses joinDate
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  department?: string;
  designation?: string;
  designations?: any[];
  qualifications?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  isActive?: boolean;
  employmentStatus?: EmploymentStatus;
  profileImage?: string;
  // Teacher-specific fields
  teacherDetails?: TeacherDetails;
  // PF and Service fields
  pfUAN?: string;          // PF UAN (alphanumeric)
  gratuity?: string;       // Gratuity (alphanumeric)
  serviceEndDate?: string; // Service End Date (optional)
  // Salary fields
  basicSalary?: number;
  hra?: number;
  da?: number;
  ta?: number;
  otherAllowances?: number;
  pfContribution?: number;
  taxDeduction?: number;
  netSalary?: number;
  salaryAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
}

// Map of role names to IDs for consistent handling
const ROLE_ID_MAP: Record<string, number> = {
  'Teacher': 1,
  'Principal': 2,
  'Admin Officer': 3,
  'Librarian': 4,
  'Management': 5,
  'Account Officer': 6
};

// Function to prepare staff data for API calls
const prepareStaffData = (staffMember: StaffMember): StaffMember => {
  const formattedStaff: StaffMember = { ...staffMember };

  // Get the role as a string regardless of source format
  let roleString = '';
  if (typeof formattedStaff.role === 'string') {
    roleString = formattedStaff.role;
  } else if (formattedStaff.role && typeof formattedStaff.role === 'object' && 'name' in formattedStaff.role) {
    roleString = formattedStaff.role.name || '';
  } else if (formattedStaff.staffRole && typeof formattedStaff.staffRole === 'object' && 'name' in formattedStaff.staffRole) {
    // If role is not set but staffRole is available, use that
    roleString = formattedStaff.staffRole.name || '';
  }

  // Convert role name to standard format (UPPERCASE with underscores)
  if (roleString) {
    // Handle role names like "Admin Officer" -> "ADMIN_OFFICER"
    if (!roleString.includes('_') && roleString !== roleString.toUpperCase()) {
      roleString = roleString.toUpperCase().replace(/ /g, '_');
    }
    
    // Set the role as string
    formattedStaff.role = roleString;
    
    // Map to role ID if needed by backend
    if (ROLE_ID_MAP[roleString]) {
      formattedStaff.roleId = ROLE_ID_MAP[roleString];
    }
  }
  
  // Ensure backend date format (YYYY-MM-DD)
  if (formattedStaff.joinDate && !formattedStaff.joiningDate) {
    formattedStaff.joiningDate = formattedStaff.joinDate;
  }
  
  // Ensure phone fields consistency
  if (formattedStaff.phoneNumber && !formattedStaff.phone) {
    formattedStaff.phone = formattedStaff.phoneNumber;
  } else if (formattedStaff.phone && !formattedStaff.phoneNumber) {
    formattedStaff.phoneNumber = formattedStaff.phone;
  }
  
  // Set up teacherDetails if this is a teacher but details aren't set
  const isTeacher = roleString.includes('TEACHER') || roleString === 'Teacher';
  if (isTeacher && 
      !formattedStaff.teacherDetails && 
      (formattedStaff.department || (formattedStaff as any).subjects)) {
    
    formattedStaff.teacherDetails = {
      department: formattedStaff.department || '',
      subjects: (formattedStaff as any).subjects || '',
      teachingExperience: (formattedStaff as any).teachingExperience || 0,
      isClassTeacher: false
    };
  }
    // Format date fields to ensure YYYY-MM-DD format
  // Type-safe approach to handle dynamic fields
  const formatDateField = (field: keyof StaffMember) => {
    const value = formattedStaff[field];
    if (typeof value === 'string') {
      // Check if it's already in the correct format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            formattedStaff[field] = date.toISOString().split('T')[0] as any; // YYYY-MM-DD
          }
        } catch (e) {
          console.warn(`Failed to format date for ${field}`, e);
        }
      }
    }
  };
  
  // Apply date formatting to specific fields
  formatDateField('dateOfBirth');
  formatDateField('joinDate');
  formatDateField('joiningDate');
  formatDateField('serviceEndDate');
  
  // Convert string numeric values to actual numbers
  const formatNumericField = (field: keyof StaffMember) => {
    const value = formattedStaff[field];
    if (value !== undefined && value !== null && typeof value === 'string') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        formattedStaff[field] = numValue as any;
      }
    }
  };
  
  // Apply numeric formatting to specific fields
  formatNumericField('basicSalary');
  formatNumericField('hra');
  formatNumericField('da');
  formatNumericField('ta');
  formatNumericField('otherAllowances');
  formatNumericField('pfContribution');
  formatNumericField('taxDeduction');
  formatNumericField('netSalary');
  
  // Convert string boolean values to actual booleans
  if (formattedStaff.isActive !== undefined && typeof formattedStaff.isActive === 'string') {
    formattedStaff.isActive = (formattedStaff.isActive as string).toLowerCase() === 'true';
  }
  
  // Ensure numeric fields are properly formatted
  if (formattedStaff.basicSalary && typeof formattedStaff.basicSalary === 'string') {
    formattedStaff.basicSalary = Number(formattedStaff.basicSalary);
  }
  
  if (formattedStaff.hra && typeof formattedStaff.hra === 'string') {
    formattedStaff.hra = Number(formattedStaff.hra);
  }
  
  if (formattedStaff.da && typeof formattedStaff.da === 'string') {
    formattedStaff.da = Number(formattedStaff.da);
  }

  return formattedStaff;
};

// Try multiple possible bulk upload formats in sequence
const tryBulkUploadFormats = (url: string, formattedStaffMembers: StaffMember[], headers: Record<string, string>) => {  // Format 1: Send with staff property (as expected by the backend's BulkStaffRequest)
  const tryStaffWrapper = () => {
    const data = { 
      staff: formattedStaffMembers,
      expectedCount: formattedStaffMembers.length
    };
    console.log('Trying Format 1: Wrapped in staff property with expectedCount', data);
    
    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Bulk upload successful with Format 1', data);
      return data;
    });
  };
  
  // Format 2: Send the array directly
  const tryDirectArray = () => {
    console.log('Trying Format 2: Direct array of staff members');
    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(formattedStaffMembers)
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Bulk upload successful with Format 2', data);
      return data;
    });
  };
  
  // Try the formats in sequence, moving to next on error
  return tryStaffWrapper()
    .catch(error => {
      console.log('Format 1 failed:', error.message);
      return tryDirectArray()
        .catch(error => {
          console.log('Format 2 failed:', error.message);
          // All attempts failed, throw comprehensive error
          throw {
            message: 'Failed to import staff data after trying multiple formats',
            details: 'The server may not be correctly configured to accept bulk staff data',
            originalError: error
          };
        });
    });
};

export const staffService = {
  // Get all staff members
  getAll: async () => {
    try {
      console.log('Fetching staff from API...');
      
      try {
        const response = await api.get<StaffMember | StaffMember[]>('staff');
        
        console.log('Raw API response:', response);
        
        // Ensure we always return an array
        if (!response) {
          console.warn('Staff API returned null/undefined response');
          throw new Error('Empty staff response');
        }
        
        if (Array.isArray(response)) {
          console.log(`Staff API returned an array with ${response.length} items`);
          
          // Add validation to ensure data has required fields
          const validStaff = response.map((staff, index) => {
            // Ensure required fields have at least default values
            const validatedStaff: StaffMember = {
              ...staff,
              firstName: staff.firstName || 'Unknown',
              lastName: staff.lastName || 'Staff',
              email: staff.email || `staff${index + 1}@example.com`,
              // Ensure role is properly set
              role: staff.role || 'Unknown'
            };
            return validatedStaff;
          });
          
          if (validStaff.length > 0) {
            return validStaff;
          } else {
            console.warn('No staff members returned from API, trying alternative approach');
            throw new Error('No staff members found');
          }
        } else {
          console.log('Staff API returned a single object instead of an array, converting to array');
          
          // Validate the single staff object
          const staff = response as StaffMember;
          const validatedStaff: StaffMember = {
            ...staff,
            firstName: staff.firstName || 'Unknown',
            lastName: staff.lastName || 'Staff',
            email: staff.email || 'staff@example.com',
            role: staff.role || 'Unknown'
          };
          
          return [validatedStaff];
        }
      } catch (initialError) {
        console.warn('Error with direct staff API call, trying alternative approach', initialError);
        
        // If the direct approach fails, combine teachers and non-teaching staff
        const [teachers, nonTeachingStaff] = await Promise.all([
          staffService.getActiveTeachers(),
          staffService.getNonTeachingStaff()
        ]);
        
        const allStaff = [...teachers, ...nonTeachingStaff];
        console.log(`Retrieved ${teachers.length} teachers and ${nonTeachingStaff.length} non-teaching staff (${allStaff.length} total)`);
        
        if (allStaff.length === 0) {
          console.error('Failed to retrieve any staff members through alternative methods');
          throw new Error('No staff members found through any method');
        }
        
        return allStaff;
      }
    } catch (error) {
      console.error('Error fetching staff list:', error);
      throw error;
    }
  },
  
  // Get a specific staff member by ID
  getById: (id: number) => api.get<StaffMember>(`staff/${id}`),
  
  // Create a new staff member
  create: (staffMember: StaffMember) => {
    const formattedData = prepareStaffData(staffMember);
    return api.post<StaffMember>('staff', formattedData);
  },
  
  // Bulk upload staff members (CSV/XLS)
  createBulk: (staffMembers: StaffMember[]) => {
    // Format the data for the API
    const formattedStaffMembers = staffMembers.map(staff => {
      const formatted = prepareStaffData(staff);
      
      // Handle date formats consistently
      if (formatted.joinDate) {
        formatted.joiningDate = formatted.joinDate;
        // Keep both for compatibility
        formatted.joinDate = formatted.joinDate;
      }
      
      // Ensure both phone and phoneNumber are set (backend has both fields)
      if (formatted.phoneNumber && !formatted.phone) {
        formatted.phone = formatted.phoneNumber;
      }
      
      return formatted;
    });
    
    console.log('Sending bulk staff data to server:', JSON.stringify(formattedStaffMembers, null, 2));
      // Use the /api/staff/bulk-upload endpoint
    const baseUrl = config.apiUrl.endsWith('/') ? config.apiUrl.slice(0, -1) : config.apiUrl;
    const url = `${baseUrl}/api/staff/bulk-upload`;
    
    console.log('Using URL:', url);
    
    // Get the authentication token
    const token = localStorage.getItem('token');
    
    // Set up headers with both Content-Type and Authorization
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add authentication token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Using authentication token');
    } else {
      console.warn('No authentication token found in localStorage');
    }
    
    // Try the bulk upload with the new formats
    return tryBulkUploadFormats(url, formattedStaffMembers, headers);
  },
  
  // Alias for createBulk to maintain compatibility with existing code
  bulkCreate: function(staffMembers: StaffMember[]) {
    return this.createBulk(staffMembers);
  },
  
  // Update an existing staff member
  update: (id: number, staffMember: StaffMember) => {
    const formattedData = prepareStaffData(staffMember);
    return api.put<StaffMember>(`staff/${id}`, formattedData);
  },
  
  // Toggle staff active status
  toggleStatus: (id: number, isActive: boolean) => {
    // Only send the isActive field to update just the status
    return api.patch<StaffMember>(`staff/${id}/status`, { isActive });
  },
  
  // Update staff employment status
  updateEmploymentStatus: (id: number, status: EmploymentStatus) => {
    console.log(`[staffService] Updating employment status for staff ID ${id} to ${status}`);
    
    // Get the authentication token to log during the request
    const token = localStorage.getItem('token');
    const tokenStatus = token ? 
      `Token present (${token.substring(0, 15)}...)` : 
      'Token missing';
    
    // Extract user roles from token for debugging
    let userRoles = [];
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        userRoles = decodedToken.roles || decodedToken.authorities || [];
        console.log(`[staffService] User roles from token:`, userRoles);
        console.log(`[staffService] Token expires:`, new Date(decodedToken.exp * 1000).toLocaleString());
      } catch (e) {
        console.error(`[staffService] Error decoding token:`, e);
      }
    }
    
    console.log(`[staffService] Request details:`, {
      endpoint: `staff/${id}/employment-status`,
      method: 'PATCH',
      payload: { employmentStatus: status },
      authStatus: tokenStatus,
      userRoles,
      timestamp: new Date().toISOString()
    });
    
    // Make the API request and add detailed response logging
    return api.patch<StaffMember>(`staff/${id}/employment-status`, { employmentStatus: status })
      .then(response => {
        console.log(`[staffService] Status update successful:`, {
          statusCode: 200,
          responseData: response,
          timestamp: new Date().toISOString()
        });
        return response;
      })
      .catch(error => {
        console.error(`[staffService] Status update failed:`, {
          statusCode: error.response?.status || 'No status',
          errorMessage: error.response?.data?.message || error.message,
          requestDetails: {
            url: `staff/${id}/employment-status`,
            method: 'PATCH',
            payload: { employmentStatus: status },
            authStatus: tokenStatus,
            userRoles
          },
          timestamp: new Date().toISOString()
        });
        throw error;
      });
  },
    // Delete a staff member
  delete: (id: number) => api.delete(`staff/${id}`),
  
  // Get active teachers (for attendance module)
  getActiveTeachers: async () => {
    try {      const response = await api.get('staff', {
        params: {
          employmentStatus: 'ACTIVE',
          roleFilter: 'Teacher'
        }
      });
      // Apply type assertion to safely access response data
      const typedResponse = response as any;
      return typedResponse.data || [];
    } catch (error) {
      console.error('Error fetching active teachers:', error);
      return [];
    }
  },
  
  // Get non-teaching staff (for attendance module)
  getNonTeachingStaff: async () => {
    try {
      const response = await api.get('staff', {
        params: {
          employmentStatus: 'ACTIVE',
          roleFilter: 'NonTeaching'
        }
      });
      // Apply type assertion to safely access response data
      const typedResponse = response as any;
      return typedResponse.data || [];
    } catch (error) {
      console.error('Error fetching non-teaching staff:', error);
      return [];
    }
  }
};

export default staffService;