import { useState, useCallback } from 'react';
import type { Participant } from './types';
import * as participantsService from './participantsService';

/**
 * Pure helper: given the list returned by the backend after an assign call,
 * returns only the participants whose IDs are in the submitted set.
 * This is the invariant tested by Property 6.
 */
export function reconcileAssigned(
  returned: Participant[],
  submittedIds: string[]
): Participant[] {
  const idSet = new Set(submittedIds);
  return returned.filter((p) => idSet.has(p.id));
}

interface UseParticipantsState {
  available: Participant[];
  assigned: Participant[];
  loading: boolean;
  error: string | null;
}

export function useParticipants(eventId: string) {
  const [state, setState] = useState<UseParticipantsState>({
    available: [],
    assigned: [],
    loading: false,
    error: null,
  });

  const fetchAvailable = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const available = await participantsService.getAvailableParticipants();
      setState((s) => ({ ...s, available, loading: false }));
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Failed to fetch participants.';
      setState((s) => ({ ...s, loading: false, error: message }));
    }
  }, []);

  const assign = useCallback(
    async (participantIds: string[]): Promise<Participant[]> => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const updated = await participantsService.assignParticipants(eventId, { participantIds });
        setState((s) => ({ ...s, assigned: updated, loading: false }));
        return updated;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? err?.message ?? 'Failed to assign participants.';
        setState((s) => ({ ...s, loading: false, error: message }));
        throw err;
      }
    },
    [eventId]
  );

  const remove = useCallback(
    async (participantId: string): Promise<void> => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        await participantsService.removeParticipant(eventId, participantId);
        setState((s) => ({
          ...s,
          assigned: s.assigned.filter((p) => p.id !== participantId),
          loading: false,
        }));
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? err?.message ?? 'Failed to remove participant.';
        setState((s) => ({ ...s, loading: false, error: message }));
        throw err;
      }
    },
    [eventId]
  );

  return {
    available: state.available,
    assigned: state.assigned,
    loading: state.loading,
    error: state.error,
    fetchAvailable,
    assign,
    remove,
  };
}
