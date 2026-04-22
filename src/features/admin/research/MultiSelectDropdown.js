import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
export function MultiSelectDropdown({ options, selectedIds, onChange, placeholder = 'Select...', }) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);
    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setSearchQuery('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    function toggleOption(id) {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((s) => s !== id));
        }
        else {
            onChange([...selectedIds, id]);
        }
    }
    const filteredOptions = options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));
    const selectedLabels = options
        .filter((opt) => selectedIds.includes(opt.id))
        .map((opt) => opt.label);
    const triggerLabel = selectedIds.length === 0
        ? placeholder
        : selectedIds.length === 1
            ? selectedLabels[0]
            : `${selectedIds.length} selected`;
    return (_jsxs("div", { ref: containerRef, className: "relative w-full", children: [_jsxs("button", { type: "button", onClick: () => setOpen((o) => !o), className: "w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition", children: [_jsx("span", { className: selectedIds.length === 0 ? 'text-gray-500' : 'text-gray-900', children: triggerLabel }), _jsx(ChevronDown, { className: `w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}` })] }), open && (_jsxs("div", { className: "absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden", children: [options.length > 5 && (_jsx("div", { className: "p-2 border-b border-gray-200", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", onClick: (e) => e.stopPropagation() })] }) })), _jsx("div", { className: "max-h-48 overflow-y-auto", children: filteredOptions.length > 0 ? (filteredOptions.map((opt) => {
                            const isSelected = selectedIds.includes(opt.id);
                            return (_jsxs("button", { type: "button", onClick: () => toggleOption(opt.id), className: `w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`, children: [_jsx("div", { className: `w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                                            ? 'bg-primary border-primary'
                                            : 'border-gray-300'}`, children: isSelected && _jsx(Check, { className: "w-3 h-3 text-white" }) }), _jsx("span", { className: `text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`, children: opt.label })] }, opt.id));
                        })) : (_jsx("div", { className: "px-3 py-6 text-center text-sm text-gray-500", children: searchQuery ? 'No matching options' : 'No options available' })) }), selectedIds.length > 0 && (_jsxs("div", { className: "px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600", children: [selectedIds.length, " item", selectedIds.length !== 1 ? 's' : '', " selected"] }))] }))] }));
}
