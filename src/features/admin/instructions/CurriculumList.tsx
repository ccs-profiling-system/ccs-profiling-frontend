import { useState } from 'react';
import { Card, SearchBar, ExportButtons, Modal } from '@/components/ui';
import { Plus, Edit, Trash2, Eye, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface Subject {
  id: number;
  code: string;
  name: string;
  units: number;
  semester: number;
  yearLevel: number;
}

interface Curriculum {
  id: number;
  code: string;
  name: string;
  program: string;
  yearLevel: number;
  effectiveYear: string;
  status: 'active' | 'inactive' | 'archived';
  subjects: number;
  subjectList?: Subject[];
}

export function CurriculumList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const sampleSubjects: Subject[] = [
    { id: 1, code: 'CS101', name: 'Introduction to Programming', units: 3, semester: 1, yearLevel: 1 },
    { id: 2, code: 'CS102', name: 'Data Structures', units: 3, semester: 2, yearLevel: 1 },
    { id: 3, code: 'CS201', name: 'Object-Oriented Programming', units: 3, semester: 1, yearLevel: 2 },
    { id: 4, code: 'CS202', name: 'Database Systems', units: 3, semester: 2, yearLevel: 2 },
    { id: 5, code: 'CS301', name: 'Software Engineering', units: 3, semester: 1, yearLevel: 3 },
  ];

  const curriculumData: Curriculum[] = [
    { id: 1, code: 'BSCS-2024', name: 'BS Computer Science 2024', program: 'BSCS', yearLevel: 4, effectiveYear: '2024', status: 'active', subjects: 45, subjectList: sampleSubjects },
    { id: 2, code: 'BSIT-2024', name: 'BS Information Technology 2024', program: 'BSIT', yearLevel: 4, effectiveYear: '2024', status: 'active', subjects: 42, subjectList: sampleSubjects.slice(0, 3) },
    { id: 3, code: 'BSIS-2024', name: 'BS Information Systems 2024', program: 'BSIS', yearLevel: 4, effectiveYear: '2024', status: 'active', subjects: 40, subjectList: sampleSubjects.slice(0, 4) },
    { id: 4, code: 'BSCS-2023', name: 'BS Computer Science 2023', program: 'BSCS', yearLevel: 4, effectiveYear: '2023', status: 'inactive', subjects: 44, subjectList: sampleSubjects },
    { id: 5, code: 'ACT-2024', name: 'Associate in Computer Technology 2024', program: 'ACT', yearLevel: 2, effectiveYear: '2024', status: 'active', subjects: 28, subjectList: sampleSubjects.slice(0, 2) },
  ];

  const filteredData = curriculumData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const columns: Column<Curriculum>[] = [
    {
      key: 'expand',
      header: '',
      width: '50px',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(item.id);
          }}
          className="p-1 hover:bg-primary/10 rounded transition"
        >
          {expandedRows.has(item.id) ? (
            <ChevronDown className="w-5 h-5 text-primary" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      width: '150px',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-gray-900">{item.code}</span>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Curriculum Name',
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-500">Effective: {item.effectiveYear}</p>
        </div>
      ),
    },
    {
      key: 'program',
      header: 'Program',
      align: 'center',
      render: (item) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {item.program}
        </span>
      ),
    },
    {
      key: 'yearLevel',
      header: 'Years',
      align: 'center',
      render: (item) => <span className="text-gray-700">{item.yearLevel} Years</span>,
    },
    {
      key: 'subjects',
      header: 'Subjects',
      align: 'center',
      render: (item) => <span className="font-semibold text-primary">{item.subjects}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.status === 'active'
              ? 'bg-green-100 text-green-800'
              : item.status === 'inactive'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-secondary/10 text-secondary'
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCurriculum(item);
              setIsModalOpen(true);
            }}
            className="p-2 hover:bg-primary/10 rounded-lg transition"
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="p-2 hover:bg-primary/10 rounded-lg transition"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="p-2 hover:bg-secondary/10 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-secondary" />
          </button>
        </div>
      ),
    },
  ];

  const handleExportPDF = () => {
    console.log('Exporting curriculum to PDF...');
  };

  const handleExportExcel = () => {
    console.log('Exporting curriculum to Excel...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Curriculum Management</h2>
          <p className="text-gray-600 mt-1">Manage curriculum for all programs</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg">
          <Plus className="w-5 h-5" />
          Add Curriculum
        </button>
      </div>

      {/* Search and Export */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <SearchBar
            placeholder="Search curriculum..."
            onChange={setSearchQuery}
            value={searchQuery}
            className="w-full sm:max-w-md"
          />
          <ExportButtons
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
          />
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Curriculum</p>
            <p className="text-3xl font-bold text-gray-800">{curriculumData.length}</p>
          </div>
        </Card>
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">
              {curriculumData.filter(c => c.status === 'active').length}
            </p>
          </div>
        </Card>
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Programs</p>
            <p className="text-3xl font-bold text-primary">
              {new Set(curriculumData.map(c => c.program)).size}
            </p>
          </div>
        </Card>
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Subjects</p>
            <p className="text-3xl font-bold text-gray-800">
              {curriculumData.reduce((sum, c) => sum + c.subjects, 0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Table with Expandable Rows */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                      column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <>
                  {/* Main Row */}
                  <tr
                    key={item.id}
                    onClick={() => toggleExpand(item.id)}
                    className="hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                          column.align === 'center' ? 'text-center' : 
                          column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {column.render ? column.render(item) : String(item[column.key as keyof Curriculum] ?? '')}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Expanded Row - Subject List */}
                  {expandedRows.has(item.id) && item.subjectList && (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Subjects ({item.subjectList.length})
                          </h4>
                          <div className="grid gap-2">
                            {item.subjectList.map((subject) => (
                              <div
                                key={subject.id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary transition"
                              >
                                <div className="flex items-center gap-4">
                                  <span className="px-3 py-1 bg-primary/10 text-primary rounded font-mono text-sm font-medium">
                                    {subject.code}
                                  </span>
                                  <div>
                                    <p className="font-medium text-gray-900">{subject.name}</p>
                                    <p className="text-xs text-gray-500">
                                      Year {subject.yearLevel} • Semester {subject.semester}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-sm text-gray-600 font-medium">
                                  {subject.units} {subject.units === 1 ? 'unit' : 'units'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No curriculum found
            </div>
          )}
        </div>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCurriculum(null);
        }}
        title="Curriculum Details"
        size="lg"
      >
        {selectedCurriculum && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Code</label>
                <p className="text-gray-900 font-semibold">{selectedCurriculum.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Program</label>
                <p className="text-gray-900 font-semibold">{selectedCurriculum.program}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900 font-semibold">{selectedCurriculum.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Year Level</label>
                <p className="text-gray-900">{selectedCurriculum.yearLevel} Years</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Effective Year</label>
                <p className="text-gray-900">{selectedCurriculum.effectiveYear}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Subjects</label>
                <p className="text-gray-900">{selectedCurriculum.subjects}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className={`font-semibold ${
                  selectedCurriculum.status === 'active' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {selectedCurriculum.status.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition">
                Edit Curriculum
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
