import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from 'lucide-react';
export function MultiSelect({ options, selected, onChange, placeholder = 'Select...', disabled = false, label, helperText, emptyMessage = 'No options available' }) {
    const handleToggle = (value) => {
        if (selected.includes(value)) {
            onChange(selected.filter(v => v !== value));
        }
        else {
            onChange([...selected, value]);
        }
    };
    const handleRemove = (value) => {
        onChange(selected.filter(v => v !== value));
    };
    const handleClearAll = () => {
        onChange([]);
    };
    return (_jsxs("div", { children: [label && (_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: label })), selected.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-2 mb-2", children: [selected.map((value) => (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md", children: [value, _jsx("button", { type: "button", onClick: () => handleRemove(value), disabled: disabled, className: "hover:bg-primary/20 rounded-full p-0.5 transition disabled:opacity-50", "aria-label": `Remove ${value}`, children: _jsx(X, { className: "w-3 h-3" }) })] }, value))), _jsx("button", { type: "button", onClick: handleClearAll, disabled: disabled, className: "text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50", children: "Clear all" })] })), _jsxs("select", { value: "", onChange: (e) => {
                    if (e.target.value) {
                        handleToggle(e.target.value);
                    }
                }, disabled: disabled || options.length === 0, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500", children: [_jsx("option", { value: "", children: selected.length > 0 ? `${selected.length} selected - Add more...` : placeholder }), options.length === 0 ? (_jsx("option", { disabled: true, children: emptyMessage })) : (options.map((option) => (_jsxs("option", { value: option, disabled: selected.includes(option), children: [option, " ", selected.includes(option) ? '✓' : ''] }, option))))] }), helperText && (_jsx("p", { className: "text-xs text-gray-500 mt-1", children: helperText }))] }));
}
