import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export function useChairAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        checkAuth();
    }, []);
    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        const departmentId = localStorage.getItem('departmentId');
        if (!token || userRole !== 'chair') {
            navigate('/login');
            return;
        }
        // Parse user data
        const [firstName, lastName] = (userName || '').split(' ');
        setUser({
            id: localStorage.getItem('userId') || '',
            email: userEmail || '',
            firstName: firstName || 'Department',
            lastName: lastName || 'Chair',
            role: 'chair',
            departmentId: departmentId || '',
            departmentName: localStorage.getItem('departmentName') || undefined,
        });
        setLoading(false);
    };
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        localStorage.removeItem('departmentId');
        localStorage.removeItem('departmentName');
        navigate('/login');
    };
    return { user, loading, logout };
}
