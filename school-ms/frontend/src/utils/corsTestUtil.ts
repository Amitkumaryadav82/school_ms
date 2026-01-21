import config from '../config/environment';
import axios from 'axios';

/**
 * Utility to test CORS connections to different backend endpoints
 */
const corsTestUtil = {
  /**
   * Test a basic CORS endpoint that bypasses security
   */
  testCorsEndpoint: async () => {
    try {
      console.log('Testing CORS diagnostics endpoint...');
      const response = await axios({
        method: 'GET',
        url: `${config.apiUrl}/api/diagnostics/cors-test`,
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Header': 'test-value'
        },
        withCredentials: true
      });
      
      console.log('CORS test successful:', response.data);
      return {
        success: true,
        message: 'CORS test endpoint accessible',
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      console.error('CORS test failed:', error);
      return {
        success: false,
        message: `CORS test failed: ${error instanceof Error ? error.message : String(error)}`,
        error
      };
    }
  },
  
  /**
   * Test sending a POST request to check if complex CORS requests work
   */
  testCorsPostRequest: async () => {
    try {
      console.log('Testing CORS POST endpoint...');
      const response = await axios({
        method: 'POST',
        url: `${config.apiUrl}/api/diagnostics/cors-test`,
        data: { test: 'data' },
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('CORS POST test successful:', response.data);
      return {
        success: true,
        message: 'CORS POST endpoint accessible',
        data: response.data
      };
    } catch (error) {
      console.error('CORS POST test failed:', error);
      return {
        success: false,
        message: `CORS POST test failed: ${error instanceof Error ? error.message : String(error)}`,
        error
      };
    }
  },
  
  /**
   * Run a comprehensive CORS test suite
   */
  runCorsDiagnostics: async () => {
    const results = {
      basicTest: await corsTestUtil.testCorsEndpoint(),
      postTest: await corsTestUtil.testCorsPostRequest()
    };
    
    console.log('CORS diagnostics completed:', results);
    return results;
  }
};

export default corsTestUtil;
