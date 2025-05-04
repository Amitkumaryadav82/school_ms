import api from './api';
import axios from 'axios';
import config from '../config/environment';

export interface Student {
  id?: number;
  studentId: string;
  name: string;
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

// Create a helper function for elevated permission requests
async function callWithElevatedPermissions(method: string, endpoint: string, data?: any) {
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
  getAllStudents: () => api.get<Student[]>('/students'),
  
  // Get a specific student by ID
  getStudentById: (id: number) => api.get<Student>(`/students/${id}`),
  
  // Create a new student record
  createStudent: (student: Student) => api.post<Student>('/students', student),
  
  // Create a student with elevated permissions
  createWithElevatedPermissions: async (student: Student) => {
    const response = await callWithElevatedPermissions('post', '/api/students', student);
    return response?.data;
  },
  
  // Update an existing student record
  updateStudent: (id: number, student: Student) => api.put<Student>(`/students/${id}`, student),
  
  // Update student with elevated permissions
  updateWithElevatedPermissions: async (id: number, student: Student) => {
    const response = await callWithElevatedPermissions('put', `/api/students/${id}`, student);
    return response?.data;
  },
  
  // Delete a student record
  deleteStudent: (id: number) => api.delete(`/students/${id}`),
  
  // Get students by grade
  getStudentsByGrade: (grade: string) => api.get<Student[]>(`/students/grade/${grade}`),
  
  // Get students by status
  getStudentsByStatus: (status: string) => api.get<Student[]>(`/students/status/${status}`),
  
  // Search students
  searchStudents: (query: string) => api.get<Student[]>(`/students/search?q=${query}`)
};

// Also export the old function names for backward compatibility
export const getAll = studentService.getAllStudents;
export const getById = studentService.getStudentById;
export const create = studentService.createStudent;
export const update = studentService.updateStudent;
export const remove = studentService.deleteStudent;
export const createWithElevatedPermissions = studentService.createWithElevatedPermissions;
export const updateWithElevatedPermissions = studentService.updateWithElevatedPermissions;