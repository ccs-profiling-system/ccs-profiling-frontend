import { useState, useMemo } from 'react';
import { MainLayout, Modal } from '@/components/layout';
import { Card, Button, SearchBar, Badge, Spinner, ErrorAlert } from '@/components/ui';
import { FolderOpen, Upload, Download, Eye, Trash2, FileText, File, CheckSquare, Square, X, FileSpreadsheet, Presentation, Image as ImageIcon, Video, Building2, Filter } from 'lucide-react';
import { useDocumentsData } from './useDocumentsData';
import { UploadModal } from './UploadModal';
import secretaryService from '@/services/api/secretaryService';
import type { Document } from '@/types/secretary';

export function SecretaryDocuments() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { documents, loading, error, search, setSearch, pagination, onPageChange, refetch } = useDocumentsData({ 
    category: selectedCategory === 'all' ? undefined : selectedCategory 
  });

  // Upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Batch operations
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [batchOperating, setBatchOperating] = useState(false);
  
  // Preview modal
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fileType: [] as string[],
  });

  // Category counts - fetch all documents to get accurate counts
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const { documents: allDocuments } = useDocumentsData({ category: undefined });

  // Apply frontend filtering for file type
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Apply file type filter
    if (filters.fileType.length > 0) {
      const filterType = filters.fileType[0];
      filtered = filtered.filter((doc: Document) => doc.fileType === filterType);
    }

    return filtered;
  }, [documents, filters.fileType]);

  // Calculate category counts from all documents
  useMemo(() => {
    const counts: Record<string, number> = {
      all: allDocuments.length,
      student: 0,
      faculty: 0,
      department: 0,
      event: 0,
      research: 0,
      forms: 0,
    };

    allDocuments.forEach((doc: Document) => {
      if (counts[doc.category] !== undefined) {
        counts[doc.category]++;
      }
    });

    setCategoryCounts(counts);
  }, [allDocuments]);

  const categories = [
    { value: 'all', label: 'All Documents', icon: FolderOpen, color: 'bg-gray-100 text-gray-700' },
    { value: 'student', label: 'Student Records', icon: FileText, color: 'bg-blue-100 text-blue-700' },
    { value: 'faculty', label: 'Faculty Files', icon: FileText, color: 'bg-purple-100 text-purple-700' },
    { value: 'department', label: 'Department Records', icon: Building2, color: 'bg-indigo-100 text-indigo-700' },
    { value: 'event', label: 'Event Documents', icon: FileText, color: 'bg-green-100 text-green-700' },
    { value: 'research', label: 'Research Papers', icon: File, color: 'bg-orange-100 text-orange-700' },
    { value: 'forms', label: 'Forms', icon: FileText, color: 'bg-pink-100 text-pink-700' },
  ];

  const handleOpenUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadComplete = () => {
    refetch();
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

  // Batch operations
  const toggleSelectDoc = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedDocs.size === filteredDocuments.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredDocuments.map((d: Document) => d.id)));
    }
  };

  const handleBatchDownload = async () => {
    if (selectedDocs.size === 0) return;
    
    setBatchOperating(true);
    try {
      const downloadPromises = Array.from(selectedDocs).map(async (docId: string) => {
        const doc = filteredDocuments.find((d: Document) => d.id === docId);
        if (doc) {
          await handleDownload(doc);
        }
      });
      await Promise.all(downloadPromises);
      alert(`${selectedDocs.size} document(s) downloaded successfully!`);
    } catch (err) {
      alert('Some downloads failed');
    } finally {
      setBatchOperating(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedDocs.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedDocs.size} document(s)?`)) {
      return;
    }

    setBatchOperating(true);
    try {
      const deletePromises = Array.from(selectedDocs).map(docId =>
        secretaryService.deleteDocument(docId)
      );
      await Promise.all(deletePromises);
      setSelectedDocs(new Set());
      refetch();
      alert(`${selectedDocs.size} document(s) deleted successfully!`);
    } catch (err: any) {
      console.error('Failed to delete documents:', err);
      alert('Some deletions failed');
    } finally {
      setBatchOperating(false);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (fileType: string, fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    // Documents
    if (fileType === 'PDF' || ext === 'pdf') {
      return <FileText className="w-6 h-6" />;
    }
    if (['DOC', 'DOCX', 'TXT', 'RTF', 'ODT'].includes(fileType) || 
        ['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext || '')) {
      return <FileText className="w-6 h-6" />;
    }
    
    // Spreadsheets
    if (['XLS', 'XLSX', 'CSV', 'ODS'].includes(fileType) || 
        ['xls', 'xlsx', 'csv', 'ods'].includes(ext || '')) {
      return <FileSpreadsheet className="w-6 h-6" />;
    }
    
    // Presentations
    if (['PPT', 'PPTX', 'ODP'].includes(fileType) || 
        ['ppt', 'pptx', 'odp'].includes(ext || '')) {
      return <Presentation className="w-6 h-6" />;
    }
    
    // Images
    if (['JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'WEBP', 'SVG'].includes(fileType) || 
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext || '')) {
      return <ImageIcon className="w-6 h-6" />;
    }
    
    // Videos
    if (['MP4', 'AVI', 'MOV', 'WMV', 'FLV', 'MKV', 'WEBM'].includes(fileType) || 
        ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext || '')) {
      return <Video className="w-6 h-6" />;
    }
    
    // Default
    return <File className="w-6 h-6" />;
  };

  return (
    <MainLayout title="Document Management" variant="secretary">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FolderOpen className="w-7 h-7 text-primary" />
              Document Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {pagination.totalItems} total documents
              {selectedDocs.size > 0 && ` • ${selectedDocs.size} selected`}
            </p>
          </div>

          <Button
            icon={<Upload className="w-4 h-4" />}
            onClick={handleOpenUpload}
          >
            Upload Document
          </Button>
        </div>

        {error && (
          <ErrorAlert
            title="Error Loading Documents"
            message={error}
            onRetry={refetch}
            onDismiss={() => {}}
          />
        )}

        {/* Category Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-1 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = categoryCounts[category.value] || 0;
              const isActive = selectedCategory === category.value;
              
              return (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setSelectedDocs(new Set());
                  }}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-all relative ${
                    isActive
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b-2 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Batch Actions Bar */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Search & Filters</h3>
              {filters.fileType.length > 0 && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {filters.fileType.length} filter(s) active
                </p>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Select All Checkbox */}
            <button
              onClick={toggleSelectAll}
              className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              title={selectedDocs.size === filteredDocuments.length && filteredDocuments.length > 0 ? 'Deselect all' : 'Select all'}
            >
              {selectedDocs.size === filteredDocuments.length && filteredDocuments.length > 0 ? (
                <CheckSquare className="w-5 h-5 text-primary" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Search Bar */}
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by document name..."
              />
            </div>

            {/* Batch Actions */}
            {selectedDocs.size > 0 && (
              <div className="flex items-center gap-2 pl-3 border-l">
                <span className="text-sm text-gray-600 font-medium">
                  {selectedDocs.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={handleBatchDownload}
                  disabled={batchOperating}
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={handleBatchDelete}
                  disabled={batchOperating}
                >
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<X className="w-4 h-4" />}
                  onClick={() => setSelectedDocs(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Advanced Filters - Collapsible */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Type
                </label>
                <select
                  value={filters.fileType?.[0] ?? ''}
                  onChange={(e) => setFilters({ ...filters, fileType: e.target.value ? [e.target.value] : [] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All File Types</option>
                  <option value="PDF">PDF</option>
                  <option value="DOC">Word Document</option>
                  <option value="XLS">Excel Spreadsheet</option>
                  <option value="PPT">PowerPoint</option>
                  <option value="JPG">Image (JPG)</option>
                  <option value="PNG">Image (PNG)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ fileType: [] });
                    setSearch('');
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {filters.fileType.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {filters.fileType.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    File Type: {filters.fileType[0]}
                    <button
                      onClick={() => setFilters({ ...filters, fileType: [] })}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Documents List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" text="Loading documents..." />
          </div>
        ) : filteredDocuments.length > 0 ? (
          <>
            <div className="space-y-3">
              {filteredDocuments.map((doc: Document) => {
                const isSelected = selectedDocs.has(doc.id);
                const categoryInfo = categories.find(c => c.value === doc.category);
                
                return (
                  <Card
                    key={doc.id}
                    className={`p-4 transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelectDoc(doc.id)}
                        className="flex-shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>

                      {/* File Icon */}
                      <div className={`p-3 rounded-lg flex-shrink-0 ${categoryInfo?.color || 'bg-gray-100 text-gray-700'}`}>
                        {getFileIcon(doc.fileType, doc.name)}
                      </div>

                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <Badge variant="info" size="sm">{doc.fileType}</Badge>
                          <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{formatDate(doc.uploadedAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                          onClick={() => setPreviewDoc(doc)}
                          title="Preview"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Download className="w-4 h-4" />}
                          onClick={() => handleDownload(doc)}
                          title="Download"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4 text-red-500" />}
                          onClick={() => handleDelete(doc)}
                          title="Delete"
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                    {pagination.totalItems} documents
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 px-3">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No documents found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {search
                ? 'Try adjusting your search terms'
                : selectedCategory === 'all'
                ? 'Upload documents to get started'
                : `No ${categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} available`
              }
            </p>
            {!search && (
              <Button
                icon={<Upload className="w-4 h-4" />}
                onClick={handleOpenUpload}
              >
                Upload Document
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        category={selectedCategory}
        onUploadComplete={handleUploadComplete}
      />

      {/* Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.name}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{previewDoc.fileType}</span>
              </div>
              <div>
                <span className="text-gray-600">Size:</span>
                <span className="ml-2 font-medium">{formatFileSize(previewDoc.fileSize)}</span>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium capitalize">{previewDoc.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Uploaded:</span>
                <span className="ml-2 font-medium">{formatDate(previewDoc.uploadedAt)}</span>
              </div>
            </div>

            <div className="border rounded-lg p-8 bg-gray-50 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                Preview not available. Download to view the file.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setPreviewDoc(null)}
              >
                Close
              </Button>
              <Button
                fullWidth
                icon={<Download className="w-4 h-4" />}
                onClick={() => {
                  handleDownload(previewDoc);
                  setPreviewDoc(null);
                }}
              >
                Download
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
}
