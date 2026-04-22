import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { useParticipants } from './useParticipants';
export function ParticipantAssignModal({ eventId, initialAssigned = [], onClose, }) {
    const { available, loading, error, fetchAvailable, assign, remove } = useParticipants(eventId);
    const [activeTab, setActiveTab] = useState('students');
    const [search, setSearch] = useState('');
    // Track selected IDs as a Set for O(1) toggle
    const [selectedIds, setSelectedIds] = useState(() => new Set(initialAssigned.map((p) => p.id)));
    const [saveError, setSaveError] = useState(null);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        fetchAvailable();
    }, [fetchAvailable]);
    const students = useMemo(() => available.filter((p) => p.role === 'student'), [available]);
    const faculty = useMemo(() => available.filter((p) => p.role === 'faculty'), [available]);
    const listForTab = activeTab === 'students' ? students : faculty;
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return q ? listForTab.filter((p) => p.name.toLowerCase().includes(q)) : listForTab;
    }, [listForTab, search]);
    function toggleParticipant(id) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    }
    async function handleSave() {
        setSaveError(null);
        setSaving(true);
        try {
            await assign(Array.from(selectedIds));
            onClose();
        }
        catch (err) {
            // Preserve selection state on error (selectedIds unchanged)
            setSaveError(err?.response?.data?.message ?? err?.message ?? 'Failed to save participants.');
        }
        finally {
            setSaving(false);
        }
    }
    async function handleRemove(participantId) {
        setSaveError(null);
        try {
            await remove(participantId);
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(participantId);
                return next;
            });
        }
        catch (err) {
            setSaveError(err?.response?.data?.message ?? err?.message ?? 'Failed to remove participant.');
        }
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b shrink-0", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-800", children: "Assign Participants" }), _jsx("button", { type: "button", onClick: onClose, className: "text-gray-400 hover:text-gray-600 text-xl leading-none", "aria-label": "Close", children: "\u00D7" })] }), _jsxs("div", { className: "flex-1 overflow-y-auto px-6 py-4 space-y-4", children: [(error || saveError) && (_jsx("div", { className: "rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm", children: saveError ?? error })), _jsx("div", { className: "flex border-b", children: ['students', 'faculty'].map((tab) => (_jsx("button", { type: "button", onClick: () => { setActiveTab(tab); setSearch(''); }, className: `px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${activeTab === tab
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: tab }, tab))) }), _jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: `Search ${activeTab}…`, className: "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" }), loading ? (_jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "Loading\u2026" })) : filtered.length === 0 ? (_jsxs("p", { className: "text-sm text-gray-400 text-center py-4", children: ["No ", activeTab, " found."] })) : (_jsx("ul", { className: "divide-y divide-gray-100 border rounded", children: filtered.map((p) => {
                                const isSelected = selectedIds.has(p.id);
                                return (_jsxs("li", { className: "flex items-center justify-between px-3 py-2", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer flex-1", children: [_jsx("input", { type: "checkbox", checked: isSelected, onChange: () => toggleParticipant(p.id), className: "accent-blue-600" }), _jsx("span", { className: "text-sm text-gray-700", children: p.name })] }), isSelected && (_jsx("button", { type: "button", onClick: () => handleRemove(p.id), className: "text-xs text-red-500 hover:text-red-700 ml-2", children: "Remove" }))] }, p.id));
                            }) }))] }), _jsxs("div", { className: "flex justify-end gap-3 px-6 py-4 border-t shrink-0", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleSave, disabled: saving, className: "px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50", children: saving ? 'Saving…' : 'Save' })] })] }) }));
}
