/**
 * Helper utilities for handling CORS and making cross-origin requests
 * specifically for payment and fee-related functionality
 */

import axios, { AxiosRequestConfig } from 'axios';
import config from '../config/environment';

/**
 * Creates a special request configuration for fee-related endpoints
 * that ensures all necessary CORS headers are included
 */
export const createFeeRequestConfig = (
  additionalHeaders: Record<string, string> = {}
): AxiosRequestConfig => {
  const token = localStorage.getItem('token');
  
  return {
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...additionalHeaders
    }
  };
};

/**
 * Makes a direct payment submission request with special CORS handling
 */
export const submitPaymentWithCorsHandling = async (paymentData: any): Promise<any> => {
  console.log('Making payment request with special CORS handling:', paymentData);
  
  // Create a request config with all necessary headers
  const requestConfig = createFeeRequestConfig();
  
  try {
    // Make the request with axios directly
    const response = await axios.post(
      `${config.apiUrl}/api/fees/payments`, 
      paymentData,
      requestConfig
    );
    
    return response.data;
  } catch (error) {
    console.error('Payment request failed with CORS handling:', error);
    throw error;
  }
};

export default {
  createFeeRequestConfig,
  submitPaymentWithCorsHandling
};
