import { api } from './api';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
  HOLIDAY = 'HOLIDAY'
}

export enum HolidayType {
  NATIONAL_HOLIDAY = 'NATIONAL_HOLIDAY',
  RELIGIOUS_HOLIDAY = 'RELIGIOUS_HOLIDAY',
  SCHOOL_FUNCTION = 'SCHOOL_FUNCTION',
  OTHER = 'OTHER'
}

export interface TeacherAttendance {
  id?: number;
  employeeId: number;
  employeeName?: string;
  employeeEmail?: string;
  departmentName?: string;
  attendanceDate: string;
  attendanceStatus: AttendanceStatus;
  reason?: string;
  remarks?: string;
  markedBy?: string;
  lastModifiedBy?: string;
}

export interface SchoolHoliday {
  id?: number;
  date: string;
  name: string;
  description?: string;
  type: HolidayType;
}

export interface BulkAttendanceRequest {
  date: string;
  attendanceRecords: {
    employeeId: number;
    status: string;
    reason?: string;
  }[];
}

export interface AttendanceStats {
  employeeId: number;
  employeeName: string;
  department: string;
  startDate: string;
  endDate: string;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  attendancePercentage: string;
  datesByStatus: Record<string, string[]>;
}

export interface MonthlyAttendanceReport {
  year: number;
  month: number;
  monthName: string;
  startDate: string;
  endDate: string;
  totalWorkingDays: number;
  employeeSummaries: {
    employeeId: number;
    employeeName: string;
    department: string;
    presentDays: number;
    halfDays: number;
    absentDays: number;
    leaveDays: number;
    attendancePercentage: string;
    dailyStatus: Record<string, string>;
  }[];
}

export const teacherAttendanceService = {
  // Teacher Attendance API Calls
  getAttendanceByDate: (date: string) => {
    return api.get<TeacherAttendance[]>(`/api/hrm/teacher-attendance/date/${date}`);
  },

  getAttendanceByDateRange: (startDate: string, endDate: string) => {
    return api.get<TeacherAttendance[]>(`/api/hrm/teacher-attendance/range?startDate=${startDate}&endDate=${endDate}`);
  },

  getAttendanceByEmployee: (employeeId: number) => {
    return api.get<TeacherAttendance[]>(`/api/hrm/teacher-attendance/employee/${employeeId}`);
  },

  getAttendanceByEmployeeAndDateRange: (employeeId: number, startDate: string, endDate: string) => {
    return api.get<TeacherAttendance[]>(
      `/api/hrm/teacher-attendance/employee/${employeeId}/range?startDate=${startDate}&endDate=${endDate}`
    );
  },

  markAttendance: (attendance: TeacherAttendance) => {
    return api.post<TeacherAttendance>('/api/hrm/teacher-attendance', attendance);
  },

  updateAttendance: (id: number, attendance: TeacherAttendance) => {
    return api.put<TeacherAttendance>(`/api/hrm/teacher-attendance/${id}`, attendance);
  },

  deleteAttendance: (id: number) => {
    return api.delete(`/api/hrm/teacher-attendance/${id}`);
  },
  markBulkAttendance: (bulkRequest: BulkAttendanceRequest) => {
    return api.post<TeacherAttendance[]>('/api/hrm/teacher-attendance/bulk', bulkRequest);
  },  uploadAttendanceFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // TypeScript expects a single object with data and config parameters
    return api.post('/api/hrm/teacher-attendance/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  downloadAttendanceTemplate: () => {
    return api.get('/api/hrm/teacher-attendance/template', {
      responseType: 'blob'
    });
  },

  getAttendanceStats: (employeeId: number, startDate: string, endDate: string) => {
    return api.get<AttendanceStats>(
      `/api/hrm/teacher-attendance/stats/employee/${employeeId}?startDate=${startDate}&endDate=${endDate}`
    );
  },

  getAttendanceOverview: (startDate: string, endDate: string) => {
    return api.get(`/api/hrm/teacher-attendance/overview?startDate=${startDate}&endDate=${endDate}`);
  },

  getMonthlyAttendanceReport: (year: number, month: number) => {
    return api.get<MonthlyAttendanceReport>(`/api/hrm/teacher-attendance/report/monthly?year=${year}&month=${month}`);
  },

  getCurrentMonthAttendance: () => {
    return api.get<MonthlyAttendanceReport>('/api/hrm/teacher-attendance/current-month');
  },

  getAttendanceStatusTypes: () => {
    return api.get<AttendanceStatus[]>('/api/hrm/teacher-attendance/status-types');
  },

  // Holiday API Calls
  getAllHolidays: () => {
    return api.get<SchoolHoliday[]>('/api/hrm/holidays');
  },

  getHolidaysByDateRange: (startDate: string, endDate: string) => {
    return api.get<SchoolHoliday[]>(`/api/hrm/holidays/range?startDate=${startDate}&endDate=${endDate}`);
  },

  getHolidayById: (id: number) => {
    return api.get<SchoolHoliday>(`/api/hrm/holidays/${id}`);
  },

  getHolidayByDate: (date: string) => {
    return api.get<SchoolHoliday>(`/api/hrm/holidays/date/${date}`);
  },

  addHoliday: (holiday: SchoolHoliday) => {
    return api.post<SchoolHoliday>('/api/hrm/holidays', holiday);
  },

  updateHoliday: (id: number, holiday: SchoolHoliday) => {
    return api.put<SchoolHoliday>(`/api/hrm/holidays/${id}`, holiday);
  },

  deleteHoliday: (id: number) => {
    return api.delete(`/api/hrm/holidays/${id}`);
  },

  getHolidaysCalendar: (year: number) => {
    return api.get(`/api/hrm/holidays/calendar/${year}`);
  },

  addDefaultHolidays: (year: number) => {
    return api.post<SchoolHoliday[]>(`/api/hrm/holidays/default-holidays/${year}`);
  },

  checkIfHoliday: (date: string) => {
    return api.get(`/api/hrm/holidays/check?date=${date}`);
  },

  getHolidayTypes: () => {
    return api.get<HolidayType[]>('/api/hrm/holidays/holiday-types');
  }
};
