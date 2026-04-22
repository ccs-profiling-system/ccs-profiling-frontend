import api from './axios';
const BASE_URL = '/api/secretary';
// Dashboard
export const getDashboardStats = async () => {
    const response = await api.get(`${BASE_URL}/dashboard/stats`);
    return response.data;
};
// Student Records
export const getStudents = async (params) => {
    const response = await api.get(`${BASE_URL}/students`, { params });
    return response.data;
};
export const getStudentById = async (id) => {
    const response = await api.get(`${BASE_URL}/students/${id}`);
    return response.data;
};
export const createStudent = async (data) => {
    const response = await api.post(`${BASE_URL}/students`, data);
    return response.data;
};
export const updateStudent = async (id, data) => {
    const response = await api.put(`${BASE_URL}/students/${id}`, data);
    return response.data;
};
export const deleteStudent = async (id) => {
    await api.delete(`${BASE_URL}/students/${id}`);
};
// Faculty Records
export const getFaculty = async (params) => {
    const response = await api.get(`${BASE_URL}/faculty`, { params });
    return response.data;
};
export const getFacultyById = async (id) => {
    const response = await api.get(`${BASE_URL}/faculty/${id}`);
    return response.data;
};
export const createFaculty = async (data) => {
    const response = await api.post(`${BASE_URL}/faculty`, data);
    return response.data;
};
export const updateFaculty = async (id, data) => {
    const response = await api.put(`${BASE_URL}/faculty/${id}`, data);
    return response.data;
};
export const deleteFaculty = async (id) => {
    await api.delete(`${BASE_URL}/faculty/${id}`);
};
// Class Schedules
export const getSchedules = async (params) => {
    const response = await api.get(`${BASE_URL}/schedules`, { params });
    return response.data;
};
export const getScheduleById = async (id) => {
    const response = await api.get(`${BASE_URL}/schedules/${id}`);
    return response.data;
};
export const createSchedule = async (data) => {
    const response = await api.post(`${BASE_URL}/schedules`, data);
    return response.data;
};
export const updateSchedule = async (id, data) => {
    const response = await api.put(`${BASE_URL}/schedules/${id}`, data);
    return response.data;
};
export const deleteSchedule = async (id) => {
    await api.delete(`${BASE_URL}/schedules/${id}`);
};
// Documents
export const getDocuments = async (params) => {
    const response = await api.get(`${BASE_URL}/documents`, { params });
    return response.data;
};
export const getDocumentById = async (id) => {
    const response = await api.get(`${BASE_URL}/documents/${id}`);
    return response.data;
};
export const uploadDocument = async (data) => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('category', data.category);
    if (data.relatedEntityId) {
        formData.append('relatedEntityId', data.relatedEntityId);
    }
    if (data.description) {
        formData.append('description', data.description);
    }
    const response = await api.post(`${BASE_URL}/documents/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
export const deleteDocument = async (id) => {
    await api.delete(`${BASE_URL}/documents/${id}`);
};
export const downloadDocument = async (id) => {
    const response = await api.get(`${BASE_URL}/documents/${id}/download`, {
        responseType: 'blob',
    });
    return response.data;
};
// Reports
export const generateReport = async (config) => {
    const response = await api.post(`${BASE_URL}/reports/generate`, config, {
        responseType: 'blob',
    });
    return response.data;
};
export const getReportHistory = async () => {
    const response = await api.get(`${BASE_URL}/reports/history`);
    return response.data;
};
export const exportReportPDF = async (params) => {
    const response = await api.post(`${BASE_URL}/reports/export-pdf`, params, {
        responseType: 'blob',
    });
    return response.data;
};
// Filter Options
export const getPrograms = async () => {
    const response = await api.get(`${BASE_URL}/filters/programs`);
    return response.data;
};
export const getDepartments = async () => {
    const response = await api.get(`${BASE_URL}/filters/departments`);
    return response.data;
};
export const getInstructors = async () => {
    const response = await api.get(`${BASE_URL}/filters/instructors`);
    return response.data;
};
// Events
export const getEvents = async (params) => {
    const response = await api.get(`${BASE_URL}/events`, { params });
    return response.data;
};
export const getEventById = async (id) => {
    const response = await api.get(`${BASE_URL}/events/${id}`);
    return response.data;
};
export const createEvent = async (data) => {
    const response = await api.post(`${BASE_URL}/events`, data);
    return response.data;
};
export const updateEvent = async (id, data) => {
    const response = await api.put(`${BASE_URL}/events/${id}`, data);
    return response.data;
};
export const deleteEvent = async (id) => {
    await api.delete(`${BASE_URL}/events/${id}`);
};
export const submitEventForApproval = async (id) => {
    const response = await api.post(`${BASE_URL}/events/${id}/submit`);
    return response.data;
};
const secretaryService = {
    // Dashboard
    getDashboardStats,
    // Students
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    // Faculty
    getFaculty,
    getFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    // Schedules
    getSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    // Documents
    getDocuments,
    getDocumentById,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    // Events
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    submitEventForApproval,
    // Reports
    generateReport,
    getReportHistory,
    exportReportPDF,
    // Filters
    getPrograms,
    getDepartments,
    getInstructors,
};
export default secretaryService;
