import { api } from './apiClient.js';

export interface Message {
  id?: number;
  senderId: string;
  recipient: string;
  subject: string;
  content: string;
  type: 'ANNOUNCEMENT' | 'PERSONAL' | 'NOTIFICATION';
  status: 'SENT' | 'DELIVERED' | 'READ';
  timestamp: string;
}

export interface MessageSearchParams {
  type?: string;
  startDate?: string;
  endDate?: string;
}

export const messageService = {
  sendMessage: (message: Message) =>
    api.post<Message>('/api/messages', message),

  markAsRead: (id: number) =>
    api.put<Message>(`/api/messages/${id}/read`),

  getMessagesBySender: (senderId: string) =>
    api.get<Message[]>(`/api/messages/sent/${senderId}`),

  getMessagesByRecipient: (recipient: string) =>
    api.get<Message[]>(`/api/messages/received/${recipient}`),

  getUnreadMessages: (recipient: string) =>
    api.get<Message[]>(`/api/messages/unread/${recipient}`),

  searchMessages: (params: MessageSearchParams) =>
    api.get<Message[]>(`/api/messages/search`, { params }),
};