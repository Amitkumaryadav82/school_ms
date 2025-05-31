import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, AuthResponse } from '../services/authService';
import { useNotification } from './NotificationContext';

// Set inactivity timeout to 10 minutes (in milliseconds)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

interface AuthContextType {
  user: AuthResponse | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  resetInactivityTimer: () => void; // Method to reset the inactivity timer
  loading: boolean; // Loading state property
  currentUser?: {
    username: string;
    role: string;
    roles: string[];
    id?: number | string | null;
  };
}

// Add export here so it can be imported in other files
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const inactivityTimerRef = useRef<number | null>(null);

  // Function to reset the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // Only set up the timer if the user is logged in
    if (isAuthenticated) {
      // Clear any existing timer
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }
      
      // Set new timer
      inactivityTimerRef.current = window.setTimeout(() => {
        console.log('⏰ User session expired due to inactivity');
        showNotification({
          type: 'warning',
          message: 'You are being logged out due to inactivity',
        });
        logout();
      }, INACTIVITY_TIMEOUT);

      console.log('⏰ Inactivity timer reset - will expire in 10 minutes if no activity');
    }
  }, [isAuthenticated]);

  // Effect to add event listeners for user activity
  useEffect(() => {
    if (isAuthenticated) {
      // Initialize the timer
      resetInactivityTimer();
      
      // Define event handlers
      const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
      
      // Event handler function
      const handleUserActivity = () => {
        resetInactivityTimer();
      };
      
      // Add event listeners
      activityEvents.forEach(event => {
        document.addEventListener(event, handleUserActivity);
      });
      
      // Cleanup function to remove event listeners
      return () => {
        if (inactivityTimerRef.current) {
          window.clearTimeout(inactivityTimerRef.current);
        }
        activityEvents.forEach(event => {
          document.removeEventListener(event, handleUserActivity);
        });
      };
    }
  }, [isAuthenticated, resetInactivityTimer]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        // Validate token format and expiration
        try {
          // Parse JWT token to check expiration
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          
          // Check if token is expired
          const expiryTime = payload.exp * 1000;
          const currentTime = Date.now();
          const isExpired = currentTime > expiryTime;
          
          if (isExpired) {
            console.error('🔑 Token expired, attempting refresh');
            // Try to refresh the token
            import('../services/tokenRefreshService').then(({ refreshToken }) => {
              refreshToken().then(() => {
                console.log('🔄 Token refreshed during initial authentication');
                // Re-read user data after refresh
                const refreshedUserData = localStorage.getItem('user');
                if (refreshedUserData) {
                  const refreshedParsedUser = JSON.parse(refreshedUserData);
                  setUser(refreshedParsedUser);
                  setIsAuthenticated(true);
                }
              }).catch((error) => {
                console.error('❌ Token refresh failed during initial authentication:', error);
                // Clean up on refresh failure
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              });
            });
            return;
          }
        } catch (tokenError) {
          console.error('❌ Error validating token format:', tokenError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('✅ User authenticated from localStorage:', { username: parsedUser.username, role: parsedUser.role });
      } catch (e) {
        console.error('❌ Error parsing user data from localStorage:', e);
        // Clean up invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('ℹ️ No authentication data found in localStorage');
    }
  }, []);
  const login = async (username: string, password: string) => {
    try {
      setLoading(true); // Set loading to true when starting login
      console.log('🔐 AuthContext: Attempting login for user:', username);
      
      const response = await authService.login({ username, password });
      console.log('✅ AuthContext: Raw login response:', response);
      
      // Handle different response formats
      // Case 1: Axios response with data property
      // Case 2: Direct response with token property
      const authData = response.data ? response.data : response;
      
      if (!authData || (!authData.token && !authData.access_token)) {
        console.error('❌ Invalid response format, missing token:', authData);
        throw new Error('Invalid response from server. Missing authentication token.');
      }
      
      const token = authData.token || authData.access_token;
        // Extract all possible role formats from the response
      let userRole = authData.role || authData.userRole || 'USER';
      let userRoles = authData.roles || authData.authorities || [];
      
      // If there are no roles array but we have a single role, create an array
      if (!Array.isArray(userRoles) || userRoles.length === 0) {
        userRoles = [userRole];
      }
      
      // Create enhanced user data object
      const userData = {
        token: token,
        username: authData.username || username,
        role: userRole, // Keep for backwards compatibility
        roles: userRoles, // Store as array for better role-based access control
        id: authData.id || authData.userId || null // Ensure we have a user ID if available
      };
      
      console.log('✅ Processed user data:', userData);
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData as AuthResponse);
      setIsAuthenticated(true);
      
      // Navigate to dashboard instead of root path
      navigate('/dashboard');
      
      // After successful login, reset the inactivity timer
      resetInactivityTimer();
      
      showNotification({
        type: 'success',
        message: 'Login successful',
      });
    } catch (error: unknown) {
      console.error('❌ Login error in AuthContext:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      } else if (
        error && 
        typeof error === 'object' && 
        'response' in error && 
        error.response && 
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
      ) {
        errorMessage = error.response.data.message;
      }
      
      showNotification({
        type: 'error',
        message: errorMessage,
      });
      
      throw error;
    } finally {
      setLoading(false); // Set loading to false when login completes (success or failure)
    }
  };
  const logout = (reason?: string) => {
    console.log(`🔒 Logging out user${reason ? ` (Reason: ${reason})` : ''}`);
    
    // Clear the inactivity timer when logging out
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    
    // Build the redirect URL with a reason if provided
    const redirectUrl = reason ? `/login?reason=${encodeURIComponent(reason)}` : '/login';
    
    // Use navigate for programmatic redirects within React components
    navigate(redirectUrl);
    
    // Show a notification based on the logout reason
    if (reason === 'expired') {
      showNotification({
        type: 'warning',
        message: 'Your session has expired. Please log in again.',
      });
    } else if (reason === 'invalid') {
      showNotification({
        type: 'error',
        message: 'Authentication error. Please log in again.',
      });
    } else if (reason === 'permission') {
      showNotification({
        type: 'warning',
        message: 'You do not have permission to access that resource.',
      });
    } else {
      showNotification({
        type: 'info',
        message: 'You have been logged out',
      });
    }
  };// Create a user-friendly currentUser object with proper roles
  const currentUser = user ? {
    username: user.username || '',
    role: user.role || 'USER',
    roles: Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : ['USER']),
    id: user.id || null
  } : undefined;

  // Log the currentUser for debugging
  useEffect(() => {
    if (currentUser) {
      console.log('👤 Current user context updated:', {
        username: currentUser.username,
        role: currentUser.role,
        roles: currentUser.roles,
        id: currentUser.id
      });
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      resetInactivityTimer, 
      loading,
      currentUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};