import api from './api';

export interface Teacher {
  id?: number;
  name: string;
  subject: string;
  email: string;
  phoneNumber: string;
  department: string;
  // Add missing properties used in TeacherDialog
  employeeId: string;
  subjects: string[];
  qualifications: string[];
  dateOfBirth: string;
  gender: string;
  address: string;
  joiningDate: string;
  status: string;
}

export const teacherService = {
  getAll: () => api.get<Teacher[]>('/staff'),
  getById: (id: number) => api.get<Teacher>(`/staff/${id}`),
  create: (teacher: Teacher) => api.post<Teacher>('/staff', teacher),
  update: (id: number, teacher: Teacher) => api.put<Teacher>(`/staff/${id}`, teacher),
  delete: (id: number) => api.delete(`/staff/${id}`),

  // Add aliases to match the function names used in Teachers.tsx
  getAllTeachers: () => api.get<Teacher[]>('/staff'),
  createTeacher: (teacher: Teacher) => api.post<Teacher>('/staff', teacher),
  updateTeacher: (id: number, teacher: Teacher) => api.put<Teacher>(`/staff/${id}`, teacher),
  deleteTeacher: (id: number) => api.delete(`/staff/${id}`),
};