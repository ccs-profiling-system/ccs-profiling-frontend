import axios from 'axios';
import type { Research, CreateResearchPayload, UpdateResearchPayload } from './types';

const BASE_URL = '/research';

export async function getResearch(): Promise<Research[]> {
  const response = await axios.get<Research[] | { data: Research[] }>(BASE_URL);
  // Handle both direct array and wrapped response
  const data = Array.isArray(response.data) ? response.data : response.data.data;
  return Array.isArray(data) ? data : [];
}

export async function getResearchById(id: string): Promise<Research> {
  const response = await axios.get<Research | { data: Research }>(`${BASE_URL}/${id}`);
  // Handle both direct object and wrapped response
  const data = 'data' in response.data ? response.data.data : response.data;
  return data;
}

export async function createResearch(payload: CreateResearchPayload): Promise<Research> {
  const formData = buildFormData(payload);
  const response = await axios.post<Research | { data: Research }>(BASE_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  // Handle both direct object and wrapped response
  const data = 'data' in response.data ? response.data.data : response.data;
  return data;
}

export async function updateResearch(id: string, payload: UpdateResearchPayload): Promise<Research> {
  const formData = buildFormData(payload);
  const response = await axios.put<Research | { data: Research }>(`${BASE_URL}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  // Handle both direct object and wrapped response
  const data = 'data' in response.data ? response.data.data : response.data;
  return data;
}

export async function deleteResearch(id: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`);
}

export async function deleteResearchFile(researchId: string, fileId: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${researchId}/files/${fileId}`);
}

function buildFormData(payload: CreateResearchPayload | UpdateResearchPayload): FormData {
  const formData = new FormData();

  if (payload.title !== undefined) formData.append('title', payload.title);
  if (payload.abstract !== undefined) formData.append('abstract', payload.abstract);
  if (payload.category !== undefined) formData.append('category', payload.category);
  if (payload.status !== undefined) formData.append('status', payload.status);
  if (payload.adviser !== undefined) formData.append('adviser', payload.adviser);

  if (payload.authors !== undefined) {
    payload.authors.forEach((authorId) => formData.append('authors[]', authorId));
  }

  if (payload.files !== undefined) {
    payload.files.forEach((file) => formData.append('files', file));
  }

  return formData;
}
