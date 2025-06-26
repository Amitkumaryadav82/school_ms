import { api } from './api';

export enum StaffAttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
  HOLIDAY = 'HOLIDAY'
}

export interface StaffAttendanceDTO {
  id?: number;
  staffId: number;
  staffName?: string;
  attendanceDate: string;
  status: StaffAttendanceStatus;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BulkStaffAttendanceRequest {
  attendanceDate: string;
  staffAttendanceMap: Record<number, StaffAttendanceStatus>;
  note?: string;
}

const staffAttendanceService = {
  // Staff Attendance API calls
  createStaffAttendance: (attendance: StaffAttendanceDTO) => {
    return api.post<StaffAttendanceDTO>('/api/staff-attendance', attendance);
  },

  createBulkStaffAttendance: (bulkRequest: BulkStaffAttendanceRequest) => {
    return api.post<StaffAttendanceDTO[]>('/api/staff-attendance/bulk', bulkRequest);
  },
  
  // Holiday check for staff attendance
  checkIfHoliday: (date: string) => {
    return api.get(`/api/hrm/holidays/check?date=${date}`);
  },

  getStaffAttendanceByDate: (date: string) => {
    return api.get<StaffAttendanceDTO[]>(`/api/staff-attendance/date/${date}`);
  },

  getStaffAttendanceByStaffId: (staffId: number) => {
    return api.get<StaffAttendanceDTO[]>(`/api/staff-attendance/staff/${staffId}`);
  },

  getStaffAttendanceByStaffIdAndDate: (staffId: number, date: string) => {
    return api.get<StaffAttendanceDTO>(`/api/staff-attendance/staff/${staffId}/date/${date}`);
  },

  getStaffAttendanceByDateRange: (startDate: string, endDate: string) => {
    return api.get<StaffAttendanceDTO[]>(
      `/api/staff-attendance/date-range?startDate=${startDate}&endDate=${endDate}`
    );
  },

  getStaffAttendanceByStaffIdAndDateRange: (staffId: number, startDate: string, endDate: string) => {
    return api.get<StaffAttendanceDTO[]>(
      `/api/staff-attendance/staff/${staffId}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
  },

  updateStaffAttendance: (id: number, attendance: StaffAttendanceDTO) => {
    return api.put<StaffAttendanceDTO>(`/api/staff-attendance/${id}`, attendance);
  },

  deleteStaffAttendance: (id: number) => {
    return api.delete(`/api/staff-attendance/${id}`);
  },

  getAttendanceStatusTypes: () => {
    return api.get<StaffAttendanceStatus[]>('/api/staff-attendance/statuses');
  }
};

export { staffAttendanceService };
