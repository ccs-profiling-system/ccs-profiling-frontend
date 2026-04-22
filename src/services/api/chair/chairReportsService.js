import api from '../axios';
class ChairReportsService {
    async getAnalytics() {
        const response = await api.get('/chair/reports/analytics');
        return response.data.data || response.data;
    }
    async exportPDF(reportType, filters) {
        const response = await api.get('/chair/reports/export/pdf', {
            params: { reportType, ...filters },
            responseType: 'blob',
        });
        return response.data;
    }
    async exportExcel(reportType, filters) {
        const response = await api.get('/chair/reports/export/excel', {
            params: { reportType, ...filters },
            responseType: 'blob',
        });
        return response.data;
    }
    async getCustomReport(params) {
        const response = await api.get('/chair/reports/custom', { params });
        return response.data.data || response.data;
    }
}
export default new ChairReportsService();
