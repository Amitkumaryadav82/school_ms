import apiService from './api.jsx';

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
   * Uses the correct endpoint /api/auth/login
   */
  login: async (credentials: LoginRequest) => {
    console.log('🔐 AuthService: Attempting login with credentials:', {
      username: credentials.username,
      passwordLength: credentials.password ? credentials.password.length : 0
    });

    try {
      console.log('🔑 AuthService: Using login endpoint: /api/auth/login');
      
      // Check if we have a locally cached recent session for offline mode
      if (apiService.isOffline()) {
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
      
      // Online mode - try regular login
      const response = await apiService.post<AuthResponse>('/api/auth/login', credentials);
      console.log('✅ AuthService: Login successful');
      
      // Enhanced debugging - Log auth response details
      console.log('🔍 DEBUG - Auth Response Details:', {
        responseData: response.data,
        token: response.data.token || response.data.access_token,
        username: response.data.username,
        role: response.data.role || response.data.userRole,
        allFields: Object.keys(response.data)
      });
      
      // Cache credentials for potential offline use (expires in 24 hours)
      storageWithTTL.setWithExpiry('offlineAuth', {
        username: credentials.username,
        passwordHash: hashCredentials(credentials.password),
        authData: response.data,
        timestamp: new Date().toISOString()
      }, 86400000); // 24 hours in milliseconds
      
      return response;
    } catch (error: any) {
      console.error('❌ AuthService: Login failed:', error);
      
      // Check if this is a network error but not an offline error
      if (error.status === 'network_error' && !error.isOffline) {
        console.log('🔄 AuthService: Network error - trying to use fallback server');
        try {
          // Force the API service to use the fallback server
          await apiService.getApiInstance(false);
          
          // Try login again with the (hopefully) fallback server
          const fallbackResponse = await apiService.post<AuthResponse>('/api/auth/login', credentials);
          console.log('✅ AuthService: Login successful using fallback server');
          return fallbackResponse;
        } catch (fallbackError) {
          console.error('❌ AuthService: Login failed on fallback server too:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  },

  register: async (userData: RegisterRequest) => {
    try {
      return await apiService.post<AuthResponse>('/auth/register', userData);
    } catch (error: any) {
      // Similar network error handling for register
      if (error.status === 'network_error' && !error.isOffline) {
        console.log('🔄 AuthService: Network error during registration - trying fallback server');
        try {
          await apiService.getApiInstance(false);
          return await apiService.post<AuthResponse>('/auth/register', userData);
        } catch (fallbackError) {
          console.error('❌ AuthService: Registration failed on fallback server too');
          throw fallbackError;
        }
      }
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
    apiService.post('/api/auth/logout', {})
      .then(() => console.log('✅ AuthService: Server logout successful'))
      .catch(e => console.log('ℹ️ AuthService: Server logout failed, but client logout completed'));
  },
  
  validateToken: async (token: string) => {
    try {
      const response = await apiService.post('/api/auth/validate-token', { token });
      return response.data.valid === true;
    } catch (error) {
      console.error('❌ AuthService: Token validation failed:', error);
      // Consider tokens invalid if we can't validate them with server
      return false;
    }
  },
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