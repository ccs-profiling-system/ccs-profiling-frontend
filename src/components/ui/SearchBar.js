import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
export function SearchBar({ placeholder = 'Search...', onSearch, onChange, onResultClick, value: controlledValue, className = '', debounceMs = 300, results = [], loading = false, showResults = true }) {
    const [internalValue, setInternalValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const debounceTimerRef = useRef(null);
    const wrapperRef = useRef(null);
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);
    const handleChange = (e) => {
        const newValue = e.target.value;
        // Update internal state immediately for responsive UI
        if (!isControlled) {
            setInternalValue(newValue);
        }
        // Show dropdown when typing
        if (newValue && showResults) {
            setIsOpen(true);
        }
        else {
            setIsOpen(false);
        }
        // Call onChange immediately if provided
        onChange?.(newValue);
        // Debounce the onSearch callback
        if (onSearch) {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                onSearch(newValue);
            }, debounceMs);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && onSearch) {
            // Clear debounce timer and search immediately on Enter
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            onSearch(value);
            setIsOpen(false);
        }
    };
    const handleClear = () => {
        if (!isControlled) {
            setInternalValue('');
        }
        // Clear debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        setIsOpen(false);
        onChange?.('');
        onSearch?.('');
    };
    const handleResultClick = (result) => {
        onResultClick?.(result);
        setIsOpen(false);
    };
    const shouldShowDropdown = isOpen && showResults && value && (results.length > 0 || loading);
    return (_jsxs("div", { ref: wrapperRef, className: `relative ${className}`, children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none", style: { zIndex: 1 } }), _jsx("input", { type: "text", value: value, onChange: handleChange, onKeyDown: handleKeyDown, onFocus: () => value && showResults && setIsOpen(true), placeholder: placeholder, style: { paddingLeft: '2.5rem' }, className: "w-full pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" }), value && (_jsx("button", { onClick: handleClear, className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition", "aria-label": "Clear search", children: _jsx(X, { className: "w-5 h-5" }) })), shouldShowDropdown && (_jsx("div", { className: "absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50", children: loading ? (_jsxs("div", { className: "p-4 text-center text-gray-500", children: [_jsx("div", { className: "w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" }), _jsx("p", { className: "text-sm", children: "Searching..." })] })) : (_jsx("ul", { children: results.map((result) => (_jsx("li", { children: _jsxs("button", { onClick: () => handleResultClick(result), className: "w-full px-4 py-3 text-left hover:bg-primary-dark hover:text-white transition-colors flex items-center gap-3 group", children: [result.icon && (_jsx("div", { className: "flex-shrink-0 text-gray-400 group-hover:text-white", children: result.icon })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-gray-900 group-hover:text-white truncate", children: result.title }), result.subtitle && (_jsx("p", { className: "text-sm text-gray-500 group-hover:text-white/80 truncate", children: result.subtitle }))] })] }) }, result.id))) })) }))] }));
}
