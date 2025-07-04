import { Alert, CssBaseline, Snackbar, ThemeProvider } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RoleBasedRoute from './components/RoleBasedRoute';
import Admissions from './pages/Admissions';
import BlueprintForm from './pages/BlueprintForm';
import Dashboard from './pages/Dashboard';
import ExamConfigurationForm from './pages/ExamConfigurationForm';
import ExamConfigurationPage from './pages/ExamConfigurationPage';
import ExaminationManagement from './pages/ExaminationManagement';
import FeeManagement from './pages/FeeManagement'; // Import the FeeManagement page
import Landing from './pages/Landing';
import Login from './pages/Login';
import MarksEntry from './pages/MarksEntry';
import Register from './pages/Register';
import Reports from './pages/Reports';
import Staff from './pages/Staff';
import StaffAttendance from './pages/StaffAttendance'; // Import the StaffAttendance page
import Students from './pages/Students';
import TeacherAttendance from './pages/TeacherAttendance'; // Import the TeacherAttendance page
// Import new consolidated views
import ConsolidatedCourseView from './pages/ConsolidatedCourseView';
// ConsolidatedStaffView removed as we're now using the main Staff component
import theme from './theme';
// Import the connectivity checker
import { autoDetectApiUrl } from './utils/connectivityCheck';

import GlobalConnectionSettings from './components/GlobalConnectionSettings';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ConnectionProvider } from './context/ConnectionContext';
import { NotificationProvider } from './context/NotificationContext';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try refreshing the page.</div>;
    }

    return this.props.children;
  }
}

// Define ProtectedRoute as a separate component for clarity
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext);
  
  useEffect(() => {
    console.log('🔐 ProtectedRoute: Auth context available:', !!auth);
    console.log('🔐 ProtectedRoute: Authentication status:', auth?.isAuthenticated);
  }, [auth]);
  
  if (auth?.loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Authenticating...</div>
      </div>
    );
  }
  
  if (!auth?.isAuthenticated) {
    console.log('🚫 ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STAFF: 'STAFF',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
  PRINCIPAL: 'PRINCIPAL',
};

// AppRoutes component now uses the ProtectedRoute directly
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}      <Route path="/" element={<Landing />} />      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}<Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF, ROLES.STUDENT, ROLES.PARENT, ROLES.PRINCIPAL]}>
                <Dashboard />
              </RoleBasedRoute>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <Layout>
              <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF]}>
                <Students />
              </RoleBasedRoute>
            </Layout>
          </ProtectedRoute>
        }
      />      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <Layout>
              <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
                <Staff />
              </RoleBasedRoute>
            </Layout>
          </ProtectedRoute>
        }
      />      {/* Consolidated staff route removed - now using core staff controller */}
      <Route
        path="/consolidated-courses"
        element={
          <ProtectedRoute>
            <Layout>
              <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
                <ConsolidatedCourseView />
              </RoleBasedRoute>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-attendance"
        element={
          <ProtectedRoute>
            <Layout>
              <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER]}>
                <TeacherAttendance />
              </RoleBasedRoute>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff-attendance"
        element={
          <ProtectedRoute>
            <Layout>
              <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.STAFF]}>
                <StaffAttendance />
              </RoleBasedRoute>
            </Layout>
          </ProtectedRoute>
        }
      />      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF]}>
                <Reports />
              </RoleBasedRoute>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL]}>
              <ExaminationManagement />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams/blueprint/new"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL]}>
              <Layout>
                <BlueprintForm mode="create" />
              </Layout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams/blueprint/edit/:id"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL]}>
              <Layout>
                <BlueprintForm mode="edit" />
              </Layout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />      <Route
        path="/exams/configuration/new"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL]}>
              <Layout>
                <ExamConfigurationPage />
              </Layout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams/configuration/edit/:id"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL]}>
              <Layout>
                <ExamConfigurationPage />
              </Layout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams/marks/entry"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL]}>
              <Layout>
                <MarksEntry />
              </Layout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admissions"
        element={
          <ProtectedRoute>
            <Layout>
              <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}>
                <Admissions />
              </RoleBasedRoute>
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Add Fee Management route */}
      <Route
        path="/fees"
        element={
          <ProtectedRoute>
            <Layout>
              <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
                <FeeManagement />
              </RoleBasedRoute>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  const [authFailed, setAuthFailed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    checking: true,
    connected: false,
    message: '',
    showNotification: false
  });
  
  // Check API connectivity on startup
  useEffect(() => {
    console.log('🏁 App component mounted');
    
    // Run the API connectivity check
    autoDetectApiUrl()
      .then(isConnected => {
        setConnectionStatus({
          checking: false,
          connected: isConnected,
          message: isConnected 
            ? 'Successfully connected to backend server' 
            : 'Could not connect to backend server. Some features may not work.',
          showNotification: true
        });
        
        // If no connection, we may want to retry periodically
        if (!isConnected) {
          const retryInterval = setInterval(() => {
            console.log('🔄 Retrying backend connection...');
            autoDetectApiUrl().then(newStatus => {
              if (newStatus) {
                clearInterval(retryInterval);
                setConnectionStatus({
                  checking: false,
                  connected: true,
                  message: 'Successfully connected to backend server',
                  showNotification: true
                });
              }
            });
          }, 30000); // Retry every 30 seconds
          
          return () => clearInterval(retryInterval);
        }
      });
  }, []);

  // Handle notification close
  const handleCloseNotification = () => {
    setConnectionStatus(prev => ({ ...prev, showNotification: false }));
  };
    return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <Router>
            <ErrorBoundary>
              {/* Backend connection notification */}
              <Snackbar 
                open={connectionStatus.showNotification} 
                autoHideDuration={6000} 
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Alert 
                  onClose={handleCloseNotification} 
                  severity={connectionStatus.connected ? "success" : "warning"} 
                  sx={{ width: '100%' }}
                >
                  {connectionStatus.message}
                </Alert>
              </Snackbar>
            
              {authFailed ? (
                <Routes>
                  <Route path="*" element={<Landing />} />
                </Routes>
              ) : (
                <React.Suspense fallback={<div>Loading...</div>}>                  <AuthProvider>
                    {/* Add ConnectionProvider to make connection management available throughout the app */}
                    <ConnectionProvider>
                      <AppRoutes />
                      {/* Render ConnectionSettings globally so it can be accessed from anywhere */}
                      <GlobalConnectionSettings />
                    </ConnectionProvider>
                  </AuthProvider>
                </React.Suspense>
              )}
            </ErrorBoundary>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;