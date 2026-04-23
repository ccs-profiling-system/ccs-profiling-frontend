import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FacultyPortalProfile } from '@/features/faculty/types';
import facultyPortalService from '@/services/api/facultyPortalService';

export function useFacultyAuth() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<FacultyPortalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('facultyToken');
    if (!token) {
      navigate('/faculty/login');
      return;
    }
    fetchFacultyProfile();
  }, [navigate]);

  const fetchFacultyProfile = async () => {
    try {
      setLoading(true);
      const profile = await facultyPortalService.getProfile();
      setFaculty(profile);
      localStorage.setItem('faculty', JSON.stringify(profile));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      localStorage.removeItem('facultyToken');
      navigate('/faculty/login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('facultyToken');
    localStorage.removeItem('faculty');
    localStorage.removeItem('auth_user');
    navigate('/faculty/login');
  };

  return {
    faculty,
    loading,
    error,
    logout,
  };
}
