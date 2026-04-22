import axios from 'axios';
// Development mode bypass
const DEV_MODE = import.meta.env.DEV;
const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true';
// Create Axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: import.meta.env.DEV ? 3000 : 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Request interceptor
api.interceptors.request.use((config) => {
    // Add auth token if available — check both admin and faculty tokens
    const token = localStorage.getItem('auth_token') || localStorage.getItem('facultyToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    else if (DEV_MODE && BYPASS_AUTH) {
        // Development bypass - use a mock token
        config.headers.Authorization = 'Bearer dev-bypass-token';
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Response interceptor
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    // Handle common errors
    if (error.response) {
        switch (error.response.status) {
            case 401:
                // Unauthorized - clear token and redirect to login
                // Skip redirect in development bypass mode
                if (!(DEV_MODE && BYPASS_AUTH)) {
                    localStorage.removeItem('auth_token');
                }
                break;
            case 403:
                console.error('Access forbidden');
                break;
            case 404:
                console.error('Resource not found');
                break;
            case 500:
                console.error('Server error');
                break;
            default:
                console.error('API Error:', error.response.data);
        }
    }
    else if (error.request) {
        console.warn('Network error - backend unavailable, using mock data');
    }
    else {
        console.error('Error:', error.message);
    }
    return Promise.reject(error);
});
export default api;
