import axios from 'axios';

export interface Room {
  id: string;
  name: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const roomsAPI = axios.create({
  baseURL: `${API_BASE}/rooms`,
  headers: {
    'Content-Type': 'application/json',
  },
});

roomsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getRooms(): Promise<Room[]> {
  try {
    const response = await roomsAPI.get<Room[]>('');
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    // Return mock data for development
    return [
      { id: '1', name: 'Room 101' },
      { id: '2', name: 'Room 102' },
      { id: '3', name: 'Room 103' },
      { id: '4', name: 'Lab 1' },
      { id: '5', name: 'Lab 2' },
    ];
  }
}
