import { api } from './apiClient.js';

export interface LeaveRequest {
  id?: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  type: 'CASUAL' | 'SICK' | 'VACATION' | 'OTHER';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
}

export const leaveService = {
  applyForLeave: (leaveRequest: LeaveRequest) =>
    api.post<LeaveRequest>('/api/leaves', leaveRequest),

  processLeaveRequest: (id: number, status: 'APPROVED' | 'REJECTED', comments?: string) =>
    api.put<LeaveRequest>(`/api/leaves/${id}/process`, { status, comments }),

  getLeaveRequest: (id: number) =>
    api.get<LeaveRequest>(`/api/leaves/${id}`),

  getEmployeeLeaves: (employeeId: number) =>
    api.get<LeaveRequest[]>(`/api/leaves/employee/${employeeId}`),

  getPendingLeaves: () =>
    api.get<LeaveRequest[]>('/api/leaves/pending'),

  getByDateRange: (startDate: string, endDate: string) =>
    api.get<LeaveRequest[]>(`/api/leaves/date-range?startDate=${startDate}&endDate=${endDate}`),
};