import { api } from './api';

export enum EmployeeAttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
  LATE = 'LATE',
  HOLIDAY = 'HOLIDAY'
}

export enum HolidayType {
  NATIONAL_HOLIDAY = 'NATIONAL_HOLIDAY',
  RELIGIOUS_HOLIDAY = 'RELIGIOUS_HOLIDAY',
  SCHOOL_FUNCTION = 'SCHOOL_FUNCTION',
  OTHER = 'OTHER'
}

export interface EmployeeAttendanceDTO {
  id?: number;
  employeeId: number;
  employeeName?: string;
  employeeEmail?: string;
  department?: string;
  position?: string;
  employeeType?: string; // TEACHING or NON_TEACHING
  attendanceDate: string;
  status: EmployeeAttendanceStatus;
  reason?: string;
  remarks?: string;
  markedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HolidayDTO {
  id?: number;
  date: string;
  name: string;
  description?: string;
  type: HolidayType;
}

export interface BulkAttendanceRequest {
  attendanceDate: string;
  attendanceMap: Record<number, EmployeeAttendanceStatus>;
  remarks?: string;
  employeeType?: string;
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

export const employeeAttendanceService = {
  // Attendance API Calls
  getAttendanceByDate: (date: string, employeeType: string = 'ALL') => {
    return api.get<EmployeeAttendanceDTO[]>(`/api/staff/attendance/employee/date/${date}?employeeType=${employeeType}`);
  },

  getAttendanceByDateRange: (startDate: string, endDate: string, employeeType: string = 'ALL') => {
    return api.get<EmployeeAttendanceDTO[]>(
      `/api/staff/attendance/range?startDate=${startDate}&endDate=${endDate}&employeeType=${employeeType}`
    );
  },

  getAttendanceByEmployee: (employeeId: number) => {
    return api.get<EmployeeAttendanceDTO[]>(`/api/staff/attendance/employee/${employeeId}`);
  },

  getAttendanceByEmployeeAndDateRange: (employeeId: number, startDate: string, endDate: string) => {
    return api.get<EmployeeAttendanceDTO[]>(
      `/api/staff/attendance/employee/${employeeId}/range?startDate=${startDate}&endDate=${endDate}`
    );
  },

  markAttendance: (attendance: EmployeeAttendanceDTO) => {
    return api.post<EmployeeAttendanceDTO>('/api/staff/attendance', attendance);
  },

  updateAttendance: (id: number, attendance: EmployeeAttendanceDTO) => {
    return api.put<EmployeeAttendanceDTO>(`/api/staff/attendance/${id}`, attendance);
  },

  deleteAttendance: (id: number) => {
    return api.delete(`/api/staff/attendance/${id}`);
  },
  
  markBulkAttendance: (bulkRequest: BulkAttendanceRequest) => {
    return api.post<EmployeeAttendanceDTO[]>('/api/staff/attendance/bulk', bulkRequest);
  },  
  
  uploadAttendanceFile: (file: File, employeeType: string = 'ALL') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeType', employeeType);
    
    return api.post('/api/staff/attendance/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  downloadAttendanceTemplate: () => {
    return api.get('/api/staff/attendance/template', {
      responseType: 'blob'
    });
  },

  getAttendanceStats: (employeeId: number, startDate: string, endDate: string) => {
    return api.get(
      `/api/staff/attendance/stats/employee/${employeeId}?startDate=${startDate}&endDate=${endDate}`
    );
  },

  getAttendanceOverview: (startDate: string, endDate: string, employeeType: string = 'ALL') => {
    return api.get(`/api/staff/attendance/overview?startDate=${startDate}&endDate=${endDate}&employeeType=${employeeType}`);
  },

  getMonthlyAttendanceReport: (year: number, month: number, employeeType: string = 'ALL') => {
    return api.get<MonthlyAttendanceReport>(`/api/staff/attendance/report/monthly?year=${year}&month=${month}&employeeType=${employeeType}`);
  },

  getCurrentMonthAttendance: (employeeType: string = 'ALL') => {
    return api.get<MonthlyAttendanceReport>(`/api/staff/attendance/current-month?employeeType=${employeeType}`);
  },

  getAttendanceStatusTypes: () => {
    return api.get<EmployeeAttendanceStatus[]>('/api/staff/attendance/status-types');
  },

  checkIfHoliday: (date: string) => {
    return api.get(`/api/staff/attendance/check-holiday?date=${date}`);
  },

  // Holiday related methods
  getHolidaysCalendar: (year: number) => {
    return api.get<{holidays: Record<string, HolidayDTO[]>, allHolidays: HolidayDTO[]}>(`/api/hrm/holidays/calendar/${year}`);
  },

  getHolidayTypes: () => {
    return api.get<HolidayType[]>('/api/hrm/holidays/holiday-types');
  },

  addHoliday: (holiday: HolidayDTO) => {
    return api.post<HolidayDTO>('/api/hrm/holidays', holiday);
  },

  updateHoliday: (id: number, holiday: HolidayDTO) => {
    return api.put<HolidayDTO>(`/api/hrm/holidays/${id}`, holiday);
  },

  deleteHoliday: (id: number) => {
    return api.delete<void>(`/api/hrm/holidays/${id}`);
  },

  getHolidaysByDateRange: (startDate: string, endDate: string) => {
    return api.get<HolidayDTO[]>(`/api/hrm/holidays/range?startDate=${startDate}&endDate=${endDate}`);
  },

  addDefaultHolidays: (year: number) => {
    return api.post<HolidayDTO[]>(`/api/hrm/holidays/default-holidays/${year}`);
  }
};
