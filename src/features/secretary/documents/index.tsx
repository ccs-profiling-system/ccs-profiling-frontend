import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Button, SearchBar, Badge, Spinner, ErrorAlert } from '@/components/ui';
import { FolderOpen, Upload, Download, Eye, Trash2, FileText, File } from 'lucide-react';
import { useDocumentsData } from './useDocumentsData';
import secretaryService from '@/services/api/secretaryService';
import type { Document } from '@/types/secretary';

export function SecretaryDocuments() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { documents, loading, error, search, setSearch, refetch } = useDocumentsData({ 
    category: selectedCategory === 'all' ? undefined : selectedCategory 
  });

  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const categories = [
    { value: 'all', label: 'All Documents', count: documents.length },
    { value: 'student', label: 'Student Records', count: documents.filter(d => d.category === 'student').length },
    { value: 'faculty', label: 'Faculty Files', count: documents.filter(d => d.category === 'faculty').length },
    { value: 'event', label: 'Event Documents', count: documents.filter(d => d.category === 'event').length },
    { value: 'research', label: 'Research Papers', count: documents.filter(d => d.category === 'research').length },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    if (selectedCategory === 'all') {
      alert('Please select a specific category for upload');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(selectedFiles).map(file =>
        secretaryService.uploadDocument({
          file,
          category: selectedCategory as 'student' | 'faculty' | 'event' | 'research',
        })
      );

      await Promise.all(uploadPromises);
      setSelectedFiles(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      refetch();
      alert('Files uploaded successfully!');
    } catch (err: any) {
      console.error('Failed to upload files:', err);
      alert(err.response?.data?.message || 'Failed to upload files');
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
      alert(err.response?.data?.message || 'Failed to download document');
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      return;
    }

    try {
      await secretaryService.deleteDocument(doc.id);
      refetch();
      alert('Document deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      alert(err.response?.data?.message || 'Failed to delete document');
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

  return (
    <MainLayout title="Document Management" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FolderOpen className="w-7 h-7 text-primary" />
              Document Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">Upload and organize documents</p>
          </div>
        </div>

        {error && (
          <ErrorAlert
            title="Error Loading Documents"
            message={error}
            onRetry={refetch}
            onDismiss={() => {}}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === category.value
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-sm font-medium">{category.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === category.value
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Upload Section */}
            <Card className="p-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Upload Files</h3>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    Choose Files
                  </label>
                  {selectedFiles && selectedFiles.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      {selectedFiles.length} file(s) selected
                    </p>
                  )}
                </div>
                {selectedCategory === 'all' && (
                  <p className="text-xs text-amber-600">
                    Please select a category before uploading
                  </p>
                )}
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !selectedFiles || selectedCategory === 'all'}
                  fullWidth
                  size="sm"
                  icon={<Upload className="w-4 h-4" />}
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </div>
            </Card>

            {/* Storage Stats */}
            <Card className="p-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Storage</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Used</span>
                    <span>12.5 GB / 50 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  37.5 GB available
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Documents */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search */}
            <Card className="p-4">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search documents..."
              />
            </Card>

            {/* Documents Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" text="Loading documents..." />
              </div>
            ) : documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                        {doc.fileType === 'PDF' ? (
                          <FileText className="w-6 h-6 text-blue-600" />
                        ) : (
                          <File className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="info" size="sm">{doc.fileType}</Badge>
                          <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Uploaded by {doc.uploadedBy} on {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handleDownload(doc)}
                      >
                        View
                      </Button>
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
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No documents found</h3>
                <p className="text-sm text-gray-500">
                  {selectedCategory === 'all' 
                    ? 'Upload documents to get started'
                    : `No ${categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} available`
                  }
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
