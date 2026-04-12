import { useState, useCallback } from 'react';
import type { Schedule, CreateSchedulePayload, UpdateSchedulePayload } from './types';
import {
  getSchedules,
  createSchedule as apiCreateSchedule,
  updateSchedule as apiUpdateSchedule,
  deleteSchedule as apiDeleteSchedule,
} from './schedulesService';

interface UseSchedulesReturn {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  fetchSchedules: (params?: { start?: string; end?: string }) => Promise<void>;
  createSchedule: (payload: CreateSchedulePayload) => Promise<Schedule>;
  updateSchedule: (id: string, payload: UpdateSchedulePayload) => Promise<Schedule>;
  deleteSchedule: (id: string) => Promise<void>;
}

export function useSchedules(): UseSchedulesReturn {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (params?: { start?: string; end?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchedules(params);
      setSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchedule = useCallback(async (payload: CreateSchedulePayload): Promise<Schedule> => {
    setLoading(true);
    setError(null);
    try {
      const created = await apiCreateSchedule(payload);
      setSchedules(prev => [...prev, created]);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create schedule';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSchedule = useCallback(async (id: string, payload: UpdateSchedulePayload): Promise<Schedule> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await apiUpdateSchedule(id, payload);
      setSchedules(prev => prev.map(s => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update schedule';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete schedule';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { schedules, loading, error, fetchSchedules, createSchedule, updateSchedule, deleteSchedule };
}
