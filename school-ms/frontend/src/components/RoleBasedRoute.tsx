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
    // Debug logging for role-based access with enhanced token validation
  useEffect(() => {
    console.log('🔒 RoleBasedRoute checking access for path:', window.location.pathname);
    console.log('👤 User:', user);
    console.log('✅ Allowed roles:', allowedRoles);
    
    // Get and validate the token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        
        // Check token expiration
        const expTime = tokenPayload.exp * 1000;
        const currentTime = new Date().getTime();
        const isExpired = currentTime > expTime;
        
        console.log('🔍 Token validation:', {
          valid: !isExpired,
          expiresAt: new Date(expTime).toLocaleString(),
          timeLeft: Math.floor((expTime - currentTime) / 1000 / 60) + ' minutes',
          isExpired: isExpired
        });
        
        // Extract roles from token for comparison with stored user
        const tokenRoles = tokenPayload.roles || tokenPayload.authorities || 
          (tokenPayload.role ? [tokenPayload.role] : []);
          
        console.log('🔍 Token roles:', tokenRoles);
        console.log('🔍 User roles:', user?.roles || [user?.role].filter(Boolean));          // Check for discrepancies between token and stored user data
          if (!isExpired && user && tokenRoles.length > 0) {
            const userRoles = user.roles || [user.role].filter(Boolean);
            const hasRoleMismatch = !tokenRoles.some((r: string) => userRoles.includes(r));
            
            if (hasRoleMismatch) {
              console.warn('⚠️ Potential role mismatch between token and stored user data');
            }
          }
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
    // Enhanced role handling - handle different role formats
  const userRoles = Array.isArray(user.roles) ? user.roles : 
                    user.role ? [user.role] : 
                    user.userRole ? [user.userRole] : [];
                    
  console.log('🔍 Checking access with user roles:', userRoles);
  
  // Case-insensitive role comparison with more robust handling
  const hasAccess = userRoles.some(userRole => 
    allowedRoles.some(allowedRole => 
      userRole.toUpperCase() === allowedRole.toUpperCase())
  );
    if (!hasAccess) {
    console.error(`❌ Access denied: User roles "${userRoles.join(', ') || 'unknown'}" not in allowed roles:`, allowedRoles);
    
    // Check if admin is trying to access a route they should have access to
    const isAdminTryingToAccessAdminRoute = userRoles.some(r => r.toUpperCase() === 'ADMIN') && 
                                        allowedRoles.some(r => ['ADMIN', 'PRINCIPAL'].includes(r.toUpperCase()));
    
    if (isAdminTryingToAccessAdminRoute) {
      console.warn('⚠️ Admin user denied access to admin route. Possible token validation issue. Attempting refresh...');
      
      // Try refreshing the token asynchronously
      import('../services/tokenRefreshService').then(({ refreshToken }) => {
        refreshToken().catch(err => console.error('Token refresh failed:', err));
      });
      
      // Allow access despite the role mismatch
      console.log('✅ Granting provisional access to admin user');
      return <>{children}</>;
    }
    
    showNotification({
      type: 'error',
      message: 'Access denied: You do not have permission to view this page',
    });
    return <Navigate to="/dashboard" />;  // Redirect to dashboard instead of root
  }

  console.log('✅ Access granted to:', window.location.pathname);
  return <>{children}</>;
};

export default RoleBasedRoute;