import axios from 'axios';
import api from './axios';
class AuthService {
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
                const msg = error.response?.data?.message ?? 'Network error — please check your connection';
                throw new Error(msg);
            }
            throw error;
        }
    }
}
export default new AuthService();
