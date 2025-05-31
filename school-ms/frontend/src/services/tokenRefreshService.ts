import axios from 'axios';
import config from '../config/environment';
import { getAuthHeader } from './authHelper';

/**
 * Service to handle token refresh operations
 */

// Create a special axios instance that won't trigger logout on 401
const refreshClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Capture the current token
let currentRefreshToken: string | null = null;

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;

// Queue of callbacks to execute after token refresh
const refreshCallbacks: Array<(token: string) => void> = [];

/**
 * Attempts to refresh the user's authentication token
 * @returns Promise with the new token or error
 */
export const refreshToken = async (): Promise<string> => {
  try {
    if (isRefreshing) {
      // If already refreshing, return a promise that will resolve when refresh is done
      console.log('🔄 Token refresh already in progress, waiting for it to complete');
      return new Promise<string>((resolve) => {
        refreshCallbacks.push((token: string) => {
          resolve(token);
        });
      });
    }

    // Get current token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token available to refresh');
    }

    isRefreshing = true;
    console.log('🔄 Attempting to refresh authentication token');
    
    // Import user preferences service for logging
    const { logTokenRefresh } = await import('./userPreferencesService');
    
    try {
      // Parse token to get useful information for debugging
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      console.log('Current token info:', { 
        username: payload.sub || payload.username,
        role: payload.role || payload.authorities,
        expiresAt: new Date(expiryTime).toLocaleString(),
        expired: currentTime > expiryTime
      });
    } catch (e) {
      console.warn('Unable to parse token for debugging:', e);
    }
    
    // Call the refresh endpoint
    const response = await refreshClient.post('/api/auth/refresh', {
      token: token
    });
    
    const newToken = response.data.token || response.data.access_token;
    
    if (!newToken) {
      const error = new Error('No token received from refresh endpoint');
      logTokenRefresh(false, error.message);
      throw error;
    }
    
    // Update token in localStorage
    localStorage.setItem('token', newToken);
    console.log('✅ Token refreshed successfully');
    
    // Log successful refresh
    logTokenRefresh(true);
    
    // Update user info if available in the response
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('✅ User data updated with refresh response');
    }
    
    // Execute any pending callbacks with the new token
    refreshCallbacks.forEach(callback => callback(newToken));
    refreshCallbacks.length = 0;
    
    return newToken;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    
    // Import user preferences service for error logging
    try {
      const { logTokenRefresh } = await import('./userPreferencesService');
      logTokenRefresh(false, (error as Error).message || 'Unknown refresh error');
    } catch (e) {
      console.error('Failed to log token refresh error:', e);
    }
    
    // Don't trigger logout here - leave that to the calling code
    throw error;
  } finally {
    isRefreshing = false;
  }
};

/**
 * Adds refresh token interceptor to an axios instance
 * @param axiosInstance The axios instance to add the interceptor to
 */
export const setupRefreshInterceptor = (axiosInstance: any) => {
  axiosInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;
      
      // Prevent infinite refresh loops
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          const newToken = await refreshToken();
          
          // Update the failed request with new token and retry
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, let the original error propagate
          return Promise.reject(error);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

export default {
  refreshToken,
  setupRefreshInterceptor
};
