import api from './api';

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
  getAll: () => api.get<Course[]>('/academics/courses'),
  getById: (id: number) => api.get<Course>(`/academics/courses/${id}`),
  create: (course: Course) => api.post<Course>('/academics/courses', course),
  update: (id: number, course: Course) => api.put<Course>(`/academics/courses/${id}`, course),
  delete: (id: number) => api.delete(`/academics/courses/${id}`),
  enrollStudent: (courseId: number, studentId: number) => api.post<void>(`/academics/courses/${courseId}/enroll/${studentId}`),
  unenrollStudent: (courseId: number, studentId: number) => api.post<void>(`/academics/courses/${courseId}/unenroll/${studentId}`),
};