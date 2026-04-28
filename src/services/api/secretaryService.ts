import api from './axios';
import type {
  SecretaryDashboardStats,
  StudentRecord,
  FacultyRecord,
  ClassSchedule,
  Document,
  ReportConfig,
  PaginatedResponse,
  StudentRecordInput,
  FacultyRecordInput,
  ClassScheduleInput,
  DocumentUpload,
  PaginationParams,
  Event,
  EventInput,
} from '@/types/secretary';

const BASE_URL = '/secretary';

// ============================================================================
// Data Transformation Helpers
// ============================================================================

// Transform backend student data to frontend format
const transformStudent = (backendStudent: any): StudentRecord => ({
  id: backendStudent.id,
  studentId: backendStudent.student_id,
  firstName: backendStudent.first_name,
  lastName: backendStudent.last_name,
  email: backendStudent.email,
  program: backendStudent.program || '',
  yearLevel: backendStudent.year_level || 1,
  status: backendStudent.status || 'Active',
  createdAt: backendStudent.created_at,
  updatedAt: backendStudent.updated_at,
});

// Transform backend faculty data to frontend format
const transformFaculty = (backendFaculty: any): FacultyRecord => ({
  id: backendFaculty.id,
  employeeId: backendFaculty.faculty_id,
  firstName: backendFaculty.first_name,
  lastName: backendFaculty.last_name,
  email: backendFaculty.email,
  department: backendFaculty.department || '',
  position: backendFaculty.position || '',
  specialization: backendFaculty.specialization,
  status: backendFaculty.status || 'Active',
  createdAt: backendFaculty.created_at,
  updatedAt: backendFaculty.updated_at,
});

// Transform backend schedule data to frontend format
const transformSchedule = (backendSchedule: any): ClassSchedule => ({
  id: backendSchedule.id,
  courseCode: backendSchedule.subject_code || '',
  courseName: backendSchedule.subject_name || '',
  instructorId: backendSchedule.faculty_id || '',
  instructorName: backendSchedule.faculty_name || '',
  day: backendSchedule.day,
  startTime: backendSchedule.start_time,
  endTime: backendSchedule.end_time,
  room: backendSchedule.room,
  semester: backendSchedule.semester,
  academicYear: backendSchedule.academic_year,
  section: backendSchedule.section,
  createdAt: backendSchedule.created_at,
  updatedAt: backendSchedule.updated_at,
});

// Transform backend event data to frontend format
const transformEvent = (backendEvent: any): Event => ({
  id: backendEvent.id,
  title: backendEvent.event_name,
  description: backendEvent.description || '',
  eventType: backendEvent.event_type || 'other',
  startDate: backendEvent.event_date,
  endDate: backendEvent.event_date,
  location: backendEvent.location || '',
  organizer: backendEvent.organizer || '',
  targetAudience: [],
  maxParticipants: backendEvent.max_participants,
  status: backendEvent.status || 'draft',
  createdAt: backendEvent.created_at,
  updatedAt: backendEvent.updated_at,
});

// Transform backend document data to frontend format
const transformDocument = (backendDoc: any): Document => ({
  id: backendDoc.id,
  name: backendDoc.title || backendDoc.original_name,
  category: backendDoc.category || 'department',
  fileUrl: backendDoc.storage_path,
  fileSize: backendDoc.file_size,
  fileType: backendDoc.file_type,
  uploadedBy: backendDoc.uploaded_by || 'Unknown',
  uploadedAt: backendDoc.created_at,
  relatedEntityId: backendDoc.entity_id,
  description: backendDoc.description,
});

// Helper function to map activity types
const mapActivityType = (activityType: string): 'upload' | 'update' | 'schedule' => {
  const type = activityType.toLowerCase();
  if (type.includes('create') || type.includes('upload')) return 'upload';
  if (type.includes('schedule')) return 'schedule';
  return 'update';
};

// ============================================================================
// Dashboard
// ============================================================================

export const getDashboardStats = async (): Promise<SecretaryDashboardStats> => {
  const response = await api.get(`${BASE_URL}/dashboard`);
  const backendData = response.data.data;
  
  return {
    pendingDocuments: backendData.stats?.pending_changes || 0,
    completedToday: backendData.stats?.total_events || 0,
    scheduledEntries: backendData.stats?.total_students || 0,
    uploadedFiles: backendData.stats?.total_research || 0,
    recentActivities: (backendData.recent_activities || []).map((activity: any) => ({
      id: activity.entity_id || String(Math.random()),
      description: `${activity.activity_type} ${activity.entity_type}`,
      timestamp: activity.timestamp,
      type: mapActivityType(activity.activity_type),
    })),
  };
};

// ============================================================================
// Student Records
// ============================================================================

export const getStudents = async (params: any): Promise<PaginatedResponse<StudentRecord>> => {
  // Backend expects flat query parameters
  // Extract and pass all parameters directly
  const queryParams: any = {
    page: params.page || 1,
    limit: params.limit || 10,
  };
  
  // Add all other parameters if they exist
  if (params.search) queryParams.search = params.search;
  if (params.status) queryParams.status = params.status;
  if (params.program) queryParams.program = params.program;
  if (params.year_level !== undefined) queryParams.year_level = params.year_level;
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
  
  console.log('Secretary service sending query params:', queryParams);
  
  const response = await api.get(`${BASE_URL}/students`, { params: queryParams });
  const backendData = response.data;
  
  return {
    data: (backendData.data || []).map(transformStudent),
    pagination: {
      currentPage: backendData.meta?.page || 1,
      totalPages: backendData.meta?.totalPages || 1,
      totalItems: backendData.meta?.total || 0,
      itemsPerPage: backendData.meta?.limit || 10,
    },
  };
};

export const getStudentById = async (id: string): Promise<StudentRecord> => {
  const response = await api.get(`${BASE_URL}/students/${id}`);
  return transformStudent(response.data.data || response.data);
};

export const createStudent = async (data: StudentRecordInput): Promise<StudentRecord> => {
  // Transform frontend data to backend format
  const backendData = {
    student_id: data.studentId,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    program: data.program,
    year_level: data.yearLevel,
    status: data.status,
  };
  
  const response = await api.post(`${BASE_URL}/students`, backendData);
  return transformStudent(response.data.data || response.data);
};

export const updateStudent = async (id: string, data: Partial<StudentRecordInput>): Promise<StudentRecord> => {
  // Transform frontend data to backend format
  const backendData: any = {};
  if (data.studentId) backendData.student_id = data.studentId;
  if (data.firstName) backendData.first_name = data.firstName;
  if (data.lastName) backendData.last_name = data.lastName;
  if (data.email) backendData.email = data.email;
  if (data.program) backendData.program = data.program;
  if (data.yearLevel) backendData.year_level = data.yearLevel;
  if (data.status) backendData.status = data.status;
  
  const response = await api.put(`${BASE_URL}/students/${id}`, backendData);
  return transformStudent(response.data.data || response.data);
};

export const deleteStudent = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/students/${id}`);
};

// ============================================================================
// Faculty Records
// ============================================================================

export const getFaculty = async (params: PaginationParams): Promise<PaginatedResponse<FacultyRecord>> => {
  const response = await api.get(`${BASE_URL}/faculty`, { params });
  const backendData = response.data;
  
  return {
    data: (backendData.data || []).map(transformFaculty),
    pagination: {
      currentPage: backendData.meta?.page || 1,
      totalPages: backendData.meta?.totalPages || 1,
      totalItems: backendData.meta?.total || 0,
      itemsPerPage: backendData.meta?.limit || 10,
    },
  };
};

export const getFacultyById = async (id: string): Promise<FacultyRecord> => {
  const response = await api.get(`${BASE_URL}/faculty/${id}`);
  return transformFaculty(response.data.data || response.data);
};

export const createFaculty = async (data: FacultyRecordInput): Promise<FacultyRecord> => {
  // Transform frontend data to backend format
  const backendData = {
    faculty_id: data.employeeId,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    department: data.department,
    position: data.position,
    specialization: data.specialization,
    status: data.status,
  };
  
  const response = await api.post(`${BASE_URL}/faculty`, backendData);
  return transformFaculty(response.data.data || response.data);
};

export const updateFaculty = async (id: string, data: Partial<FacultyRecordInput>): Promise<FacultyRecord> => {
  // Transform frontend data to backend format
  const backendData: any = {};
  if (data.employeeId) backendData.faculty_id = data.employeeId;
  if (data.firstName) backendData.first_name = data.firstName;
  if (data.lastName) backendData.last_name = data.lastName;
  if (data.email) backendData.email = data.email;
  if (data.department) backendData.department = data.department;
  if (data.position) backendData.position = data.position;
  if (data.specialization) backendData.specialization = data.specialization;
  if (data.status) backendData.status = data.status;
  
  const response = await api.put(`${BASE_URL}/faculty/${id}`, backendData);
  return transformFaculty(response.data.data || response.data);
};

export const deleteFaculty = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/faculty/${id}`);
};

// ============================================================================
// Class Schedules
// ============================================================================

export const getSchedules = async (params: PaginationParams): Promise<PaginatedResponse<ClassSchedule>> => {
  const response = await api.get(`${BASE_URL}/schedules`, { params });
  const backendData = response.data;
  
  return {
    data: (backendData.data || []).map(transformSchedule),
    pagination: {
      currentPage: backendData.meta?.page || 1,
      totalPages: backendData.meta?.totalPages || 1,
      totalItems: backendData.meta?.total || 0,
      itemsPerPage: backendData.meta?.limit || 10,
    },
  };
};

export const getScheduleById = async (id: string): Promise<ClassSchedule> => {
  const response = await api.get(`${BASE_URL}/schedules/${id}`);
  return transformSchedule(response.data.data || response.data);
};

export const createSchedule = async (data: ClassScheduleInput): Promise<ClassSchedule> => {
  const response = await api.post(`${BASE_URL}/schedules`, data);
  return transformSchedule(response.data.data || response.data);
};

export const updateSchedule = async (id: string, data: Partial<ClassScheduleInput>): Promise<ClassSchedule> => {
  const response = await api.put(`${BASE_URL}/schedules/${id}`, data);
  return transformSchedule(response.data.data || response.data);
};

export const deleteSchedule = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/schedules/${id}`);
};

// ============================================================================
// Documents
// ============================================================================

export const getDocuments = async (params: PaginationParams & { category?: string }): Promise<PaginatedResponse<Document>> => {
  const response = await api.get(`${BASE_URL}/documents`, { params });
  const backendData = response.data;
  
  return {
    data: (backendData.data || []).map(transformDocument),
    pagination: {
      currentPage: backendData.meta?.page || 1,
      totalPages: backendData.meta?.totalPages || 1,
      totalItems: backendData.meta?.total || 0,
      itemsPerPage: backendData.meta?.limit || 10,
    },
  };
};

export const getDocumentById = async (id: string): Promise<Document> => {
  const response = await api.get(`${BASE_URL}/documents/${id}`);
  return transformDocument(response.data.data || response.data);
};

export const uploadDocument = async (data: DocumentUpload): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('category', data.category);
  if (data.relatedEntityId) {
    formData.append('entity_id', data.relatedEntityId);
  }
  if (data.description) {
    formData.append('description', data.description);
  }

  const response = await api.post(`${BASE_URL}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return transformDocument(response.data.data || response.data);
};

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/documents/${id}`);
};

export const downloadDocument = async (id: string): Promise<Blob> => {
  const response = await api.get(`${BASE_URL}/documents/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

// Reports
export const generateReport = async (config: ReportConfig): Promise<Blob> => {
  const response = await api.post(`${BASE_URL}/reports/generate`, config, {
    responseType: 'blob',
  });
  return response.data;
};

export const getReportHistory = async (): Promise<any[]> => {
  const response = await api.get(`${BASE_URL}/reports/history`);
  return response.data;
};

export const exportReportPDF = async (params: {
  type: string;
  search?: string;
  status?: string;
}): Promise<Blob> => {
  const response = await api.post(`${BASE_URL}/reports/export-pdf`, params, {
    responseType: 'blob',
  });
  return response.data;
};

// Filter Options
export const getPrograms = async (): Promise<string[]> => {
  const response = await api.get(`${BASE_URL}/filters/programs`);
  return response.data;
};

export const getDepartments = async (): Promise<string[]> => {
  const response = await api.get(`${BASE_URL}/filters/departments`);
  return response.data;
};

export const getInstructors = async (): Promise<Array<{ id: string; name: string }>> => {
  const response = await api.get(`${BASE_URL}/filters/instructors`);
  return response.data;
};

// ============================================================================
// Events
// ============================================================================

export const getEvents = async (params: PaginationParams): Promise<PaginatedResponse<Event>> => {
  const response = await api.get(`${BASE_URL}/events`, { params });
  const backendData = response.data;
  
  return {
    data: (backendData.data || []).map(transformEvent),
    pagination: {
      currentPage: backendData.meta?.page || 1,
      totalPages: backendData.meta?.totalPages || 1,
      totalItems: backendData.meta?.total || 0,
      itemsPerPage: backendData.meta?.limit || 10,
    },
  };
};

export const getEventById = async (id: string): Promise<Event> => {
  const response = await api.get(`${BASE_URL}/events/${id}`);
  return transformEvent(response.data.data || response.data);
};

export const createEvent = async (data: EventInput): Promise<Event> => {
  // Transform frontend data to backend format
  const backendData = {
    event_name: data.title,
    description: data.description,
    event_type: data.eventType,
    event_date: data.startDate,
    location: data.location,
    organizer: data.organizer,
    max_participants: data.maxParticipants,
  };
  
  const response = await api.post(`${BASE_URL}/events`, backendData);
  return transformEvent(response.data.data || response.data);
};

export const updateEvent = async (id: string, data: Partial<EventInput>): Promise<Event> => {
  // Transform frontend data to backend format
  const backendData: any = {};
  if (data.title) backendData.event_name = data.title;
  if (data.description) backendData.description = data.description;
  if (data.eventType) backendData.event_type = data.eventType;
  if (data.startDate) backendData.event_date = data.startDate;
  if (data.location) backendData.location = data.location;
  if (data.organizer) backendData.organizer = data.organizer;
  if (data.maxParticipants) backendData.max_participants = data.maxParticipants;
  
  const response = await api.put(`${BASE_URL}/events/${id}`, backendData);
  return transformEvent(response.data.data || response.data);
};

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/events/${id}`);
};

export const submitEventForApproval = async (id: string): Promise<Event> => {
  const response = await api.post(`${BASE_URL}/events/${id}/submit`);
  return transformEvent(response.data.data || response.data);
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
