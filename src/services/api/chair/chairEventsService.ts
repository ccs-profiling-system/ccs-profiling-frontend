import api from '../axios';

export interface Event {
  id: string;
  eventName: string;
  eventType: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  maxParticipants?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  participantCount?: number;
}

class ChairEventsService {
  async getEvents(filters?: {
    eventType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }, page: number = 1, limit: number = 20) {
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

  async getEventById(id: string): Promise<Event> {
    const response = await api.get(`/chair/events/${id}`);
    return response.data.data || response.data;
  }

  async approveEvent(id: string, notes?: string) {
    const response = await api.post(`/chair/events/${id}/approve`, { notes });
    return response.data;
  }

  async rejectEvent(id: string, notes: string) {
    const response = await api.post(`/chair/events/${id}/reject`, { notes });
    return response.data;
  }

  async getEventParticipants(id: string) {
    const response = await api.get(`/chair/events/${id}/participants`);
    return response.data.data || response.data;
  }

  async getUpcomingEvents(limit: number = 5) {
    const response = await api.get('/chair/events/upcoming', {
      params: { limit },
    });
    return response.data.data || response.data;
  }
}

export default new ChairEventsService();
