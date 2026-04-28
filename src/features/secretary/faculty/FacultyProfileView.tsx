import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout, Modal } from '@/components/layout';
import { Card, Button, Spinner, ErrorAlert, Badge } from '@/components/ui';
import { ArrowLeft, Upload, Download, FileText, Trash2, User, Mail, Briefcase, Building2 } from 'lucide-react';
import { UploadModal } from '../documents/UploadModal';
import secretaryService from '@/services/api/secretaryService';
import type { FacultyRecord, Document } from '@/types/secretary';

export function FacultyProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [faculty, setFaculty] = useState<FacultyRecord | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Fetch faculty data
  useState(() => {
    if (id) {
      fetchFacultyData(id);
    }
  });

  const fetchFacultyData = async (facultyId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch faculty details
      const facultyData = await secretaryService.getFacultyById(facultyId);
      setFaculty(facultyData);
      
      // Fetch faculty documents
      const docsResponse = await secretaryService.getDocuments({
        page: 1,
        limit: 50,
        // Note: Backend categories are: memo, policy, form, report, other
      });
      // Filter by faculty ID in the frontend for now
      setDocuments(docsResponse.data.filter(doc => doc.relatedEntityId === facultyId));
    } catch (err: any) {
      console.error('Failed to fetch faculty data:', err);
      setError('Failed to load faculty data');
      
      // Mock data for development
      setFaculty({
        id: facultyId,
        employeeId: 'FAC-2024-001',
        firstName: 'Dr. Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        department: 'Computer Science',
        position: 'Associate Professor',
        specialization: 'Artificial Intelligence',
        status: 'Active',
        createdAt: '2024-01-15T00:00:00Z',
      });
      
      setDocuments([
        {
          id: '1',
          name: 'Teaching_Credentials.pdf',
          category: 'other',
          fileUrl: '/uploads/doc1.pdf',
          fileSize: 3200000,
          fileType: 'PDF',
          uploadedBy: 'Secretary',
          uploadedAt: '2026-04-15T10:00:00Z',
          relatedEntityId: facultyId,
        },
        {
          id: '2',
          name: 'Research_Publications.pdf',
          category: 'other',
          fileUrl: '/uploads/doc2.pdf',
          fileSize: 2100000,
          fileType: 'PDF',
          uploadedBy: 'Secretary',
          uploadedAt: '2026-04-10T14:30:00Z',
          relatedEntityId: facultyId,
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
      if (id) fetchFacultyData(id);
      alert('Document deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document');
    }
  };

  const handleUploadComplete = () => {
    if (id) fetchFacultyData(id);
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
      <MainLayout title="Faculty Profile" variant="secretary">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" text="Loading faculty profile..." />
        </div>
      </MainLayout>
    );
  }

  if (!faculty) {
    return (
      <MainLayout title="Faculty Profile" variant="secretary">
        <ErrorAlert message="Faculty member not found" />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Faculty Profile" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/secretary/faculty')}
          >
            Back to Faculty
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
          {/* Faculty Information */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {faculty.firstName} {faculty.lastName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{faculty.employeeId}</p>
                <Badge
                  variant={faculty.status === 'Active' ? 'success' : 'gray'}
                  className="mt-2"
                >
                  {faculty.status}
                </Badge>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{faculty.email || '—'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm text-gray-900">{faculty.department}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Position</p>
                    <p className="text-sm text-gray-900">{faculty.position}</p>
                  </div>
                </div>

                {faculty.specialization && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Specialization</p>
                      <p className="text-sm text-gray-900">{faculty.specialization}</p>
                    </div>
                  </div>
                )}

                {faculty.createdAt && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Joined</p>
                      <p className="text-sm text-gray-900">{formatDate(faculty.createdAt)}</p>
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
        category="faculty"
        onUploadComplete={handleUploadComplete}
      />
    </MainLayout>
  );
}
