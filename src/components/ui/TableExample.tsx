import { Table, type Column } from './Table';
import { Edit, Trash2, Eye } from 'lucide-react';

// Example: Student data table
interface Student {
  id: number;
  name: string;
  email: string;
  program: string;
  year: number;
  status: 'active' | 'inactive' | 'graduated';
}

export function StudentTableExample() {
  const students: Student[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', program: 'BSCS', year: 3, status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', program: 'BSIT', year: 2, status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', program: 'BSIS', year: 4, status: 'graduated' },
  ];

  const columns: Column<Student>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      align: 'center',
    },
    {
      key: 'name',
      header: 'Name',
      render: (student) => (
        <div>
          <p className="font-medium text-gray-900">{student.name}</p>
          <p className="text-xs text-gray-500">{student.email}</p>
        </div>
      ),
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
      render: (student) => <span className="text-gray-700">Year {student.year}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (student) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            student.status === 'active'
              ? 'bg-green-100 text-green-800'
              : student.status === 'graduated'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {student.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: () => (
        <div className="flex items-center justify-center gap-2">
          <button className="p-1 hover:bg-primary/10 rounded transition">
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-primary/10 rounded transition">
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-secondary/10 rounded transition">
            <Trash2 className="w-4 h-4 text-secondary" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <Table
        data={students}
        columns={columns}
        hoverable
        emptyMessage="No students found"
      />
    </div>
  );
}
