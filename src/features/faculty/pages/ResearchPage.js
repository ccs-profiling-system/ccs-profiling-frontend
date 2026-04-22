import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { FlaskConical, Plus } from 'lucide-react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, Spinner, ErrorAlert, Modal } from '@/components/ui';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
const STATUS_COLORS = {
    ongoing: 'bg-orange-100 text-orange-800',
    completed: 'bg-blue-100 text-blue-800',
    proposed: 'bg-yellow-100 text-yellow-800',
};
const BLANK_FORM = {
    title: '',
    description: '',
    status: 'proposed',
    role: 'researcher',
};
export function ResearchPage() {
    const { faculty, loading: authLoading } = useFacultyAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [form, setForm] = useState(BLANK_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState(null);
    useEffect(() => {
        if (!faculty)
            return;
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await facultyPortalService.getResearchProjects(faculty.id);
                setProjects(data);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load research projects');
            }
            finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [faculty]);
    const openCreateModal = () => {
        setEditingProject(null);
        setForm(BLANK_FORM);
        setModalError(null);
        setModalOpen(true);
    };
    const openEditModal = (project) => {
        setEditingProject(project);
        setForm({
            title: project.title,
            description: project.description,
            status: project.status,
            role: project.role ?? 'researcher',
        });
        setModalError(null);
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
        setEditingProject(null);
        setModalError(null);
    };
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!faculty)
            return;
        const payload = {
            title: form.title,
            description: form.description,
            status: form.status,
            role: form.role,
        };
        setSubmitting(true);
        setModalError(null);
        try {
            if (editingProject) {
                // Update mode
                const updated = await facultyPortalService.updateResearchProject(faculty.id, editingProject.id, payload);
                setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updated : p)));
            }
            else {
                // Create mode
                const created = await facultyPortalService.createResearchProject(faculty.id, payload);
                setProjects((prev) => [created, ...prev]);
            }
            closeModal();
        }
        catch (err) {
            // Show error inside modal, preserve entered values
            setModalError(err instanceof Error ? err.message : 'Failed to save research project');
        }
        finally {
            setSubmitting(false);
        }
    };
    if (authLoading || loading) {
        return (_jsx(FacultyLayout, { title: "Research", children: _jsx("div", { className: "flex items-center justify-center h-96", children: _jsx(Spinner, { size: "lg", text: "Loading..." }) }) }));
    }
    return (_jsxs(FacultyLayout, { title: "Research", children: [_jsxs("div", { className: "space-y-6", children: [error && _jsx(ErrorAlert, { title: "Error", message: error }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Research Projects" }), _jsxs("button", { type: "button", "data-testid": "new-research-btn", onClick: openCreateModal, className: "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx(Plus, { className: "w-4 h-4" }), "New Research"] })] }), projects.length === 0 && !error ? (_jsx(Card, { children: _jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [_jsx(FlaskConical, { className: "w-12 h-12 text-gray-300 mb-4" }), _jsx("p", { className: "text-gray-500 font-medium", children: "No research projects found" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: "Research projects you are involved in will appear here." })] }) })) : (_jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: projects.map((project) => (_jsx("button", { "data-testid": `research-card-${project.id}`, onClick: () => openEditModal(project), className: "text-left w-full", children: _jsx(Card, { className: "h-full cursor-pointer", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h3", { "data-testid": `research-title-${project.id}`, className: "font-semibold text-gray-900 text-sm leading-snug", children: project.title }), _jsx("span", { "data-testid": `research-status-${project.id}`, className: `shrink-0 inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[project.status]}`, children: project.status })] }), _jsx("p", { "data-testid": `research-role-${project.id}`, className: "text-xs text-primary-dark font-medium capitalize", children: project.role }), _jsx("p", { "data-testid": `research-description-${project.id}`, className: "text-sm text-gray-600 line-clamp-3", children: project.description })] }) }) }, project.id))) }))] }), _jsxs(Modal, { isOpen: modalOpen, onClose: closeModal, title: editingProject ? 'Edit Research Project' : 'New Research Project', size: "md", footer: _jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: closeModal, disabled: submitting, className: "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "submit", form: "research-form", disabled: submitting, "data-testid": "research-form-submit", className: "rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50", children: submitting ? 'Saving…' : editingProject ? 'Save Changes' : 'Create' })] }), children: [modalError && (_jsx("div", { className: "mb-4", children: _jsx(ErrorAlert, { title: "Error", message: modalError }) })), _jsxs("form", { id: "research-form", onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "research-title", className: "block text-sm font-medium text-gray-700 mb-1", children: ["Title ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { id: "research-title", name: "title", type: "text", required: true, "data-testid": "research-form-title", value: form.title, onChange: handleFormChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary", placeholder: "Research project title" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "research-description", className: "block text-sm font-medium text-gray-700 mb-1", children: ["Description ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { id: "research-description", name: "description", required: true, rows: 4, "data-testid": "research-form-description", value: form.description, onChange: handleFormChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none", placeholder: "Describe the research project" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "research-status", className: "block text-sm font-medium text-gray-700 mb-1", children: ["Status ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { id: "research-status", name: "status", required: true, "data-testid": "research-form-status", value: form.status, onChange: handleFormChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "proposed", children: "Proposed" }), _jsx("option", { value: "ongoing", children: "Ongoing" }), _jsx("option", { value: "completed", children: "Completed" })] })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "research-role", className: "block text-sm font-medium text-gray-700 mb-1", children: ["Role ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { id: "research-role", name: "role", required: true, "data-testid": "research-form-role", value: form.role, onChange: handleFormChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "adviser", children: "Adviser" }), _jsx("option", { value: "panelist", children: "Panelist" }), _jsx("option", { value: "researcher", children: "Researcher" })] })] })] })] })] }));
}
