import axios from 'axios';
import config from '../config/environment';

// Create a simple API client with sensible defaults
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add authentication token to all requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Standard error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Log the complete error for debugging
    console.error('API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
    });

    // For server errors (500), log request data for debugging
    if (error.response?.status === 500) {
      console.error('Server Error 500 Details:');
      try {
        console.error('Request URL:', error.config?.url);
        console.error('Request Method:', error.config?.method);
        console.error('Request Payload:', JSON.parse(error.config?.data));
        console.error('Response Data:', error.response?.data);
      } catch (e) {
        console.error('Raw Request Data:', error.config?.data);
      }
    }

    // Enhanced logging for validation errors (400)
    if (error.response?.status === 400) {
      console.error('Validation Error Details:');
      
      // Check for different validation error formats
      if (error.response?.data?.errors) {
        // Spring validation errors typically have this format
        console.table(error.response.data.errors);
      } else if (error.response?.data?.fieldErrors) {
        // Some Spring Boot apps use this format
        console.table(error.response.data.fieldErrors);
      } else if (typeof error.response?.data === 'object') {
        // Log all properties of the error response data
        Object.entries(error.response.data).forEach(([key, value]) => {
          console.log(`${key}:`, value);
        });
      }
      
      // Log request payload that caused the validation error
      try {
        console.log('Request payload that caused validation error:', 
          JSON.parse(error.config?.data));
      } catch (e) {
        console.log('Request payload (could not parse):', error.config?.data);
      }
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Format error messages consistently
    const errorMessage = error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      'An error occurred';
    
    const enhancedError = {
      message: errorMessage,
      status: error.response?.status || 'network_error',
      originalError: error,
      validationErrors: error.response?.data?.errors || error.response?.data?.fieldErrors
    };
    
    return Promise.reject(enhancedError);
  }
);

// Simplified API wrapper with consistent endpoint handling
export const api = {
  get: <T>(endpoint: string, params?: any) => 
    apiClient.get<T>(ensureEndpoint(endpoint), { params }).then(res => res.data),
  
  post: <T>(endpoint: string, data?: any) => 
    apiClient.post<T>(ensureEndpoint(endpoint), data).then(res => res.data),
  
  put: <T>(endpoint: string, data?: any) => 
    apiClient.put<T>(ensureEndpoint(endpoint), data).then(res => res.data),
  
  delete: <T>(endpoint: string) => 
    apiClient.delete<T>(ensureEndpoint(endpoint)).then(res => res.data),
};

// Helper function to ensure endpoint has consistent format
function ensureEndpoint(endpoint: string): string {
  // If the endpoint already starts with /api/, use it as is
  if (endpoint.startsWith('/api/')) {
    return endpoint;
  }
  
  // If the endpoint starts with /, add api
  if (endpoint.startsWith('/')) {
    return `/api${endpoint}`;
  }
  
  // Otherwise, add /api/
  return `/api/${endpoint}`;
}

export default api;
