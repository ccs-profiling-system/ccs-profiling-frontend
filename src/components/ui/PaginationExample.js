import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Pagination } from './Pagination';
/**
 * Example usage of the Pagination component
 *
 * This demonstrates how to integrate pagination with your data fetching logic.
 */
export function PaginationExample() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    // Mock data - in real usage, this would come from your API
    const totalItems = 247;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const handlePageChange = (page) => {
        setCurrentPage(page);
        // In real usage, trigger API call here with new page
    };
    const handleItemsPerPageChange = (limit) => {
        setItemsPerPage(limit);
        setCurrentPage(1); // Reset to first page when changing items per page
        // In real usage, trigger API call here with new limit
    };
    return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Pagination Example" }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "p-6", children: _jsxs("p", { className: "text-gray-600", children: ["Current page: ", currentPage, " | Items per page: ", itemsPerPage] }) }), _jsx(Pagination, { currentPage: currentPage, totalPages: totalPages, totalItems: totalItems, itemsPerPage: itemsPerPage, onPageChange: handlePageChange, onItemsPerPageChange: handleItemsPerPageChange, showItemsPerPage: true })] }), _jsxs("div", { className: "mt-6 p-4 bg-gray-100 rounded-lg", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Integration with API:" }), _jsx("pre", { className: "text-sm overflow-x-auto", children: `// In your custom hook (e.g., useInstructionsData.ts)
const fetchData = async (filters?: Filters) => {
  const response = await api.listItems({
    ...filters,
    page: currentPage,
    limit: itemsPerPage,
  });
  
  // Response should include:
  // - data: array of items
  // - meta: { page, limit, total, totalPages }
  
  setItems(response.data);
  setPagination(response.meta);
};

// In your component
const { items, pagination } = useYourData();

<Pagination
  currentPage={pagination.page}
  totalPages={pagination.totalPages}
  totalItems={pagination.total}
  itemsPerPage={pagination.limit}
  onPageChange={handlePageChange}
  onItemsPerPageChange={handleItemsPerPageChange}
/>` })] })] }));
}
