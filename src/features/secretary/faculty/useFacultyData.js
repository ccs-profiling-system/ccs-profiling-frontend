import { useState, useEffect, useCallback } from 'react';
import secretaryService from '@/services/api/secretaryService';
import { debounce } from '@/utils/chairHelpers';
export function useFacultyData({ initialPage = 1, initialLimit = 10 } = {}) {
    const [faculty, setFaculty] = useState([]);
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
    const fetchFaculty = async (page, limit, searchQuery) => {
        try {
            setLoading(true);
            setError(null);
            const response = await secretaryService.getFaculty({
                page,
                limit,
                search: searchQuery,
                ...filters,
            });
            setFaculty(response.data);
            setPagination(response.pagination);
        }
        catch (err) {
            console.error('Failed to fetch faculty:', err);
            setError(err.response?.data?.message || 'Failed to load faculty');
            // Mock data for development
            const mockData = [
                { id: '1', employeeId: 'EMP-001', firstName: 'John', lastName: 'Smith', department: 'Computer Science', position: 'Professor', status: 'Active' },
                { id: '2', employeeId: 'EMP-002', firstName: 'Jane', lastName: 'Doe', department: 'Information Technology', position: 'Associate Professor', status: 'Active' },
                { id: '3', employeeId: 'EMP-003', firstName: 'Bob', lastName: 'Johnson', department: 'Computer Science', position: 'Assistant Professor', status: 'Active' },
            ];
            setFaculty(mockData);
            setPagination({
                currentPage: page,
                totalPages: 2,
                totalItems: 15,
                itemsPerPage: limit,
            });
        }
        finally {
            setLoading(false);
        }
    };
    const debouncedFetch = useCallback(debounce((page, limit, searchQuery) => {
        fetchFaculty(page, limit, searchQuery);
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
        fetchFaculty(pagination.currentPage, pagination.itemsPerPage, search);
    };
    return {
        faculty,
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
