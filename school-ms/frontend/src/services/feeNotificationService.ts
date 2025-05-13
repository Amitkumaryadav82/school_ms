import { apiClient, post, get } from './apiClient';
import { AxiosResponse } from 'axios';

// Types
export interface FeeNotification {
  studentId: number;
  studentName: string;
  parentEmail: string;
  amount: number;
  paymentDate: string;
  receiptNumber: string;
  dueDate?: string;
  balanceRemaining?: number;
  notificationType: 'RECEIPT' | 'REMINDER' | 'OVERDUE';
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  notificationId?: string;
}

// Send payment receipt notification
export const sendPaymentReceiptNotification = async (
  paymentId: number
): Promise<NotificationResponse> => {
  try {
    const response: AxiosResponse<NotificationResponse> = 
      await post(`/api/notifications/fee/receipt/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error sending payment receipt notification:', error);
    throw error;
  }
};

// Send payment reminder notification
export const sendPaymentReminderNotification = async (
  studentId: number,
  dueDate: string
): Promise<NotificationResponse> => {
  try {
    const response: AxiosResponse<NotificationResponse> = 
      await post(`/api/notifications/fee/reminder`, { studentId, dueDate });
    return response.data;
  }
  catch (error) {
    console.error('Error sending payment reminder notification:', error);
    throw error;
  }
};

// Send overdue payment notification
export const sendOverduePaymentNotification = async (
  studentId: number
): Promise<NotificationResponse> => {
  try {
    const response: AxiosResponse<NotificationResponse> = 
      await post(`/api/notifications/fee/overdue/${studentId}`);
    return response.data;
  }
  catch (error) {
    console.error('Error sending overdue payment notification:', error);
    throw error;
  }
};

// Get notification status
export const getNotificationStatus = async (
  notificationId: string
): Promise<NotificationResponse> => {
  try {
    const response: AxiosResponse<NotificationResponse> = 
      await get(`/api/notifications/status/${notificationId}`);
    return response.data;
  }
  catch (error) {
    console.error('Error getting notification status:', error);
    throw error;
  }
};

// Schedule automatic payment reminders
export const schedulePaymentReminders = async (
  studentId: number,
  dueDate: string,
  reminderDays: number[] = [7, 3, 1] // Default: 7 days, 3 days, and 1 day before due date
): Promise<NotificationResponse> => {
  try {
    const response: AxiosResponse<NotificationResponse> = 
      await post(`/api/notifications/fee/schedule-reminders`, {
        studentId,
        dueDate,
        reminderDays
      });
    return response.data;
  }
  catch (error) {
    console.error('Error scheduling payment reminders:', error);
    throw error;
  }
};