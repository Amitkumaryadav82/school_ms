import api from './api';

export interface Fee {
  id?: number;
  grade: string;
  type: string;
  amount: number;
  dueDate: string;
  description?: string;
}

export interface Payment {
  id?: number;
  studentId: string;
  feeId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface StudentFeeSummary {
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  lastPaymentDate?: string;
  nextDueDate?: string;
  payments: Payment[];
}

export const feeService = {
  createFee: (fee: Fee) =>
    api.post<Fee>('/fees', fee),

  updateFee: (id: number, fee: Fee) =>
    api.put<Fee>(`/fees/${id}`, fee),

  getByGrade: (grade: string) =>
    api.get<Fee[]>(`/fees/grade/${grade}`),

  getByDueDateRange: (startDate: string, endDate: string) =>
    api.get<Fee[]>(`/fees/due-date-range?startDate=${startDate}&endDate=${endDate}`),

  processPayment: (payment: Payment) =>
    api.post<Payment>('/fees/payments', payment),

  getStudentPayments: (studentId: string) =>
    api.get<Payment[]>(`/fees/payments/student/${studentId}`),

  getStudentFeeSummary: (studentId: string) =>
    api.get<StudentFeeSummary>(`/fees/summary/student/${studentId}`),

  generateSemesterReport: (semester: string, year: number) =>
    api.get<Blob>(`/fees/report/semester?semester=${semester}&year=${year}`, {
      responseType: 'blob'
    }),
};