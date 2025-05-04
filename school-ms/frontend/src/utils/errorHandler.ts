import { AxiosError } from 'axios';
import { CustomError } from '../services/api';

export const handleApiError = (error: unknown): string => {
  if ((error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError<CustomError>;
    
    if (!axiosError.response) {
      return 'Network error. Please check your connection.';
    }

    const status = axiosError.response.status;
    const message = axiosError.response.data?.message;

    switch (status) {
      case 400:
        return message || 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return message || 'Resource not found.';
      case 409:
        return message || 'Conflict with existing data.';
      case 422:
        return message || 'Invalid input data.';
      case 500:
        return 'Internal server error. Please try again later.';
      default:
        return message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};