import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { FacultyPortalProfile } from '@/features/faculty/types';
import facultyPortalService from '@/services/api/facultyPortalService';

export function useFacultyAuth() {
  const navigate = useNavigate();
  const { isAuthenticated, token, logout: authLogout } = useAuth();
  const [faculty, setFaculty] = useState<FacultyPortalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }
    fetchFacultyProfile();
  }, [isAuthenticated, token, navigate]);

  const fetchFacultyProfile = async () => {
    try {
      setLoading(true);
      const profile = await facultyPortalService.getProfile();
      setFaculty(profile);
      localStorage.setItem('faculty', JSON.stringify(profile));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('faculty');
    localStorage.removeItem('userRole');
    authLogout();
    navigate('/login');
  };

  return { faculty, loading, error, logout };
}
