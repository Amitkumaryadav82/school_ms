import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  AssessmentOutlined,
  CalendarToday,
  Person,
  School,
  PeopleOutline,
  PlaylistAddCheck,
  GetApp,
  Print
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { employeeAttendanceService } from '../../services/employeeAttendanceService';
import { staffService, StaffMember } from '../../services/staffService';
import { useNotification } from '../../context/NotificationContext';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';

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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

interface AttendanceReportsProps {
  isAdmin: boolean;
}

const AttendanceReports: React.FC<AttendanceReportsProps> = ({ isAdmin }) => {
  const { showNotification } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [selectedTeacher, setSelectedTeacher] = useState<number | ''>('');
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1);

  // API calls
  const { data: teachers, loading: teachersLoading, error: teachersError } = useApi(
    () => staffService.getActiveTeachers()
  );

  const { data: employeeStats, loading: statsLoading, error: statsError } = useApi(
    () => {
      if (!selectedTeacher) return Promise.resolve(null);
      return employeeAttendanceService.getAttendanceStats(
        Number(selectedTeacher),
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      );
    },
    { dependencies: [selectedTeacher, startDate, endDate] }
  );
  const { data: monthlyReport, loading: monthlyReportLoading, error: monthlyReportError } = useApi(
    () => employeeAttendanceService.getMonthlyAttendanceReport(selectedYear, selectedMonth),
    { dependencies: [selectedYear, selectedMonth] }
  );

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  // Get teacher name from ID
  const getTeacherName = (id: number) => {
    const teacher = teachers?.find((t: any) => t.id === id);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown';
  };

  // Prepare chart data for individual teacher
  const individualChartData = React.useMemo(() => {
    if (!employeeStats) return [];
    
    return [
      { name: 'Present', value: employeeStats.presentDays, color: '#4caf50' },
      { name: 'Absent', value: employeeStats.absentDays, color: '#f44336' },
      { name: 'Half Day', value: employeeStats.halfDays, color: '#ff9800' },
      { name: 'Leave', value: employeeStats.leaveDays, color: '#2196f3' }
    ];
  }, [employeeStats]);

  // Prepare attendance trend data (this would use real data in production)
  const trendData = React.useMemo(() => {
    if (!monthlyReport) return [];
    
    // Example trend data based on monthly report
    const months = Array(12).fill(0).map((_, i) => {
      const date = dayjs().month(i);
      return {
        month: date.format('MMM'),
        present: 0,
        absent: 0
      };
    });
    
    // For the current month, use real data
    if (monthlyReport) {
      const monthIndex = selectedMonth - 1;
      
      // Calculate average attendance stats for the department
      let totalPresent = 0;
      let totalAbsent = 0;
      
      monthlyReport.employeeSummaries.forEach(employee => {
        totalPresent += employee.presentDays;
        totalAbsent += employee.absentDays;
      });
      
      // Set the real values for the selected month
      months[monthIndex].present = totalPresent;
      months[monthIndex].absent = totalAbsent;
    }
    
    return months;
  }, [monthlyReport, selectedMonth]);

  // Prepare data for department-wise comparison
  const departmentData = React.useMemo(() => {
    if (!monthlyReport) return [];
    
    const deptMap: Record<string, { 
      department: string, 
      attendanceRate: number, 
      total: number 
    }> = {};
    
    monthlyReport.employeeSummaries.forEach(employee => {
      const dept = employee.department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = {
          department: dept,
          attendanceRate: 0,
          total: 0
        };
      }
      
      deptMap[dept].attendanceRate += parseFloat(employee.attendancePercentage);
      deptMap[dept].total += 1;
    });
    
    // Calculate averages
    return Object.values(deptMap).map(item => ({
      ...item,
      attendanceRate: item.total > 0 ? Math.round(item.attendanceRate / item.total) : 0
    }));
  }, [monthlyReport]);

  // Handle export reports
  const handleExport = () => {
    showNotification('Export functionality will be implemented', 'info');
  };

  // Handle print reports
  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (isAdmin && (teachersLoading || (tabValue === 0 && statsLoading) || (tabValue === 1 && monthlyReportLoading))) {
    return <Loading />;
  }

  // Error state
  if (isAdmin && (teachersError || (tabValue === 0 && statsError) || (tabValue === 1 && monthlyReportError))) {
    return <ErrorMessage message="Failed to load attendance report data." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Attendance Reports & Analytics
        </Typography>
        
        {isAdmin && (
          <Box>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={handleExport}
              sx={{ mr: 1 }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrint}
            >
              Print
            </Button>
          </Box>
        )}
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="attendance reports tabs"
          >
            <Tab icon={<Person />} label="Individual Reports" />
            {isAdmin && <Tab icon={<PeopleOutline />} label="Department Reports" />}
            {isAdmin && <Tab icon={<AssessmentOutlined />} label="Trend Analysis" />}
          </Tabs>

          {/* Individual Teacher Report */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="teacher-select-label">Select Teacher</InputLabel>
                  <Select
                    labelId="teacher-select-label"
                    value={selectedTeacher}
                    label="Select Teacher"
                    onChange={(e) => setSelectedTeacher(e.target.value as number)}
                  >
                    <MenuItem value="">
                      <em>Select a teacher</em>
                    </MenuItem>
                    {teachers?.map((teacher: any) => (
                      <MenuItem key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => date && setStartDate(dayjs(date as any))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date) => date && setEndDate(dayjs(date as any))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>

            {selectedTeacher && employeeStats ? (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Attendance Summary for {getTeacherName(Number(selectedTeacher))}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          {dayjs(employeeStats.startDate).format('MMM D, YYYY')} - {dayjs(employeeStats.endDate).format('MMM D, YYYY')}
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                          <Grid item xs={6} md={3}>
                            <Box>
                              <Typography variant="overline">Working Days</Typography>
                              <Typography variant="h5">{employeeStats.totalWorkingDays}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box>
                              <Typography variant="overline">Present</Typography>
                              <Typography variant="h5" color="success.main">{employeeStats.presentDays}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box>
                              <Typography variant="overline">Absent</Typography>
                              <Typography variant="h5" color="error.main">{employeeStats.absentDays}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box>
                              <Typography variant="overline">Attendance %</Typography>
                              <Typography variant="h5">{employeeStats.attendancePercentage}%</Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />
                        
                        {/* Additional stats */}
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={6}>
                            <Box>
                              <Typography variant="overline">Half Days</Typography>
                              <Typography variant="body1">{employeeStats.halfDays}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={6}>
                            <Box>
                              <Typography variant="overline">On Leave</Typography>
                              <Typography variant="body1">{employeeStats.leaveDays}</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Attendance Distribution
                        </Typography>
                        
                        <Box sx={{ height: 250, width: '100%' }}>
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie
                                data={individualChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {individualChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {employeeStats.datesByStatus && Object.keys(employeeStats.datesByStatus).length > 0 && (
                  <Card sx={{ mt: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Attendance Details
                      </Typography>

                      <Grid container spacing={2}>
                        {Object.entries(employeeStats.datesByStatus).map(([status, dates]) => (
                          <Grid item xs={12} sm={6} md={3} key={status}>
                            <Typography variant="subtitle1" gutterBottom>
                              {status.replace('_', ' ')}
                            </Typography>
                            <List dense>
                              {(dates as string[]).slice(0, 5).map((date) => (
                                <ListItem key={date}>
                                  <ListItemIcon>
                                    <CalendarToday fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={dayjs(date).format('MMM D, YYYY')} />
                                </ListItem>
                              ))}
                              {(dates as string[]).length > 5 && (
                                <ListItem>
                                  <ListItemText 
                                    primary={`+${(dates as string[]).length - 5} more days`} 
                                    sx={{ fontStyle: 'italic' }}
                                  />
                                </ListItem>
                              )}
                            </List>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                )}
              </Box>
            ) : selectedTeacher ? (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography>Loading attendance data...</Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography>Please select a teacher to view attendance reports</Typography>
              </Box>
            )}
          </TabPanel>

          {/* Department Reports */}
          {isAdmin && (
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={selectedYear}
                      label="Year"
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                      {[...Array(3)].map((_, idx) => {
                        const year = dayjs().year() - 1 + idx;
                        return (
                          <MenuItem key={year} value={year}>{year}</MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Month"
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                      {[...Array(12)].map((_, idx) => {
                        return (
                          <MenuItem key={idx + 1} value={idx + 1}>
                            {dayjs().month(idx).format('MMMM')}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Department-wise Attendance Rate
                      </Typography>
                      
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={departmentData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="department"
                              angle={-45}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis 
                              label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }}
                            />
                            <RechartsTooltip />
                            <Bar 
                              dataKey="attendanceRate" 
                              name="Attendance Rate (%)" 
                              fill="#8884d8" 
                              radius={[5, 5, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Department Performance
                      </Typography>
                      
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Department</TableCell>
                              <TableCell align="center">Teachers</TableCell>
                              <TableCell align="center">Avg. Attendance</TableCell>
                              <TableCell align="center">Performance</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {departmentData.map((dept) => {
                              // Determine performance level based on attendance rate
                              let performanceChip;
                              if (dept.attendanceRate >= 90) {
                                performanceChip = <Chip label="Excellent" color="success" size="small" />;
                              } else if (dept.attendanceRate >= 75) {
                                performanceChip = <Chip label="Good" color="primary" size="small" />;
                              } else if (dept.attendanceRate >= 60) {
                                performanceChip = <Chip label="Average" color="warning" size="small" />;
                              } else {
                                performanceChip = <Chip label="Poor" color="error" size="small" />;
                              }
                              
                              return (
                                <TableRow key={dept.department}>
                                  <TableCell>{dept.department}</TableCell>
                                  <TableCell align="center">{dept.total}</TableCell>
                                  <TableCell align="center">{dept.attendanceRate}%</TableCell>
                                  <TableCell align="center">{performanceChip}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          )}

          {/* Trend Analysis */}
          {isAdmin && (
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Yearly Attendance Trend
                      </Typography>
                      
                      <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={trendData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="present" 
                              name="Present Days" 
                              stroke="#4caf50" 
                              activeDot={{ r: 8 }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="absent" 
                              name="Absent Days" 
                              stroke="#f44336" 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                        Note: This chart shows the trend of teacher attendance throughout the year.
                        Complete data is shown for the current month, with estimated values for other months.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          )}
        </Paper>
      </LocalizationProvider>
    </Box>
  );
};

export default AttendanceReports;
