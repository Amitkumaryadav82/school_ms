import {
    CalendarMonth,
    Today,
    ViewWeek
} from '@mui/icons-material';
import {
    Box,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AttendanceCalendarView from '../components/attendance/AttendanceCalendarView';
import AttendanceDailyView from '../components/attendance/AttendanceDailyView';
import AttendanceMonthlyView from '../components/attendance/AttendanceMonthlyView';
import AttendanceReports from '../components/attendance/AttendanceReports';
import AttendanceUpload from '../components/attendance/AttendanceUpload';
import AttendanceWeeklyEdit from '../components/attendance/AttendanceWeeklyEdit';
import AttendanceWeeklyView from '../components/attendance/AttendanceWeeklyView';
import HolidayManagement from '../components/attendance/HolidayManagement';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { authService } from '../services/authService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      style={{ width: '100%' }}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const StaffAttendance: React.FC = () => {
  const { showNotification } = useNotification();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [selectedWeek, setSelectedWeek] = useState<Dayjs>(dayjs());
  const [isAdmin, setIsAdmin] = useState(false);
  const [staffTypeFilter, setStaffTypeFilter] = useState<string>("ALL");
  
  // Validate token when component mounts or on URL parameter changes
  useEffect(() => {
    const validateSession = async () => {
      try {
        // Use the auth service to validate the token
        await authService.validateToken();
      } catch (error) {
        console.error('Token validation failed in StaffAttendance:', error);
        // Redirect to login with expired session message
        logout('expired');
      }
    };
    
    validateSession();
  }, [logout, searchParams]);
  
  // Check URL for weekly-edit mode parameters
  const mode = searchParams.get('mode');
  const employeeId = searchParams.get('employeeId');
  const paramStartDate = searchParams.get('startDate');
  const paramEndDate = searchParams.get('endDate');
  const isWeeklyEditMode = mode === 'weekly-edit' && employeeId && paramStartDate && paramEndDate;
  
  // Check if the current user has admin permissions
  useEffect(() => {
    if (currentUser) {
      const userRoles = currentUser.roles || [];
      setIsAdmin(userRoles.includes('ADMIN') || userRoles.includes('PRINCIPAL'));
    }
  }, [currentUser]);

  // Set weekly tab when in weekly-edit mode
  useEffect(() => {
    if (isWeeklyEditMode && paramStartDate) {
      setSelectedWeek(dayjs(paramStartDate));
      setTabValue(1); // Weekly tab
    }
  }, [isWeeklyEditMode, paramStartDate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStaffTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStaffTypeFilter(event.target.value as string);
  };

  // If we're in weekly-edit mode, render the weekly edit component instead
  if (isWeeklyEditMode) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <AttendanceWeeklyEdit 
            employeeId={parseInt(employeeId)}
            startDate={paramStartDate}
            endDate={paramEndDate}
          />
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">Staff Attendance Management</Typography>
          
          {isAdmin && (
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="staff-type-label">Staff Type</InputLabel>
              <Select
                labelId="staff-type-label"
                value={staffTypeFilter}
                onChange={(e) => setStaffTypeFilter(e.target.value)}
                label="Staff Type"
              >
                <MenuItem value="ALL">All Staff</MenuItem>
                <MenuItem value="TEACHING">Teaching Staff</MenuItem>
                <MenuItem value="NON_TEACHING">Non-Teaching Staff</MenuItem>
                <MenuItem value="ADMINISTRATION">Administration</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="attendance management tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Today />} label="Daily" />
            <Tab icon={<ViewWeek />} label="Weekly" />
            <Tab icon={<CalendarMonth />} label="Monthly" />
            {isAdmin && <Tab label="Calendar View" />}
            {isAdmin && <Tab label="Upload" />}
            {isAdmin && <Tab label="Holidays" />}
            <Tab label="Reports" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newDate) => {
                  if (newDate) {
                    setSelectedDate(dayjs(newDate as any));
                  }
                }}
                sx={{ width: 200, mr: 2 }}
              />
              <Typography variant="body1" sx={{ ml: 2 }}>
                {selectedDate.format('dddd, MMMM D, YYYY')}
              </Typography>
            </Box>
          </LocalizationProvider>
          <AttendanceDailyView 
            date={selectedDate.format('YYYY-MM-DD')} 
            isAdmin={isAdmin}
            staffType={staffTypeFilter} 
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>              <DatePicker
                label="Select Week"
                value={selectedWeek}
                onChange={(newDate) => {
                  if (newDate) {
                    setSelectedWeek(dayjs(newDate as any));
                  }
                }}
                sx={{ width: 200, mr: 2 }}
              />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Week of {selectedWeek.startOf('week').format('MMMM D')} - {selectedWeek.endOf('week').format('MMMM D, YYYY')}
              </Typography>
            </Box>
          </LocalizationProvider>
          <AttendanceWeeklyView 
            startDate={selectedWeek.startOf('week').format('YYYY-MM-DD')} 
            endDate={selectedWeek.endOf('week').format('YYYY-MM-DD')} 
            isAdmin={isAdmin}
            staffType={staffTypeFilter}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>              <DatePicker
                label="Select Month"
                views={['year', 'month']}
                value={selectedMonth}
                onChange={(newDate) => {
                  if (newDate) {
                    setSelectedMonth(dayjs(newDate as any));
                  }
                }}
                sx={{ width: 200, mr: 2 }}
              />
              <Typography variant="body1" sx={{ ml: 2 }}>
                {selectedMonth.format('MMMM YYYY')}
              </Typography>
            </Box>
          </LocalizationProvider>
          <AttendanceMonthlyView 
            year={selectedMonth.year()} 
            month={selectedMonth.month() + 1} 
            isAdmin={isAdmin}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <AttendanceCalendarView />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <AttendanceUpload />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <HolidayManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={isAdmin ? 6 : 3}>
          <AttendanceReports isAdmin={isAdmin} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default StaffAttendance;
