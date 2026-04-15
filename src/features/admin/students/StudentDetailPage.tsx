import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft } from 'lucide-react';
import studentsService from '@/services/api/studentsService';
import type { Student } from '@/types/students';

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await studentsService.getStudentById(id);
      setStudent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load student');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Student Details">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" text="Loading student…" />
        </div>
      </MainLayout>
    );
  }

  if (error || !student) {
    return (
      <MainLayout title="Student Details">
        <div className="space-y-4">
          <button
            onClick={() => navigate('/admin/students')}
            className="flex items-center gap-2 text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </button>
          <ErrorAlert message={error || 'Student not found'} onRetry={fetchStudent} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${student.firstName} ${student.lastName}`}>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/students')}
          className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{student.email}</p>
            </div>
            <Badge
              variant={
                student.status === 'active' ? 'success'
                : student.status === 'graduated' ? 'info'
                : student.status === 'dropped' ? 'warning'
                : 'gray'
              }
              size="lg"
            >
              {student.status}
            </Badge>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-mono text-gray-900">{student.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Program</p>
                <p className="text-gray-900">{student.program || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year Level</p>
                <p className="text-gray-900">{student.yearLevel ? `Year ${student.yearLevel}` : '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Section</p>
                <p className="text-gray-900">{student.section || '—'}</p>
              </div>
            </div>
          </div>

          {/* Enrollment Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Enrollment Date</p>
                <p className="text-gray-900">
                  {student.enrollmentDate
                    ? new Date(student.enrollmentDate).toLocaleDateString()
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-gray-900">
                  {student.createdAt
                    ? new Date(student.createdAt).toLocaleDateString()
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-gray-900">
                  {student.updatedAt
                    ? new Date(student.updatedAt).toLocaleDateString()
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
