import { api } from './apiClient.js';

export interface Course {
  id?: number;
  name: string;
  department: string;
  teacher: string;
  credits: number;
  capacity: number;
  enrolled: number;
}

export const courseService = {
  getAll: () => api.get<Course[]>('/courses'),
  getById: (id: number) => api.get<Course>(`/courses/${id}`),
  create: (course: Course) => api.post<Course>('/courses', course),
  update: (id: number, course: Course) => api.put<Course>(`/courses/${id}`, course),
  delete: (id: number) => api.delete(`/courses/${id}`),
  enrollStudent: (courseId: number, studentId: number) => api.post(`/courses/${courseId}/enroll/${studentId}`),
  unenrollStudent: (courseId: number, studentId: number) => api.post(`/courses/${courseId}/unenroll/${studentId}`),
};