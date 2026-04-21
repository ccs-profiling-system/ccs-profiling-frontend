import { useState } from 'react';
import { Modal } from '@/components/layout';
import { Button, Badge, Spinner } from '@/components/ui';
import { CheckCircle2, XCircle, User, Calendar, FileText } from 'lucide-react';
import type { PendingChange } from '@/types/approvals';

interface ApprovalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  approval: PendingChange | null;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, notes: string) => Promise<void>;
}

export function ApprovalReviewModal({
  isOpen,
  onClose,
  approval,
  onApprove,
  onReject,
}: ApprovalReviewModalProps) {
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  if (!approval) return null;

  const handleApprove = async () => {
    setAction('approve');
    setProcessing(true);
    try {
      await onApprove(approval.id, notes || undefined);
      onClose();
      setNotes('');
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve changes');
    } finally {
      setProcessing(false);
      setAction(null);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setAction('reject');
    setProcessing(false);
    try {
      await onReject(approval.id, notes);
      onClose();
      setNotes('');
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject changes');
    } finally {
      setProcessing(false);
      setAction(null);
    }
  };

  const getChangedFields = () => {
    const changed: Array<{ field: string; oldValue: any; newValue: any }> = [];
    
    Object.keys(approval.changes).forEach((key) => {
      const oldValue = approval.originalData?.[key];
      const newValue = approval.changes[key];
      
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review ${approval.entityType === 'student' ? 'Student' : 'Faculty'} Update`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Submission Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Submitted by:</span>
            <span className="font-medium text-gray-900">{approval.submittedByName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Date:</span>
            <span className="font-medium text-gray-900">
              {new Date(approval.submittedAt).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Entity:</span>
            <span className="font-medium text-gray-900">{approval.entityName}</span>
          </div>
        </div>

        {/* Changes Comparison */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Proposed Changes</h3>
          
          {changedFields.length === 0 ? (
            <p className="text-sm text-gray-500">No changes detected</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Field</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Current Value</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Proposed Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {changedFields.map((change, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatFieldName(change.field)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatValue(change.oldValue)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-primary font-medium">
                          {formatValue(change.newValue)}
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

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes {action === 'reject' && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              action === 'reject'
                ? 'Please provide a reason for rejection...'
                : 'Optional notes about this approval...'
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
            disabled={processing}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={handleReject}
            disabled={processing}
            icon={<XCircle className="w-4 h-4" />}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            {processing && action === 'reject' ? (
              <>
                <Spinner size="sm" />
                Rejecting...
              </>
            ) : (
              'Reject'
            )}
          </Button>
          <Button
            fullWidth
            onClick={handleApprove}
            disabled={processing}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {processing && action === 'approve' ? (
              <>
                <Spinner size="sm" />
                Approving...
              </>
            ) : (
              'Approve'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
