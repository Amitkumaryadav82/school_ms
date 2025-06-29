import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { EmployeeAttendanceDTO, employeeAttendanceService, EmployeeAttendanceStatus } from '../../services/employeeAttendanceService';
import { staffService } from '../../services/staffService';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import { useNotification } from '../../context/NotificationContext';

interface AttendanceWeeklyEditProps {
  employeeId: number;
  startDate: string;
  endDate: string;
}

const AttendanceWeeklyEdit: React.FC<AttendanceWeeklyEditProps> = ({
  employeeId,
  startDate,
  endDate
}) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isAuthenticated, logout } = useAuth();
  const [attendanceData, setAttendanceData] = useState<Record<string, EmployeeAttendanceDTO>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Check authentication status when component mounts, but don't log out if not authenticated
  // Instead, try to silently refresh the token
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        try {
          // Try to silently refresh the token instead of immediate logout
          console.log('User not authenticated in AttendanceWeeklyEdit, attempting token refresh');
          
          // Get authService from window to avoid circular imports
          const authService = (window as any).authService;
          if (authService && authService.validateToken) {
            const isValid = await authService.validateToken();
            if (!isValid) {
              console.error('Token refresh failed, redirecting to login');
              logout('expired');
            } else {
              console.log('Token refresh successful');
            }
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
          // Only logout after trying to refresh
          logout('expired');
        }
      }
    };
    
    checkAuth();
  }, [isAuthenticated, logout]);

  // Fetch staff details
  const { data: staffData, error: staffError, loading: staffLoading } = useApi(
    () => staffService.getById(employeeId),
    { dependencies: [employeeId] }
  );

  // Fetch attendance data for the week
  const { data: weeklyAttendance, error: attendanceError, loading: attendanceLoading } = useApi(
    () => employeeAttendanceService.getAttendanceByEmployeeAndDateRange(employeeId, startDate, endDate),
    { dependencies: [employeeId, startDate, endDate] }
  );

  // Fetch holiday data for the week
  const { data: holidayData, error: holidayError, loading: holidayLoading } = useApi(
    () => employeeAttendanceService.getHolidaysByDateRange(startDate, endDate),
    { dependencies: [startDate, endDate] }
  );

  // Initialize attendance data
  React.useEffect(() => {
    if (weeklyAttendance && staffData) {
      const newAttendanceData: Record<string, EmployeeAttendanceDTO> = {};
      
      // Generate dates array for the week
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const daysArray = [];
      
      let current = start;
      while (current.isBefore(end) || current.isSame(end, 'day')) {
        daysArray.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
      }
      
      // Initialize with existing attendance data
      weeklyAttendance.forEach((attendance) => {
        newAttendanceData[attendance.attendanceDate] = attendance;
      });
      
      // Create default entries for days without attendance records
      daysArray.forEach(date => {
        if (!newAttendanceData[date]) {
          const isHoliday = holidayData?.some(h => h.date === date) || false;
          
          newAttendanceData[date] = {
            employeeId: employeeId,
            employeeName: `${staffData.firstName || ''} ${staffData.lastName || ''}`.trim(),
            employeeType: staffData.role?.includes('TEACHER') ? 'TEACHING' : 'NON_TEACHING',
            department: staffData.department || '',
            position: staffData.position || '',
            attendanceDate: date,
            status: isHoliday ? EmployeeAttendanceStatus.HOLIDAY : EmployeeAttendanceStatus.PRESENT,
            reason: ''
          };
        }
      });
      
      setAttendanceData(newAttendanceData);
    }
  }, [weeklyAttendance, staffData, holidayData, employeeId, startDate, endDate]);

  // Save mutations
  const { mutateAsync: markAttendance } = useApiMutation(
    (attendance: EmployeeAttendanceDTO) => employeeAttendanceService.markAttendance(attendance),
    {
      onSuccess: () => {
        showNotification('Attendance saved successfully', 'success');
      },
      onError: (error) => {
        showNotification(`Failed to save attendance: ${error.message}`, 'error');
      }
    }
  );

  const { mutateAsync: updateAttendance } = useApiMutation(
    ({ id, data }: { id: number; data: EmployeeAttendanceDTO }) => 
      employeeAttendanceService.updateAttendance(id, data),
    {
      onSuccess: () => {
        showNotification('Attendance updated successfully', 'success');
      },
      onError: (error) => {
        showNotification(`Failed to update attendance: ${error.message}`, 'error');
      }
    }
  );

  // Handle form field changes
  const handleAttendanceChange = (date: string, field: string, value: any) => {
    setAttendanceData(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value
      }
    }));
  };

  // Save all attendance records
  const saveAllAttendance = async () => {
    setIsLoading(true);
    
    try {
      // Check token validity before saving
      try {
        const authService = (window as any).authService;
        if (authService && authService.validateToken) {
          const isValid = await authService.validateToken();
          if (!isValid) {
            console.log('Token invalid before saving, attempting refresh...');
            // Try to refresh the token before proceeding
            const { refreshToken } = await import('../../services/tokenRefreshService');
            await refreshToken();
          }
        }
      } catch (tokenError) {
        console.warn('Token validation check failed, proceeding with save anyway:', tokenError);
      }
      
      // Process each record
      for (const date in attendanceData) {
        const record = attendanceData[date];
        
        if (record.id) {
          // Update existing record
          await updateAttendance({ id: record.id, data: record });
        } else {
          // Create new record
          await markAttendance(record);
        }
      }
      
      showNotification('All attendance records saved successfully', 'success');
      
      // Use navigate instead of window.location to preserve authentication context
      // And wrap in a setTimeout to ensure notification is seen before navigation
      setTimeout(() => {
        navigate('/staff-attendance');
      }, 500);
    } catch (error) {
      showNotification(`Error saving attendance records: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Check if a date is a holiday
  const isHoliday = (date: string): boolean => {
    return holidayData?.some(holiday => holiday.date === date) || false;
  };

  if (staffLoading || attendanceLoading || holidayLoading) {
    return <Loading />;
  }

  if (staffError || attendanceError || holidayError) {
    return <ErrorMessage message="Failed to load staff or attendance data." />;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Weekly Attendance for {staffData?.firstName} {staffData?.lastName}
          <Typography variant="body2" color="text.secondary">
            {staffData?.department || 'No Department'} • {staffData?.position || 'No Position'}
          </Typography>
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/staff-attendance', { replace: true })}
        >
          Back
        </Button>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Day</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dates.map(date => {
              const record = attendanceData[date];
              const holiday = isHoliday(date);
              
              return (
                <TableRow key={date}>
                  <TableCell>{dayjs(date).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>
                    {dayjs(date).format('ddd, MMM D')}
                    {holiday && <Chip label="Holiday" color="secondary" size="small" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={record?.status || ''}
                        onChange={(e) => handleAttendanceChange(date, 'status', e.target.value)}
                        disabled={holiday}
                      >
                        {Object.values(EmployeeAttendanceStatus).map((status) => (
                          <MenuItem key={status} value={status}>
                            {status.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Reason (if absent/leave)"
                      value={record?.reason || ''}
                      onChange={(e) => handleAttendanceChange(date, 'reason', e.target.value)}
                      disabled={holiday || (record?.status === EmployeeAttendanceStatus.PRESENT)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Save />}
          onClick={saveAllAttendance}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save All Changes'}
        </Button>
      </Box>
    </Paper>
  );
};

export default AttendanceWeeklyEdit;
