import { Modal } from '@/components/layout';
import { Badge } from '@/components/ui';
import { User, Calendar, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { PendingChange } from '@/types/approvals';

interface ChangeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  change: PendingChange | null;
}

export function ChangeDetailsModal({
  isOpen,
  onClose,
  change,
}: ChangeDetailsModalProps) {
  if (!change) return null;

  const getChangedFields = () => {
    const changed: Array<{ field: string; oldValue: any; newValue: any }> = [];
    
    Object.keys(change.changes).forEach((key) => {
      const oldValue = change.originalData?.[key];
      const newValue = change.changes[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changed.push({
          field: key,
          oldValue: oldValue ?? '—',
          newValue: newValue ?? '—',
        });
      }
    });
    
    return changed;
  };

  const changedFields = getChangedFields();

  const formatFieldName = (field: string): string => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getStatusIcon = () => {
    switch (change.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (change.status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Status Banner */}
        <div className={`rounded-lg p-4 border ${getStatusColor()}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Status:</span>
                <Badge
                  variant={
                    change.status === 'pending'
                      ? 'warning'
                      : change.status === 'approved'
                      ? 'success'
                      : 'gray'
                  }
                >
                  {change.status.toUpperCase()}
                </Badge>
              </div>
              {change.status === 'approved' && (
                <p className="text-sm text-green-700 mt-1">
                  Your changes have been approved and applied to the profile.
                </p>
              )}
              {change.status === 'rejected' && (
                <p className="text-sm text-red-700 mt-1">
                  Your changes were not approved. See reason below.
                </p>
              )}
              {change.status === 'pending' && (
                <p className="text-sm text-yellow-700 mt-1">
                  Waiting for department chair approval.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submission Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Entity:</span>
            <span className="font-medium text-gray-900">
              {change.entityName} ({change.entityType})
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Submitted:</span>
            <span className="font-medium text-gray-900">
              {new Date(change.submittedAt).toLocaleString()}
            </span>
          </div>
          {change.reviewedAt && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Reviewed by:</span>
                <span className="font-medium text-gray-900">{change.reviewedByName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Reviewed:</span>
                <span className="font-medium text-gray-900">
                  {new Date(change.reviewedAt).toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Changes Comparison */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Changes Submitted</h3>
          
          {changedFields.length === 0 ? (
            <p className="text-sm text-gray-500">No changes detected</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Field</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Original Value</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {changedFields.map((field, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatFieldName(field.field)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatValue(field.oldValue)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-primary font-medium">
                          {formatValue(field.newValue)}
                        </span>
                        <span className="ml-2 text-xs text-primary">✏️</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Review Notes (if rejected) */}
        {change.status === 'rejected' && change.reviewNotes && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejection Reason
            </h3>
            <p className="text-sm text-red-800">{change.reviewNotes}</p>
          </div>
        )}

        {/* Approval Notes (if approved with notes) */}
        {change.status === 'approved' && change.reviewNotes && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Approval Notes
            </h3>
            <p className="text-sm text-green-800">{change.reviewNotes}</p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
