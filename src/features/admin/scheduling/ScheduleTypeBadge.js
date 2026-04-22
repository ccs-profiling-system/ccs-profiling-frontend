import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const badgeStyles = {
    class: 'bg-blue-100 text-blue-700 border-blue-200',
    exam: 'bg-amber-100 text-amber-700 border-amber-200',
};
const badgeIcons = {
    class: (_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" }) })),
    exam: (_jsxs("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: [_jsx("path", { d: "M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" }), _jsx("path", { fillRule: "evenodd", d: "M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z", clipRule: "evenodd" })] })),
};
export function ScheduleTypeBadge({ type, size = 'sm' }) {
    const sizeClasses = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
    return (_jsxs("span", { className: `inline-flex items-center gap-1 rounded-md font-medium capitalize border ${badgeStyles[type]} ${sizeClasses}`, children: [size !== 'xs' && badgeIcons[type], type] }));
}
