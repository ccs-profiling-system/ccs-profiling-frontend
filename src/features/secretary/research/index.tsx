import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { FlaskConical, Filter, Eye, Plus, Edit2, Send } from 'lucide-react';
import adminResearchService from '@/services/api/adminResearchService';
import { ResearchFormModal } from './ResearchFormModal';
import { studentsService, facultyService } from '@/services/api';

type ResearchStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'ongoing' | 'completed' | 'published';

interface ResearchData {
  id: string;
  title: string;
  abstract: string;
  category: string;
  program?: string;
  status: ResearchStatus;
  authors: string[];
  adviser: string;
  approvalStatus?: string;
  createdAt: string;
  updatedAt: string;
}

interface Person {
  id: string;
  name: string;
  role: 'student' | 'faculty';
}

export function SecretaryResearch() {
  const navigate = useNavigate();
  const [research, setResearch] = useState<ResearchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filters
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: [] as string[],
    category: [] as string[],
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ResearchData | undefined>(undefined);
  const [people, setPeople] = useState<Person[]>([]);

  // Fetch research data
  const fetchResearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams = {
        search: search || undefined,
        status: filters.status.length > 0 ? filters.status[0] : undefined,
        category: filters.category.length > 0 ? filters.category[0] : undefined,
      };

      // Use the same endpoint as admin - /api/research
      const response = await adminResearchService.getResearch(filterParams);
      
      // Secretary can see all research, including those with approval statuses
      // The backend should return research with approval_status field
      setResearch(response.data as ResearchData[] || []);
    } catch (err: any) {
      console.error('Failed to fetch research:', err);
      setError('Failed to load research data. Please ensure the backend is running.');
      setResearch([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch people (students and faculty) for the form
  const fetchPeople = async () => {
    try {
      const [studentsRes, facultyRes] = await Promise.all([
        studentsService.getStudents({}, 1, 1000),
        facultyService.getFaculty({}, 1, 1000),
      ]);

      const students: Person[] = studentsRes.data.map((s: any) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        role: 'student' as const,
      }));

      const faculty: Person[] = facultyRes.data.map((f: any) => ({
        id: f.id,
        name: `${f.firstName} ${f.lastName}`,
        role: 'faculty' as const,
      }));

      setPeople([...students, ...faculty]);
    } catch (err) {
      console.error('Failed to fetch people:', err);
      // Use mock data as fallback
      setPeople([
        { id: 's1', name: 'John Doe', role: 'student' },
        { id: 's2', name: 'Jane Smith', role: 'student' },
        { id: 'f1', name: 'Dr. Robert Johnson', role: 'faculty' },
        { id: 'f2', name: 'Prof. Michael Brown', role: 'faculty' },
      ]);
    }
  };

  // Fetch data with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, filters.status.join(','), filters.category.join(',')]);

  // Fetch people on mount
  useEffect(() => {
    fetchPeople();
  }, []);

  const handleCreateResearch = async (payload: any) => {
    try {
      // Call API to create research (will be in draft/pending status)
      // await secretaryService.createResearch(payload);
      console.log('Creating research:', payload);
      alert('Research project submitted for approval!');
      fetchResearch();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create research');
    }
  };

  const handleUpdateResearch = async (payload: any) => {
    if (!editTarget) return;
    try {
      // await secretaryService.updateResearch(editTarget.id, payload);
      console.log('Updating research:', editTarget.id, payload);
      alert('Research project updated!');
      fetchResearch();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update research');
    }
  };

  const handleSubmitForApproval = async (id: string) => {
    if (!confirm('Submit this research for approval?')) return;
    try {
      // await secretaryService.submitResearchForApproval(id);
      console.log('Submitting research for approval:', id);
      alert('Research submitted for approval!');
      fetchResearch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit for approval');
    }
  };
  // Get unique categories from research data
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(research.map(r => r.category))).filter(Boolean);
    return uniqueCategories;
  }, [research]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'ongoing':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'published':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/secretary/research/${id}`);
  };

  return (
    <MainLayout title="Research" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FlaskConical className="w-8 h-8 text-primary" />
              Research Projects
            </h1>
            <p className="text-gray-600 mt-1">Create and manage research records</p>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Research
          </Button>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert message={error} />}

        {/* Filters */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              {(filters.status.length > 0 || filters.category.length > 0) && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {filters.status.length + filters.category.length} filter(s) active
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
              placeholder="Search by title or abstract…"
              onChange={setSearch}
              value={search}
            />
          </div>

          {/* Advanced Filters - Collapsible */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
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
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category?.[0] ?? ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value ? [e.target.value] : [] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ status: [], category: [] });
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
          {(filters.status.length > 0 || filters.category.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {filters.status.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    Status: {filters.status[0]}
                    <button
                      onClick={() => setFilters({ ...filters, status: [] })}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.category.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    Category: {filters.category[0]}
                    <button
                      onClick={() => setFilters({ ...filters, category: [] })}
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

        {/* Research List */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span>{research.length} research project(s)</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : research.length === 0 ? (
            <div className="text-center py-12">
              <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No research projects found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Authors
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {research.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div>
                            <div className="font-medium text-gray-900">{r.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                              {r.abstract}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {r.program || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(r.status)}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {r.authors && r.authors.length > 0 ? (
                          <span>{r.authors.length} author{r.authors.length !== 1 ? 's' : ''}</span>
                        ) : (
                          <span className="text-gray-400">No authors</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === 'draft' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Edit2 className="w-4 h-4" />}
                                onClick={() => setEditTarget(r)}
                                title="Edit"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Send className="w-4 h-4" />}
                                onClick={() => handleSubmitForApproval(r.id)}
                                title="Submit for Approval"
                              />
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => handleViewDetails(r.id)}
                            title="View Details"
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <ResearchFormModal
          people={people}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateResearch}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <ResearchFormModal
          existing={editTarget}
          people={people}
          onClose={() => setEditTarget(undefined)}
          onSubmit={handleUpdateResearch}
        />
      )}
    </MainLayout>
  );
}
