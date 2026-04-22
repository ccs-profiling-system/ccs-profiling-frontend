import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Table({ data, columns, onRowClick, emptyMessage = 'No data available', hoverable = true, striped = false, }) {
    const getAlignClass = (align) => {
        switch (align) {
            case 'center':
                return 'text-center';
            case 'right':
                return 'text-right';
            default:
                return 'text-left';
        }
    };
    return (_jsx("div", { className: "overflow-x-auto rounded-xl border border-gray-200", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: _jsx("tr", { children: columns.map((column, index) => (_jsx("th", { className: `px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${getAlignClass(column.align)}`, style: { width: column.width }, children: column.header }, `${column.key}-${index}`))) }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-100", children: data.length > 0 ? (data.map((item, index) => (_jsx("tr", { onClick: () => onRowClick?.(item), className: `
                  ${striped && index % 2 === 1 ? 'bg-gray-50' : ''}
                  ${hoverable ? 'hover:bg-gray-50 transition-colors' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                `, children: columns.map((column, colIndex) => (_jsx("td", { className: `px-6 py-4 text-sm text-gray-900 ${getAlignClass(column.align)}`, children: column.render ? column.render(item) : item[column.key] }, `${column.key}-${colIndex}`))) }, index)))) : (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: "px-6 py-12 text-center text-gray-500", children: emptyMessage }) })) })] }) }));
}
