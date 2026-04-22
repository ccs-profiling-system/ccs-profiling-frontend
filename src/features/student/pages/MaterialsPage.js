import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { Clock } from 'lucide-react';
export function MaterialsPage() {
    return (_jsx(StudentLayout, { title: "Course Materials", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(Clock, { className: "w-7 h-7 text-primary" }), "Course Materials"] }), _jsx(Card, { children: _jsx("p", { className: "text-gray-600", children: "Course materials view coming soon..." }) })] }) }));
}
