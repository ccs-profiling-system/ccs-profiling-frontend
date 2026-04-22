import { useState, useEffect, useCallback } from 'react';
import secretaryService from '@/services/api/secretaryService';
import { debounce } from '@/utils/chairHelpers';
export function useStudentsData({ initialPage = 1, initialLimit = 10 } = {}) {
    const [students, setStudents] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: initialPage,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: initialLimit,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const fetchStudents = async (page, limit, searchQuery) => {
        try {
            setLoading(true);
            setError(null);
            const response = await secretaryService.getStudents({
                page,
                limit,
                search: searchQuery,
                ...filters,
            });
            setStudents(response.data);
            setPagination(response.pagination);
        }
        catch (err) {
            console.error('Failed to fetch students:', err);
            setError(err.response?.data?.message || 'Failed to load students');
            // Mock data for development
            const mockData = [
                { id: '1', studentId: '2021-00001', firstName: 'John', lastName: 'Doe', program: 'BSCS', yearLevel: 4, status: 'Active' },
                { id: '2', studentId: '2021-00002', firstName: 'Jane', lastName: 'Smith', program: 'BSIT', yearLevel: 3, status: 'Active' },
                { id: '3', studentId: '2021-00003', firstName: 'Bob', lastName: 'Johnson', program: 'BSCS', yearLevel: 2, status: 'Active' },
            ];
            setStudents(mockData);
            setPagination({
                currentPage: page,
                totalPages: 3,
                totalItems: 30,
                itemsPerPage: limit,
            });
        }
        finally {
            setLoading(false);
        }
    };
    // Debounced search
    const debouncedFetch = useCallback(debounce((page, limit, searchQuery) => {
        fetchStudents(page, limit, searchQuery);
    }, 500), [filters]);
    useEffect(() => {
        debouncedFetch(pagination.currentPage, pagination.itemsPerPage, search);
    }, [search, pagination.currentPage, pagination.itemsPerPage, filters]);
    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };
    const handleItemsPerPageChange = (itemsPerPage) => {
        setPagination(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
    };
    const handleSearch = (query) => {
        setSearch(query);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };
    const refetch = () => {
        fetchStudents(pagination.currentPage, pagination.itemsPerPage, search);
    };
    return {
        students,
        pagination,
        loading,
        error,
        search,
        filters,
        setSearch: handleSearch,
        setFilters: handleFilterChange,
        onPageChange: handlePageChange,
        onItemsPerPageChange: handleItemsPerPageChange,
        refetch,
    };
}
