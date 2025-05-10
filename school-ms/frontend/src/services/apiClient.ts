import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import config from '../config/environment';

interface CustomRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  _usedFallback?: boolean;
}

interface CustomError {
  message: string;
  status: number | string;
  originalError?: any;
  tokenInfo?: any;
}

const api: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = localStorage.getItem('token');
    
    // Add detailed request logging
    console.log('API Request:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      timestamp: new Date().toISOString(),
      hasToken: !!token,
      tokenFirstChars: token ? `${token.substring(0, 10)}...` : 'none'
    });
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Try to decode token to check expiration
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const expTime = payload.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          
          // Log token expiration status
          console.log('Token status:', {
            isValid: currentTime < expTime,
            expiresIn: `${Math.round((expTime - currentTime) / 1000 / 60)} minutes`,
            expTime: new Date(expTime).toISOString(),
            currentTime: new Date(currentTime).toISOString(),
            roles: payload.roles || payload.authorities || payload.role || 'Not found'
          });
          
          // If token is expired or about to expire in 5 minutes
          if (expTime - currentTime < 300000) {
            console.warn('Token is expired or about to expire soon');
          }
        }
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic and detailed error logging
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    console.log('API Success Response:', {
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      status: response.status,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as CustomRequestConfig;
    
    // Enhanced error logging
    console.error('API Error Details:', {
      url: originalRequest?.url,
      method: originalRequest?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      timestamp: new Date().toISOString(),
      requestHeaders: {
        contentType: originalRequest?.headers?.['Content-Type'],
        hasAuthHeader: !!originalRequest?.headers?.Authorization,
        authHeader: originalRequest?.headers?.Authorization 
          ? `${String(originalRequest?.headers?.Authorization).substring(0, 20)}...` 
          : 'none'
      },
      requestData: originalRequest?.data,
      responseData: error.response?.data,
      isAuthError: error.response?.status === 401 || error.response?.status === 403
    });
    
    // Implement retry logic
    if (!originalRequest._retry && originalRequest.url !== '/api/auth/login') {
      if (!error.response || (error.response.status >= 500 && error.response.status < 600)) {
        if (!originalRequest._retryCount) {
          originalRequest._retryCount = 0;
        }
        
        if (originalRequest._retryCount < config.retryAttempts) {
          originalRequest._retry = true;
          originalRequest._retryCount++;
          
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, originalRequest._retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          console.log(`Retrying request (attempt ${originalRequest._retryCount}):`, {
            url: originalRequest.url,
            method: originalRequest.method?.toUpperCase(),
            timestamp: new Date().toISOString()
          });
          
          return api(originalRequest);
        }
      }
    }
    
    if (!error.response) {
      // Try the fallback URL if the main API is down completely
      if (originalRequest.baseURL === config.apiUrl && !originalRequest._usedFallback) {
        originalRequest.baseURL = config.fallbackApiUrl;
        originalRequest._usedFallback = true;
        return api(originalRequest);
      }
      
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 'network_error',
      } as CustomError);
    }
    
    const customError: CustomError = {
      message: '',
      status: error.response.status,
      originalError: error
    };
    
    // Enhanced error information for auth-related errors
    if (error.response.status === 403) {
      const token = localStorage.getItem('token');
      let tokenInfo: any = null;
      
      // Log the entire URL that's receiving the 403 error
      const fullUrl = `${originalRequest.baseURL}${originalRequest.url}`;
      
      // Try to decode the token to provide more information
      try {
        if (token) {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            tokenInfo = {
              exp: new Date(payload.exp * 1000).toISOString(),
              roles: payload.roles || payload.authorities || payload.role || 'Not found in token',
              username: payload.sub || payload.username || 'Not found in token',
              iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'Not available',
              jti: payload.jti || 'Not available',
              claims: payload, // Log all token claims to help with debugging
              scope: payload.scope || payload.scopes || 'Not found'
            };
            
            // Check if the token is expired
            if (Date.now() > payload.exp * 1000) {
              console.error('Permission denied with EXPIRED token', {
                expiredSince: `${Math.round((Date.now() - payload.exp * 1000) / 1000 / 60)} minutes ago`
              });
            }
          }
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
      
      customError.message = 'Access denied. You don\'t have permission to perform this action.';
      customError.tokenInfo = tokenInfo;
      
      // Log detailed permissions error info
      console.error('Permission Error (403 Forbidden):', {
        endpoint: originalRequest?.url,
        fullUrl,
        method: originalRequest?.method?.toUpperCase(),
        tokenPresent: !!token,
        tokenInfo,
        requestData: originalRequest?.data,
        requestPath: originalRequest?.url?.split('?')[0],
        requestParams: originalRequest?.params,
        requestBody: JSON.stringify(originalRequest?.data),
        responseData: error.response?.data,
        responseHeaders: error.response?.headers,
        timestamp: new Date().toISOString(),
        errorDetail: (error.response?.data as any)?.error || (error.response?.data as any)?.message || 'No error details'
      });
      
      // To help debug server-side permissions, add an additional header for follow-up requests
      if (token && config.headers) {
        localStorage.setItem('last_403_url', fullUrl);
        localStorage.setItem('last_403_time', new Date().toISOString());
        localStorage.setItem('last_403_data', JSON.stringify(originalRequest?.data || {}));
      }
    } else if (error.response.status === 401) {
      customError.message = 'Unauthorized. Please log in again.';
      
      // Log detailed authentication error info
      console.error('Authentication Error (401 Unauthorized):', {
        endpoint: originalRequest?.url,
        method: originalRequest?.method?.toUpperCase(),
        tokenPresent: !!localStorage.getItem('token'),
        responseData: error.response?.data,
        timestamp: new Date().toISOString()
      });
      
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      customError.message = (error.response.data as any)?.message || 'An unexpected error occurred.';
    }
    
    return Promise.reject(customError);
  }
);

export { api };