import api from '../services/api';

export interface ApiTestEndpoint {
  name: string;
  fn: () => Promise<any>;
}

export interface ApiTestResult {
  name: string;
  success: boolean;
  status: string | number;
  data?: any;
  error?: string;
}

/**
 * Utility for testing API endpoints to diagnose connectivity issues
 * This separates diagnostic code from the main application components
 */
export const apiDiagnostics = {
  /**
   * Common test endpoints to try when diagnosing API issues
   */
  getCommonEndpoints(entityType: string): ApiTestEndpoint[] {
    return [
      { name: `Get all ${entityType} (api prefix)`, fn: () => api.get(`/${entityType}`) },
      { name: `Get all ${entityType} (singular)`, fn: () => api.get(`/${entityType.slice(0, -1)}`) },
      { name: 'Check auth status', fn: () => api.get('/auth/status') },
    ];
  },

  /**
   * Run a series of API tests to diagnose connectivity issues
   */
  async runApiTests(endpoints: ApiTestEndpoint[]): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 Testing endpoint: ${endpoint.name}`);
        const response = await endpoint.fn();
        results.push({
          name: endpoint.name,
          success: true,
          status: 'OK',
          data: response
        });
      } catch (e: any) {
        results.push({
          name: endpoint.name,
          success: false,
          status: e.status || 'Error',
          error: e.message || JSON.stringify(e)
        });
      }
    }
    
    return results;
  }
};

/**
 * Utility for toggling between real and mock data during development
 * This should not be used in production
 */
export const debugStorage = {
  /**
   * Check if debug mode is enabled
   */
  isDebugModeEnabled(): boolean {
    return localStorage.getItem('debug_mode') === 'true';
  },
  
  /**
   * Enable or disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    localStorage.setItem('debug_mode', enabled ? 'true' : 'false');
  },
  
  /**
   * Check if mock data mode is enabled
   */
  isMockModeEnabled(): boolean {
    return localStorage.getItem('use_mock_data') === 'true';
  },
  
  /**
   * Enable or disable mock data mode
   */
  setMockMode(enabled: boolean): void {
    localStorage.setItem('use_mock_data', enabled ? 'true' : 'false');
  }
};

/**
 * Comprehensive logging utility for payment processing
 * Provides detailed debug information for payment-related operations
 */
export const debugPayment = (action: string, data: any, error?: any) => {
  // Create a timestamp for the log
  const timestamp = new Date().toISOString();
  const prefix = `[PAYMENT DEBUG] [${timestamp}]`;
  
  console.group(`${prefix} ${action}`);
  
  // Log basic information
  console.log('Action:', action);
  console.log('Data:', data);
  
  // If we have payment-specific data, log detailed information
  if (data.studentId) {
    console.log('Student ID:', data.studentId);
    console.log('Fee ID:', data.feeId || data.studentFeeId);
    console.log('Amount:', data.amount);
    console.log('Payment Method:', data.paymentMethod);
  }
  
  // If there's an error, provide detailed error information
  if (error) {
    console.error('Error:', error);
    
    // Check for common error patterns
    if (error.response?.status === 400) {
      console.error('Validation Error Details:');
      const errorData = error.response.data;
      console.table(errorData);
      
      // Check field problems
      const missingFields = [];
      const requiredFields = ['feeId', 'studentId', 'amount', 'paymentMethod'];
      
      for (const field of requiredFields) {
        if (!data[field] && !data[field === 'feeId' ? 'studentFeeId' : field]) {
          missingFields.push(field);
        }
      }
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
      }
    }
  }
  
  console.groupEnd();
  
  // Return the original data or error for chaining
  return error || data;
};

/**
 * Check if a payment object has all required fields according to backend requirements
 */
export const validatePaymentRequest = (payment: any): { valid: boolean; missingFields: string[] } => {
  const requiredFields = [
    'studentId',
    'feeId', // Can also be studentFeeId
    'amount',
    'paymentMethod'
  ];
  
  const missingFields = requiredFields.filter(field => {
    if (field === 'feeId') {
      return !payment.feeId && !payment.studentFeeId;
    }
    return !payment[field];
  });
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
};