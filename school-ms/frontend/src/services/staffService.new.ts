import config from '../config/environment';
import { api } from './api';

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
  subjectsTaught?: string; 
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

export interface ApiStaffRole extends StaffRole {
  roleName?: string;
  [key: string]: any; 
}

export interface StaffMember {
  id?: number;
  staffId?: string;
  firstName: string;
  lastName: string;
  middleName?: string; 
  fullName?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  role: string | StaffRole | ApiStaffRole | any;
  staffRole?: StaffRole | ApiStaffRole;
  roleId?: number;
  joinDate?: string;
  joiningDate?: string;
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
  teacherDetails?: TeacherDetails;
  pfUAN?: string;
  gratuity?: string;
  serviceEndDate?: string;
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

const ROLE_ID_MAP: Record<string, number> = {
  'Teacher': 1,
  'Principal': 2,
  'Admin Officer': 3,
  'Librarian': 4,
  'Management': 5,
  'Account Officer': 6
};

const prepareStaffData = (staffMember: StaffMember): StaffMember => {
  const formattedStaff = { ...staffMember };
  
  // Handle role format
  if (typeof staffMember.role === 'string') {
    // If role is a string, convert to appropriate role object
    const roleName = staffMember.role.toUpperCase().replace(' ', '_');
    formattedStaff.role = { name: roleName };
    
    // Try to map known role to ID
    if (ROLE_ID_MAP[staffMember.role]) {
      formattedStaff.role.id = ROLE_ID_MAP[staffMember.role];
    }
  }
  
  return formattedStaff;
};

export const staffService = {
  // Get all staff members
  getAll: async () => {
    try {
      console.log('Fetching staff data from API');
      
      // Use a direct fetch call to have more control over error handling
      const fullUrl = `${config.apiUrl}/api/staff`;
      console.log('Full URL:', fullUrl);
      
      const authToken = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Using fetch directly to better handle JSON parsing errors
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      // Get raw text first to handle potential JSON parsing errors
      const rawText = await response.text();
      
      try {
        // Try to parse the JSON
        const data = JSON.parse(rawText);
        console.log('Response successfully parsed:', {
          type: typeof data,
          isArray: Array.isArray(data),
          length: Array.isArray(data) ? data.length : 'N/A',
          keys: typeof data === 'object' && data !== null ? Object.keys(data) : 'N/A'
        });
        
        // Handle different response formats
        if (Array.isArray(data)) {
          return data;
        } else if (data && typeof data === 'object') {
          // Check if the response has a data property that's an array
          if ('data' in data && Array.isArray(data.data)) {
            return data.data;
          }
        }
        
        return [];
      } catch (parseError) {
        // Log JSON parse errors
        console.error('JSON parse error:', parseError);
        console.log('Raw response (first 100 chars):', rawText.substring(0, 100));
        return [];
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
      return [];
    }
  },
  
  // Get a specific staff member by ID
  getById: (id: number) => api.get<StaffMember>(`staff/${id}`),
  
  // Create a new staff member
  create: (staffMember: StaffMember) => {
    const formattedData = prepareStaffData(staffMember);
    return api.post<StaffMember>('staff', formattedData);
  },
  
  // Create multiple staff members
  createBulk: (staffMembers: StaffMember[]) => {
    const formattedData = staffMembers.map(prepareStaffData);
    return api.post('staff/bulk', formattedData);
  },
  
  // Update a staff member
  update: (id: number, staffMember: StaffMember) => {
    const formattedData = prepareStaffData(staffMember);
    return api.put<StaffMember>(`staff/${id}`, formattedData);
  },
  
  // Bulk update or create staff members
  bulkCreate: (staffMembers: StaffMember[]) => {
    const formattedData = staffMembers.map(prepareStaffData);
    return api.post('staff/bulk-upload', { staff: formattedData });
  },
  
  // Toggle staff member active status
  toggleStatus: (id: number, isActive: boolean) => {
    return api.patch<StaffMember>(`staff/${id}/toggle-status`, { isActive });
  },
  
  // Update employment status of a staff member
  updateEmploymentStatus: (id: number, status: EmploymentStatus) => {
    return api.patch<StaffMember>(`staff/${id}/employment-status`, { status });
  },
  
  // Delete a staff member
  delete: (id: number) => api.delete(`staff/${id}`),
  
  // Get active teachers
  getActiveTeachers: async () => {
    try {
      const staff = await staffService.getAll();
      return staff.filter(s => 
        s.isActive && 
        (typeof s.role === 'string' 
          ? s.role.toUpperCase() === 'TEACHER' 
          : (s.role?.name?.toUpperCase() === 'TEACHER' || 
             (s.role as any)?.roleName?.toUpperCase() === 'TEACHER'))
      );
    } catch (error) {
      console.error('Error fetching active teachers:', error);
      return [];
    }
  }
};

export default staffService;
