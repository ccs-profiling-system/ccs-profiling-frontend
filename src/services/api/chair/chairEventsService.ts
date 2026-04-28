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
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'draft' | 'pending_approval';
  participantCount?: number;
}

export interface ChairEventsResponse {
  data: Event[];
  total: number;
  page: number;
  limit: number;
}

/** Map backend EventDTO (snake_case) to frontend Event (camelCase) */
function toEvent(raw: Record<string, unknown>): Event {
  return {
    id:              raw.id as string,
    // backend maps event_name → title in the DTO
    eventName:       (raw.eventName ?? raw.event_name ?? raw.title) as string,
    eventType:       (raw.eventType ?? raw.event_type) as string,
    description:     raw.description as string | undefined,
    eventDate:       (raw.eventDate ?? raw.event_date) as string,
    startTime:       (raw.startTime ?? raw.start_time) as string | undefined,
    endTime:         (raw.endTime   ?? raw.end_time)   as string | undefined,
    location:        raw.location as string | undefined,
    maxParticipants: (raw.maxParticipants ?? raw.max_participants) as number | undefined,
    status:          raw.status as Event['status'],
    participantCount:(raw.participantCount ?? raw.participant_count) as number | undefined,
  };
}

class ChairEventsService {
  /**
   * Get events with filters and pagination
   */
  async getEvents(
    filters?: {
      eventType?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<ChairEventsResponse> {
    try {
      // Map camelCase filter keys to snake_case params the backend expects
      const params: Record<string, unknown> = {
        page,
        limit,
        ...(filters?.eventType  && { type: filters.eventType }),
        ...(filters?.status     && { status: filters.status }),
        ...(filters?.startDate  && { start_date: filters.startDate }),
        ...(filters?.endDate    && { end_date: filters.endDate }),
      };

      const response = await api.get('/chair/events', { params });
      const raw = response.data;
      const items: Record<string, unknown>[] = raw.data ?? raw.events ?? raw;

      return {
        data:  Array.isArray(items) ? items.map(toEvent) : [],
        total: raw.meta?.total ?? raw.total ?? 0,
        page:  raw.meta?.page  ?? raw.page  ?? page,
        limit: raw.meta?.limit ?? raw.limit ?? limit,
      };
    } catch (error: any) {
      console.error('Error fetching events:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<Event> {
    const response = await api.get(`/chair/events/${id}`);
    const raw = response.data.data ?? response.data;
    return toEvent(raw as Record<string, unknown>);
  }

  /**
   * Approve an event
   */
  async approveEvent(id: string, notes?: string): Promise<any> {
    const response = await api.post(`/chair/events/${id}/approve`, { approver_notes: notes });
    return response.data;
  }

  /**
   * Reject an event
   */
  async rejectEvent(id: string, notes: string): Promise<any> {
    const response = await api.post(`/chair/events/${id}/reject`, { rejection_reason: notes });
    return response.data;
  }

  /**
   * Get event participants
   */
  async getEventParticipants(id: string): Promise<any> {
    const response = await api.get(`/chair/events/${id}/participants`);
    return response.data.data || response.data;
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 5): Promise<Event[]> {
    try {
      const response = await api.get('/chair/events/upcoming', { params: { limit } });
      const items = response.data.data || response.data;
      return Array.isArray(items) ? items.map(toEvent) : [];
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  }
}

export default new ChairEventsService();
