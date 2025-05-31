/**
 * Connectivity Check Utility
 * 
 * This utility helps diagnose connection issues to the backend server
 * and provides fallback mechanisms.
 */
import axios from 'axios';
import config from '../config/environment';

// Possible backend ports in order of preference
const POTENTIAL_PORTS = [8080, 8081, 8082, 5000, 3000];

interface ConnectionStatus {
  isConnected: boolean;
  workingUrl: string | null;
  originalUrl: string;
  error?: string;
  recommendation?: string;
  serverInfo?: {
    port: number;
    responseTime: number;
    status: number;
  };
}

/**
 * Tests connectivity to the backend server
 * If the primary URL fails, it tries alternative ports
 */
export const testBackendConnectivity = async (): Promise<ConnectionStatus> => {
  const originalUrl = config.apiUrl;
  const baseEndpoint = '/api/auth/health';
  
  console.log(`⏱️ Testing connectivity to backend at ${originalUrl}${baseEndpoint}`);
  
  // First try with the configured URL
  try {
    const startTime = Date.now();
    const response = await axios.get(`${originalUrl}${baseEndpoint}`, {
      timeout: 5000,
      validateStatus: () => true // Don't throw on any status code
    });
    const endTime = Date.now();
    
    if (response.status === 200) {
      console.log(`✅ Successfully connected to ${originalUrl} in ${endTime - startTime}ms`);
      return {
        isConnected: true,
        workingUrl: originalUrl,
        originalUrl,
        serverInfo: {
          port: parseInt(originalUrl.split(':').pop() || '0'),
          responseTime: endTime - startTime,
          status: response.status
        }
      };
    } else {
      console.log(`⚠️ Connected to ${originalUrl} but received status ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Failed to connect to ${originalUrl}: ${error.message}`);
    // Continue to try alternative ports
  }
  
  // Try alternative ports
  const urlBase = originalUrl.split(':').slice(0, 2).join(':');
  for (const port of POTENTIAL_PORTS) {
    // Skip the original port we already tried
    if (originalUrl.includes(`:${port}`)) continue;
    
    const alternativeUrl = `${urlBase}:${port}`;
    console.log(`🔄 Trying alternative backend URL: ${alternativeUrl}`);
    
    try {
      const startTime = Date.now();
      const response = await axios.get(`${alternativeUrl}${baseEndpoint}`, {
        timeout: 3000,
        validateStatus: () => true
      });
      const endTime = Date.now();
      
      if (response.status === 200) {
        console.log(`✅ Successfully connected to alternative URL ${alternativeUrl}`);
        return {
          isConnected: true,
          workingUrl: alternativeUrl,
          originalUrl,
          recommendation: `Update the configuration to use ${alternativeUrl} instead of ${originalUrl}`,
          serverInfo: {
            port: port,
            responseTime: endTime - startTime,
            status: response.status
          }
        };
      }
    } catch (error) {
      // Continue trying other ports
    }
  }
  
  // If we reach here, all connection attempts failed
  return {
    isConnected: false,
    workingUrl: null,
    originalUrl,
    error: "Could not connect to any backend server",
    recommendation: "Ensure the backend server is running and accessible."
  };
};

/**
 * Automatically updates the API URL configuration based on connectivity tests
 * Returns true if a working URL was found and applied
 */
export const autoDetectApiUrl = async (): Promise<boolean> => {
  const status = await testBackendConnectivity();
  
  if (status.isConnected && status.workingUrl && status.workingUrl !== config.apiUrl) {
    console.log(`🔄 Automatically switching API URL from ${config.apiUrl} to ${status.workingUrl}`);
    
    // Update the configuration
    config.apiUrl = status.workingUrl;
    
    // Store this in session storage for persistence during the session
    sessionStorage.setItem('detectedApiUrl', status.workingUrl);
    
    return true;
  }
  
  return status.isConnected;
};

/**
 * Apply any previously detected working API URL from session storage
 * This helps maintain the correct API URL after page refreshes
 */
export const applyStoredApiUrl = (): void => {
  const storedUrl = sessionStorage.getItem('detectedApiUrl');
  
  if (storedUrl && storedUrl !== config.apiUrl) {
    console.log(`🔄 Applying previously detected API URL: ${storedUrl}`);
    config.apiUrl = storedUrl;
  }
};

export default {
  testBackendConnectivity,
  autoDetectApiUrl,
  applyStoredApiUrl
};
