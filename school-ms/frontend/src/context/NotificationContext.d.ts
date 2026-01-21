import { ReactNode } from 'react';
import React from 'react';
interface Notification {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    autoHideDuration?: number;
}
interface NotificationContextType {
    showNotification: (notification: Notification) => void;
}
export declare const NotificationProvider: ({ children }: {
    children: ReactNode;
}) => React.JSX.Element;
export declare const useNotification: () => NotificationContextType;
export {};
