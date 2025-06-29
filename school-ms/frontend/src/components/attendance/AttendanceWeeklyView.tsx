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
  
  // Fetch all staff instead of doing backend filtering
  const { data: allStaffMembers, error: staffError, loading: staffLoading } = useApi(() => {
    return staffService.getAll();
  }, { dependencies: [staffType] });
  
  // Apply frontend filtering based on staffType
  const staffMembers = React.useMemo(() => {
    if (!allStaffMembers) return [];
    
    if (staffType === 'ALL') return allStaffMembers;
    
    // Teaching staff roles (case-insensitive matching)
    const teachingRoles = ['teacher', 'librarian', 'principal'];
    // Administration staff roles (case-insensitive matching)
    const administrationRoles = ['management', 'admin', 'director', 'supervisor'];
    
    return allStaffMembers.filter(staff => {
      // Get role name regardless of structure (string or object)
      let roleName = '';
      
      if (typeof staff.role === 'string') {
        roleName = staff.role.toLowerCase();
      } else if (staff.role && typeof staff.role === 'object' && 'name' in staff.role) {
        roleName = (staff.role.name || '').toLowerCase();
      } else if (staff.staffRole && typeof staff.staffRole === 'object' && 'name' in staff.staffRole) {
        roleName = (staff.staffRole.name || '').toLowerCase();
      }
      
      // Match based on staffType
      if (staffType === 'TEACHING') {
        return teachingRoles.some(role => roleName.includes(role));
      } else if (staffType === 'NON_TEACHING') {
        return !teachingRoles.some(role => roleName.includes(role));
      } else if (staffType === 'ADMINISTRATION') {
        return administrationRoles.some(role => roleName.includes(role));
      }
      
      return true;
    });
  }, [allStaffMembers, staffType]);
  
  // Add error handling and debug logging for attendance data fetching
  const { data: attendanceData, error: attendanceError, loading: attendanceLoading } = useApi(() => {
    console.log(`Fetching weekly attendance data for date range: ${startDate} to ${endDate}`);
    // Add token validation before fetching attendance data
    return employeeAttendanceService.getAttendanceByDateRange(startDate, endDate);
  }, { 
    dependencies: [startDate, endDate],
    onError: (error) => {
      console.error('Failed to load weekly attendance data:', error);
    },
    onSuccess: (data) => {
      console.log(`Successfully loaded ${data?.length || 0} attendance records for the week`);
    }
  });
  
  // Fetch holiday data for the week
  const { data: holidayData, error: holidayError, loading: holidayLoading } = useApi(() => {
    console.log(`Fetching holiday data for date range: ${startDate} to ${endDate}`);
    return employeeAttendanceService.getHolidaysByDateRange(startDate, endDate);
  }, { 
    dependencies: [startDate, endDate],
    onError: (error) => {
      console.error('Failed to load holiday data:', error);
    },
    onSuccess: (data) => {
      console.log(`Successfully loaded ${data?.length || 0} holidays for the week`);
    }
  });
  
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
