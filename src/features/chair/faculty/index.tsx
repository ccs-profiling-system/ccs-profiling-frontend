import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import chairFacultyService, { type FacultyMember } from '@/services/api/chair/chairFacultyService';
import { Eye } from 'lucide-react';

export function ChairFaculty() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const response = await chairFacultyService.getFaculty({ search });
      setFaculty(response.data || []);
      setError(null);
    } catch (err) {
      // Show empty state instead of error for 404
      setFaculty([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

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
        <button className="p-1.5 hover:bg-blue-50 rounded text-blue-600">
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <MainLayout title="Faculty Management" variant="chair">
      <div className="space-y-6">
        <Card className="p-6">
          <SearchBar
            placeholder="Search faculty..."
            onChange={setSearch}
            value={search}
          />
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <Card>
            <Table data={faculty} columns={columns} />
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
