import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  CalendarMonth,
  Today,
  ViewWeek,
  Publish,
  GetApp,
  Add,
  Check,
  Close
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useApi, useApiMutation } from '../hooks/useApi';
import { 
  teacherAttendanceService, 
  TeacherAttendance as TeacherAttendanceType, 
  AttendanceStatus, 
  BulkAttendanceRequest 
} from '../services/teacherAttendanceService';
import { staffService, StaffMember } from '../services/staffService';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import AttendanceCalendarView from '../components/attendance/AttendanceCalendarView';
import AttendanceDailyView from '../components/attendance/AttendanceDailyView';
import AttendanceWeeklyView from '../components/attendance/AttendanceWeeklyView';
import AttendanceMonthlyView from '../components/attendance/AttendanceMonthlyView';
import HolidayManagement from '../components/attendance/HolidayManagement';
import AttendanceReports from '../components/attendance/AttendanceReports';
import AttendanceUpload from '../components/attendance/AttendanceUpload';

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

const TeacherAttendance: React.FC = () => {
  const { showNotification } = useNotification();
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [selectedWeek, setSelectedWeek] = useState<Dayjs>(dayjs());
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if the current user has admin permissions
  useEffect(() => {
    if (currentUser) {
      const userRoles = currentUser.roles || [];
      setIsAdmin(userRoles.includes('ADMIN') || userRoles.includes('PRINCIPAL'));
    }
  }, [currentUser]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">Teacher Attendance Management</Typography>
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

export default TeacherAttendance;
