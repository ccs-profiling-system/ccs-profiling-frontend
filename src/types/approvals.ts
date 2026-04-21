// Approval Workflow Types

export interface PendingChange {
  id: string;
  entityType: 'student' | 'faculty' | 'event';
  entityId: string;
  entityName: string; // Name of student/faculty/event for display
  changeType: 'create' | 'update' | 'delete';
  changes: Record<string, any>;
  originalData?: Record<string, any>;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface SubmitChangeRequest {
  entityType: 'student' | 'faculty' | 'event';
  entityId: string;
  changes: Record<string, any>;
  originalData?: Record<string, any>;
}

export interface ReviewChangeRequest {
  action: 'approve' | 'reject';
  notes?: string;
}

export interface PaginatedApprovals {
  data: PendingChange[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
