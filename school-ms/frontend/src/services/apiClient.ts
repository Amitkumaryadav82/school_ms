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
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic and detailed error logging
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as CustomRequestConfig;
    
    // Enhanced error logging
    console.error('API Error Details:', {
      url: originalRequest?.url,
      method: originalRequest?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: originalRequest?.headers,
      data: originalRequest?.data,
      responseData: error.response?.data,
      isAuthError: error.response?.status === 401 || error.response?.status === 403,
      token: originalRequest?.headers?.Authorization ? 'Bearer [Redacted]' : 'No token'
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
      let tokenInfo = null;
      
      // Try to decode the token to provide more information
      try {
        if (token) {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            tokenInfo = {
              exp: new Date(payload.exp * 1000).toISOString(),
              roles: payload.roles || payload.authorities || payload.role || 'Not found in token',
              username: payload.sub || payload.username || 'Not found in token'
            };
          }
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
      
      customError.message = 'Access denied. You don\'t have permission to perform this action.';
      customError.tokenInfo = tokenInfo;
      
      // Log detailed permissions error info
      console.error('Permission Error:', {
        endpoint: originalRequest?.url,
        method: originalRequest?.method?.toUpperCase(),
        tokenPresent: !!token,
        tokenInfo,
        responseData: error.response?.data
      });
    } else if (error.response.status === 401) {
      customError.message = 'Unauthorized. Please log in again.';
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      customError.message = (error.response.data as any)?.message || 'An unexpected error occurred.';
    }
    
    return Promise.reject(customError);
  }
);

export { api };