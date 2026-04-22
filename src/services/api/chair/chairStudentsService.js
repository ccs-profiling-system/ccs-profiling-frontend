import api from '../axios';
class ChairStudentsService {
    async getStudents(filters, page = 1, limit = 20) {
        const response = await api.get('/chair/students', {
            params: { ...filters, page, limit }
        });
        return {
            data: response.data.data || response.data,
            total: response.data.total || response.data.meta?.total || (response.data.data || response.data).length,
            page: response.data.page || response.data.meta?.page || page,
            limit: response.data.limit || response.data.meta?.limit || limit,
        };
    }
    async getStudentById(id) {
        const response = await api.get(`/chair/students/${id}`);
        return response.data.data || response.data;
    }
    async approveStudent(id, notes) {
        const response = await api.post(`/chair/students/${id}/approve`, { notes });
        return response.data;
    }
    async rejectStudent(id, notes) {
        const response = await api.post(`/chair/students/${id}/reject`, { notes });
        return response.data;
    }
    async getStudentStats() {
        const response = await api.get('/chair/students/stats');
        return response.data.data || response.data;
    }
}
export default new ChairStudentsService();
