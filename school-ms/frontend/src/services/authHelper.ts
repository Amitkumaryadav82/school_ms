/**
 * Helper functions for CORS and authentication related tasks
 */
import axios, { AxiosRequestConfig } from 'axios';
import config from '../config/environment';

/**
 * Gets the authentication header with the current token
 * Returns an empty string instead of null for easier composition
 */
export const getAuthHeader = (): string => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
};

/**
 * Creates a fetch function specifically for authentication requests
 * This adds all the necessary headers to avoid CORS preflight issues
 */
export const createAuthRequest = () => {
  const authClient = axios.create({
    baseURL: config.apiUrl,
    timeout: config.apiTimeout,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  
  // Add request/response interceptors similar to the main API client
  authClient.interceptors.request.use(config => {
    // Log auth requests for debugging
    console.log(`Auth request to ${config.url}`, {
      method: config.method,
      headers: config.headers,
      timestamp: new Date().toISOString()
    });
    
    return config;
  });
  
  authClient.interceptors.response.use(
    response => response,
    error => {
      console.error('Auth Request Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      
      return Promise.reject(error);
    }
  );
  
  return authClient;
};

/**
 * Direct fetch method for authentication endpoints that bypasses normal API
 * Use this for login/register when experiencing CORS issues
 */
export const authFetch = async <T>(endpoint: string, data: any): Promise<T> => {
  const authClient = createAuthRequest();
  
  try {
    // Ensure endpoint has proper format
    let url = endpoint;
    if (!url.startsWith('/') && !url.startsWith('http')) {
      url = `/api/${endpoint}`;
    } else if (url.startsWith('/') && !url.startsWith('/api/')) {
      url = `/api${url}`;
    }
    
    // Make the request with all necessary headers
    const response = await authClient.post<T>(url, data);
    return response.data;
  } catch (error) {
    console.error('Auth fetch failed:', error);
    throw error;
  }
};

export default { authFetch, createAuthRequest };
