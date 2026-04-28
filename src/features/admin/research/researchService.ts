import api from '@/services/api/axios';
import type { Research, CreateResearchPayload, UpdateResearchPayload } from './types';

export async function getResearch(): Promise<Research[]> {
  // Fetch all research with a high limit to get everything
  const response = await api.get<Research[] | { data: Research[]; meta?: any }>('/admin/research', {
    params: { limit: 1000 } // High limit to get all research
  });
  // Handle both direct array and wrapped response
  const data = Array.isArray(response.data) ? response.data : response.data.data;
  return Array.isArray(data) ? data : [];
}

export async function getResearchById(id: string): Promise<Research> {
  const response = await api.get<Research | { data: Research }>(`/admin/research/${id}`);
  // Handle both direct object and wrapped response
  const data = 'data' in response.data ? response.data.data : response.data;
  return data;
}

export async function createResearch(payload: CreateResearchPayload): Promise<Research> {
  // Send as JSON instead of FormData since backend doesn't handle file uploads yet
  const requestData = {
    title: payload.title,
    abstract: payload.abstract,
    research_type: payload.category, // Map category to research_type
    status: payload.status,
    start_date: new Date().toISOString().split('T')[0], // Current date as start_date
    author_ids: payload.authors, // Send as array
    adviser_ids: payload.adviser ? [payload.adviser] : [], // Convert to array
  };
  
  const response = await api.post<Research | { data: Research }>('/admin/research', requestData);
  // Handle both direct object and wrapped response
  const data = 'data' in response.data ? response.data.data : response.data;
  return data;
}

export async function updateResearch(id: string, payload: UpdateResearchPayload): Promise<Research> {
  // Send as JSON
  const requestData: any = {};
  
  if (payload.title !== undefined) requestData.title = payload.title;
  if (payload.abstract !== undefined) requestData.abstract = payload.abstract;
  if (payload.category !== undefined) requestData.research_type = payload.category;
  if (payload.status !== undefined) requestData.status = payload.status;
  
  const response = await api.put<Research | { data: Research }>(`/admin/research/${id}`, requestData);
  // Handle both direct object and wrapped response
  const data = 'data' in response.data ? response.data.data : response.data;
  return data;
}

export async function deleteResearch(id: string): Promise<void> {
  await api.delete(`/admin/research/${id}`);
}

export async function deleteResearchFile(researchId: string, fileId: string): Promise<void> {
  await api.delete(`/admin/research/${researchId}/files/${fileId}`);
}
