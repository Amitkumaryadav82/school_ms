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

// Response interceptor with retry logic
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as CustomRequestConfig;
    
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
    
    switch (error.response.status) {
      case 401:
        customError.message = 'Unauthorized. Please log in again.';
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        customError.message = 'Access denied.';
        break;
      default:
        customError.message = (error.response.data as any)?.message || 'An unexpected error occurred.';
    }
    
    return Promise.reject(customError);
  }
);

export { api };