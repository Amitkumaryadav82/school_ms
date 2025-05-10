import { apiClient } from './apiClient';

export interface PaymentReminder {
  id?: number;
  studentId: string;
  studentName: string;
  feeType: string;
  amountDue: number;
  dueDate: string;
  status: 'pending' | 'sent' | 'acknowledged';
  emailSent?: boolean;
  emailSentDate?: string;
  parentEmail?: string;
  parentPhone?: string;
  reminderCount?: number;
  lastReminderDate?: string;
}

export interface ReminderStatistics {
  totalReminders: number;
  pendingReminders: number;
  sentReminders: number;
  acknowledgedReminders: number;
  responseRate: number; // percentage of acknowledged out of sent
}

class PaymentReminderService {
  async getReminders(filters?: {
    status?: string;
    daysOverdue?: number;
    feeType?: string;
    grade?: string;
  }): Promise<PaymentReminder[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    
    const response = await apiClient.get(`/api/payment-reminders?${queryParams.toString()}`);
    return response.data;
  }

  async sendReminder(reminderId: number): Promise<void> {
    await apiClient.post(`/api/payment-reminders/${reminderId}/send`);
  }

  async sendBulkReminders(reminderIds: number[]): Promise<void> {
    await apiClient.post('/api/payment-reminders/send-bulk', { reminderIds });
  }

  async getStatistics(): Promise<ReminderStatistics> {
    const response = await apiClient.get('/api/payment-reminders/statistics');
    return response.data;
  }

  async markAsAcknowledged(reminderId: number): Promise<void> {
    await apiClient.put(`/api/payment-reminders/${reminderId}/acknowledge`);
  }

  async getReminderTemplates(): Promise<string[]> {
    const response = await apiClient.get('/api/payment-reminders/templates');
    return response.data;
  }

  async saveReminderTemplate(name: string, content: string): Promise<void> {
    await apiClient.post('/api/payment-reminders/templates', { name, content });
  }

  async getEmailLogs(reminderId: number): Promise<any[]> {
    const response = await apiClient.get(`/api/payment-reminders/${reminderId}/email-logs`);
    return response.data;
  }
}

export const paymentReminderService = new PaymentReminderService();