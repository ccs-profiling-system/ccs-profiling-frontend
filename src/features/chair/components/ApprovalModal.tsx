import { useState } from 'react';
import { Modal } from '@/components/ui';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (notes?: string) => void;
  onReject: (reason: string) => void;
  title: string;
  itemName: string;
  loading?: boolean;
}

export function ApprovalModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  title,
  itemName,
  loading = false,
}: ApprovalModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(notes || undefined);
    } else if (action === 'reject' && reason.trim()) {
      onReject(reason);
    }
  };

  const handleClose = () => {
    setAction(null);
    setNotes('');
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600">
          Review and take action on: <span className="font-semibold">{itemName}</span>
        </p>

        {!action && (
          <div className="flex gap-3">
            <button
              onClick={() => setAction('approve')}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => setAction('reject')}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        )}

        {action === 'approve' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="Add any notes..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Approving...' : 'Confirm Approval'}
              </button>
              <button
                onClick={() => setAction(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {action === 'reject' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="Please provide a reason for rejection..."
              required
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading || !reason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => setAction(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
