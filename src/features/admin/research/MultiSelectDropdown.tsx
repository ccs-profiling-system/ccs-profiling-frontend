import { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  id: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: DropdownOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
}

export function MultiSelectDropdown({
  options,
  selectedIds,
  onChange,
  placeholder = 'Select...',
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleOption(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  const triggerLabel =
    selectedIds.length === 0
      ? placeholder
      : `${selectedIds.length} selected`;

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ width: '100%', textAlign: 'left', padding: '6px 10px', cursor: 'pointer' }}
      >
        {triggerLabel}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          style={{
            position: 'absolute',
            zIndex: 100,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            listStyle: 'none',
            margin: 0,
            padding: '4px 0',
            width: '100%',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {options.map((opt) => {
            const checked = selectedIds.includes(opt.id);
            return (
              <li
                key={opt.id}
                role="option"
                aria-selected={checked}
                style={{ padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => toggleOption(opt.id)}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={checked}
                  tabIndex={-1}
                  aria-hidden="true"
                />
                {opt.label}
              </li>
            );
          })}
          {options.length === 0 && (
            <li style={{ padding: '6px 10px', color: '#888' }}>No options available</li>
          )}
        </ul>
      )}
    </div>
  );
}
