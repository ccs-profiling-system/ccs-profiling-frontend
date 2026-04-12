import axios from 'axios';
const BASE_URL = '/api/events';
export async function uploadAttachment(eventId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${BASE_URL}/${eventId}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
}
export async function deleteAttachment(eventId, attachmentId) {
    await axios.delete(`${BASE_URL}/${eventId}/attachments/${attachmentId}`);
}
