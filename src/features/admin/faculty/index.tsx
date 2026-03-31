import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye } from 'lucide-react';
import type { Faculty } from './types';

const SAMPLE_FACULTY: Faculty[] = [
  { id: '1', facultyId: 'FAC-001', firstName: 'Maria', lastName: 'Santos', email: 'msantos@ccs.edu.ph', position: 'Associate Professor', specialization: 'Software Engineering', department: 'CCS', employmentStatus: 'full_time' },
  { id: '2', facultyId: 'FAC-002', firstName: 'Jose', lastName: 'Reyes', email: 'jreyes@ccs.edu.ph', position: 'Instructor', specialization: 'Data Science', department: 'CCS', employmentStatus: 'full_time' },
  { id: '3', facultyId: 'FAC-003', firstName: 'Ana', lastName: 'Cruz', email: 'acruz@ccs.edu.ph', position: 'Assistant Professor', specialization: 'Networking', department: 'CCS', employmentStatus: 'part_time' },
];

const STATUS_STYLES: Record<string, string> = {
  full_time: 'bg-green-100 text-green-700',
  part_time: 'bg-blue-100 text-blue-700',
  on_leave: 'bg-yellow-100 text-yellow-700',
  resigned: 'bg-red-100 text-red-700',
};

export function Faculty() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_FACULTY.filter((f) =>
    `${f.firstName} ${f.lastName} ${f.facultyId}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // TODO: wrap with <MainLayout title="Faculty"> from @/components/layout on merge
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty</h1>
          <p className="text-sm text-gray-500">Manage faculty profiles</p>
        </div>
        <button
          onClick={() => navigate('/faculty/new')}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition text-sm"
        >
          <Plus className="w-4 h-4" /> Add Faculty
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or faculty ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3">Faculty ID</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Position</th>
              <th className="text-left px-4 py-3">Specialization</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-center px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-700">{f.facultyId}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{f.lastName}, {f.firstName}</td>
                <td className="px-4 py-3 text-gray-700">{f.position}</td>
                <td className="px-4 py-3 text-gray-700">{f.specialization}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[f.employmentStatus]}`}>
                    {f.employmentStatus.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => navigate(`/faculty/${f.id}`)}
                    className="p-1.5 hover:bg-primary/10 rounded-lg transition"
                  >
                    <Eye className="w-4 h-4 text-primary" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No faculty found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
