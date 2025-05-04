// @ts-nocheck
import { useState, useEffect } from 'react';
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
} from '@mui/material';
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
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  onClick 
}: StatCardProps) => (
  <Card 
    sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s',
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      } : {},
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
    attendance: { present: 0, absent: 0, late: 0, percentage: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Instead of making API calls that result in 403 errors, use mock data for now
      // In a real app, you would have student-specific endpoints that return only data the student can access
      
      // Mock enrolled courses data
      const mockCourses = [
        {
          id: 1,
          name: "Mathematics",
          teacher: "Prof. Johnson",
          schedule: "Mon/Wed/Fri 10:00 AM",
          grade: "A-"
        },
        {
          id: 2,
          name: "English Literature",
          teacher: "Prof. Smith",
          schedule: "Tue/Thu 1:00 PM",
          grade: "B+"
        },
        {
          id: 3,
          name: "Computer Science",
          teacher: "Prof. Williams",
          schedule: "Mon/Fri 2:00 PM",
          grade: "A"
        }
      ];

      // Mock assignments data
      const mockAssignments = [
        {
          id: 1,
          title: "Math Homework - Chapter 5",
          dueDate: new Date(Date.now() + 86400000).toLocaleDateString(),
          course: "Mathematics"
        },
        {
          id: 2,
          title: "Essay on Literature",
          dueDate: new Date(Date.now() + 172800000).toLocaleDateString(),
          course: "English Literature"
        },
        {
          id: 3,
          title: "Programming Project",
          dueDate: new Date(Date.now() + 432000000).toLocaleDateString(),
          course: "Computer Science"
        }
      ];

      // Mock attendance data
      const mockAttendance = {
        present: 42,
        absent: 2,
        late: 1,
        percentage: 93.3
      };

      setStudentData({
        studentInfo: null, // In a real app, fetch student info from API
        enrolledCourses: mockCourses,
        upcomingAssignments: mockAssignments,
        attendance: mockAttendance
      });
    } catch (error) {
      console.error('Error loading student dashboard data:', error);
      setError('Failed to load student dashboard data');
      showNotification({
        type: 'error',
        message: 'Failed to load dashboard data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
    // In a real app, you might still want to refresh data periodically
    // but we'll comment it out for now since we're using mock data
    // const interval = setInterval(loadStudentData, 5 * 60 * 1000);
    // return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <Loading message="Loading your dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadStudentData} />;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Student Dashboard
        {user && <Typography variant="subtitle1" color="text.secondary">Welcome, {user.name || user.email}</Typography>}
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
            value="3.5" // Mocked value, in real app would fetch from backend
            icon={SchoolIcon}
            color="info.main"
          />
        </Grid>

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
                              {" • Grade: "}
                              <Typography component="span" color="primary.main" fontWeight="bold">
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
              <Button size="small" color="primary" onClick={() => navigate('/courses')}>
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
      </Grid>
    </Box>
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
      const [students, teachers, courses] = await Promise.all([
        studentService.getAll(),
        teacherService.getAll(),
        courseService.getAll(),
      ]);

      const totalEnrollments = courses.data.reduce(
        (sum: number, course: Course) => sum + course.enrolled,
        0
      );

      const avgClassSize = courses.data.length > 0 
        ? totalEnrollments / courses.data.length 
        : 0;

      const coursesAtCapacity = courses.data.filter(
        (course: Course) => course.enrolled >= course.capacity
      ).length;

      const recentActivity = [
        ...courses.data.slice(0, 3).map((course: Course) => ({
          id: course.id!,
          type: 'course' as const,
          description: `Course ${course.name} has ${course.capacity - course.enrolled} seats remaining`,
          timestamp: new Date().toISOString(),
        })),
        ...students.data.slice(0, 3).map((student: Student) => ({
          id: student.id!,
          type: 'student' as const,
          description: `Student ${student.name} - Grade ${student.grade}`,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setStats({
        totalStudents: students.data.length,
        totalTeachers: teachers.data.length,
        totalCourses: courses.data.length,
        activeEnrollments: totalEnrollments,
        averageClassSize: Math.round(avgClassSize * 10) / 10,
        coursesAtCapacity,
        recentActivity,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError('Failed to load dashboard statistics');
      showNotification({
        type: 'error',
        message: 'Failed to load dashboard statistics. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5 * 60 * 1000);
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Activity
              </Typography>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={loadStats}
              >
                Refresh
              </Button>
            </Box>
            <List>
              {stats.recentActivity.map((activity: ActivityItem, index: number) => (
                <> {/* Using Fragment shorthand instead of React.Fragment */}
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemIcon>
                      {activity.type === 'enrollment' && <PeopleIcon color="primary" />}
                      {activity.type === 'course' && <BookIcon color="secondary" />}
                      {activity.type === 'student' && <SchoolIcon color="success" />}
                      {activity.type === 'teacher' && <PersonIcon color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={new Date(activity.timestamp).toLocaleString()}
                    />
                  </ListItem>
                </>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Main Dashboard component that renders the appropriate dashboard based on user role
const Dashboard = () => {
  const { user } = useAuth();
  
  // Show the appropriate dashboard based on user role
  if (user && user.role === ROLES.STUDENT) {
    return <StudentDashboard />;
  } else if (user && user.role === ROLES.TEACHER) {
    // In the future, a specific TeacherDashboard component could be added here
    // For now, teachers will use the AdminDashboard with their specific permissions
    return <AdminDashboard />;
  } else if (user && (user.role === ROLES.ADMIN || user.role === ROLES.STAFF)) {
    return <AdminDashboard />;
  } else {
    // Fallback for unknown roles or unauthenticated users
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h5" color="text.secondary">
          Dashboard not available for your role.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Please contact the system administrator if you believe this is an error.
        </Typography>
      </Box>
    );
  }
};

export default Dashboard;