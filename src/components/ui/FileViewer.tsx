import { X, Download, FileText, File, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileType?: string;
}

export function FileViewer({ isOpen, onClose, fileUrl, fileName, fileType }: FileViewerProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setLoading(true);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getFileIcon = () => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-secondary" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-6 h-6 text-green-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon className="w-6 h-6 text-purple-600" />;
      default:
        return <File className="w-6 h-6 text-gray-600" />;
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFilePreview = () => {
    const ext = fileName.split('.').pop()?.toLowerCase();

    // PDF Preview
    if (ext === 'pdf') {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-full border-0"
          title={fileName}
          onLoad={() => setLoading(false)}
        />
      );
    }

    // Image Preview
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
            onLoad={() => setLoading(false)}
          />
        </div>
      );
    }

    // Text/Code Preview
    if (['txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'css', 'html'].includes(ext || '')) {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-full border-0 bg-white"
          title={fileName}
          onLoad={() => setLoading(false)}
        />
      );
    }

    // Default: Show download option
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <div className="text-center space-y-4">
          {getFileIcon()}
          <div>
            <p className="text-lg font-semibold text-gray-900">{fileName}</p>
            <p className="text-sm text-gray-600 mt-1">Preview not available for this file type</p>
          </div>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center gap-2 mx-auto"
          >
            <Download className="w-5 h-5" />
            Download File
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Viewer Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-lg shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{fileName}</h3>
              {fileType && (
                <p className="text-xs text-gray-600">{fileType}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
              title="Download"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading file...</p>
              </div>
            </div>
          )}
          {renderFilePreview()}
        </div>
      </div>
    </>
  );
}
