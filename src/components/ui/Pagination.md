# Pagination Component

A reusable pagination component for tables and lists with a clean, modern UI.

## Features

- First/Previous/Next/Last page navigation
- Smart page number display with ellipsis
- Configurable page size selector
- Item count display ("Showing X to Y of Z results")
- Responsive design (mobile-friendly)
- Fully accessible with proper ARIA labels
- Disabled states for boundary pages
- Customizable options

## Usage

### Basic Example

```tsx
import { Pagination } from '@/components/ui/Pagination';

function MyTablePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, meta } = useMyData({ page: currentPage, limit: pageSize });

  return (
    <>
      {/* Your table/list here */}
      
      <Pagination
        currentPage={currentPage}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1); // Reset to first page
        }}
      />
    </>
  );
}
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentPage` | `number` | Yes | - | Current active page (1-indexed) |
| `totalPages` | `number` | Yes | - | Total number of pages |
| `totalItems` | `number` | Yes | - | Total number of items across all pages |
| `pageSize` | `number` | Yes | - | Number of items per page |
| `onPageChange` | `(page: number) => void` | Yes | - | Callback when page changes |
| `onPageSizeChange` | `(size: number) => void` | No | - | Callback when page size changes |
| `pageSizeOptions` | `number[]` | No | `[5, 10, 20, 50, 100]` | Available page size options |
| `showPageSizeSelector` | `boolean` | No | `true` | Show/hide the page size dropdown |
| `showItemCount` | `boolean` | No | `true` | Show/hide the "Showing X to Y of Z" text |

### Advanced Example

```tsx
// Custom page size options
<Pagination
  currentPage={currentPage}
  totalPages={meta.totalPages}
  totalItems={meta.total}
  pageSize={pageSize}
  onPageChange={setCurrentPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[10, 25, 50, 100]}
  showPageSizeSelector={true}
  showItemCount={true}
/>

// Minimal pagination (no page size selector or item count)
<Pagination
  currentPage={currentPage}
  totalPages={meta.totalPages}
  totalItems={meta.total}
  pageSize={pageSize}
  onPageChange={setCurrentPage}
  showPageSizeSelector={false}
  showItemCount={false}
/>
```

### Integration with Backend

The component works seamlessly with paginated API responses:

```tsx
// Service layer
export async function getItems(filters?: { page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const response = await api.get(`/items?${params.toString()}`);
  return {
    items: response.data.data,
    meta: response.data.meta, // { page, limit, total, totalPages }
  };
}

// Component
function ItemsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  useEffect(() => {
    fetchItems({ page: currentPage, limit: pageSize });
  }, [currentPage, pageSize]);
  
  // ... rest of component
}
```

## UI Features

### Smart Page Numbers
- Shows up to 7 page numbers with ellipsis for large page counts
- Example: `1 ... 5 6 7 ... 20`
- Adapts based on current page position

### Mobile Responsive
- On mobile: Shows "Page X of Y" instead of all page numbers
- Touch-friendly button sizes
- Stacks vertically on small screens

### Accessibility
- Proper ARIA labels for screen readers
- Keyboard navigation support
- Clear disabled states
- Focus indicators

## Styling

The component uses Tailwind CSS classes and follows the app's design system:
- Primary color for active page
- Gray tones for inactive elements
- Hover states for better UX
- Smooth transitions

## Examples in the App

- **Events Management**: `/src/features/admin/events/EventsPage.tsx`
- Can be used in: Students list, Faculty list, Research list, etc.
