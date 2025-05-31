import { api } from './api';
import config from '../config/environment';

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  RETIRED = 'RETIRED',
  RESIGNED = 'RESIGNED'
}

export interface TeacherDetails {
  id?: number;
  department: string;
  specialization?: string;
  subjects: string;
  teachingExperience: number;
  isClassTeacher: boolean;
  classAssignedId?: number;
  className?: string;
}

export interface StaffMember {
  id?: number;
  staffId?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  phone?: string; // Some endpoints use phone, others use phoneNumber
  role: string;
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

  // Convert role name to ID if needed by backend
  if (formattedStaff.role && ROLE_ID_MAP[formattedStaff.role]) {
    formattedStaff.roleId = ROLE_ID_MAP[formattedStaff.role];
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

  return formattedStaff;
};

// Try multiple possible bulk upload formats in sequence
const tryBulkUploadFormats = (url: string, formattedStaffMembers: StaffMember[], headers: Record<string, string>) => {
  // Format 1: Send with staff property (like the students/bulk endpoint)
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
  getAll: () => api.get<StaffMember[]>('staff'),
  
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
    
    // Use the /api/staff/bulk endpoint
    const baseUrl = config.apiUrl.endsWith('/') ? config.apiUrl.slice(0, -1) : config.apiUrl;
    const url = `${baseUrl}/api/staff/bulk`;
    
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
  }
};

export default staffService;