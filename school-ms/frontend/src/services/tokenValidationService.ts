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
export const validateAdminToken = async (): Promise<TokenValidationResponse> => {
  try {
    // First try client-side validation which is faster
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in local storage');
      return { valid: false, message: 'No authentication token found' };
    }
    
    // Parse and validate the token locally first
    try {
      const payload = parseJwt(token);
      
      if (!payload) {
        console.error('Invalid token format');
        return { valid: false, message: 'Invalid token format' };
      }
      
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const isExpired = currentTime > expiryTime;
      
      if (isExpired) {
        console.error('Token is expired');
        return { 
          valid: false, 
          message: 'Token has expired',
          expiresAt: new Date(expiryTime).toISOString(),
          username: payload.sub || payload.username
        };
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
