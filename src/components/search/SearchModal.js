import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { X, Search, User, Users, Calendar, FileText, Loader2 } from 'lucide-react';
import { searchService } from '@/services/api';
import { useNavigate } from 'react-router-dom';
export function SearchModal({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await searchService.globalSearch(searchQuery);
            const formatted = searchService.formatGlobalResults(response);
            setResults(formatted);
        }
        catch (err) {
            console.error('Search error:', err);
            setError('Failed to perform search. Please try again.');
            setResults([]);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, performSearch]);
    // Close modal on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);
    const handleResultClick = (result) => {
        // Navigate to the appropriate page based on result type
        switch (result.type) {
            case 'student':
                navigate(`/students/${result.id}`);
                break;
            case 'faculty':
                navigate(`/faculty/${result.id}`);
                break;
            case 'event':
                navigate(`/events/${result.id}`);
                break;
            case 'research':
                navigate(`/research/${result.id}`);
                break;
        }
        onClose();
    };
    const getResultIcon = (type) => {
        switch (type) {
            case 'student':
                return _jsx(User, { className: "w-5 h-5 text-blue-500" });
            case 'faculty':
                return _jsx(Users, { className: "w-5 h-5 text-green-500" });
            case 'event':
                return _jsx(Calendar, { className: "w-5 h-5 text-purple-500" });
            case 'research':
                return _jsx(FileText, { className: "w-5 h-5 text-orange-500" });
            default:
                return _jsx(Search, { className: "w-5 h-5 text-gray-500" });
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-50", children: _jsxs("div", { className: "w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl", children: [_jsxs("div", { className: "flex items-center gap-3 p-4 border-b", children: [_jsx(Search, { className: "w-5 h-5 text-gray-400" }), _jsx("input", { type: "text", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search students, faculty, events, research...", className: "flex-1 text-lg outline-none", autoFocus: true }), _jsx("button", { onClick: onClose, className: "p-1 hover:bg-gray-100 rounded-full transition-colors", children: _jsx(X, { className: "w-5 h-5 text-gray-500" }) })] }), _jsxs("div", { className: "max-h-96 overflow-y-auto", children: [loading && (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(Loader2, { className: "w-6 h-6 animate-spin text-blue-500" }) })), error && (_jsx("div", { className: "p-4 text-center text-red-600", children: error })), !loading && !error && query && results.length === 0 && (_jsxs("div", { className: "p-8 text-center text-gray-500", children: ["No results found for \"", query, "\""] })), !loading && !error && results.length > 0 && (_jsx("div", { className: "py-2", children: results.map((result) => (_jsxs("button", { onClick: () => handleResultClick(result), className: "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left", children: [getResultIcon(result.type), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "font-medium text-gray-900 truncate", children: result.title }), result.subtitle && (_jsx("div", { className: "text-sm text-gray-500 truncate", children: result.subtitle }))] }), _jsx("div", { className: "text-xs text-gray-400 uppercase", children: result.type })] }, `${result.type}-${result.id}`))) })), !query && (_jsx("div", { className: "p-8 text-center text-gray-400", children: "Start typing to search..." }))] })] }) }));
}
