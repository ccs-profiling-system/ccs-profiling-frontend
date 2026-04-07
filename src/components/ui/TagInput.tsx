import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

export interface Tag {
  id?: string;
  name: string;
  category?: string;
}

interface TagInputProps {
  tags: Tag[];
  onAdd: (tag: Tag) => void;
  onRemove: (tag: Tag) => void;
  categories?: string[];
  placeholder?: string;
  disabled?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  technical: 'bg-blue-100 text-blue-800',
  soft: 'bg-green-100 text-green-800',
  expertise: 'bg-purple-100 text-purple-800',
  professional: 'bg-orange-100 text-orange-800',
  committee: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-700',
};

function tagColor(category?: string) {
  return category ? (CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other) : CATEGORY_COLORS.other;
}

export function TagInput({ tags, onAdd, onRemove, categories, placeholder = 'Add…', disabled }: TagInputProps) {
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories?.[0] ?? '');

  const commit = () => {
    const name = input.trim().replace(/,$/, '');
    if (!name) return;
    onAdd({ name, category: selectedCategory || undefined });
    setInput('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {categories && categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={disabled}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white disabled:opacity-50"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={commit}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-w-[160px] text-sm border border-gray-300 rounded-lg px-3 py-1.5 disabled:opacity-50"
        />
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={`${tag.name}-${i}`}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tagColor(tag.category)}`}
            >
              {tag.category && <span className="opacity-60">{tag.category} ·</span>}
              {tag.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemove(tag)}
                  className="ml-0.5 hover:opacity-70 transition"
                  aria-label={`Remove ${tag.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
