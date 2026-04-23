import { X } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  emptyMessage?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  label,
  helperText,
  emptyMessage = 'No options available'
}: MultiSelectProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter(v => v !== value));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {/* Selected items display */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md"
            >
              {value}
              <button
                type="button"
                onClick={() => handleRemove(value)}
                disabled={disabled}
                className="hover:bg-primary/20 rounded-full p-0.5 transition disabled:opacity-50"
                aria-label={`Remove ${value}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled}
            className="text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Dropdown */}
      <select
        value=""
        onChange={(e) => {
          if (e.target.value) {
            handleToggle(e.target.value);
          }
        }}
        disabled={disabled || options.length === 0}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500"
      >
        <option value="">
          {selected.length > 0 ? `${selected.length} selected - Add more...` : placeholder}
        </option>
        {options.length === 0 ? (
          <option disabled>{emptyMessage}</option>
        ) : (
          options.map((option) => (
            <option
              key={option}
              value={option}
              disabled={selected.includes(option)}
            >
              {option} {selected.includes(option) ? '✓' : ''}
            </option>
          ))
        )}
      </select>

      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
