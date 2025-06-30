/**
 * Mock data provider for attendance reports when backend API is unavailable
 * This file provides mock implementations of the API calls made in the Reports tab
 */

import dayjs from 'dayjs';

// Define interfaces for our mock data
interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
}

interface AttendanceStats {
  employeeId: number;
  startDate: string;
  endDate: string;
  totalWorkingDays: number;
  presentDays: number;
  halfDays: number;
  leaveDays: number;
  absentDays: number;
  attendancePercentage: number;
  datesByStatus: Record<string, string[]>;
}

// Sample teacher data
export const mockTeachers: Teacher[] = [
  { id: 1, firstName: 'John', lastName: 'Smith', department: 'Science' },
  { id: 2, firstName: 'Mary', lastName: 'Johnson', department: 'Mathematics' },
  { id: 3, firstName: 'Robert', lastName: 'Davis', department: 'English' },
  { id: 4, firstName: 'Sarah', lastName: 'Williams', department: 'History' },
  { id: 5, firstName: 'James', lastName: 'Brown', department: 'Physical Education' },
  { id: 6, firstName: 'Patricia', lastName: 'Miller', department: 'Art' },
  { id: 7, firstName: 'Michael', lastName: 'Wilson', department: 'Computer Science' },
  { id: 8, firstName: 'Jennifer', lastName: 'Moore', department: 'Music' },
  { id: 9, firstName: 'David', lastName: 'Taylor', department: 'Geography' },
  { id: 10, firstName: 'Elizabeth', lastName: 'Anderson', department: 'Languages' }
];

// Mock attendance stats generator
export const generateMockAttendanceStats = (employeeId, startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const daysDiff = end.diff(start, 'day') + 1;
  
  // Generate random but realistic attendance data
  const presentDays = Math.floor(daysDiff * 0.7); // 70% present
  const halfDays = Math.floor(daysDiff * 0.1); // 10% half days
  const leaveDays = Math.floor(daysDiff * 0.1); // 10% leave
  const absentDays = daysDiff - presentDays - halfDays - leaveDays;
  
  // Generate dates by status
  const datesByStatus = {
    PRESENT: [],
    HALF_DAY: [],
    ON_LEAVE: [],
    ABSENT: []
  };
  
  let currentDate = start.clone();
  while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
    // Skip weekends
    if (currentDate.day() !== 0 && currentDate.day() !== 6) {
      // Randomly assign a status
      const random = Math.random();
      if (random < 0.7) {
        datesByStatus.PRESENT.push(currentDate.format('YYYY-MM-DD'));
      } else if (random < 0.8) {
        datesByStatus.HALF_DAY.push(currentDate.format('YYYY-MM-DD'));
      } else if (random < 0.9) {
        datesByStatus.ON_LEAVE.push(currentDate.format('YYYY-MM-DD'));
      } else {
        datesByStatus.ABSENT.push(currentDate.format('YYYY-MM-DD'));
      }
    }
    currentDate = currentDate.add(1, 'day');
  }
  
  return {
    employeeId,
    startDate: startDate,
    endDate: endDate,
    totalWorkingDays: daysDiff,
    presentDays,
    halfDays,
    leaveDays,
    absentDays,
    attendancePercentage: Math.round((presentDays / daysDiff) * 100),
    datesByStatus
  };
};

// Mock monthly report generator
export const generateMockMonthlyReport = (year, month, employeeType) => {
  const startDate = dayjs(`${year}-${month}-01`);
  const endDate = startDate.endOf('month');
  const daysInMonth = endDate.date();
  
  // Filter teachers based on employeeType
  const filteredTeachers = mockTeachers;
  
  // Generate employee summaries
  const employeeSummaries = filteredTeachers.map(teacher => {
    const presentDays = Math.floor(Math.random() * 15) + 10; // 10-25 days
    const absentDays = Math.floor(Math.random() * 5); // 0-5 days
    const halfDays = Math.floor(Math.random() * 3); // 0-3 days
    const leaveDays = Math.floor(Math.random() * 3); // 0-3 days
    
    // Generate daily status
    const dailyStatus = {};
    for (let day = 1; day <= daysInMonth; day++) {
      // Skip weekends
      const currentDate = startDate.date(day);
      if (currentDate.day() === 0 || currentDate.day() === 6) {
        dailyStatus[currentDate.format('YYYY-MM-DD')] = 'WEEKEND';
        continue;
      }
      
      // Random status
      const random = Math.random();
      if (random < 0.7) {
        dailyStatus[currentDate.format('YYYY-MM-DD')] = 'PRESENT';
      } else if (random < 0.8) {
        dailyStatus[currentDate.format('YYYY-MM-DD')] = 'HALF_DAY';
      } else if (random < 0.9) {
        dailyStatus[currentDate.format('YYYY-MM-DD')] = 'ON_LEAVE';
      } else {
        dailyStatus[currentDate.format('YYYY-MM-DD')] = 'ABSENT';
      }
    }
    
    return {
      employeeId: teacher.id,
      employeeName: `${teacher.firstName} ${teacher.lastName}`,
      department: teacher.department,
      presentDays,
      halfDays,
      absentDays,
      leaveDays,
      attendancePercentage: `${Math.round((presentDays / 20) * 100)}`,
      dailyStatus
    };
  });
  
  return {
    year,
    month,
    monthName: startDate.format('MMMM'),
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
    totalWorkingDays: 20, // Approx working days in a month
    employeeSummaries
  };
};

// Mock API implementations
export const mockApi = {
  getActiveTeachers: () => {
    return Promise.resolve(mockTeachers);
  },
  
  getAttendanceStats: (employeeId, startDate, endDate) => {
    return Promise.resolve(generateMockAttendanceStats(employeeId, startDate, endDate));
  },
  
  getMonthlyAttendanceReport: (year, month, employeeType) => {
    return Promise.resolve(generateMockMonthlyReport(year, month, employeeType));
  }
};
