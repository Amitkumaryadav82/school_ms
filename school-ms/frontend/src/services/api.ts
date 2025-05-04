import axios from 'axios';
import config from '../config/environment';

const api = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            return Promise.reject({
                message: 'Network error. Please check your connection.',
                status: 'network_error',
            });
        }
        
        // Standardize error responses
        const customError = {
            message: '',
            status: error.response.status,
        };
        
        switch (error.response.status) {
            case 400:
                customError.message = 'Invalid request. Please check your data.';
                break;
            case 401:
                customError.message = 'Unauthorized. Please log in again.';
                localStorage.removeItem('token');
                window.location.href = '/login';
                break;
            case 403:
                customError.message = 'Access denied. You don\'t have permission for this action.';
                break;
            case 404:
                customError.message = 'Resource not found.';
                break;
            case 422:
                customError.message = 'Validation error. Please check your input.';
                break;
            case 500:
                customError.message = 'Server error. Please try again later.';
                break;
            default:
                customError.message = 'An unexpected error occurred.';
        }
        
        // Add the original error data if available
        if (error.response.data) {
            customError.message = error.response.data.message || customError.message;
        }
        
        return Promise.reject(customError);
    }
);

// Export the API instance
export default api;
