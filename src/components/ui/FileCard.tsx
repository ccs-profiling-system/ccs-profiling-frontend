import { 
  FileText, 
  File, 
  Image as ImageIcon, 
  FileSpreadsheet,
  Download,
  Eye,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from './Badge';

export interface FileData {
  id: string | number;
  name: string;
  size: string;
  type: string;
  uploadedDate: string;
  uploadedBy?: string;
  url?: string;
  status?: 'uploaded' | 'processing' | 'failed';
}

interface FileCardProps {
  file: FileData;
  onView?: (file: FileData) => void;
  onDownload?: (file: FileData) => void;
  onDelete?: (file: FileData) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function FileCard({ 
  file, 
  onView, 
  onDownload, 
  onDelete,
  showActions = true,
  compact = false
}: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getFileIcon = () => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const iconClass = compact ? 'w-5 h-5' : 'w-8 h-8';
    
    switch (ext) {
      case 'pdf':
        return <FileText className={`${iconClass} text-secondary`} />;
      case 'doc':
      case 'docx':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className={`${iconClass} text-green-600`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon className={`${iconClass} text-purple-600`} />;
      default:
        return <File className={`${iconClass} text-gray-600`} />;
    }
  };

  const getStatusBadge = () => {
    if (!file.status || file.status === 'uploaded') return null;
    
    switch (file.status) {
      case 'processing':
        return <Badge variant="warning" size="sm" dot>Processing</Badge>;
      case 'failed':
        return <Badge variant="secondary" size="sm" dot>Failed</Badge>;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition group">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate text-sm">{file.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{file.size}</span>
              <span>•</span>
              <span>{file.uploadedDate}</span>
            </div>
          </div>
          {getStatusBadge()}
        </div>
        
        {showActions && (
          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onView && (
              <button
                onClick={() => onView(file)}
                className="p-1.5 hover:bg-primary/10 rounded transition"
                title="View"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {onDownload && (
              <button
                onClick={() => onDownload(file)}
                className="p-1.5 hover:bg-primary/10 rounded transition"
                title="Download"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(file)}
                className="p-1.5 hover:bg-secondary/10 rounded transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-secondary" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{file.name}</p>
            <p className="text-sm text-gray-500">{file.type}</p>
          </div>
        </div>
        
        {showActions && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded transition"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[150px]">
                  {onView && (
                    <button
                      onClick={() => {
                        onView(file);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  )}
                  {onDownload && (
                    <button
                      onClick={() => {
                        onDownload(file);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(file);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-secondary/10 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Size:</span>
          <span className="font-medium text-gray-900">{file.size}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Uploaded:</span>
          <span className="font-medium text-gray-900">{file.uploadedDate}</span>
        </div>
        {file.uploadedBy && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">By:</span>
            <span className="font-medium text-gray-900">{file.uploadedBy}</span>
          </div>
        )}
        {getStatusBadge() && (
          <div className="pt-2 border-t border-gray-100">
            {getStatusBadge()}
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {onView && (
            <button
              onClick={() => onView(file)}
              className="flex-1 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition text-sm font-medium flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
          )}
          {onDownload && (
            <button
              onClick={() => onDownload(file)}
              className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
        </div>
      )}
    </div>
  );
}
