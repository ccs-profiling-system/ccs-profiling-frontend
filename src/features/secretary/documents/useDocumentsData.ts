import { useState, useEffect, useCallback } from 'react';
import secretaryService from '@/services/api/secretaryService';
import type { Document } from '@/types/secretary';
import { debounce } from '@/utils/chairHelpers';

interface UseDocumentsDataParams {
  initialPage?: number;
  initialLimit?: number;
  category?: string;
}

export function useDocumentsData({ initialPage = 1, initialLimit = 10, category }: UseDocumentsDataParams = {}) {
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
      
      const params: any = {
        page,
        limit,
      };
      
      // Only add parameters if they have values
      if (searchQuery) params.search = searchQuery;
      if (cat && cat !== 'all') params.category = cat;
      
      console.log('Fetching documents with params:', params);
      
      const response = await secretaryService.getDocuments(params);
      
      console.log('Documents response:', response);
      
      setDocuments(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      console.error('Error response:', err.response?.data);
      
      // Try to get detailed error message
      if (err.response?.data?.error) {
        console.error('Detailed error:', err.response.data.error);
      }
      
      setError(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to load documents');
      setDocuments([]);
      setPagination({
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
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
