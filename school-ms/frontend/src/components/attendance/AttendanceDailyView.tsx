import { Cancel, CheckCircle, Edit, HighlightOff, RemoveCircle, Save } from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    FormControl,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { employeeAttendanceService, EmployeeAttendanceDTO, EmployeeAttendanceStatus } from '../../services/employeeAttendanceService';
import { staffService } from '../../services/staffService';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';

interface AttendanceDailyViewProps {
  date: string;
  isAdmin: boolean;
  staffType?: string;
}

const AttendanceDailyView: React.FC<AttendanceDailyViewProps> = ({ 
  date, 
  isAdmin,
  staffType = 'ALL'
}) => {
  const { showNotification } = useNotification();
  const [editMode, setEditMode] = useState<Record<number, boolean>>({});
  const [attendanceEdits, setAttendanceEdits] = useState<Record<number, any>>({});

  // Fetch staff members based on type
  const { data: staffMembers, error: staffError, loading: staffLoading } = useApi(() => {
    return staffType === 'TEACHING' 
      ? staffService.getActiveTeachers()
      : staffType === 'NON_TEACHING'
        ? staffService.getNonTeachingStaff() 
        : staffService.getAll();
  }, { dependencies: [staffType] });

  // Fetch attendance data
  const { data: attendanceData, error: attendanceError, loading: attendanceLoading, refetch: refetchAttendance } = useApi(() => {
    return employeeAttendanceService.getAttendanceByDate(date, staffType);
  }, { dependencies: [date, staffType] });
  
  // Holiday check
  const { data: holidayCheck } = useApi(() => {
    return employeeAttendanceService.checkIfHoliday(date);
  }, { dependencies: [date] });

  // Apply type assertion to ensure isHoliday property exists
  const isHoliday = holidayCheck ? (holidayCheck as { isHoliday: boolean }).isHoliday : false;

  // Mutations for attendance
  const { mutateAsync: markAttendance } = useApiMutation(
    (attendance: EmployeeAttendanceDTO) => employeeAttendanceService.markAttendance(attendance),
    {
      onSuccess: () => {
        showNotification('Attendance marked successfully', 'success');
        refetchAttendance();
      },
      onError: (error) => {
        showNotification(`Error marking attendance: ${error.message}`, 'error');
      }
    }
  );

  const { mutateAsync: updateAttendance } = useApiMutation(
    ({ id, data }: { id: number; data: EmployeeAttendanceDTO }) => 
      employeeAttendanceService.updateAttendance(id, data),
    {
      onSuccess: () => {
        showNotification('Attendance updated successfully', 'success');
        refetchAttendance();
      },
      onError: (error) => {
        showNotification(`Error updating attendance: ${error.message}`, 'error');
      }
    }
  );

  // Prepare attendance map for easy lookup
  const attendanceMap = React.useMemo(() => {
    const map: Record<number, any> = {};
    if (attendanceData) {
      attendanceData.forEach((attendance: any) => {
        if (attendance.employeeId) {
          map[attendance.employeeId] = attendance;
        }
      });
    }
    return map;
  }, [attendanceData]);

  // Toggle edit mode for a specific row
  const toggleEditMode = (memberId: number, attendanceRecord?: any) => {
    setEditMode(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));

    // Initialize edit form with current data or defaults
    if (!editMode[memberId] && attendanceRecord) {
      setAttendanceEdits(prev => ({
        ...prev,
        [memberId]: { ...attendanceRecord }
      }));
    } else if (!editMode[memberId]) {
      const employee = staffMembers?.find((staff: any) => staff.id === memberId);
      const employeeType = employee?.role?.includes('TEACHER') ? 'TEACHING' : 'NON_TEACHING';
      
      const defaultAttendance: EmployeeAttendanceDTO = {
        employeeId: memberId,
        employeeName: `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim(),
        employeeType: employeeType,
        department: employee?.department || '',
        position: employee?.position || '',
        attendanceDate: date,
        status: isHoliday ? EmployeeAttendanceStatus.HOLIDAY : EmployeeAttendanceStatus.PRESENT
      };
      
      setAttendanceEdits(prev => ({
        ...prev,
        [memberId]: defaultAttendance
      }));
    }
  };

  // Handle form field changes
  const handleAttendanceChange = (memberId: number, field: string, value: any) => {
    setAttendanceEdits(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));
  };

  // Save attendance record
  const saveAttendance = async (memberId: number) => {
    const attendanceRecord = attendanceEdits[memberId];
    
    if (!attendanceRecord) return;
    
    try {
      if (attendanceRecord.id) {
        await updateAttendance({ id: attendanceRecord.id, data: attendanceRecord });
      } else {
        await markAttendance(attendanceRecord);
      }
      
      // Exit edit mode
      toggleEditMode(memberId);
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  // Get status color
  const getStatusColor = (status: string | undefined) => {
    const statusMap: Record<string, string> = {
      'PRESENT': 'success',
      'ABSENT': 'error',
      'HALF_DAY': 'warning',
      'ON_LEAVE': 'info',
      'HOLIDAY': 'secondary'
    };
    return status ? statusMap[status] || 'default' : 'default';
  };

  // Get status icon
  const getStatusIcon = (status: string | undefined): React.ReactElement | undefined => {
    const iconMap: Record<string, React.ReactElement> = {
      'PRESENT': <CheckCircle fontSize="small" />,
      'ABSENT': <HighlightOff fontSize="small" />,
      'HALF_DAY': <RemoveCircle fontSize="small" />,
      'ON_LEAVE': <Cancel fontSize="small" />
    };
    
    return status ? iconMap[status] : undefined;
  };

  if (staffLoading || attendanceLoading) {
    return <Loading />;
  }

  if (staffError) {
    return <ErrorMessage message="Failed to load staff data." />;
  }

  if (attendanceError) {
    return <ErrorMessage message="Failed to load attendance data." />;
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          Daily Attendance {isHoliday && <Chip label="Holiday" color="secondary" size="small" sx={{ ml: 1 }} />}
        </Typography>
        
        {isAdmin && (
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => {
              // Mark all employees as present by default
              staffMembers?.forEach((employee: any) => {
                if (!attendanceMap[employee.id!]) {
                  const employeeType = employee?.role?.includes('TEACHER') ? 'TEACHING' : 'NON_TEACHING';
                  markAttendance({
                    employeeId: employee.id!,
                    employeeName: `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim(),
                    employeeType: employeeType,
                    department: employee?.department || '',
                    position: employee?.position || '',
                    attendanceDate: date,
                    status: isHoliday ? EmployeeAttendanceStatus.HOLIDAY : EmployeeAttendanceStatus.PRESENT
                  });
                }
              });
            }}
          >
            Mark All Present
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Staff ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              {isAdmin && <TableCell align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {staffMembers && staffMembers.length > 0 ? (
              staffMembers.map((employee: any) => {
                const attendanceRecord = attendanceMap[employee.id!];
                const isEditing = editMode[employee.id!] || false;
                
                return (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.staffId || employee.employeeId}</TableCell>
                    <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                    <TableCell>{employee.department || 'N/A'}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <FormControl fullWidth size="small">
                          <Select
                            value={attendanceEdits[employee.id!]?.status || ''}
                            onChange={(e) => handleAttendanceChange(employee.id!, 'status', e.target.value)}
                            disabled={isHoliday}
                          >
                            {Object.values(EmployeeAttendanceStatus).map((status) => (
                              <MenuItem key={status} value={status}>
                                {status.replace('_', ' ')}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <Chip 
                          icon={getStatusIcon(attendanceRecord?.status)}
                          label={attendanceRecord?.status?.replace('_', ' ') || 'Not Marked'} 
                          color={getStatusColor(attendanceRecord?.status) as any}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Reason (if absent/leave)"
                          value={attendanceEdits[employee.id!]?.reason || ''}
                          onChange={(e) => handleAttendanceChange(employee.id!, 'reason', e.target.value)}
                        />
                      ) : (
                        attendanceRecord?.reason || '-'
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="center">
                        {isEditing ? (
                          <>
                            <Tooltip title="Save">
                              <IconButton 
                                color="success" 
                                size="small"
                                onClick={() => saveAttendance(employee.id!)}
                              >
                                <Save />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton 
                                color="error" 
                                size="small"
                                onClick={() => toggleEditMode(employee.id!)}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title={attendanceRecord ? "Edit Attendance" : "Mark Attendance"}>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => toggleEditMode(employee.id!, attendanceRecord)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No staff members found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceDailyView;
