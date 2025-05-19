/**
 * Error reporting service for payment and CORS issues
 * This service helps collect diagnostic information for troubleshooting payment-related problems
 */

// List of common CORS and payment error patterns to identify
const ERROR_PATTERNS = {
  CORS: [
    'has been blocked by CORS policy',
    'Access-Control-Allow-Origin',
    'Request header field',
    'is not allowed by',
    'preflight response',
    'Network Error'
  ],
  PAYMENT: [
    'feeId',
    'studentId',
    'amount',
    'Invalid payment',
    'Payment failed',
    'Fee structure not found'
  ],
  FEE_NOT_FOUND: [
    'Fee not found',
    'with id:',
    '404 Not Found',
    'EntityNotFoundException'
  ]
};

/**
 * Collects detailed diagnostic information about a payment error
 * @param error The error that occurred
 * @param paymentData The payment data that was being submitted
 * @returns Object with diagnostic information
 */
export const collectPaymentErrorDiagnostics = (error: any, paymentData?: any) => {
  const timestamp = new Date().toISOString();
  const errorType = identifyErrorType(error);
    const diagnostics = {
    timestamp,
    errorType,
    message: error.message || 'Unknown error',
    status: error.response?.status || 'unknown',
    browser: navigator.userAgent,
    url: error.config?.url || 'unknown',
    corsRelated: errorType === 'CORS',
    validationRelated: errorType === 'VALIDATION',
    feeNotFoundRelated: errorType === 'FEE_NOT_FOUND',
    details: {
      responseData: error.response?.data,
      responseHeaders: error.response?.headers,
      requestHeaders: error.config?.headers,
      paymentData: sanitizePaymentData(paymentData)
    },
    errorStack: error.stack
  };
  
  return diagnostics;
};

/**
 * Removes sensitive data from payment information before logging
 */
const sanitizePaymentData = (data: any) => {
  if (!data) return null;
  
  // Create a copy to avoid modifying the original
  const sanitized = { ...data };
  
  // Remove potentially sensitive fields
  delete sanitized.cardNumber;
  delete sanitized.cvv;
  delete sanitized.pin;
  delete sanitized.password;
  
  return sanitized;
};

/**
 * Identifies the type of error based on error details
 */
const identifyErrorType = (error: any): 'CORS' | 'VALIDATION' | 'NETWORK' | 'SERVER' | 'FEE_NOT_FOUND' | 'UNKNOWN' => {
  // Check if it's a "Fee not found" error
  if (error.response?.status === 404 &&
      ERROR_PATTERNS.FEE_NOT_FOUND.some(pattern => 
        error.response?.data?.message?.includes(pattern) || 
        error.message?.includes(pattern) ||
        error.toString().includes(pattern))) {
    return 'FEE_NOT_FOUND';
  }
  
  // Check if it's a CORS error
  if (ERROR_PATTERNS.CORS.some(pattern => 
      error.message?.includes(pattern) || 
      error.toString().includes(pattern) ||
      error.response?.data?.message?.includes(pattern))) {
    return 'CORS';
  }
  
  // Check if it's a validation error
  if (error.response?.status === 400 || 
      error.response?.data?.validationErrors ||
      error.response?.data?.fieldErrors) {
    return 'VALIDATION';  
  }
  
  // Check if it's a network error
  if (error.message?.includes('Network Error') || !error.response) {
    return 'NETWORK';
  }
  
  // Check if it's a server error
  if (error.response?.status >= 500) {
    return 'SERVER';
  }
  
  return 'UNKNOWN';
};

/**
 * Reports payment errors to console and could be extended to send to a logging service
 */
export const reportPaymentError = (error: any, paymentData?: any) => {
  const diagnostics = collectPaymentErrorDiagnostics(error, paymentData);
  
  console.group(`Payment Error Report [${diagnostics.timestamp}]`);
  console.error(`Error Type: ${diagnostics.errorType}`);
  console.error(`Message: ${diagnostics.message}`);
  console.error(`Status: ${diagnostics.status}`);
  
  if (diagnostics.corsRelated) {
    console.error('This appears to be a CORS-related issue');
    console.error('CORS Troubleshooting:');
    console.error('1. Check backend CORS configuration');
    console.error('2. Verify allowed origins and headers');
    console.error('3. Ensure preflight requests are handled correctly');
  }
  
  if (diagnostics.validationRelated) {
    console.error('This appears to be a validation error');
    console.error('Validation details:', diagnostics.details.responseData);
  }
  
  if (diagnostics.errorType === 'FEE_NOT_FOUND') {
    console.error('This is a "Fee not found" error');
    console.error('Troubleshooting steps:');
    console.error('1. Create a fee structure for the student\'s grade');
    console.error('2. Check if the feeId parameter is correct');
    console.error('3. Ensure the fee structure exists in the database');
    console.error('4. Check the fee structure to payment mapping');
    
    // Add feeNotFoundRelated property to diagnostics
    diagnostics.feeNotFoundRelated = true;
  }
  
  console.error('Full diagnostics:', diagnostics);
  console.groupEnd();
  
  return diagnostics;
};

export default {
  reportPaymentError,
  collectPaymentErrorDiagnostics
};
