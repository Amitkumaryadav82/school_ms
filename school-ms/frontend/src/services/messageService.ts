import api from './api';

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
    api.post<Message>('/messages', message),

  markAsRead: (id: number) =>
    api.put<Message>(`/messages/${id}/read`),

  getMessagesBySender: (senderId: string) =>
    api.get<Message[]>(`/messages/sent/${senderId}`),

  getMessagesByRecipient: (recipient: string) =>
    api.get<Message[]>(`/messages/received/${recipient}`),

  getUnreadMessages: (recipient: string) =>
    api.get<Message[]>(`/messages/unread/${recipient}`),

  searchMessages: (params: MessageSearchParams) =>
    api.get<Message[]>(`/messages/search`, { params }),
};