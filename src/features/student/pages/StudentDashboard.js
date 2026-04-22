import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/PageStates';
import { BarChart3, BookOpen, Clock, AlertCircle, ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import studentService from '@/services/api/studentService';
import courseService from '@/services/api/courseService';
export function StudentDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        profile: null,
        courses: [],
        notifications: [],
        loading: true,
        error: null,
    });
    const fetchDashboardData = async () => {
        try {
            setData((prev) => ({ ...prev, loading: true, error: null }));
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 5000));
            const [profile, courses] = await Promise.race([
                Promise.all([
                    studentService.getProfile(),
                    courseService.getEnrolledCourses(),
                ]),
                timeoutPromise,
            ]);
            setData((prev) => ({
                ...prev,
                profile,
                courses,
                loading: false,
            }));
        }
        catch (error) {
            console.error('Error fetching dashboard data:', error);
            setData((prev) => ({
                ...prev,
                loading: false,
                error: 'Failed to load dashboard data',
            }));
        }
    };
    useEffect(() => {
        fetchDashboardData();
    }, []);
    const { profile, courses, loading, error } = data;
    // Mock upcoming deadlines - in production, this would come from an API
    const upcomingDeadlines = [
        {
            id: '1',
            title: 'CS 301 - Project Submission',
            dueDate: 'Tomorrow at 11:59 PM',
            course: 'CS 301',
        },
        {
            id: '2',
            title: 'MATH 201 - Midterm Exam',
            dueDate: 'March 15, 2026',
            course: 'MATH 201',
        },
        {
            id: '3',
            title: 'ENG 101 - Essay Assignment',
            dueDate: 'March 20, 2026',
            course: 'ENG 101',
        },
    ];
    // Mock announcements - in production, this would come from an API
    const announcements = [
        {
            id: '1',
            title: 'Spring Break Schedule',
            message: 'Classes resume on April 1st',
            type: 'primary',
        },
        {
            id: '2',
            title: 'Research Opportunities Available',
            message: 'New research projects posted in the Research section',
            type: 'info',
        },
    ];
    if (loading) {
        return (_jsx(StudentLayout, { title: "Dashboard", children: _jsx("div", { className: "flex items-center justify-center h-96", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader, { className: "w-12 h-12 text-primary animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading your dashboard..." })] }) }) }));
    }
    if (error) {
        return (_jsx(StudentLayout, { title: "Dashboard", children: _jsx(ErrorState, { message: error, onRetry: fetchDashboardData }) }));
    }
    return (_jsx(StudentLayout, { title: "Dashboard", children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "welcome-banner animate-fade-in bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg p-6 sm:p-8", children: _jsxs("div", { className: "relative z-10", children: [_jsxs("h1", { className: "text-2xl sm:text-3xl font-bold text-white mb-2", children: ["Welcome back, ", profile?.firstName, "!"] }), _jsxs("p", { className: "text-white/90", children: ["Here's your academic overview for ", profile?.program] })] }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Card, { hover: true, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Current GPA" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: profile?.gpa.toFixed(2) || '0.00' }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Cumulative: ", profile?.cumulativeGpa.toFixed(2) || '0.00'] })] }), _jsx(BarChart3, { className: "w-8 h-8 text-primary" })] }) }), _jsx(Card, { hover: true, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Enrolled Courses" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: courses.length }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "This semester" })] }), _jsx(BookOpen, { className: "w-8 h-8 text-primary" })] }) }), _jsx(Card, { hover: true, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Upcoming Deadlines" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: upcomingDeadlines.length }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Next 30 days" })] }), _jsx(Clock, { className: "w-8 h-8 text-primary" })] }) }), _jsx(Card, { hover: true, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Credits Completed" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: profile?.yearLevel ? profile.yearLevel * 30 : 0 }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Year ", profile?.yearLevel] })] }), _jsx(AlertCircle, { className: "w-8 h-8 text-primary" })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Upcoming Deadlines" }), _jsxs("button", { onClick: () => navigate('/student/courses'), className: "text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1", children: ["View All ", _jsx(ArrowRight, { className: "w-4 h-4" })] })] }), _jsx("div", { className: "space-y-3", children: upcomingDeadlines.map((deadline) => (_jsx("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-primary/30 transition-colors", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900", children: deadline.title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: deadline.dueDate })] }), _jsx("span", { className: "inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full", children: deadline.course })] }) }, deadline.id))) })] }) }), _jsx("div", { children: _jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Quick Actions" }), _jsxs("div", { className: "space-y-3", children: [_jsx("button", { onClick: () => navigate('/student/courses'), className: "w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-sm", children: "View Courses" }), _jsx("button", { onClick: () => navigate('/student/grades'), className: "w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-sm", children: "Check Grades" }), _jsx("button", { onClick: () => navigate('/student/research'), className: "w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm", children: "Research" }), _jsx("button", { onClick: () => navigate('/student/advisor'), className: "w-full px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors text-sm", children: "Contact Advisor" })] })] }) })] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Recent Announcements" }), _jsxs("button", { onClick: () => navigate('/student/notifications'), className: "text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1", children: ["View All ", _jsx(ArrowRight, { className: "w-4 h-4" })] })] }), _jsx("div", { className: "space-y-3", children: announcements.map((announcement) => (_jsxs("div", { className: `p-4 rounded-lg border-l-4 ${announcement.type === 'primary'
                                    ? 'border-l-primary bg-primary/5'
                                    : 'border-l-blue-500 bg-blue-50'}`, children: [_jsx("p", { className: "font-medium text-gray-900", children: announcement.title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: announcement.message })] }, announcement.id))) })] })] }) }));
}
