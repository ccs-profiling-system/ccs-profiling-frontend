import api from './axios';
class EventsService {
    async getEvents(params) {
        try {
            const queryParams = new URLSearchParams();
            if (params?.page)
                queryParams.append('page', params.page.toString());
            if (params?.pageSize)
                queryParams.append('pageSize', params.pageSize.toString());
            if (params?.search)
                queryParams.append('search', params.search);
            if (params?.event_type)
                queryParams.append('event_type', params.event_type);
            if (params?.status)
                queryParams.append('status', params.status);
            const response = await api.get(`/events?${queryParams.toString()}`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }
    async getEventById(id) {
        try {
            const response = await api.get(`/events/${id}`);
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching event:', error);
            throw error;
        }
    }
}
export default new EventsService();
