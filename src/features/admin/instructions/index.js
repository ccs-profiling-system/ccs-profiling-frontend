import { jsx as _jsx } from "react/jsx-runtime";
import { MainLayout } from '@/components/layout';
import { InstructionsList } from './InstructionsList';
export function Instructions() {
    return (_jsx(MainLayout, { title: "Instructions", children: _jsx(InstructionsList, {}) }));
}
