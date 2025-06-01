import api from './api';

export interface AnalyticsSummary {
  totalRevenue: number;
  totalPendingAmount: number;
  overallCollectionRate: number;
  outstandingAmount: number;
  lateFeesCollected: number;
  monthlyTrends: MonthlyTrend[];
  paymentMethodDistribution: PaymentMethodDistribution[];
  classWiseCollection: ClassWiseCollection[];
}

export interface MonthlyTrend {
  month: string;
  collected: number;
  due: number;
  collectionRate: number;
}

export interface PaymentMethodDistribution {
  method: string;
  amount: number;
  percentage: number;
}

export interface ClassWiseCollection {
  grade: number;
  collected: number;
  due: number;
  collectionRate: number;
  studentCount: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface OverduePayment {
  studentId: number;
  studentName: string;
  classGrade: number;
  amountDue: number;
  dueDate: string;
  daysOverdue: number;
  parentEmail: string;
  parentPhone: string;
  lastReminder?: string;
}

const paymentAnalyticsService = {  // Get analytics summary
  getAnalyticsSummary: async (dateRange?: DateRange): Promise<AnalyticsSummary> => {
    // Create URL with query parameters directly to avoid nesting
    let url = '/api/fees/analytics/summary';
    
    if (dateRange) {
      url += `?startDate=${encodeURIComponent(dateRange.startDate)}&endDate=${encodeURIComponent(dateRange.endDate)}`;
      console.log("Using URL with query params:", url);
    }
    
    // Debug the call
    console.log("Calling analytics summary with URL:", url);
    
    return await api.get<AnalyticsSummary>(url);
  },

  // Get detailed analytics for a specific month
  getMonthlyAnalytics: async (year: number, month: number): Promise<AnalyticsSummary> => {
    return await api.get<AnalyticsSummary>(`/api/fees/analytics/monthly/${year}/${month}`);
  },

  // Get detailed analytics for a specific class/grade
  getClassAnalytics: async (classGrade: number, dateRange?: DateRange): Promise<AnalyticsSummary> => {
    const params = dateRange ? { 
      startDate: dateRange.startDate, 
      endDate: dateRange.endDate 
    } : {};
    
    return await api.get<AnalyticsSummary>(`/api/fees/analytics/class/${classGrade}`, { params });
  },

  // Get overdue payments list
  getOverduePayments: async (): Promise<OverduePayment[]> => {
    return await api.get<OverduePayment[]>('/api/fees/overdue');
  },

  // Export payment reports to different formats
  exportPaymentReport: async (format: 'csv' | 'pdf' | 'excel', dateRange?: DateRange): Promise<Blob> => {
    const params = dateRange ? { 
      startDate: dateRange.startDate, 
      endDate: dateRange.endDate,
      format
    } : { format };
    
    return await api.get<Blob>('/api/fees/reports/export', { 
      params, 
      responseType: 'blob' 
    });
  },
};

export default paymentAnalyticsService;