import api from './api';

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
    api.post<LeaveRequest>('/leaves', leaveRequest),

  processLeaveRequest: (id: number, status: 'APPROVED' | 'REJECTED', comments?: string) =>
    api.put<LeaveRequest>(`/leaves/${id}/process`, { status, comments }),

  getLeaveRequest: (id: number) =>
    api.get<LeaveRequest>(`/leaves/${id}`),

  getEmployeeLeaves: (employeeId: number) =>
    api.get<LeaveRequest[]>(`/leaves/employee/${employeeId}`),

  getPendingLeaves: () =>
    api.get<LeaveRequest[]>('/leaves/pending'),

  getByDateRange: (startDate: string, endDate: string) =>
    api.get<LeaveRequest[]>(`/leaves/date-range?startDate=${startDate}&endDate=${endDate}`),
};