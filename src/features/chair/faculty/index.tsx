import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import chairFacultyService, { type FacultyMember } from '@/services/api/chair/chairFacultyService';
import { Eye, Users, BookOpen, TrendingUp, Award } from 'lucide-react';

export function ChairFaculty() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Pagination - Secretary portal style
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10; // Fixed

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    loadFaculty();
  }, [search, currentPage]);

  // Fetch stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await chairFacultyService.getFacultyStats();
      setStats(statsData);
    } catch (err) {
      console.warn('Failed to fetch stats:', err);
    }
  };

  const loadFaculty = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chairFacultyService.getFaculty(
        { search },
        currentPage,
        itemsPerPage
      );
      
      setFaculty(response.data || []);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
    } catch (err: any) {
      console.error('Failed to load faculty:', err);
      setError(err.response?.data?.message || 'Failed to load faculty');
      setFaculty([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from current data
  const calculatedStats = useMemo(() => {
    const activeCount = faculty.filter(f => f.status === 'active').length;
    const specializations = new Set(faculty.map(f => f.specialization).filter(Boolean)).size;
    const totalTeachingLoad = faculty.reduce((sum, f) => sum + (f.teachingLoad || 0), 0);
    const avgTeachingLoad = faculty.length > 0 ? (totalTeachingLoad / faculty.length).toFixed(1) : 0;
    const totalResearch = faculty.reduce((sum, f) => sum + (f.researchCount || 0), 0);
    
    return {
      total: totalItems,
      active: activeCount,
      specializations: specializations,
      avgTeachingLoad: avgTeachingLoad,
      totalResearch: totalResearch,
    };
  }, [faculty, totalItems]);

  const columns: Column<FacultyMember>[] = [
    { key: 'facultyId', header: 'Faculty ID' },
    {
      key: 'name',
      header: 'Name',
      render: (f) => `${f.firstName} ${f.lastName}`,
    },
    { key: 'email', header: 'Email' },
    { key: 'specialization', header: 'Specialization' },
    {
      key: 'teachingLoad',
      header: 'Teaching Load',
      align: 'center',
      render: (f) => `${f.teachingLoad || 0} units`,
    },
    {
      key: 'researchCount',
      header: 'Research',
      align: 'center',
      render: (f) => f.researchCount || 0,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: () => (
        <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
        </Button>
      ),
    },
  ];

  return (
    <MainLayout title="Faculty Management" variant="chair">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Members</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {calculatedStats.total} total faculty members
          </p>
        </div>

        {error && <ErrorAlert message={error} onRetry={loadFaculty} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Faculty</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{calculatedStats.total}</p>
                <p className="text-xs text-gray-500 mt-1">In department</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{calculatedStats.active}</p>
                <p className="text-xs text-gray-500 mt-1">Currently teaching</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Avg Teaching Load</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{calculatedStats.avgTeachingLoad}</p>
                <p className="text-xs text-gray-500 mt-1">Units per faculty</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Research Projects</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{calculatedStats.totalResearch}</p>
                <p className="text-xs text-gray-500 mt-1">Total supervised</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <SearchBar
            placeholder="Search faculty..."
            onChange={setSearch}
            value={search}
          />
        </Card>

        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : faculty.length === 0 && totalItems === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No faculty members found</p>
            </div>
          ) : (
            <>
              <Table data={faculty} columns={columns} />
              
              {/* Pagination Controls - Secretary Portal Style */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {faculty.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} faculty
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
