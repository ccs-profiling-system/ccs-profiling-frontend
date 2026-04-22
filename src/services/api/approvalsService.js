import api from './axios';
const SECRETARY_BASE = '/api/secretary';
const CHAIR_BASE = '/api/chair';
// Secretary Endpoints
export const submitStudentChanges = async (studentId, changes, originalData) => {
    const response = await api.post(`${SECRETARY_BASE}/students/${studentId}/submit-changes`, {
        changes,
        originalData,
    });
    return response.data;
};
export const submitFacultyChanges = async (facultyId, changes, originalData) => {
    const response = await api.post(`${SECRETARY_BASE}/faculty/${facultyId}/submit-changes`, {
        changes,
        originalData,
    });
    return response.data;
};
export const getMyPendingChanges = async () => {
    const response = await api.get(`${SECRETARY_BASE}/pending-changes`);
    return response.data;
};
export const withdrawChange = async (changeId) => {
    await api.delete(`${SECRETARY_BASE}/pending-changes/${changeId}`);
};
// Chair Endpoints
export const getPendingApprovals = async (params) => {
    const response = await api.get(`${CHAIR_BASE}/pending-approvals`, { params });
    return response.data;
};
export const getApprovalStats = async () => {
    const response = await api.get(`${CHAIR_BASE}/pending-approvals/stats`);
    return response.data;
};
export const getApprovalById = async (id) => {
    const response = await api.get(`${CHAIR_BASE}/pending-approvals/${id}`);
    return response.data;
};
export const approveChange = async (id, notes) => {
    await api.post(`${CHAIR_BASE}/pending-approvals/${id}/approve`, { notes });
};
export const rejectChange = async (id, notes) => {
    await api.post(`${CHAIR_BASE}/pending-approvals/${id}/reject`, { notes });
};
export const getApprovalHistory = async (params) => {
    const response = await api.get(`${CHAIR_BASE}/approval-history`, { params });
    return response.data;
};
const approvalsService = {
    // Secretary
    submitStudentChanges,
    submitFacultyChanges,
    getMyPendingChanges,
    withdrawChange,
    // Chair
    getPendingApprovals,
    getApprovalStats,
    getApprovalById,
    approveChange,
    rejectChange,
    getApprovalHistory,
};
export default approvalsService;
