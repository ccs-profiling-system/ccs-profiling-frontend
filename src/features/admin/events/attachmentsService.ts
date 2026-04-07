import axios from 'axios';
import type { FileAttachment } from './types';

const BASE_URL = '/api/events';

export async function uploadAttachment(eventId: string, file: File): Promise<FileAttachment> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post<FileAttachment>(
    `${BASE_URL}/${eventId}/attachments`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}

export async function deleteAttachment(eventId: string, attachmentId: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${eventId}/attachments/${attachmentId}`);
}
