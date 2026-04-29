import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import chairStudentsService from '@/services/api/chair/chairStudentsService';
import chairFacultyService from '@/services/api/chair/chairFacultyService';
import chairResearchService from '@/services/api/chair/chairResearchService';
import chairEventsService from '@/services/api/chair/chairEventsService';
import chairReportsService from '@/services/api/chair/chairReportsService';
import { Calendar, Users, TrendingUp, Filter, FileText, CheckCircle } from 'lucide-react';

type ReportModule = 'students' | 'faculty' | 'research' | 'events';
type DataItem = any;

export function ChairReports() {
  const [activeTab, setActiveTab] = useState<ReportModule>('students');
  const [showFilters, setShowFilters] = useState(false);
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [totalItems, setTotalItems] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
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
      borderColor: 'border-blue-600'
    },
    { 
      id: 'faculty' as ReportModule,
      title: 'Faculty Reports', 
      icon: Users,
      color: 'text-green-600',
      borderColor: 'border-green-600'
    },
    { 
      id: 'research' as ReportModule,
      title: 'Research Reports', 
      icon: TrendingUp,
      color: 'text-primary',
      borderColor: 'border-primary'
    },
    { 
      id: 'events' as ReportModule,
      title: 'Event Reports', 
      icon: Calendar,
      color: 'text-purple-600',
      borderColor: 'border-purple-600'
    },
  ];

  // Fetch data based on active tab
  useEffect(() => {
    setCurrentPage(1);
    fetchData();
  }, [activeTab, filters]);

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setSelectedItems(new Set());

      let response;
      const filterParams = {
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
      };

      switch (activeTab) {
        case 'students':
          response = await chairStudentsService.getStudents(filterParams, currentPage, itemsPerPage);
          break;
        case 'faculty':
          response = await chairFacultyService.getFaculty(filterParams, currentPage, itemsPerPage);
          break;
        case 'research':
          response = await chairResearchService.getResearch(filterParams, currentPage, itemsPerPage);
          break;
        case 'events':
          response = await chairEventsService.getEvents(filterParams, currentPage, itemsPerPage);
          break;
      }

      setData(response.data || []);
      setTotalItems(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
      
      const blob = exportFormat === 'pdf'
        ? await chairReportsService.exportPDF(`${activeTab}-report`)
        : await chairReportsService.exportExcel(`${activeTab}-report`);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}-report-${new Date().toISOString().split('T')[0]}.${exportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsExportModalOpen(false);
      const exportCount = selectedItems.size > 0 ? selectedItems.size : totalItems;
      alert(`Report generated successfully! ${exportCount} ${activeTab} items included.`);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export data. Please try again.');
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
            render: (row: any) => (
              <input
                type="checkbox"
                checked={selectedItems.has(row.id)}
                onChange={() => handleSelectItem(row.id)}
                className="rounded border-gray-300"
              />
            )
          },
          {
            key: 'studentId',
            header: 'Student ID',
            render: (row: any) => (
              <span className="font-medium text-gray-900">{row.studentId}</span>
            )
          },
          {
            key: 'name',
            header: 'Name',
            render: (row: any) => (
              <span>{`${row.firstName} ${row.lastName}`.trim()}</span>
            )
          },
          {
            key: 'program',
            header: 'Program',
            render: (row: any) => row.program || 'N/A'
          },
          {
            key: 'yearLevel',
            header: 'Year',
            render: (row: any) => row.yearLevel || 'N/A'
          },
          {
            key: 'status',
            header: 'Status',
            render: (row: any) => (
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
            render: (row: any) => (
              <input
                type="checkbox"
                checked={selectedItems.has(row.id)}
                onChange={() => handleSelectItem(row.id)}
                className="rounded border-gray-300"
              />
            )
          },
          {
            key: 'facultyId',
            header: 'Faculty ID',
            render: (row: any) => (
              <span className="font-medium text-gray-900">{row.facultyId}</span>
            )
          },
          {
            key: 'name',
            header: 'Name',
            render: (row: any) => (
              <span>{`${row.firstName} ${row.lastName}`.trim()}</span>
            )
          },
          {
            key: 'email',
            header: 'Email',
            render: (row: any) => (
              <span className="text-gray-600">{row.email}</span>
            )
          },
          {
            key: 'specialization',
            header: 'Specialization',
            render: (row: any) => row.specialization || 'N/A'
          },
          {
            key: 'teachingLoad',
            header: 'Teaching Load',
            render: (row: any) => `${row.teachingLoad || 0} units`
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
            render: (row: any) => (
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
            render: (row: any) => (
              <span className="font-medium text-gray-900">{row.title}</span>
            )
          },
          {
            key: 'researchType',
            header: 'Type',
            render: (row: any) => (
              <span className="capitalize px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {row.researchType}
              </span>
            )
          },
          {
            key: 'status',
            header: 'Status',
            render: (row: any) => (
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
            key: 'authors',
            header: 'Authors',
            render: (row: any) => row.authors?.map((a: any) => a.name).join(', ') || 'N/A'
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
            render: (row: any) => (
              <input
                type="checkbox"
                checked={selectedItems.has(row.id)}
                onChange={() => handleSelectItem(row.id)}
                className="rounded border-gray-300"
              />
            )
          },
          {
            key: 'eventName',
            header: 'Event Name',
            render: (row: any) => (
              <span className="font-medium text-gray-900">{row.eventName}</span>
            )
          },
          {
            key: 'eventType',
            header: 'Type',
            render: (row: any) => (
              <span className="capitalize px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                {row.eventType}
              </span>
            )
          },
          {
            key: 'eventDate',
            header: 'Date',
            render: (row: any) => new Date(row.eventDate).toLocaleDateString()
          },
          {
            key: 'location',
            header: 'Location',
            render: (row: any) => row.location || 'N/A'
          },
          {
            key: 'status',
            header: 'Status',
            render: (row: any) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                row.status === 'completed' ? 'bg-green-100 text-green-700' :
                row.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
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

  if (loading) {
    return (
      <MainLayout title="Reports & Analytics" variant="chair">
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Reports & Analytics" variant="chair">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Select data to export as reports</p>
          </div>
          <Button
            onClick={() => setIsExportModalOpen(true)}
            disabled={data.length === 0}
            variant="primary"
            icon={<FileText className="w-4 h-4" />}
          >
            Generate Report {selectedItems.size > 0 && `(${selectedItems.size})`}
          </Button>
        </div>

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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              icon={<Filter className="w-4 h-4" />}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
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
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => setFilters({ search: '', status: 'all' })}
                  variant="outline"
                  fullWidth
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Data Table */}
        <Card className="p-6">
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
              {totalItems > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalItems / itemsPerPage)}
                  totalItems={totalItems}
                  pageSize={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setItemsPerPage}
                />
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
            <Button
              onClick={() => setIsExportModalOpen(false)}
              disabled={exporting}
              variant="outline"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
              variant="primary"
              loading={exporting}
              fullWidth
            >
              Generate Report
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
