import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
export function ChairCurriculum() {
    return (_jsx(MainLayout, { title: "Curriculum Oversight", variant: "chair", children: _jsxs(Card, { className: "p-8 text-center", children: [_jsx("p", { className: "text-gray-600", children: "Curriculum oversight module - View curriculum structure, syllabus, and instructional materials" }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "This feature will be implemented with backend integration" })] }) }));
}
