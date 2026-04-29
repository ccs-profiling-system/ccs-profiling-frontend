import { useState, useEffect } from 'react';
import { Upload, Download, Trash2, FileText, Plus } from 'lucide-react';
import { Button, Spinner, ErrorAlert } from '@/components/ui';
import secretaryService from '@/services/api/secretaryService';
import type { Document } from '@/types/secretary';

interface DocumentsTabProps {
  entityId: string;
  entityType: 'student' | 'faculty';
  onDocumentChange?: () => void;
}

export function DocumentsTab({ entityId, entityType, onDocumentChange }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: '',
    category: 'other' as const, // Backend uses: memo, policy, form, report, other
    file: null as File | null,
  });

  useEffect(() => {
    fetchDocuments();
  }, [entityId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await secretaryService.getDocuments({
        page: 1,
        limit: 100,
        // Note: Backend categories are: memo, policy, form, report, other
        // We fetch all and filter by relatedEntityId instead
      });
      
      // Filter documents for this specific entity
      const filtered = response.data.filter(doc => doc.relatedEntityId === entityId);
      setDocuments(filtered);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData({
        ...uploadData,
        file,
        name: uploadData.name || file.name,
      });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file) {
      alert('Please select a file');
      return;
    }

    try {
      setUploading(true);
      await secretaryService.uploadDocument({
        file: uploadData.file,
        category: 'other', // Backend uses: memo, policy, form, report, other
        relatedEntityId: entityId,
      });
      
      setShowUploadForm(false);
      setUploadData({ name: '', category: 'other', file: null });
      fetchDocuments();
      onDocumentChange?.();
      alert('Document uploaded successfully!');
    } catch (err: any) {
      console.error('Failed to upload document:', err);
      alert(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
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
      fetchDocuments();
      onDocumentChange?.();
      alert('Document deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document');
    }
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
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" text="Loading documents..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <ErrorAlert message={error} />}

      {/* Upload Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <Button
          onClick={() => setShowUploadForm(!showUploadForm)}
          icon={<Plus className="w-4 h-4" />}
          size="sm"
        >
          Upload Document
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Upload New Document</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Name *
              </label>
              <input
                type="text"
                value={uploadData.name}
                onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                placeholder="Enter document name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File *
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {uploadData.file && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {uploadData.file.name} ({formatFileSize(uploadData.file.size)})
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleUpload}
                disabled={uploading || !uploadData.file}
                size="sm"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadData({ name: '', category: 'other', file: null });
                }}
                disabled={uploading}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
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
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                    {doc.fileType}
                  </span>
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
        <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No documents uploaded yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Click "Upload Document" to add files
          </p>
        </div>
      )}
    </div>
  );
}
