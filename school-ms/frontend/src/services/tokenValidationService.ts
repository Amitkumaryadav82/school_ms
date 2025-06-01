// Token validation utility for admin dashboard
import api from './api';
import { parseJwt } from './authService';

// Type for token validation response
interface TokenValidationResponse {
  valid: boolean;
  username?: string;
  roles?: string[];
  expiresAt?: string;
  message?: string;
}

/**
 * Validates the user's token before performing critical operations
 * This is especially useful for the Admin dashboard where multiple API calls
 * might be triggered at once
 */
export const validateAdminToken = async (): Promise<TokenValidationResponse> => {  try {
    // First try client-side validation which is faster
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in local storage');
      // Less strict - just tell the caller to get a new token rather than saying invalid
      return { 
        valid: false, 
        message: 'No authentication token found, needs to login or refresh',
        needsRefresh: true
      };
    }
    
    // Parse and validate the token locally first
    try {
      const payload = parseJwt(token);
      
      if (!payload) {
        console.error('Invalid token format');
        return { valid: false, message: 'Invalid token format', needsRefresh: true };
      }
      
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const isExpired = currentTime > expiryTime;
      
      // Timeframe check - more lenient approach
      const timeToExpiry = (expiryTime - currentTime) / (1000 * 60); // Minutes
      
      if (isExpired) {
        // Check how long ago it expired - if within 48 hours, it might be refreshable
        // Extended from 24 to 48 for better UX during weekend usage
        const expiredAgoMs = currentTime - expiryTime;
        const expiredHours = expiredAgoMs / (1000 * 60 * 60);
        
        if (expiredHours < 48) {
          console.warn(`Token expired ${expiredHours.toFixed(2)} hours ago, attempting to refresh automatically`);
          try {
            // Try to automatically refresh the token here instead of returning invalid
            const { refreshToken } = await import('./tokenRefreshService');
            await refreshToken();
            // If refresh succeeds, consider the token valid now (even though we used a new one)
            console.log('✅ Automatic token refresh successful during validation');
            return { 
              valid: true,
              message: 'Token automatically refreshed',
              expiresAt: new Date(Date.now() + (60 * 60 * 1000)).toISOString(), // Approximate new expiry
              username: payload.sub || payload.username,
              autoRefreshed: true
            };
          } catch (refreshErr) {
            console.warn('Automatic token refresh failed, will let caller handle it:', refreshErr);
            // Don't immediately fail - let the calling code try to refresh it again if needed
            return { 
              valid: false, 
              message: 'Token has expired but might be refreshable',
              expiresAt: new Date(expiryTime).toISOString(),
              username: payload.sub || payload.username,
              needsRefresh: true
            };
          }
        } else {
          console.error('Token is expired beyond refresh window');
          return { 
            valid: false, 
            message: 'Token has expired and is too old to refresh',
            expiresAt: new Date(expiryTime).toISOString(),
            username: payload.sub || payload.username
          };
        }
      }
      
      // Proactively refresh if token will expire soon
      if (timeToExpiry < 10) {
        console.warn(`Token will expire soon (${timeToExpiry.toFixed(2)} minutes), starting proactive refresh`);
        // Start async refresh but don't wait for it - consider token still valid
        try {
          const { refreshToken } = await import('./tokenRefreshService');
          refreshToken().catch(err => console.warn('Proactive token refresh failed:', err));
          console.log('Proactive token refresh initiated in background');
        } catch (e) {
          console.warn('Failed to start proactive token refresh:', e);
        }
      }
      
      // Extract roles from token
      const roles = Array.isArray(payload.roles) ? 
        payload.roles : 
        (payload.authorities || (payload.role ? [payload.role] : []));
      
      // Check for Admin role
      const isAdmin = roles.some((r: string) => r.toUpperCase() === 'ADMIN');
      
      console.log('Token validation result:', {
        valid: true,
        isAdmin,
        username: payload.sub || payload.username,
        expiresAt: new Date(expiryTime).toLocaleString(),
        timeLeft: `${Math.round((expiryTime - currentTime) / 1000 / 60)} minutes`
      });
      
      // If token is valid locally, return validation result
      return {
        valid: true,
        username: payload.sub || payload.username,
        roles,
        expiresAt: new Date(expiryTime).toISOString()
      };
    } catch (e) {
      console.error('Error parsing JWT token:', e);
    }
      // If client-side validation fails or we want to double-check with server,
    // make a lightweight call to the server to validate the token
    const response = await api.get('/auth/validate-token');
    // Apply type assertion for response
    const typedResponse = response as any;
    return { 
      valid: true,
      ...(typedResponse || {})
    };
  } catch (error: any) {
    console.error('Token validation error:', error);
    
    // If there was a network error or the server explicitly invalidated the token
    return { 
      valid: false, 
      message: error.message || 'Token validation failed'
    };
  }
};

export default { validateAdminToken };
