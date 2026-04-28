import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/ui/SearchBar';
import { Users, Filter, FileText, Download } from 'lucide-react';
import { Spinner, ErrorAlert, Table, Button } from '@/components/ui';
import api from '@/services/api/axios';
import secretaryService from '@/services/api/secretaryService';
import type { StudentRecord, FacultyRecord } from '@/types/secretary';

type ReportModule = 'students' | 'faculty';
type DataItem = StudentRecord | FacultyRecord;

const tabs = [
  { id: 'students' as const, title: 'Students', icon: Users, color: 'text-blue-600', borderColor: 'border-blue-600' },
  { id: 'faculty' as const, title: 'Faculty', icon: Users, color: 'text-purple-600', borderColor: 'border-purple-600' },
];

export function SecretaryReports() {
  const [activeTab, setActiveTab] = useState<ReportModule>('students');
  const [showFilters, setShowFilters] = useState(false);
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // Filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: [] as string[],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      // Only add filters if they have values
      if (search) filterParams.search = search;
      if (filters.status.length > 0) filterParams.status = filters.status[0];

      // Use secretaryService for fetching data
      let response;
      if (activeTab === 'students') {
        response = await secretaryService.getStudents(filterParams);
      } else {
        response = await secretaryService.getFaculty(filterParams);
      }
      
      setData(response.data || []);
      setTotalItems(response.pagination?.totalItems || 0);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please ensure the backend is running.');
      setData([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters or search change (with debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [
    activeTab,
    currentPage,
    filters.status.join(','),
    search
  ]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    filters.status.join(','),
    search
  ]);

  // Column definitions for each module
  const getColumns = () => {
    switch (activeTab) {
      case 'students':
        return [
          {
            key: 'student_id',
            header: 'Student ID',
            render: (row: StudentRecord) => (
              <span className="font-medium text-gray-900">{row.studentId}</span>
            )
          },
          {
            key: 'name',
            header: 'Name',
            render: (row: StudentRecord) => (
              <span>{`${row.firstName} ${row.lastName}`.trim()}</span>
            )
          },
          {
            key: 'email',
            header: 'Email',
            render: (row: StudentRecord) => (
              <span className="text-gray-600">{row.email}</span>
            )
          },
          {
            key: 'program',
            header: 'Program',
            render: (row: StudentRecord) => row.program || 'N/A'
          },
          {
            key: 'year_level',
            header: 'Year',
            render: (row: StudentRecord) => row.yearLevel || 'N/A'
          },
          {
            key: 'status',
            header: 'Status',
            render: (row: StudentRecord) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {row.status || 'Active'}
              </span>
            )
          }
        ];

      case 'faculty':
        return [
          {
            key: 'faculty_id',
            header: 'Faculty ID',
            render: (row: FacultyRecord) => (
              <span className="font-medium text-gray-900">{row.employeeId}</span>
            )
          },
          {
            key: 'name',
            header: 'Name',
            render: (row: FacultyRecord) => (
              <span>{`${row.firstName} ${row.lastName}`.trim()}</span>
            )
          },
          {
            key: 'email',
            header: 'Email',
            render: (row: FacultyRecord) => (
              <span className="text-gray-600">{row.email}</span>
            )
          },
          {
            key: 'department',
            header: 'Department',
            render: (row: FacultyRecord) => row.department || 'N/A'
          },
          {
            key: 'position',
            header: 'Position',
            render: (row: FacultyRecord) => row.position || 'N/A'
          },
          {
            key: 'specialization',
            header: 'Specialization',
            render: (row: FacultyRecord) => row.specialization || 'N/A'
          },
          {
            key: 'status',
            header: 'Status',
            render: (row: FacultyRecord) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {row.status || 'Active'}
              </span>
            )
          }
        ];

      default:
        return [];
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      
      // Backend requires 'format' field
      const response = await api.post(`/secretary/reports/${activeTab}`, {
        format: 'pdf'
      }, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      const blob = response.data;
      
      // Verify we got a PDF blob
      if (blob.type !== 'application/pdf' && blob.type !== 'application/octet-stream') {
        throw new Error('Invalid response type. Expected PDF.');
      }
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to export PDF:', err);
      console.error('Error response:', err.response);
      
      // Try to read the blob error message if it exists
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        console.error('Blob error message:', text);
        try {
          const errorJson = JSON.parse(text);
          alert(`Failed to export PDF: ${errorJson.message || errorJson.error || 'Unknown error'}`);
          return;
        } catch {
          alert(`Failed to export PDF: ${text}`);
          return;
        }
      }
      
      if (err.response?.status === 404) {
        alert('PDF export feature is not yet available. Please contact your administrator.');
      } else if (err.response?.status === 400) {
        alert('Invalid request. The backend returned a 400 error. Check console for details.');
      } else {
        alert(err.response?.data?.message || err.message || 'Failed to export PDF');
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <MainLayout title="Reports" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
            <p className="text-gray-600 mt-1">View and browse report data</p>
          </div>
          <Button
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportPDF}
            disabled={exporting || loading || data.length === 0}
          >
            {exporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert message={error} />}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
                    isActive
                      ? `${tab.borderColor} ${tab.color} font-semibold`
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              {filters.status.length > 0 && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {filters.status.length} filter(s) active
                </p>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {/* Search Bar - Always Visible */}
          <div className="mb-4">
            <SearchBar
              placeholder="Search by name, ID, or email…"
              onChange={setSearch}
              value={search}
            />
          </div>

          {/* Advanced Filters - Collapsible */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status?.[0] ?? ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value ? [e.target.value] : [] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  {activeTab === 'faculty' && <option value="on-leave">On Leave</option>}
                  {activeTab === 'students' && (
                    <>
                      <option value="graduated">Graduated</option>
                      <option value="dropped">Dropped</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ status: [] });
                    setSearch('');
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {filters.status.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {filters.status.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    Status: {filters.status[0]}
                    <button
                      onClick={() => setFilters({ ...filters, status: [] })}
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Data Table */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span>{totalItems} total items</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No data found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <Table
                data={data as any}
                columns={getColumns() as any}
              />
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {data.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} {activeTab}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
