import { useState, useEffect } from 'react';
import { handleApiError } from '../utils/errorHandler';
import { useNotification } from '../context/NotificationContext';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheItem<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface UseApiOptions {
  cacheKey?: string;
  cacheDuration?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showErrorNotification?: boolean;
  dependencies?: any[];
  skip?: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const {
    cacheKey,
    cacheDuration = CACHE_DURATION,
    onSuccess,
    onError,
    showErrorNotification = true,
    dependencies = [],
    skip = false,
  } = options;  useEffect(() => {
    if (!skip) {
      fetchData();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Array.isArray(dependencies) ? dependencies : [dependencies]);
  
  // This is only to support the old way of passing dependencies directly
  // Will be removed in future versions

  const fetchData = async (ignoreCache = false) => {
    if (skip) {
      return;
    }
    
    if (cacheKey && !ignoreCache) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setData(cached.data);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      setData(response);

      if (cacheKey) {
        cache.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
        });
      }

      onSuccess?.(response);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      onError?.(err as Error);
      
      if (showErrorNotification) {
        showNotification({
          type: 'error',
          message: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };
  // We've moved the main useEffect to respect dependencies
  // This is just a fallback for backwards compatibility
  useEffect(() => {
    if (dependencies.length === 0 && !skip) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = () => fetchData(true);
  const clearCache = () => cacheKey && cache.delete(cacheKey);

  return {
    data,
    loading,
    error,
    refresh,
    refetch: () => fetchData(true),
    clearCache,
  };
}

export function useApiMutation<T, P>(
  apiCall: (params: P) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const {
    onSuccess,
    onError,
    showErrorNotification = true,
  } = options;

  const mutate = async (params: P) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(params);
      onSuccess?.(response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      onError?.(err as Error);

      if (showErrorNotification) {
        showNotification({
          type: 'error',
          message: errorMessage,
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Add mutateAsync alias for React Query compatibility
  const mutateAsync = mutate;
  return {
    mutate,
    mutateAsync,
    loading,
    error,
    isLoading: loading
  };
}