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
import { StaffAttendanceDTO, staffAttendanceService, StaffAttendanceStatus } from '../../services/staffAttendanceService';
import { staffService } from '../../services/staffService';
import { AttendanceStatus, TeacherAttendance, teacherAttendanceService } from '../../services/teacherAttendanceService';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';

interface AttendanceDailyViewProps {
  date: string;
  isAdmin: boolean;
  staffType?: string;
  attendanceService?: 'teacher' | 'staff';
}

const AttendanceDailyView: React.FC<AttendanceDailyViewProps> = ({ 
  date, 
  isAdmin,
  staffType = 'ALL',
  attendanceService = 'teacher'
}) => {
  const { showNotification } = useNotification();
  const [editMode, setEditMode] = useState<Record<number, boolean>>({});
  const [attendanceEdits, setAttendanceEdits] = useState<Record<number, any>>({});

  // Determine which service to use
  const useStaffAttendance = attendanceService === 'staff';

  // Fetch staff members based on type
  const { data: staffMembers, error: staffError, loading: staffLoading } = useApi(() => {
    if (useStaffAttendance) {
      return staffType === 'TEACHING' 
        ? staffService.getActiveTeachers()
        : staffType === 'NON_TEACHING'
          ? staffService.getNonTeachingStaff() 
          : staffService.getAllStaff();
    } else {
      return staffService.getActiveTeachers();
    }
  }, { dependencies: [staffType, attendanceService] });

  // Fetch attendance data
  const { data: attendanceData, error: attendanceError, loading: attendanceLoading, refetch: refetchAttendance } = useApi(() => {
    if (useStaffAttendance) {
      return staffAttendanceService.getStaffAttendanceByDate(date);
    } else {
      return teacherAttendanceService.getAttendanceByDate(date);
    }
  }, { dependencies: [date, attendanceService] });
  // Holiday check - use the appropriate service based on the attendanceService
  const { data: holidayCheck } = useApi(() => {
    // Use the appropriate service based on the attendanceService prop
    const service = attendanceService === 'staff' ? staffAttendanceService : teacherAttendanceService;
    return service.checkIfHoliday(date);
  }, { dependencies: [date, attendanceService] });

  // Apply type assertion to ensure isHoliday property exists
  const isHoliday = holidayCheck ? (holidayCheck as { isHoliday: boolean }).isHoliday : false;

  // Mutations for staff attendance
  const { mutateAsync: markStaffAttendance } = useApiMutation(
    (attendance: StaffAttendanceDTO) => staffAttendanceService.createStaffAttendance(attendance),
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

  const { mutateAsync: updateStaffAttendance } = useApiMutation(
    ({ id, data }: { id: number; data: StaffAttendanceDTO }) => 
      staffAttendanceService.updateStaffAttendance(id, data),
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

  // Mutations for teacher attendance
  const { mutateAsync: markTeacherAttendance } = useApiMutation(
    (attendance: TeacherAttendance) => teacherAttendanceService.markAttendance(attendance),
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

  const { mutateAsync: updateTeacherAttendance } = useApiMutation(
    ({ id, data }: { id: number; data: TeacherAttendance }) => 
      teacherAttendanceService.updateAttendance(id, data),
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
        const id = useStaffAttendance ? attendance.staffId : attendance.employeeId;
        if (id) {
          map[id] = attendance;
        }
      });
    }
    return map;
  }, [attendanceData, useStaffAttendance]);

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
      if (useStaffAttendance) {
        const defaultAttendance: StaffAttendanceDTO = {
          staffId: memberId,
          attendanceDate: date,
          status: isHoliday ? StaffAttendanceStatus.HOLIDAY : StaffAttendanceStatus.PRESENT
        };
        setAttendanceEdits(prev => ({
          ...prev,
          [memberId]: defaultAttendance
        }));
      } else {
        const defaultAttendance: TeacherAttendance = {
          employeeId: memberId,
          attendanceDate: date,
          attendanceStatus: isHoliday ? AttendanceStatus.HOLIDAY : AttendanceStatus.PRESENT
        };
        setAttendanceEdits(prev => ({
          ...prev,
          [memberId]: defaultAttendance
        }));
      }
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
      if (useStaffAttendance) {
        if (attendanceRecord.id) {
          await updateStaffAttendance({ id: attendanceRecord.id, data: attendanceRecord });
        } else {
          await markStaffAttendance(attendanceRecord);
        }
      } else {
        if (attendanceRecord.id) {
          await updateTeacherAttendance({ id: attendanceRecord.id, data: attendanceRecord });
        } else {
          await markTeacherAttendance(attendanceRecord);
        }
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
              // Mark all teachers as present by default
              teachers?.forEach((teacher: any) => {
                if (!attendanceMap[teacher.id!]) {
                  markAttendance({
                    employeeId: teacher.id!,
                    attendanceDate: date,
                    attendanceStatus: isHoliday ? AttendanceStatus.HOLIDAY : AttendanceStatus.PRESENT
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
            {teachers && teachers.length > 0 ? (
              teachers.map((teacher: any) => {
                const attendanceRecord = attendanceMap[teacher.id!];
                const isEditing = editMode[teacher.id!] || false;
                
                return (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.staffId}</TableCell>
                    <TableCell>{teacher.firstName} {teacher.lastName}</TableCell>
                    <TableCell>{teacher.department || 'N/A'}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <FormControl fullWidth size="small">
                          <Select
                            value={attendanceEdits[teacher.id!]?.attendanceStatus || ''}
                            onChange={(e) => handleAttendanceChange(teacher.id!, 'attendanceStatus', e.target.value)}
                            disabled={isHoliday}
                          >
                            {Object.values(AttendanceStatus).map((status) => (
                              <MenuItem key={status} value={status}>
                                {status.replace('_', ' ')}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <Chip 
                          icon={getStatusIcon(attendanceRecord?.attendanceStatus)}
                          label={attendanceRecord?.attendanceStatus?.replace('_', ' ') || 'Not Marked'} 
                          color={getStatusColor(attendanceRecord?.attendanceStatus) as any}
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
                          value={attendanceEdits[teacher.id!]?.reason || ''}
                          onChange={(e) => handleAttendanceChange(teacher.id!, 'reason', e.target.value)}
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
                                onClick={() => saveAttendance(teacher.id!)}
                              >
                                <Save />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton 
                                color="error" 
                                size="small"
                                onClick={() => toggleEditMode(teacher.id!)}
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
                              onClick={() => toggleEditMode(teacher.id!, attendanceRecord)}
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
                <TableCell colSpan={6} align="center">No teachers found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceDailyView;
