export interface CustomError {
  message: string;
  status: number | string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  status: number | string;
  originalError?: any;
}

export interface ApiClient {
  get: <T>(endpoint: string, params?: any) => Promise<T>;
  post: <T>(endpoint: string, data?: any) => Promise<T>;
  put: <T>(endpoint: string, data?: any) => Promise<T>;
  delete: <T>(endpoint: string) => Promise<T>;
}

declare const api: ApiClient;

export default api;
