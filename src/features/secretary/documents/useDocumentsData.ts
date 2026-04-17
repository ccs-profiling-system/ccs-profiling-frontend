import { useState, useEffect, useCallback } from 'react';
import secretaryService from '@/services/api/secretaryService';
import type { Document } from '@/types/secretary';
import { debounce } from '@/utils/chairHelpers';

interface UseDocumentsDataParams {
  initialPage?: number;
  initialLimit?: number;
  category?: string;
}

export function useDocumentsData({ initialPage = 1, initialLimit = 12, category }: UseDocumentsDataParams = {}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initialLimit,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchDocuments = async (page: number, limit: number, searchQuery: string, cat?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await secretaryService.getDocuments({
        page,
        limit,
        search: searchQuery,
        category: cat,
      });
      
      setDocuments(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError(err.response?.data?.message || 'Failed to load documents');
      
      // Mock data for development
      const mockData: Document[] = [
        { 
          id: '1', 
          name: 'Student_Transcript_JohnDoe.pdf', 
          category: 'student', 
          fileUrl: '/uploads/doc1.pdf',
          fileSize: 2400000,
          fileType: 'PDF',
          uploadedBy: 'Secretary', 
          uploadedAt: '2026-04-15T10:00:00Z'
        },
        { 
          id: '2', 
          name: 'Faculty_Credentials_DrSmith.pdf', 
          category: 'faculty', 
          fileUrl: '/uploads/doc2.pdf',
          fileSize: 1800000,
          fileType: 'PDF',
          uploadedBy: 'Secretary', 
          uploadedAt: '2026-04-14T14:30:00Z'
        },
        { 
          id: '3', 
          name: 'Event_Report_Symposium.docx', 
          category: 'event', 
          fileUrl: '/uploads/doc3.docx',
          fileSize: 3200000,
          fileType: 'DOCX',
          uploadedBy: 'Secretary', 
          uploadedAt: '2026-04-13T09:15:00Z'
        },
        { 
          id: '4', 
          name: 'Research_Paper_AI.pdf', 
          category: 'research', 
          fileUrl: '/uploads/doc4.pdf',
          fileSize: 5100000,
          fileType: 'PDF',
          uploadedBy: 'Secretary', 
          uploadedAt: '2026-04-12T16:45:00Z'
        },
      ];
      
      const filtered = cat && cat !== 'all' 
        ? mockData.filter(d => d.category === cat)
        : mockData;
      
      setDocuments(filtered);
      setPagination({
        currentPage: page,
        totalPages: 1,
        totalItems: filtered.length,
        itemsPerPage: limit,
      });
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce((page: number, limit: number, searchQuery: string, cat?: string) => {
      fetchDocuments(page, limit, searchQuery, cat);
    }, 500),
    []
  );

  useEffect(() => {
    debouncedFetch(pagination.currentPage, pagination.itemsPerPage, search, category);
  }, [search, pagination.currentPage, pagination.itemsPerPage, category]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const refetch = () => {
    fetchDocuments(pagination.currentPage, pagination.itemsPerPage, search, category);
  };

  return {
    documents,
    pagination,
    loading,
    error,
    search,
    setSearch: handleSearch,
    onPageChange: handlePageChange,
    refetch,
  };
}
