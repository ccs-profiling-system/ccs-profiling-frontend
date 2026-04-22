import axios from 'axios';
import api from './axios';
class FacultyPortalService {
    getAuthHeader() {
        const token = localStorage.getItem('facultyToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
    // ── Auth ──────────────────────────────────────────────────────────────────
    async login(email, password) {
        try {
            const response = await api.post('/v1/auth/login', { email, password });
            const d = response.data?.data ?? response.data;
            // Backend returns nested tokens: data.tokens.access.token
            const token = d?.tokens?.access?.token ?? d?.token;
            const user = d?.user ?? {};
            return {
                token,
                user: this.mapProfile(user),
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                // Only fall back to mock if backend is unreachable (no response)
                // If backend responded with 4xx, surface the real error
                if (!error.response) {
                    console.warn('Backend unavailable, using mock login');
                    return {
                        token: 'mock-faculty-token',
                        user: {
                            id: '1', facultyId: 'FAC-001', firstName: 'Maria', lastName: 'Garcia',
                            email, department: 'Computer Science', position: 'Associate Professor',
                            specialization: 'Artificial Intelligence', status: 'active',
                        },
                    };
                }
                const message = error.response.data?.error?.message
                    || error.response.data?.message
                    || 'Invalid email or password';
                throw new Error(message);
            }
            throw error;
        }
    }
    // ── Profile ───────────────────────────────────────────────────────────────
    async getProfile() {
        try {
            const response = await api.get('/faculty/profile', { headers: this.getAuthHeader() });
            return this.mapProfile(response.data.data ?? response.data);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock profile');
                const cached = localStorage.getItem('faculty');
                if (cached)
                    return JSON.parse(cached);
                return {
                    id: '1', facultyId: 'FAC-001', firstName: 'Maria', lastName: 'Garcia',
                    email: 'maria@ccs.edu.ph', department: 'Computer Science',
                    position: 'Associate Professor', specialization: 'Artificial Intelligence', status: 'active',
                };
            }
            throw error;
        }
    }
    async updateProfile(_facultyId, data) {
        try {
            const response = await api.put('/faculty/profile', {
                email: data.email,
                specialization: data.specialization,
                // Map frontend fields to backend-accepted fields
                ...(data.position && { office_location: data.position }),
            }, { headers: this.getAuthHeader() });
            return this.mapProfile(response.data.data ?? response.data);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock updateProfile');
                return { id: _facultyId, facultyId: _facultyId, ...data, status: 'active' };
            }
            throw error;
        }
    }
    mapProfile(raw) {
        return {
            id: raw.id,
            facultyId: raw.facultyId ?? raw.faculty_id,
            firstName: raw.firstName ?? raw.first_name,
            lastName: raw.lastName ?? raw.last_name,
            email: raw.email,
            department: raw.department,
            position: raw.position ?? raw.office_location,
            specialization: raw.specialization,
            status: raw.status ?? 'active',
        };
    }
    // ── Courses & Teaching Load ───────────────────────────────────────────────
    async getCourses(_facultyId) {
        try {
            const response = await api.get('/faculty/courses', { headers: this.getAuthHeader() });
            return (response.data.data ?? []).map(this.mapCourse).filter((course, index, self) => index === self.findIndex((c) => c.subjectId === course.subjectId));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock courses');
                return [
                    { subjectId: 'subj-1', subjectCode: 'CS101', subjectName: 'Introduction to Programming', section: 'A', semester: '1st', year: 2024, schedule: 'MWF 8:00-9:00 AM' },
                    { subjectId: 'subj-2', subjectCode: 'CS201', subjectName: 'Data Structures', section: 'B', semester: '1st', year: 2024, schedule: 'TTh 10:00-11:30 AM' },
                ];
            }
            throw error;
        }
    }
    async getTeachingLoad(_facultyId) {
        try {
            const response = await api.get('/faculty/teaching-load', { headers: this.getAuthHeader() });
            const d = response.data.data ?? response.data;
            return {
                totalUnits: d.total_units ?? d.totalUnits ?? 0,
                totalClasses: d.total_courses ?? d.totalClasses ?? 0,
                currentSemester: d.academic_year
                    ? `${d.semester ?? ''} ${d.academic_year}`.trim()
                    : d.currentSemester ?? '',
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock teaching load');
                return { totalUnits: 18, totalClasses: 3, currentSemester: '1st Semester 2024-2025' };
            }
            throw error;
        }
    }
    mapCourse(raw) {
        return {
            subjectId: raw.id ?? raw.subjectId,
            subjectCode: raw.subject_code ?? raw.subjectCode,
            subjectName: raw.subject_name ?? raw.subjectName,
            section: raw.section,
            semester: raw.semester,
            year: raw.academic_year ? parseInt(raw.academic_year.split('-')[0]) : raw.year,
            schedule: raw.schedule,
        };
    }
    // ── Class Roster ──────────────────────────────────────────────────────────
    async getRoster(_facultyId, subjectId) {
        try {
            const response = await api.get(`/faculty/courses/${subjectId}/roster`, { headers: this.getAuthHeader() });
            return (response.data.data ?? []).map((s) => ({
                id: s.student_id ?? s.id,
                studentId: s.student_number ?? s.studentId,
                firstName: s.first_name ?? s.firstName,
                lastName: s.last_name ?? s.lastName,
                program: s.program ?? '',
                yearLevel: s.year_level ?? s.yearLevel ?? 1,
                section: s.section ?? '',
            }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock roster');
                return [
                    { id: 'stu-1', studentId: 'CS-001', firstName: 'John', lastName: 'Doe', program: 'BS Computer Science', yearLevel: 2, section: 'A' },
                    { id: 'stu-2', studentId: 'CS-002', firstName: 'Jane', lastName: 'Smith', program: 'BS Information Technology', yearLevel: 2, section: 'A' },
                ];
            }
            throw error;
        }
    }
    // ── Attendance ────────────────────────────────────────────────────────────
    async getAttendance(courseId, date) {
        try {
            const response = await api.get(`/faculty/courses/${courseId}/attendance`, { params: { date }, headers: this.getAuthHeader() });
            return (response.data.data ?? []).map((r) => ({
                studentId: r.student_number ?? r.studentId ?? r.student_id,
                status: r.status,
            }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock attendance');
                return [];
            }
            throw error;
        }
    }
    async submitAttendance(payload) {
        try {
            await api.post(`/faculty/courses/${payload.courseId}/attendance`, {
                date: payload.date,
                attendance_records: payload.records.map((r) => ({
                    student_id: r.studentId,
                    status: r.status,
                })),
            }, { headers: this.getAuthHeader() });
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, skipping attendance submission');
                return;
            }
            throw error;
        }
    }
    // ── Research ──────────────────────────────────────────────────────────────
    async getResearchProjects(_facultyId) {
        try {
            const response = await api.get('/faculty/research', { headers: this.getAuthHeader() });
            return (response.data.data ?? []).map(this.mapResearch);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock research projects');
                return [{ id: 'res-1', title: 'AI-Assisted Learning Systems', description: 'Research on applying machine learning to adaptive educational platforms.', status: 'ongoing', role: 'Principal Investigator' }];
            }
            throw error;
        }
    }
    async createResearchProject(_facultyId, data) {
        try {
            const response = await api.post('/faculty/research', {
                title: data.title,
                description: data.description,
                research_type: 'thesis',
                status: data.status === 'proposed' ? 'draft' : data.status,
            }, { headers: this.getAuthHeader() });
            return this.mapResearch(response.data.data ?? response.data);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock createResearchProject');
                return { id: `res-${Date.now()}`, title: data.title, description: data.description, status: data.status, role: data.role };
            }
            throw error;
        }
    }
    async updateResearchProject(_facultyId, projectId, data) {
        try {
            const response = await api.put(`/faculty/research/${projectId}`, {
                title: data.title,
                description: data.description,
                status: data.status === 'proposed' ? 'draft' : data.status,
            }, { headers: this.getAuthHeader() });
            return this.mapResearch(response.data.data ?? response.data);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock updateResearchProject');
                return { id: projectId, title: data.title, description: data.description, status: data.status, role: data.role };
            }
            throw error;
        }
    }
    mapResearch(raw) {
        // Determine faculty's role from advisers array if present
        const adviserRole = raw.advisers?.[0]?.adviser_role ?? raw.role ?? 'researcher';
        return {
            id: raw.id,
            title: raw.title,
            description: raw.description,
            status: raw.status === 'draft' ? 'proposed' : raw.status,
            role: adviserRole,
        };
    }
    // ── Events ────────────────────────────────────────────────────────────────
    async getEvents() {
        try {
            const response = await api.get('/faculty/events', { headers: this.getAuthHeader() });
            return (response.data.data ?? []).map(this.mapEvent).filter((event, index, self) => index === self.findIndex((e) => e.id === event.id));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock events');
                return [{ id: 'evt-1', title: 'Faculty Development Seminar', date: '2024-08-15', startTime: '09:00', endTime: '12:00', location: 'CCS Auditorium', category: 'Seminar', status: 'upcoming', description: 'Annual faculty development and training seminar.' }];
            }
            throw error;
        }
    }
    async getMyParticipation() {
        try {
            const response = await api.get('/faculty/events/my-participation', { headers: this.getAuthHeader() });
            return (response.data.data ?? []).map((p) => ({
                id: p.event_id ?? p.id,
                eventId: p.event_id ?? p.eventId,
                eventTitle: p.event_name ?? p.eventTitle,
                eventDate: p.event_date ?? p.eventDate,
                status: p.attendance_status ?? p.status ?? 'registered',
            }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock getMyParticipation');
                return [];
            }
            throw error;
        }
    }
    async registerEventParticipation(eventId) {
        try {
            const response = await api.post(`/faculty/events/${eventId}/register`, {}, { headers: this.getAuthHeader() });
            const d = response.data.data ?? response.data;
            return {
                id: d.event_id ?? d.id ?? `part-${Date.now()}`,
                eventId: d.event_id ?? eventId,
                eventTitle: d.event_name ?? d.eventTitle ?? '',
                eventDate: d.event_date ?? d.eventDate ?? new Date().toISOString(),
                status: d.attendance_status ?? d.status ?? 'registered',
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock registerEventParticipation');
                return { id: `part-${Date.now()}`, eventId, eventTitle: '', eventDate: new Date().toISOString(), status: 'registered' };
            }
            throw error;
        }
    }
    mapEvent(raw) {
        // Backend returns event_date, event_type; frontend expects date, category, status
        const eventDate = raw.event_date ?? raw.date ?? '';
        const now = new Date().toISOString().split('T')[0];
        let status = raw.status ?? 'upcoming';
        if (!raw.status) {
            status = eventDate >= now ? 'upcoming' : 'completed';
        }
        return {
            id: raw.id,
            title: raw.title,
            date: eventDate,
            startTime: raw.startTime ?? raw.start_time ?? '',
            endTime: raw.endTime ?? raw.end_time ?? '',
            location: raw.location ?? '',
            category: raw.event_type ?? raw.category ?? '',
            status,
            description: raw.description,
        };
    }
    // ── Materials ─────────────────────────────────────────────────────────────
    async getMaterials(courseId) {
        try {
            const response = await api.get(`/faculty/courses/${courseId}/materials`, { headers: this.getAuthHeader() });
            return (response.data.data ?? []).map((m) => ({
                id: m.id,
                fileName: m.file_name ?? m.fileName,
                fileType: m.file_type ?? m.fileType,
                uploadDate: m.uploaded_at ?? m.uploadDate,
                downloadUrl: m.download_url ?? m.downloadUrl ?? '',
            }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock getMaterials');
                return [];
            }
            throw error;
        }
    }
    async uploadMaterial(courseId, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post(`/faculty/courses/${courseId}/materials`, formData, { headers: { ...this.getAuthHeader(), 'Content-Type': 'multipart/form-data' } });
            const d = response.data.data ?? response.data;
            return {
                id: d.id,
                fileName: d.file_name ?? d.fileName ?? file.name,
                fileType: d.file_type ?? d.fileType ?? file.type,
                uploadDate: d.uploaded_at ?? d.uploadDate ?? new Date().toISOString(),
                downloadUrl: d.download_url ?? d.downloadUrl ?? '',
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock uploadMaterial');
                return { id: `mat-${Date.now()}`, fileName: file.name, fileType: file.type, uploadDate: new Date().toISOString(), downloadUrl: '' };
            }
            throw error;
        }
    }
    async deleteMaterial(courseId, materialId) {
        try {
            await api.delete(`/faculty/courses/${courseId}/materials/${materialId}`, {
                headers: this.getAuthHeader(),
            });
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, skipping deleteMaterial');
                return;
            }
            throw error;
        }
    }
    // ── Skills ────────────────────────────────────────────────────────────────
    async getSkills() {
        try {
            const response = await api.get('/faculty/profile/skills', { headers: this.getAuthHeader() });
            return (response.data.data ?? []).map((s) => ({
                skillName: s.skillName ?? s.skill_name,
                category: s.category ?? 'technical',
                proficiencyLevel: s.proficiencyLevel ?? s.proficiency_level ?? 'intermediate',
            }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock getSkills');
                return [];
            }
            throw error;
        }
    }
    async updateSkills(skills) {
        try {
            const response = await api.put('/faculty/profile/skills', { skills: skills.map((s) => ({ skillName: s.skillName, category: s.category, proficiencyLevel: s.proficiencyLevel })) }, { headers: this.getAuthHeader() });
            return (response.data.data ?? skills).map((s) => ({
                skillName: s.skillName ?? s.skill_name,
                category: s.category ?? 'technical',
                proficiencyLevel: s.proficiencyLevel ?? s.proficiency_level ?? 'intermediate',
            }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock updateSkills');
                return skills;
            }
            throw error;
        }
    }
    // ── Affiliations ──────────────────────────────────────────────────────────
    async getAffiliations() {
        try {
            const response = await api.get('/faculty/profile/affiliations', { headers: this.getAuthHeader() });
            return (response.data.data ?? []).map((a) => ({
                organizationName: a.organizationName ?? a.organization_name,
                type: a.type ?? 'other',
                role: a.role,
                joinDate: a.joinDate ?? a.join_date ?? a.start_date ?? '',
            }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock getAffiliations');
                return [];
            }
            throw error;
        }
    }
    async updateAffiliations(affiliations) {
        try {
            const response = await api.put('/faculty/profile/affiliations', {
                affiliations: affiliations.map((a) => ({
                    organizationName: a.organizationName,
                    type: a.type,
                    role: a.role,
                    joinDate: a.joinDate,
                })),
            }, { headers: this.getAuthHeader() });
            return (response.data.data ?? affiliations).map((a) => ({
                organizationName: a.organizationName ?? a.organization_name,
                type: a.type ?? 'other',
                role: a.role,
                joinDate: a.joinDate ?? a.join_date ?? a.start_date ?? '',
            }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock updateAffiliations');
                return affiliations;
            }
            throw error;
        }
    }
    // ── Student Participation ─────────────────────────────────────────────────
    async getParticipation(subjectId, date) {
        try {
            const response = await api.get(`/faculty/courses/${subjectId}/participation`, { params: date ? { date } : {}, headers: this.getAuthHeader() });
            return (response.data.data ?? []).map((r) => ({
                studentId: r.student_number ?? r.studentId ?? r.student_id,
                firstName: r.student_name?.split(' ')[0] ?? r.firstName ?? '',
                lastName: r.student_name?.split(' ').slice(1).join(' ') ?? r.lastName ?? '',
                participationScore: r.participation_score ?? r.participationScore ?? 3,
                remarks: r.remarks ?? '',
                date: r.date ?? date ?? '',
            }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, using mock getParticipation');
                return [];
            }
            throw error;
        }
    }
    async submitParticipation(subjectId, payload) {
        try {
            await api.post(`/faculty/courses/${subjectId}/participation`, {
                date: payload.date,
                records: payload.records.map((r) => ({
                    studentId: r.studentId,
                    participationScore: r.participationScore,
                    remarks: r.remarks,
                })),
            }, { headers: this.getAuthHeader() });
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.warn('Backend unavailable, skipping submitParticipation');
                return;
            }
            throw error;
        }
    }
}
export default new FacultyPortalService();
