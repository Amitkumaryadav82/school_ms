import { api } from './api';

/**
 * Consolidated Course interface that matches the backend ConsolidatedCourse model
 */
export interface ConsolidatedCourse {
  id?: number;
  name: string;
  department: string;
  teacherId: number;
  teacherName?: string; // Transient field for display
  credits: number;
  capacity: number;
  enrolled: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Consolidated Course Service that works with the new consolidated backend endpoints.
 * This service should replace the existing courseService over time.
 */
export const consolidatedCourseService = {
  // Get all courses
  getAll: () => api.get<ConsolidatedCourse[]>('courses'),
  
  // Get course by ID
  getById: (id: number) => api.get<ConsolidatedCourse>(`courses/${id}`),
  
  // Get courses by department
  getByDepartment: (department: string) => api.get<ConsolidatedCourse[]>(`courses/department/${department}`),
  
  // Get courses by teacher ID
  getByTeacherId: (teacherId: number) => api.get<ConsolidatedCourse[]>(`courses/teacher/${teacherId}`),
  
  // Create a new course
  create: (course: ConsolidatedCourse) => api.post<ConsolidatedCourse>('courses', course),
  
  // Update an existing course
  update: (id: number, course: ConsolidatedCourse) => api.put<ConsolidatedCourse>(`courses/${id}`, course),
  
  // Delete a course
  delete: (id: number) => api.delete(`courses/${id}`),
  
  // Get course statistics
  getStats: () => api.get<{
    totalCourses: number,
    totalCapacity: number,
    totalEnrolled: number,
    fillRate: string
  }>('courses/stats')
};

export default consolidatedCourseService;
