import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X } from 'lucide-react';
const CATEGORY_COLORS = {
    technical: 'bg-blue-100 text-blue-800',
    soft: 'bg-green-100 text-green-800',
    expertise: 'bg-purple-100 text-purple-800',
    professional: 'bg-orange-100 text-orange-800',
    committee: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-700',
};
function tagColor(category) {
    return category ? (CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other) : CATEGORY_COLORS.other;
}
export function TagInput({ tags, onAdd, onRemove, categories, placeholder = 'Add…', disabled }) {
    const [input, setInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categories?.[0] ?? '');
    const commit = () => {
        const name = input.trim().replace(/,$/, '');
        if (!name)
            return;
        onAdd({ name, category: selectedCategory || undefined });
        setInput('');
    };
    const handleKey = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit();
        }
    };
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex gap-2 flex-wrap", children: [categories && categories.length > 0 && (_jsx("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), disabled: disabled, className: "text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white disabled:opacity-50", children: categories.map((c) => (_jsx("option", { value: c, children: c }, c))) })), _jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), onKeyDown: handleKey, onBlur: commit, placeholder: placeholder, disabled: disabled, className: "flex-1 min-w-[160px] text-sm border border-gray-300 rounded-lg px-3 py-1.5 disabled:opacity-50" })] }), tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: tags.map((tag, i) => (_jsxs("span", { className: `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tagColor(tag.category)}`, children: [tag.category && _jsxs("span", { className: "opacity-60", children: [tag.category, " \u00B7"] }), tag.name, !disabled && (_jsx("button", { type: "button", onClick: () => onRemove(tag), className: "ml-0.5 hover:opacity-70 transition", "aria-label": `Remove ${tag.name}`, children: _jsx(X, { className: "w-3 h-3" }) }))] }, `${tag.name}-${i}`))) }))] }));
}
