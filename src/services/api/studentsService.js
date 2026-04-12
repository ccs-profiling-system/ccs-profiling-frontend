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
            const msg = error.response?.data?.message ?? 'Network error — please check your connection';
            throw new Error(msg);
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
                const msg = error.response?.data?.message ?? 'Network error — please check your connection';
                throw new Error(msg);
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
                const msg = error.response?.data?.message ?? 'Network error — please check your connection';
                throw new Error(msg);
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
                const msg = error.response?.data?.message ?? 'Network error — please check your connection';
                throw new Error(msg);
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
        return handleRequest(() => api.get(`/admin/students/${studentId}/activities`).then((r) => r.data));
    }
    async getStudentViolations(studentId) {
        return handleRequest(() => api.get(`/admin/students/${studentId}/violations`).then((r) => unwrap(r.data)));
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
                const msg = error.response?.data?.message ?? 'Network error — please check your connection';
                throw new Error(msg);
            }
            throw error;
        }
    }
    async resolveStudentViolation(violationId, resolutionNotes) {
        return handleRequest(() => api.patch(`/admin/violations/${violationId}/resolve`, { resolution_notes: resolutionNotes })
            .then((r) => unwrap(r.data)));
    }
    async getStudentSkills(studentId) {
        return handleRequest(() => api.get(`/admin/students/${studentId}/skills`)
            .then((r) => unwrap(r.data).map(mapSkill)));
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
            console.error('Error fetching all skills:', error);
            if (axios.isAxiosError(error)) {
                const msg = error.response?.data?.message ?? 'Network error';
                throw new Error(msg);
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
                const msg = error.response?.data?.message ?? 'Network error — please check your connection';
                throw new Error(msg);
            }
            throw error;
        }
    }
    async getStudentAffiliations(studentId) {
        return handleRequest(() => api.get(`/admin/students/${studentId}/affiliations`)
            .then((r) => unwrap(r.data).map(mapAffiliation)));
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
                const msg = error.response?.data?.message ?? 'Network error — please check your connection';
                throw new Error(msg);
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
