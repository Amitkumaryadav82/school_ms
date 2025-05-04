import { api } from './apiClient.js';

export interface Teacher {
  id?: number;
  name: string;
  subject: string;
  email: string;
  phoneNumber: string;
  department: string;
}

export const teacherService = {
  getAll: () => api.get<Teacher[]>('/teachers'),
  getById: (id: number) => api.get<Teacher>(`/teachers/${id}`),
  create: (teacher: Teacher) => api.post<Teacher>('/teachers', teacher),
  update: (id: number, teacher: Teacher) => api.put<Teacher>(`/teachers/${id}`, teacher),
  delete: (id: number) => api.delete(`/teachers/${id}`),
};