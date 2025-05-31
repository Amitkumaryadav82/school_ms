/**
 * Payment Handler Service
 * 
 * A comprehensive service that combines all payment-related functionality
 * with enhanced CORS handling and error reporting
 */

import { Payment } from '../types/payment.types';
import { debugSubmitPayment } from '../utils/paymentDebugger';
import { reportPaymentError } from '../services/errorReporting';
import { submitPaymentWithCorsHandling } from '../services/corsHelper';
import { getAuthHeader } from '../services/authHelper';
import api from './api';

/**
 * Process a payment with enhanced error handling and CORS management
 * Attempts multiple submission methods to ensure the payment goes through
 */
export const processPayment = async (payment: Payment): Promise<Payment> => {  try {
    console.log('Processing payment with enhanced handler:', payment);
      // Ensure we have a valid feeId and validate it
    if (!payment.feeId) {
      throw new Error('No fee ID provided. Please ensure a fee structure exists for this student and is correctly assigned.');
    }
    
    // Additional validation to ensure feeId is a valid number
    const feeId = Number(payment.feeId);
    if (isNaN(feeId) || feeId <= 0) {
      throw new Error(`Invalid fee ID: ${payment.feeId}. Please ensure a valid fee structure is assigned to this student.`);
    }
    
    // Transform to match the backend PaymentRequest format
    const paymentRequest = {
      feeId: feeId,
      studentId: Number(payment.studentId),
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 
                    payment.paymentMethod === 'CREDIT_CARD' ? 'CREDIT_CARD' : 
                    payment.paymentMethod === 'UPI' ? 'ONLINE' : 'CASH',
      transactionReference: payment.transactionReference || payment.reference || '',
      remarks: payment.remarks || payment.notes || '',
      // Additional fields
      payerName: payment.payerName || 'Parent/Guardian',
      payerContactInfo: payment.payerContactInfo || '',
      payerRelationToStudent: payment.payerRelationToStudent || 'PARENT',
      receiptNumber: payment.receiptNumber || `RCPT-${new Date().getTime().toString().slice(-8)}`
    };
    
    // Try multiple approaches in sequence to handle CORS issues
    try {
      // Approach 1: Use specialized CORS handler
      try {
        console.log('Attempting payment with CORS handler...');
        const result = await submitPaymentWithCorsHandling(paymentRequest);
        console.log('Payment successful with CORS handler');
        return result;
      } catch (corsError) {
        console.warn('CORS handler payment failed, trying standard API', corsError);
        
        // Approach 2: Use standard API with enhanced headers
        try {
          console.log('Attempting payment with standard API...');
          const response = await api.post<Payment>('/api/fees/payments', paymentRequest);
          console.log('Payment successful with standard API');
          return response;
        } catch (apiError) {
          console.error('Standard API payment failed, trying debug method', apiError);
          
          // Approach 3: Last resort - use debug payment method
          console.log('Attempting payment with debug method...');
          const result = await debugSubmitPayment(paymentRequest);
          console.log('Payment successful with debug method');
          return result;
        }
      }
    } catch (finalError) {
      // All methods failed - generate detailed error report
      const diagnostics = reportPaymentError(finalError, paymentRequest);
      console.error('All payment methods failed. Detailed diagnostics:', diagnostics);
      throw finalError;
    }
  } catch (error) {
    console.error('Error in payment processing:', error);
    throw error;
  }
};

/**
 * Verify if payment was successful by checking receipt status
 */
export const verifyPaymentReceipt = async (receiptNumber: string): Promise<boolean> => {
  try {
    const response = await api.get(`/api/fees/payments/receipt/${receiptNumber}/verify`);
    // Apply type assertion to safely access data property
    const responseData = response as any;
    return !!(responseData?.data?.verified);
  } catch (error) {
    console.error('Error verifying receipt:', error);
    return false;
  }
};

export default {
  processPayment,
  verifyPaymentReceipt
};
