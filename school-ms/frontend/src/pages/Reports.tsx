import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import PaymentAnalytics from '../components/PaymentAnalytics';
import { AxiosResponse } from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  CloudDownload as DownloadIcon
} from '@mui/icons-material';
import { Student, studentService } from '../services/studentService';
import { Teacher, teacherService } from '../services/teacherService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useNotification } from '../context/NotificationContext';
import { SelectChangeEvent } from '@mui/material';
import React from 'react';

// Local Course interface to replace the one from courseService
interface Course {
  id?: number;
  name: string;
  department: string;
  teacherId: number;
  credits: number;
  capacity: number;
  enrolled: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface EnrollmentData {
  courseName: string;
  enrolled: number;
  capacity: number;
  availableSeats: number;
}

interface DepartmentStats {
  name: string;
  students: number;
  teachers: number;
  courses: number;
}

// TabPanel component for tabbed interface
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
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Reports = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [reportType, setReportType] = useState('enrollment');
    // For tabbed navigation
  const [tabValue, setTabValue] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);      // Each service returns data in a potentially different format, handle accordingly
      const studentsResult = await studentService.getAll();
      const teachersResult = await teacherService.getAll();
      
      // Course data no longer needed as the module is removed
      setCourses([]);
      
      if (Array.isArray(studentsResult)) {
        // Direct array response
        setStudents(studentsResult as Student[]);
      } else {
        // Assume AxiosResponse with data property
        const axiosResult = studentsResult as any;
        setStudents(Array.isArray(axiosResult.data) ? axiosResult.data : []);
      }
      
      if (Array.isArray(teachersResult)) {
        // Direct array response
        setTeachers(teachersResult as Teacher[]);
      } else {
        // Assume AxiosResponse with data property
        const axiosResult = teachersResult as any;
        setTeachers(Array.isArray(axiosResult.data) ? axiosResult.data : []);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      setError('Failed to load report data. Please try again.');
      showNotification({
        type: 'error',
        message: 'Failed to load report data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  const enrollmentData: EnrollmentData[] = courses.map((course: Course) => ({
    courseName: course.name,
    enrolled: course.enrolled,
    capacity: course.capacity,
    availableSeats: course.capacity - course.enrolled
  }));

  const departmentStats: DepartmentStats[] = courses.reduce((acc: DepartmentStats[], course: Course) => {
    const dept = acc.find((d: DepartmentStats) => d.name === course.department);
    if (dept) {
      dept.courses += 1;
      // Count students as the sum of enrollments in the department
      dept.students = courses
        .filter(c => c.department === course.department)
        .reduce((sum, c) => sum + c.enrolled, 0);
    } else {
      acc.push({
        name: course.department,
        courses: 1,
        students: courses
          .filter(c => c.department === course.department)
          .reduce((sum, c) => sum + c.enrolled, 0),
        teachers: teachers.filter((t: Teacher) => t.department === course.department).length,
      });
    }
    return acc;
  }, [] as DepartmentStats[]);

  const exportData = () => {
    let data: any[] = [];
    let filename = '';

    switch (reportType) {
      case 'enrollment':
        data = enrollmentData;
        filename = 'enrollment-report.csv';
        break;
      case 'department':
        data = departmentStats;
        filename = 'department-stats.csv';
        break;
      default:
        return;
    }

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      Object.keys(data[0]).join(',') + '\\n' + 
      data.map(row => Object.values(row).join(',')).join('\\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if (loading && tabValue === 0) {
    return <Loading message="Loading report data..." />;
  }

  if (error && tabValue === 0) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Reports & Analytics</Typography>
        {tabValue === 0 && (
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportData}
          >
            Export Report
          </Button>
        )}
      </Box>      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="reports tabs">
          <Tab label="Academic Reports" />
          <Tab label="Payment Reports" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <FormControl sx={{ mb: 4, minWidth: 200 }}>
          <InputLabel>Report Type</InputLabel>
          <Select
            value={reportType}
            label="Report Type"
            onChange={(e: SelectChangeEvent) => setReportType(e.target.value)}
          >
            <MenuItem value="enrollment">Course Enrollment</MenuItem>
            <MenuItem value="department">Department Statistics</MenuItem>
          </Select>
        </FormControl>

      {reportType === 'enrollment' && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Course Enrollment Distribution</Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="courseName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrolled" fill="#8884d8" name="Enrolled" />
                  <Bar dataKey="availableSeats" fill="#82ca9d" name="Available Seats" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell align="right">Enrolled</TableCell>
                    <TableCell align="right">Capacity</TableCell>
                    <TableCell align="right">Available Seats</TableCell>
                    <TableCell align="right">Fill Rate (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrollmentData.map((row) => (
                    <TableRow key={row.courseName}>
                      <TableCell>{row.courseName}</TableCell>
                      <TableCell align="right">{row.enrolled}</TableCell>
                      <TableCell align="right">{row.capacity}</TableCell>
                      <TableCell align="right">{row.availableSeats}</TableCell>
                      <TableCell align="right">
                        {((row.enrolled / row.capacity) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}

      {reportType === 'department' && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Department Distribution</Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={departmentStats}
                    dataKey="courses"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    label
                  >
                    {departmentStats.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Courses</TableCell>
                    <TableCell align="right">Teachers</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departmentStats.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">{row.courses}</TableCell>
                      <TableCell align="right">{row.teachers}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>      )}      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1565C0' }}>Payment Reports</Typography>
          <PaymentAnalytics />        </Box>
      </TabPanel>
    </Box>
  );
};

export default Reports;