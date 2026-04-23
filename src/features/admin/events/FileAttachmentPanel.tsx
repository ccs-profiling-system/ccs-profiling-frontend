import { useRef, useState } from 'react';
import type { FileAttachment } from './types';
import { validateFile } from './validation';
import { useFileAttachments } from './useFileAttachments';

const FILE_TYPE_ICONS: Record<FileAttachment['fileType'], string> = {
  pdf: '📄',
  image: '🖼️',
  document: '📝',
};

interface FileAttachmentPanelProps {
  eventId: string;
  initialAttachments?: FileAttachment[];
}

export function FileAttachmentPanel({ eventId, initialAttachments = [] }: FileAttachmentPanelProps) {
  const { attachments, loading, error, upload, remove } = useFileAttachments(eventId);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Merge initial attachments with hook state (hook starts empty; initial list shown until first upload)
  const displayAttachments = attachments.length > 0 ? attachments : initialAttachments;

  async function handleFile(file: File) {
    setValidationError(null);
    const err = validateFile(file);
    if (err) {
      setValidationError(err);
      return;
    }
    try {
      await upload(file);
    } catch {
      // error surfaced via hook's error state
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected after an error
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function handleRemove(attachmentId: string) {
    try {
      await remove(attachmentId);
    } catch {
      // error surfaced via hook's error state
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <p className="text-sm text-gray-500">
          Drag &amp; drop a file here, or{' '}
          <span className="text-blue-600 underline">click to browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, DOCX — max 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.docx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload file"
        />
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          {validationError}
        </div>
      )}

      {/* API error */}
      {error && (
        <div className="rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <p className="text-sm text-gray-500 text-center">Uploading…</p>
      )}

      {/* Attachment list */}
      {displayAttachments.length > 0 && (
        <ul className="divide-y divide-gray-100 border rounded">
          {displayAttachments.map((att) => (
            <li key={att.id} className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <span aria-hidden="true">{FILE_TYPE_ICONS[att.fileType]}</span>
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate max-w-xs"
                >
                  {att.filename}
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(att.id)}
                className="text-xs text-red-500 hover:text-red-700 ml-4 shrink-0"
                aria-label={`Delete ${att.filename}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {displayAttachments.length === 0 && !loading && (
        <p className="text-sm text-gray-400 text-center">No attachments yet.</p>
      )}
    </div>
  );
}
