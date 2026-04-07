import { useState, useEffect, useCallback } from 'react';
import { X, Search, User, Users, Calendar, FileText, Loader2 } from 'lucide-react';
import { searchService, type SearchResult } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const performSearch = useCallback(async (searchQuery: string) => {
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
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
      setResults([]);
    } finally {
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleResultClick = (result: SearchResult) => {
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

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'student':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'faculty':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'research':
        return <FileText className="w-5 h-5 text-orange-500" />;
      default:
        return <Search className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, faculty, events, research..."
            className="flex-1 text-lg outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && query && results.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No results found for "{query}"
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  {getResultIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {result.title}
                    </div>
                    {result.subtitle && (
                      <div className="text-sm text-gray-500 truncate">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 uppercase">
                    {result.type}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="p-8 text-center text-gray-400">
              Start typing to search...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
