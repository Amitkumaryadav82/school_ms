import api from './api';

export interface Attendance {
  id?: number;
  studentId: number;
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
    api.post<void>('/attendance/bulk', attendance),

  // Legacy JSON body variant (may not be supported by backend params API)
  markIndividualAttendance: (studentId: string, attendance: Omit<Attendance, 'id' | 'studentId'>) =>
    api.post<Attendance>(`/attendance/${studentId}`, attendance),

  // Preferred variant using request params expected by backend
  markStudentAttendanceParams: (studentId: string | number, args: { date: string; status: Attendance['status']; remarks?: string }) =>
    api.post<void>(`/attendance/${studentId}?status=${encodeURIComponent(args.status)}&date=${encodeURIComponent(args.date)}${args.remarks ? `&remarks=${encodeURIComponent(args.remarks)}` : ''}`),

  updateAttendance: (id: number, attendance: Partial<Attendance>) => {
    const params: string[] = [];
    if (attendance.status) params.push(`status=${encodeURIComponent(attendance.status)}`);
    if (attendance.remarks !== undefined) params.push(`remarks=${encodeURIComponent(attendance.remarks)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    // Backend expects params, no JSON body
    return api.put<Attendance>(`/attendance/${id}${qs}`);
  },

  markCheckout: (id: number, checkOutTime: string) =>
    api.put<Attendance>(`/attendance/${id}/checkout`, { checkOutTime }),

  getById: (id: number) =>
    api.get<Attendance>(`/attendance/${id}`),

  getStudentAttendance: (studentId: string) =>
    api.get<Attendance[]>(`/attendance/student/${studentId}`),

  getByDate: (date: string) =>
    api.get<Attendance[]>(`/attendance/date/${date}`),

  getByDateRange: (startDate: string, endDate: string) =>
    api.get<Attendance[]>(`/attendance/date-range?startDate=${startDate}&endDate=${endDate}`),

  getStudentAttendanceByDateRange: (studentId: string, startDate: string, endDate: string) =>
    api.get<Attendance[]>(`/attendance/student/${studentId}/date-range?startDate=${startDate}&endDate=${endDate}`),

  getStudentAttendanceCount: (studentId: string) =>
    api.get<{ total: number; present: number }>(`/attendance/student/${studentId}/count`),

  getGradeAttendance: (grade: string, date: string) =>
    api.get<Attendance[]>(`/attendance/grade/${grade}/date/${date}`),

  getSectionAttendance: (grade: string, section: string, date: string) =>
    api.get<Attendance[]>(`/attendance/grade/${grade}/section/${section}/date/${date}`),

  getStudentAttendanceSummary: (studentId: string) =>
    api.get<AttendanceSummary>(`/attendance/student/${studentId}/summary`),

  // Legacy variant (does not match backend ClassAttendanceRequest shape)
  markClassAttendance: (grade: string, section: string, attendance: BulkAttendance) =>
    api.post<void>('/attendance/class', { grade, section, ...attendance }),

  // Preferred class default marking aligning with backend API
  markClassDefault: (grade: string | number, section: string, args: { date: string; defaultStatus: Attendance['status']; remarks?: string }) =>
    api.post<void>('/attendance/class', {
      grade: typeof grade === 'string' ? parseInt(grade, 10) : grade,
      section,
      date: args.date,
      defaultStatus: args.defaultStatus,
      remarks: args.remarks || ''
    }),

  generateMonthlyReport: (month: number, year: number) =>
    api.get<Blob>(`/attendance/report/monthly?month=${month}&year=${year}`, {
      responseType: 'blob'
    }),

  getMonthlyStats: (month: number, year: number) =>
    api.get<MonthlyStats>(`/attendance/stats/monthly?month=${month}&year=${year}`),

  deleteAttendance: (id: number) =>
    api.delete(`/attendance/${id}`),
};