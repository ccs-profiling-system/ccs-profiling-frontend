import { useState, useRef } from 'react';
import { Modal } from '@/components/layout';
import { Button } from '@/components/ui';
import { Upload, X, FileText, File, AlertCircle, CheckCircle2, FileSpreadsheet, Presentation, Image as ImageIcon, Video } from 'lucide-react';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  onUploadComplete: () => void;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB (increased for video files)

// Comprehensive file type support
const ALLOWED_TYPES = {
  memo: [
    // Documents
    '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
    // Spreadsheets
    '.xls', '.xlsx', '.csv', '.ods',
    // Presentations
    '.ppt', '.pptx', '.odp',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
    // Videos
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'
  ],
  policy: [
    // Documents
    '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
    // Spreadsheets
    '.xls', '.xlsx', '.csv', '.ods',
    // Presentations
    '.ppt', '.pptx', '.odp',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
    // Videos
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'
  ],
  form: [
    // Documents
    '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
    // Spreadsheets
    '.xls', '.xlsx', '.csv', '.ods',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'
  ],
  report: [
    // Documents
    '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
    // Spreadsheets
    '.xls', '.xlsx', '.csv', '.ods',
    // Presentations
    '.ppt', '.pptx', '.odp',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
    // Videos
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'
  ],
  other: [
    // Documents
    '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
    // Spreadsheets
    '.xls', '.xlsx', '.csv', '.ods',
    // Presentations
    '.ppt', '.pptx', '.odp',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
    // Videos
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'
  ],
  all: [
    // Documents
    '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
    // Spreadsheets
    '.xls', '.xlsx', '.csv', '.ods',
    // Presentations
    '.ppt', '.pptx', '.odp',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
    // Videos
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'
  ]
};

export function UploadModal({ isOpen, onClose, category, onUploadComplete }: UploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | undefined => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 100MB limit`;
    }

    // Check file type
    const allowedTypes = ALLOWED_TYPES[category as keyof typeof ALLOWED_TYPES] || ALLOWED_TYPES.all;
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
      return `File type not allowed`;
    }

    return undefined;
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: UploadFile[] = [];
    
    Array.from(fileList).forEach((file) => {
      const error = validateFile(file);
      newFiles.push({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        progress: 0,
        status: error ? 'error' : 'pending',
        error,
      });
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    return new Promise((resolve) => {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
        )
      );

      // Simulate chunked upload with progress
      const totalChunks = 10;
      let currentChunk = 0;

      const uploadInterval = setInterval(() => {
        currentChunk++;
        const progress = (currentChunk / totalChunks) * 100;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, progress } : f
          )
        );

        if (currentChunk >= totalChunks) {
          clearInterval(uploadInterval);
          
          // Simulate API call
          setTimeout(() => {
            // In real implementation, call the API here
            // const formData = new FormData();
            // formData.append('file', uploadFile.file);
            // formData.append('category', category);
            // await secretaryService.uploadDocument({ file: uploadFile.file, category });

            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id
                  ? { ...f, status: 'success' as const, progress: 100 }
                  : f
              )
            );
            resolve();
          }, 500);
        }
      }, 200);
    });
  };

  const handleUpload = async () => {
    const validFiles = files.filter((f) => f.status === 'pending');
    
    if (validFiles.length === 0) {
      return;
    }

    setUploading(true);

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const file of validFiles) {
        await uploadFile(file);
      }

      // Wait a bit to show success state
      setTimeout(() => {
        onUploadComplete();
        handleClose();
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      onClose();
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    // Documents
    if (ext === 'pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext || '')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    
    // Spreadsheets
    if (['xls', 'xlsx', 'csv', 'ods'].includes(ext || '')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    }
    
    // Presentations
    if (['ppt', 'pptx', 'odp'].includes(ext || '')) {
      return <Presentation className="w-5 h-5 text-orange-500" />;
    }
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext || '')) {
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    }
    
    // Videos
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext || '')) {
      return <Video className="w-5 h-5 text-pink-500" />;
    }
    
    // Default
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;
  const uploadingCount = files.filter((f) => f.status === 'uploading').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Upload Documents - ${category.charAt(0).toUpperCase() + category.slice(1)}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload
            className={`w-12 h-12 mx-auto mb-3 transition-colors ${
              dragActive ? 'text-primary' : 'text-gray-400'
            }`}
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {dragActive ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse from your computer
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            accept={ALLOWED_TYPES[category as keyof typeof ALLOWED_TYPES]?.join(',')}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Browse Files
          </Button>
          <div className="mt-4 text-xs text-gray-500">
            <p>Supported: Documents (PDF, Word, Text), Spreadsheets (Excel, CSV), Presentations (PowerPoint), Images (JPG, PNG, etc.), Videos (MP4, AVI, etc.)</p>
            <p>Maximum file size: 100MB</p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">
                Files ({files.length})
              </h4>
              {!uploading && files.length > 0 && (
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
              {files.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    uploadFile.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : uploadFile.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getFileIcon(uploadFile.file.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {uploadFile.status === 'success' && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        {uploadFile.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        {uploadFile.status === 'pending' && !uploading && (
                          <button
                            onClick={() => removeFile(uploadFile.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {uploadFile.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{Math.round(uploadFile.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {uploadFile.error && (
                      <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                    )}

                    {/* Success Message */}
                    {uploadFile.status === 'success' && (
                      <p className="text-xs text-green-600 mt-1">Upload complete</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {files.length > 0 && (
              <div className="flex items-center gap-4 text-xs text-gray-600 pt-2">
                {pendingCount > 0 && <span>{pendingCount} pending</span>}
                {uploadingCount > 0 && <span>{uploadingCount} uploading</span>}
                {successCount > 0 && (
                  <span className="text-green-600">{successCount} completed</span>
                )}
                {errorCount > 0 && (
                  <span className="text-red-600">{errorCount} failed</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            fullWidth
            onClick={handleClose}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Cancel'}
          </Button>
          <Button
            fullWidth
            onClick={handleUpload}
            disabled={pendingCount === 0 || uploading}
            icon={<Upload className="w-4 h-4" />}
          >
            {uploading
              ? `Uploading ${uploadingCount}/${pendingCount + uploadingCount}...`
              : `Upload ${pendingCount} File${pendingCount !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
