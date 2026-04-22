import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { BookOpen, CheckCircle2, Circle, ChevronDown, ChevronUp, GraduationCap, TrendingUp, FileText, } from 'lucide-react';
import { studentService } from '@/services/api/studentService';
import { courseService } from '@/services/api/courseService';
export function AcademicRequirementsPage() {
    const [progress, setProgress] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedReq, setExpandedReq] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const [prog, enrolled] = await Promise.all([
                studentService.getAcademicProgress(),
                courseService.getEnrolledCourses(),
            ]);
            setProgress(prog);
            setCourses(enrolled);
        }
        catch {
            setError('Failed to load academic requirements. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    if (loading)
        return _jsx(StudentLayout, { title: "Academic Requirements", children: _jsx(LoadingState, { text: "Loading requirements..." }) });
    if (error)
        return _jsx(StudentLayout, { title: "Academic Requirements", children: _jsx(ErrorState, { message: error, onRetry: load }) });
    if (!progress)
        return null;
    const categories = Array.from(new Set(progress.requirements.map(r => r.category)));
    const filtered = selectedCategory === 'all'
        ? progress.requirements
        : progress.requirements.filter(r => r.category === selectedCategory);
    const grouped = filtered.reduce((acc, req) => {
        if (!acc[req.category])
            acc[req.category] = [];
        acc[req.category].push(req);
        return acc;
    }, {});
    // Find syllabus for a course code from enrolled courses
    const getSyllabus = (courseCode) => courses.find(c => c.code === courseCode);
    return (_jsx(StudentLayout, { title: "Academic Requirements", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-7 h-7 text-primary" }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Academic Requirements" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "bg-gradient-to-br from-primary/10 to-primary/5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Overall Progress" }), _jsxs("p", { className: "text-3xl font-bold text-primary", children: [progress.completionPercentage, "%"] })] }), _jsx(TrendingUp, { className: "w-10 h-10 text-primary opacity-40" })] }), _jsx("div", { className: "mt-3 w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-primary h-2 rounded-full", style: { width: `${progress.completionPercentage}%` } }) })] }), _jsx(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Units Earned" }), _jsxs("p", { className: "text-3xl font-bold text-blue-700", children: [progress.completedCredits, _jsxs("span", { className: "text-lg text-gray-500", children: ["/", progress.totalRequiredCredits] })] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [progress.remainingCredits, " remaining"] })] }), _jsx(GraduationCap, { className: "w-10 h-10 text-blue-700 opacity-40" })] }) }), _jsx(Card, { className: "bg-gradient-to-br from-green-50 to-green-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Est. Graduation" }), _jsx("p", { className: "text-lg font-bold text-green-700", children: progress.estimatedGraduation }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: progress.program })] }), _jsx(BookOpen, { className: "w-10 h-10 text-green-700 opacity-40" })] }) })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { onClick: () => setSelectedCategory('all'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "All" }), categories.map(cat => (_jsx("button", { onClick: () => setSelectedCategory(cat), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: cat }, cat)))] }), Object.entries(grouped).map(([category, reqs]) => (_jsxs("div", { children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2", children: [category, _jsxs("span", { className: "text-sm font-normal text-gray-500", children: ["(", reqs.filter(r => r.completed).length, "/", reqs.length, " completed)"] })] }), _jsx("div", { className: "space-y-3", children: reqs.map(req => {
                                const isExpanded = expandedReq === req.id;
                                return (_jsxs(Card, { className: `transition-all ${req.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`, children: [_jsxs("button", { className: "w-full flex items-start gap-4 text-left", onClick: () => setExpandedReq(isExpanded ? null : req.id), children: [_jsx("div", { className: "flex-shrink-0 mt-0.5", children: req.completed
                                                        ? _jsx(CheckCircle2, { className: "w-6 h-6 text-green-600" })
                                                        : _jsx(Circle, { className: "w-6 h-6 text-gray-400" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "font-semibold text-gray-900", children: req.title }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [_jsx("span", { className: `px-2.5 py-0.5 rounded-full text-xs font-semibold ${req.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`, children: req.completed ? 'Completed' : 'In Progress' }), isExpanded ? _jsx(ChevronUp, { className: "w-4 h-4 text-gray-400" }) : _jsx(ChevronDown, { className: "w-4 h-4 text-gray-400" })] })] }), _jsxs("p", { className: "text-sm text-gray-500 mt-0.5", children: [req.credits, " units"] })] })] }), isExpanded && (_jsxs("div", { className: "mt-4 pt-4 border-t border-gray-200 space-y-4", children: [req.completedCourses && req.completedCourses.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-700 mb-2", children: "Completed Subjects" }), _jsx("div", { className: "space-y-2", children: req.completedCourses.map(code => {
                                                                const course = getSyllabus(code);
                                                                return (_jsxs("div", { className: "flex items-center justify-between p-2 bg-green-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-green-600 flex-shrink-0" }), _jsx("span", { className: "text-sm font-medium text-gray-800", children: code }), course && _jsxs("span", { className: "text-sm text-gray-600", children: ["\u2014 ", course.title] })] }), course && (_jsxs("span", { className: "text-xs text-gray-500", children: [course.credits, " units"] }))] }, code));
                                                            }) })] })), !req.completed && req.suggestedCourses.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-700 mb-2", children: "Remaining Subjects" }), _jsx("div", { className: "space-y-2", children: req.suggestedCourses.map(code => {
                                                                const course = getSyllabus(code);
                                                                return (_jsxs("div", { className: "flex items-center justify-between p-2 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Circle, { className: "w-4 h-4 text-blue-400 flex-shrink-0" }), _jsx("span", { className: "text-sm font-medium text-gray-800", children: code }), course && _jsxs("span", { className: "text-sm text-gray-600", children: ["\u2014 ", course.title] })] }), course && (_jsxs("a", { href: "#", className: "flex items-center gap-1 text-xs text-primary hover:underline", onClick: e => e.stopPropagation(), children: [_jsx(FileText, { className: "w-3 h-3" }), "Syllabus"] }))] }, code));
                                                            }) })] })), (() => {
                                                    const enrolledInReq = courses.filter(c => [...(req.completedCourses || []), ...req.suggestedCourses].includes(c.code) &&
                                                        c.status === 'enrolled');
                                                    if (enrolledInReq.length === 0)
                                                        return null;
                                                    return (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-700 mb-2", children: "Currently Enrolled" }), enrolledInReq.map(c => (_jsx("div", { className: "p-3 bg-primary/5 border border-primary/20 rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm font-semibold text-primary", children: [c.code, " \u2014 ", c.title] }), _jsxs("p", { className: "text-xs text-gray-600 mt-0.5", children: [c.instructor, " \u00B7 ", c.credits, " units \u00B7 ", c.semester] })] }), _jsx("span", { className: "px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full", children: "Enrolled" })] }) }, c.id)))] }));
                                                })()] }))] }, req.id));
                            }) })] }, category)))] }) }));
}
