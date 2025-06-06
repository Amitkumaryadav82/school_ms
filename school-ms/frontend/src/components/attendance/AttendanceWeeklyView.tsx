import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { Edit, CheckCircle, HighlightOff, RemoveCircle, Cancel } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useApi } from '../../hooks/useApi';
import { teacherAttendanceService, TeacherAttendance, AttendanceStatus } from '../../services/teacherAttendanceService';
import { staffService } from '../../services/staffService';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';

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
    teacherAttendanceService.getAttendanceByDateRange(startDate, endDate)
  , { dependencies: [startDate, endDate] });
  // Fetch holiday data for the week
  const { data: holidayData, error: holidayError, loading: holidayLoading } = useApi(() => 
    teacherAttendanceService.getHolidaysByDateRange(startDate, endDate)
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
    const map: Record<number, Record<string, TeacherAttendance>> = {};
    
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
  const getStatusColor = (status: AttendanceStatus | undefined) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'success';
      case AttendanceStatus.ABSENT: return 'error';
      case AttendanceStatus.HALF_DAY: return 'warning';
      case AttendanceStatus.ON_LEAVE: return 'info';
      case AttendanceStatus.HOLIDAY: return 'secondary';
      default: return 'default';
    }
  };
  // Get status icon
  const getStatusIcon = (status: AttendanceStatus | undefined): React.ReactElement | undefined => {
    switch (status) {
      case AttendanceStatus.PRESENT: return <CheckCircle fontSize="small" />;
      case AttendanceStatus.ABSENT: return <HighlightOff fontSize="small" />;
      case AttendanceStatus.HALF_DAY: return <RemoveCircle fontSize="small" />;
      case AttendanceStatus.ON_LEAVE: return <Cancel fontSize="small" />;
      case AttendanceStatus.HOLIDAY:
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
                              icon={getStatusIcon(attendance.attendanceStatus)}
                              label={attendance.attendanceStatus?.replace('_', ' ') || 'Not Marked'} 
                              color={getStatusColor(attendance.attendanceStatus) as any}
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
