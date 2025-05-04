import { ServerStatusService } from './ServerStatusService';

/**
 * Enhanced API client service for communicating with the monolithic backend.
 * Includes request tracing, error handling, and reconnection strategies.
 */
export class ApiService {
  private static instance: ApiService;
  private baseUrl: string;
  private statusService: ServerStatusService;

  private constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.statusService = ServerStatusService.getInstance();
  }

  /**
   * Get the singleton instance of the ApiService.
   */
  public static getInstance(baseUrl?: string): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService(baseUrl);
    }
    return ApiService.instance;
  }

  /**
   * Make a GET request to the API.
   * 
   * @param endpoint The API endpoint to call
   * @param params Optional query parameters
   * @returns The response data
   */
  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>('GET', url);
  }

  /**
   * Make a POST request to the API.
   * 
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @returns The response data
   */
  public async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('POST', url, data);
  }

  /**
   * Make a PUT request to the API.
   * 
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @returns The response data
   */
  public async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('PUT', url, data);
  }

  /**
   * Make a DELETE request to the API.
   * 
   * @param endpoint The API endpoint to call
   * @returns The response data
   */
  public async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('DELETE', url);
  }

  /**
   * Make a request to the API with common error handling and request tracing.
   * 
   * @param method The HTTP method
   * @param url The full URL to call
   * @param data Optional data for POST/PUT requests
   * @returns The response data
   */
  private async request<T>(method: string, url: string, data?: any): Promise<T> {
    // Generate a client-side trace ID that will be linked with the server's trace
    const clientTraceId = this.generateTraceId();
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Trace-Id': clientTraceId,
      },
      credentials: 'include', // Include cookies for authentication
    };

    // Add the JWT token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Add body for POST/PUT requests
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    // Add request time for metrics
    const startTime = performance.now();

    try {
      const response = await fetch(url, options);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Capture the server-side trace ID for logging and debugging
      const serverTraceId = response.headers.get('X-Trace-Id');
      
      // Log request details in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] ${method} ${url} - ${response.status} - ${duration.toFixed(2)}ms`, {
          clientTraceId,
          serverTraceId,
          status: response.status,
        });
      }
      
      // Handle 401 Unauthorized (expired token or not authenticated)
      if (response.status === 401) {
        // Clear the auth token and redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new ApiError('Authentication required', response.status, url);
      }
      
      // Handle 403 Forbidden (not authorized)
      if (response.status === 403) {
        throw new ApiError('You do not have permission to access this resource', response.status, url);
      }

      // Handle successful responses
      if (response.ok) {
        // Some endpoints return no content
        if (response.status === 204) {
          return {} as T;
        }
        
        // For other successful responses, parse the JSON response
        return await response.json() as T;
      }
      
      // Handle error responses
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If response isn't valid JSON, use the status text
        errorData = { message: response.statusText };
      }
      
      throw new ApiError(
        errorData.message || 'An error occurred',
        response.status,
        url,
        errorData
      );
    } catch (error) {
      // Handle network errors separately from API errors
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network error or other fetch error
      console.error(`[API] Network error: ${method} ${url}`, error);
      throw new ApiError(
        'Unable to connect to the server. Please check your network connection.',
        0,
        url,
        { originalError: error }
      );
    }
  }

  /**
   * Builds a complete URL with query parameters.
   * 
   * @param endpoint The API endpoint
   * @param params Optional query parameters
   * @returns The complete URL
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Normalize the endpoint and base URL
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;
    
    // Add query parameters if provided
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        return `${url}?${queryString}`;
      }
    }
    
    return url;
  }
  
  /**
   * Generates a unique trace ID for request tracing.
   * 
   * @returns A unique trace ID
   */
  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Custom error class for API errors with status code and additional context.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Preserve stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * React hook for using the ApiService.
 * 
 * @param baseUrl Optional base URL for the API
 * @returns The ApiService instance
 */
export function useApi(baseUrl?: string) {
  return ApiService.getInstance(baseUrl);
}