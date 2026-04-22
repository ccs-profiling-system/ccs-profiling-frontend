import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Spinner, ErrorAlert } from '@/components/ui';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
export function MaterialsPage() {
    const { faculty, loading: authLoading } = useFacultyAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [materials, setMaterials] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    // Fetch courses once faculty is loaded
    useEffect(() => {
        if (!faculty)
            return;
        const fetchCourses = async () => {
            try {
                setLoadingCourses(true);
                setFetchError(null);
                const data = await facultyPortalService.getCourses(faculty.id);
                setCourses(data);
            }
            catch (err) {
                setFetchError(err instanceof Error ? err.message : 'Failed to load courses');
            }
            finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [faculty]);
    // Fetch materials when course selection changes
    useEffect(() => {
        if (!selectedCourseId) {
            setMaterials([]);
            return;
        }
        const fetchMaterials = async () => {
            try {
                setLoadingMaterials(true);
                setFetchError(null);
                const data = await facultyPortalService.getMaterials(selectedCourseId);
                setMaterials(data);
            }
            catch (err) {
                setFetchError(err instanceof Error ? err.message : 'Failed to load materials');
            }
            finally {
                setLoadingMaterials(false);
            }
        };
        fetchMaterials();
    }, [selectedCourseId]);
    const handleCourseChange = (e) => {
        setSelectedCourseId(e.target.value);
        setUploadError(null);
    };
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedCourseId)
            return;
        // Reset file input so the same file can be re-selected if needed
        e.target.value = '';
        setUploading(true);
        setUploadError(null);
        try {
            const newMaterial = await facultyPortalService.uploadMaterial(selectedCourseId, file);
            // Prepend to list on success
            setMaterials((prev) => [newMaterial, ...prev]);
        }
        catch (err) {
            // Show error, preserve existing list
            setUploadError(err instanceof Error ? err.message : 'Failed to upload file');
        }
        finally {
            setUploading(false);
        }
    };
    const handleDelete = async (materialId) => {
        if (!selectedCourseId)
            return;
        if (!window.confirm('Are you sure you want to delete this material?'))
            return;
        try {
            await facultyPortalService.deleteMaterial(selectedCourseId, materialId);
            setMaterials((prev) => prev.filter((m) => m.id !== materialId));
        }
        catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Failed to delete material');
        }
    };
    const formatDate = (isoDate) => {
        try {
            return new Date(isoDate).toLocaleDateString();
        }
        catch {
            return isoDate;
        }
    };
    if (authLoading || loadingCourses) {
        return (_jsx(FacultyLayout, { title: "Materials", children: _jsx("div", { className: "flex items-center justify-center h-96", children: _jsx(Spinner, { size: "lg", text: "Loading..." }) }) }));
    }
    return (_jsx(FacultyLayout, { title: "Materials", children: _jsxs("div", { className: "space-y-6", children: [fetchError && _jsx(ErrorAlert, { title: "Error", message: fetchError }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4", children: [_jsxs("div", { className: "flex-1 max-w-sm", children: [_jsx("label", { htmlFor: "materials-course-select", className: "block text-sm font-medium text-gray-700 mb-1", children: "Select Course" }), _jsxs("select", { id: "materials-course-select", "data-testid": "materials-course-select", value: selectedCourseId, onChange: handleCourseChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "-- Select a course --" }), courses.map((course) => (_jsxs("option", { value: course.subjectId, children: [course.subjectCode, " \u2014 ", course.subjectName, " (", course.section, ")"] }, course.subjectId)))] })] }), selectedCourseId && (_jsxs("div", { className: "sm:mt-5", children: [_jsx("button", { type: "button", "data-testid": "materials-upload-btn", onClick: handleUploadClick, disabled: uploading, className: "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary", children: uploading ? 'Uploading…' : 'Upload File' }), _jsx("input", { ref: fileInputRef, type: "file", className: "hidden", onChange: handleFileChange, "aria-hidden": "true" })] }))] }), uploadError && _jsx(ErrorAlert, { title: "Upload failed", message: uploadError }), selectedCourseId && (_jsx(_Fragment, { children: loadingMaterials ? (_jsx("div", { className: "flex items-center justify-center h-40", children: _jsx(Spinner, { size: "md", text: "Loading materials..." }) })) : materials.length === 0 ? (_jsx("div", { className: "rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center", children: _jsx("p", { className: "text-sm text-gray-500", children: "No materials uploaded for this course yet." }) })) : (_jsx("div", { className: "overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200 text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-600", children: "File Name" }), _jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-600", children: "File Type" }), _jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-600", children: "Upload Date" }), _jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-600", children: "Download" }), _jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-600", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: materials.map((material) => (_jsxs("tr", { "data-testid": `material-row-${material.id}`, className: "hover:bg-gray-50", children: [_jsx("td", { "data-testid": `material-filename-${material.id}`, className: "px-4 py-3 text-gray-900", children: material.fileName }), _jsx("td", { "data-testid": `material-filetype-${material.id}`, className: "px-4 py-3 text-gray-600", children: material.fileType }), _jsx("td", { "data-testid": `material-uploaddate-${material.id}`, className: "px-4 py-3 text-gray-600", children: formatDate(material.uploadDate) }), _jsx("td", { className: "px-4 py-3", children: _jsx("a", { "data-testid": `material-download-${material.id}`, href: material.downloadUrl, target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:text-orange-800 hover:underline", children: "Download" }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("button", { type: "button", "data-testid": `material-delete-${material.id}`, onClick: () => handleDelete(material.id), className: "text-red-600 hover:text-red-800 text-sm font-medium", children: "Delete" }) })] }, material.id))) })] }) })) })), !selectedCourseId && !loadingCourses && (_jsx("div", { className: "rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center", children: _jsx("p", { className: "text-sm text-gray-500", children: "Select a course to view its materials." }) }))] }) }));
}
