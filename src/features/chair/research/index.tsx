import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButtons } from '@/components/ui/ExportButtons';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import chairResearchService, { type Research } from '@/services/api/chair/chairResearchService';
import { FlaskConical, Filter, Users } from 'lucide-react';

export function ChairResearch() {
  const navigate = useNavigate();
  const [research, setResearch] = useState<Research[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    published: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadResearch();
  }, []);

  const loadResearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chairResearchService.getResearch();
      const data = response.data || [];
      setResearch(data);
      
      // Calculate stats
      setStats({
        total: data.length,
        ongoing: data.filter((r: Research) => r.status === 'ongoing').length,
        completed: data.filter((r: Research) => r.status === 'completed').length,
        published: data.filter((r: Research) => r.status === 'published').length,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load research');
      setResearch([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResearch = useMemo(() => {
    let filtered = research;
    
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.abstract?.toLowerCase().includes(q) ||
        item.authors.some(a => a.name.toLowerCase().includes(q))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.researchType === typeFilter);
    }
    
    return filtered;
  }, [research, search, statusFilter, typeFilter]);

  // Paginated research
  const paginatedResearch = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredResearch.slice(startIndex, endIndex);
  }, [filteredResearch, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredResearch.length / pageSize);

  const handleExportPDF = async (): Promise<void> => {
    setExporting(true);
    try {
      const { exportToPDF, createStatusBadge } = await import('@/components/export');
      
      exportToPDF({
        data: filteredResearch,
        columns: [
          { key: 'title', header: 'Title', render: (r) => `<strong>${r.title}</strong>` },
          { key: 'researchType', header: 'Type' },
          { key: 'authors', header: 'Authors', render: (r) => r.authors.map((a: any) => a.name).join(', ') },
          { key: 'advisers', header: 'Advisers', render: (r) => r.advisers.map((a: any) => a.name).join(', ') },
          { key: 'status', header: 'Status', render: (r) => createStatusBadge(r.status || 'unknown') },
        ],
        filename: `chair_research_${new Date().toISOString().split('T')[0]}`,
        title: 'Research Report (Chair View)',
        subtitle: 'College of Computer Studies',
        icon: '🔬',
        primaryColor: '#8b5cf6',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async (): Promise<void> => {
    setExporting(true);
    try {
      const { exportToCSV } = await import('@/components/export');
      
      exportToCSV({
        data: filteredResearch,
        columns: [
          { key: 'title', header: 'Title' },
          { key: 'researchType', header: 'Type' },
          { key: 'abstract', header: 'Abstract' },
          { key: 'authors', header: 'Authors', render: (r) => r.authors.map((a: any) => a.name).join(', ') },
          { key: 'advisers', header: 'Advisers', render: (r) => r.advisers.map((a: any) => a.name).join(', ') },
          { key: 'status', header: 'Status' },
        ],
        filename: `chair_research_${new Date().toISOString().split('T')[0]}`,
        title: 'Research Report (Chair View)',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <MainLayout title="Research" variant="chair">
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-blue">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Research</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-orange">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Ongoing</p>
            <p className="text-3xl font-bold text-gray-900">{stats.ongoing}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-green">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-purple">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Published</p>
            <p className="text-3xl font-bold text-gray-900">{stats.published}</p>
          </div>
        </div>

        {/* Error */}
        {error && <ErrorAlert message={error} onRetry={loadResearch} />}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" text="Loading research…" />
          </div>
        )}

        {!loading && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Research Projects</h1>
                <p className="text-gray-500 text-sm mt-0.5">View and manage research records</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  loading={exporting}
                />
              </div>
            </div>

            {/* Filters */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {(statusFilter !== 'all' || typeFilter !== 'all' || search) 
                      ? `${[statusFilter !== 'all', typeFilter !== 'all', search].filter(Boolean).length} filter(s) active`
                      : 'No filters applied'}
                  </p>
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
                  placeholder="Search by title, abstract, or author…"
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
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Status</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Research Type
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Types</option>
                      <option value="thesis">Thesis</option>
                      <option value="capstone">Capstone</option>
                      <option value="journal">Journal</option>
                      <option value="conference">Conference</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setTypeFilter('all');
                        setSearch('');
                      }}
                      className="w-full md:w-auto px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Active Filters Summary */}
              {(statusFilter !== 'all' || typeFilter !== 'all') && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700">Active filters:</span>
                    {statusFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        Status: {statusFilter}
                        <button
                          onClick={() => setStatusFilter('all')}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {typeFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Type: {typeFilter}
                        <button
                          onClick={() => setTypeFilter('all')}
                          className="hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Empty State */}
            {paginatedResearch.length === 0 && (
              <Card className="!p-12">
                <div className="text-center">
                  <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {research.length === 0 ? 'No research projects found' : 'No research matches your filters'}
                  </h3>
                  <p className="text-gray-600">
                    {research.length === 0 
                      ? 'Research projects will appear here once they are created' 
                      : 'Try adjusting your filters to see more results'}
                  </p>
                </div>
              </Card>
            )}

            {/* Research Grid */}
            {paginatedResearch.length > 0 && (
              <div className="grid gap-4">
                {paginatedResearch.map((item) => (
                  <Card 
                    key={item.id} 
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/chair/research/${item.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                          <Badge variant="info" size="sm">{item.researchType}</Badge>
                          <Badge
                            variant={
                              item.status === 'completed' ? 'success' :
                              item.status === 'published' ? 'info' : 'warning'
                            }
                            size="sm"
                          >
                            {item.status}
                          </Badge>
                          {item.approvalStatus && (
                            <Badge
                              variant={
                                item.approvalStatus === 'approved' ? 'success' :
                                item.approvalStatus === 'rejected' ? 'warning' : 'info'
                              }
                              size="sm"
                            >
                              {item.approvalStatus}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.abstract}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Authors: {item.authors.map(a => a.name).join(', ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Advisers: {item.advisers.map(a => a.name).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredResearch.length > 0 && (
              <Card className="!p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredResearch.length}
                  pageSize={pageSize}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
