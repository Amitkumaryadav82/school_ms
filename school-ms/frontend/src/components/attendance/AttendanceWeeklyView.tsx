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
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { EmployeeAttendanceDTO, employeeAttendanceService, EmployeeAttendanceStatus } from '../../services/employeeAttendanceService';
import { staffService } from '../../services/staffService';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';

interface AttendanceWeeklyViewProps {
  startDate: string;
  endDate: string;
  isAdmin: boolean;
  staffType?: string;
}

const AttendanceWeeklyView: React.FC<AttendanceWeeklyViewProps> = ({ 
  startDate, 
  endDate, 
  isAdmin,
  staffType = 'ALL'
}) => {
  const navigate = useNavigate();
  
  // Fetch staff based on type (same approach as AttendanceDailyView)
  const { data: staffMembers, error: staffError, loading: staffLoading } = useApi(() => {
    return staffType === 'TEACHING' 
      ? staffService.getActiveTeachers()
      : staffType === 'NON_TEACHING'
        ? staffService.getNonTeachingStaff() 
        : staffService.getAll();
  }, { dependencies: [staffType] });
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

  if (staffLoading || attendanceLoading || holidayLoading) {
    return <Loading />;
  }

  if (staffError || attendanceError || holidayError) {
    return <ErrorMessage message="Failed to load attendance data." />;
  }

  return (
    <Box>
      <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
        Weekly Attendance View
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">              <TableHead>
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
              {isAdmin && <TableCell align="center" sx={{ fontWeight: 'bold', width: 100 }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {staffMembers && staffMembers.length > 0 ? (
              staffMembers.map((staff: any) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.staffId}</TableCell>
                  <TableCell>{staff.firstName} {staff.lastName}</TableCell>
                  <TableCell>{staff.department}</TableCell>
                  
                  {dates.map((date) => {
                    const attendance = staff.id && attendanceMap[staff.id] 
                      ? attendanceMap[staff.id][date] 
                      : undefined;
                    
                    return (
                      <TableCell key={`${staff.id}-${date}`} align="center">
                        {attendance ? (
                          <Chip 
                            icon={getStatusIcon(attendance.status)}
                            label={attendance.status?.replace('_', ' ') || 'Not Marked'} 
                            color={getStatusColor(attendance.status) as any}
                            size="small"
                          />
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
                  
                  {isAdmin && (
                    <TableCell align="center">
                      <Tooltip title="Edit Attendance for Entire Week">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => {
                            // Use React Router navigation to preserve authentication context
                            navigate(`/staff-attendance?startDate=${startDate}&endDate=${endDate}&employeeId=${staff.id}&mode=weekly-edit`);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3 + dates.length} align="center">
                  No staff members found
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
