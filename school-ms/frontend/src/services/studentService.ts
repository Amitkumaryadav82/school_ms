import api from './api';
import axios from 'axios';
import config from '../config/environment';

// Frontend Student interface - this simplifies how we represent a student in the UI
export interface Student {
  id?: number;
  studentId: string;
  name: string;  // Combined firstName + lastName for UI simplicity
  grade: string;
  section?: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  status?: string;
  address?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  emergencyContact?: string;
  admissionDate?: string;
  bloodGroup?: string;
  gender?: string;
  // New TC-related fields
  guardianOccupation?: string;
  guardianOfficeAddress?: string;
  aadharNumber?: string;
  udiseNumber?: string;
  houseAlloted?: string;
  guardianAnnualIncome?: string;
  previousSchool?: string;
  tcNumber?: string;
  tcReason?: string;
  tcDate?: string;
  whatsappNumber?: string;
  subjects?: string;
  transportMode?: string;
  busRouteNumber?: string;
  medicalConditions?: string;
  // Fee-related fields
  feeStructureId?: number;
  paymentScheduleId?: number;
}

// Backend Student interface - this maps exactly to the Java entity
export interface BackendStudent {
  id?: number;
  studentId: string;
  firstName: string;
  lastName: string;
  grade: number;
  section: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  status: string;
  address: string;
  guardianName: string;
  guardianContact: string;
  guardianEmail: string;
  guardianOccupation?: string;
  guardianOfficeAddress?: string;
  aadharNumber?: string;
  udiseNumber?: string;
  houseAlloted?: string;
  guardianAnnualIncome?: number;
  previousSchool?: string;
  tcNumber?: string;
  tcReason?: string;
  tcDate?: string;
  whatsappNumber?: string;
  subjects?: string;
  transportMode?: string;
  busRouteNumber?: string;
  admissionDate: string;
  bloodGroup?: string;
  medicalConditions?: string;
  gender: string;
  photoUrl?: string;
}

// Helper function to convert frontend Student to backend format
const mapToBackendStudent = (student: Student): BackendStudent => {
  // Add null checks for name
  let firstName = '';
  let lastName = '';
  
  if (student && student.name) {
    const nameParts = student.name.split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  }
  
  // Safely parse date of birth with fallback
  let formattedDateOfBirth: string;
  
  try {
    if (student.dateOfBirth) {
      // Check if the date is already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(student.dateOfBirth)) {
        formattedDateOfBirth = student.dateOfBirth;
      } else {
        // Handle various date formats by attempting different parsing methods
        const dateParts = student.dateOfBirth.split(/[-/\.]/);
        
        // Try to determine if the format is MM/DD/YYYY or DD/MM/YYYY or YYYY/MM/DD
        let parsedDate: Date;
        if (dateParts.length === 3) {
          // Check if the first part might be a year (4 digits)
          if (dateParts[0].length === 4) {
            // Likely YYYY/MM/DD format
            parsedDate = new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`);
          } else {
            // Try both MM/DD/YYYY and DD/MM/YYYY
            // First attempt MM/DD/YYYY
            parsedDate = new Date(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`);
            
            // If the result is invalid, try DD/MM/YYYY
            if (isNaN(parsedDate.getTime())) {
              parsedDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            }
          }
          
          if (!isNaN(parsedDate.getTime())) {
            formattedDateOfBirth = parsedDate.toISOString().split('T')[0];
          } else {
            // If all attempts failed, use current date
            console.warn(`Invalid date format "${student.dateOfBirth}" for student ${student.name || student.studentId}, using current date`);
            formattedDateOfBirth = new Date().toISOString().split('T')[0];
          }
        } else {
          // If format is unexpected, try direct parsing
          parsedDate = new Date(student.dateOfBirth);
          if (!isNaN(parsedDate.getTime())) {
            formattedDateOfBirth = parsedDate.toISOString().split('T')[0];
          } else {
            // Fallback to current date
            console.warn(`Invalid date format "${student.dateOfBirth}" for student ${student.name || student.studentId}, using current date`);
            formattedDateOfBirth = new Date().toISOString().split('T')[0];
          }
        }
      }
    } else {
      // If no date provided, use current date
      formattedDateOfBirth = new Date().toISOString().split('T')[0];
    }  } catch (error: unknown) {
    console.warn(`Error parsing date ${student.dateOfBirth} for student ${student.name || student.studentId}: ${(error as Error)?.message}`);
    // Fallback to current date
    formattedDateOfBirth = new Date().toISOString().split('T')[0];
  }
  
  // Ensure grade is an integer
  const gradeAsInt = parseInt(student.grade || '0', 10);
  
  // Ensure required fields are not empty/null
  return {
    id: student.id,
    studentId: student.studentId || `ST${Date.now().toString().slice(-6)}`, // Generate student ID if empty
    firstName: firstName || 'First', // Default value to satisfy @NotBlank
    lastName: lastName || 'Last', // Default value to satisfy @NotBlank
    grade: isNaN(gradeAsInt) ? 1 : gradeAsInt, // Default to grade 1 if invalid
    section: student.section || 'A',
    email: student.email || `student${Date.now()}@example.com`, // Generate unique email if empty
    contactNumber: student.phoneNumber || student.parentPhone || '0000000000',
    dateOfBirth: formattedDateOfBirth,
    status: student.status || 'ACTIVE',
    address: student.address || 'Address not provided',
    guardianName: student.parentName || 'Guardian',
    guardianContact: student.parentPhone || '0000000000',
    guardianEmail: student.parentEmail || student.email || '',
    guardianOccupation: student.guardianOccupation || '',
    guardianOfficeAddress: student.guardianOfficeAddress || '',
    aadharNumber: student.aadharNumber || '',
    udiseNumber: student.udiseNumber || '',
    houseAlloted: student.houseAlloted || '',
    guardianAnnualIncome: parseFloat(student.guardianAnnualIncome || '0') || 0,
    previousSchool: student.previousSchool || '',
    tcNumber: student.tcNumber || '',
    tcReason: student.tcReason || '',
    tcDate: student.tcDate || '',
    whatsappNumber: student.whatsappNumber || '',
    subjects: student.subjects || '',
    transportMode: student.transportMode || '',
    busRouteNumber: student.busRouteNumber || '',
    admissionDate: student.admissionDate || new Date().toISOString().split('T')[0],
    bloodGroup: student.bloodGroup || '',
    gender: (student.gender && ['MALE', 'FEMALE', 'OTHER'].includes(student.gender.toUpperCase())) 
      ? student.gender.toUpperCase() 
      : 'MALE',
    medicalConditions: student.medicalConditions || ''
  };
};

// Helper function to convert backend student to frontend format
const mapToFrontendStudent = (backendStudent: BackendStudent): Student => {
  return {
    id: backendStudent.id,
    studentId: backendStudent.studentId,
    name: `${backendStudent.firstName} ${backendStudent.lastName}`.trim(),
    grade: backendStudent.grade.toString(),
    section: backendStudent.section,
    email: backendStudent.email,
    phoneNumber: backendStudent.contactNumber,
    dateOfBirth: backendStudent.dateOfBirth,
    status: backendStudent.status,
    address: backendStudent.address,
    parentName: backendStudent.guardianName,
    parentPhone: backendStudent.guardianContact,
    parentEmail: backendStudent.guardianEmail,
    guardianOccupation: backendStudent.guardianOccupation,
    guardianOfficeAddress: backendStudent.guardianOfficeAddress,
    aadharNumber: backendStudent.aadharNumber,
    udiseNumber: backendStudent.udiseNumber,
    houseAlloted: backendStudent.houseAlloted,
    guardianAnnualIncome: backendStudent.guardianAnnualIncome?.toString(),
    previousSchool: backendStudent.previousSchool,
    tcNumber: backendStudent.tcNumber,
    tcReason: backendStudent.tcReason,
    tcDate: backendStudent.tcDate,
    whatsappNumber: backendStudent.whatsappNumber,
    subjects: backendStudent.subjects,
    transportMode: backendStudent.transportMode,
    busRouteNumber: backendStudent.busRouteNumber,
    admissionDate: backendStudent.admissionDate,
    bloodGroup: backendStudent.bloodGroup,
    gender: backendStudent.gender,
    medicalConditions: backendStudent.medicalConditions
  };
};

// Create a helper function for elevated permission requests
async function callWithElevatedPermissions(method: string, endpoint: string, data?: any) {
  // Get the current user role from localStorage or sessionStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
  const isAdmin = currentUser && currentUser.role === 'ADMIN';
  
  // If the current user is an admin, use their existing token
  if (isAdmin) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      try {
        return await axios({
          method,
          url: `${config.apiUrl}${endpoint}`,
          data,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error with admin token:', error);
        throw error;
      }
    }
  }
  
  // If not admin, proceed with the existing flow to ask for admin credentials
  // Try to get admin credentials from localStorage or sessionStorage
  const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  
  if (!adminToken) {
    // If no admin token exists, prompt for admin credentials
    const adminUsername = prompt('Admin username required for this action:');
    const adminPassword = prompt('Admin password required for this action:');
    
    if (!adminUsername || !adminPassword) {
      throw new Error('Admin credentials required for this operation');
    }
    
    try {
      // Authenticate as admin
      const response = await axios.post(`${config.apiUrl}/api/auth/admin-login`, {
        username: adminUsername,
        password: adminPassword
      });
      
      if (response.data && response.data.token) {
        // Store the admin token temporarily
        sessionStorage.setItem('adminToken', response.data.token);
        
        // Make the request with admin token
        return await axios({
          method,
          url: `${config.apiUrl}${endpoint}`,
          data,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${response.data.token}`
          }
        });
      }
    } catch (error) {
      console.error('Admin authentication failed:', error);
      throw new Error('Admin authentication failed. Please try again with correct credentials.');
    }
  } else {
    // If admin token exists, use it directly
    try {
      return await axios({
        method,
        url: `${config.apiUrl}${endpoint}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });
    } catch (error) {
      console.error(`Error with admin token: ${error}`);
      // If the admin token is invalid/expired, clear it and retry
      sessionStorage.removeItem('adminToken');
      localStorage.removeItem('adminToken');
      throw new Error('Admin session expired. Please try again.');
    }
  }
}

// Simplified student service with consistent API usage
export const studentService = {
  // Get all students
  getAll: async () => {
    const response = await api.get<BackendStudent[]>('/api/students');
    return response.map(mapToFrontendStudent);
  },
  getAllStudents: async () => {
    const response = await api.get<BackendStudent[]>('/api/students');
    return response.map(mapToFrontendStudent);
  },
  
  // Get a specific student by ID
  getById: async (id: number) => {
    const response = await api.get<BackendStudent>(`/api/students/${id}`);
    return mapToFrontendStudent(response);
  },
  
  // Create a new student record
  create: async (student: Student) => {
    const backendStudent = mapToBackendStudent(student);
    const response = await api.post<BackendStudent>('/api/students', backendStudent);
    return mapToFrontendStudent(response);
  },
  
  // Update an existing student record
  update: async (id: number, student: Student) => {
    const backendStudent = mapToBackendStudent({...student, id});
    const response = await api.put<BackendStudent>(`/api/students/${id}`, backendStudent);
    return mapToFrontendStudent(response);
  },
  
  // Update just the student status
  updateStatus: async (id: number, status: string) => {
    try {
      console.log(`Updating student ${id} status to: ${status}`);
      // First, get the current student data
      const currentStudent = await api.get<BackendStudent>(`/api/students/${id}`);
      
      // Update only the status field
      const updatedData = { 
        ...currentStudent,
        status: status 
      };
      
      const response = await api.put<BackendStudent>(`/api/students/${id}`, updatedData);
      return mapToFrontendStudent(response);
    } catch (error) {
      console.error('Error updating student status:', error);
      throw error;
    }
  },
  
  // Delete a student record
  delete: async (id: number) => {
    try {
      console.log(`Deleting student with ID: ${id}`);
      await api.delete(`/api/students/${id}`);
      return { success: true, message: 'Student deleted successfully' };
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },
  
  // Get students by grade
  getByGrade: async (grade: string) => {
    const response = await api.get<BackendStudent[]>(`/api/students/grade/${grade}`);
    return response.map(mapToFrontendStudent);
  },

  // Get students by grade and section
  getByGradeAndSection: async (grade: string | number, section: string) => {
    const g = typeof grade === 'string' ? grade : String(grade);
    const response = await api.get<BackendStudent[]>(`/api/students/grade/${encodeURIComponent(g)}/section/${encodeURIComponent(section)}`);
    return response.map(mapToFrontendStudent);
  },
  
  // Get students by status
  getByStatus: async (status: string) => {
    const response = await api.get<BackendStudent[]>(`/api/students/status/${status}`);
    return response.map(mapToFrontendStudent);
  },
  
  // Search students
  search: async (query: string) => {
    const response = await api.get<BackendStudent[]>(`/api/students/search?query=${query}`);
    return response.map(mapToFrontendStudent);
  },
  
  // Elevated permission methods
  createWithElevatedPermissions: async (student: Student) => {
    const backendStudent = mapToBackendStudent(student);
    const response = await callWithElevatedPermissions('post', '/api/students', backendStudent);
    return response?.data ? mapToFrontendStudent(response.data) : null;
  },
  
  updateWithElevatedPermissions: async (id: number, student: Student) => {
    const backendStudent = mapToBackendStudent({...student, id});
    const response = await callWithElevatedPermissions('put', `/api/students/${id}`, backendStudent);
    return response?.data ? mapToFrontendStudent(response.data) : null;
  },
  
  // Create multiple students at once
  createBulk: async (students: Student[]) => {
    const backendStudents = students.map(mapToBackendStudent);
    const response = await api.post<BackendStudent[]>('/api/students/bulk', {
      students: backendStudents,
      expectedCount: students.length
    });
    return response.map(mapToFrontendStudent);
  },
  
  // Create multiple students with elevated permissions
  createBulkWithElevatedPermissions: async (students: Student[]) => {
    const backendStudents = students.map(mapToBackendStudent);
    const response = await callWithElevatedPermissions('post', '/api/students/bulk', {
      students: backendStudents,
      expectedCount: students.length
    });
    return response?.data ? response.data.map(mapToFrontendStudent) : [];
  }
};

// Also export the old function names for backward compatibility
export const getAll = studentService.getAllStudents;
export const getById = studentService.getById;
export const create = studentService.create;
export const update = studentService.update;
export const remove = studentService.delete;
export const createWithElevatedPermissions = studentService.createWithElevatedPermissions;
export const updateWithElevatedPermissions = studentService.updateWithElevatedPermissions;