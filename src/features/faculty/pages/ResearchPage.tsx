import { useEffect, useState } from 'react';
import { FlaskConical, Plus } from 'lucide-react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, Spinner, ErrorAlert, Modal } from '@/components/ui';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
import type { FacultyResearchProject, ResearchSubmissionPayload } from '../types';

const STATUS_COLORS: Record<FacultyResearchProject['status'], string> = {
  ongoing: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  proposed: 'bg-yellow-100 text-yellow-800',
};

interface ResearchFormState {
  title: string;
  description: string;
  status: 'ongoing' | 'completed' | 'proposed';
  role: 'adviser' | 'panelist' | 'researcher';
}

const BLANK_FORM: ResearchFormState = {
  title: '',
  description: '',
  status: 'proposed',
  role: 'researcher',
};

export function ResearchPage() {
  const { faculty, loading: authLoading } = useFacultyAuth();

  const [projects, setProjects] = useState<FacultyResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<FacultyResearchProject | null>(null);
  const [form, setForm] = useState<ResearchFormState>(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (!faculty) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await facultyPortalService.getResearchProjects(faculty.id);
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load research projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [faculty]);

  const openCreateModal = () => {
    setEditingProject(null);
    setForm(BLANK_FORM);
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (project: FacultyResearchProject) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description,
      status: project.status,
      role: (project.role as ResearchFormState['role']) ?? 'researcher',
    });
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProject(null);
    setModalError(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faculty) return;

    const payload: ResearchSubmissionPayload = {
      title: form.title,
      description: form.description,
      status: form.status,
      role: form.role,
    };

    setSubmitting(true);
    setModalError(null);

    try {
      if (editingProject) {
        // Update mode
        const updated = await facultyPortalService.updateResearchProject(
          faculty.id,
          editingProject.id,
          payload
        );
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? updated : p))
        );
      } else {
        // Create mode
        const created = await facultyPortalService.createResearchProject(faculty.id, payload);
        setProjects((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      // Show error inside modal, preserve entered values
      setModalError(err instanceof Error ? err.message : 'Failed to save research project');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <FacultyLayout title="Research">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" text="Loading..." />
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout title="Research">
      <div className="space-y-6">
        {error && <ErrorAlert title="Error" message={error} />}

        {/* Page header with New Research button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Research Projects</h2>
          <button
            type="button"
            data-testid="new-research-btn"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Plus className="w-4 h-4" />
            New Research
          </button>
        </div>

        {projects.length === 0 && !error ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FlaskConical className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No research projects found</p>
              <p className="text-gray-400 text-sm mt-1">
                Research projects you are involved in will appear here.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <button
                key={project.id}
                data-testid={`research-card-${project.id}`}
                onClick={() => openEditModal(project)}
                className="text-left w-full"
              >
                <Card className="h-full cursor-pointer">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        data-testid={`research-title-${project.id}`}
                        className="font-semibold text-gray-900 text-sm leading-snug"
                      >
                        {project.title}
                      </h3>
                      <span
                        data-testid={`research-status-${project.id}`}
                        className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[project.status]}`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <p
                      data-testid={`research-role-${project.id}`}
                      className="text-xs text-green-700 font-medium capitalize"
                    >
                      {project.role}
                    </p>

                    <p
                      data-testid={`research-description-${project.id}`}
                      className="text-sm text-gray-600 line-clamp-3"
                    >
                      {project.description}
                    </p>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Research Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingProject ? 'Edit Research Project' : 'New Research Project'}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="research-form"
              disabled={submitting}
              data-testid="research-form-submit"
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : editingProject ? 'Save Changes' : 'Create'}
            </button>
          </>
        }
      >
        {modalError && (
          <div className="mb-4">
            <ErrorAlert title="Error" message={modalError} />
          </div>
        )}

        <form id="research-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="research-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="research-title"
              name="title"
              type="text"
              required
              data-testid="research-form-title"
              value={form.title}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Research project title"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="research-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="research-description"
              name="description"
              required
              rows={4}
              data-testid="research-form-description"
              value={form.description}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Describe the research project"
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="research-status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="research-status"
              name="status"
              required
              data-testid="research-form-status"
              value={form.status}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="proposed">Proposed</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="research-role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="research-role"
              name="role"
              required
              data-testid="research-form-role"
              value={form.role}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="adviser">Adviser</option>
              <option value="panelist">Panelist</option>
              <option value="researcher">Researcher</option>
            </select>
          </div>
        </form>
      </Modal>
    </FacultyLayout>
  );
}
