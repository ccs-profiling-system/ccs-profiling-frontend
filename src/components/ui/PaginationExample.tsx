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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In real usage, trigger API call here with new page
    console.log('Fetching page:', page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page when changing items per page
    // In real usage, trigger API call here with new limit
    console.log('Fetching with limit:', limit);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pagination Example</h2>
      
      <div className="bg-white rounded-lg shadow">
        {/* Your content here */}
        <div className="p-6">
          <p className="text-gray-600">
            Current page: {currentPage} | Items per page: {itemsPerPage}
          </p>
        </div>

        {/* Pagination component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPage={true}
        />
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Integration with API:</h3>
        <pre className="text-sm overflow-x-auto">
{`// In your custom hook (e.g., useInstructionsData.ts)
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
/>`}
        </pre>
      </div>
    </div>
  );
}
