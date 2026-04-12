import { jsx as _jsx } from "react/jsx-runtime";
const STATUS_CONFIG = {
    ongoing: {
        className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        label: 'Ongoing'
    },
    completed: {
        className: 'bg-green-100 text-green-800 border border-green-200',
        label: 'Completed'
    },
    published: {
        className: 'bg-blue-100 text-blue-800 border border-blue-200',
        label: 'Published'
    },
};
export function ResearchStatusBadge({ status }) {
    const config = STATUS_CONFIG[status];
    return (_jsx("span", { className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.className}`, "data-status": status, children: config.label }));
}
