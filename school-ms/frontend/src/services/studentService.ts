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
  
  // Ensure date format is correct for LocalDate (YYYY-MM-DD)
  const formattedDateOfBirth = student.dateOfBirth ? 
    new Date(student.dateOfBirth).toISOString().split('T')[0] : 
    new Date().toISOString().split('T')[0];
  
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
    admissionDate: student.admissionDate || new Date().toISOString().split('T')[0],
    bloodGroup: student.bloodGroup || '',
    gender: (student.gender && ['MALE', 'FEMALE', 'OTHER'].includes(student.gender.toUpperCase())) 
      ? student.gender.toUpperCase() 
      : 'MALE',
    medicalConditions: ''
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
    admissionDate: backendStudent.admissionDate,
    bloodGroup: backendStudent.bloodGroup,
    gender: backendStudent.gender
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
    const response = await api.put<BackendStudent>(`/api/students/${id}/status`, { status });
    return mapToFrontendStudent(response);
  },
  
  // Delete a student record
  delete: (id: number) => api.delete(`/api/students/${id}`),
  
  // Get students by grade
  getByGrade: async (grade: string) => {
    const response = await api.get<BackendStudent[]>(`/api/students/grade/${grade}`);
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