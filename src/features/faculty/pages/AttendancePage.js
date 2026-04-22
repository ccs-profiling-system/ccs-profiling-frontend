import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, Spinner, ErrorAlert } from '@/components/ui';
import { ClipboardList } from 'lucide-react';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
export function AttendancePage() {
    const { faculty, loading: authLoading } = useFacultyAuth();
    const [courses, setCourses] = useState([]);
    const [roster, setRoster] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [attendanceMap, setAttendanceMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [rosterLoading, setRosterLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    // Load courses on mount
    useEffect(() => {
        if (!faculty)
            return;
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedCourses = await facultyPortalService.getCourses(faculty.id);
                setCourses(fetchedCourses);
                if (fetchedCourses.length > 0) {
                    setSelectedCourseId(fetchedCourses[0].subjectId);
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load courses');
            }
            finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [faculty]);
    // Load roster + existing attendance when course+date are both selected
    useEffect(() => {
        if (!faculty || !selectedCourseId || !selectedDate) {
            setRoster([]);
            setAttendanceMap({});
            return;
        }
        const fetchRosterAndAttendance = async () => {
            try {
                setRosterLoading(true);
                setError(null);
                const [fetchedRoster, existingRecords] = await Promise.all([
                    facultyPortalService.getRoster(faculty.id, selectedCourseId),
                    facultyPortalService.getAttendance(selectedCourseId, selectedDate),
                ]);
                setRoster(fetchedRoster);
                // Build initial attendance map: default to 'present', override with existing records
                const initialMap = {};
                for (const student of fetchedRoster) {
                    initialMap[student.id] = 'present';
                }
                for (const record of existingRecords) {
                    // existingRecords use studentId (the display ID), match by student.studentId
                    const student = fetchedRoster.find((s) => s.studentId === record.studentId);
                    if (student) {
                        initialMap[student.id] = record.status;
                    }
                }
                setAttendanceMap(initialMap);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load roster');
                setRoster([]);
            }
            finally {
                setRosterLoading(false);
            }
        };
        fetchRosterAndAttendance();
    }, [faculty, selectedCourseId, selectedDate]);
    const handleStatusChange = (studentId, status) => {
        setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
    };
    const handleSubmit = async () => {
        if (!selectedCourseId || !selectedDate || roster.length === 0)
            return;
        try {
            setSubmitting(true);
            setError(null);
            setSuccessMessage(null);
            const records = roster.map((student) => ({
                studentId: student.studentId,
                status: attendanceMap[student.id] ?? 'present',
            }));
            await facultyPortalService.submitAttendance({
                courseId: selectedCourseId,
                date: selectedDate,
                records,
            });
            setSuccessMessage('Attendance submitted successfully.');
        }
        catch (err) {
            // On failure: set error but DO NOT reset attendanceMap
            setError(err instanceof Error ? err.message : 'Failed to submit attendance');
        }
        finally {
            setSubmitting(false);
        }
    };
    if (authLoading || loading) {
        return (_jsx(FacultyLayout, { title: "Attendance", children: _jsx("div", { className: "flex items-center justify-center h-96", children: _jsx(Spinner, { size: "lg", text: "Loading..." }) }) }));
    }
    return (_jsx(FacultyLayout, { title: "Attendance", children: _jsxs("div", { className: "space-y-6", children: [_jsx(Card, { children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { htmlFor: "attendance-course-select", className: "block text-sm font-medium text-gray-700 mb-1", children: "Course" }), _jsxs("select", { id: "attendance-course-select", value: selectedCourseId, onChange: (e) => setSelectedCourseId(e.target.value), className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary", children: [courses.length === 0 && _jsx("option", { value: "", children: "No courses available" }), courses.map((course) => (_jsxs("option", { value: course.subjectId, children: [course.subjectCode, " \u2014 ", course.subjectName, " (", course.section, ")"] }, course.subjectId)))] })] }), _jsxs("div", { className: "flex-1", children: [_jsx("label", { htmlFor: "attendance-date", className: "block text-sm font-medium text-gray-700 mb-1", children: "Date" }), _jsx("input", { id: "attendance-date", type: "date", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })] })] }) }), error && _jsx(ErrorAlert, { title: "Error", message: error }), successMessage && (_jsx("div", { className: "rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 text-orange-800 text-sm", children: successMessage })), _jsx(Card, { children: !selectedCourseId || !selectedDate ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [_jsx(ClipboardList, { className: "w-12 h-12 text-gray-300 mb-4" }), _jsx("p", { className: "text-gray-500 font-medium", children: "Select a course and date to take attendance" })] })) : rosterLoading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Spinner, { size: "md", text: "Loading roster..." }) })) : roster.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [_jsx(ClipboardList, { className: "w-12 h-12 text-gray-300 mb-4" }), _jsx("p", { className: "text-gray-500 font-medium", children: "No students enrolled in this course" })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200 text-left", children: [_jsx("th", { className: "pb-3 pr-4 font-semibold text-gray-600", children: "Student ID" }), _jsx("th", { className: "pb-3 pr-4 font-semibold text-gray-600", children: "Name" }), _jsx("th", { className: "pb-3 font-semibold text-gray-600", children: "Attendance" })] }) }), _jsx("tbody", { children: roster.map((student) => (_jsxs("tr", { "data-testid": `attendance-control-${student.id}`, className: "border-b border-gray-100", children: [_jsx("td", { className: "py-3 pr-4 text-gray-700", children: student.studentId }), _jsxs("td", { className: "py-3 pr-4 font-medium text-gray-900", children: [student.firstName, " ", student.lastName] }), _jsx("td", { className: "py-3", children: _jsxs("select", { "data-testid": `attendance-status-${student.id}`, value: attendanceMap[student.id] ?? 'present', onChange: (e) => handleStatusChange(student.id, e.target.value), className: "border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "present", children: "Present" }), _jsx("option", { value: "absent", children: "Absent" }), _jsx("option", { value: "late", children: "Late" })] }) })] }, student.id))) })] }) }), _jsx("div", { className: "flex justify-end pt-2", children: _jsx("button", { onClick: handleSubmit, disabled: submitting, className: "bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors", children: submitting ? 'Submitting...' : 'Submit Attendance' }) })] })) })] }) }));
}
