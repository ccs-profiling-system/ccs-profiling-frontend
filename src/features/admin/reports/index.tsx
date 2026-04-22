import { useState, useEffect } from 'react';
import { MainLayout, Card, Modal } from '@/components/layout';
import { Calendar, Users, TrendingUp, Filter, FileText, CheckCircle } from 'lucide-react';
import { Spinner, ErrorAlert, Table } from '@/components/ui';
import { studentsService, facultyService, eventsService, reportsService } from '@/services/api';
import type { Student } from '@/types/students';
import type { Faculty } from '@/types/faculty';
import type { Research } from '@/types/research';
import type { Event } from '@/services/api/eventsService';

type ReportModule = 'students' | 'faculty' | 'research' | 'events';
type DataItem = Student | Faculty | Research | Event;

export function Reports() {
  const [activeTab, setActiveTab] = useState<ReportModule>('students');
  const [showFilters, setShowFilters] = useState(false);
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateRange: 'all'
  });

  // Export modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');

  const tabs = [
    { 
      id: 'students' as ReportModule,
      title: 'Student Reports', 
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-600'
    },
    { 
      id: 'faculty' as ReportModule,
      title: 'Faculty Reports', 
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-600'
    },
    { 
      id: 'research' as ReportModule,
      title: 'Research Reports', 
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary'
    },
    { 
      id: 'events' as ReportModule,
      title: 'Event Reports', 
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-600'
    },
  ];

  // Fetch data based on active tab
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when tab changes
    fetchData();
  }, [activeTab, filters]);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedItems(new Set());

      let response;
      switch (activeTab) {
        case 'students': {
          const studentFilters = {
            search: filters.search || undefined,
            status: filters.status !== 'all' ? filters.status as Student['status'] : undefined,
          };
          response = await studentsService.getStudents(studentFilters, currentPage, pageSize);
          break;
        }
        case 'faculty': {
          const facultyFilters = {
            search: filters.search || undefined,
            status: filters.status !== 'all' ? filters.status as Faculty['status'] : undefined,
          };
          response = await facultyService.getFaculty(facultyFilters, currentPage, pageSize);
          break;
        }
        case 'research': {
          // Research reports not yet implemented - use empty data
          response = {
            data: [],
            total: 0,
            page: currentPage,
            limit: pageSize,
          };
          break;
        }
        case 'events': {
          const eventsParams = {
            page: currentPage,
            pageSize: pageSize,
            search: filters.search || undefined,
            status: filters.status !== 'all' ? filters.status : undefined,
          };
          response = await eventsService.getEvents(eventsParams);
          break;
        }
      }

      setData(response.data);
      setTotalItems(response.total ?? 0);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please ensure the backend is running.');
      setData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map(item => item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Build filter parameters to pass to backend
      const exportFilters: any = {
        module: activeTab,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
      };

      // If items are selected, export only those
      // Otherwise, export all filtered items from current tab
      const selectedIds = selectedItems.size > 0 ? Array.from(selectedItems) : undefined;
      
      // Generate report based on active tab with filters
      await reportsService.generateReport({
        type: activeTab,
        format: exportFormat,
        dateRange: 'current-month',
        filters: exportFilters,
        selectedIds: selectedIds
      });
      
      setIsExportModalOpen(false);
      const exportCount = selectedItems.size > 0 ? selectedItems.size : totalItems;
      alert(`Report generated successfully! ${exportCount} ${activeTab} items included.`);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  // Column definitions for each module
  const getColumns = () => {
    switch (activeTab) {
      case 'students':
        return [
          {
            key: 'select',
            header: (
              <input
                type="checkbox"
                checked={selectedItems.size === data.length && data.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
            ),
            render: (row: Student) => (
              <input
                type="checkbox"
                checked={selectedItems.has(row.id)}
                onChange={() => handleSelectItem(row.id)}
                className="rounded border-gray-300"
              />
            )
          },
          {
            key: 'student_id',
            header: 'Student ID',
            render: (row: Student) => (
              <span className="font-medium text-gray-900">{row.studentId}</span>
            )
          },
          {
            key: 'name',
            header: 'Name',
            render: (row: Student) => (
              <span>{`${row.firstName} ${row.lastName}`.trim()}</span>
            )
          },
          {
            key: 'email',
            header: 'Email',
            render: (row: Student) => (
              <span className="text-gray-600">{row.email}</span>
            )
          },
          {
            key: 'program',
            header: 'Program',
            render: (row: Student) => row.program || 'N/A'
          },
          {
            key: 'year_level',
            header: 'Year',
            render: (row: Student) => row.yearLevel || 'N/A'
          },
          {
            key: 'gpa',
            header: 'GPA',
            render: () => {
              // GPA is not in the Student type, so we'll show N/A
              return 'N/A';
            }
          },
          {
            key: 'status',
            header: 'Status',
            render: (row: Student) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {row.status || 'Active'}
              </span>
            )
          }
        ];

      case 'faculty':
        return [
          {
            key: 'select',
            header: (
              <input
                type="checkbox"
                checked={selectedItems.size === data.length && data.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
            ),
            render: (row: Faculty) => (
              <input
                type="checkbox"
                checked={selectedItems.has(row.id)}
                onChange={() => handleSelectItem(row.id)}
                className="rounded border-gray-300"
              />
            )
          },
          {
            key: 'faculty_id',
            header: 'Faculty ID',
            render: (row: Faculty) => (
              <span className="font-medium text-gray-900">{row.facultyId}</span>
            )
          },
          {
            key: 'name',
            header: 'Name',
            render: (row: Faculty) => (
              <span>{`${row.firstName} ${row.lastName}`.trim()}</span>
            )
          },
          {
            key: 'email',
            header: 'Email',
            render: (row: Faculty) => (
              <span className="text-gray-600">{row.email}</span>
            )
          },
          {
            key: 'department',
            header: 'Department',
            render: (row: Faculty) => row.department || 'N/A'
          },
          {
            key: 'position',
            header: 'Position',
            render: (row: Faculty) => row.position || 'N/A'
          },
          {
            key: 'specialization',
            header: 'Specialization',
            render: (row: Faculty) => row.specialization || 'N/A'
          },
          {
            key: 'status',
            header: 'Status',
            render: (row: Faculty) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {row.status || 'Active'}
              </span>
            )
          }
        ];

      case 'research':
        return [
          {
            key: 'select',
            header: (
              <input
                type="checkbox"
                checked={selectedItems.size === data.length && data.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
            ),
            render: (row: Research) => (
              <input
                type="checkbox"
                checked={selectedItems.has(row.id)}
                onChange={() => handleSelectItem(row.id)}
                className="rounded border-gray-300"
              />
            )
          },
          {
            key: 'title',
            header: 'Title',
            render: (row: Research) => (
              <span className="font-medium text-gray-900">{row.title}</span>
            )
          },
          {
            key: 'type',
            header: 'Type',
            render: (row: Research) => (
              <span className="capitalize px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {row.type}
              </span>
            )
          },
          {
            key: 'status',
            header: 'Status',
            render: (row: Research) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                row.status === 'completed' ? 'bg-green-100 text-green-700' :
                row.status === 'published' ? 'bg-purple-100 text-purple-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {row.status}
              </span>
            )
          },
          {
            key: 'start_date',
            header: 'Start Date',
            render: (row: Research) => row.start_date ? new Date(row.start_date).toLocaleDateString() : 'N/A'
          },
          {
            key: 'completion_date',
            header: 'Completion',
            render: (row: Research) => row.completion_date ? new Date(row.completion_date).toLocaleDateString() : 'N/A'
          }
        ];

      case 'events':
        return [
          {
            key: 'select',
            header: (
              <input
                type="checkbox"
                checked={selectedItems.size === data.length && data.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
            ),
            render: (row: Event) => (
              <input
                type="checkbox"
                checked={selectedItems.has(row.id)}
                onChange={() => handleSelectItem(row.id)}
                className="rounded border-gray-300"
              />
            )
          },
          {
            key: 'event_name',
            header: 'Event Name',
            render: (row: Event) => (
              <span className="font-medium text-gray-900">{row.event_name}</span>
            )
          },
          {
            key: 'event_type',
            header: 'Type',
            render: (row: Event) => (
              <span className="capitalize px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                {row.event_type}
              </span>
            )
          },
          {
            key: 'start_date',
            header: 'Start Date',
            render: (row: Event) => new Date(row.start_date).toLocaleDateString()
          },
          {
            key: 'location',
            header: 'Location',
            render: (row: Event) => row.location || 'N/A'
          },
          {
            key: 'organizer',
            header: 'Organizer',
            render: (row: Event) => row.organizer || 'N/A'
          },
          {
            key: 'status',
            header: 'Status',
            render: (row: Event) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                row.status === 'completed' ? 'bg-green-100 text-green-700' :
                row.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                row.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {row.status}
              </span>
            )
          }
        ];

      default:
        return [];
    }
  };

  return (
    <MainLayout title="Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
            <p className="text-gray-600 mt-1">Select data to export as reports</p>
          </div>
          <button
            onClick={() => setIsExportModalOpen(true)}
            disabled={data.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            Generate Report {selectedItems.size > 0 && `(${selectedItems.size})`}
          </button>
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
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  {activeTab === 'research' && (
                    <>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="published">Published</option>
                    </>
                  )}
                  {activeTab === 'events' && (
                    <>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ search: '', status: 'all', dateRange: 'all' })}
                  className="w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Data Table */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedItems.size > 0 ? (
                <span className="font-medium text-primary">
                  {selectedItems.size} of {totalItems} selected
                </span>
              ) : (
                <span>{totalItems} total items</span>
              )}
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
              {totalItems > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Show</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>
                      entries per page
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="First page"
                    >
                      «
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Previous page"
                    >
                      ‹
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalPages = Math.ceil(totalItems / pageSize);
                        const pages = [];
                        const maxVisible = 5;
                        
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                        
                        if (endPage - startPage < maxVisible - 1) {
                          startPage = Math.max(1, endPage - maxVisible + 1);
                        }
                        
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-3 py-1 border rounded transition ${
                                currentPage === i
                                  ? 'bg-primary text-white border-primary'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        
                        return pages;
                      })()}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalItems / pageSize), prev + 1))}
                      disabled={currentPage >= Math.ceil(totalItems / pageSize)}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Next page"
                    >
                      ›
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.ceil(totalItems / pageSize))}
                      disabled={currentPage >= Math.ceil(totalItems / pageSize)}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Last page"
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={`Generate ${tabs.find(t => t.id === activeTab)?.title}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                {selectedItems.size > 0 
                  ? `Report will include ${selectedItems.size} selected ${activeTab}`
                  : `Report will include all ${totalItems} filtered ${activeTab}`
                }
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {selectedItems.size > 0 
                  ? 'Only the selected items will be included'
                  : filters.search || filters.status !== 'all'
                    ? 'Report includes only filtered results from this tab'
                    : 'Report includes all items from this tab'
                }
              </p>
              {(filters.search || filters.status !== 'all') && (
                <div className="mt-2 text-xs text-blue-800">
                  <p className="font-medium">Active filters:</p>
                  <ul className="list-disc list-inside mt-1">
                    {filters.search && <li>Search: "{filters.search}"</li>}
                    {filters.status !== 'all' && <li>Status: {filters.status}</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Format <span className="text-red-500">*</span>
            </label>
            <select 
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pdf">PDF Document</option>
              <option value="excel">Excel Spreadsheet (XLSX)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsExportModalOpen(false)}
              disabled={exporting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow hover:shadow-md disabled:opacity-50"
            >
              {exporting ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
