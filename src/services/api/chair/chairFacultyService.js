import api from '../axios';
class ChairFacultyService {
    async getFaculty(filters, page = 1, limit = 20) {
        const response = await api.get('/chair/faculty', {
            params: { ...filters, page, limit }
        });
        return {
            data: response.data.data || response.data,
            total: response.data.total || response.data.meta?.total || (response.data.data || response.data).length,
            page: response.data.page || response.data.meta?.page || page,
            limit: response.data.limit || response.data.meta?.limit || limit,
        };
    }
    async getFacultyById(id) {
        const response = await api.get(`/chair/faculty/${id}`);
        return response.data.data || response.data;
    }
    async getFacultyTeachingLoad(id) {
        const response = await api.get(`/chair/faculty/${id}/teaching-load`);
        return response.data.data || response.data;
    }
    async getFacultyStats() {
        const response = await api.get('/chair/faculty/stats');
        return response.data.data || response.data;
    }
}
export default new ChairFacultyService();
