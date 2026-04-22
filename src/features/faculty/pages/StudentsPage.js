import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, SearchBar, SlidePanel, Spinner, ErrorAlert } from '@/components/ui';
import { Users, ClipboardList } from 'lucide-react';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
export function StudentsPage() {
    const { faculty, loading: authLoading } = useFacultyAuth();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('roster');
    const [courses, setCourses] = useState([]);
    const [roster, setRoster] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [rosterLoading, setRosterLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    // Participation state
    const [participationDate, setParticipationDate] = useState('');
    const [participationRecords, setParticipationRecords] = useState({});
    const [participationLoading, setParticipationLoading] = useState(false);
    const [participationSubmitting, setParticipationSubmitting] = useState(false);
    const [participationSuccess, setParticipationSuccess] = useState(null);
    const [participationError, setParticipationError] = useState(null);
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
                const courseParam = searchParams.get('course');
                if (courseParam && fetchedCourses.some((c) => c.subjectId === courseParam)) {
                    setSelectedCourseId(courseParam);
                }
                else if (fetchedCourses.length > 0) {
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
    }, [faculty, searchParams]);
    // Load roster when course changes
    useEffect(() => {
        if (!faculty || !selectedCourseId) {
            setRoster([]);
            return;
        }
        const fetchRoster = async () => {
            try {
                setRosterLoading(true);
                const fetchedRoster = await facultyPortalService.getRoster(faculty.id, selectedCourseId);
                setRoster(fetchedRoster);
                // Init participation map with defaults
                const map = {};
                fetchedRoster.forEach((s) => { map[s.studentId] = { score: 3, remarks: '' }; });
                setParticipationRecords(map);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load roster');
                setRoster([]);
            }
            finally {
                setRosterLoading(false);
            }
        };
        fetchRoster();
    }, [faculty, selectedCourseId]);
    // Load existing participation when course + date selected
    useEffect(() => {
        if (!selectedCourseId || !participationDate)
            return;
        const fetchParticipation = async () => {
            try {
                setParticipationLoading(true);
                const records = await facultyPortalService.getParticipation(selectedCourseId, participationDate);
                if (records.length > 0) {
                    const map = {};
                    roster.forEach((s) => { map[s.studentId] = { score: 3, remarks: '' }; });
                    records.forEach((r) => { map[r.studentId] = { score: r.participationScore, remarks: r.remarks }; });
                    setParticipationRecords(map);
                }
            }
            catch {
                // silently fall back to defaults
            }
            finally {
                setParticipationLoading(false);
            }
        };
        fetchParticipation();
    }, [selectedCourseId, participationDate]);
    const handleParticipationChange = (studentId, field, value) => {
        setParticipationRecords((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: field === 'score' ? Number(value) : value },
        }));
    };
    const handleSubmitParticipation = async () => {
        if (!selectedCourseId || !participationDate || roster.length === 0)
            return;
        setParticipationSubmitting(true);
        setParticipationSuccess(null);
        setParticipationError(null);
        const payload = {
            date: participationDate,
            records: roster.map((s) => ({
                studentId: s.studentId,
                participationScore: participationRecords[s.studentId]?.score ?? 3,
                remarks: participationRecords[s.studentId]?.remarks ?? '',
            })),
        };
        try {
            await facultyPortalService.submitParticipation(selectedCourseId, payload);
            setParticipationSuccess('Participation records saved successfully.');
        }
        catch (err) {
            setParticipationError(err instanceof Error ? err.message : 'Failed to save participation');
        }
        finally {
            setParticipationSubmitting(false);
        }
    };
    const filteredStudents = roster.filter((student) => {
        const fullName = (student.firstName + ' ' + student.lastName).toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || student.studentId.toLowerCase().includes(query);
    });
    if (authLoading || loading) {
        return (_jsx(FacultyLayout, { title: "Students", children: _jsx("div", { className: "flex items-center justify-center h-96", children: _jsx(Spinner, { size: "lg", text: "Loading..." }) }) }));
    }
    if (error) {
        return (_jsx(FacultyLayout, { title: "Students", children: _jsx(ErrorAlert, { title: "Failed to load data", message: error }) }));
    }
    return (_jsxs(FacultyLayout, { title: "Students", children: [_jsxs("div", { className: "space-y-6", children: [_jsx(Card, { children: _jsx("div", { className: "flex flex-col sm:flex-row gap-4", children: _jsxs("div", { className: "flex-1", children: [_jsx("label", { htmlFor: "course-select", className: "block text-sm font-medium text-gray-700 mb-1", children: "Course" }), _jsxs("select", { id: "course-select", value: selectedCourseId, onChange: (e) => setSelectedCourseId(e.target.value), className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary", children: [courses.length === 0 && _jsx("option", { value: "", children: "No courses available" }), courses.map((course) => (_jsxs("option", { value: course.subjectId, children: [course.subjectCode, " \u2014 ", course.subjectName, " (", course.section, ")"] }, course.subjectId)))] })] }) }) }), _jsxs("div", { className: "flex gap-2 border-b border-gray-200", children: [_jsxs("button", { onClick: () => setActiveTab('roster'), className: `flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'roster' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: [_jsx(Users, { className: "w-4 h-4" }), " Roster"] }), _jsxs("button", { onClick: () => setActiveTab('participation'), className: `flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'participation' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: [_jsx(ClipboardList, { className: "w-4 h-4" }), " Participation"] })] }), activeTab === 'roster' && (_jsxs(Card, { children: [_jsx("div", { className: "mb-4", children: _jsx(SearchBar, { placeholder: "Search by name or ID...", value: searchQuery, onChange: setSearchQuery }) }), rosterLoading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Spinner, { size: "md", text: "Loading roster..." }) })) : !selectedCourseId || filteredStudents.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [_jsx(Users, { className: "w-12 h-12 text-gray-300 mb-4" }), _jsx("p", { className: "text-gray-500 font-medium", children: !selectedCourseId ? 'Select a course to view the roster' : searchQuery ? 'No students match your search' : 'No students enrolled in this course' })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200 text-left", children: [_jsx("th", { className: "pb-3 pr-4 font-semibold text-gray-600", children: "Student ID" }), _jsx("th", { className: "pb-3 pr-4 font-semibold text-gray-600", children: "Name" }), _jsx("th", { className: "pb-3 pr-4 font-semibold text-gray-600", children: "Program" }), _jsx("th", { className: "pb-3 pr-4 font-semibold text-gray-600", children: "Year" }), _jsx("th", { className: "pb-3 font-semibold text-gray-600", children: "Section" })] }) }), _jsx("tbody", { children: filteredStudents.map((student) => (_jsxs("tr", { "data-testid": `student-row-${student.id}`, onClick: () => setSelectedStudent(student), className: "border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors", children: [_jsx("td", { className: "py-3 pr-4 text-gray-700", "data-testid": `student-id-${student.id}`, children: student.studentId }), _jsxs("td", { className: "py-3 pr-4 font-medium text-gray-900", "data-testid": `student-name-${student.id}`, children: [student.firstName, " ", student.lastName] }), _jsx("td", { className: "py-3 pr-4 text-gray-600", "data-testid": `student-program-${student.id}`, children: student.program }), _jsx("td", { className: "py-3 pr-4 text-gray-600", "data-testid": `student-year-${student.id}`, children: student.yearLevel }), _jsx("td", { className: "py-3 text-gray-600", "data-testid": `student-section-${student.id}`, children: student.section })] }, student.id))) })] }) }))] })), activeTab === 'participation' && (_jsxs(Card, { children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "participation-date", className: "block text-sm font-medium text-gray-700 mb-1", children: "Date" }), _jsx("input", { id: "participation-date", type: "date", value: participationDate, onChange: (e) => setParticipationDate(e.target.value), className: "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })] }), participationSuccess && _jsx("div", { role: "alert", className: "mb-4 rounded-md bg-orange-50 border border-orange-200 px-4 py-3 text-orange-800 text-sm", children: participationSuccess }), participationError && _jsx("div", { className: "mb-4", children: _jsx(ErrorAlert, { title: "Error", message: participationError }) }), !selectedCourseId || !participationDate ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [_jsx(ClipboardList, { className: "w-12 h-12 text-gray-300 mb-4" }), _jsx("p", { className: "text-gray-500 font-medium", children: "Select a course and date to record participation" })] })) : rosterLoading || participationLoading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Spinner, { size: "md", text: "Loading..." }) })) : roster.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [_jsx(ClipboardList, { className: "w-12 h-12 text-gray-300 mb-4" }), _jsx("p", { className: "text-gray-500 font-medium", children: "No students enrolled in this course" })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200 text-left", children: [_jsx("th", { className: "pb-3 pr-4 font-semibold text-gray-600", children: "Student ID" }), _jsx("th", { className: "pb-3 pr-4 font-semibold text-gray-600", children: "Name" }), _jsx("th", { className: "pb-3 pr-4 font-semibold text-gray-600", children: "Score (1\u20135)" }), _jsx("th", { className: "pb-3 font-semibold text-gray-600", children: "Remarks" })] }) }), _jsx("tbody", { children: roster.map((student) => (_jsxs("tr", { className: "border-b border-gray-100", children: [_jsx("td", { className: "py-3 pr-4 text-gray-700", children: student.studentId }), _jsxs("td", { className: "py-3 pr-4 font-medium text-gray-900", children: [student.firstName, " ", student.lastName] }), _jsx("td", { className: "py-3 pr-4", children: _jsx("select", { value: participationRecords[student.studentId]?.score ?? 3, onChange: (e) => handleParticipationChange(student.studentId, 'score', e.target.value), className: "border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary", children: [1, 2, 3, 4, 5].map((n) => _jsx("option", { value: n, children: n }, n)) }) }), _jsx("td", { className: "py-3", children: _jsx("input", { type: "text", value: participationRecords[student.studentId]?.remarks ?? '', onChange: (e) => handleParticipationChange(student.studentId, 'remarks', e.target.value), placeholder: "Optional remarks", className: "w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary" }) })] }, student.id))) })] }) }), _jsx("div", { className: "flex justify-end pt-2", children: _jsx("button", { onClick: handleSubmitParticipation, disabled: participationSubmitting, className: "bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors", children: participationSubmitting ? 'Saving…' : 'Save Participation' }) })] }))] }))] }), _jsx(SlidePanel, { isOpen: selectedStudent !== null, onClose: () => setSelectedStudent(null), title: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : '', children: selectedStudent && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Student ID" }), _jsx("p", { className: "font-semibold text-gray-900 mt-1", children: selectedStudent.studentId })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Full Name" }), _jsxs("p", { className: "font-semibold text-gray-900 mt-1", children: [selectedStudent.firstName, " ", selectedStudent.lastName] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Program" }), _jsx("p", { className: "font-semibold text-gray-900 mt-1", children: selectedStudent.program })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Year Level" }), _jsx("p", { className: "font-semibold text-gray-900 mt-1", children: selectedStudent.yearLevel })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Section" }), _jsx("p", { className: "font-semibold text-gray-900 mt-1", children: selectedStudent.section })] })] }) })) })] }));
}
