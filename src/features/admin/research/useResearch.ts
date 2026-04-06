import { useState, useCallback } from 'react';
import type { Research, CreateResearchPayload, UpdateResearchPayload } from './types';
import * as researchService from './researchService';

export function useResearch() {
  const [research, setResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await researchService.getResearch();
      setResearch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch research');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResearchById = useCallback(async (id: string): Promise<Research | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await researchService.getResearchById(id);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch research');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createResearch = useCallback(async (payload: CreateResearchPayload): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const newResearch = await researchService.createResearch(payload);
      setResearch((prev) => [...prev, newResearch]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create research');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateResearch = useCallback(async (id: string, payload: UpdateResearchPayload): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await researchService.updateResearch(id, payload);
      setResearch((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update research');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteResearch = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await researchService.deleteResearch(id);
      setResearch((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete research');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    research,
    loading,
    error,
    fetchResearch,
    fetchResearchById,
    createResearch,
    updateResearch,
    deleteResearch,
  };
}
