import { api } from './apiClient.js';

export interface Employee {
  id?: number;
  name: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: string;
  joiningDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export const employeeService = {
  createEmployee: (employee: Employee) =>
    api.post<Employee>('/api/employees', employee),

  updateEmployee: (id: number, employee: Employee) =>
    api.put<Employee>(`/api/employees/${id}`, employee),

  getEmployee: (id: number) =>
    api.get<Employee>(`/api/employees/${id}`),

  getAllEmployees: () =>
    api.get<Employee[]>('/api/employees'),

  getByDepartment: (department: string) =>
    api.get<Employee[]>(`/api/employees/department/${department}`),

  getByRole: (role: string) =>
    api.get<Employee[]>(`/api/employees/role/${role}`),

  deleteEmployee: (id: number) =>
    api.delete(`/api/employees/${id}`),
};