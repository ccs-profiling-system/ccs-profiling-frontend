import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import chairFacultyService from '@/services/api/chair/chairFacultyService';
import { Eye } from 'lucide-react';
export function ChairFaculty() {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);
    useEffect(() => {
        loadFaculty();
    }, [search, currentPage, itemsPerPage]);
    const loadFaculty = async () => {
        try {
            setLoading(true);
            const response = await chairFacultyService.getFaculty({ search }, currentPage, itemsPerPage);
            setFaculty(response.data || []);
            setTotalItems(response.total || 0);
        }
        catch (err) {
            // Show empty state instead of error for 404
            setFaculty([]);
            setTotalItems(0);
        }
        finally {
            setLoading(false);
        }
    };
    const columns = [
        { key: 'facultyId', header: 'Faculty ID' },
        {
            key: 'name',
            header: 'Name',
            render: (f) => `${f.firstName} ${f.lastName}`,
        },
        { key: 'email', header: 'Email' },
        { key: 'specialization', header: 'Specialization' },
        {
            key: 'teachingLoad',
            header: 'Teaching Load',
            align: 'center',
            render: (f) => `${f.teachingLoad || 0} units`,
        },
        {
            key: 'researchCount',
            header: 'Research',
            align: 'center',
            render: (f) => f.researchCount || 0,
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'center',
            render: () => (_jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Eye, { className: "w-4 h-4" }) })),
        },
    ];
    return (_jsx(MainLayout, { title: "Faculty Management", variant: "chair", children: _jsxs("div", { className: "space-y-6", children: [_jsx(Card, { className: "p-6", children: _jsx(SearchBar, { placeholder: "Search faculty...", onChange: setSearch, value: search }) }), _jsx(Card, { children: loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg" }) })) : faculty.length === 0 && totalItems === 0 ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500", children: "No faculty members found" }) })) : (_jsxs(_Fragment, { children: [_jsx(Table, { data: faculty, columns: columns }), totalItems > 0 && (_jsx(Pagination, { currentPage: currentPage, totalPages: Math.ceil(totalItems / itemsPerPage), totalItems: totalItems, itemsPerPage: itemsPerPage, onPageChange: setCurrentPage, onItemsPerPageChange: setItemsPerPage }))] })) })] }) }));
}
