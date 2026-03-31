import { useState, useCallback } from 'react';
import type { Event, EventStatus, CreateEventPayload, UpdateEventPayload } from './types';
import * as eventsService from './eventsService';
import { resolveDefaultStatus } from './validation';

/**
 * Filters an events array by status.
 * When filterValue is null/undefined/'all', all events are returned.
 */
export function filterEventsByStatus(
  events: Event[],
  filterValue: EventStatus | 'all' | null | undefined
): Event[] {
  if (!filterValue || filterValue === 'all') return events;
  return events.filter((e) => e.status === filterValue);
}

interface UseEventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
}

export function useEvents() {
  const [state, setState] = useState<UseEventsState>({
    events: [],
    loading: false,
    error: null,
  });

  const fetchEvents = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const events = await eventsService.getEvents();
      setState({ events, loading: false, error: null });
    } catch (err: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err?.response?.data?.message ?? err?.message ?? 'Failed to fetch events.',
      }));
    }
  }, []);

  const createEvent = useCallback(async (payload: CreateEventPayload): Promise<Event> => {
    const resolvedPayload: CreateEventPayload = {
      ...payload,
      status: resolveDefaultStatus(payload),
    };
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const created = await eventsService.createEvent(resolvedPayload);
      setState((s) => ({ ...s, events: [...s.events, created], loading: false }));
      return created;
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to create event.';
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, []);

  const updateEvent = useCallback(
    async (id: string, payload: UpdateEventPayload): Promise<Event> => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const updated = await eventsService.updateEvent(id, payload);
        setState((s) => ({
          ...s,
          events: s.events.map((e) => (e.id === id ? updated : e)),
          loading: false,
        }));
        return updated;
      } catch (err: any) {
        const message = err?.response?.data?.message ?? err?.message ?? 'Failed to update event.';
        setState((s) => ({ ...s, loading: false, error: message }));
        throw err;
      }
    },
    []
  );

  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await eventsService.deleteEvent(id);
      setState((s) => ({
        ...s,
        events: s.events.filter((e) => e.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to delete event.';
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, []);

  return {
    events: state.events,
    loading: state.loading,
    error: state.error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
