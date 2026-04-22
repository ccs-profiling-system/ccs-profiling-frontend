import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const gradeAPI = axios.create({
    baseURL: `${API_BASE}/grades`,
    headers: {
        'Content-Type': 'application/json',
    },
});
gradeAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('studentToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export const gradeService = {
    async getCurrentGrades() {
        try {
            const response = await gradeAPI.get('/current');
            return response.data;
        }
        catch (error) {
            return [];
        }
    },
    async getGradeById(gradeId) {
        try {
            const response = await gradeAPI.get(`/${gradeId}`);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch grade');
        }
    },
    async getHistoricalGrades() {
        try {
            const response = await gradeAPI.get('/history');
            return response.data;
        }
        catch (error) {
            return [];
        }
    },
    async calculateGPA() {
        try {
            const response = await gradeAPI.get('/gpa');
            return response.data.gpa;
        }
        catch (error) {
            return 0;
        }
    },
};
export default gradeService;
