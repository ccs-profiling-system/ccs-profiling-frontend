import { jsx as _jsx } from "react/jsx-runtime";
const STATUS_STYLES = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-amber-100 text-amber-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};
export function EventStatusBadge({ status }) {
    return (_jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status]}`, children: status }));
}
