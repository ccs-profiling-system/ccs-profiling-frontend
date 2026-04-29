import { useState, useEffect } from 'react';
import { Modal } from '@/components/layout';
import { Card, Button, Spinner, ErrorAlert, Badge } from '@/components/ui';
import { Upload, Download, FileText, Trash2, User, Mail, BookOpen, Calendar, X } from 'lucide-react';
import { UploadModal } from '../documents/UploadModal';
import secretaryService from '@/services/api/secretaryService';
import type { StudentRecord, Document } from '@/types/secretary';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

export function StudentProfileModal({ isOpen, onClose, studentId }: StudentProfileModalProps) {
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentData(studentId);
    }
  }, [isOpen, studentId]);

  const fetchStudentData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch student details
      const studentData = await secretaryService.getStudentById(id);
      setStudent(studentData);
      
      // Fetch student documents
      const docsResponse = await secretaryService.getDocuments({
        page: 1,
        limit: 50,
        // Note: Backend categories are: memo, policy, form, report, other
      });
      setDocuments(docsResponse.data.filter(doc => doc.relatedEntityId === id));
    } catch (err: any) {
      console.error('Failed to fetch student data:', err);
      setError('Failed to load student data');
      
      // Mock data for development
      setStudent({
        id,
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
          relatedEntityId: id,
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
          relatedEntityId: id,
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
      fetchStudentData(studentId);
      alert('Document deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document');
    }
  };

  const handleUploadComplete = () => {
    fetchStudentData(studentId);
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Student Profile"
        size="xl"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" text="Loading student profile..." />
          </div>
        ) : !student ? (
          <ErrorAlert message="Student not found" />
        ) : (
          <div className="space-y-6">
            {error && <ErrorAlert message={error} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Student Information */}
              <div className="lg:col-span-1">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
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

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900 truncate">{student.email || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Program</p>
                      <p className="text-sm text-gray-900">{student.program}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Year Level</p>
                      <p className="text-sm text-gray-900">
                        {student.yearLevel}
                        {['st', 'nd', 'rd', 'th'][student.yearLevel - 1] || 'th'} Year
                      </p>
                    </div>
                  </div>

                  {student.createdAt && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Enrolled Since</p>
                        <p className="text-sm text-gray-900">{formatDate(student.createdAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Documents</h3>
                  <Button
                    size="sm"
                    icon={<Upload className="w-4 h-4" />}
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    Upload
                  </Button>
                </div>

                {documents.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 bg-blue-100 rounded">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {doc.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="info" size="sm">{doc.fileType}</Badge>
                            <span className="text-xs text-gray-500">
                              {formatFileSize(doc.fileSize)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Download className="w-3 h-3" />}
                            onClick={() => handleDownload(doc)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="w-3 h-3" />}
                            onClick={() => handleDelete(doc)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No documents uploaded yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        category="student"
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
}
