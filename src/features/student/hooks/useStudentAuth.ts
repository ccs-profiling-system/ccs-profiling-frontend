import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StudentProfile } from '../types';
import studentService from '@/services/api/studentService';

export function useStudentAuth() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchStudentProfile();
  }, [navigate]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const profile = await studentService.getProfile();
      setStudent(profile);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      localStorage.removeItem('studentToken');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('studentToken');
    navigate('/login');
  };

  return {
    student,
    loading,
    error,
    logout,
    refetch: fetchStudentProfile,
  };
}
