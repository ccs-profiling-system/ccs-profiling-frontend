import api from '../axios';
class ChairEventsService {
    async getEvents(filters, page = 1, limit = 20) {
        const response = await api.get('/chair/events', {
            params: { ...filters, page, limit }
        });
        return {
            data: response.data.data || response.data,
            total: response.data.total || response.data.meta?.total || (response.data.data || response.data).length,
            page: response.data.page || response.data.meta?.page || page,
            limit: response.data.limit || response.data.meta?.limit || limit,
        };
    }
    async getEventById(id) {
        const response = await api.get(`/chair/events/${id}`);
        return response.data.data || response.data;
    }
    async approveEvent(id, notes) {
        const response = await api.post(`/chair/events/${id}/approve`, { notes });
        return response.data;
    }
    async rejectEvent(id, notes) {
        const response = await api.post(`/chair/events/${id}/reject`, { notes });
        return response.data;
    }
    async getEventParticipants(id) {
        const response = await api.get(`/chair/events/${id}/participants`);
        return response.data.data || response.data;
    }
    async getUpcomingEvents(limit = 5) {
        const response = await api.get('/chair/events/upcoming', {
            params: { limit },
        });
        return response.data.data || response.data;
    }
}
export default new ChairEventsService();
