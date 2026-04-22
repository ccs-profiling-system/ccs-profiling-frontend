import { useEffect, useState } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import {
  Beaker, CheckCircle2, Circle, Clock, Users, Calendar,
  Mail, AlertCircle, BookOpen, Search, X, ExternalLink,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { researchService } from '@/services/api/researchService';
import type { ResearchOpportunity } from '../types';

type ProjectStatus = 'proposal' | 'ongoing' | 'for_defence' | 'completed';

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  adviser: string;
  adviserEmail: string;
  status: ProjectStatus;
  milestones: { label: string; done: boolean }[];
}

const MOCK_PROJECT: ResearchProject = {
  id: 'proj-1',
  title: 'Machine Learning-Based Anomaly Detection in Network Traffic',
  description:
    'This capstone project develops a real-time anomaly detection system using supervised and unsupervised machine learning techniques applied to network traffic data to identify potential cybersecurity threats.',
  adviser: 'Dr. Maria Santos',
  adviserEmail: 'maria.santos@ccs.edu',
  status: 'ongoing',
  milestones: [
    { label: 'Topic Approval', done: true },
    { label: 'Proposal Defense', done: true },
    { label: 'Chapter 1–3 Submission', done: true },
    { label: 'Data Collection & Preprocessing', done: true },
    { label: 'Model Development', done: false },
    { label: 'Final Defense', done: false },
    { label: 'Manuscript Submission', done: false },
  ],
};

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  proposal: { label: 'Proposal Stage', color: 'bg-yellow-100 text-yellow-800' },
  ongoing: { label: 'Ongoing', color: 'bg-blue-100 text-blue-800' },
  for_defence: { label: 'For Defence', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
};

const AREA_COLORS: Record<string, string> = {
  'Machine Learning': 'bg-violet-100 text-violet-700',
  'Cybersecurity': 'bg-red-100 text-red-700',
  'Web Development': 'bg-blue-100 text-blue-700',
  'Data Science': 'bg-orange-100 text-orange-700',
  'Mobile Development': 'bg-green-100 text-green-700',
};

function getAreaColor(area: string) {
  return AREA_COLORS[area] ?? 'bg-gray-100 text-gray-700';
}

export function ResearchPage() {
  const [project] = useState<ResearchProject | null>(MOCK_PROJECT);
  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<ResearchOpportunity | null>(null);
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [showMilestones, setShowMilestones] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await researchService.getOpportunities();
      setOpportunities(data.filter(o => o.status === 'open'));
    } catch {
      setError('Failed to load research opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const areas = [...new Set(opportunities.map(o => o.area).filter(Boolean))];

  const filtered = opportunities.filter(o => {
    const matchSearch = !search ||
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase()) ||
      o.faculty.toLowerCase().includes(search.toLowerCase());
    const matchArea = !filterArea || o.area === filterArea;
    return matchSearch && matchArea;
  });

  if (loading) return <StudentLayout title="Research"><LoadingState text="Loading research data..." /></StudentLayout>;
  if (error) return <StudentLayout title="Research"><ErrorState message={error} onRetry={load} /></StudentLayout>;

  const completedMilestones = project?.milestones.filter(m => m.done).length ?? 0;
  const totalMilestones = project?.milestones.length ?? 0;
  const progressPct = totalMilestones ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const currentMilestoneIdx = project?.milestones.findIndex(m => !m.done) ?? -1;

  return (
    <StudentLayout title="Research">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Beaker className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Research Involvement</h1>
            <p className="text-sm text-gray-500">Track your thesis progress and explore research opportunities</p>
          </div>
        </div>

        {/* Active Project */}
        {project ? (
          <Card>
            <div className="space-y-4">
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-semibold text-gray-800">My Thesis / Capstone Project</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[project.status].color}`}>
                  {STATUS_CONFIG[project.status].label}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              </div>

              {/* Adviser */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{project.adviser}</p>
                  <a href={`mailto:${project.adviserEmail}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Mail className="w-3 h-3" />{project.adviserEmail}
                  </a>
                </div>
              </div>

              {/* Progress summary */}
              <div>
                <button
                  onClick={() => setShowMilestones(v => !v)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-2"
                >
                  <span>Milestones — {completedMilestones}/{totalMilestones} completed ({progressPct}%)</span>
                  {showMilestones ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {showMilestones && (
                  <div className="space-y-2">
                    {project.milestones.map((m, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${i === currentMilestoneIdx ? 'bg-blue-50' : ''}`}>
                        {m.done
                          ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                        <span className={`text-sm flex-1 ${m.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {m.label}
                        </span>
                        {i === currentMilestoneIdx && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">No active research project</p>
                <p className="text-sm text-yellow-700 mt-1">You don't have an active thesis or capstone project yet. Browse available opportunities below.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Opportunities Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-gray-800">Available Research Opportunities</h2>
            {opportunities.length > 0 && (
              <span className="ml-auto px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                {opportunities.length} open
              </span>
            )}
          </div>

          {/* Search & Filter */}
          {opportunities.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or faculty..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {areas.length > 0 && (
                <select
                  value={filterArea}
                  onChange={e => setFilterArea(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="">All Areas</option>
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              )}
            </div>
          )}

          {/* Cards grid */}
          {filtered.length === 0 && opportunities.length === 0 && (
            <Card className="text-center py-10">
              <Beaker className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No open opportunities right now</p>
              <p className="text-sm text-gray-400 mt-1">Check back later for new research postings.</p>
            </Card>
          )}

          {filtered.length === 0 && opportunities.length > 0 && (
            <Card className="text-center py-8">
              <p className="text-gray-500">No results match your search.</p>
              <button onClick={() => { setSearch(''); setFilterArea(''); }} className="text-sm text-primary hover:underline mt-1">
                Clear filters
              </button>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(opp => {
              const spotsLeft = opp.capacity - opp.applicants;
              const isAlmostFull = spotsLeft <= 2;
              return (
                <button
                  key={opp.id}
                  onClick={() => setSelectedOpp(opp)}
                  className="text-left w-full"
                >
                  <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all duration-200 border border-transparent">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 leading-snug">{opp.title}</h3>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${getAreaColor(opp.area)}`}>
                          {opp.area}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-2">{opp.description}</p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{opp.faculty}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{opp.timeCommitment}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Deadline: {new Date(opp.deadline).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {opp.requiredSkills.slice(0, 3).map(s => (
                            <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{s}</span>
                          ))}
                          {opp.requiredSkills.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{opp.requiredSkills.length - 3}</span>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${isAlmostFull ? 'text-orange-600' : 'text-gray-400'}`}>
                          {spotsLeft} slot{spotsLeft !== 1 ? 's' : ''} left
                        </span>
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Modal */}
        {selectedOpp && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOpp(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="p-6 space-y-5">
                {/* Modal header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getAreaColor(selectedOpp.area)}`}>
                        {selectedOpp.area}
                      </span>
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Open</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedOpp.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedOpp(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">{selectedOpp.description}</p>

                {/* Skills */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpp.requiredSkills.map(s => (
                      <span key={s} className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-100">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Faculty Adviser</p>
                    <p className="font-semibold text-gray-900">{selectedOpp.faculty}</p>
                    <a
                      href={`mailto:${selectedOpp.facultyEmail}`}
                      className="text-primary text-xs hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Mail className="w-3 h-3" />{selectedOpp.facultyEmail}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Time Commitment</p>
                    <p className="font-semibold text-gray-900">{selectedOpp.timeCommitment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Application Deadline</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedOpp.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Slots Available</p>
                    <p className={`font-semibold ${selectedOpp.capacity - selectedOpp.applicants <= 2 ? 'text-orange-600' : 'text-gray-900'}`}>
                      {selectedOpp.capacity - selectedOpp.applicants} of {selectedOpp.capacity}
                    </p>
                  </div>
                </div>

                {/* Footer note */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <ExternalLink className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    To apply for this opportunity, contact the faculty adviser directly via email or visit the CCS Research Office.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOpp(null)}
                  className="w-full px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
