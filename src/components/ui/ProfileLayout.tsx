import { useState, ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { BadgeProps } from '@/components/ui/Badge';

export interface ProfileTab {
  key: string;
  label: string;
  content: ReactNode;
}

interface ProfileLayoutProps {
  title: string;
  subtitle?: string;
  status?: string;
  statusVariant?: BadgeProps['variant'];
  tabs: ProfileTab[];
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}

export function ProfileLayout({
  title,
  subtitle,
  status,
  statusVariant = 'gray',
  tabs,
  onEdit,
  onDelete,
}: ProfileLayoutProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? '');
  const current = tabs.find((t: ProfileTab) => t.key === activeTab);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>}
            {status && (
              <div className="mt-2">
                <Badge variant={statusVariant} size="sm">{status}</Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {tabs.length > 1 && (
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition ${
                  activeTab === tab.key
                    ? 'bg-primary text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {current?.content}
      </div>
    </div>
  );
}
