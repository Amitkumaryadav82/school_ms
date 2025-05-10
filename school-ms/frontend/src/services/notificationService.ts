import { apiClient } from './apiClient';

export interface EmailNotification {
  recipientEmail: string;
  subject: string;
  message: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  notificationId?: string;
}

export interface NotificationSettings {
  enableEmailReceipts: boolean;
  enablePaymentReminders: boolean;
  reminderDaysBefore: number;
}

const notificationService = {
  /**
   * Send an email notification
   */
  sendEmail: async (notification: EmailNotification): Promise<NotificationResponse> => {
    try {
      const response = await apiClient.post<NotificationResponse>('/api/notifications/email', notification);
      return response.data;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      throw error;
    }
  },

  /**
   * Send a fee receipt via email
   */
  sendFeeReceiptEmail: async (
    studentId: number, 
    paymentId: number, 
    recipientEmail: string
  ): Promise<NotificationResponse> => {
    try {
      const response = await apiClient.post<NotificationResponse>(
        `/api/notifications/fee-receipt/${paymentId}`,
        { studentId, recipientEmail }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send fee receipt email:', error);
      throw error;
    }
  },

  /**
   * Get notification settings for a user
   */
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    try {
      const response = await apiClient.get<NotificationSettings>('/api/notifications/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      throw error;
    }
  },

  /**
   * Update notification settings for a user
   */
  updateNotificationSettings: async (settings: NotificationSettings): Promise<NotificationSettings> => {
    try {
      const response = await apiClient.put<NotificationSettings>('/api/notifications/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  },

  /**
   * Send payment reminder notifications
   */
  sendPaymentReminders: async (): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.post<{ success: boolean; count: number }>(
        '/api/notifications/payment-reminders'
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send payment reminders:', error);
      throw error;
    }
  },
};

export { notificationService };