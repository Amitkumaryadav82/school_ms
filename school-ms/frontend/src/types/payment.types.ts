// Payment related types

export enum PaymentMethod {
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  CHECK = 'CHECK',
  BANK_TRANSFER = 'BANK_TRANSFER',
  UPI = 'UPI',
  CREDIT_CARD = 'CREDIT_CARD',
  ONLINE = 'ONLINE'
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface Payment {
  id?: number;
  studentId: number;
  studentFeeId?: number;
  paymentDate: string | Date;
  amount: number;
  amountPaid: number;
  paymentMethod: string;
  frequency: string;
  reference?: string;
  notes?: string;
  paymentStatus: string;
  academicYear: string;
  academicTerm: string;
  feeBreakdown?: FeeBreakdownItem[];
  [key: string]: any; // Allow additional properties for compatibility
}

export interface FeeBreakdownItem {
  feeType: string;
  amount: number;
  description?: string;
}

export interface StudentFeeDetails {
  studentId: number;
  studentFeeId: number;
  feeStructure: {
    id: number;
    classGrade: number;
    annualFees: number;
    buildingFees: number;
    labFees: number;
    amount: number;
    totalFees?: number;
  };
}
