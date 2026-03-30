import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  accent?: boolean;
  hover?: boolean;
}

export function Card({ children, className = '', title, accent = false, hover = true }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg shadow transition-all duration-200
        ${accent ? 'border-l-4 border-primary' : ''}
        ${hover ? 'hover:shadow-lg hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className={title ? 'p-6' : 'p-6'}>
        {children}
      </div>
    </div>
  );
}
