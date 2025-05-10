import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import RoleBasedRoute from './components/RoleBasedRoute';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Reports from './pages/Reports';
import Admissions from './pages/Admissions';
import FeeManagement from './pages/FeeManagement'; // Import the FeeManagement page
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Staff from './pages/Staff';
import theme from './theme';
import React, { useState, useEffect, useContext } from 'react';

import { NotificationProvider } from './context/NotificationContext';
import { AuthContext, AuthProvider } from './context/AuthContext';

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
};

// AppRoutes component now uses the ProtectedRoute directly
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
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
      />
      <Route
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
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <Layout>
              <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF]}>
                <Courses />
              </RoleBasedRoute>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
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
  
  useEffect(() => {
    console.log('🏁 App component mounted');
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <Router>
            <ErrorBoundary>
              {authFailed ? (
                <Routes>
                  <Route path="*" element={<Landing />} />
                </Routes>
              ) : (
                <React.Suspense fallback={<div>Loading...</div>}>
                  <AuthProvider>
                    <AppRoutes />
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