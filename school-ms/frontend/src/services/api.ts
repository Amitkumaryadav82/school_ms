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
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Format error messages consistently
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const enhancedError = {
      message: errorMessage,
      status: error.response?.status || 'network_error',
      originalError: error
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
