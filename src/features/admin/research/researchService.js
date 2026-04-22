import axios from 'axios';
const BASE_URL = '/research';
export async function getResearch() {
    const response = await axios.get(BASE_URL);
    // Handle both direct array and wrapped response
    const data = Array.isArray(response.data) ? response.data : response.data.data;
    return Array.isArray(data) ? data : [];
}
export async function getResearchById(id) {
    const response = await axios.get(`${BASE_URL}/${id}`);
    // Handle both direct object and wrapped response
    const data = 'data' in response.data ? response.data.data : response.data;
    return data;
}
export async function createResearch(payload) {
    const formData = buildFormData(payload);
    const response = await axios.post(BASE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Handle both direct object and wrapped response
    const data = 'data' in response.data ? response.data.data : response.data;
    return data;
}
export async function updateResearch(id, payload) {
    const formData = buildFormData(payload);
    const response = await axios.put(`${BASE_URL}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Handle both direct object and wrapped response
    const data = 'data' in response.data ? response.data.data : response.data;
    return data;
}
export async function deleteResearch(id) {
    await axios.delete(`${BASE_URL}/${id}`);
}
export async function deleteResearchFile(researchId, fileId) {
    await axios.delete(`${BASE_URL}/${researchId}/files/${fileId}`);
}
function buildFormData(payload) {
    const formData = new FormData();
    if (payload.title !== undefined)
        formData.append('title', payload.title);
    if (payload.abstract !== undefined)
        formData.append('abstract', payload.abstract);
    if (payload.category !== undefined)
        formData.append('category', payload.category);
    if (payload.status !== undefined)
        formData.append('status', payload.status);
    if (payload.adviser !== undefined)
        formData.append('adviser', payload.adviser);
    if (payload.authors !== undefined) {
        payload.authors.forEach((authorId) => formData.append('authors[]', authorId));
    }
    if (payload.files !== undefined) {
        payload.files.forEach((file) => formData.append('files', file));
    }
    return formData;
}
