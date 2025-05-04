import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, AuthResponse } from '../services/authService';
import { useNotification } from './NotificationContext.js';

// Set inactivity timeout to 10 minutes (in milliseconds)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

interface AuthContextType {
  user: AuthResponse | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  resetInactivityTimer: () => void; // New method to reset the inactivity timer
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
      
      // Create user data object
      const userData = {
        token: token,
        username: authData.username || username,
        role: authData.role || authData.userRole || 'USER' // Default to USER if no role provided
      };
      
      console.log('✅ Processed user data:', userData);
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData as AuthResponse);
      setIsAuthenticated(true);
      navigate('/');
      
      // After successful login, reset the inactivity timer
      resetInactivityTimer();
      
      showNotification({
        type: 'success',
        message: 'Login successful',
      });
    } catch (error) {
      console.error('❌ Login error in AuthContext:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showNotification({
        type: 'error',
        message: errorMessage,
      });
      
      throw error;
    }
  };

  const logout = () => {
    // Clear the inactivity timer when logging out
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
    showNotification({
      type: 'info',
      message: 'You have been logged out',
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, resetInactivityTimer }}>
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