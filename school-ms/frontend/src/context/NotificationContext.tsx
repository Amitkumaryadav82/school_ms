import { createContext, useContext, useState, ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';
import React from 'react';

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  autoHideDuration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Notification | string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);

  const showNotification = (notificationOrMessage: Notification | string, type?: 'success' | 'error' | 'info' | 'warning') => {
    if (typeof notificationOrMessage === 'string') {
      setNotification({
        message: notificationOrMessage,
        type: type || 'info'
      });
    } else {
      setNotification(notificationOrMessage);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleClose}
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
};

// Create the hook
const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Export both as named exports and also attach to a default export object
export { useNotification };

// Create default export that includes all named exports
const exportObject = {
  NotificationProvider,
  useNotification
};

export default exportObject;