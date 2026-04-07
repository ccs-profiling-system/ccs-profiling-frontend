import api from './axios';

export interface Event {
  id: string;
  event_name: string;
  event_type: 'seminar' | 'workshop' | 'conference' | 'competition' | 'other';
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  organizer?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  max_participants?: number;
  created_at: string;
  updated_at: string;
}

export interface EventsResponse {
  success: boolean;
  data: Event[];
  total: number;
  page: number;
  pageSize: number;
}

class EventsService {
  async getEvents(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    event_type?: string;
    status?: string;
  }): Promise<EventsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.event_type) queryParams.append('event_type', params.event_type);
      if (params?.status) queryParams.append('status', params.status);

      const response = await api.get(`/events?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async getEventById(id: string): Promise<Event> {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }
}

export default new EventsService();
