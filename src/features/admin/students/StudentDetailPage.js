import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft } from 'lucide-react';
import studentsService from '@/services/api/studentsService';
export function StudentDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!id)
            return;
        fetchStudent();
    }, [id]);
    const fetchStudent = async () => {
        if (!id)
            return;
        setLoading(true);
        setError(null);
        try {
            const data = await studentsService.getStudentById(id);
            setStudent(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load student');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx(MainLayout, { title: "Student Details", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg", text: "Loading student\u2026" }) }) }));
    }
    if (error || !student) {
        return (_jsx(MainLayout, { title: "Student Details", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("button", { onClick: () => navigate('/admin/students'), className: "flex items-center gap-2 text-primary hover:text-primary-dark", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Students"] }), _jsx(ErrorAlert, { message: error || 'Student not found', onRetry: fetchStudent })] }) }));
    }
    return (_jsx(MainLayout, { title: `${student.firstName} ${student.lastName}`, children: _jsxs("div", { className: "space-y-6", children: [_jsxs("button", { onClick: () => navigate('/admin/students'), className: "flex items-center gap-2 text-primary hover:text-primary-dark font-medium", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Students"] }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900", children: [student.firstName, " ", student.lastName] }), _jsx("p", { className: "text-gray-600 mt-1", children: student.email })] }), _jsx(Badge, { variant: student.status === 'active' ? 'success'
                                    : student.status === 'graduated' ? 'info'
                                        : student.status === 'dropped' ? 'warning'
                                            : 'gray', size: "lg", children: student.status })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Basic Information" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Student ID" }), _jsx("p", { className: "font-mono text-gray-900", children: student.studentId })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Program" }), _jsx("p", { className: "text-gray-900", children: student.program || '—' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Year Level" }), _jsx("p", { className: "text-gray-900", children: student.yearLevel ? `Year ${student.yearLevel}` : '—' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Section" }), _jsx("p", { className: "text-gray-900", children: student.section || '—' })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Enrollment" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Enrollment Date" }), _jsx("p", { className: "text-gray-900", children: student.enrollmentDate
                                                        ? new Date(student.enrollmentDate).toLocaleDateString()
                                                        : '—' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Created" }), _jsx("p", { className: "text-gray-900", children: student.createdAt
                                                        ? new Date(student.createdAt).toLocaleDateString()
                                                        : '—' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Last Updated" }), _jsx("p", { className: "text-gray-900", children: student.updatedAt
                                                        ? new Date(student.updatedAt).toLocaleDateString()
                                                        : '—' })] })] })] })] })] }) }));
}
