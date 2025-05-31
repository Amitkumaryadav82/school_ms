import { useNotification } from '../context/NotificationContext';

/**
 * Helper function to bridge between the different notification styles used in the codebase
 * 
 * @param message The notification message
 * @param type The notification type
 * @returns A notification object or string based on the context
 */
export function createNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  // Return in object format for direct use with showNotification
  return {
    message,
    type
  };
}

/**
 * Hook that provides a simplified notification interface that's compatible with both
 * notification formats used in the codebase.
 */
export function useSimpleNotification() {
  const { showNotification: originalShowNotification } = useNotification();
  
  // Create a wrapper function that accepts both formats
  const showNotification = (
    messageOrObject: string | { message: string; type: 'success' | 'error' | 'info' | 'warning' },
    type?: 'success' | 'error' | 'info' | 'warning'
  ) => {
    if (typeof messageOrObject === 'string') {
      originalShowNotification({
        message: messageOrObject,
        type: type || 'info'
      });
    } else {
      originalShowNotification(messageOrObject);
    }
  };
  
  return { showNotification };
}

export default {
  createNotification,
  useSimpleNotification
};
