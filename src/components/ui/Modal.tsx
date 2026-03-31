import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative bg-white rounded-xl shadow-lg w-full ${sizeClasses[size]} animate-scale-in`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6">{children}</div>
          {footer && <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
