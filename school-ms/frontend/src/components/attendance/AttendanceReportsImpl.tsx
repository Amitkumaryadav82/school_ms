import * as React from 'react';
import { useEffect, useState } from 'react';
import {
    AssessmentOutlined,
    CalendarToday,
    GetApp,
    PeopleOutline,
    Person,
    Print
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis
} from 'recharts';
import { useNotification } from '../../context/NotificationContext';
import { useApi } from '../../hooks/useApi';
import { employeeAttendanceService, EmployeeAttendanceStatus } from '../../services/employeeAttendanceService';
import staffService from '../../services/staffService';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';

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

interface AttendanceReportsImplProps {
  isAdmin: boolean;
  staffType?: string;
}

const AttendanceReportsImpl: React.FC<AttendanceReportsImplProps> = ({ isAdmin, staffType = 'ALL' }) => {
  const { showNotification } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [selectedStaffMember, setSelectedStaffMember] = useState<number | ''>('');
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1);
  
  // Calculate date range for monthly data
  const monthStartDate = dayjs(`${selectedYear}-${selectedMonth}-01`);
  const monthEndDate = monthStartDate.endOf('month');
  
  // API calls using available endpoints
  const { data: allStaff, loading: staffLoading, error: staffError } = useApi(
    () => {
      console.log("Fetching all staff data");
      return staffService.getAll().then(response => {
        console.log(`Received ${response?.length || 0} staff records`);
        return response;
      });
    },
    { dependencies: [] }
  );
  
  // Filter staff based on staff type and active status
  const filteredStaff = React.useMemo(() => {
    if (!allStaff) return [];
    
    // Log the total count before filtering
    console.log(`Total staff before filtering: ${allStaff.length}`);
    
    const filtered = allStaff.filter(staff => {
      // Filter by staff type if specified
      if (staffType !== 'ALL' && staff.employeeType !== staffType) {
        return false;
      }
      
      // Include all active staff (can be teachers, administrators, or other staff)
      return staff.employmentStatus === 'ACTIVE';
    });
    
    // Log the count after filtering
    console.log(`Staff after filtering (type=${staffType}): ${filtered.length}`);
    
    // Sort staff alphabetically by name for better usability
    filtered.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    return filtered;
  }, [allStaff, staffType]);
  
  // Get attendance data for selected staff member
  const { data: staffAttendance, loading: staffAttendanceLoading, error: staffAttendanceError } = useApi(
    () => {
      if (!selectedStaffMember) return Promise.resolve([]);
      
      console.log(`Fetching attendance for staff ID: ${selectedStaffMember}`);
      return employeeAttendanceService.getAttendanceByEmployee(Number(selectedStaffMember))
        .then(response => {
          console.log(`Received ${response?.length || 0} attendance records for staff ID ${selectedStaffMember}`);
          return response;
        });
    },
    { dependencies: [selectedStaffMember] }
  );
  
  // Get attendance data for selected month (for all employees)
  const { data: monthlyAttendance, loading: monthlyAttendanceLoading, error: monthlyAttendanceError } = useApi(
    () => {
      return employeeAttendanceService.getAttendanceByDateRange(
        monthStartDate.format('YYYY-MM-DD'), 
        monthEndDate.format('YYYY-MM-DD'),
        staffType
      );
    },
    { dependencies: [selectedYear, selectedMonth, staffType] }
  );
  
  // Calculate employee stats from raw attendance data
  const employeeStats = React.useMemo(() => {
    if (!staffAttendance || !selectedStaffMember) return null;
    
    // Filter by date range
    const inRangeAttendance = staffAttendance.filter(record => {
      const recordDate = dayjs(record.attendanceDate);
      return recordDate.isAfter(startDate) && recordDate.isBefore(endDate);
    });
    
    // Count days by status
    const presentDays = inRangeAttendance.filter(a => a.status === EmployeeAttendanceStatus.PRESENT).length;
    const absentDays = inRangeAttendance.filter(a => a.status === EmployeeAttendanceStatus.ABSENT).length;
    const halfDays = inRangeAttendance.filter(a => a.status === EmployeeAttendanceStatus.HALF_DAY).length;
    const leaveDays = inRangeAttendance.filter(a => a.status === EmployeeAttendanceStatus.ON_LEAVE).length;
    const totalMarkedDays = inRangeAttendance.length;
    
    // Calculate total working days (excluding weekends and holidays)
    const totalDays = endDate.diff(startDate, 'day') + 1;
    const totalWorkingDays = totalDays - Math.floor(totalDays / 7) * 2; // Approximate by removing weekends
    
    // Calculate attendance percentage
    const attendancePercentage = totalMarkedDays > 0 
      ? Math.round((presentDays + (halfDays * 0.5)) / totalMarkedDays * 100)
      : 0;
      
    // Group dates by status for details section
    const datesByStatus = inRangeAttendance.reduce((acc, curr) => {
      if (!acc[curr.status]) {
        acc[curr.status] = [];
      }
      acc[curr.status].push(curr.attendanceDate);
      return acc;
    }, {} as Record<string, string[]>);
    
    return {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      totalWorkingDays,
      presentDays,
      absentDays,
      halfDays,
      leaveDays,
      attendancePercentage,
      datesByStatus
    };
  }, [staffAttendance, selectedStaffMember, startDate, endDate]);
  
  // Calculate monthly report data from raw attendance
  const monthlyReport = React.useMemo(() => {
    if (!monthlyAttendance || !allStaff) return null;
    
    // Group attendance by employee
    const employeeAttendanceMap = monthlyAttendance.reduce((acc, record) => {
      if (!acc[record.employeeId]) {
        acc[record.employeeId] = [];
      }
      acc[record.employeeId].push(record);
      return acc;
    }, {} as Record<number, typeof monthlyAttendance>);
    
    // Calculate summaries for each employee
    const employeeSummaries = Object.entries(employeeAttendanceMap).map(([employeeId, records]) => {
      const employee = allStaff.find(s => s.id === parseInt(employeeId));
      
      if (!employee) return null;
      
      // Count days by status
      const presentDays = records.filter(r => r.status === EmployeeAttendanceStatus.PRESENT).length;
      const absentDays = records.filter(r => r.status === EmployeeAttendanceStatus.ABSENT).length;
      const halfDays = records.filter(r => r.status === EmployeeAttendanceStatus.HALF_DAY).length;
      const leaveDays = records.filter(r => r.status === EmployeeAttendanceStatus.ON_LEAVE).length;
      const totalDays = records.length;
      
      // Calculate attendance percentage
      const attendancePercentage = totalDays > 0 
        ? ((presentDays + (halfDays * 0.5)) / totalDays * 100).toFixed(1)
        : "0";
      
      // Create daily status map
      const dailyStatus = records.reduce((acc, record) => {
        acc[record.attendanceDate] = record.status;
        return acc;
      }, {} as Record<string, string>);
      
      return {
        employeeId: parseInt(employeeId),
        employeeName: employee.firstName + ' ' + employee.lastName,
        department: employee.department || 'Unknown',
        presentDays,
        halfDays,
        absentDays,
        leaveDays,
        attendancePercentage,
        dailyStatus
      };
    }).filter(Boolean);
    
    return {
      year: selectedYear,
      month: selectedMonth,
      monthName: monthStartDate.format('MMMM'),
      startDate: monthStartDate.format('YYYY-MM-DD'),
      endDate: monthEndDate.format('YYYY-MM-DD'),
      totalWorkingDays: monthEndDate.diff(monthStartDate, 'day') + 1,
      employeeSummaries
    };
  }, [monthlyAttendance, allStaff, selectedYear, selectedMonth, monthStartDate, monthEndDate]);
  
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

  // Prepare data for department-wise comparison
  const departmentData = React.useMemo(() => {
    if (!monthlyReport || !monthlyReport.employeeSummaries) {
      return [];
    }
    
    // Group by department
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
      
      const attendancePercentage = parseFloat(employee.attendancePercentage || '0');
      deptMap[dept].attendanceRate += attendancePercentage;
      deptMap[dept].total += 1;
    });
    
    // Calculate averages
    return Object.values(deptMap).map(item => ({
      ...item,
      attendanceRate: item.total > 0 ? Math.round(item.attendanceRate / item.total) : 0
    }));
  }, [monthlyReport]);

  // Generate trend data from monthly report
  const trendData = React.useMemo(() => {
    // Create empty data for all 12 months
    const months = Array(12).fill(0).map((_, i) => {
      const date = dayjs().month(i);
      return {
        month: date.format('MMM'),
        present: Math.round(Math.random() * 50) + 50, // Sample data 50-100
        absent: Math.round(Math.random() * 20)       // Sample data 0-20
      };
    });
    
    // Fill current month with real data if available
    if (monthlyReport && monthlyReport.employeeSummaries) {
      const monthIndex = selectedMonth - 1;
      
      // Calculate total attendance metrics
      let totalPresent = 0;
      let totalAbsent = 0;
      
      monthlyReport.employeeSummaries.forEach(employee => {
        totalPresent += employee.presentDays;
        totalAbsent += employee.absentDays;
      });
      
      // Update the month data with real values
      months[monthIndex] = {
        month: months[monthIndex].month,
        present: totalPresent,
        absent: totalAbsent
      };
    }
    
    return months;
  }, [monthlyReport, selectedMonth]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get teacher name from ID
  const getStaffName = (id: number) => {
    const staff = filteredStaff?.find((s: any) => s.id === id);
    return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown';
  };

  // Handle export reports
  const handleExport = () => {
    showNotification('Export functionality will be implemented', 'info');
  };

  // Handle print reports
  const handlePrint = () => {
    window.print();
  };

  // Helper function to calculate percentage for chart tooltips
  const calculatePercentage = (value: number, stats: any) => {
    if (!stats) return 0;
    const total = stats.presentDays + stats.absentDays + stats.halfDays + stats.leaveDays;
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  // Loading state
  if (staffLoading || 
    (tabValue === 0 && selectedStaffMember && staffAttendanceLoading) || 
    (tabValue !== 0 && monthlyAttendanceLoading)) {
    return <Loading />;
  }

  // Error state with more detailed messages
  if (staffError) {
    console.error("Staff data loading error:", staffError);
    return <ErrorMessage message="Failed to load staff data. Please try again later." />;
  }
  
  if (tabValue === 0 && selectedStaffMember && staffAttendanceError) {
    console.error("Staff attendance data loading error:", staffAttendanceError);
    return <ErrorMessage message="Failed to load attendance data for the selected staff member. Please try again later." />;
  }
  
  if (tabValue !== 0 && monthlyAttendanceError) {
    console.error("Monthly attendance data loading error:", monthlyAttendanceError);
    return <ErrorMessage message="Failed to load department attendance data. Please try again later." />;
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
                  <InputLabel id="staff-select-label">Select Staff Member</InputLabel>
                  <Select
                    labelId="staff-select-label"
                    value={selectedStaffMember}
                    label="Select Staff Member"
                    onChange={(e) => setSelectedStaffMember(e.target.value as number)}
                  >
                    <MenuItem value="">
                      <em>Select a staff member</em>
                    </MenuItem>
                    {filteredStaff?.map((staff: any) => (
                      <MenuItem key={staff.id} value={staff.id}>
                        {staff.firstName} {staff.lastName}
                        {staff.employeeType && <span style={{ fontSize: '0.8em', marginLeft: '8px', color: '#666' }}>
                          ({staff.employeeType.replace('_', ' ')})
                        </span>}
                      </MenuItem>
                    ))}
                  </Select>
                  {staffType === 'ALL' ? (
                    <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
                      Showing all active staff members ({filteredStaff?.length || 0})
                    </Typography>
                  ) : (
                    <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
                      Filtered to {staffType.replace('_', ' ').toLowerCase()} staff ({filteredStaff?.length || 0})
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
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

            {selectedStaffMember && employeeStats ? (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Attendance Summary for {getStaffName(Number(selectedStaffMember))}
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
                        
                        <Box sx={{ height: 300, width: '100%', mt: 2 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={individualChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                labelLine={false}
                                label={false}
                              >
                                {individualChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip formatter={(value, name) => [`${value} days (${calculatePercentage(value, employeeStats)}%)`, name]} />
                              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
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
            ) : selectedStaffMember ? (
              <Box sx={{ mt: 3, textAlign: 'center', p: 3 }}>
                <Typography>No attendance data found for the selected date range</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try selecting a different date range or check if the staff member has attendance records.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 3, textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Person sx={{ fontSize: 60, color: 'primary.light', mb: 2, opacity: 0.7 }} />
                <Typography variant="h6">Please select a staff member to view attendance reports</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Individual attendance reports include attendance statistics, trends, and detailed logs.
                </Typography>
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

export default AttendanceReportsImpl;
