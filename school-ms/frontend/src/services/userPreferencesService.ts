/**
 * User preferences and session management service
 * Helps with persistence of user settings and provides debugging info
 */

interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  dashboardLayout?: string;
  accessLogs?: Array<{
    timestamp: string;
    page: string;
    success: boolean;
    error?: string;
  }>;
  tokenRefreshHistory?: Array<{
    timestamp: string;
    success: boolean;
    error?: string;
  }>;
  debugMode?: boolean;
}

// Keys for localStorage
const PREF_KEY = 'school_ms_user_prefs';
const DEBUG_KEY = 'school_ms_debug_enabled';

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  dashboardLayout: 'default',
  accessLogs: [],
  tokenRefreshHistory: [],
  debugMode: false
};

/**
 * Get user preferences from localStorage
 */
export const getUserPreferences = (): UserPreferences => {
  try {
    const storedPrefs = localStorage.getItem(PREF_KEY);
    if (storedPrefs) {
      return JSON.parse(storedPrefs);
    }
  } catch (err) {
    console.error('Error retrieving user preferences:', err);
  }
  return {...defaultPreferences};
};

/**
 * Save user preferences to localStorage
 */
export const saveUserPreferences = (prefs: Partial<UserPreferences>): void => {
  try {
    const currentPrefs = getUserPreferences();
    const updatedPrefs = {...currentPrefs, ...prefs};
    localStorage.setItem(PREF_KEY, JSON.stringify(updatedPrefs));
  } catch (err) {
    console.error('Error saving user preferences:', err);
  }
};

/**
 * Log an access attempt for debugging
 */
export const logAccessAttempt = (page: string, success: boolean, error?: string): void => {
  try {
    const currentPrefs = getUserPreferences();
    const accessLogs = currentPrefs.accessLogs || [];
    
    // Keep only the last 50 entries
    if (accessLogs.length > 50) {
      accessLogs.shift();
    }
    
    accessLogs.push({
      timestamp: new Date().toISOString(),
      page,
      success,
      error
    });
    
    saveUserPreferences({accessLogs});
  } catch (err) {
    console.error('Error logging access attempt:', err);
  }
};

/**
 * Log token refresh attempt
 */
export const logTokenRefresh = (success: boolean, error?: string): void => {
  try {
    const currentPrefs = getUserPreferences();
    const history = currentPrefs.tokenRefreshHistory || [];
    
    // Keep only the last 20 entries
    if (history.length > 20) {
      history.shift();
    }
    
    history.push({
      timestamp: new Date().toISOString(),
      success,
      error
    });
    
    saveUserPreferences({tokenRefreshHistory: history});
    
    // If we have frequent refresh failures, enable debug mode automatically
    const recentAttempts = history.slice(-5);
    const recentFailures = recentAttempts.filter(attempt => !attempt.success).length;
    
    if (recentFailures >= 3) {
      console.warn('⚠️ Multiple token refresh failures detected, enabling debug mode');
      localStorage.setItem(DEBUG_KEY, 'true');
    }
  } catch (err) {
    console.error('Error logging token refresh:', err);
  }
};

/**
 * Enable or disable debug mode
 */
export const setDebugMode = (enabled: boolean): void => {
  try {
    localStorage.setItem(DEBUG_KEY, enabled ? 'true' : 'false');
    const currentPrefs = getUserPreferences();
    saveUserPreferences({...currentPrefs, debugMode: enabled});
  } catch (err) {
    console.error('Error setting debug mode:', err);
  }
};

/**
 * Check if debug mode is enabled
 */
export const isDebugModeEnabled = (): boolean => {
  try {
    const debugMode = localStorage.getItem(DEBUG_KEY);
    return debugMode === 'true';
  } catch (err) {
    console.error('Error checking debug mode:', err);
    return false;
  }
};

/**
 * Get diagnostics information for debugging
 */
export const getDiagnosticsInfo = () => {
  try {
    const prefs = getUserPreferences();
    const token = localStorage.getItem('token');
    let tokenInfo = 'No token';
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expTime = payload.exp * 1000;
        const currentTime = Date.now();
          // Convert to string to avoid type error
        tokenInfo = JSON.stringify({
          valid: currentTime < expTime,
          expiresAt: new Date(expTime).toLocaleString(),
          timeLeft: Math.floor((expTime - currentTime) / 1000 / 60) + ' minutes',
          username: payload.sub || payload.username,
          roles: payload.roles || payload.authorities || payload.role || []
        });
      } catch (e) {
        tokenInfo = 'Invalid token format';
      }
    }
    
    return {
      browser: navigator.userAgent,
      localStorage: {
        hasToken: !!token,
        hasUserData: !!localStorage.getItem('user'),
        debugModeEnabled: isDebugModeEnabled()
      },
      tokenInfo,
      accessLogs: prefs.accessLogs || [],
      tokenRefreshHistory: prefs.tokenRefreshHistory || [],
      apiUrl: import.meta.env.MODE === 'production' ? window.location.origin : 'http://localhost:8080'
    };
  } catch (err) {
    console.error('Error generating diagnostics:', err);
    return {error: 'Failed to generate diagnostics'};
  }
};

export default {
  getUserPreferences,
  saveUserPreferences,
  logAccessAttempt,
  logTokenRefresh,
  setDebugMode,
  isDebugModeEnabled,
  getDiagnosticsInfo
};
