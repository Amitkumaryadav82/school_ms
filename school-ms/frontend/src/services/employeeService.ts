import api from './api';

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
    api.post<Employee>('/employees', employee),

  updateEmployee: (id: number, employee: Employee) =>
    api.put<Employee>(`/employees/${id}`, employee),

  getEmployee: (id: number) =>
    api.get<Employee>(`/employees/${id}`),

  getAllEmployees: () =>
    api.get<Employee[]>('/employees'),

  getByDepartment: (department: string) =>
    api.get<Employee[]>(`/employees/department/${department}`),

  getByRole: (role: string) =>
    api.get<Employee[]>(`/employees/role/${role}`),

  deleteEmployee: (id: number) =>
    api.delete(`/employees/${id}`),
};