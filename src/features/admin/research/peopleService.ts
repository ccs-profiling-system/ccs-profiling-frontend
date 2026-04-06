import axios from 'axios';
import type { Person } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export async function getPeople(): Promise<Person[]> {
  const response = await axios.get(`${API_BASE}/people`);
  return response.data;
}
