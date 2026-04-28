import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout, Modal } from '@/components/layout';
import { Card, Button, Spinner, ErrorAlert, Badge } from '@/components/ui';
import { ArrowLeft, Upload, Download, FileText, Trash2, User, Mail, BookOpen, Calendar } from 'lucide-react';
import { UploadModal } from '../documents/UploadModal';
import secretaryService from '@/services/api/secretaryService';
import type { StudentRecord, Document } from '@/types/secretary';

export function StudentProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Fetch student data
  useState(() => {
    if (id) {
      fetchStudentData(id);
    }
  });

  const fetchStudentData = async (studentId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch student details
      const studentData = await secretaryService.getStudentById(studentId);
      setStudent(studentData);
      
      // Fetch student documents
      const docsResponse = await secretaryService.getDocuments({
        page: 1,
        limit: 50,
        // Note: Backend categories are: memo, policy, form, report, other
      });
      // Filter by student ID in the frontend for now
      setDocuments(docsResponse.data.filter(doc => doc.relatedEntityId === studentId));
    } catch (err: any) {
      console.error('Failed to fetch student data:', err);
      setError('Failed to load student data');
      
      // Mock data for development
      setStudent({
        id: studentId,
        studentId: '2024-0001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        program: 'BSCS',
        yearLevel: 3,
        status: 'Active',
        createdAt: '2024-01-15T00:00:00Z',
      });
      
      setDocuments([
        {
          id: '1',
          name: 'Transcript_of_Records.pdf',
          category: 'other',
          fileUrl: '/uploads/doc1.pdf',
          fileSize: 2400000,
          fileType: 'PDF',
          uploadedBy: 'Secretary',
          uploadedAt: '2026-04-15T10:00:00Z',
          relatedEntityId: studentId,
        },
        {
          id: '2',
          name: 'Birth_Certificate.pdf',
          category: 'other',
          fileUrl: '/uploads/doc2.pdf',
          fileSize: 1800000,
          fileType: 'PDF',
          uploadedBy: 'Secretary',
          uploadedAt: '2026-04-10T14:30:00Z',
          relatedEntityId: studentId,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await secretaryService.downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download document:', err);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      return;
    }

    try {
      await secretaryService.deleteDocument(doc.id);
      if (id) fetchStudentData(id);
      alert('Document deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document');
    }
  };

  const handleUploadComplete = () => {
    if (id) fetchStudentData(id);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <MainLayout title="Student Profile" variant="secretary">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" text="Loading student profile..." />
        </div>
      </MainLayout>
    );
  }

  if (!student) {
    return (
      <MainLayout title="Student Profile" variant="secretary">
        <ErrorAlert message="Student not found" />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Student Profile" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/secretary/students')}
          >
            Back to Students
          </Button>
          <Button
            icon={<Upload className="w-4 h-4" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Document
          </Button>
        </div>

        {error && <ErrorAlert message={error} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Information */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{student.studentId}</p>
                <Badge
                  variant={student.status === 'Active' ? 'success' : 'gray'}
                  className="mt-2"
                >
                  {student.status}
                </Badge>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{student.email || '—'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Program</p>
                    <p className="text-sm text-gray-900">{student.program}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Year Level</p>
                    <p className="text-sm text-gray-900">
                      {student.yearLevel}
                      {['st', 'nd', 'rd', 'th'][student.yearLevel - 1] || 'th'} Year
                    </p>
                  </div>
                </div>

                {student.createdAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Enrolled Since</p>
                      <p className="text-sm text-gray-900">{formatDate(student.createdAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Documents */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                <span className="text-sm text-gray-600">{documents.length} files</span>
              </div>

              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="info" size="sm">{doc.fileType}</Badge>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(doc.fileSize)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(doc.uploadedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Download className="w-4 h-4" />}
                          onClick={() => handleDownload(doc)}
                        >
                          Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleDelete(doc)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No documents uploaded yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click "Upload Document" to add files
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        category="student"
        onUploadComplete={handleUploadComplete}
      />
    </MainLayout>
  );
}
