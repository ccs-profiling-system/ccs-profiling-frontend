import { useEffect, useState } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { ErrorState } from '@/components/ui/PageStates';
import { Beaker, Search, Filter, X, Clock, Users, Calendar, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { researchService } from '@/services/api/researchService';
import type { ResearchOpportunity } from '../types';

interface ResearchApplication {
  id: string;
  opportunityId: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedDate: string;
}

export function ResearchPage() {
  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>([]);
  const [applications, setApplications] = useState<ResearchApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ResearchOpportunity | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: '',
    relevantExperience: '',
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    area: '',
    faculty: '',
    status: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadOpportunities();
  }, []);

  async function loadOpportunities() {
    try {
      setLoading(true);
      setError(null);
      const data = await researchService.getOpportunities();
      setOpportunities(data);
      
      // Mock applications data - in real app, fetch from API
      const mockApplications: ResearchApplication[] = [];
      setApplications(mockApplications);
    } catch (error) {
      console.error('Failed to load research opportunities:', error);
      setError('Failed to load research opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Apply filters
  const filteredOpportunities = opportunities.filter((opp) => {
    if (filters.area && opp.area !== filters.area) return false;
    if (filters.faculty && opp.faculty !== filters.faculty) return false;
    if (filters.status && opp.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        opp.title.toLowerCase().includes(searchLower) ||
        opp.description.toLowerCase().includes(searchLower) ||
        opp.faculty.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Get unique areas and faculty for filters
  const uniqueAreas = Array.from(new Set(opportunities.map((o) => o.area)));
  const uniqueFaculty = Array.from(new Set(opportunities.map((o) => o.faculty)));

  function clearFilters() {
    setFilters({ area: '', faculty: '', status: '', search: '' });
  }

  const hasActiveFilters = filters.area || filters.faculty || filters.status || filters.search;

  function openDetailModal(opportunity: ResearchOpportunity) {
    setSelectedOpportunity(opportunity);
  }

  function closeDetailModal() {
    setSelectedOpportunity(null);
  }

  function openApplicationModal(opportunity: ResearchOpportunity) {
    setSelectedOpportunity(opportunity);
    setShowApplicationModal(true);
    setApplicationForm({ coverLetter: '', relevantExperience: '' });
  }

  function closeApplicationModal() {
    setShowApplicationModal(false);
    setApplicationForm({ coverLetter: '', relevantExperience: '' });
  }

  async function handleSubmitApplication() {
    if (!selectedOpportunity) return;
    
    try {
      setSubmitting(true);
      await researchService.applyForOpportunity(selectedOpportunity.id, applicationForm);
      
      // Add to applications list
      const newApplication: ResearchApplication = {
        id: `app-${Date.now()}`,
        opportunityId: selectedOpportunity.id,
        status: 'pending',
        appliedDate: new Date().toISOString(),
      };
      setApplications([...applications, newApplication]);
      
      closeApplicationModal();
      closeDetailModal();
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function getApplicationStatus(opportunityId: string): ResearchApplication | undefined {
    return applications.find((app) => app.opportunityId === opportunityId);
  }

  function getStatusBadge(status: 'open' | 'closed' | 'filled') {
    const config = {
      open: { className: 'bg-green-100 text-green-800 border-green-200', label: 'Open' },
      closed: { className: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Closed' },
      filled: { className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Filled' },
    };
    const { className, label } = config[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
        {label}
      </span>
    );
  }

  function getApplicationStatusBadge(status: 'pending' | 'accepted' | 'rejected') {
    const config = {
      pending: { icon: AlertCircle, className: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      accepted: { icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-200', label: 'Accepted' },
      rejected: { icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
    };
    const { icon: Icon, className, label } = config[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  }

  return (
    <StudentLayout title="Research Opportunities">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Beaker className="w-7 h-7 text-primary" />
            Research Opportunities
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Explore and apply for CCS research projects
          </p>
        </div>

        {/* Error State */}
        {error && !loading && (
          <ErrorState message={error} onRetry={loadOpportunities} />
        )}

        {/* Search and Filter Bar */}
        <Card className="!p-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or faculty..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
                    {[filters.area, filters.faculty, filters.status, filters.search].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Area</label>
                    <select
                      value={filters.area}
                      onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Areas</option>
                      {uniqueAreas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Faculty</label>
                    <select
                      value={filters.faculty}
                      onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Faculty</option>
                      {uniqueFaculty.map((faculty) => (
                        <option key={faculty} value={faculty}>{faculty}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="filled">Filled</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing <span className="font-semibold text-gray-900">{filteredOpportunities.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{opportunities.length}</span> opportunities
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="!p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading research opportunities...</p>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && filteredOpportunities.length === 0 && (
          <Card className="!p-12">
            <div className="text-center">
              <Beaker className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasActiveFilters ? 'No matching opportunities found' : 'No research opportunities available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results'
                  : 'Check back later for new research opportunities'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Opportunities Grid */}
        {!loading && filteredOpportunities.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOpportunities.map((opportunity) => {
              const application = getApplicationStatus(opportunity.id);
              return (
                <Card key={opportunity.id} className="!p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {opportunity.title}
                        </h3>
                        <p className="text-sm text-gray-600">{opportunity.area}</p>
                      </div>
                      {getStatusBadge(opportunity.status)}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {opportunity.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">Faculty:</span>
                        <span>{opportunity.faculty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Time Commitment:</span>
                        <span>{opportunity.timeCommitment}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Deadline:</span>
                        <span>{new Date(opportunity.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">Slots:</span>
                        <span>{opportunity.applicants} / {opportunity.capacity}</span>
                      </div>
                    </div>

                    {/* Application Status */}
                    {application && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Your Application:</span>
                          {getApplicationStatusBadge(application.status)}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => openDetailModal(opportunity)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                      >
                        View Details
                      </button>
                      {!application && opportunity.status === 'open' && (
                        <button
                          type="button"
                          onClick={() => openApplicationModal(opportunity)}
                          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        {selectedOpportunity && !showApplicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Modal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedOpportunity.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{selectedOpportunity.area}</span>
                      {getStatusBadge(selectedOpportunity.status)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeDetailModal}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-700">{selectedOpportunity.description}</p>
                </div>

                {/* Required Skills */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpportunity.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Faculty Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Faculty Advisor</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-4 h-4" />
                      <span>{selectedOpportunity.faculty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${selectedOpportunity.facultyEmail}`} className="text-primary hover:underline">
                        {selectedOpportunity.facultyEmail}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Time Commitment</p>
                    <p className="text-sm font-medium text-gray-900">{selectedOpportunity.timeCommitment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Application Deadline</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedOpportunity.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Available Slots</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedOpportunity.capacity - selectedOpportunity.applicants} remaining
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Applicants</p>
                    <p className="text-sm font-medium text-gray-900">{selectedOpportunity.applicants}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeDetailModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                  {!getApplicationStatus(selectedOpportunity.id) && selectedOpportunity.status === 'open' && (
                    <button
                      type="button"
                      onClick={() => {
                        closeDetailModal();
                        openApplicationModal(selectedOpportunity);
                      }}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Modal */}
        {showApplicationModal && selectedOpportunity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Modal Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Apply for Research</h2>
                    <p className="text-sm text-gray-600">{selectedOpportunity.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeApplicationModal}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Application Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={applicationForm.coverLetter}
                      onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                      rows={6}
                      placeholder="Explain why you're interested in this research opportunity and what you hope to contribute..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relevant Experience <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={applicationForm.relevantExperience}
                      onChange={(e) => setApplicationForm({ ...applicationForm, relevantExperience: e.target.value })}
                      rows={6}
                      placeholder="Describe your relevant coursework, projects, or experience..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeApplicationModal}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={submitting || !applicationForm.coverLetter || !applicationForm.relevantExperience}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
