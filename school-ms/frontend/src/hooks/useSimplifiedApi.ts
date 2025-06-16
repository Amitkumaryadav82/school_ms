import { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';

/**
 * UseApiOptions interface for configuring API hook behavior
 */
export interface UseApiOptions<T> {
  /** Key for caching responses */
  cacheKey?: string;
  /** Duration to keep cache in milliseconds (default 5 minutes) */
  cacheDuration?: number;
  /** Callback for successful API calls */
  onSuccess?: (data: T) => void;
  /** Callback for API errors */
  onError?: (error: Error | AxiosError) => void;
  /** Whether to show error notifications */
  showErrorNotification?: boolean;
  /** Dependencies array for triggering refetch */
  dependencies?: any[];
  /** Skip initial fetch */
  skip?: boolean;
  /** Transform response data before setting state */
  transform?: (data: any) => T;
}

// Cache implementation
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheItem<any>>();
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Simplified useApi hook for making API calls with caching and error handling
 * 
 * @param apiCall Function that returns a Promise with API data
 * @param options Configuration options
 * @returns Object with data, loading state, error state, and refetch function
 */
export function useSimplifiedApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  // Destructure options with defaults
  const {
    cacheKey,
    cacheDuration = DEFAULT_CACHE_DURATION,
    onSuccess,
    onError,
    showErrorNotification = true,
    dependencies = [],
    skip = false,
    transform
  } = options;

  // State
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);
  const { showNotification } = useNotification();

  /**
   * Format error message for display
   */
  const formatErrorMessage = useCallback((err: any): string => {
    if (err?.response?.data?.message) {
      return err.response.data.message;
    } else if (err?.message) {
      return err.message;
    } else {
      return 'An unexpected error occurred';
    }
  }, []);

  /**
   * Handle errors from API calls
   */
  const handleError = useCallback((err: any) => {
    const errorMessage = formatErrorMessage(err);
    setError(err);
    
    if (showErrorNotification) {
      showNotification({
        message: errorMessage,
        type: 'error',
        autoHideDuration: 6000
      });
    }
    
    if (onError) {
      onError(err);
    }
  }, [formatErrorMessage, onError, showErrorNotification, showNotification]);

  /**
   * Main fetch function
   */
  const fetchData = useCallback(async (forceFetch = false) => {
    // Check cache first if we have a cacheKey
    if (cacheKey && !forceFetch) {
      const cachedItem = cache.get(cacheKey);
      if (cachedItem && Date.now() - cachedItem.timestamp < cacheDuration) {
        setData(cachedItem.data);
        setLoading(false);
        if (onSuccess) onSuccess(cachedItem.data);
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      const processedData = transform ? transform(result) : result;
      
      setData(processedData);
      
      // Cache the result if cacheKey is provided
      if (cacheKey) {
        cache.set(cacheKey, {
          data: processedData,
          timestamp: Date.now()
        });
      }
      
      if (onSuccess) onSuccess(processedData);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [apiCall, cacheKey, cacheDuration, handleError, onSuccess, transform]);

  // Effect to fetch data on mount or when dependencies change
  useEffect(() => {
    if (!skip) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...dependencies]);

  return { data, loading, error, refetch: () => fetchData(true) };
}

/**
 * Hook for mutation operations (create, update, delete)
 */
export function useSimplifiedApiMutation<T, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options: Omit<UseApiOptions<T>, 'cacheKey' | 'cacheDuration' | 'dependencies' | 'skip'> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showNotification } = useNotification();
  
  const { 
    onSuccess, 
    onError, 
    showErrorNotification = true,
    transform 
  } = options;

  const formatErrorMessage = useCallback((err: any): string => {
    if (err?.response?.data?.message) {
      return err.response.data.message;
    } else if (err?.message) {
      return err.message;
    } else {
      return 'An unexpected error occurred';
    }
  }, []);

  const handleError = useCallback((err: any) => {
    const errorMessage = formatErrorMessage(err);
    setError(err);
    
    if (showErrorNotification) {
      showNotification({
        message: errorMessage,
        type: 'error',
        autoHideDuration: 6000
      });
    }
    
    if (onError) {
      onError(err);
    }
  }, [formatErrorMessage, onError, showErrorNotification, showNotification]);

  const mutate = useCallback(async (params: P) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mutationFn(params);
      const processedData = transform ? transform(result) : result;
      
      setData(processedData);
      
      if (onSuccess) onSuccess(processedData);
      return processedData;
    } catch (err: any) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, handleError, onSuccess, transform]);

  return { data, loading, error, mutate };
}

// Export original hooks for backward compatibility
export { useSimplifiedApi as useApi, useSimplifiedApiMutation as useApiMutation };
