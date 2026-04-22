import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { GraduationCap, CheckCircle2, Circle, AlertTriangle, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { studentService } from '@/services/api/studentService';
export function ProgressPage() {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const loadProgress = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await studentService.getAcademicProgress();
            setProgress(data);
        }
        catch (error) {
            console.error('Failed to load academic progress:', error);
            setError('Failed to load academic progress. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadProgress();
    }, []);
    if (loading) {
        return (_jsx(StudentLayout, { title: "Academic Progress", children: _jsx(LoadingState, { text: "Loading academic progress..." }) }));
    }
    if (error) {
        return (_jsx(StudentLayout, { title: "Academic Progress", children: _jsx(ErrorState, { message: error, onRetry: loadProgress }) }));
    }
    if (!progress) {
        return (_jsx(StudentLayout, { title: "Academic Progress", children: _jsx(Card, { children: _jsx("p", { className: "text-gray-600", children: "Unable to load academic progress data." }) }) }));
    }
    // Get unique categories
    const categories = Array.from(new Set(progress.requirements.map((req) => req.category)));
    // Filter requirements by category
    const filteredRequirements = selectedCategory === 'all'
        ? progress.requirements
        : progress.requirements.filter((req) => req.category === selectedCategory);
    // Group requirements by category for display
    const requirementsByCategory = filteredRequirements.reduce((acc, req) => {
        if (!acc[req.category]) {
            acc[req.category] = [];
        }
        acc[req.category].push(req);
        return acc;
    }, {});
    return (_jsx(StudentLayout, { title: "Academic Progress", children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(GraduationCap, { className: "w-7 h-7 text-primary" }), "Degree Progress"] }) }), progress.isAtRisk && (_jsx(Card, { className: "bg-red-50 border-red-200", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertTriangle, { className: "w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-red-900 mb-1", children: "Academic Alert" }), _jsx("p", { className: "text-sm text-red-700 mb-2", children: "You are at risk of not meeting graduation requirements on time." }), progress.atRiskReasons && progress.atRiskReasons.length > 0 && (_jsx("ul", { className: "text-sm text-red-700 list-disc list-inside space-y-1", children: progress.atRiskReasons.map((reason, index) => (_jsx("li", { children: reason }, index))) })), _jsx("p", { className: "text-sm text-red-700 mt-2", children: "Please consult with your academic advisor to create a plan." })] })] }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "bg-gradient-to-br from-primary/10 to-primary/5", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Overall Progress" }), _jsxs("p", { className: "text-3xl font-bold text-primary", children: [progress.completionPercentage, "%"] })] }), _jsx(TrendingUp, { className: "w-10 h-10 text-primary opacity-50" })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-primary h-2 rounded-full transition-all duration-500", style: { width: `${progress.completionPercentage}%` } }) })] }), _jsx(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Credits Earned" }), _jsxs("p", { className: "text-3xl font-bold text-blue-700", children: [progress.completedCredits, _jsxs("span", { className: "text-lg text-gray-600", children: ["/", progress.totalRequiredCredits] })] }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: [progress.remainingCredits, " units remaining"] })] }), _jsx(BookOpen, { className: "w-10 h-10 text-blue-700 opacity-50" })] }) }), _jsx(Card, { className: "bg-gradient-to-br from-green-50 to-green-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Est. Graduation" }), _jsx("p", { className: "text-lg font-bold text-green-700", children: progress.estimatedGraduation })] }), _jsx(Calendar, { className: "w-10 h-10 text-green-700 opacity-50" })] }) })] }), _jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Filter by category:" }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsx("button", { onClick: () => setSelectedCategory('all'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'all'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: "All Categories" }), categories.map((category) => (_jsx("button", { onClick: () => setSelectedCategory(category), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: category }, category)))] })] }), _jsx("div", { className: "space-y-6", children: Object.entries(requirementsByCategory).map(([category, requirements]) => (_jsxs("div", { children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2", children: [category, _jsxs("span", { className: "text-sm font-normal text-gray-600", children: ["(", requirements.filter((r) => r.completed).length, "/", requirements.length, " completed)"] })] }), _jsx("div", { className: "space-y-3", children: requirements.map((requirement) => (_jsx(Card, { className: `transition-all ${requirement.completed
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-white border-gray-200'}`, children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0 mt-1", children: requirement.completed ? (_jsx(CheckCircle2, { className: "w-6 h-6 text-green-600" })) : (_jsx(Circle, { className: "w-6 h-6 text-gray-400" })) }), _jsx("div", { className: "flex-1 min-w-0", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-1", children: requirement.title }), _jsxs("p", { className: "text-sm text-gray-600 mb-2", children: [requirement.credits, " units", requirement.completed && requirement.completedDate && (_jsxs("span", { className: "ml-2 text-green-600", children: ["\u2022 Completed on ", new Date(requirement.completedDate).toLocaleDateString()] }))] }), requirement.completedCourses && requirement.completedCourses.length > 0 && (_jsxs("div", { className: "mb-2", children: [_jsx("p", { className: "text-xs font-medium text-gray-700 mb-1", children: "Completed Courses:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: requirement.completedCourses.map((course) => (_jsx("span", { className: "inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded", children: course }, course))) })] })), !requirement.completed && requirement.suggestedCourses.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-700 mb-1", children: "Suggested Courses:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: requirement.suggestedCourses.map((course) => (_jsx("span", { className: "inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded", children: course }, course))) })] }))] }), _jsx("div", { className: "flex-shrink-0", children: requirement.completed ? (_jsx("span", { className: "inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full", children: "Completed" })) : (_jsx("span", { className: "inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full", children: "In Progress" })) })] }) })] }) }, requirement.id))) })] }, category))) }), _jsx(Card, { className: "bg-gray-50", children: _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-sm text-gray-600 mb-2", children: ["You have completed ", progress.completedCredits, " out of ", progress.totalRequiredCredits, " required units"] }), _jsxs("p", { className: "text-sm text-gray-700 font-medium", children: ["Keep up the great work! You're ", progress.completionPercentage, "% of the way to graduation."] })] }) })] }) }));
}
