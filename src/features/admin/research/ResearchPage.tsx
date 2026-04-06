import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout, Card } from '@/components/layout';
import { Search, Filter, Plus, Edit2, Trash2, FlaskConical, X } from 'lucide-react';
import { useResearch } from './useResearch';
import { ResearchStatusBadge } from './ResearchStatusBadge';
import { ResearchFormModal } from './ResearchFormModal';
import { applyFilters } from './filterUtils';
import { getPeople } from './peopleService';
import type { Research, ResearchFilters, ResearchStatus, Person } from './types';
import { VALID_RESEARCH_STATUSES } from './validation';

export function ResearchPage() {
  const navigate = useNavigate();
  const { research, loading, error, fetchResearch, createResearch, updateResearch, deleteResearch } = useResearch();

  // Debug: Log research to see what it actually is
  console.log('ResearchPage - research:', research, 'type:', typeof research, 'isArray:', Array.isArray(research));

  // Ensure research is always an array
  const safeResearch = Array.isArray(research) ? research : [];

  const [filters, setFilters] = useState<ResearchFilters>({ status: '', category: '', titleSearch: '' });
  const [people, setPeople] = useState<Person[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Research | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchResearch();
    getPeople().then(setPeople).catch(() => {});
  }, [fetchResearch]);

  const filtered = applyFilters(safeResearch, filters);

  // Derive unique categories from loaded research for the filter dropdown
  const categories = Array.from(new Set(safeResearch.map((r) => r.category))).filter(Boolean);

  function setFilter<K extends keyof ResearchFilters>(key: K, value: ResearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters({ status: '', category: '', titleSearch: '' });
  }

  const hasActiveFilters = filters.status || filters.category || filters.titleSearch;

  async function handleDelete(r: Research) {
    if (!window.confirm(`Delete "${r.title}"?`)) return;
    await deleteResearch(r.id);
  }

  return (
    <MainLayout title="Research Management">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FlaskConical className="w-7 h-7 text-primary" />
              Research Projects
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and track academic research records
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Research
          </button>
        </div>

        {/* Search and Filter Bar */}
        <Card className="!p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={filters.titleSearch ?? ''}
                  onChange={(e) => setFilter('titleSearch', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {[filters.status, filters.category, filters.titleSearch].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status
                    </label>
                    <select
                      value={filters.status ?? ''}
                      onChange={(e) => setFilter('status', e.target.value as ResearchStatus | '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    >
                      <option value="">All Statuses</option>
                      {VALID_RESEARCH_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category
                    </label>
                    <select
                      value={filters.category ?? ''}
                      onChange={(e) => setFilter('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{safeResearch.length}</span> research projects
          </span>
          {hasActiveFilters && (
            <span className="text-primary font-medium">Filters active</span>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="!p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading research projects...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="!p-6 border-l-4 border-l-secondary bg-red-50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 text-secondary mt-0.5">⚠</div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary mb-1">Error Loading Research</h3>
                <p className="text-sm text-gray-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <Card className="!p-12">
            <div className="text-center">
              <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasActiveFilters ? 'No matching research found' : 'No research projects yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results'
                  : 'Get started by creating your first research project'}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Research Project
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Research Table */}
        {!loading && filtered.length > 0 && (
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Title
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
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => navigate(`/admin/research/${r.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ResearchStatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {r.authors.length > 0 ? (
                          <span>{r.authors.length} author{r.authors.length !== 1 ? 's' : ''}</span>
                        ) : (
                          <span className="text-gray-400">No authors</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditTarget(r)}
                            className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(r)}
                            className="p-2 text-gray-600 hover:text-secondary hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Create Modal */}
        {createOpen && (
          <ResearchFormModal
            people={people}
            onClose={() => setCreateOpen(false)}
            onCreate={async (payload) => {
              await createResearch(payload);
            }}
            onUpdate={async () => {}}
          />
        )}

        {/* Edit Modal */}
        {editTarget && (
          <ResearchFormModal
            existing={editTarget}
            people={people}
            onClose={() => setEditTarget(undefined)}
            onCreate={async () => {}}
            onUpdate={async (id, payload) => {
              await updateResearch(id, payload);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
