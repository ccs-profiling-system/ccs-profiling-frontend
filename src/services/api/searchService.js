import api from './axios';
const searchService = {
    /**
     * Global search across all entities
     */
    async globalSearch(query, type) {
        const params = { q: query };
        if (type)
            params.type = type;
        const response = await api.get('/v1/admin/search', { params });
        return response.data.data;
    },
    /**
     * Search students only
     */
    async searchStudents(query) {
        const response = await api.get('/v1/admin/search/students', {
            params: { q: query }
        });
        return response.data.data;
    },
    /**
     * Search faculty only
     */
    async searchFaculty(query) {
        const response = await api.get('/v1/admin/search/faculty', {
            params: { q: query }
        });
        return response.data.data;
    },
    /**
     * Search events only
     */
    async searchEvents(query) {
        const response = await api.get('/v1/admin/search/events', {
            params: { q: query }
        });
        return response.data.data;
    },
    /**
     * Search research only
     */
    async searchResearch(query) {
        const response = await api.get('/v1/admin/search/research', {
            params: { q: query }
        });
        return response.data.data;
    },
    /**
     * Convert global search results to unified SearchResult format
     */
    formatGlobalResults(results) {
        const formatted = [];
        results.students.forEach(s => {
            formatted.push({
                id: s.id,
                type: 'student',
                title: `${s.first_name} ${s.last_name}`,
                subtitle: `${s.student_id} • ${s.program || 'N/A'}`,
                metadata: s
            });
        });
        results.faculty.forEach(f => {
            formatted.push({
                id: f.id,
                type: 'faculty',
                title: `${f.first_name} ${f.last_name}`,
                subtitle: `${f.faculty_id} • ${f.department}`,
                metadata: f
            });
        });
        results.events.forEach(e => {
            formatted.push({
                id: e.id,
                type: 'event',
                title: e.event_name,
                subtitle: `${e.event_type} • ${new Date(e.event_date).toLocaleDateString()}`,
                metadata: e
            });
        });
        results.research.forEach(r => {
            formatted.push({
                id: r.id,
                type: 'research',
                title: r.title,
                subtitle: `${r.research_type} • ${r.status}`,
                metadata: r
            });
        });
        return formatted;
    }
};
export default searchService;
