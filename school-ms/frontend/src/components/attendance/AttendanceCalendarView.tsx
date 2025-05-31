import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Badge,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Event as EventIcon,
  InfoOutlined,
  Add,
  Edit,
  Close
} from '@mui/icons-material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { teacherAttendanceService, TeacherAttendance, AttendanceStatus, SchoolHoliday, HolidayType } from '../../services/teacherAttendanceService';
import { useNotification } from '../../context/NotificationContext';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';

interface CalendarDayInfo {
  date: string;
  isHoliday: boolean;
  holidayName?: string;
  totalTeachers: number;
  present: number;
  absent: number;
  onLeave: number;
  halfDay: number;
  attendancePercentage: number;
}

const AttendanceCalendarView: React.FC = () => {
  const { showNotification } = useNotification();
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [calendarData, setCalendarData] = useState<Record<string, CalendarDayInfo>>({});
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState<Partial<SchoolHoliday>>({
    date: '',
    name: '',
    description: '',
    type: HolidayType.SCHOOL_FUNCTION  });

  // API calls
  const { data: holidaysData, loading: holidaysLoading, error: holidaysError, refetch: refetchHolidays } = useApi(
    () => teacherAttendanceService.getHolidaysByDateRange(
      selectedMonth.startOf('month').format('YYYY-MM-DD'),
      selectedMonth.endOf('month').format('YYYY-MM-DD')
    ),
    {
      dependencies: [selectedMonth]
    }
  );
  const { data: attendanceData, loading: attendanceLoading, error: attendanceError } = useApi(
    () => teacherAttendanceService.getAttendanceByDateRange(
      selectedMonth.startOf('month').format('YYYY-MM-DD'),
      selectedMonth.endOf('month').format('YYYY-MM-DD')
    ),
    {
      dependencies: [selectedMonth]
    }
  );
  const { data: teachersData, loading: teachersLoading, error: teachersError } = useApi(
    () => teacherAttendanceService.getMonthlyAttendanceReport(
      selectedMonth.year(), 
      selectedMonth.month() + 1
    ),
    {
      dependencies: [selectedMonth]
    }
  );

  // Mutations
  const { mutateAsync: addHoliday } = useApiMutation(
    (holiday: SchoolHoliday) => teacherAttendanceService.addHoliday(holiday),
    {
      onSuccess: () => {
        showNotification('Holiday added successfully', 'success');
        refetchHolidays();
        setHolidayDialogOpen(false);
      },
      onError: (error) => {
        showNotification(`Failed to add holiday: ${error.message}`, 'error');
      }
    }
  );

  // Process data for calendar
  useEffect(() => {
    if (!attendanceData || !holidaysData || !teachersData) return;

    const totalTeachers = teachersData.employeeSummaries?.length || 0;
    const daysInMonth = selectedMonth.daysInMonth();
    const data: Record<string, CalendarDayInfo> = {};

    // Initialize calendar data for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = selectedMonth.date(day).format('YYYY-MM-DD');
      data[date] = {
        date,
        isHoliday: false,
        totalTeachers,
        present: 0,
        absent: 0,
        onLeave: 0,
        halfDay: 0,
        attendancePercentage: 0
      };
    }

    // Mark holidays
    holidaysData.forEach(holiday => {
      const holidayDate = holiday.date;
      if (data[holidayDate]) {
        data[holidayDate].isHoliday = true;
        data[holidayDate].holidayName = holiday.name;
      }
    });

    // Process attendance data
    attendanceData.forEach(attendance => {
      const date = attendance.attendanceDate;
      if (data[date]) {
        switch (attendance.attendanceStatus) {
          case AttendanceStatus.PRESENT:
            data[date].present++;
            break;
          case AttendanceStatus.ABSENT:
            data[date].absent++;
            break;
          case AttendanceStatus.HALF_DAY:
            data[date].halfDay++;
            break;
          case AttendanceStatus.ON_LEAVE:
            data[date].onLeave++;
            break;
        }
      }
    });

    // Calculate attendance percentage
    Object.keys(data).forEach(date => {
      const dayData = data[date];
      const effectivePresent = dayData.present + (dayData.halfDay / 2);
      dayData.attendancePercentage = dayData.totalTeachers > 0
        ? Math.round((effectivePresent / dayData.totalTeachers) * 100)
        : 0;
    });

    setCalendarData(data);
  }, [attendanceData, holidaysData, teachersData, selectedMonth]);
  // Handle date selection
  const handleDateChange = (newDateValue: any) => {
    // Cast to Dayjs for MUI DateCalendar compatibility
    const newDate = dayjs(newDateValue);
    setSelectedDate(newDate);
    if (newDate && newDate.isValid()) {
      const formattedDate = newDate.format('YYYY-MM-DD');
      setNewHoliday({
        ...newHoliday,
        date: formattedDate
      });
      
      // Open holiday dialog if the date is not already a holiday
      const dayInfo = calendarData[formattedDate];
      if (dayInfo && !dayInfo.isHoliday) {
        setHolidayDialogOpen(true);
      }
    }
  };

  // Handle holiday dialog save
  const handleSaveHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date || !newHoliday.type) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      await addHoliday(newHoliday as SchoolHoliday);
    } catch (error) {
      console.error('Error adding holiday:', error);
    }
  };

  // Get day class based on attendance percentage and holiday status
  const getDayClass = (date: string) => {
    if (!calendarData[date]) return '';
    
    const dayInfo = calendarData[date];
    
    if (dayInfo.isHoliday) return 'holiday-day';
    
    const percentage = dayInfo.attendancePercentage;
    if (percentage >= 90) return 'high-attendance';
    if (percentage >= 75) return 'medium-attendance';
    if (percentage >= 50) return 'low-attendance';
    return 'critical-attendance';
  };

  // Loading state
  if (holidaysLoading || attendanceLoading || teachersLoading) {
    return <Loading />;
  }

  // Error state
  if (holidaysError || attendanceError || teachersError) {
    return <ErrorMessage message="Failed to load calendar data." />;
  }

  return (
    <Box>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Teacher Attendance Calendar
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>              <DateCalendar
                value={selectedDate}
                onChange={handleDateChange}
                views={['day']}                sx={{
                  width: '100%',
                  '.MuiPickersDay-root.holiday-day': {
                    backgroundColor: 'secondary.light',
                    color: 'secondary.contrastText',
                  },
                  '.MuiPickersDay-root.high-attendance': {
                    backgroundColor: 'success.light',
                    color: 'success.contrastText',
                  },
                  '.MuiPickersDay-root.medium-attendance': {
                    backgroundColor: 'warning.light',
                    color: 'warning.contrastText',
                  },
                  '.MuiPickersDay-root.low-attendance': {
                    backgroundColor: 'error.light',
                    color: 'error.contrastText',
                  },
                  '.MuiPickersDay-root.critical-attendance': {
                    backgroundColor: 'error.main',
                    color: 'error.contrastText',
                  }
                }}
                slotProps={{
                  day: (dayPickerProps: any) => {
                    // Get the date from the props
                    const dateStr = dayjs(dayPickerProps.day).format('YYYY-MM-DD');
                    const dayInfo = calendarData[dateStr];
                    
                    // Apply CSS class based on the date
                    const customClass = dayInfo ? getDayClass(dateStr) : '';
                    
                    // Return props with the className
                    return {
                      ...dayPickerProps,
                      className: `${dayPickerProps.className || ''} ${customClass}`.trim()
                    };
                  }
                }}
              />
            </LocalizationProvider>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Legend
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ bgcolor: 'secondary.light', width: 20, height: 20, mr: 1, borderRadius: 1 }} />
                <Typography variant="body2">Holiday</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ bgcolor: 'success.light', width: 20, height: 20, mr: 1, borderRadius: 1 }} />
                <Typography variant="body2">High Attendance (90-100%)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ bgcolor: 'warning.light', width: 20, height: 20, mr: 1, borderRadius: 1 }} />
                <Typography variant="body2">Medium Attendance (75-89%)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ bgcolor: 'error.light', width: 20, height: 20, mr: 1, borderRadius: 1 }} />
                <Typography variant="body2">Low Attendance (50-74%)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ bgcolor: 'error.main', width: 20, height: 20, mr: 1, borderRadius: 1 }} />
                <Typography variant="body2">Critical Attendance (0-49%)</Typography>
              </Box>
            </Box>

            {selectedDate && calendarData[selectedDate.format('YYYY-MM-DD')] && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedDate.format('MMMM D, YYYY')}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {calendarData[selectedDate.format('YYYY-MM-DD')].isHoliday ? (
                    <Chip 
                      label={calendarData[selectedDate.format('YYYY-MM-DD')].holidayName || 'Holiday'} 
                      color="secondary" 
                      sx={{ mb: 1 }}
                    />
                  ) : (
                    <>
                      <Typography variant="body2">
                        Present: {calendarData[selectedDate.format('YYYY-MM-DD')].present}
                      </Typography>
                      <Typography variant="body2">
                        Absent: {calendarData[selectedDate.format('YYYY-MM-DD')].absent}
                      </Typography>
                      <Typography variant="body2">
                        Half-Day: {calendarData[selectedDate.format('YYYY-MM-DD')].halfDay}
                      </Typography>
                      <Typography variant="body2">
                        On Leave: {calendarData[selectedDate.format('YYYY-MM-DD')].onLeave}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Attendance: {calendarData[selectedDate.format('YYYY-MM-DD')].attendancePercentage}%
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Holiday Dialog */}
      <Dialog open={holidayDialogOpen} onClose={() => setHolidayDialogOpen(false)}>
        <DialogTitle>Add Holiday</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Date"
              value={selectedDate?.format('YYYY-MM-DD') || ''}
              disabled
              fullWidth
            />
            <TextField
              label="Holiday Name"
              value={newHoliday.name || ''}
              onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={newHoliday.description || ''}
              onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Holiday Type</InputLabel>
              <Select
                value={newHoliday.type || ''}
                label="Holiday Type"
                onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value as HolidayType })}
              >
                {Object.values(HolidayType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHolidayDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveHoliday}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceCalendarView;
