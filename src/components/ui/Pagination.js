import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange, itemsPerPageOptions = [10, 25, 50, 100], showItemsPerPage = true, }) {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }
        else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
            else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            }
            else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };
    if (totalPages <= 1 && !showItemsPerPage) {
        return null;
    }
    return (_jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200", children: [showItemsPerPage && onItemsPerPageChange && (_jsxs("div", { className: "flex items-center gap-2 whitespace-nowrap", children: [_jsx("span", { className: "text-sm text-gray-700", children: "Show" }), _jsx("select", { value: itemsPerPage, onChange: (e) => onItemsPerPageChange(Number(e.target.value)), className: "px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm", children: itemsPerPageOptions.map((option) => (_jsx("option", { value: option, children: option }, option))) }), _jsx("span", { className: "text-sm text-gray-700", children: "per page" })] })), _jsxs("div", { className: "text-sm text-gray-700", children: ["Showing ", _jsx("span", { className: "font-medium", children: startItem }), " to", ' ', _jsx("span", { className: "font-medium", children: endItem }), " of", ' ', _jsx("span", { className: "font-medium", children: totalItems }), " results"] }), totalPages > 1 && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => handlePageChange(1), disabled: currentPage === 1, className: "p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition", title: "First page", children: _jsx(ChevronsLeft, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handlePageChange(currentPage - 1), disabled: currentPage === 1, className: "p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition", title: "Previous page", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), _jsx("div", { className: "flex items-center gap-1", children: getPageNumbers().map((page, index) => (_jsx("button", { onClick: () => typeof page === 'number' && handlePageChange(page), disabled: page === '...', className: `min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition ${page === currentPage
                                ? 'bg-primary text-white'
                                : page === '...'
                                    ? 'cursor-default'
                                    : 'hover:bg-gray-100 text-gray-700'}`, children: page }, index))) }), _jsx("button", { onClick: () => handlePageChange(currentPage + 1), disabled: currentPage === totalPages, className: "p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition", title: "Next page", children: _jsx(ChevronRight, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handlePageChange(totalPages), disabled: currentPage === totalPages, className: "p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition", title: "Last page", children: _jsx(ChevronsRight, { className: "w-4 h-4" }) })] }))] }));
}
