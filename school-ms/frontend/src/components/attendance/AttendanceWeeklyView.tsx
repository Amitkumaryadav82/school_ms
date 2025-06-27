import { Cancel, CheckCircle, Edit, HighlightOff, RemoveCircle } from '@mui/icons-material';
import {
    Box,
    Chip,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { useApi } from '../../hooks/useApi';
import { EmployeeAttendanceDTO, employeeAttendanceService, EmployeeAttendanceStatus } from '../../services/employeeAttendanceService';
import { staffService } from '../../services/staffService';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';

interface AttendanceWeeklyViewProps {
  startDate: string;
  endDate: string;
  isAdmin: boolean;
}

const AttendanceWeeklyView: React.FC<AttendanceWeeklyViewProps> = ({ startDate, endDate, isAdmin }) => {
  // Fetch teachers and attendance data
  const { data: teachers, error: teachersError, loading: teachersLoading } = useApi(() => 
    staffService.getActiveTeachers()
  );
  const { data: attendanceData, error: attendanceError, loading: attendanceLoading } = useApi(() => 
    employeeAttendanceService.getAttendanceByDateRange(startDate, endDate)
  , { dependencies: [startDate, endDate] });
  // Fetch holiday data for the week
  const { data: holidayData, error: holidayError, loading: holidayLoading } = useApi(() => 
    employeeAttendanceService.getHolidaysByDateRange(startDate, endDate)
  , { dependencies: [startDate, endDate] });

  // Generate dates array for the week
  const dates = React.useMemo(() => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const daysArray = [];
    
    let current = start;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      daysArray.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }
    
    return daysArray;
  }, [startDate, endDate]);

  // Prepare attendance map for each employee and date
  const attendanceMap = React.useMemo(() => {
    const map: Record<number, Record<string, EmployeeAttendanceDTO>> = {};
    
    attendanceData?.forEach((attendance) => {
      if (!map[attendance.employeeId]) {
        map[attendance.employeeId] = {};
      }
      map[attendance.employeeId][attendance.attendanceDate] = attendance;
    });
    
    return map;
  }, [attendanceData]);

  // Prepare holiday map
  const holidayMap = React.useMemo(() => {
    const map: Record<string, boolean> = {};
    
    holidayData?.forEach((holiday) => {
      map[holiday.date] = true;
    });
    
    return map;
  }, [holidayData]);

  // Get status color
  const getStatusColor = (status: EmployeeAttendanceStatus | undefined) => {
    switch (status) {
      case EmployeeAttendanceStatus.PRESENT: return 'success';
      case EmployeeAttendanceStatus.ABSENT: return 'error';
      case EmployeeAttendanceStatus.HALF_DAY: return 'warning';
      case EmployeeAttendanceStatus.ON_LEAVE: return 'info';
      case EmployeeAttendanceStatus.HOLIDAY: return 'secondary';
      default: return 'default';
    }
  };
  // Get status icon
  const getStatusIcon = (status: EmployeeAttendanceStatus | undefined): React.ReactElement | undefined => {
    switch (status) {
      case EmployeeAttendanceStatus.PRESENT: return <CheckCircle fontSize="small" />;
      case EmployeeAttendanceStatus.ABSENT: return <HighlightOff fontSize="small" />;
      case EmployeeAttendanceStatus.HALF_DAY: return <RemoveCircle fontSize="small" />;
      case EmployeeAttendanceStatus.ON_LEAVE: return <Cancel fontSize="small" />;
      case EmployeeAttendanceStatus.HOLIDAY:
      default:
        return undefined;
    }
  };

  if (teachersLoading || attendanceLoading || holidayLoading) {
    return <Loading />;
  }

  if (teachersError || attendanceError || holidayError) {
    return <ErrorMessage message="Failed to load attendance data." />;
  }

  return (
    <Box>
      <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
        Weekly Attendance View
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Staff ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
              {dates.map((date) => (
                <TableCell key={date} align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                  {dayjs(date).format('ddd, MMM D')}
                  {holidayMap[date] && (
                    <Chip 
                      label="Holiday" 
                      color="secondary" 
                      size="small" 
                      sx={{ ml: 0.5, mt: 0.5 }} 
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers && teachers.length > 0 ? (
              teachers.map((teacher: any) => (
                <TableRow key={teacher.id}>
                  <TableCell>{teacher.staffId}</TableCell>
                  <TableCell>{teacher.firstName} {teacher.lastName}</TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  
                  {dates.map((date) => {
                    const attendance = teacher.id && attendanceMap[teacher.id] 
                      ? attendanceMap[teacher.id][date] 
                      : undefined;
                    
                    return (
                      <TableCell key={`${teacher.id}-${date}`} align="center">
                        {attendance ? (
                          <Box>
                            <Chip 
                              icon={getStatusIcon(attendance.status)}
                              label={attendance.status?.replace('_', ' ') || 'Not Marked'} 
                              color={getStatusColor(attendance.status) as any}
                              size="small"
                            />
                            {isAdmin && (
                              <Tooltip title="Edit Attendance">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    // This would open an edit dialog/modal in a complete implementation
                                    window.location.href = `/teacher-attendance?date=${date}&employeeId=${teacher.id}`;
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        ) : holidayMap[date] ? (
                          <Chip 
                            label="Holiday" 
                            color="secondary" 
                            size="small" 
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not Marked
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3 + dates.length} align="center">
                  No teachers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceWeeklyView;
