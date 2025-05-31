// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import { refreshToken } from '../services/tokenRefreshService';
import { isDebugModeEnabled, logAccessAttempt } from '../services/userPreferencesService';
import NetworkErrorBoundary from '../components/NetworkErrorBoundary';
import ConnectionError from '../components/ConnectionError';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Book as BookIcon,
  ArrowUpward as ArrowUpIcon,
  Group as GroupIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { Student, studentService } from '../services/studentService';
import { teacherService } from '../services/teacherService';
import { Course, courseService } from '../services/courseService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/permissions';
import api from '../services/api';
import { Payment } from '../types/payment.types';
import feeService, { FeePaymentSummary } from '../services/feeService';
import PaymentDialog from '../components/dialogs/PaymentDialog';

// Type declarations
type IconType = typeof PeopleIcon;

interface ActivityItem {
  id: number;
  type: 'enrollment' | 'course' | 'student' | 'teacher';
  description: string;
  timestamp: string;
}

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  activeEnrollments: number;
  averageClassSize: number;
  coursesAtCapacity: number;
  recentActivity: ActivityItem[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: IconType;
  color: string;
  onClick?: () => void;
}

// Student-specific interfaces
interface StudentCourse {
  id: number;
  name: string;
  teacher: string;
  schedule: string;
  grade?: string;
}

interface StudentDashboardData {
  studentInfo: Student | null;
  enrolledCourses: StudentCourse[];
  upcomingAssignments: {
    id: number;
    title: string;
    dueDate: string;
    course: string;
  }[];
  attendance: {
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
  feePaymentSummary?: FeePaymentSummary;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  onClick,
}: StatCardProps) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s',
      '&:hover': onClick
        ? {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          }
        : {},
    }}
    onClick={onClick}
  >
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon sx={{ color }} />
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" color={color}>
        {value}
      </Typography>
    </CardContent>
    {onClick && (
      <CardActions>
        <Button size="small" endIcon={<ArrowUpIcon />}>
          View Details
        </Button>
      </CardActions>
    )}
  </Card>
);

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [studentData, setStudentData] = useState<StudentDashboardData>({
    studentInfo: null,
    enrolledCourses: [],
    upcomingAssignments: [],
    attendance: { present: 0, absent: 0, late: 0, percentage: 0 },
    feePaymentSummary: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for payment dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  /**
   * Validates the current auth token and refreshes if needed
   * @returns true if token is valid, false otherwise
   */
  const validateAndRefreshToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token available');
        return false;
      }

      // Parse the JWT token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      // Check if token is expired or will expire in less than 5 minutes
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeToExpiry = Math.round((expiryTime - currentTime) / 1000 / 60);

      if (currentTime > expiryTime) {
        console.log('Token is expired, attempting refresh');
        try {
          await refreshToken();
          logAccessAttempt('dashboard', true, 'Token refreshed successfully');
          return true;
        } catch (error) {
          console.error('Failed to refresh token:', error);
          logAccessAttempt('dashboard', false, 'Token refresh failed');
          return false;
        }
      } else if (timeToExpiry < 5) {
        console.log(`Token will expire soon (${timeToExpiry} minutes), refreshing`);
        try {
          await refreshToken();
          logAccessAttempt('dashboard', true, 'Token proactively refreshed');
          return true;
        } catch (error) {
          console.warn('Failed to proactively refresh token:', error);
          // Non-critical failure, we can still continue with the current token
          return true;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  };

  const loadStudentData = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      // First validate/refresh the token before making API calls
      const tokenValid = await validateAndRefreshToken();
      if (!tokenValid) {
        console.error('Invalid authentication token');
        showNotification({
          type: 'error',
          message: 'Your session has expired. Please log in again.',
        });
        navigate('/login');
        return;
      }

      const userId = user?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      const [studentInfo, enrolledCourses, assignments, attendance] =
        await Promise.all([
          api.get<Student>(`/students/${userId}`),
          api.get<StudentCourse[]>(`/students/${userId}/courses`),
          api.get<any[]>(`/students/${userId}/assignments`),
          api.get<any>(`/students/${userId}/attendance`),
        ]);

      // Also fetch fee payment summary
      let feePaymentSummary;
      try {
        feePaymentSummary = await feeService.getPaymentSummaryByStudent(
          userId
        );
      } catch (error) {
        console.error('Error loading fee payment summary:', error);
        // Create mock payment summary if API call fails
        feePaymentSummary = {
          studentId: userId,
          studentName: studentInfo?.name || '',
          totalDue: 25000,
          totalPaid: 15000,
          balance: 10000,
          paymentStatus: 'PARTIALLY_PAID',
          lastPaymentDate: '2025-04-15',
          nextDueDate: '2025-05-15',
        };
      }

      setStudentData({
        studentInfo: studentInfo || null,
        enrolledCourses: Array.isArray(enrolledCourses) ? enrolledCourses : [],
        upcomingAssignments: Array.isArray(assignments) ? assignments : [],
        attendance: attendance || {
          present: 0,
          absent: 0,
          late: 0,
          percentage: 0,
        },
        feePaymentSummary,
      });
    } catch (error) {
      console.error('Error loading student dashboard data:', error);
      setError(
        'Failed to load student data from database. Please ensure the backend server is running.'
      );
      showNotification({
        type: 'error',
        message:
          'Failed to load your dashboard data from database. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Perform token validation first and then load student data
    async function initializeDashboard() {
      try {
        // First validate/refresh the token before loading data
        const tokenValid = await validateAndRefreshToken();
        if (!tokenValid) {
          console.error('Invalid authentication token during dashboard initialization');
          showNotification({
            type: 'error',
            message: 'Your session has expired. Please log in again.',
          });
          navigate('/login');
          return;
        }
        
        // Token is valid, load student data
        loadStudentData();
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      }
    }
    
    // Execute the initialization function
    initializeDashboard();
    
    // Set up refresh interval that also validates token first
    const interval = setInterval(async () => {
      const tokenValid = await validateAndRefreshToken();
      if (tokenValid) {
        loadStudentData();
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle payment submission
  const handlePaymentSubmit = async (payment: Payment) => {
    try {
      setProcessingPayment(true);

      // Create a new payment
      await feeService.createPayment(payment);

      // Show success notification
      showNotification({
        type: 'success',
        message: 'Payment recorded successfully!',
      });

      // Close dialog and refresh data
      setPaymentDialogOpen(false);
      loadStudentData();
    } catch (error) {
      console.error('Error creating payment:', error);
      showNotification({
        type: 'error',
        message: 'Failed to record payment. Please try again later.',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return <Loading message="Loading your dashboard..." />;
  }
  // Check if this is a connection error - we'll show a more specific error
  if (error && (error.includes('ERR_CONNECTION_REFUSED') || error.includes('Failed to fetch'))) {
    return <ConnectionError error={error} onRetry={loadStudentData} />;
  }
  
  // For other types of errors, use our general error component
  if (error) {
    return <ErrorMessage message={error} onRetry={loadStudentData} />;
  }
  // Function to reload page content after connection recovery
  const handleRetry = useCallback(() => {
    loadStudentData();
  }, [loadStudentData]);
  
  // Show specific connection error UI instead of generic error message
  if (error && error.toString().includes('ERR_CONNECTION_REFUSED')) {
    return <ConnectionError error={error} onRetry={handleRetry} />;
  }
    return (
    <NetworkErrorBoundary onReset={handleRetry}>
      <Box>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Student Dashboard
          {user && (
            <Typography variant="subtitle1" color="text.secondary">
              Welcome, {user.name || user.email}
            </Typography>
          )}
        </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Enrolled Courses"
            value={studentData.enrolledCourses.length}
            icon={BookIcon}
            color="primary.main"
            onClick={() => navigate('/courses')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Upcoming Assignments"
            value={studentData.upcomingAssignments.length}
            icon={AssignmentIcon}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${studentData.attendance.percentage}%`}
            icon={EventNoteIcon}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="GPA"
            value="3.5"
            icon={SchoolIcon}
            color="info.main"
          />
        </Grid>

        {/* Fee Payment Summary */}
        {studentData.feePaymentSummary && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <PaymentIcon sx={{ mr: 1 }} />
                  Fee Payment Summary
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setPaymentDialogOpen(true)}
                  startIcon={<PaymentIcon />}
                  disabled={studentData.feePaymentSummary.balance <= 0}
                >
                  Make Payment
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Total Fee
                    </Typography>
                    <Typography variant="h5">
                      ₹{studentData.feePaymentSummary.totalDue.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: '#e8f5e9',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Paid Amount
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      ₹{studentData.feePaymentSummary.totalPaid.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor:
                        studentData.feePaymentSummary.balance > 0
                          ? '#ffebee'
                          : '#e8f5e9',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Balance
                    </Typography>
                    <Typography
                      variant="h5"
                      color={
                        studentData.feePaymentSummary.balance > 0
                          ? 'error.main'
                          : 'success.main'
                      }
                    >
                      ₹{studentData.feePaymentSummary.balance.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 2,
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status:{' '}
                    <Chip
                      label={studentData.feePaymentSummary.paymentStatus}
                      color={
                        studentData.feePaymentSummary.paymentStatus === 'PAID'
                          ? 'success'
                          : studentData.feePaymentSummary.paymentStatus ===
                            'PARTIALLY_PAID'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  {studentData.feePaymentSummary.lastPaymentDate && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Last Payment:{' '}
                      {new Date(
                        studentData.feePaymentSummary.lastPaymentDate
                      ).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>

                {studentData.feePaymentSummary.nextDueDate && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Next Due Date:
                    </Typography>
                    <Typography
                      variant="body1"
                      color="error.main"
                      fontWeight="bold"
                    >
                      {new Date(
                        studentData.feePaymentSummary.nextDueDate
                      ).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Enrolled Courses */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Your Courses
            </Typography>
            <List>
              {studentData.enrolledCourses.map((course, index) => (
                <React.Fragment key={course.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemIcon>
                      <BookIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={course.name}
                      secondary={
                        <>
                          {course.teacher} • {course.schedule}
                          {course.grade && (
                            <Typography component="span" color="text.secondary">
                              {' '}
                              • Grade:{' '}
                              <Typography
                                component="span"
                                color="primary.main"
                                fontWeight="bold"
                              >
                                {course.grade}
                              </Typography>
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                color="primary"
                onClick={() => navigate('/courses')}
              >
                View All Courses
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Assignments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Assignments
            </Typography>
            <List>
              {studentData.upcomingAssignments.map((assignment, index) => (
                <React.Fragment key={assignment.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={assignment.title}
                      secondary={
                        <>
                          Due: {assignment.dueDate} • {assignment.course}
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Attendance Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Summary
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h2" color="primary.main">
                    {studentData.attendance.present}
                  </Typography>
                  <Typography variant="body1">Days Present</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h2" color="error.main">
                    {studentData.attendance.absent}
                  </Typography>
                  <Typography variant="body1">Days Absent</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h2" color="warning.main">
                    {studentData.attendance.late}
                  </Typography>
                  <Typography variant="body1">Days Late</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>      {/* Payment Dialog */}
      {paymentDialogOpen && user && studentData.studentInfo && (
        <PaymentDialog
          open={paymentDialogOpen}
          studentId={user.id}
          onClose={() => setPaymentDialogOpen(false)}
          onSubmit={handlePaymentSubmit}
          loading={processingPayment}
        />
      )}
    </Box>
    </NetworkErrorBoundary>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    activeEnrollments: 0,
    averageClassSize: 0,
    coursesAtCapacity: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📊 Loading dashboard statistics...");
      
      // Check if token is valid before making API calls
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token available");
      }

      console.log('Loading admin dashboard statistics...');
        // Use individual try-catch blocks for each service to be more resilient
      let studentsData = [];
      let teachersData = [];
      let coursesData = [];
      
      try {
        const students = await studentService.getAll();
        studentsData = Array.isArray(students) ? students : [];
        console.log(`✅ Loaded ${studentsData.length} students`);
      } catch (error) {
        console.error('Error loading students:', error);
        // Continue with empty array, don't block the whole dashboard
      }
      
      try {
        const teachers = await teacherService.getAll();
        teachersData = Array.isArray(teachers) ? teachers : [];
        console.log(`✅ Loaded ${teachersData.length} teachers`);
      } catch (error) {
        console.error('Error loading teachers:', error);
      }
      
      try {
        const courses = await courseService.getAll();
        coursesData = Array.isArray(courses) ? courses : [];
        console.log(`✅ Loaded ${coursesData.length} courses`);
      } catch (error) {
        console.error('Error loading courses:', error);
      }
      
      // No need to reassign these variables since we already assigned them in the try blocks

      const totalEnrollments = coursesData.reduce(
        (sum: number, course: Course) => sum + (course.enrolled || 0),
        0
      );

      const avgClassSize =
        coursesData.length > 0
          ? totalEnrollments / coursesData.length
          : 0;

      const coursesAtCapacity = coursesData.filter(
        (course: Course) =>
          (course.enrolled || 0) >= (course.capacity || 30)
      ).length;

      const recentActivity = [
        ...coursesData.slice(0, 3).map((course: Course) => ({
          id: course.id!,
          type: 'course' as const,
          description: `Course ${course.name} has ${
            (course.capacity || 30) - (course.enrolled || 0)
          } seats remaining`,
          timestamp: new Date().toISOString(),
        })),
        ...studentsData.slice(0, 3).map((student: Student) => ({
          id: student.id!,
          type: 'student' as const,
          description: `Student ${student.name} - Grade ${
            student.grade || 'N/A'
          }`,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        })),
      ].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setStats({
        totalStudents: studentsData.length,
        totalTeachers: teachersData.length,
        totalCourses: coursesData.length,
        activeEnrollments: totalEnrollments,
        averageClassSize: Math.round(avgClassSize * 10) / 10,
        coursesAtCapacity,
        recentActivity,
      });    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Check if this is a connection error
      if (error.message && error.message.includes('Network Error')) {
        setError('Cannot connect to the server. Please check if the backend service is running.');
      } else {
        setError('Failed to load dashboard data. Please try again later.');
      }
      showNotification({
        type: 'error',
        message: 'Failed to load dashboard statistics. Please try refreshing the page.',
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const checkHealthAndLoadStats = async () => {
      try {
        // Import the health check function
        const { checkServerHealth } = await import('../services/api');
        const isHealthy = await checkServerHealth();
        
        if (isHealthy) {
          loadStats();
        } else {
          setError('Cannot connect to backend server. Please ensure the server is running.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking server health:', error);
        loadStats(); // Fall back to regular loading if health check itself fails
      }
    };
    
    checkHealthAndLoadStats();
    const interval = setInterval(checkHealthAndLoadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <Loading message="Loading dashboard statistics..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadStats} />;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={PeopleIcon}
            color="primary.main"
            onClick={() => navigate('/students')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={SchoolIcon}
            color="secondary.main"
            onClick={() => navigate('/teachers')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={BookIcon}
            color="success.main"
            onClick={() => navigate('/courses')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Enrollments"
            value={stats.activeEnrollments}
            icon={GroupIcon}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Class Size"
            value={stats.averageClassSize}
            icon={GroupIcon}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Courses at Capacity"
            value={stats.coursesAtCapacity}
            icon={WarningIcon}
            color="error.main"
            onClick={() => navigate('/courses')}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6">Recent Activity</Typography>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={loadStats}
              >
                Refresh
              </Button>
            </Box>
            <List>
              {stats.recentActivity.map(
                (activity: ActivityItem, index: number) => (
                  <React.Fragment key={activity.id || index}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemIcon>
                        {activity.type === 'enrollment' && (
                          <PeopleIcon color="primary" />
                        )}
                        {activity.type === 'course' && (
                          <BookIcon color="secondary" />
                        )}
                        {activity.type === 'student' && (
                          <SchoolIcon color="success" />
                        )}
                        {activity.type === 'teacher' && (
                          <PersonIcon color="info" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={new Date(
                          activity.timestamp
                        ).toLocaleString()}
                      />
                    </ListItem>
                  </React.Fragment>
                )
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Main Dashboard component that renders the appropriate dashboard based on user role
const Dashboard = () => {
  const { user, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Debug logging to help troubleshoot role-based rendering issues
  console.log('🏠 Dashboard component rendering with:', {
    userFromContext: user, 
    currentUser: currentUser,
    userRole: user?.role,
    userRoles: user?.roles || [],
    isAdmin: user?.role === ROLES.ADMIN,
    isTeacher: user?.role === ROLES.TEACHER,
    isStudent: user?.role === ROLES.STUDENT,
    isStaff: user?.role === ROLES.STAFF
  });
    // Token validation on component mount using our dedicated token validation service
  useEffect(() => {
    const validateTokenAndProceed = async () => {
      try {
        // Import the token validation service
        const { validateAdminToken } = await import('../services/tokenValidationService');
        
        console.log('Validating admin token before dashboard rendering...');
        const validation = await validateAdminToken();
        
        if (!validation.valid) {
          console.error('Token validation failed:', validation.message);
          logout();
          return;
        }
        
        console.log('✅ Token successfully validated:', {
          username: validation.username,
          roles: validation.roles,
          expiresAt: validation.expiresAt
        });
      } catch (err) {
        console.error('Error during token validation:', err);
        // Don't log out immediately on error - it might be a network issue
        // The API interceptor will handle 401 errors if they occur during API calls
      }
    };
    
    validateTokenAndProceed();
  }, [logout]);

  // Enhanced role-based dashboard rendering with better fallback
  const userRole = user?.role?.toUpperCase();
  const userRoles = Array.isArray(user?.roles) ? user?.roles.map(r => r.toUpperCase()) : 
                   (userRole ? [userRole] : []);
  
  if (userRole === ROLES.STUDENT || userRoles.includes(ROLES.STUDENT)) {
    console.log('🎓 Rendering Student Dashboard');
    return <StudentDashboard />;
  } else if (userRole === ROLES.TEACHER || userRoles.includes(ROLES.TEACHER)) {
    console.log('👨‍🏫 Rendering Teacher Dashboard');
    return <AdminDashboard />;
  } else if (
    userRole === ROLES.ADMIN || 
    userRole === ROLES.STAFF || 
    userRole === ROLES.PRINCIPAL || 
    userRoles.includes(ROLES.ADMIN) || 
    userRoles.includes(ROLES.STAFF) || 
    userRoles.includes(ROLES.PRINCIPAL)
  ) {
    console.log('👑 Rendering Admin Dashboard');
    return <AdminDashboard />;
  } else {
    console.warn('⚠️ No matching dashboard for user role:', userRole);
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h5" color="text.secondary">
          Dashboard not available for your role.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Please contact the system administrator if you believe this is an
          error.
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          Role: {userRole || 'Unknown'} | Available Roles: {userRoles.join(', ') || 'None'}
        </Typography>
      </Box>
    );
  }
};

export default Dashboard;