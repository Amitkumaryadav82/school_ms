import api from './api';

export interface Teacher {
  id?: number;
  name: string;
  subject: string;
  email: string;
  phoneNumber: string;
  department: string;
}

export const teacherService = {
  // Updated to use the correct staff endpoint that has permission
  getAll: () => api.get<Teacher[]>('/staff/teachers'),
  getById: (id: number) => api.get<Teacher>(`/staff/${id}`),
  create: (teacher: Teacher) => api.post<Teacher>('/staff', teacher),
  update: (id: number, teacher: Teacher) => api.put<Teacher>(`/staff/${id}`, teacher),
  delete: (id: number) => api.delete(`/staff/${id}`),
};