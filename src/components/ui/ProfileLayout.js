import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
export function ProfileLayout({ title, subtitle, status, statusVariant = 'gray', tabs, onEdit, onDelete, }) {
    const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? '');
    const current = tabs.find((t) => t.key === activeTab);
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "px-6 pt-6 pb-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 truncate", children: title }), subtitle && _jsx("p", { className: "text-sm text-gray-500 mt-0.5 truncate", children: subtitle }), status && (_jsx("div", { className: "mt-2", children: _jsx(Badge, { variant: statusVariant, size: "sm", children: status }) }))] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [onEdit && (_jsx("button", { type: "button", onClick: onEdit, className: "px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Edit" })), onDelete && (_jsx("button", { type: "button", onClick: onDelete, className: "px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition", children: "Delete" }))] })] }), tabs.length > 1 && (_jsx("div", { className: "flex gap-1 mt-4 overflow-x-auto", children: tabs.map((tab) => (_jsx("button", { type: "button", onClick: () => setActiveTab(tab.key), className: `px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition ${activeTab === tab.key
                                ? 'bg-primary text-white font-medium'
                                : 'text-gray-600 hover:bg-gray-100'}`, children: tab.label }, tab.key))) }))] }), _jsx("div", { className: "flex-1 overflow-y-auto px-6 py-5", children: current?.content })] }));
}
