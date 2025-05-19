import api from './api';

// Custom JWT decode function to avoid needing the jwt-decode package
export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role?: string;
  fullName?: string;
}

export interface AuthResponse {
  token?: string;
  access_token?: string;
  username?: string;
  role?: string;
  userRole?: string;
  [key: string]: any; // Allow for other properties
}

// Implement storage with TTL for offline capabilities
const storageWithTTL = {
  setWithExpiry: (key: string, value: any, ttl: number) => {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  getWithExpiry: (key: string) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    try {
      const item = JSON.parse(itemStr);
      const now = new Date();
      
      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (e) {
      console.error('Error parsing stored item with TTL:', e);
      localStorage.removeItem(key);
      return null;
    }
  },
  
  remove: (key: string) => {
    localStorage.removeItem(key);
  }
};

export const authService = {
  /**
   * Attempt to login with provided credentials
   */
  login: async (credentials: LoginRequest) => {
    console.log('🔐 AuthService: Attempting login with credentials:', {
      username: credentials.username,
      passwordLength: credentials.password ? credentials.password.length : 0
    });

    try {
      // Check if we have a locally cached recent session for offline mode
      const isOffline = !navigator.onLine;
      if (isOffline) {
        console.log('📵 AuthService: Device is offline, checking for cached credentials');
        const cachedAuth = storageWithTTL.getWithExpiry('offlineAuth');
        
        if (cachedAuth && 
            cachedAuth.username === credentials.username && 
            cachedAuth.passwordHash === hashCredentials(credentials.password)) {
          console.log('✅ AuthService: Using cached credentials for offline mode');
          return {
            data: cachedAuth.authData,
            offlineMode: true
          };
        } else {
          console.error('❌ AuthService: No valid cached credentials found for offline mode');
          throw {
            message: 'You appear to be offline. Cannot authenticate without internet connection.',
            status: 'network_error',
            isOffline: true
          };
        }
      }
      
      // Online mode - first try with the enhanced auth request
      try {
        console.log('🔄 AuthService: Trying login with enhanced CORS handling...');
        // Import authHelper for direct fetch
        const { authFetch } = await import('./authHelper');
        
        const response = await authFetch<AuthResponse>('/auth/login', credentials);
        console.log('✅ AuthService: Login successful with enhanced CORS handling');
        
        // Enhanced debugging - Log auth response details
        console.log('🔍 DEBUG - Auth Response Details:', {
          responseData: response,
          token: response.token || response.access_token,
          username: response.username,
          role: response.role || response.userRole,
          allFields: Object.keys(response)
        });
        
        // Cache credentials for potential offline use (expires in 24 hours)
        storageWithTTL.setWithExpiry('offlineAuth', {
          username: credentials.username,
          passwordHash: hashCredentials(credentials.password),
          authData: response,
          timestamp: new Date().toISOString()
        }, 86400000); // 24 hours in milliseconds
        
        return response;
      } catch (corsError) {
        console.warn('⚠️ Enhanced auth request failed, falling back to standard request:', corsError);
        
        // Fallback to regular API request
        const response = await api.authRequest<AuthResponse>('/auth/login', credentials);
        console.log('✅ AuthService: Login successful with fallback method');
        
        // Cache credentials as before
        storageWithTTL.setWithExpiry('offlineAuth', {
          username: credentials.username,
          passwordHash: hashCredentials(credentials.password),
          authData: response,
          timestamp: new Date().toISOString()
        }, 86400000);
        
        return response;
      }
    } catch (error: any) {
      console.error('❌ AuthService: Login failed:', error);
      
      // Enhanced error handling for CORS issues
      if (error.message && (
          error.message.includes('Network Error') || 
          error.message.includes('CORS') || 
          error.message.includes('header field') || 
          error.status === 0)) {
        console.error('🔄 CORS Issue Detected: Adding detailed diagnostic info');
        throw {
          ...error,
          message: 'Authentication failed due to CORS issues. Please try again or contact support.',
          corsIssue: true,
          diagnostics: {
            browser: navigator.userAgent,
            time: new Date().toISOString(),
            corsHeaders: ['Authorization', 'Content-Type', 'Cache-Control']
          }
        };
      }
      
      throw error;
    }
  },
  register: async (userData: RegisterRequest) => {
    try {
      return await api.authRequest<AuthResponse>('/auth/register', userData);
    } catch (error: any) {
      console.error('❌ AuthService: Registration failed:', error);
      throw error;
    }
  },
  
  logout: () => {
    console.log('🔒 AuthService: Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    storageWithTTL.remove('offlineAuth');
      // Try to call logout endpoint, but don't wait for it or handle errors
    // as we want the client-side logout to be reliable even if server is down
    api.authRequest('/auth/logout', {})
      .then(() => console.log('✅ AuthService: Server logout successful'))
      .catch(e => console.log('ℹ️ AuthService: Server logout failed, but client logout completed'));
  },
    validateToken: async (token: string) => {
    try {
      const response = await api.authRequest<{valid: boolean}>('/auth/validate-token', { token });
      return response.valid === true;
    } catch (error) {
      console.error('❌ AuthService: Token validation failed:', error);
      // Consider tokens invalid if we can't validate them with server
      return false;
    }
  },
};

/**
 * Specifically checks if the current user has permission to update staff employment status
 * This requires either ADMIN or HR_MANAGER role
 * @returns {boolean} true if user has required role, false otherwise
 */
export const hasStaffStatusUpdatePermission = (): boolean => {
  const user = getCurrentUser();
  
  // Enhanced debugging for permission check
  console.log(`[AUTH DEBUG] [${new Date().toISOString()}] Checking staff status update permission`);
  
  if (!user) {
    console.log(`[AUTH DEBUG] [${new Date().toISOString()}] Permission check failed: No user found`);
    return false;
  }
  
  console.log(`[AUTH DEBUG] [${new Date().toISOString()}] User role: ${user.role}`);
  console.log(`[AUTH DEBUG] [${new Date().toISOString()}] Token present: ${!!localStorage.getItem('token')}`);
  
  if (localStorage.getItem('token')) {
    const tokenSample = localStorage.getItem('token')?.substring(0, 15) + '...';
    console.log(`[AUTH DEBUG] [${new Date().toISOString()}] Token sample: ${tokenSample}`);
  }
  
  const hasPermission = user.role === 'ADMIN' || user.role === 'HR_MANAGER';
  console.log(`[AUTH DEBUG] [${new Date().toISOString()}] Has permission: ${hasPermission}`);
  
  return hasPermission;
};

// Simple hashing function for offline validation - not for real security
function hashCredentials(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

function getCurrentUser(): { role: string } | null {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error(`[AUTH DEBUG] [${new Date().toISOString()}] Error parsing user JSON:`, error);
    return null;
  }
}