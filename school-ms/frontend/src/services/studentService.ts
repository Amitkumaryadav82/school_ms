import api from './api.jsx';
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

// Directly export a studentService object matching other services in your codebase
export const studentService = {
  // Function to list all students using conventional REST endpoint patterns
  getAllStudents: async () => {
    console.log('⚙️ StudentService: Attempting to get all students');
    
    // Get the authentication token for debugging
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // Log authentication details for debug
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        const tokenStart = token.substring(0, 20) + '...';
        
        console.log('🔑 StudentService: Auth details for request', {
          token: tokenStart,
          role: userData.role,
          username: userData.username
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Use the same pattern as your other services that are working
    return api.get('/api/students');
  },
  
  // Get a specific student by ID
  getStudentById: (id: number) => api.get(`/api/students/${id}`),
  
  // Create a new student record
  createStudent: (student: Student) => api.post('/api/students', student),
  
  // Create a student with elevated permissions
  createWithElevatedPermissions: async (student: Student) => {
    // Try to get admin credentials from localStorage or sessionStorage
    const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    
    if (!adminToken) {
      // If no admin token exists, prompt for admin credentials via a separate dialog
      // This is a simplified implementation - in production, you'd use a proper dialog
      const adminUsername = prompt('Admin username required for this action:');
      const adminPassword = prompt('Admin password required for this action:');
      
      if (!adminUsername || !adminPassword) {
        throw new Error('Admin credentials required for this operation');
      }
      
      try {
        // Create a temporary axios instance that doesn't use the interceptors
        const tempApi = axios.create({
          baseURL: config.apiUrl,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Authenticate as admin
        const authResponse = await tempApi.post('/api/auth/admin-login', {
          username: adminUsername,
          password: adminPassword
        });
        
        // Store the admin token temporarily in sessionStorage
        if (authResponse.data && authResponse.data.token) {
          sessionStorage.setItem('adminToken', authResponse.data.token);
          
          // Now make the actual student creation request with admin token
          const response = await tempApi.post('/api/students', student, {
            headers: {
              'Authorization': `Bearer ${authResponse.data.token}`
            }
          });
          
          return response;
        }
      } catch (error) {
        console.error('Admin authentication failed:', error);
        throw new Error('Admin authentication failed. Please try again with correct credentials.');
      }
    } else {
      // If admin token exists, use it directly
      try {
        // Create a temporary axios instance
        const tempApi = axios.create({
          baseURL: config.apiUrl,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
        });
        
        return await tempApi.post('/api/students', student);
      } catch (error) {
        console.error('Error creating student with admin token:', error);
        // If the admin token is invalid/expired, clear it and retry
        sessionStorage.removeItem('adminToken');
        localStorage.removeItem('adminToken');
        throw new Error('Admin session expired. Please try again.');
      }
    }
  },
  
  // Update an existing student record
  updateStudent: (id: number, student: Student) => api.put(`/api/students/${id}`, student),
  
  // Update student with elevated permissions
  updateWithElevatedPermissions: async (id: number, student: Student) => {
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
        // Create a temporary axios instance that doesn't use the interceptors
        const tempApi = axios.create({
          baseURL: config.apiUrl,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Authenticate as admin
        const authResponse = await tempApi.post('/api/auth/admin-login', {
          username: adminUsername,
          password: adminPassword
        });
        
        // Store the admin token temporarily in sessionStorage
        if (authResponse.data && authResponse.data.token) {
          sessionStorage.setItem('adminToken', authResponse.data.token);
          
          // Now make the actual student update request with admin token
          const response = await tempApi.put(`/api/students/${id}`, student, {
            headers: {
              'Authorization': `Bearer ${authResponse.data.token}`
            }
          });
          
          return response;
        }
      } catch (error) {
        console.error('Admin authentication failed:', error);
        throw new Error('Admin authentication failed. Please try again with correct credentials.');
      }
    } else {
      // If admin token exists, use it directly
      try {
        // Create a temporary axios instance
        const tempApi = axios.create({
          baseURL: config.apiUrl,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
        });
        
        return await tempApi.put(`/api/students/${id}`, student);
      } catch (error) {
        console.error('Error updating student with admin token:', error);
        // If the admin token is invalid/expired, clear it and retry
        sessionStorage.removeItem('adminToken');
        localStorage.removeItem('adminToken');
        throw new Error('Admin session expired. Please try again.');
      }
    }
  },
  
  // Delete a student record
  deleteStudent: (id: number) => api.delete(`/api/students/${id}`),
  
  // Get students by grade - useful for filtering
  getStudentsByGrade: (grade: string) => api.get(`/api/students/grade/${grade}`),
  
  // Get students by status - useful for filtering
  getStudentsByStatus: (status: string) => api.get(`/api/students/status/${status}`),
  
  // Search students by name, email, or other criteria
  searchStudents: (query: string) => api.get(`/api/students/search?q=${query}`)
};

// Also export the old function names for backward compatibility
export const getAll = studentService.getAllStudents;
export const getById = studentService.getStudentById;
export const create = studentService.createStudent;
export const update = studentService.updateStudent;
export const remove = studentService.deleteStudent;
export const createWithElevatedPermissions = studentService.createWithElevatedPermissions;
export const updateWithElevatedPermissions = studentService.updateWithElevatedPermissions;