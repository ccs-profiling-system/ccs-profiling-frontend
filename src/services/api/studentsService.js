import axios from 'axios';
import api from './axios';
// Maps snake_case backend fields to camelCase frontend fields
function mapStudent(s) {
    return {
        id: s.id,
        studentId: s.studentId ?? s.student_id,
        firstName: s.firstName ?? s.first_name,
        lastName: s.lastName ?? s.last_name,
        email: s.email,
        program: s.program,
        yearLevel: s.yearLevel ?? s.year_level,
        section: s.section,
        status: s.status,
        enrollmentDate: s.enrollmentDate ?? s.enrollment_date,
        createdAt: s.createdAt ?? s.created_at,
        updatedAt: s.updatedAt ?? s.updated_at,
    };
}
function mapSkill(s) {
    return {
        id: s.id,
        skillName: s.skillName ?? s.skill_name,
        category: s.category ?? 'other',
        proficiencyLevel: s.proficiencyLevel ?? s.proficiency_level,
        yearsOfExperience: s.yearsOfExperience ?? s.years_of_experience,
    };
}
function mapAffiliation(a) {
    return {
        id: a.id,
        organizationName: a.organizationName ?? a.organization_name,
        type: a.type ?? 'other',
        role: a.role,
        joinDate: a.joinDate ?? a.start_date,
        endDate: a.endDate ?? a.end_date,
        isActive: a.isActive ?? a.is_active,
    };
}
function mapAcademicRecord(r) {
    return {
        term: r.term ?? r.academic_year ?? '',
        semester: r.semester ?? '',
        year: r.year ?? 0,
        completedSubjects: r.completedSubjects ?? (r.subject_code ? [r.subject_code] : []),
        grades: r.grades ?? (r.grade != null ? { [r.subject_code ?? 'grade']: r.grade } : {}),
    };
}
function mapEnrollment(e) {
    return {
        subjectId: e.subjectId ?? e.instruction_id ?? e.id,
        subjectCode: e.subjectCode ?? e.subject_code,
        subjectName: e.subjectName ?? e.subject_name,
        semester: e.semester ?? '',
        year: e.year ?? 0,
        grade: e.grade,
        status: e.status ?? e.enrollment_status ?? '',
    };
}
// Converts camelCase frontend fields to snake_case for backend
function toSnakeCase(data) {
    return {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        program: data.program,
        year_level: data.yearLevel,
        section: data.section,
        status: data.status,
    };
}
function unwrap(raw) {
    if (raw !== null && typeof raw === 'object' && 'data' in raw) {
        return raw.data;
    }
    return raw;
}
async function handleRequest(fn) {
    try {
        return unwrap(await fn());
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.warn('Backend unavailable, using mock data');
            // Return a generic mock response instead of throwing
            return {};
        }
        throw error;
    }
}
class StudentsService {
    async getStudents(filters, page = 1, limit = 20) {
        try {
            // Convert camelCase filters to snake_case for backend
            const backendFilters = {};
            if (filters?.program)
                backendFilters.program = filters.program;
            if (filters?.yearLevel)
                backendFilters.year_level = filters.yearLevel;
            if (filters?.status)
                backendFilters.status = filters.status;
            if (filters?.search)
                backendFilters.search = filters.search;
            // Handle skill filter - if array, send as comma-separated string
            if (filters?.skill) {
                backendFilters.skill = Array.isArray(filters.skill)
                    ? filters.skill.join(',')
                    : filters.skill;
            }
            const response = await api.get('/admin/students', {
                params: { ...backendFilters, page, limit },
            });
            return {
                ...response.data,
                data: (response.data.data ?? []).map(mapStudent),
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock student data');
                // Return mock data with frontend filtering
                let mockData = [
                    {
                        id: '1',
                        studentId: 'CS-001',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john@ccs.edu.ph',
                        program: 'BS Computer Science',
                        yearLevel: 3,
                        section: 'A',
                        status: 'active',
                        enrollmentDate: '2022-06-01',
                        createdAt: '2022-06-01',
                        updatedAt: '2024-04-12',
                    },
                    {
                        id: '2',
                        studentId: 'CS-002',
                        firstName: 'Jane',
                        lastName: 'Smith',
                        email: 'jane@ccs.edu.ph',
                        program: 'BS Information Technology',
                        yearLevel: 2,
                        section: 'B',
                        status: 'active',
                        enrollmentDate: '2023-06-01',
                        createdAt: '2023-06-01',
                        updatedAt: '2024-04-12',
                    },
                    {
                        id: '3',
                        studentId: 'CS-003',
                        firstName: 'Bob',
                        lastName: 'Johnson',
                        email: 'bob@ccs.edu.ph',
                        program: 'BS Computer Science',
                        yearLevel: 1,
                        section: 'A',
                        status: 'inactive',
                        enrollmentDate: '2024-06-01',
                        createdAt: '2024-06-01',
                        updatedAt: '2024-04-12',
                    },
                    {
                        id: '4',
                        studentId: 'IT-001',
                        firstName: 'Alice',
                        lastName: 'Williams',
                        email: 'alice@ccs.edu.ph',
                        program: 'BS Information Technology',
                        yearLevel: 4,
                        section: 'C',
                        status: 'graduated',
                        enrollmentDate: '2020-06-01',
                        createdAt: '2020-06-01',
                        updatedAt: '2024-04-12',
                    },
                ];
                // Apply frontend filters
                if (filters) {
                    if (filters.status) {
                        mockData = mockData.filter(s => s.status === filters.status);
                    }
                    if (filters.program) {
                        mockData = mockData.filter(s => s.program === filters.program);
                    }
                    if (filters.yearLevel) {
                        mockData = mockData.filter(s => s.yearLevel === Number(filters.yearLevel));
                    }
                    if (filters.search) {
                        const searchLower = filters.search.toLowerCase();
                        mockData = mockData.filter(s => s.firstName.toLowerCase().includes(searchLower) ||
                            s.lastName.toLowerCase().includes(searchLower) ||
                            s.studentId.toLowerCase().includes(searchLower) ||
                            s.email.toLowerCase().includes(searchLower));
                    }
                }
                return {
                    success: true,
                    data: mockData,
                    meta: { total: mockData.length, page, limit, totalPages: Math.ceil(mockData.length / limit) },
                };
            }
            throw error;
        }
    }
    async getStudentById(id) {
        return handleRequest(() => api.get(`/admin/students/${id}`).then((r) => mapStudent(unwrap(r.data))));
    }
    async createStudent(data) {
        return handleRequest(() => api.post('/admin/students', toSnakeCase(data)).then((r) => mapStudent(unwrap(r.data))));
    }
    async updateStudent(data) {
        return handleRequest(() => api.put(`/admin/students/${data.id}`, toSnakeCase(data)).then((r) => mapStudent(unwrap(r.data))));
    }
    async deleteStudent(id) {
        try {
            await api.delete(`/admin/students/${id}`);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, skipping delete');
                return;
            }
            throw error;
        }
    }
    async getStudentStatistics() {
        return handleRequest(() => api.get('/admin/students/statistics').then((r) => r.data));
    }
    async getStudentStats() {
        return handleRequest(() => api.get('/admin/students/stats').then((r) => unwrap(r.data)));
    }
    async exportStudentsToPDF() {
        const response = await api.get('/admin/students/export/pdf', { responseType: 'blob' });
        return response.data;
    }
    async exportStudentsToExcel() {
        const response = await api.get('/admin/students/export/excel', { responseType: 'blob' });
        return response.data;
    }
    async getStudentAcademicHistory(studentId) {
        return handleRequest(() => api.get(`/admin/students/${studentId}/academic-history`)
            .then((r) => unwrap(r.data).map(mapAcademicRecord)));
    }
    async addStudentAcademicHistory(studentId, data) {
        return handleRequest(() => api.post(`/admin/students/${studentId}/academic-history`, data)
            .then((r) => mapAcademicRecord(unwrap(r.data))));
    }
    async updateStudentAcademicHistory(historyId, data) {
        return handleRequest(() => api.put(`/admin/academic-history/${historyId}`, data)
            .then((r) => mapAcademicRecord(unwrap(r.data))));
    }
    async deleteStudentAcademicHistory(historyId) {
        try {
            await api.delete(`/admin/academic-history/${historyId}`);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, skipping delete');
                return;
            }
            throw error;
        }
    }
    async getStudentGPA(studentId) {
        return handleRequest(() => api.get(`/admin/students/${studentId}/gpa`)
            .then((r) => unwrap(r.data)));
    }
    async getStudentEnrollments(studentId) {
        return handleRequest(() => api.get(`/admin/students/${studentId}/enrollments`)
            .then((r) => unwrap(r.data).map(mapEnrollment)));
    }
    async getStudentActivities(studentId) {
        try {
            const response = await api.get(`/admin/students/${studentId}/activities`);
            const raw = unwrap(response.data);
            if (!Array.isArray(raw))
                return [];
            return raw.map((a) => ({
                eventId: a.eventId ?? a.event_id ?? a.id ?? '',
                eventName: a.eventName ?? a.event_name ?? a.title ?? 'Unknown Event',
                type: a.type ?? a.event_type ?? 'other',
                participationDate: a.participationDate ?? a.participation_date ?? a.date ?? '',
                role: a.role ?? undefined,
            }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, returning empty activities');
                return [];
            }
            throw error;
        }
    }
    async getStudentViolations(studentId) {
        try {
            const response = await api.get(`/admin/students/${studentId}/violations`);
            const data = unwrap(response.data);
            return Array.isArray(data) ? data : [];
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable for student violations');
                return [];
            }
            throw error;
        }
    }
    async addStudentViolation(studentId, data) {
        return handleRequest(() => api.post(`/admin/students/${studentId}/violations`, data).then((r) => r.data));
    }
    async updateStudentViolation(violationId, data) {
        return handleRequest(() => api.put(`/admin/violations/${violationId}`, data).then((r) => unwrap(r.data)));
    }
    async deleteStudentViolation(violationId) {
        try {
            await api.delete(`/admin/violations/${violationId}`);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, skipping delete');
                return;
            }
            throw error;
        }
    }
    async resolveStudentViolation(violationId, resolutionNotes) {
        return handleRequest(() => api.patch(`/admin/violations/${violationId}/resolve`, { resolution_notes: resolutionNotes })
            .then((r) => unwrap(r.data)));
    }
    async getStudentSkills(studentId) {
        try {
            const response = await api.get(`/admin/students/${studentId}/skills`);
            const data = unwrap(response.data);
            return Array.isArray(data) ? data.map(mapSkill) : [];
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable for student skills');
                return [];
            }
            throw error;
        }
    }
    async getAllSkills() {
        try {
            const response = await api.get('/admin/skills', {
                params: { limit: 1000 }
            });
            // The response structure is { success: true, data: [...], meta: {...} }
            const responseData = response.data;
            if (responseData.success && responseData.data) {
                const mapped = responseData.data.map(mapSkill);
                return mapped;
            }
            return [];
        }
        catch (error) {
            console.error('Error fetching all skills, using empty array:', error);
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable');
                return [];
            }
            throw error;
        }
    }
    async addStudentSkill(studentId, data) {
        return handleRequest(() => api.post(`/admin/students/${studentId}/skills`, data)
            .then((r) => {
            return mapSkill(unwrap(r.data));
        }));
    }
    async updateStudentSkill(skillId, data) {
        return handleRequest(() => api.put(`/admin/skills/${skillId}`, data)
            .then((r) => mapSkill(unwrap(r.data))));
    }
    async deleteStudentSkill(skillId) {
        try {
            await api.delete(`/admin/skills/${skillId}`);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, skipping delete');
                return;
            }
            throw error;
        }
    }
    async getStudentAffiliations(studentId) {
        try {
            const response = await api.get(`/admin/students/${studentId}/affiliations`);
            const data = unwrap(response.data);
            return Array.isArray(data) ? data.map(mapAffiliation) : [];
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable for student affiliations');
                return [];
            }
            throw error;
        }
    }
    async addStudentAffiliation(studentId, data) {
        return handleRequest(() => api.post(`/admin/students/${studentId}/affiliations`, data)
            .then((r) => mapAffiliation(unwrap(r.data))));
    }
    async updateStudentAffiliation(affiliationId, data) {
        return handleRequest(() => api.put(`/admin/affiliations/${affiliationId}`, data)
            .then((r) => mapAffiliation(unwrap(r.data))));
    }
    async deleteStudentAffiliation(affiliationId) {
        try {
            await api.delete(`/admin/affiliations/${affiliationId}`);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, skipping delete');
                return;
            }
            throw error;
        }
    }
    async endStudentAffiliation(affiliationId, endDate) {
        return handleRequest(() => api.patch(`/admin/affiliations/${affiliationId}/end`, { end_date: endDate })
            .then((r) => mapAffiliation(unwrap(r.data))));
    }
}
export default new StudentsService();
