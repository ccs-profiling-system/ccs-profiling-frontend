import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import chairFacultyService, { type FacultyMember } from '@/services/api/chair/chairFacultyService';
import { Eye } from 'lucide-react';

export function ChairFaculty() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    loadFaculty();
  }, [search, currentPage, itemsPerPage]);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const response = await chairFacultyService.getFaculty(
        { search },
        currentPage,
        itemsPerPage
      );
      
      setFaculty(response.data || []);
      setTotalItems(response.total || 0);
    } catch (err) {
      // Show empty state instead of error for 404
      setFaculty([]);
      setTotalItems(0);
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
        <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
        </Button>
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
              {totalItems > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalItems / itemsPerPage)}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              )}
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
