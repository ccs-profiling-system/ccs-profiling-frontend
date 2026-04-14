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
  }) {
    const response = await api.get('/chair/events', { params: filters });
    return response.data;
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
