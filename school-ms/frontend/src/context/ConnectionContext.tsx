import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { testBackendConnectivity, autoDetectApiUrl, applyStoredApiUrl } from '../utils/connectivityCheck';
import config from '../config/environment';

/**
 * Interface for the connection state
 */
interface ConnectionState {
  connected: boolean;
  checking: boolean;
  lastChecked: Date | null;
  apiUrl: string;
  workingUrl: string | null;
  error: string | null;
}

/**
 * Interface for the connection context
 */
interface ConnectionContextType {
  // Connection state
  connectionState: ConnectionState;
  
  // Connection methods
  checkConnection: () => Promise<boolean>;
  updateApiUrl: (newUrl: string) => Promise<boolean>;
  resetToDefaultUrl: () => Promise<void>;
  
  // UI state
  showConnectionSettings: boolean;
  setShowConnectionSettings: (show: boolean) => void;
}

// Create the context
const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

/**
 * Connection Provider component
 */
export const ConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    connected: false,
    checking: true,
    lastChecked: null,
    apiUrl: config.apiUrl,
    workingUrl: null,
    error: null
  });
  
  // UI state
  const [showConnectionSettings, setShowConnectionSettings] = useState<boolean>(false);
  
  /**
   * Check the connection to the backend
   */
  const checkConnection = async (): Promise<boolean> => {
    setConnectionState(prev => ({ ...prev, checking: true }));
    
    try {
      const result = await testBackendConnectivity();
      
      setConnectionState({
        connected: result.isConnected,
        checking: false,
        lastChecked: new Date(),
        apiUrl: config.apiUrl,
        workingUrl: result.workingUrl,
        error: result.error || null
      });
      
      return result.isConnected;
    } catch (error: any) {
      setConnectionState({
        connected: false,
        checking: false,
        lastChecked: new Date(),
        apiUrl: config.apiUrl,
        workingUrl: null,
        error: error.message || 'Unknown error checking connection'
      });
      
      return false;
    }
  };
  
  /**
   * Update the API URL
   */
  const updateApiUrl = async (newUrl: string): Promise<boolean> => {
    try {
      // Update the config
      config.apiUrl = newUrl;
      
      // Store in session storage
      sessionStorage.setItem('detectedApiUrl', newUrl);
      
      // Check if it works
      const success = await checkConnection();
      
      return success;
    } catch (error) {
      console.error('Error updating API URL:', error);
      return false;
    }
  };
  
  /**
   * Reset to default URL based on environment
   */
  const resetToDefaultUrl = async (): Promise<void> => {
    const defaultUrl = import.meta.env.MODE !== 'production' 
      ? 'http://localhost:8080' 
      : window.location.origin;
      
    await updateApiUrl(defaultUrl);
  };
  
  // Initialize: apply stored URL and check connection on mount
  useEffect(() => {
    // First apply any stored URL
    applyStoredApiUrl();
    
    // Then try auto-detection
    autoDetectApiUrl().then((connected) => {
      if (connected) {
        setConnectionState(prev => ({
          ...prev,
          connected: true,
          checking: false,
          lastChecked: new Date(),
          apiUrl: config.apiUrl,
          workingUrl: config.apiUrl,
          error: null
        }));
      } else {
        // If auto-detection failed, just check with current URL
        checkConnection();
      }
    });
    
    // Set up periodic checking
    const intervalId = setInterval(() => {
      checkConnection();
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  const contextValue: ConnectionContextType = {
    connectionState,
    checkConnection,
    updateApiUrl,
    resetToDefaultUrl,
    showConnectionSettings,
    setShowConnectionSettings
  };
  
  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
};

/**
 * Hook to use the connection context
 */
export const useConnection = (): ConnectionContextType => {
  const context = useContext(ConnectionContext);
  
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  
  return context;
};

export default ConnectionContext;
