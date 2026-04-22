import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Table } from './Table';
import { Edit, Trash2, Eye } from 'lucide-react';
export function StudentTableExample() {
    const students = [
        { id: 1, name: 'John Doe', email: 'john@example.com', program: 'BSCS', year: 3, status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', program: 'BSIT', year: 2, status: 'active' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', program: 'BSIS', year: 4, status: 'graduated' },
    ];
    const columns = [
        {
            key: 'id',
            header: 'ID',
            width: '80px',
            align: 'center',
        },
        {
            key: 'name',
            header: 'Name',
            render: (student) => (_jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: student.name }), _jsx("p", { className: "text-xs text-gray-500", children: student.email })] })),
        },
        {
            key: 'program',
            header: 'Program',
            align: 'center',
        },
        {
            key: 'year',
            header: 'Year',
            align: 'center',
            render: (student) => _jsxs("span", { className: "text-gray-700", children: ["Year ", student.year] }),
        },
        {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (student) => (_jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${student.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : student.status === 'graduated'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'}`, children: student.status })),
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'center',
            render: () => (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("button", { className: "p-1 hover:bg-primary/10 rounded transition", children: _jsx(Eye, { className: "w-4 h-4 text-gray-600" }) }), _jsx("button", { className: "p-1 hover:bg-primary/10 rounded transition", children: _jsx(Edit, { className: "w-4 h-4 text-gray-600" }) }), _jsx("button", { className: "p-1 hover:bg-secondary/10 rounded transition", children: _jsx(Trash2, { className: "w-4 h-4 text-secondary" }) })] })),
        },
    ];
    return (_jsx("div", { className: "bg-white rounded-lg shadow", children: _jsx(Table, { data: students, columns: columns, hoverable: true, emptyMessage: "No students found" }) }));
}
