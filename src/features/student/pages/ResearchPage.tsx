import { useEffect, useState } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import {
  Beaker, CheckCircle2, Circle, Clock, Users, Calendar,
  Mail, AlertCircle, ChevronRight, BookOpen,
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

// Mock active project — replace with API when available
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

export function ResearchPage() {
  const [project] = useState<ResearchProject | null>(MOCK_PROJECT);
  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<ResearchOpportunity | null>(null);
  const [applicationStatuses, setApplicationStatuses] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await researchService.getOpportunities();
      const open = data.filter(o => o.status === 'open');
      setOpportunities(open);

      // Check application status for each opportunity
      const statuses: Record<string, string> = {};
      await Promise.all(
        open.map(async (opp) => {
          try {
            const status = await researchService.getApplicationStatus(opp.id);
            if (status) statuses[opp.id] = status.status ?? 'applied';
          } catch {
            // no application for this opportunity
          }
        })
      );
      setApplicationStatuses(statuses);
    } catch {
      setError('Failed to load research data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (opp: ResearchOpportunity) => {
    setApplying(opp.id);
    try {
      await researchService.applyForOpportunity(opp.id, {});
      setApplicationStatuses(prev => ({ ...prev, [opp.id]: 'applied' }));
      setSelectedOpp(null);
    } catch {
      // silently handle — user can retry
    } finally {
      setApplying(null);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <StudentLayout title="Research"><LoadingState text="Loading research data..." /></StudentLayout>;
  if (error) return <StudentLayout title="Research"><ErrorState message={error} onRetry={load} /></StudentLayout>;

  const completedMilestones = project?.milestones.filter(m => m.done).length ?? 0;
  const totalMilestones = project?.milestones.length ?? 0;

  return (
    <StudentLayout title="Research">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Beaker className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Research Involvement</h1>
        </div>

        {/* Active Thesis / Capstone */}
        {project ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              My Thesis / Capstone Project
            </h2>

            <Card>
              <div className="space-y-5">
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0 ${STATUS_CONFIG[project.status].color}`}>
                    {STATUS_CONFIG[project.status].label}
                  </span>
                </div>

                {/* Adviser */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{project.adviser}</p>
                    <a href={`mailto:${project.adviserEmail}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {project.adviserEmail}
                    </a>
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">Milestones</p>
                    <span className="text-sm text-gray-500">{completedMilestones}/{totalMilestones} completed</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(completedMilestones / totalMilestones) * 100}%` }}
                    />
                  </div>

                  <div className="space-y-2">
                    {project.milestones.map((m, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {m.done
                          ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
                        <span className={`text-sm ${m.done ? 'text-gray-700 line-through' : 'text-gray-900 font-medium'}`}>
                          {m.label}
                        </span>
                        {!m.done && i === project.milestones.findIndex(x => !x.done) && (
                          <span className="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">No active research project</p>
                <p className="text-sm text-yellow-700 mt-1">
                  You don't have an active thesis or capstone project yet. Browse available opportunities below.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Available Opportunities */}
        {opportunities.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Beaker className="w-5 h-5 text-primary" />
              Available Research Opportunities
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {opportunities.map(opp => (
                <div key={opp.id} onClick={() => setSelectedOpp(opp)} className="cursor-pointer">
                  <Card className="hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-gray-900">{opp.title}</h3>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {applicationStatuses[opp.id] ? (
                          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Applied</span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Open</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{opp.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{opp.faculty}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{opp.timeCommitment}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1">
                        {opp.requiredSkills.slice(0, 3).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{s}</span>
                        ))}
                        {opp.requiredSkills.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{opp.requiredSkills.length - 3}</span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>                  </div>
                </Card>
                </div>
              ))}            </div>
          </div>
        )}

        {/* Opportunity Detail Modal */}
        {selectedOpp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOpp(null)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedOpp.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedOpp.area}</p>
                  </div>
                  <button onClick={() => setSelectedOpp(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <p className="text-sm text-gray-700">{selectedOpp.description}</p>

                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpp.requiredSkills.map(s => (
                      <span key={s} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Faculty Adviser</p>
                    <p className="font-medium text-gray-900">{selectedOpp.faculty}</p>
                    <a href={`mailto:${selectedOpp.facultyEmail}`} className="text-primary text-xs hover:underline">{selectedOpp.facultyEmail}</a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Time Commitment</p>
                    <p className="font-medium text-gray-900">{selectedOpp.timeCommitment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Application Deadline</p>
                    <p className="font-medium text-gray-900">{new Date(selectedOpp.deadline).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Slots Available</p>
                    <p className="font-medium text-gray-900">{selectedOpp.capacity - selectedOpp.applicants} of {selectedOpp.capacity}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-gray-200">
                  <button onClick={() => setSelectedOpp(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                    Close
                  </button>
                  {!applicationStatuses[selectedOpp.id] && (
                    <button
                      onClick={() => handleApply(selectedOpp)}
                      disabled={applying === selectedOpp.id}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-60"
                    >
                      {applying === selectedOpp.id ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                  {applicationStatuses[selectedOpp.id] && (
                    <span className="flex-1 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium text-center border border-purple-200">
                      Application Submitted
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
