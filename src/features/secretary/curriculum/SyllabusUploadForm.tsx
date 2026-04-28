import { useState } from 'react';
import { Spinner } from '@/components/ui';
import { Upload, Link as LinkIcon, FileText, X, ExternalLink } from 'lucide-react';
import instructionsService from '@/services/api/instructionsService';
import type { Subject, Syllabus, CreateSyllabusDTO } from '@/types/instructions';

interface SyllabusUploadFormProps {
  subject: Subject;
  syllabus?: Syllabus | null;
  onSubmit: (syllabus: Syllabus) => void;
  onCancel: () => void;
}

export function SyllabusUploadForm({ subject, syllabus, onSubmit, onCancel }: SyllabusUploadFormProps) {
  const [contentType, setContentType] = useState<'file' | 'link'>(syllabus?.contentType || 'file');
  const [title, setTitle] = useState(syllabus?.title || `${subject.code} - ${subject.name} Syllabus`);
  const [description, setDescription] = useState(syllabus?.description || '');
  const [externalLink, setExternalLink] = useState(syllabus?.externalLink || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, Word, or PowerPoint file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (contentType === 'file' && !selectedFile && !syllabus) {
      setError('Please select a file to upload');
      return;
    }

    if (contentType === 'link' && !externalLink.trim()) {
      setError('Please provide a link');
      return;
    }

    if (contentType === 'link' && externalLink.trim()) {
      try {
        new URL(externalLink);
      } catch {
        setError('Please provide a valid URL');
        return;
      }
    }

    try {
      setSubmitting(true);

      const formData: CreateSyllabusDTO = {
        subject_id: subject.id,
        title: title.trim(),
        description: description.trim(),
        contentType,
        ...(contentType === 'file' && selectedFile ? { file: selectedFile } : {}),
        ...(contentType === 'link' ? { externalLink: externalLink.trim() } : {}),
      };

      let result: Syllabus;
      if (syllabus) {
        result = await instructionsService.updateSyllabus(subject.id, formData);
      } else {
        result = await instructionsService.createSyllabus(subject.id, formData);
      }

      onSubmit(result);
    } catch (err) {
      console.error('Error saving syllabus:', err);
      setError('Failed to save syllabus. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Syllabus Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., CS101 - Introduction to Programming Syllabus"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Brief description of the syllabus..."
        />
      </div>

      {/* Content Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Upload Method <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setContentType('file')}
            className={`p-4 border-2 rounded-lg transition flex flex-col items-center gap-2 ${
              contentType === 'file'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-6 h-6" />
            <span className="font-medium">Upload File</span>
            <span className="text-xs text-gray-600">PDF, Word, PowerPoint</span>
          </button>

          <button
            type="button"
            onClick={() => setContentType('link')}
            className={`p-4 border-2 rounded-lg transition flex flex-col items-center gap-2 ${
              contentType === 'link'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <LinkIcon className="w-6 h-6" />
            <span className="font-medium">External Link</span>
            <span className="text-xs text-gray-600">Google Drive, Dropbox, etc.</span>
          </button>
        </div>
      </div>

      {/* File Upload */}
      {contentType === 'file' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File <span className="text-red-500">*</span>
          </label>
          
          {/* Show existing file if editing */}
          {syllabus?.fileUrl && !selectedFile && (
            <div className="mb-3 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{syllabus.fileName}</p>
                  {syllabus.fileSize && (
                    <p className="text-sm text-gray-600">{formatFileSize(syllabus.fileSize)}</p>
                  )}
                </div>
              </div>
              <a
                href={syllabus.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition">
            <input
              type="file"
              id="syllabus-file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              className="hidden"
            />
            <label htmlFor="syllabus-file" className="cursor-pointer">
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFile(null);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, Word, or PowerPoint (max 10MB)
                  </p>
                </>
              )}
            </label>
          </div>
        </div>
      )}

      {/* External Link */}
      {contentType === 'link' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            External Link <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://drive.google.com/..."
              required={contentType === 'link'}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Provide a link to Google Drive, Dropbox, OneDrive, or any other cloud storage
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Spinner size="sm" />
              {syllabus ? 'Updating...' : 'Uploading...'}
            </>
          ) : (
            <>{syllabus ? 'Update Syllabus' : 'Upload Syllabus'}</>
          )}
        </button>
      </div>
    </form>
  );
}
