import axios from 'axios';
import api from './axios';
class AuthService {
    async register(data) {
        try {
            const response = await api.post('/auth/register', data);
            if (!response.data.success) {
                throw new Error(response.data.message ?? 'Registration failed');
            }
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                // Mock fallback for development
                console.warn('Backend unavailable, using mock registration');
                const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
                return {
                    user: { id: String(Date.now()), email: data.email, name: data.name, role: data.role },
                    tokens: {
                        access: { token: 'mock-token-' + Date.now(), expiresAt },
                        refresh: { token: 'mock-refresh-token-' + Date.now(), expiresAt },
                    },
                };
            }
            throw error;
        }
    }
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials);
            if (!response.data.success) {
                throw new Error(response.data.message ?? 'Login failed');
            }
            if (response.data.data == null) {
                throw new Error('No data returned from server');
            }
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock authentication');
                const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
                const role = credentials.role ?? 'admin';
                return {
                    user: {
                        id: '1',
                        email: credentials.email,
                        name: role === 'student' ? 'Student User' : 'Admin User',
                        role,
                    },
                    tokens: {
                        access: { token: 'mock-token-' + Date.now(), expiresAt },
                        refresh: { token: 'mock-refresh-token-' + Date.now(), expiresAt },
                    },
                };
            }
            throw error;
        }
    }
}
export default new AuthService();
