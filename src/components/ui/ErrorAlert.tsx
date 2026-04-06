import { AlertCircle, XCircle } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorAlert({ 
  title = 'Error', 
  message, 
  onRetry, 
  onDismiss 
}: ErrorAlertProps) {
  return (
    <div className="bg-secondary/10 border-l-4 border-secondary p-4 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-secondary">{title}</p>
              <p className="text-sm text-gray-700 mt-1">{message}</p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="Dismiss"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm bg-secondary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
