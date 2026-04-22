import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const studentAPI = axios.create({
    baseURL: `${API_BASE}/student`,
    headers: { 'Content-Type': 'application/json' },
});
studentAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('studentToken');
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
const MOCK_FINANCIAL = {
    id: 'fin-001',
    studentId: 'STU001',
    balance: 45000,
    tuitionCharges: 38000,
    miscFees: 4500,
    labFees: 2500,
    outstandingAmount: 15000,
    dueDate: '2025-02-15',
    payments: [
        {
            id: 'pay-001',
            amount: 20000,
            date: '2025-01-10',
            referenceNumber: 'REF-2025-001',
            method: 'Bank Transfer',
        },
        {
            id: 'pay-002',
            amount: 10000,
            date: '2024-08-05',
            referenceNumber: 'REF-2024-089',
            method: 'Online Payment',
        },
        {
            id: 'pay-003',
            amount: 15000,
            date: '2024-01-12',
            referenceNumber: 'REF-2024-012',
            method: 'Cash',
        },
    ],
};
export const financialService = {
    async getFinancialRecord() {
        try {
            const response = await studentAPI.get('/financial');
            return response.data;
        }
        catch {
            return MOCK_FINANCIAL;
        }
    },
};
export default financialService;
