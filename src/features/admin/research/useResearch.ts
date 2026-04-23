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
      // Use comprehensive mock data as fallback
      setResearch([
        {
          id: '1',
          title: 'Machine Learning Applications in Healthcare Diagnostics',
          abstract: 'This research explores the implementation of deep learning algorithms for early disease detection and diagnosis. The study focuses on developing convolutional neural networks (CNNs) for medical image analysis, particularly in identifying patterns in X-rays and MRI scans. Preliminary results show 94% accuracy in detecting anomalies.',
          category: 'Computer Science',
          status: 'ongoing',
          authors: ['John Doe', 'Jane Smith'],
          adviser: 'Dr. Robert Johnson',
          files: [
            { id: 'f1', name: 'research-proposal.pdf', url: '#' },
            { id: 'f2', name: 'methodology.docx', url: '#' },
          ],
          events: [
            { id: 'e1', title: 'Research Defense', date: '2026-05-15' },
          ],
          createdAt: new Date('2026-01-15').toISOString(),
          updatedAt: new Date('2026-04-01').toISOString(),
        },
        {
          id: '2',
          title: 'Blockchain-Based Voting System for Student Elections',
          abstract: 'Development of a secure, transparent, and tamper-proof voting system using blockchain technology. The system ensures voter anonymity while maintaining vote integrity through distributed ledger technology. Smart contracts automate vote counting and result verification.',
          category: 'Information Security',
          status: 'completed',
          authors: ['Maria Garcia', 'Alex Chen', 'Sarah Williams'],
          adviser: 'Prof. Michael Brown',
          files: [
            { id: 'f3', name: 'final-paper.pdf', url: '#' },
            { id: 'f4', name: 'source-code.zip', url: '#' },
            { id: 'f5', name: 'presentation.pptx', url: '#' },
          ],
          events: [
            { id: 'e2', title: 'Final Defense', date: '2026-03-20' },
            { id: 'e3', title: 'Publication Submission', date: '2026-04-05' },
          ],
          createdAt: new Date('2025-09-01').toISOString(),
          updatedAt: new Date('2026-03-25').toISOString(),
        },
        {
          id: '3',
          title: 'IoT-Based Smart Campus Energy Management System',
          abstract: 'An Internet of Things solution for monitoring and optimizing energy consumption across campus facilities. The system uses wireless sensors to collect real-time data on electricity usage, temperature, and occupancy. Machine learning algorithms predict usage patterns and automatically adjust HVAC systems for optimal efficiency.',
          category: 'Computer Engineering',
          status: 'published',
          authors: ['David Lee', 'Emily Rodriguez'],
          adviser: 'Dr. Patricia Martinez',
          files: [
            { id: 'f6', name: 'published-paper.pdf', url: '#' },
            { id: 'f7', name: 'technical-documentation.pdf', url: '#' },
          ],
          events: [
            { id: 'e4', title: 'Conference Presentation', date: '2025-11-10' },
          ],
          createdAt: new Date('2025-03-10').toISOString(),
          updatedAt: new Date('2025-12-01').toISOString(),
        },
        {
          id: '4',
          title: 'Natural Language Processing for Filipino Text Sentiment Analysis',
          abstract: 'Development of NLP models specifically trained for analyzing sentiment in Filipino language social media posts. The research addresses the unique challenges of processing code-switched text (Taglish) and informal language patterns common in Philippine online discourse.',
          category: 'Artificial Intelligence',
          status: 'ongoing',
          authors: ['Carlos Santos', 'Lisa Reyes'],
          adviser: 'Dr. Antonio Cruz',
          files: [
            { id: 'f8', name: 'literature-review.pdf', url: '#' },
          ],
          events: [],
          createdAt: new Date('2026-02-01').toISOString(),
          updatedAt: new Date('2026-03-15').toISOString(),
        },
        {
          id: '5',
          title: 'Augmented Reality Mobile App for Interactive Campus Tours',
          abstract: 'An AR-based mobile application that provides immersive, interactive tours of the university campus. Users can point their phones at buildings to see historical information, department details, and navigation assistance. The app includes gamification elements to engage prospective students.',
          category: 'Mobile Development',
          status: 'completed',
          authors: ['Kevin Tan', 'Michelle Wong', 'Ryan Pascual'],
          adviser: 'Prof. Jennifer Lopez',
          files: [
            { id: 'f9', name: 'app-documentation.pdf', url: '#' },
            { id: 'f10', name: 'user-testing-results.xlsx', url: '#' },
          ],
          events: [
            { id: 'e5', title: 'App Launch Event', date: '2026-01-20' },
          ],
          createdAt: new Date('2025-08-15').toISOString(),
          updatedAt: new Date('2026-01-25').toISOString(),
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
