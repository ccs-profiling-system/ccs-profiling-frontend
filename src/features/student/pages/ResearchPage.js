import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { Beaker, CheckCircle2, Circle, Clock, Users, Calendar, Mail, AlertCircle, ChevronRight, BookOpen, } from 'lucide-react';
import { researchService } from '@/services/api/researchService';
// Mock active project — replace with API when available
const MOCK_PROJECT = {
    id: 'proj-1',
    title: 'Machine Learning-Based Anomaly Detection in Network Traffic',
    description: 'This capstone project develops a real-time anomaly detection system using supervised and unsupervised machine learning techniques applied to network traffic data to identify potential cybersecurity threats.',
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
const STATUS_CONFIG = {
    proposal: { label: 'Proposal Stage', color: 'bg-yellow-100 text-yellow-800' },
    ongoing: { label: 'Ongoing', color: 'bg-blue-100 text-blue-800' },
    for_defence: { label: 'For Defence', color: 'bg-purple-100 text-purple-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
};
export function ResearchPage() {
    const [project] = useState(MOCK_PROJECT);
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOpp, setSelectedOpp] = useState(null);
    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await researchService.getOpportunities();
            setOpportunities(data.filter(o => o.status === 'open'));
        }
        catch {
            setError('Failed to load research data. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    if (loading)
        return _jsx(StudentLayout, { title: "Research", children: _jsx(LoadingState, { text: "Loading research data..." }) });
    if (error)
        return _jsx(StudentLayout, { title: "Research", children: _jsx(ErrorState, { message: error, onRetry: load }) });
    const completedMilestones = project?.milestones.filter(m => m.done).length ?? 0;
    const totalMilestones = project?.milestones.length ?? 0;
    return (_jsx(StudentLayout, { title: "Research", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Beaker, { className: "w-7 h-7 text-primary" }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Research Involvement" })] }), project ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-700 flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-5 h-5 text-primary" }), "My Thesis / Capstone Project"] }), _jsx(Card, { children: _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900", children: project.title }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: project.description })] }), _jsx("span", { className: `px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0 ${STATUS_CONFIG[project.status].color}`, children: STATUS_CONFIG[project.status].label })] }), _jsxs("div", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-lg", children: [_jsx(Users, { className: "w-5 h-5 text-gray-500 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: project.adviser }), _jsxs("a", { href: `mailto:${project.adviserEmail}`, className: "text-sm text-primary hover:underline flex items-center gap-1", children: [_jsx(Mail, { className: "w-3.5 h-3.5" }), project.adviserEmail] })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("p", { className: "text-sm font-semibold text-gray-700", children: "Milestones" }), _jsxs("span", { className: "text-sm text-gray-500", children: [completedMilestones, "/", totalMilestones, " completed"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 mb-4", children: _jsx("div", { className: "bg-primary h-2 rounded-full transition-all", style: { width: `${(completedMilestones / totalMilestones) * 100}%` } }) }), _jsx("div", { className: "space-y-2", children: project.milestones.map((m, i) => (_jsxs("div", { className: "flex items-center gap-3", children: [m.done
                                                            ? _jsx(CheckCircle2, { className: "w-5 h-5 text-green-500 flex-shrink-0" })
                                                            : _jsx(Circle, { className: "w-5 h-5 text-gray-300 flex-shrink-0" }), _jsx("span", { className: `text-sm ${m.done ? 'text-gray-700 line-through' : 'text-gray-900 font-medium'}`, children: m.label }), !m.done && i === project.milestones.findIndex(x => !x.done) && (_jsx("span", { className: "ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full", children: "Current" }))] }, i))) })] })] }) })] })) : (_jsx(Card, { className: "bg-yellow-50 border-yellow-200", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-yellow-900", children: "No active research project" }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "You don't have an active thesis or capstone project yet. Browse available opportunities below." })] })] }) })), opportunities.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-700 flex items-center gap-2", children: [_jsx(Beaker, { className: "w-5 h-5 text-primary" }), "Available Research Opportunities"] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [opportunities.map(opp => (_jsx("div", { onClick: () => setSelectedOpp(opp), className: "cursor-pointer", children: _jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: opp.title }), _jsx("span", { className: "px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex-shrink-0", children: "Open" })] }), _jsx("p", { className: "text-sm text-gray-600 line-clamp-2", children: opp.description }), _jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Users, { className: "w-3.5 h-3.5" }), opp.faculty] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3.5 h-3.5" }), opp.timeCommitment] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3.5 h-3.5" }), "Deadline: ", new Date(opp.deadline).toLocaleDateString()] })] }), _jsxs("div", { className: "flex items-center justify-between pt-1", children: [_jsxs("div", { className: "flex flex-wrap gap-1", children: [opp.requiredSkills.slice(0, 3).map(s => (_jsx("span", { className: "px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full", children: s }, s))), opp.requiredSkills.length > 3 && (_jsxs("span", { className: "px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full", children: ["+", opp.requiredSkills.length - 3] }))] }), _jsx(ChevronRight, { className: "w-4 h-4 text-gray-400" })] })] }) }) }, opp.id))), "            "] })] })), selectedOpp && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", onClick: () => setSelectedOpp(null), children: _jsx("div", { className: "bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: "p-6 space-y-5", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: selectedOpp.title }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: selectedOpp.area })] }), _jsx("button", { onClick: () => setSelectedOpp(null), className: "p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600", children: "\u2715" })] }), _jsx("p", { className: "text-sm text-gray-700", children: selectedOpp.description }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-700 mb-2", children: "Required Skills" }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedOpp.requiredSkills.map(s => (_jsx("span", { className: "px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full", children: s }, s))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Faculty Adviser" }), _jsx("p", { className: "font-medium text-gray-900", children: selectedOpp.faculty }), _jsx("a", { href: `mailto:${selectedOpp.facultyEmail}`, className: "text-primary text-xs hover:underline", children: selectedOpp.facultyEmail })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Time Commitment" }), _jsx("p", { className: "font-medium text-gray-900", children: selectedOpp.timeCommitment })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Application Deadline" }), _jsx("p", { className: "font-medium text-gray-900", children: new Date(selectedOpp.deadline).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Slots Available" }), _jsxs("p", { className: "font-medium text-gray-900", children: [selectedOpp.capacity - selectedOpp.applicants, " of ", selectedOpp.capacity] })] })] }), _jsx("div", { className: "flex gap-3 pt-2 border-t border-gray-200", children: _jsx("button", { onClick: () => setSelectedOpp(null), className: "flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition", children: "Close" }) })] }) }) }))] }) }));
}
