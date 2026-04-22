import axios from 'axios';
const BASE_URL = '/api/events';
export async function getAvailableParticipants() {
    const response = await axios.get('/api/participants');
    return response.data;
}
export async function assignParticipants(eventId, payload) {
    const response = await axios.post(`${BASE_URL}/${eventId}/participants`, payload);
    return response.data;
}
export async function removeParticipant(eventId, participantId) {
    await axios.delete(`${BASE_URL}/${eventId}/participants/${participantId}`);
}
