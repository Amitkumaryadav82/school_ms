import axios from 'axios';
import api from './api';
import { Payment, FeeBreakdownItem, StudentFeeDetails } from '../types/payment.types';
import config from '../config/environment';

// Local interface for fee breakdown with extra fields needed in the service
export interface FeeBreakdown extends FeeBreakdownItem {
    id?: number;
    paymentId?: number;
    description: string;
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
    },

    getFeeStructureByGrade: async (classGrade: number): Promise<FeeStructure> => {
        return await api.get<FeeStructure>(`/api/fees/structures/grade/${classGrade}`);
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
    },

    // Payment endpoints
    getAllPayments: async (): Promise<Payment[]> => {
        return await api.get<Payment[]>('/api/fees/payments');
    },

    getPaymentById: async (id: number): Promise<Payment> => {
        return await api.get<Payment>(`/api/fees/payments/${id}`);
    },

    getPaymentsByStudentId: async (studentId: number): Promise<Payment[]> => {
        return await api.get<Payment[]>(`/api/fees/payments/student/${studentId}`);
    },

    getPaymentSummaryByStudent: async (studentId: number): Promise<PaymentSummary> => {
        return await api.get<PaymentSummary>(`/api/fees/payments/summary/student/${studentId}`);
    },

    createPayment: async (payment: Payment): Promise<Payment> => {
        return await api.post<Payment>('/api/fees/payments', payment);
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
        }
    },

    // Additional methods needed for PaymentDialog.tsx
    getStudentFeeDetails: async (studentId: number): Promise<StudentFeeDetails> => {
        return await api.get<StudentFeeDetails>(`/api/students/${studentId}/fee-details`);
    },    getStudentPaymentHistory: async (studentId: number): Promise<Payment[]> => {
        return await api.get<Payment[]>(`/api/students/${studentId}/payment-history`);
    },    downloadReceipt: async (paymentId: number): Promise<void> => {
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