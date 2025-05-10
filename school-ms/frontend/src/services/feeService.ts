import api from './api';
import { AxiosResponse } from 'axios';

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

// Payment interfaces
export interface Payment {
    id?: number;
    studentId: number;
    studentName?: string;
    paymentDate: string; // ISO format date
    amountPaid: number;
    paymentMethod: string; // 'CASH' | 'CHECK' | 'BANK_TRANSFER' | 'ONLINE'
    transactionReference?: string;
    paymentStatus: string; // 'PENDING' | 'COMPLETED' | 'FAILED'
    academicYear: string; // e.g., '2024-2025'
    academicTerm: string; // 'TERM1' | 'TERM2' | 'TERM3'
    feeBreakdown: FeeBreakdown[];
    receiptNumber?: string;
    notes?: string;
    processedBy?: string;
}

export interface FeeBreakdown {
    id?: number;
    paymentId?: number;
    feeType: string; // 'TUITION' | 'TRANSPORT' | 'LATE_FEE' | 'OTHER'
    description: string;
    amount: number;
}

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
    },

    getPaymentReceipt: async (paymentId: number): Promise<PaymentReceipt> => {
        return await api.get<PaymentReceipt>(`/api/fees/payments/${paymentId}/receipt`);
    },

    downloadReceipt: async (paymentId: number): Promise<Blob> => {
        return await api.get<Blob>(`/api/fees/payments/${paymentId}/receipt/download`, {
            responseType: 'blob'
        });
    },

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
    },

    getOverdueAnalytics: async (): Promise<OverdueAnalytics> => {
        return await api.get<OverdueAnalytics>('/api/fees/analytics/overdue');
    },

    getStudentsWithOutstandingFees: async (gradeLevel?: number): Promise<PaymentSummary[]> => {
        let url = '/api/fees/analytics/outstanding';
        if (gradeLevel !== undefined) {
            url += `?gradeLevel=${gradeLevel}`;
        }
        return await api.get<PaymentSummary[]>(url);
    },

    exportPaymentData: async (format: string, startDate?: string, endDate?: string): Promise<Blob> => {
        let url = `/api/fees/export?format=${format}`;
        if (startDate && endDate) {
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        return await api.get<Blob>(url, {
            responseType: 'blob'
        });
    }
};

export default feeService;