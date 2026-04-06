import axios from 'axios';
import type { Research, CreateResearchPayload, UpdateResearchPayload } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export async function getResearch(): Promise<Research[]> {
  const response = await axios.get(`${API_BASE}/research`);
  return response.data;
}

export async function getResearchById(id: string): Promise<Research> {
  const response = await axios.get(`${API_BASE}/research/${id}`);
  return response.data;
}

export async function createResearch(payload: CreateResearchPayload): Promise<Research> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('abstract', payload.abstract);
  formData.append('category', payload.category);
  formData.append('status', payload.status);
  formData.append('authors', JSON.stringify(payload.authors));
  formData.append('adviser', payload.adviser);
  
  if (payload.files) {
    payload.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response = await axios.post(`${API_BASE}/research`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function updateResearch(id: string, payload: UpdateResearchPayload): Promise<Research> {
  const formData = new FormData();
  
  if (payload.title) formData.append('title', payload.title);
  if (payload.abstract) formData.append('abstract', payload.abstract);
  if (payload.category) formData.append('category', payload.category);
  if (payload.status) formData.append('status', payload.status);
  if (payload.authors) formData.append('authors', JSON.stringify(payload.authors));
  if (payload.adviser) formData.append('adviser', payload.adviser);
  
  if (payload.files) {
    payload.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response = await axios.put(`${API_BASE}/research/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function deleteResearch(id: string): Promise<void> {
  await axios.delete(`${API_BASE}/research/${id}`);
}

export async function deleteResearchFile(researchId: string, fileId: string): Promise<void> {
  await axios.delete(`${API_BASE}/research/${researchId}/files/${fileId}`);
}
