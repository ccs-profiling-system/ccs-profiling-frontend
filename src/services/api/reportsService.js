import api from './axios';
class ReportsService {
    async generateStudentProfileReport(studentId) {
        try {
            const response = await api.post('/admin/reports/student-profile', { student_id: studentId }, { responseType: 'blob' });
            return response.data;
        }
        catch (error) {
            console.error('Error generating student profile report:', error);
            throw error;
        }
    }
    async generateFacultyProfileReport(facultyId) {
        try {
            const response = await api.post('/admin/reports/faculty-profile', { faculty_id: facultyId }, { responseType: 'blob' });
            return response.data;
        }
        catch (error) {
            console.error('Error generating faculty profile report:', error);
            throw error;
        }
    }
    async generateEnrollmentReport(params) {
        try {
            const response = await api.post('/admin/reports/enrollments', params, { responseType: 'blob' });
            return response.data;
        }
        catch (error) {
            console.error('Error generating enrollment report:', error);
            throw error;
        }
    }
    async generateAnalyticsReport(params) {
        try {
            const response = await api.post('/admin/reports/analytics', params, { responseType: 'blob' });
            return response.data;
        }
        catch (error) {
            console.error('Error generating analytics report:', error);
            throw error;
        }
    }
    async getReports(filters, page = 1, pageSize = 20) {
        try {
            const params = new URLSearchParams();
            if (filters?.module && filters.module !== 'all') {
                params.append('report_type', filters.module);
            }
            if (filters?.status && filters.status !== 'all') {
                params.append('status', filters.status);
            }
            if (filters?.startDate) {
                params.append('start_date', filters.startDate);
            }
            if (filters?.endDate) {
                params.append('end_date', filters.endDate);
            }
            params.append('page', page.toString());
            params.append('pageSize', pageSize.toString());
            const response = await api.get(`/admin/reports?${params.toString()}`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching reports:', error);
            throw error;
        }
    }
    async getReportStatistics() {
        try {
            const response = await api.get('/admin/reports/statistics');
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching report statistics:', error);
            throw error;
        }
    }
    async downloadReport(reportId) {
        try {
            const response = await api.get(`/admin/reports/${reportId}/download`, { responseType: 'blob' });
            return response.data;
        }
        catch (error) {
            console.error('Error downloading report:', error);
            throw error;
        }
    }
    async deleteReport(reportId) {
        try {
            await api.delete(`/admin/reports/${reportId}`);
        }
        catch (error) {
            console.error('Error deleting report:', error);
            throw error;
        }
    }
    async generateReport(params) {
        try {
            let blob;
            let fileName;
            // Prepare base parameters
            const baseParams = {
                start_date: this.getDateRangeStart(params.dateRange),
                end_date: new Date().toISOString().split('T')[0],
            };
            // Add filters if provided
            if (params.filters) {
                if (params.filters.search) {
                    baseParams.search = params.filters.search;
                }
                if (params.filters.status && params.filters.status !== 'all') {
                    baseParams.status = params.filters.status;
                }
            }
            // Add selected IDs if provided
            if (params.selectedIds && params.selectedIds.length > 0) {
                baseParams.ids = params.selectedIds.join(',');
            }
            // Generate report based on module type
            switch (params.type) {
                case 'students':
                    // For students, use analytics report with GPA type
                    blob = await this.generateAnalyticsReport({
                        report_type: 'gpa',
                        ...baseParams
                    });
                    fileName = `students_report_${new Date().toISOString().split('T')[0]}.${params.format === 'excel' ? 'xlsx' : 'pdf'}`;
                    break;
                case 'faculty':
                    // For faculty, we could use enrollment report or create a custom endpoint
                    // For now, using enrollments as a placeholder
                    if (params.format === 'excel') {
                        blob = await this.generateEnrollmentReport({
                            ...baseParams
                        });
                        fileName = `faculty_report_${new Date().toISOString().split('T')[0]}.xlsx`;
                    }
                    else {
                        blob = await this.generateAnalyticsReport({
                            report_type: 'research',
                            ...baseParams
                        });
                        fileName = `faculty_report_${new Date().toISOString().split('T')[0]}.pdf`;
                    }
                    break;
                case 'research':
                    // For research, use analytics report with research type
                    blob = await this.generateAnalyticsReport({
                        report_type: 'research',
                        ...baseParams
                    });
                    fileName = `research_report_${new Date().toISOString().split('T')[0]}.${params.format === 'excel' ? 'xlsx' : 'pdf'}`;
                    break;
                case 'events':
                    // For events, use enrollments report as a placeholder
                    // Ideally, there should be a dedicated events report endpoint
                    if (params.format === 'excel') {
                        blob = await this.generateEnrollmentReport({
                            ...baseParams
                        });
                        fileName = `events_report_${new Date().toISOString().split('T')[0]}.xlsx`;
                    }
                    else {
                        blob = await this.generateAnalyticsReport({
                            report_type: 'enrollments',
                            ...baseParams
                        });
                        fileName = `events_report_${new Date().toISOString().split('T')[0]}.pdf`;
                    }
                    break;
                default:
                    throw new Error(`Unknown report type: ${params.type}`);
            }
            // Add filter/selection indicators to filename
            const filterSuffix = params.filters?.search || (params.filters?.status && params.filters.status !== 'all') ? '_filtered' : '';
            const selectionSuffix = params.selectedIds && params.selectedIds.length > 0 ? '_selected' : '';
            fileName = fileName.replace('.', `${filterSuffix}${selectionSuffix}.`);
            // Auto-download the generated report
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }
    getDateRangeStart(dateRange) {
        const now = new Date();
        let startDate = new Date(now);
        switch (dateRange) {
            case 'current-month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'last-month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                break;
            case 'last-3-months':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'last-6-months':
                startDate.setMonth(now.getMonth() - 6);
                break;
            case 'current-year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }
        return startDate.toISOString().split('T')[0];
    }
    async exportToPDF() {
        // Generate a general analytics report as PDF
        return this.generateAnalyticsReport({
            report_type: 'gpa',
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
        });
    }
    async exportToExcel() {
        // Generate enrollment report as Excel
        return this.generateEnrollmentReport({
            semester: 'current',
            academic_year: new Date().getFullYear().toString(),
        });
    }
    async getReportById(reportId) {
        try {
            const response = await api.get(`/admin/reports/${reportId}`);
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching report by ID:', error);
            throw error;
        }
    }
    async getReportTypes() {
        return ['student-profile', 'faculty-profile', 'enrollments', 'analytics'];
    }
}
export default new ReportsService();
