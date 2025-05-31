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
  Button,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { Save, Edit, Cancel, CheckCircle, HighlightOff, RemoveCircle } from '@mui/icons-material';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { teacherAttendanceService, TeacherAttendance, AttendanceStatus } from '../../services/teacherAttendanceService';
import { staffService } from '../../services/staffService';
import { useNotification } from '../../context/NotificationContext';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';

interface AttendanceDailyViewProps {
  date: string;
  isAdmin: boolean;
}

const AttendanceDailyView: React.FC<AttendanceDailyViewProps> = ({ date, isAdmin }) => {
  const { showNotification } = useNotification();
  const [editMode, setEditMode] = useState<Record<number, boolean>>({});
  const [attendanceEdits, setAttendanceEdits] = useState<Record<number, TeacherAttendance>>({});

  // Fetch teachers and attendance data
  const { data: teachers, error: teachersError, loading: teachersLoading } = useApi(() => 
    staffService.getActiveTeachers()
  );
  const { data: attendanceData, error: attendanceError, loading: attendanceLoading, refetch: refetchAttendance } = useApi(() => 
    teacherAttendanceService.getAttendanceByDate(date)
  , { dependencies: [date] });
  // Holiday check
  const { data: holidayCheck } = useApi(() => 
    teacherAttendanceService.checkIfHoliday(date)
  , { dependencies: [date] });

  // Apply type assertion to ensure isHoliday property exists
  const isHoliday = holidayCheck ? (holidayCheck as { isHoliday: boolean }).isHoliday : false;

  // Mutations
  const { mutateAsync: markAttendance } = useApiMutation(
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

  const { mutateAsync: updateAttendance } = useApiMutation(
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
    const map: Record<number, TeacherAttendance> = {};
    attendanceData?.forEach((attendance) => {
      if (attendance.employeeId) {
        map[attendance.employeeId] = attendance;
      }
    });
    return map;
  }, [attendanceData]);

  // Toggle edit mode for a specific row
  const toggleEditMode = (employeeId: number, attendanceRecord?: TeacherAttendance) => {
    setEditMode(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));

    // Initialize edit form with current data or defaults
    if (!editMode[employeeId] && attendanceRecord) {
      setAttendanceEdits(prev => ({
        ...prev,
        [employeeId]: { ...attendanceRecord }
      }));
    } else if (!editMode[employeeId]) {
      const defaultAttendance: TeacherAttendance = {
        employeeId,
        attendanceDate: date,
        attendanceStatus: isHoliday ? AttendanceStatus.HOLIDAY : AttendanceStatus.PRESENT
      };
      setAttendanceEdits(prev => ({
        ...prev,
        [employeeId]: defaultAttendance
      }));
    }
  };

  // Handle form field changes
  const handleAttendanceChange = (employeeId: number, field: keyof TeacherAttendance, value: any) => {
    setAttendanceEdits(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value
      }
    }));
  };

  // Save attendance record
  const saveAttendance = async (employeeId: number) => {
    const attendanceRecord = attendanceEdits[employeeId];
    
    if (!attendanceRecord) return;
    
    try {
      if (attendanceRecord.id) {
        // Update existing record
        await updateAttendance({ id: attendanceRecord.id, data: attendanceRecord });
      } else {
        // Create new record
        await markAttendance(attendanceRecord);
      }
      
      // Exit edit mode
      toggleEditMode(employeeId);
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

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

  if (teachersLoading || attendanceLoading) {
    return <Loading />;
  }

  if (teachersError) {
    return <ErrorMessage message="Failed to load teachers data." />;
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
