import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  
  // Debug logging for role-based access
  useEffect(() => {
    console.log('🔒 RoleBasedRoute checking access for path:', window.location.pathname);
    console.log('👤 User role:', user?.role);
    console.log('✅ Allowed roles:', allowedRoles);
    console.log('🔑 Access granted:', user && allowedRoles.includes(user.role));
    
    // Log more details about the token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 Token payload:', {
          exp: new Date(tokenPayload.exp * 1000).toLocaleString(),
          roles: tokenPayload.roles || tokenPayload.authorities || tokenPayload.role || 'Not found in token',
          username: tokenPayload.sub || tokenPayload.username || 'Not found in token'
        });
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    } else {
      console.warn('⚠️ No token available for role verification');
    }
  }, [user, allowedRoles]);

  if (!isAuthenticated) {
    console.warn('⚠️ User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Enhanced role checking with detailed logging
  if (!user) {
    console.error('❌ User object is null or undefined');
    showNotification({
      type: 'error',
      message: 'Authentication error: User data is missing',
    });
    return <Navigate to="/login" />;
  }
  
  // Case-insensitive role comparison
  const hasAccess = allowedRoles.some(
    role => user.role.toUpperCase() === role.toUpperCase()
  );
  
  if (!hasAccess) {
    console.error(`❌ Access denied: User role "${user.role}" not in allowed roles:`, allowedRoles);
    showNotification({
      type: 'error',
      message: 'Access denied: You do not have permission to view this page',
    });
    return <Navigate to="/" />;
  }

  console.log('✅ Access granted to:', window.location.pathname);
  return <>{children}</>;
};

export default RoleBasedRoute;