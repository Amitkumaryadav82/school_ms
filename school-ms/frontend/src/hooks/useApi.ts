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
}

export function useApi<T>(
  apiCall: () => Promise<{ data: T }>,
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
  } = options;

  const fetchData = async (ignoreCache = false) => {
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
      setData(response.data);

      if (cacheKey) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });
      }

      onSuccess?.(response.data);
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

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = () => fetchData(true);
  const clearCache = () => cacheKey && cache.delete(cacheKey);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
  };
}

export function useApiMutation<T, P>(
  apiCall: (params: P) => Promise<{ data: T }>,
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
      onSuccess?.(response.data);
      return response.data;
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

  return {
    mutate,
    loading,
    error,
  };
}