import api from './api';

export interface Course {
  id?: number;
  name: string;
  department: string;
  teacherId: number;
  credits: number;
  capacity: number;
  enrolled: number;
}

export const courseService = {
  getAll: () => api.get<Course[]>('courses'),  // Removed /api prefix to avoid duplication
  getById: (id: number) => api.get<Course>(`courses/${id}`),  // Removed /api prefix
  create: (course: Course) => api.post<Course>('courses', course),  // Removed /api prefix
  update: (id: number, course: Course) => api.put<Course>(`courses/${id}`, course),  // Removed /api prefix
  delete: (id: number) => api.delete(`courses/${id}`),  // Removed /api prefix
  enrollStudent: (courseId: number, studentId: number) => 
    api.post<void>(`courses/${courseId}/enroll`, { studentId }),  // Removed /api prefix
  unenrollStudent: (courseId: number, studentId: number) => 
    api.delete<void>(`courses/${courseId}/enroll?studentId=${studentId}`),  // Removed /api prefix
  getAllCourses: () => api.get<Course[]>('courses'),  // Alias for getAll for compatibility
};