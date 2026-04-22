import api from '../axios';
class ChairSchedulesService {
    async getSchedules(filters) {
        const response = await api.get('/chair/schedules', { params: filters });
        return response.data;
    }
    async getScheduleById(id) {
        const response = await api.get(`/chair/schedules/${id}`);
        return response.data.data || response.data;
    }
    async approveSchedule(id, notes) {
        const response = await api.post(`/chair/schedules/${id}/approve`, { notes });
        return response.data;
    }
    async rejectSchedule(id, notes) {
        const response = await api.post(`/chair/schedules/${id}/reject`, { notes });
        return response.data;
    }
    async getConflicts() {
        const response = await api.get('/chair/schedules/conflicts');
        return response.data.data || response.data;
    }
    async getCalendarView(params) {
        const response = await api.get('/chair/schedules/calendar', { params });
        return response.data.data || response.data;
    }
}
export default new ChairSchedulesService();
