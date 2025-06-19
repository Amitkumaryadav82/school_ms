import axios from 'axios';
import config from '../config/environment';

/**
 * A simplified API call function for making HTTP requests
 * 
 * @param endpoint - The API endpoint to call
 * @param method - The HTTP method to use (GET, POST, PUT, DELETE)
 * @param data - Optional data to send with the request
 * @returns Promise with the response data
 */
export const apiCall = async (endpoint: string, method: string, data?: any) => {
  try {
    // Get the authentication token from local storage
    const token = localStorage.getItem('token');
    
    // Create headers with authentication token if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Ensure the endpoint starts with a slash
    const url = endpoint.startsWith('/') 
      ? `${config.apiUrl}${endpoint}` 
      : `${config.apiUrl}/${endpoint}`;
    
    // Make the API call
    const response = await axios({
      method,
      url,
      data: method !== 'GET' ? data : undefined,
      params: method === 'GET' ? data : undefined,
      headers
    });
    
    return response.data;
  } catch (error: any) {
    // Handle and transform error
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const statusCode = error.response?.status || 500;
    
    console.error(`API Error (${statusCode}):`, errorMessage);
    
    throw {
      message: errorMessage,
      status: statusCode,
      originalError: error
    };
  }
};
