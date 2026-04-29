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
  /**
   * Transform backend event data to frontend format
   */
  private transformEvent(data: any): Event {
    return {
      id: data.id,
      eventName: data.title || data.event_name || data.eventName,
      eventType: data.event_type || data.eventType,
      description: data.description,
      eventDate: data.event_date || data.eventDate,
      startTime: data.start_time || data.startTime,
      endTime: data.end_time || data.endTime,
      location: data.location,
      maxParticipants: data.max_participants || data.maxParticipants,
      status: data.status,
      participantCount: data.participant_count || data.participantCount,
    };
  }

  async getEvents(filters?: {
    eventType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }, page: number = 1, limit: number = 20) {
    const response = await api.get('/chair/events', { 
      params: { 
        ...filters,
        event_type: filters?.eventType,
        start_date: filters?.startDate,
        end_date: filters?.endDate,
        page, 
        limit 
      } 
    });
    
    const rawData = response.data.data || response.data;
    const transformedData = Array.isArray(rawData) 
      ? rawData.map(item => this.transformEvent(item))
      : [];
    
    return {
      data: transformedData,
      total: response.data.total || response.data.meta?.total || transformedData.length,
      page: response.data.page || response.data.meta?.page || page,
      limit: response.data.limit || response.data.meta?.limit || limit,
    };
  }

  async getEventById(id: string): Promise<Event> {
    const response = await api.get(`/chair/events/${id}`);
    const data = response.data.data || response.data;
    return this.transformEvent(data);
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
    try {
      const response = await api.get('/chair/events/upcoming', {
        params: { limit },
      });
      const rawData = response.data.data || response.data;
      return Array.isArray(rawData) ? rawData.map(item => this.transformEvent(item)) : [];
    } catch (error) {
      // Fallback: get events and filter for upcoming
      console.warn('Upcoming events endpoint not available, filtering from list');
      const today = new Date().toISOString().split('T')[0];
      const eventsResponse = await this.getEvents({ startDate: today }, 1, limit);
      return eventsResponse.data.slice(0, limit);
    }
  }
}

export default new ChairEventsService();
