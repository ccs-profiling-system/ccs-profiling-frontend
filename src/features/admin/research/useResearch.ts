import { useState, useCallback } from 'react';
import type { Research, CreateResearchPayload, UpdateResearchPayload } from './types';
import * as researchService from './researchService';

interface UseResearchState {
  research: Research[];
  selectedResearch: Research | null;
  loading: boolean;
  error: string | null;
}

interface UseResearchReturn extends UseResearchState {
  fetchResearch: () => Promise<void>;
  fetchResearchById: (id: string) => Promise<void>;
  createResearch: (payload: CreateResearchPayload) => Promise<Research>;
  updateResearch: (id: string, payload: UpdateResearchPayload) => Promise<Research>;
  deleteResearch: (id: string) => Promise<void>;
  clearError: () => void;
}

export function useResearch(): UseResearchReturn {
  const [research, setResearch] = useState<Research[]>([]);
  const [selectedResearch, setSelectedResearch] = useState<Research | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await researchService.getResearch();
      setResearch(data);
    } catch (err) {
      console.error('Failed to fetch research:', err);
      setError('Failed to connect to server. Using mock data.');
      // Use mock data as fallback
      setResearch([
        {
          id: '1',
          title: 'AI in Education',
          abstract: 'Research on artificial intelligence applications in educational systems',
          category: 'Computer Science',
          status: 'ongoing',
          authors: [],
          adviser: '',
          files: [],
          events: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Cybersecurity Framework',
          abstract: 'Development of security protocols for academic institutions',
          category: 'Information Security',
          status: 'completed',
          authors: [],
          adviser: '',
          files: [],
          events: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResearchById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await researchService.getResearchById(id);
      setSelectedResearch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch research record.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createResearch = useCallback(async (payload: CreateResearchPayload): Promise<Research> => {
    setLoading(true);
    setError(null);
    try {
      const created = await researchService.createResearch(payload);
      setResearch((prev) => [...prev, created]);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create research record.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateResearch = useCallback(async (id: string, payload: UpdateResearchPayload): Promise<Research> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await researchService.updateResearch(id, payload);
      setResearch((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (selectedResearch?.id === id) setSelectedResearch(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update research record.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedResearch]);

  const deleteResearch = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await researchService.deleteResearch(id);
      setResearch((prev) => prev.filter((r) => r.id !== id));
      if (selectedResearch?.id === id) setSelectedResearch(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete research record.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedResearch]);

  const clearError = useCallback(() => setError(null), []);

  // Safety check: ensure research is always an array
  const safeResearch = Array.isArray(research) ? research : [];

  return {
    research: safeResearch,
    selectedResearch,
    loading,
    error,
    fetchResearch,
    fetchResearchById,
    createResearch,
    updateResearch,
    deleteResearch,
    clearError,
  };
}
