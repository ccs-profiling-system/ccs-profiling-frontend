import axios from 'axios';
import api from './axios';
// Handles both wrapped { success, data } and unwrapped direct responses
function unwrap(raw) {
    if (raw !== null && typeof raw === 'object' && 'data' in raw) {
        return raw.data;
    }
    return raw;
}
function mapFaculty(f) {
    return {
        id: f.id,
        facultyId: f.facultyId ?? f.faculty_id,
        firstName: f.firstName ?? f.first_name,
        lastName: f.lastName ?? f.last_name,
        email: f.email,
        department: f.department,
        position: f.position,
        specialization: f.specialization,
        status: f.status,
        employmentType: f.employmentType ?? f.employment_type,
        hireDate: f.hireDate ?? f.hire_date,
        createdAt: f.createdAt ?? f.created_at,
        updatedAt: f.updatedAt ?? f.updated_at,
    };
}
function mapFacultySkill(s) {
    return {
        skillName: s.skillName ?? s.skill_name,
        category: s.category ?? 'technical',
        proficiencyLevel: s.proficiencyLevel ?? s.proficiency_level,
    };
}
function mapFacultyAffiliation(a) {
    return {
        organizationName: a.organizationName ?? a.organization_name,
        type: a.type ?? 'other',
        role: a.role,
        joinDate: a.joinDate ?? a.start_date,
    };
}
function toSnakeCase(data) {
    return {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        department: data.department,
        position: data.position,
        specialization: data.specialization,
        status: data.status,
    };
}
async function handleRequest(fn) {
    try {
        return unwrap(await fn());
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.warn('Backend unavailable, using mock data');
            return {};
        }
        throw error;
    }
}
class FacultyService {
    async getFaculty(filters, page = 1, limit = 20) {
        try {
            const response = await api.get('/admin/faculty', {
                params: { ...filters, page, limit },
            });
            return {
                ...response.data,
                data: (response.data.data ?? []).map(mapFaculty),
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock faculty data');
                return {
                    success: true,
                    data: [
                        {
                            id: '1',
                            facultyId: 'FAC-001',
                            firstName: 'Dr. Maria',
                            lastName: 'Garcia',
                            email: 'maria@ccs.edu.ph',
                            department: 'Computer Science',
                            position: 'Associate Professor',
                            specialization: 'Artificial Intelligence',
                            status: 'active',
                            employmentType: 'full-time',
                            hireDate: '2015-08-01',
                            createdAt: '2015-08-01',
                            updatedAt: '2024-04-12',
                        },
                    ],
                    meta: { total: 1, page, limit, totalPages: 1 },
                };
            }
            throw error;
        }
    }
    async getFacultyById(id) {
        return handleRequest(() => api.get(`/admin/faculty/${id}`).then((r) => mapFaculty(unwrap(r.data))));
    }
    async createFaculty(data) {
        return handleRequest(() => api.post('/admin/faculty', toSnakeCase(data)).then((r) => mapFaculty(unwrap(r.data))));
    }
    async updateFaculty(data) {
        return handleRequest(() => api.put(`/admin/faculty/${data.id}`, toSnakeCase(data)).then((r) => mapFaculty(unwrap(r.data))));
    }
    async deleteFaculty(id) {
        try {
            await api.delete(`/admin/faculty/${id}`);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, skipping delete');
                return;
            }
            throw error;
        }
    }
    async getFacultyStatistics() {
        return handleRequest(() => api.get('/admin/faculty/statistics').then((r) => r.data));
    }
    async getFacultyStats() {
        return handleRequest(() => api.get('/admin/faculty/stats').then((r) => unwrap(r.data)));
    }
    async exportFacultyToPDF() {
        const response = await api.get('/admin/faculty/export/pdf', { responseType: 'blob' });
        return response.data;
    }
    async exportFacultyToExcel() {
        const response = await api.get('/admin/faculty/export/excel', { responseType: 'blob' });
        return response.data;
    }
    async getFacultySubjects(facultyId) {
        try {
            const response = await api.get(`/admin/faculty/${facultyId}/subjects`);
            const data = unwrap(response.data);
            return Array.isArray(data) ? data : [];
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable for faculty subjects');
                return [];
            }
            throw error;
        }
    }
    async getFacultySkills(facultyId) {
        try {
            const response = await api.get(`/admin/faculty/${facultyId}/skills`);
            const data = unwrap(response.data);
            return Array.isArray(data) ? data.map(mapFacultySkill) : [];
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable for faculty skills');
                return [];
            }
            throw error;
        }
    }
    async updateFacultySkills(facultyId, skills) {
        try {
            const response = await api.put(`/admin/faculty/${facultyId}/skills`, { skills });
            const data = unwrap(response.data);
            return Array.isArray(data) ? data.map(mapFacultySkill) : [];
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable for updating faculty skills');
                return [];
            }
            throw error;
        }
    }
    async getFacultyAffiliations(facultyId) {
        try {
            const response = await api.get(`/admin/faculty/${facultyId}/affiliations`);
            const data = unwrap(response.data);
            return Array.isArray(data) ? data.map(mapFacultyAffiliation) : [];
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable for faculty affiliations');
                return [];
            }
            throw error;
        }
    }
    async updateFacultyAffiliations(facultyId, affiliations) {
        try {
            const response = await api.put(`/admin/faculty/${facultyId}/affiliations`, { affiliations });
            const data = unwrap(response.data);
            return Array.isArray(data) ? data.map(mapFacultyAffiliation) : [];
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable for updating faculty affiliations');
                return [];
            }
            throw error;
        }
    }
    async getFacultyTeachingLoad(facultyId) {
        return handleRequest(() => api.get(`/admin/faculty/${facultyId}/teaching-load`).then((r) => r.data));
    }
}
export default new FacultyService();
