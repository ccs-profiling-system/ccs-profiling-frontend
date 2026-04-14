import { useEffect, useRef, useState } from 'react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Spinner, ErrorAlert } from '@/components/ui';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
import type { FacultyCourse, CourseMaterial } from '../types';

export function MaterialsPage() {
  const { faculty, loading: authLoading } = useFacultyAuth();

  const [courses, setCourses] = useState<FacultyCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch courses once faculty is loaded
  useEffect(() => {
    if (!faculty) return;

    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        setFetchError(null);
        const data = await facultyPortalService.getCourses(faculty.id);
        setCourses(data);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [faculty]);

  // Fetch materials when course selection changes
  useEffect(() => {
    if (!selectedCourseId) {
      setMaterials([]);
      return;
    }

    const fetchMaterials = async () => {
      try {
        setLoadingMaterials(true);
        setFetchError(null);
        const data = await facultyPortalService.getMaterials(selectedCourseId);
        setMaterials(data);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load materials');
      } finally {
        setLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, [selectedCourseId]);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(e.target.value);
    setUploadError(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCourseId) return;

    // Reset file input so the same file can be re-selected if needed
    e.target.value = '';

    setUploading(true);
    setUploadError(null);

    try {
      const newMaterial = await facultyPortalService.uploadMaterial(selectedCourseId, file);
      // Prepend to list on success
      setMaterials((prev) => [newMaterial, ...prev]);
    } catch (err) {
      // Show error, preserve existing list
      setUploadError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!selectedCourseId) return;
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await facultyPortalService.deleteMaterial(selectedCourseId, materialId);
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to delete material');
    }
  };

  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString();
    } catch {
      return isoDate;
    }
  };

  if (authLoading || loadingCourses) {
    return (
      <FacultyLayout title="Materials">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" text="Loading..." />
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout title="Materials">
      <div className="space-y-6">
        {fetchError && <ErrorAlert title="Error" message={fetchError} />}

        {/* Course Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 max-w-sm">
            <label htmlFor="materials-course-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Course
            </label>
            <select
              id="materials-course-select"
              data-testid="materials-course-select"
              value={selectedCourseId}
              onChange={handleCourseChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Select a course --</option>
              {courses.map((course) => (
                <option key={course.subjectId} value={course.subjectId}>
                  {course.subjectCode} — {course.subjectName} ({course.section})
                </option>
              ))}
            </select>
          </div>

          {selectedCourseId && (
            <div className="sm:mt-5">
              <button
                type="button"
                data-testid="materials-upload-btn"
                onClick={handleUploadClick}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {uploading ? 'Uploading…' : 'Upload File'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {uploadError && <ErrorAlert title="Upload failed" message={uploadError} />}

        {/* Materials Table */}
        {selectedCourseId && (
          <>
            {loadingMaterials ? (
              <div className="flex items-center justify-center h-40">
                <Spinner size="md" text="Loading materials..." />
              </div>
            ) : materials.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
                <p className="text-sm text-gray-500">No materials uploaded for this course yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">File Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">File Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Upload Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Download</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materials.map((material) => (
                      <tr
                        key={material.id}
                        data-testid={`material-row-${material.id}`}
                        className="hover:bg-gray-50"
                      >
                        <td
                          data-testid={`material-filename-${material.id}`}
                          className="px-4 py-3 text-gray-900"
                        >
                          {material.fileName}
                        </td>
                        <td
                          data-testid={`material-filetype-${material.id}`}
                          className="px-4 py-3 text-gray-600"
                        >
                          {material.fileType}
                        </td>
                        <td
                          data-testid={`material-uploaddate-${material.id}`}
                          className="px-4 py-3 text-gray-600"
                        >
                          {formatDate(material.uploadDate)}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            data-testid={`material-download-${material.id}`}
                            href={material.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 hover:underline"
                          >
                            Download
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            data-testid={`material-delete-${material.id}`}
                            onClick={() => handleDelete(material.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {!selectedCourseId && !loadingCourses && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-sm text-gray-500">Select a course to view its materials.</p>
          </div>
        )}
      </div>
    </FacultyLayout>
  );
}
