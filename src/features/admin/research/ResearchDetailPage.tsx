import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout, Card } from '@/components/layout';
import { 
  ArrowLeft, Edit2, Trash2, Users, UserCheck, FileText, 
  Calendar, Download, X, AlertCircle 
} from 'lucide-react';
import { useResearch } from './useResearch';
import { ResearchStatusBadge } from './ResearchStatusBadge';
import { ResearchFormModal } from './ResearchFormModal';
import { getPeople } from './peopleService';
import * as researchService from './researchService';
import type { Person } from './types';

export function ResearchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedResearch, loading, error, fetchResearchById, updateResearch, deleteResearch } = useResearch();

  const [people, setPeople] = useState<Person[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [fileDeleteError, setFileDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchResearchById(id);
  }, [id, fetchResearchById]);

  useEffect(() => {
    getPeople().then(setPeople).catch(() => {});
  }, []);

  async function handleDelete() {
    if (!selectedResearch) return;
    if (!window.confirm('Are you sure you want to delete this research record?')) return;
    try {
      await deleteResearch(selectedResearch.id);
      navigate('/admin/research');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete.');
    }
  }

  async function handleFileDelete(fileId: string) {
    if (!selectedResearch) return;
    try {
      await researchService.deleteResearchFile(selectedResearch.id, fileId);
      await fetchResearchById(selectedResearch.id);
    } catch (err) {
      setFileDeleteError(err instanceof Error ? err.message : 'Failed to delete file.');
    }
  }

  if (loading) {
    return (
      <MainLayout title="Research Details">
        <Card className="!p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading research details...</p>
          </div>
        </Card>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Research Details">
        <Card className="!p-6 border-l-4 border-l-secondary bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-secondary mb-1">Error Loading Research</h3>
              <p className="text-sm text-gray-700">{error}</p>
            </div>
          </div>
        </Card>
      </MainLayout>
    );
  }

  if (!selectedResearch) {
    return (
      <MainLayout title="Research Details">
        <Card className="!p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Not Found</h3>
          <p className="text-gray-600 mb-6">The research record you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/research')}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Research List
          </button>
        </Card>
      </MainLayout>
    );
  }

  const r = selectedResearch;

  return (
    <MainLayout title="Research Details">
      <div className="space-y-6 max-w-5xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/research')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Research List
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Delete Error */}
        {deleteError && (
          <Card className="!p-4 border-l-4 border-l-secondary bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">{deleteError}</p>
              </div>
              <button onClick={() => setDeleteError(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        )}

        {/* Title and Status */}
        <Card className="!p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex-1">{r.title}</h1>
            <ResearchStatusBadge status={r.status} />
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {r.category}
          </div>
        </Card>

        {/* Abstract */}
        <Card className="!p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Abstract
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{r.abstract}</p>
        </Card>

        {/* Authors and Adviser */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authors */}
          <Card className="!p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Authors
            </h2>
            {r.authors.length > 0 ? (
              <ul className="space-y-2">
                {r.authors.map((author, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {author}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No authors assigned</p>
            )}
          </Card>

          {/* Adviser */}
          <Card className="!p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Adviser
            </h2>
            {r.adviser ? (
              <p className="text-gray-700">{r.adviser}</p>
            ) : (
              <p className="text-gray-500 italic">No adviser assigned</p>
            )}
          </Card>
        </div>

        {/* Files */}
        <Card className="!p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Attached Files
          </h2>
          
          {fileDeleteError && (
            <div className="mb-4 p-3 border-l-4 border-l-secondary bg-red-50 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{fileDeleteError}</p>
                <button onClick={() => setFileDeleteError(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {r.files.length > 0 ? (
            <div className="space-y-2">
              {r.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 hover:text-primary font-medium truncate transition-colors"
                    >
                      {file.name}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={file.url}
                      download
                      className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleFileDelete(file.id)}
                      className="p-2 text-gray-600 hover:text-secondary hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No files uploaded</p>
          )}
        </Card>

        {/* Events */}
        {r.events.length > 0 && (
          <Card className="!p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Related Events
            </h2>
            <div className="space-y-2">
              {r.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Edit Modal */}
        {editOpen && (
          <ResearchFormModal
            existing={r}
            people={people}
            onClose={() => setEditOpen(false)}
            onCreate={async () => {}}
            onUpdate={async (id, payload) => {
              await updateResearch(id, payload);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
