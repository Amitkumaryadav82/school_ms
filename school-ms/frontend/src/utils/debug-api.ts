import axios from 'axios';
import config from '../config/environment';

/**
 * Debug utility to test API endpoints with different configurations
 */
export const debugApi = {
  /**
   * Test the fee status report API with direct axios call
   * @param classGrade Optional class grade filter
   * @returns Promise with the response data
   */  testFeeStatusReport: async (classGrade?: number | null) => {
    try {
      // Get user information for debugging
      const userStr = localStorage.getItem('user');
      let userRole = 'unknown';
      let username = 'unknown';
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          userRole = userData.role || 'unknown';
          username = userData.username || 'unknown';
          console.log(`User data from localStorage: ${username} (${userRole})`);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      // Build URL without the apiUrl duplication
      let url = `${config.apiUrl}/api/fees/reports/fee-status`;
      if (classGrade !== undefined && classGrade !== null) {
        url += `?classGrade=${classGrade}`;
      }
      
      console.log(`Testing fee status report with URL: ${url}`);
      
      // Make direct axios call with appropriate headers
      const token = localStorage.getItem('token');
      
      // Log token information
      if (token) {
        try {
          // Decode token parts for inspection (without verification)
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('Token payload:', payload);
            console.log('Token expiration:', new Date(payload.exp * 1000).toLocaleString());
            console.log('Token issued at:', new Date(payload.iat * 1000).toLocaleString());
          }
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
        console.log('Fee status report successful response:', response.data);
      
      // Log details about each record in the response
      if (Array.isArray(response.data)) {
        console.log(`Received ${response.data.length} fee status report records`);
        
        // Check each record's properties for better debugging
        response.data.forEach((record, index) => {
          console.log(`Record ${index + 1}:`, {
            studentId: record.studentId,
            studentName: record.studentName || record.feeName,
            totalAmount: record.totalAmount,
            paidAmount: record.paidAmount,
            remainingAmount: record.remainingAmount,
            status: record.status,
            isOverdue: record.isOverdue,
            hasPaymentData: !!record.paidAmount
          });
        });
      } else {
        console.log('Response is not an array. Actual type:', typeof response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in test fee status report:', error);
      
      // Log detailed error information
      if (axios.isAxiosError(error)) {
        console.error('HTTP Status:', error.response?.status);
        console.error('Response Data:', error.response?.data);
        console.error('Request URL:', error.config?.url);
        console.error('Request Headers:', error.config?.headers);
      }
      
      throw error;
    }
  },
  
  /**
   * Verify the base URL configuration is correct
   * @returns Configuration information
   */
  checkApiConfig: () => {
    const apiUrl = config.apiUrl;
    const isDevEnvironment = import.meta.env.MODE !== 'production';
    
    console.log('API Configuration:', {
      apiUrl,
      environment: import.meta.env.MODE,
      isDevelopment: isDevEnvironment,
    });
    
    return {
      apiUrl,
      environment: import.meta.env.MODE,
      isDevelopment: isDevEnvironment,
    };
  }
};

export default debugApi;
