import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, SearchBar, Modal, Spinner, ErrorAlert, Pagination } from '@/components/ui';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { useInstructionsData } from './useInstructionsData';
import instructionsService from '@/services/api/instructionsService';
export function InstructionsList() {
    const { instructions, statistics, pagination, loading, error, refetch, applyFilters } = useInstructionsData();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedInstruction, setSelectedInstruction] = useState(null);
    const [formData, setFormData] = useState({
        subject_code: '',
        subject_name: '',
        description: '',
        credits: 3,
        curriculum_year: new Date().getFullYear().toString(),
    });
    const [submitting, setSubmitting] = useState(false);
    // Get unique years for filter
    const uniqueYears = ['all', ...Array.from(new Set(instructions.map(i => i.curriculum_year)))];
    // Apply filters with pagination
    const handleFiltersChange = (newPage, newLimit) => {
        const filters = {
            search: searchQuery || undefined,
            curriculum_year: filterYear !== 'all' ? filterYear : undefined,
            page: newPage || currentPage,
            limit: newLimit || itemsPerPage,
        };
        applyFilters(filters);
    };
    // Handle search
    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
        const filters = {
            search: query || undefined,
            curriculum_year: filterYear !== 'all' ? filterYear : undefined,
            page: 1,
            limit: itemsPerPage,
        };
        applyFilters(filters);
    };
    // Handle year filter
    const handleYearFilter = (year) => {
        setFilterYear(year);
        setCurrentPage(1);
        const filters = {
            search: searchQuery || undefined,
            curriculum_year: year !== 'all' ? year : undefined,
            page: 1,
            limit: itemsPerPage,
        };
        applyFilters(filters);
    };
    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        handleFiltersChange(page, itemsPerPage);
    };
    // Handle items per page change
    const handleItemsPerPageChange = (limit) => {
        setItemsPerPage(limit);
        setCurrentPage(1);
        handleFiltersChange(1, limit);
    };
    const handleCreate = () => {
        setFormData({
            subject_code: '',
            subject_name: '',
            description: '',
            credits: 3,
            curriculum_year: new Date().getFullYear().toString(),
        });
        setIsCreateModalOpen(true);
    };
    const handleEdit = (instruction) => {
        setSelectedInstruction(instruction);
        setFormData({
            subject_code: instruction.subject_code,
            subject_name: instruction.subject_name,
            description: instruction.description || '',
            credits: instruction.credits,
            curriculum_year: instruction.curriculum_year,
        });
        setIsEditModalOpen(true);
    };
    const handleDelete = (instruction) => {
        setSelectedInstruction(instruction);
        setIsDeleteModalOpen(true);
    };
    const handleSubmitCreate = async () => {
        try {
            setSubmitting(true);
            await instructionsService.createInstruction(formData);
            alert('Instruction created successfully!');
            setIsCreateModalOpen(false);
            refetch();
        }
        catch (error) {
            console.error('Failed to create instruction:', error);
            alert('Failed to create instruction');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleSubmitEdit = async () => {
        if (!selectedInstruction)
            return;
        try {
            setSubmitting(true);
            await instructionsService.updateInstruction(selectedInstruction.id, formData);
            alert('Instruction updated successfully!');
            setIsEditModalOpen(false);
            setSelectedInstruction(null);
            refetch();
        }
        catch (error) {
            console.error('Failed to update instruction:', error);
            alert('Failed to update instruction');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleConfirmDelete = async () => {
        if (!selectedInstruction)
            return;
        try {
            setSubmitting(true);
            await instructionsService.deleteInstruction(selectedInstruction.id);
            alert('Instruction deleted successfully!');
            setIsDeleteModalOpen(false);
            setSelectedInstruction(null);
            refetch();
        }
        catch (error) {
            console.error('Failed to delete instruction:', error);
            alert('Failed to delete instruction');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [error && _jsx(ErrorAlert, { message: error, onRetry: refetch }), loading && (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg", text: "Loading instructions..." }) })), !loading && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800", children: "Instructions Management" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage subject instructions and curriculum" })] }), _jsxs("button", { onClick: handleCreate, className: "bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg", children: [_jsx(Plus, { className: "w-5 h-5" }), "Add Instruction"] })] }), _jsx(Card, { children: _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-4", children: [_jsx(SearchBar, { placeholder: "Search by code or name...", onChange: handleSearch, value: searchQuery, className: "w-full sm:max-w-md" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Year:" }), _jsx("select", { value: filterYear, onChange: (e) => handleYearFilter(e.target.value), className: "px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: uniqueYears.map((year) => (_jsx("option", { value: year, children: year === 'all' ? 'All Years' : year }, year))) })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Card, { accent: true, children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Total Instructions" }), _jsx("p", { className: "text-3xl font-bold text-gray-800", children: statistics.totalInstructions })] }) }), _jsx(Card, { accent: true, children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Curriculum Years" }), _jsx("p", { className: "text-3xl font-bold text-primary", children: statistics.uniqueYears })] }) }), _jsx(Card, { accent: true, children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Total Credits" }), _jsx("p", { className: "text-3xl font-bold text-green-600", children: statistics.totalCredits })] }) }), _jsx(Card, { accent: true, children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Average Credits" }), _jsx("p", { className: "text-3xl font-bold text-gray-800", children: statistics.averageCredits })] }) })] }), _jsxs(Card, { children: [_jsx("div", { className: "space-y-3", children: instructions.length > 0 ? (instructions.map((instruction) => (_jsxs("div", { className: "flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition border border-gray-200", children: [_jsxs("div", { className: "flex items-center gap-4 flex-1", children: [_jsx("div", { className: "w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0", children: _jsx(BookOpen, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-3 mb-1", children: [_jsx("span", { className: "px-3 py-1 bg-primary/10 text-primary rounded font-mono text-sm font-medium", children: instruction.subject_code }), _jsx("span", { className: "px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs", children: instruction.curriculum_year })] }), _jsx("p", { className: "font-semibold text-gray-900 truncate", children: instruction.subject_name }), instruction.description && (_jsx("p", { className: "text-sm text-gray-600 truncate", children: instruction.description })), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [instruction.credits, " ", instruction.credits === 1 ? 'credit' : 'credits'] })] })] }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [_jsx("button", { onClick: () => handleEdit(instruction), className: "p-2 hover:bg-primary/10 rounded-lg transition", title: "Edit", children: _jsx(Edit, { className: "w-5 h-5 text-gray-600" }) }), _jsx("button", { onClick: () => handleDelete(instruction), className: "p-2 hover:bg-red-50 rounded-lg transition", title: "Delete", children: _jsx(Trash2, { className: "w-5 h-5 text-red-600" }) })] })] }, instruction.id)))) : (_jsxs("div", { className: "text-center py-12 text-gray-500", children: [_jsx(BookOpen, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }), _jsx("p", { children: pagination.total === 0
                                                ? 'No instructions available. Click "Add Instruction" to create one.'
                                                : 'No instructions found matching your filters.' })] })) }), pagination.total > 0 && (_jsx(Pagination, { currentPage: pagination.page, totalPages: pagination.totalPages, totalItems: pagination.total, itemsPerPage: pagination.limit, onPageChange: handlePageChange, onItemsPerPageChange: handleItemsPerPageChange, showItemsPerPage: true }))] })] })), _jsx(Modal, { isOpen: isCreateModalOpen || isEditModalOpen, onClose: () => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedInstruction(null);
                }, title: isCreateModalOpen ? 'Create New Instruction' : 'Edit Instruction', size: "lg", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Subject Code ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: formData.subject_code, onChange: (e) => setFormData({ ...formData, subject_code: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", placeholder: "e.g., CS101", required: true })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Curriculum Year ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: formData.curriculum_year, onChange: (e) => setFormData({ ...formData, curriculum_year: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", placeholder: "e.g., 2024", required: true })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Subject Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: formData.subject_name, onChange: (e) => setFormData({ ...formData, subject_name: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", placeholder: "e.g., Introduction to Programming", required: true })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Credits ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "number", value: formData.credits, onChange: (e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", min: "1", max: "12", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", rows: 3, placeholder: "Optional description..." })] }), _jsxs("div", { className: "flex gap-3 pt-4 border-t", children: [_jsx("button", { onClick: () => {
                                        setIsCreateModalOpen(false);
                                        setIsEditModalOpen(false);
                                        setSelectedInstruction(null);
                                    }, disabled: submitting, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { onClick: isCreateModalOpen ? handleSubmitCreate : handleSubmitEdit, disabled: submitting ||
                                        !formData.subject_code ||
                                        !formData.subject_name ||
                                        !formData.curriculum_year ||
                                        formData.credits < 1, className: "flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed", children: submitting ? 'Saving...' : isCreateModalOpen ? 'Create Instruction' : 'Update Instruction' })] })] }) }), _jsx(Modal, { isOpen: isDeleteModalOpen, onClose: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedInstruction(null);
                }, title: "Delete Instruction", size: "md", children: selectedInstruction && (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-700", children: ["Are you sure you want to delete", ' ', _jsxs("span", { className: "font-semibold", children: [selectedInstruction.subject_code, " - ", selectedInstruction.subject_name] }), "?"] }), _jsx("p", { className: "text-sm text-gray-600", children: "This will soft delete the instruction. You can restore it later if needed." }), _jsxs("div", { className: "flex gap-3 pt-4 border-t", children: [_jsx("button", { onClick: () => {
                                        setIsDeleteModalOpen(false);
                                        setSelectedInstruction(null);
                                    }, disabled: submitting, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { onClick: handleConfirmDelete, disabled: submitting, className: "flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50", children: submitting ? 'Deleting...' : 'Delete Instruction' })] })] })) })] }));
}
