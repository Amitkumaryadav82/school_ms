import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface ErrorMessageProps {
  error: any;
  resetError?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, resetError, className = '' }) => {
  const [countdown, setCountdown] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [backupServerStatus, setBackupServerStatus] = useState<'unknown' | 'available' | 'unavailable'>('unknown');
  
  const isNetworkError = error?.status === 'network_error';
  const isServerUnreachable = isNetworkError && !error?.isOffline;
  
  // Helper to get appropriate error message
  const getErrorMessage = () => {
    if (!error) return '';
    
    // Use specific message if available
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    
    // For networks errors, provide specific guidance
    if (isNetworkError) {
      if (error.isOffline) {
        return 'Your device appears to be offline. Please check your internet connection.';
      }
      return 'Cannot connect to server. Please check if the backend server is running.';
    }
    
    // Fallback for unknown error formats
    return 'An unexpected error occurred.';
  };
  
  // Function to retry a request with backup server if primary server is down
  const handleRetry = async () => {
    if (!resetError) return;
    
    setIsRetrying(true);
    setCountdown(3);
    
    // Start countdown
    const intervalId = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    // Wait for the countdown to finish
    setTimeout(() => {
      resetError();
      setIsRetrying(false);
    }, 3000);
  };
  
  // Check if backup server is available when there's a network error
  useEffect(() => {
    if (isServerUnreachable) {
      const checkBackupServer = async () => {
        try {
          // Attempt to connect to backup server
          await apiService.getApiInstance(true);
          setBackupServerStatus('available');
        } catch (error) {
          setBackupServerStatus('unavailable');
        }
      };
      
      checkBackupServer();
    }
  }, [isServerUnreachable]);
  
  // If there's no error, don't render anything
  if (!error) return null;
  
  return (
    <div 
      className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative ${className}`} 
      role="alert"
    >
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{getErrorMessage()}</span>
      
      {/* For network errors, show additional helpful information */}
      {isNetworkError && (
        <div className="mt-3">
          {error.isOffline ? (
            <p className="text-sm">
              Your browser reports that you are currently offline. 
              Please check your internet connection and try again.
            </p>
          ) : (
            <div>
              <p className="text-sm mb-2">
                The application cannot reach the server. This could be due to:
              </p>
              <ul className="list-disc pl-5 text-sm mb-3">
                <li>The server is not running</li>
                <li>There's a network issue between your browser and the server</li>
                <li>A firewall is blocking the connection</li>
                <li>The server URL is incorrect</li>
              </ul>
              
              {/* Show backup server status if it was checked */}
              {backupServerStatus !== 'unknown' && (
                <div className="text-sm mb-3">
                  <p>
                    Backup server status: {' '}
                    {backupServerStatus === 'available' ? (
                      <span className="text-green-600 font-semibold">Available</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Unavailable</span>
                    )}
                  </p>
                  {backupServerStatus === 'available' && (
                    <p className="mt-1">
                      The system will automatically try to use the backup server for your requests.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Provide a way to retry the operation */}
          {resetError && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`mt-2 px-4 py-2 rounded text-white ${
                isRetrying ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRetrying 
                ? `Retrying in ${countdown}s...` 
                : 'Retry Request'
              }
            </button>
          )}
        </div>
      )}
      
      {/* For other types of errors, make error details available */}
      {!isNetworkError && error.originalError && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-gray-600">View technical details</summary>
          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs">
            {JSON.stringify(error.originalError, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ErrorMessage;