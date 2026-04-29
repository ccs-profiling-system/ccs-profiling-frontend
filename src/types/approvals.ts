// Approval Workflow Types

// Backend response type (snake_case)
export interface BackendApproval {
  id: string;
  entity_type: 'student' | 'faculty' | 'event' | 'research';
  entity_id: string;
  category: 'research' | 'event' | 'profile' | 'general';
  change_details: Record<string, any>;
  original_data?: Record<string, any> | null;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'failed' | 'conflicted';
  submitter_id: string;
  reviewer_id?: string | null;
  submission_timestamp: string | null;
  decision_timestamp?: string | null;
  application_timestamp?: string | null;
  comments?: string | null;
  department_id?: string | null;
  entity_version?: number | null;
  retry_count: number;
  failure_reason?: string | null;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Frontend type (camelCase)
export interface PendingChange {
  id: string;
  entityType: 'student' | 'faculty' | 'event' | 'research' | 'profile';
  entityId: string;
  entityName: string; // Name of student/faculty/event for display (derived)
  changeType: 'create' | 'update' | 'delete'; // Derived from change_details
  changes: Record<string, any>;
  originalData?: Record<string, any>;
  submittedBy: string;
  submittedByName: string; // Derived or fetched
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedByName?: string; // Derived or fetched
  reviewedAt?: string;
  reviewNotes?: string;
  category?: 'research' | 'event' | 'profile' | 'general';
}

export interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface SubmitChangeRequest {
  entityType: 'student' | 'faculty' | 'event' | 'research' | 'profile';
  entityId: string;
  changes: Record<string, any>;
  originalData?: Record<string, any>;
  category?: 'research' | 'event' | 'profile' | 'general';
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
