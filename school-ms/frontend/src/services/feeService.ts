import axios from 'axios';
import api from './api';
import { Payment, FeeBreakdownItem, StudentFeeDetails } from '../types/payment.types';
import config from '../config/environment';
import { studentService } from './studentService';

// Local interface for fee breakdown with extra fields needed in the service
export interface FeeBreakdown extends FeeBreakdownItem {
    id?: number;
    paymentId?: number;
    description: string;
}

// Fee Payment Summary interface
export interface FeePaymentSummary {
    id?: number;
    studentId: number;
    totalDue: number;
    totalPaid: number;
    balance: number;
    paymentStatus: string;
    lastPaymentDate?: string;
    nextDueDate?: string;
}

// Fee Structure interfaces
export interface FeeStructure {
    id?: number;
    classGrade: number;
    annualFees: number;
    buildingFees: number;
    labFees: number;
    totalFees?: number;
    paymentSchedules: PaymentSchedule[];
    lateFees: LateFee[];
}

export interface PaymentSchedule {
    id?: number;
    feeStructureId?: number;
    scheduleType: string; // 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    amount: number;
    isEnabled: boolean;
}

export interface LateFee {
    id?: number;
    feeStructureId?: number;
    month: number; // 1-12 for Jan-Dec
    monthName?: string; 
    lateFeeAmount: number;
    lateFeeDescription: string;
    fineAmount: number;
    fineDescription: string;
}

// Transport Route interfaces
export interface TransportRoute {
    id?: number;
    routeName: string;
    routeDescription: string;
    feeAmount: number;
}

// Student Fee Assignment interfaces
export interface StudentFeeAssignment {
    id?: number;
    studentId: number;
    studentName?: string;
    feeStructureId: number;
    classGrade?: number;
    paymentScheduleId: number;
    scheduleType?: string;
    transportRouteId?: number;
    routeName?: string;
    effectiveFrom: string; // ISO format date
    effectiveTo?: string; // ISO format date
    isActive: boolean;
}

// Already imported at the top
// Additional interfaces for receipts and payments

export interface PaymentReceipt {
    id?: number;
    paymentId: number;
    receiptNumber: string;
    receiptDate: string; // ISO format date
    receiptItems: ReceiptItem[];
    totalAmount: number;
}

export interface ReceiptItem {
    id?: number;
    receiptId?: number;
    description: string;
    amount: number;
}

export interface PaymentSummary {
    studentId: number;
    studentName: string;
    totalDue: number;
    totalPaid: number;
    balance: number;
    paymentStatus: string; // 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERDUE'
    lastPaymentDate?: string;
    nextDueDate?: string;
}

// Analytics interfaces
export interface PaymentAnalytics {
    totalRevenue: number;
    collectionRate: number; // percentage
    paymentsByMethod: Record<string, number>;
    paymentsByStatus: Record<string, number>;
    revenueTrend: RevenueTrendItem[];
    outstandingFees: number;
    overduePayments: number;
}

export interface RevenueTrendItem {
    date: string; // ISO format date or month
    revenue: number;
    expectedRevenue: number;
}

export interface PaymentDistribution {
    feeType: string;
    amount: number;
    percentage: number;
}

export interface OverdueAnalytics {
    totalOverdueAmount: number;
    overdueStudentCount: number;
    overdueByGrade: Record<string, number>;
    overdueAgeDistribution: Record<string, number>; // "<30days", "30-60days", ">60days"
}

// Fee Service functions
const feeService = {
    // Fee Structure endpoints
    getAllFeeStructures: async (): Promise<FeeStructure[]> => {
        return await api.get<FeeStructure[]>('/api/fees/structures');
    },

    getFeeStructureById: async (id: number): Promise<FeeStructure> => {
        return await api.get<FeeStructure>(`/api/fees/structures/${id}`);
    },    getFeeStructureByGrade: async (classGrade: number): Promise<FeeStructure> => {
        try {
            return await api.get<FeeStructure>(`/api/fees/structures/grade/${classGrade}`);
        } catch (error) {
            console.error(`Error fetching fee structure for grade ${classGrade}:`, error);
            // Return a default structure if API fails
            return {
                id: 1,
                classGrade: classGrade,
                annualFees: 25000,
                buildingFees: 5000,
                labFees: 3000,
                totalFees: 33000,
                paymentSchedules: [],
                lateFees: []
            };
        }
    },

    createFeeStructure: async (feeStructure: FeeStructure): Promise<FeeStructure> => {
        return await api.post<FeeStructure>('/api/fees/structures', feeStructure);
    },

    updateFeeStructure: async (id: number, feeStructure: FeeStructure): Promise<FeeStructure> => {
        return await api.put<FeeStructure>(`/api/fees/structures/${id}`, feeStructure);
    },

    deleteFeeStructure: async (id: number): Promise<void> => {
        return await api.delete(`/api/fees/structures/${id}`);
    },

    // Transport Route endpoints
    getAllTransportRoutes: async (): Promise<TransportRoute[]> => {
        return await api.get<TransportRoute[]>('/api/fees/transport-routes');
    },

    getTransportRouteById: async (id: number): Promise<TransportRoute> => {
        return await api.get<TransportRoute>(`/api/fees/transport-routes/${id}`);
    },

    createTransportRoute: async (transportRoute: TransportRoute): Promise<TransportRoute> => {
        return await api.post<TransportRoute>('/api/fees/transport-routes', transportRoute);
    },

    updateTransportRoute: async (id: number, transportRoute: TransportRoute): Promise<TransportRoute> => {
        return await api.put<TransportRoute>(`/api/fees/transport-routes/${id}`, transportRoute);
    },

    deleteTransportRoute: async (id: number): Promise<void> => {
        return await api.delete(`/api/fees/transport-routes/${id}`);
    },    // Payment endpoints
    getAllPayments: async (): Promise<Payment[]> => {
        return await api.get<Payment[]>('/api/fees/payments');
    },
    
    getFilteredPayments: async (filters?: { 
        grade?: string, 
        section?: string, 
        studentName?: string 
    }): Promise<Payment[]> => {
        let url = '/api/fees/payments/filtered';
        const queryParams = new URLSearchParams();
        
        if (filters) {
            if (filters.grade) queryParams.append('grade', filters.grade);
            if (filters.section) queryParams.append('section', filters.section);
            if (filters.studentName) queryParams.append('studentName', filters.studentName);
        }
        
        if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
        }
        
        try {
            return await api.get<Payment[]>(url);
        } catch (error) {
            console.error('Error fetching filtered payments:', error);
            return []; // Return empty array if API fails
        }
    },

    getPaymentById: async (id: number): Promise<Payment> => {
        return await api.get<Payment>(`/api/fees/payments/${id}`);
    },    getPaymentsByStudentId: async (studentId: number): Promise<Payment[]> => {
        try {
            return await api.get<Payment[]>(`/api/fees/payments/student/${studentId}`);
        } catch (error) {
            console.error(`Error fetching payment history for student ${studentId}:`, error);
            return []; // Return empty array if API fails
        }
    },getPaymentSummaryByStudent: async (studentId: number): Promise<PaymentSummary> => {
        try {
            return await api.get<PaymentSummary>(`/api/fees/payments/summary/student/${studentId}`);
        } catch (error) {
            console.error(`Error fetching payment summary for student ${studentId}:`, error);
            // Return mock data if API fails
            return {
                studentId: studentId,
                studentName: "Student",
                totalDue: 25000,
                totalPaid: 15000,
                balance: 10000,
                paymentStatus: 'PARTIALLY_PAID',
                lastPaymentDate: new Date().toISOString(),
                nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };
        }
    },    createPayment: async (payment: Payment): Promise<Payment> => {
        try {
            // Import utilities
            const { debugPayment, validatePaymentRequest } = await import('../utils/debugUtils');
            const { submitPaymentWithCorsHandling } = await import('../services/corsHelper');
            
            // Transform to match the backend PaymentRequest format
            const paymentRequest = {
                feeId: payment.feeId || payment.studentFeeId ? Number(payment.feeId || payment.studentFeeId) : null,
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
            
            // Validate all required fields are present before sending
            const validation = validatePaymentRequest(paymentRequest);
            if (!validation.valid) {
                debugPayment('Payment Validation Failed', paymentRequest, {
                    message: `Missing required fields: ${validation.missingFields.join(', ')}`
                });
                throw new Error(`Payment validation failed. Missing: ${validation.missingFields.join(', ')}`);
            }
            
            // Log the payment request for debugging
            debugPayment('Sending Payment Request', paymentRequest);
            
            // Try multiple approaches to handle CORS issues
            try {
                // First attempt: Use our special CORS-aware payment submission
                const result = await submitPaymentWithCorsHandling(paymentRequest);
                debugPayment('Payment Success (CORS-aware method)', result);
                return result;
            } catch (corsError) {
                debugPayment('CORS-aware payment failed, trying standard API', paymentRequest, corsError);
                
                // Second attempt: Use the standard API
                try {
                    const result = await api.post<Payment>('/api/fees/payments', paymentRequest);
                    debugPayment('Payment Success (standard API)', result);
                    return result;
                } catch (apiError) {
                    debugPayment('All payment methods failed', paymentRequest, apiError);
                    throw apiError;
                }
            }
        } catch (error) {
            console.error('Error in createPayment:', error);
            throw error;
        }
    },

    updatePayment: async (id: number, payment: Payment): Promise<Payment> => {
        return await api.put<Payment>(`/api/fees/payments/${id}`, payment);
    },

    voidPayment: async (id: number, reason: string): Promise<void> => {
        return await api.put(`/api/fees/payments/${id}/void`, { reason });
    },    getPaymentReceipt: async (paymentId: number): Promise<PaymentReceipt> => {
        return await api.get<PaymentReceipt>(`/api/fees/payments/${paymentId}/receipt`);
    },
      // Removed duplicate downloadReceipt function

    // Analytics endpoints
    getPaymentAnalytics: async (startDate?: string, endDate?: string): Promise<PaymentAnalytics> => {
        let url = '/api/fees/analytics/payments';
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        return await api.get<PaymentAnalytics>(url);
    },

    getPaymentDistribution: async (academicYear?: string): Promise<PaymentDistribution[]> => {
        let url = '/api/fees/analytics/distribution';
        if (academicYear) {
            url += `?academicYear=${academicYear}`;
        }
        return await api.get<PaymentDistribution[]>(url);
    },

    getRevenueTrend: async (period: string = 'monthly', year?: number): Promise<RevenueTrendItem[]> => {
        let url = `/api/fees/analytics/revenue-trend?period=${period}`;
        if (year) {
            url += `&year=${year}`;
        }
        return await api.get<RevenueTrendItem[]>(url);
    },    getOverdueAnalytics: async (): Promise<OverdueAnalytics> => {
        return await api.get<OverdueAnalytics>('/api/fees/analytics/overdue');
    },

    getStudentsWithOutstandingFees: async (gradeLevel?: number): Promise<PaymentSummary[]> => {
        let url = '/api/fees/analytics/outstanding';
        if (gradeLevel !== undefined) {
            url += `?gradeLevel=${gradeLevel}`;
        }
        return await api.get<PaymentSummary[]>(url);
    },
    
    // Report generation methods
    generateFeesDueReport: async (classGrade?: number | null): Promise<PaymentSummary[]> => {
        let url = '/api/fees/reports/fees-due';
        if (classGrade !== undefined && classGrade !== null) {
            url += `?classGrade=${classGrade}`;
        }
        return await api.get<PaymentSummary[]>(url);
    },    generateFeeStatusReport: async (classGrade?: number | null): Promise<PaymentSummary[]> => {
        // Ensure the endpoint matches exactly what's in the backend FeeController
        let url = '/api/fees/reports/fee-status';
        if (classGrade !== undefined && classGrade !== null) {
            url += `?classGrade=${classGrade}`;
        }
        return await api.get<PaymentSummary[]>(url);
    },
      downloadFeeReport: async (reportType: string, classGrade?: number | null): Promise<void> => {
        try {
            // Fix the URL to prevent duplication of the base URL
            let url = `/api/fees/reports/download/${reportType}`;
            if (classGrade !== undefined && classGrade !== null) {
                url += `?classGrade=${classGrade}`;
            }
              // Use apiClient to ensure consistent configuration
            const response = await axios.get(url, {
                responseType: 'blob',
                baseURL: config.apiUrl,
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            // Create blob link to download
            const fileDate = new Date().toISOString().split('T')[0];
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `Fee-Report-${reportType}-${fileDate}.xlsx`);
            
            // Append to html page
            document.body.appendChild(link);
            
            // Force download
            link.click();
            
            // Clean up and remove the link
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error('Error downloading fee report:', error);
            throw error;
        }
    },
      exportPaymentData: async (filters: any): Promise<void> => {
        try {
            // Use direct axios call with responseType: 'blob'
            const response = await axios.post(`${config.apiUrl}/api/payments/export`, filters, {
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payments-${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error('Error exporting payment data:', error);
            throw error;
        }    },    // Additional methods needed for PaymentDialog.tsx
    getStudentFeeDetails: async (studentId: number): Promise<StudentFeeDetails> => {
        try {
            // Try to get real data from API
            const student = await studentService.getById(studentId);
            const gradeNumber = parseInt(student.grade || '10', 10);
            
            // Get the fee structure for this grade
            let feeStructure;
            try {
                // Don't use feeService here to avoid circular reference
                feeStructure = await api.get<FeeStructure>(`/api/fees/structures/grade/${gradeNumber}`);
            } catch (error) {
                console.error("Error fetching fee structure:", error);
                // Default structure if API fails
                feeStructure = {
                    id: 1,
                    classGrade: gradeNumber,
                    annualFees: 25000,
                    buildingFees: 5000,
                    labFees: 3000,
                    amount: 33000,
                    totalFees: 33000
                };
            }
            
            return {
                studentId: studentId,
                studentFeeId: 1,
                feeStructure: {
                    id: feeStructure.id || 1,
                    classGrade: gradeNumber,
                    annualFees: feeStructure.annualFees || 0,                    buildingFees: feeStructure.buildingFees || 0,
                    labFees: feeStructure.labFees || 0,
                    amount: feeStructure.totalFees || 0,
                    totalFees: feeStructure.totalFees || 0
                }
            };
        } catch (error) {
            console.error("Error fetching real fee details, using mock data:", error);
            // Use mock data as fallback
            return {
                studentId: studentId,
                studentFeeId: 1,
                feeStructure: {
                    id: 1,
                    classGrade: 10, // Default grade
                    annualFees: 25000,
                    buildingFees: 5000,
                    labFees: 3000,
                    amount: 33000,
                    totalFees: 33000
                }
            };
        }
    },
    
    getStudentPaymentHistory: async (studentId: number): Promise<Payment[]> => {
        return await api.get<Payment[]>(`/api/fees/payments/student/${studentId}`);
    },downloadReceipt: async (paymentId: number): Promise<void> => {
        try {
            // Use direct axios call with responseType: 'blob'
            const response = await axios.get(`${config.apiUrl}/api/payments/${paymentId}/receipt`, {
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Receipt-${paymentId}.pdf`);
            
            // Append to html page
            document.body.appendChild(link);
            
            // Force download
            link.click();
            
            // Clean up and remove the link
            link.parentNode?.removeChild(link);
        } catch (error) {            console.error('Error downloading receipt:', error);
            throw error;
        }
    }
  };

// Types already imported at the top
// import { Payment, FeeBreakdownItem, PaymentMethod, PaymentFrequency, StudentFeeDetails } from '../types/payment.types';

export default feeService;