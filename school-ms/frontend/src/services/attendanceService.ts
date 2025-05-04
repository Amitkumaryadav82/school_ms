import { api } from './apiClient.js';

export interface Attendance {
  id?: number;
  studentId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export interface BulkAttendance {
  date: string;
  records: {
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string;
  }[];
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendancePercentage: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalStudents: number;
  averageAttendance: number;
  gradeWiseStats: {
    grade: string;
    averageAttendance: number;
  }[];
}

export const attendanceService = {
  markBulkAttendance: (attendance: BulkAttendance) =>
    api.post<void>('/api/attendance/bulk', attendance),

  markIndividualAttendance: (studentId: string, attendance: Omit<Attendance, 'id' | 'studentId'>) =>
    api.post<Attendance>(`/api/attendance/${studentId}`, attendance),

  updateAttendance: (id: number, attendance: Partial<Attendance>) =>
    api.put<Attendance>(`/api/attendance/${id}`, attendance),

  markCheckout: (id: number, checkOutTime: string) =>
    api.put<Attendance>(`/api/attendance/${id}/checkout`, { checkOutTime }),

  getById: (id: number) =>
    api.get<Attendance>(`/api/attendance/${id}`),

  getStudentAttendance: (studentId: string) =>
    api.get<Attendance[]>(`/api/attendance/student/${studentId}`),

  getByDate: (date: string) =>
    api.get<Attendance[]>(`/api/attendance/date/${date}`),

  getByDateRange: (startDate: string, endDate: string) =>
    api.get<Attendance[]>(`/api/attendance/date-range?startDate=${startDate}&endDate=${endDate}`),

  getStudentAttendanceByDateRange: (studentId: string, startDate: string, endDate: string) =>
    api.get<Attendance[]>(`/api/attendance/student/${studentId}/date-range?startDate=${startDate}&endDate=${endDate}`),

  getStudentAttendanceCount: (studentId: string) =>
    api.get<{ total: number; present: number }>(`/api/attendance/student/${studentId}/count`),

  getGradeAttendance: (grade: string, date: string) =>
    api.get<Attendance[]>(`/api/attendance/grade/${grade}/date/${date}`),

  getSectionAttendance: (grade: string, section: string, date: string) =>
    api.get<Attendance[]>(`/api/attendance/grade/${grade}/section/${section}/date/${date}`),

  getStudentAttendanceSummary: (studentId: string) =>
    api.get<AttendanceSummary>(`/api/attendance/student/${studentId}/summary`),

  markClassAttendance: (grade: string, section: string, attendance: BulkAttendance) =>
    api.post<void>('/api/attendance/class', { grade, section, ...attendance }),

  generateMonthlyReport: (month: number, year: number) =>
    api.get<Blob>(`/api/attendance/report/monthly?month=${month}&year=${year}`, {
      responseType: 'blob'
    }),

  getMonthlyStats: (month: number, year: number) =>
    api.get<MonthlyStats>(`/api/attendance/stats/monthly?month=${month}&year=${year}`),

  deleteAttendance: (id: number) =>
    api.delete(`/api/attendance/${id}`),
};