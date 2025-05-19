import axios from 'axios';
import config from '../config/environment';

// Create a simple API client with sensible defaults
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true  // Enable sending cookies with cross-origin requests
});

// Add authentication token to all requests
apiClient.interceptors.request.use(async config => {
  // Get auth header using the helper that ensures proper format
  const { getAuthHeader } = await import('./authHelper');
  const authHeader = getAuthHeader();
  
  // Fix: ensure we don't have duplicate base URLs
  if (config.url?.startsWith('http://localhost:8080') && config.baseURL?.includes('localhost:8080')) {
    config.url = config.url.replace('http://localhost:8080', '');
    console.warn('Detected and fixed duplicate base URL in request');
  }
    // Add enhanced logging for debugging
  console.log(`Request to ${config.baseURL}${config.url}:`, {
    method: config.method,
    hasToken: !!authHeader,
    tokenFirstChars: authHeader ? `${authHeader.substring(0, 15)}...` : 'none',
    headers: config.headers,
    timestamp: new Date().toISOString()
  });
  
  // Add auth header and enhanced CORS headers
  if (authHeader && config.headers) {
    config.headers.Authorization = authHeader;
    
    // Add cache control headers to avoid CORS preflight issues
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
  }
  return config;
});

// Standard error handling
apiClient.interceptors.response.use(
  response => {
    // Log successful responses for endpoints of interest
    if (response.config.url?.includes('staff') && response.config.url?.includes('employment-status')) {
      console.log('Successful staff status update response:', {
        status: response.status,
        url: response.config.url,
        method: response.config.method,
        data: response.data
      });
    }
    return response;
  },
  error => {
    // Log the complete error for debugging with more detail
    console.error('API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      requestTimestamp: new Date().toISOString()
    });    // For 403 errors, log all possible information to diagnose permission issues
    if (error.response?.status === 403) {
      console.error('Permission Error (403) Details:');
      console.error('Current localStorage token:', localStorage.getItem('token') ? 'Present (first 10 chars): ' + 
        localStorage.getItem('token')?.substring(0, 10) + '...' : 'Missing');
      console.error('User from localStorage:', localStorage.getItem('user'));
      
      // Fix: Ensure we correctly display the URL without duplication
      let fullRequestUrl = '';
      if (error.config?.url?.startsWith('http')) {
        fullRequestUrl = error.config.url;
      } else {
        fullRequestUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
      }
      console.error('Full request URL:', fullRequestUrl);
      
      console.error('Request Method:', error.config?.method?.toUpperCase());
      console.error('Request Headers:', error.config?.headers);
      
      try {
        console.error('Request Payload:', error.config?.data ? JSON.parse(error.config?.data) : 'No data');
      } catch (e) {
        console.error('Raw Request Payload:', error.config?.data);
      }
      
      console.error('Response Body:', error.response?.data);
      
      // Check for role/authorization issues
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          console.error('User role:', userData.role);
          console.error('Required roles for this endpoint may include ADMIN or TEACHER');
        } catch (e) {
          console.error('Could not parse user data');
        }
      }
    }

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
      } else if (error.response?.data?.message) {
        // Single message format
        console.error('Validation message:', error.response.data.message);
      } else if (typeof error.response?.data === 'object') {
        // Log all properties of the error response data
        console.error('Detailed validation error information:');
        Object.entries(error.response.data).forEach(([key, value]) => {
          console.log(`${key}:`, value);
        });
      }
      
      // Log request payload that caused the validation error
      try {
        const requestData = JSON.parse(error.config?.data);
        console.log('Request payload that caused validation error:', requestData);
        
        // Add more detailed validation of payload against expected schema
        const missingRequiredFields = [];
        
        // Check for expected fields in different request types
        if (error.config?.url?.includes('/api/fees/payments')) {
          console.log('Validating payment request payload:');
          
          if (!requestData.feeId) missingRequiredFields.push('feeId');
          if (!requestData.studentId) missingRequiredFields.push('studentId');
          if (!requestData.amount) missingRequiredFields.push('amount');
          if (!requestData.paymentMethod) missingRequiredFields.push('paymentMethod');
          
          if (missingRequiredFields.length > 0) {
            console.error('Missing required fields:', missingRequiredFields);
          }
        }
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
    
  patch: <T>(endpoint: string, data?: any) => 
    apiClient.patch<T>(ensureEndpoint(endpoint), data).then(res => res.data),
    
  // Special method for auth requests that bypasses cache
  authRequest: <T>(endpoint: string, data?: any) => 
    apiClient.post<T>(ensureEndpoint(endpoint), data, {
      headers: {
        // Explicitly disable caching for auth requests
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).then(res => res.data),
    
  // Specialized method for handling file uploads with XLS/CSV, especially for bulk imports
  bulkUpload: <T>(endpoint: string, fileOrData: File | any[], options?: {isFile?: boolean}) => {
    const isFile = options?.isFile ?? (fileOrData instanceof File);
    const url = ensureEndpoint(endpoint);
    
    if (isFile) {
      // Handle file upload case
      const formData = new FormData();
      formData.append('file', fileOrData as File);
      return apiClient.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(res => res.data);
    } else {
      // Handle JSON data case
      return apiClient.post<T>(url, fileOrData).then(res => res.data);
    }
  },
  
  // Method for handling binary responses like PDFs or spreadsheets
  downloadBlob: (endpoint: string, params?: any) => {
    return apiClient.get(ensureEndpoint(endpoint), { 
      responseType: 'blob',
      params 
    }).then(res => res.data);
  },
  
  // Method for handling binary POST responses
  downloadBlobPost: (endpoint: string, data?: any) => {
    return apiClient.post(ensureEndpoint(endpoint), data, { 
      responseType: 'blob' 
    }).then(res => res.data);
  }
};

// Helper function to ensure endpoint has consistent format
function ensureEndpoint(endpoint: string): string {
  // Remove any trailing slashes from the API URL
  const baseUrl = config.apiUrl.endsWith('/') ? config.apiUrl.slice(0, -1) : config.apiUrl;
  
  // If the endpoint already starts with /api/, just add the base URL without double slashes
  if (endpoint.startsWith('/api/')) {
    return `${baseUrl}${endpoint}`;
  }
  
  // If the endpoint starts with /, add api
  if (endpoint.startsWith('/')) {
    return `${baseUrl}/api${endpoint}`;
  }
  
  // Otherwise, add /api/
  return `${baseUrl}/api/${endpoint}`;
}

export default api;
