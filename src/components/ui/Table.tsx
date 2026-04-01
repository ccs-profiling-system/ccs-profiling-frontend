import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  hoverable?: boolean;
  striped?: boolean;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'No data available',
  hoverable = true,
  striped = false,
}: TableProps<T>) {
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${getAlignClass(
                  column.align
                )}`}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(item)}
                className={`
                  ${striped && index % 2 === 1 ? 'bg-gray-50' : ''}
                  ${hoverable ? 'hover:bg-gray-50 transition-colors' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 text-sm text-gray-900 ${getAlignClass(
                      column.align
                    )}`}
                  >
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
