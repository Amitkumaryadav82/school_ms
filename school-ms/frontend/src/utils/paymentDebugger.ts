/**
 * Special debugging entry points for payment processing
 * This provides a direct troubleshooting interface for payment errors
 * Only for development and testing purposes
 */

import api from '../services/api';
import axios from 'axios';
import config from '../config/environment';

/**
 * Direct payment submission bypassing the normal service layer
 * Use this for debugging when the normal flow fails
 */
export const debugSubmitPayment = async (paymentData: any): Promise<any> => {
  console.log('🔍 DEBUG: Submitting payment directly', paymentData);
  
  try {
    // Ensure we have the minimal required fields
    const minimalPayment = {
      feeId: paymentData.feeId || paymentData.studentFeeId || null,
      studentId: paymentData.studentId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionReference: paymentData.transactionReference || paymentData.reference || '',
      remarks: paymentData.remarks || paymentData.notes || '',
      payerName: paymentData.payerName || 'Parent/Guardian',
      payerContactInfo: paymentData.payerContactInfo || '',
      payerRelationToStudent: 'PARENT',
      receiptNumber: paymentData.receiptNumber || `RCPT-${Date.now()}`
    };
    
    console.log('Submitting minimal payment data:', minimalPayment);
    
    // Try both with Axios directly and with our API wrapper
    const results = await Promise.allSettled([
      // Try 1: Using our API wrapper
      api.post('/api/fees/payments', minimalPayment),
      
      // Try 2: Using Axios directly
      axios.post(`${config.apiUrl}/api/fees/payments`, minimalPayment, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      })
    ]);
    
    console.log('Debug payment submission results:', results);
    
    // Return the successful result if any
    const successfulResult = results.find(r => r.status === 'fulfilled');
    if (successfulResult && successfulResult.status === 'fulfilled') {
      return successfulResult.value;
    }
    
    // If both failed, throw the first error
    if (results[0].status === 'rejected') {
      throw (results[0] as PromiseRejectedResult).reason;
    } else {
      throw (results[1] as PromiseRejectedResult).reason;
    }
  } catch (error) {
    console.error('Error in debug payment submission:', error);
    throw error;
  }
};

export default { debugSubmitPayment };
