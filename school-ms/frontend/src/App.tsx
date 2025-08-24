import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ConnectionProvider } from './context/ConnectionContext';
import Layout from './components/Layout';
import RoleBasedRoute from './components/RoleBasedRoute';
import Admissions from './pages/Admissions';
import BlueprintForm from './components/exam/BlueprintForm';
import ExamConfigurationPage from './pages/ExamConfigurationPage';
import ExamsLandingPage from './pages/ExamsLandingPage';
import Dashboard from './pages/Dashboard';
import FeeManagement from './pages/FeeManagement';
import Landing from './pages/Landing';
import Login from './pages/Login';
import MarksEntry from './pages/MarksEntry';
import Register from './pages/Register';
import Students from './pages/Students';
import Staff from './pages/Staff';
import ConsolidatedCourseView from './pages/ConsolidatedCourseView';
import StaffAttendance from './pages/StaffAttendance';
import Reports from './pages/Reports';
import TeacherAttendance from './pages/TeacherAttendance';
import ReportCards from './pages/ReportCards';
import TimetableLanding from './pages/TimetableLanding';
import Library from './pages/Library';

const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STAFF: 'STAFF',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
  PRINCIPAL: 'PRINCIPAL',
};

// Dummy ProtectedRoute for demonstration; replace with your actual implementation
type ProtectedProps = { children: React.ReactNode };
const ProtectedRoute = ({ children }: ProtectedProps) => {
  // Add your authentication logic here
  // For now, always allow
  return children;
};

function App() {
  return (
    <Router>
      <ConnectionProvider>
        <NotificationProvider>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route path="/exams" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF, ROLES.STUDENT, ROLES.PARENT, ROLES.PRINCIPAL]}>
                      <ExamsLandingPage />
                    </RoleBasedRoute>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF, ROLES.STUDENT, ROLES.PARENT, ROLES.PRINCIPAL]}>
                      <Dashboard />
                    </RoleBasedRoute>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/students" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF]}>
                      <Students />
                    </RoleBasedRoute>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/examinations/configuration" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
                      <ExamConfigurationPage apiBaseUrl={typeof window !== 'undefined' && (window as any).__API_BASE_URL__ ? (window as any).__API_BASE_URL__ : 'http://localhost:8080'} />
                    </RoleBasedRoute>
                  </Layout>
                </ProtectedRoute>
              } />
      <Route path="/staff" element={
                <ProtectedRoute>
                  <Layout>
        <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.PRINCIPAL]}>
                      <Staff />
                    </RoleBasedRoute>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/consolidated-courses" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
                      <ConsolidatedCourseView />
                    </RoleBasedRoute>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/teacher-attendance" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER]}>
                      <TeacherAttendance />
                    </RoleBasedRoute>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/staff-attendance" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.STAFF]}>
                      <StaffAttendance />
                    </RoleBasedRoute>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF]}>
                      <Reports />
                    </RoleBasedRoute>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/timetable" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER]}>
                    <Layout>
                      <TimetableLanding />
                    </Layout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/exams/report-cards" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL]}>
                    <Layout>
                      <ReportCards />
                    </Layout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/exams/marks/entry" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL]}>
                    <Layout>
                      <MarksEntry />
                    </Layout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/admissions" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}>
                      <Admissions />
                    </RoleBasedRoute>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/fees" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
                      <FeeManagement />
                    </RoleBasedRoute>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/library" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF]}>
                      <Library />
                    </RoleBasedRoute>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </AuthProvider>
        </NotificationProvider>
      </ConnectionProvider>
    </Router>
  );
}

export default App;