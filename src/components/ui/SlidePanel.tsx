import { X } from 'lucide-react';
import { useEffect } from 'react';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function SlidePanel({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md'
}: SlidePanelProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out animate-slide-in-right ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${sizeClasses[size]} w-full`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
            aria-label="Close panel"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-80px)] p-6">
          {children}
        </div>
      </div>
    </>
  );
}
