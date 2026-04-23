import api from './axios';
import type {
  PendingChange,
  ApprovalStats,
  SubmitChangeRequest,
  ReviewChangeRequest,
  PaginatedApprovals,
} from '@/types/approvals';

/**
 * Approvals Service
 * Handles all approval workflow operations for Secretary, Admin, and Chair portals
 */

// Base URLs
const SECRETARY_BASE = '/api/secretary/approvals';
const ADMIN_BASE = '/api/admin/approvals';
const CHAIR_BASE = '/api/chair/approvals';

// ============================================================================
// SECRETARY ENDPOINTS - Submit and track changes
// ============================================================================

/**
 * Submit a new change request for approval
 * Used when secretary creates or updates any entity
 */
export const submitChange = async (
  request: SubmitChangeRequest
): Promise<PendingChange> => {
  const response = await api.post(`${SECRETARY_BASE}/submit`, request);
  return response.data;
};

/**
 * Submit student profile changes for approval
 */
export const submitStudentChanges = async (
  studentId: string,
  changes: Record<string, any>,
  originalData?: Record<string, any>
): Promise<PendingChange> => {
  return submitChange({
    entityType: 'student',
    entityId: studentId,
    changes,
    originalData,
    category: 'profile',
  });
};

/**
 * Submit faculty profile changes for approval
 */
export const submitFacultyChanges = async (
  facultyId: string,
  changes: Record<string, any>,
  originalData?: Record<string, any>
): Promise<PendingChange> => {
  return submitChange({
    entityType: 'faculty',
    entityId: facultyId,
    changes,
    originalData,
    category: 'profile',
  });
};

/**
 * Submit event creation/update for approval
 */
export const submitEventChanges = async (
  eventId: string,
  changes: Record<string, any>,
  originalData?: Record<string, any>,
  isNew: boolean = false
): Promise<PendingChange> => {
  return submitChange({
    entityType: 'event',
    entityId: eventId,
    changes,
    originalData: isNew ? undefined : originalData,
    category: 'event',
  });
};

/**
 * Submit research project creation/update for approval
 */
export const submitResearchChanges = async (
  researchId: string,
  changes: Record<string, any>,
  originalData?: Record<string, any>,
  isNew: boolean = false
): Promise<PendingChange> => {
  return submitChange({
    entityType: 'research',
    entityId: researchId,
    changes,
    originalData: isNew ? undefined : originalData,
    category: 'research',
  });
};

/**
 * Get all pending changes submitted by current secretary
 */
export const getMyPendingChanges = async (params?: {
  status?: 'pending' | 'approved' | 'rejected';
  category?: 'research' | 'event' | 'profile';
  page?: number;
  limit?: number;
}): Promise<PendingChange[]> => {
  const response = await api.get(`${SECRETARY_BASE}/my-submissions`, { params });
  return response.data;
};

/**
 * Get statistics for secretary's submissions
 */
export const getMySubmissionStats = async (): Promise<ApprovalStats> => {
  const response = await api.get(`${SECRETARY_BASE}/my-submissions/stats`);
  return response.data;
};

/**
 * Withdraw a pending change request
 * Only allowed for pending status
 */
export const withdrawChange = async (changeId: string): Promise<void> => {
  await api.delete(`${SECRETARY_BASE}/submissions/${changeId}`);
};

/**
 * Get details of a specific submission
 */
export const getSubmissionById = async (id: string): Promise<PendingChange> => {
  const response = await api.get(`${SECRETARY_BASE}/submissions/${id}`);
  return response.data;
};

// ============================================================================
// ADMIN ENDPOINTS - Review and approve changes (system-wide)
// ============================================================================

/**
 * Get all pending approvals for admin review
 * Supports filtering by status, category, entity type
 */
export const getAdminPendingApprovals = async (params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
  category?: 'research' | 'event' | 'profile' | 'general';
  entityType?: 'student' | 'faculty' | 'event' | 'research' | 'profile';
  search?: string;
}): Promise<PaginatedApprovals> => {
  const response = await api.get(`${ADMIN_BASE}/pending`, { params });
  return response.data;
};

/**
 * Get approval statistics for admin dashboard
 */
export const getAdminApprovalStats = async (): Promise<ApprovalStats> => {
  const response = await api.get(`${ADMIN_BASE}/stats`);
  return response.data;
};

/**
 * Get details of a specific approval request (admin)
 */
export const getAdminApprovalById = async (id: string): Promise<PendingChange> => {
  const response = await api.get(`${ADMIN_BASE}/pending/${id}`);
  return response.data;
};

/**
 * Approve a change request (admin)
 */
export const adminApproveChange = async (id: string, notes?: string): Promise<void> => {
  await api.post(`${ADMIN_BASE}/pending/${id}/approve`, { notes });
};

/**
 * Reject a change request (admin)
 */
export const adminRejectChange = async (id: string, notes: string): Promise<void> => {
  await api.post(`${ADMIN_BASE}/pending/${id}/reject`, { notes });
};

/**
 * Get approval history (admin)
 */
export const getAdminApprovalHistory = async (params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedApprovals> => {
  const response = await api.get(`${ADMIN_BASE}/history`, { params });
  return response.data;
};

/**
 * Bulk approve multiple changes (admin)
 */
export const adminBulkApprove = async (
  ids: string[],
  notes?: string
): Promise<{ success: string[]; failed: string[] }> => {
  const response = await api.post(`${ADMIN_BASE}/bulk-approve`, { ids, notes });
  return response.data;
};

/**
 * Bulk reject multiple changes (admin)
 */
export const adminBulkReject = async (
  ids: string[],
  notes: string
): Promise<{ success: string[]; failed: string[] }> => {
  const response = await api.post(`${ADMIN_BASE}/bulk-reject`, { ids, notes });
  return response.data;
};

// ============================================================================
// CHAIR ENDPOINTS - Review and approve changes (department-level)
// ============================================================================

/**
 * Get all pending approvals for chair review
 * Supports filtering by status, category, entity type
 */
export const getPendingApprovals = async (params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
  category?: 'research' | 'event' | 'profile' | 'general';
  entityType?: 'student' | 'faculty' | 'event' | 'research' | 'profile';
  search?: string;
}): Promise<PaginatedApprovals> => {
  const response = await api.get(`${CHAIR_BASE}/pending`, { params });
  return response.data;
};

/**
 * Get approval statistics for chair dashboard
 */
export const getApprovalStats = async (): Promise<ApprovalStats> => {
  const response = await api.get(`${CHAIR_BASE}/stats`);
  return response.data;
};

/**
 * Get details of a specific approval request (chair)
 */
export const getApprovalById = async (id: string): Promise<PendingChange> => {
  const response = await api.get(`${CHAIR_BASE}/pending/${id}`);
  return response.data;
};

/**
 * Approve a change request (chair)
 */
export const approveChange = async (id: string, notes?: string): Promise<void> => {
  await api.post(`${CHAIR_BASE}/pending/${id}/approve`, { notes });
};

/**
 * Reject a change request (chair)
 */
export const rejectChange = async (id: string, notes: string): Promise<void> => {
  await api.post(`${CHAIR_BASE}/pending/${id}/reject`, { notes });
};

/**
 * Get approval history (chair)
 */
export const getApprovalHistory = async (params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedApprovals> => {
  const response = await api.get(`${CHAIR_BASE}/history`, { params });
  return response.data;
};

/**
 * Bulk approve multiple changes (chair)
 */
export const bulkApprove = async (
  ids: string[],
  notes?: string
): Promise<{ success: string[]; failed: string[] }> => {
  const response = await api.post(`${CHAIR_BASE}/bulk-approve`, { ids, notes });
  return response.data;
};

/**
 * Bulk reject multiple changes (chair)
 */
export const bulkReject = async (
  ids: string[],
  notes: string
): Promise<{ success: string[]; failed: string[] }> => {
  const response = await api.post(`${CHAIR_BASE}/bulk-reject`, { ids, notes });
  return response.data;
};

// ============================================================================
// SHARED/UTILITY ENDPOINTS
// ============================================================================

/**
 * Get approval workflow configuration
 */
export const getApprovalConfig = async (): Promise<{
  requiresApproval: {
    student: boolean;
    faculty: boolean;
    event: boolean;
    research: boolean;
  };
  approvers: string[];
}> => {
  const response = await api.get('/api/approvals/config');
  return response.data;
};

/**
 * Get notifications for approval updates
 */
export const getApprovalNotifications = async (params?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<Array<{
  id: string;
  type: 'approved' | 'rejected' | 'pending';
  changeId: string;
  message: string;
  createdAt: string;
  read: boolean;
}>> => {
  const response = await api.get('/api/approvals/notifications', { params });
  return response.data;
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId: string): Promise<void> => {
  await api.patch(`/api/approvals/notifications/${notificationId}/read`);
};

// ============================================================================
// DEFAULT EXPORT - Service Object
// ============================================================================

const approvalsService = {
  // Secretary - Submit changes
  submitChange,
  submitStudentChanges,
  submitFacultyChanges,
  submitEventChanges,
  submitResearchChanges,
  getMyPendingChanges,
  getMySubmissionStats,
  withdrawChange,
  getSubmissionById,
  
  // Admin - Review changes (system-wide)
  getAdminPendingApprovals,
  getAdminApprovalStats,
  getAdminApprovalById,
  adminApproveChange,
  adminRejectChange,
  getAdminApprovalHistory,
  adminBulkApprove,
  adminBulkReject,
  
  // Chair - Review changes (department-level)
  getPendingApprovals,
  getApprovalStats,
  getApprovalById,
  approveChange,
  rejectChange,
  getApprovalHistory,
  bulkApprove,
  bulkReject,
  
  // Shared utilities
  getApprovalConfig,
  getApprovalNotifications,
  markNotificationRead,
};

export default approvalsService;
