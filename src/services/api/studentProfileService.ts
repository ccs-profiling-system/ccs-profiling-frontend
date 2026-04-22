import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const studentAPI = axios.create({
  baseURL: `${API_BASE}/student`,
  headers: { 'Content-Type': 'application/json' },
});

studentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('studentToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const studentProfileService = {
  async getProfile() {
    const response = await studentAPI.get('/profile');
    return response.data;
  },

  async updateProfile(data: { email?: string; phone?: string }) {
    const response = await studentAPI.put('/profile', data);
    return response.data;
  },

  async getDashboard() {
    const response = await studentAPI.get('/dashboard');
    return response.data;
  },

  async getAcademicProgress() {
    const response = await studentAPI.get('/progress');
    return response.data;
  },
};

export default studentProfileService;
