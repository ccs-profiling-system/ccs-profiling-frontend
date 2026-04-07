import { Search, X } from 'lucide-react';
import { useState, ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';

export interface SearchResult {
  id: string | number;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onChange?: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  value?: string;
  className?: string;
  debounceMs?: number;
  results?: SearchResult[];
  loading?: boolean;
  showResults?: boolean;
}

export function SearchBar({ 
  placeholder = 'Search...', 
  onSearch, 
  onChange,
  onResultClick,
  value: controlledValue,
  className = '',
  debounceMs = 300,
  results = [],
  loading = false,
  showResults = true
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Update internal state immediately for responsive UI
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    // Show dropdown when typing
    if (newValue && showResults) {
      setIsOpen(true);
    } else {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setIsOpen(false);
  };

  const shouldShowDropdown = isOpen && showResults && value && (results.length > 0 || loading);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => value && showResults && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition z-10"
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Dropdown Results */}
      {shouldShowDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm">Searching...</p>
            </div>
          ) : (
            <ul>
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-primary-dark hover:text-white transition-colors flex items-center gap-3 group"
                  >
                    {result.icon && (
                      <div className="flex-shrink-0 text-gray-400 group-hover:text-white">
                        {result.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-white truncate">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-sm text-gray-500 group-hover:text-white/80 truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
