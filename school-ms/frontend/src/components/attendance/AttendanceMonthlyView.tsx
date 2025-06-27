import {
    GetApp as DownloadIcon,
    Print as PrintIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useNotification } from '../../context/NotificationContext';
import { useApi } from '../../hooks/useApi';
import { employeeAttendanceService } from '../../services/employeeAttendanceService';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';

interface AttendanceMonthlyViewProps {
  year: number;
  month: number;
  isAdmin: boolean;
}

const AttendanceMonthlyView: React.FC<AttendanceMonthlyViewProps> = ({ year, month, isAdmin }) => {
  const { showNotification } = useNotification();
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  // Fetch monthly attendance report
  const { data, error, loading } = useApi(() => 
    employeeAttendanceService.getMonthlyAttendanceReport(year, month)
  , { dependencies: [year, month] });

  // Get list of departments for filtering
  const departments = React.useMemo(() => {
    if (!data?.employeeSummaries) return [];
    
    const deptSet = new Set<string>();
    data.employeeSummaries.forEach((employee) => {
      if (employee.department) {
        deptSet.add(employee.department);
      }
    });
    
    return Array.from(deptSet);
  }, [data]);

  // Filter employees based on department
  const filteredEmployees = React.useMemo(() => {
    if (!data?.employeeSummaries) return [];
    
    if (departmentFilter === 'all') {
      return data.employeeSummaries;
    }
    
    return data.employeeSummaries.filter((employee) => 
      employee.department === departmentFilter
    );
  }, [data, departmentFilter]);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!data?.employeeSummaries) return [];
    
    // For department-wise attendance statistics
    const deptStats: Record<string, { 
      department: string;
      present: number;
      absent: number;
      halfDay: number;
      leave: number;
      total: number;
      attendanceRate: number;
    }> = {};
    
    data.employeeSummaries.forEach((employee) => {
      const dept = employee.department || 'Uncategorized';
      
      if (!deptStats[dept]) {
        deptStats[dept] = { 
          department: dept, 
          present: 0, 
          absent: 0, 
          halfDay: 0, 
          leave: 0, 
          total: 0,
          attendanceRate: 0
        };
      }
      
      deptStats[dept].present += employee.presentDays || 0;
      deptStats[dept].absent += employee.absentDays || 0;
      deptStats[dept].halfDay += employee.halfDays || 0;
      deptStats[dept].leave += employee.leaveDays || 0;
      deptStats[dept].total += 1;
    });
    
    // Calculate attendance rate
    Object.keys(deptStats).forEach((dept) => {
      const stats = deptStats[dept];
      const totalDays = data.totalWorkingDays * stats.total;
      const presentEquivalent = stats.present + (stats.halfDay / 2);
      
      stats.attendanceRate = totalDays > 0 
        ? Math.round((presentEquivalent / totalDays) * 100) 
        : 0;
    });
    
    return Object.values(deptStats);
  }, [data]);

  // Handle export to Excel
  const handleExportToExcel = () => {
    // This would generate and download an Excel file in a complete implementation
    showNotification('Export to Excel functionality will be implemented', 'info');
  };

  // Handle print report
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load monthly attendance data." />;
  }

  if (!data) {
    return <ErrorMessage message="No data available for the selected month." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2">
          Monthly Attendance Report - {data.monthName} {data.year}
        </Typography>
        
        <Box>
          {isAdmin && (
            <>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />} 
                onClick={handleExportToExcel}
                sx={{ mr: 1 }}
              >
                Export
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />} 
                onClick={handlePrint}
              >
                Print
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Working Days</Typography>
              <Typography variant="h4">{data.totalWorkingDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Teachers</Typography>
              <Typography variant="h4">{data.employeeSummaries?.length || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Date Range</Typography>
              <Typography variant="body1">
                {dayjs(data.startDate).format('MMM D')} - {dayjs(data.endDate).format('MMM D, YYYY')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Department Filter</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value as string)}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Statistics Chart */}
      {isAdmin && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Department-wise Attendance Statistics</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="attendanceRate" name="Attendance Rate (%)" fill="#8884d8" />
                <Bar dataKey="present" name="Present Days" fill="#82ca9d" />
                <Bar dataKey="absent" name="Absent Days" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {/* Monthly Attendance Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="center">Present</TableCell>
              <TableCell align="center">Absent</TableCell>
              <TableCell align="center">Half Day</TableCell>
              <TableCell align="center">Leave</TableCell>
              <TableCell align="center">Attendance %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => {
                // Determine attendance percentage color
                let attendanceColor = 'success.main';
                const attendancePercentage = parseFloat(employee.attendancePercentage);
                
                if (attendancePercentage < 50) {
                  attendanceColor = 'error.main';
                } else if (attendancePercentage < 75) {
                  attendanceColor = 'warning.main';
                } else if (attendancePercentage < 90) {
                  attendanceColor = 'info.main';
                }
                
                return (
                  <TableRow key={employee.employeeId}>
                    <TableCell>{employee.employeeId}</TableCell>
                    <TableCell>{employee.employeeName}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell align="center">{employee.presentDays}</TableCell>
                    <TableCell align="center">{employee.absentDays}</TableCell>
                    <TableCell align="center">{employee.halfDays}</TableCell>
                    <TableCell align="center">{employee.leaveDays}</TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="bold" color={attendanceColor}>
                        {employee.attendancePercentage}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">No data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceMonthlyView;
