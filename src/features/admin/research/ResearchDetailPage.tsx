import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      // Re-fetch to reflect updated file list
      await fetchResearchById(selectedResearch.id);
    } catch (err) {
      setFileDeleteError(err instanceof Error ? err.message : 'Failed to delete file.');
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div role="alert" style={{ color: '#b91c1c' }}>{error}</div>;
  if (!selectedResearch) return <div>Research record not found.</div>;

  const r = selectedResearch;

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <button type="button" onClick={() => navigate('/admin/research')} style={{ marginBottom: '16px' }}>
        ← Back to list
      </button>

      <h1 data-field="title">{r.title}</h1>

      <div style={{ marginBottom: '8px' }}>
        <ResearchStatusBadge status={r.status} />
      </div>

      <section style={{ marginBottom: '16px' }}>
        <strong>Abstract</strong>
        <p data-field="abstract">{r.abstract}</p>
      </section>

      <section style={{ marginBottom: '16px' }}>
        <strong>Category</strong>
        <p data-field="category">{r.category}</p>
      </section>

      <section style={{ marginBottom: '16px' }}>
        <strong>Authors</strong>
        <ul data-field="authors">
          {r.authors.length > 0
            ? r.authors.map((a) => <li key={a}>{a}</li>)
            : <li>No authors assigned.</li>}
        </ul>
      </section>

      <section style={{ marginBottom: '16px' }}>
        <strong>Adviser</strong>
        <p data-field="adviser">{r.adviser || 'No adviser assigned.'}</p>
      </section>

      <section style={{ marginBottom: '16px' }}>
        <strong>Files</strong>
        {fileDeleteError && (
          <div role="alert" style={{ color: '#b91c1c', marginBottom: '8px' }}>{fileDeleteError}</div>
        )}
        {r.files.length > 0 ? (
          <ul data-field="files">
            {r.files.map((f) => (
              <li key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a href={f.url} target="_blank" rel="noopener noreferrer" data-file-name={f.name}>
                  {f.name}
                </a>
                <button
                  type="button"
                  onClick={() => handleFileDelete(f.id)}
                  style={{ fontSize: '0.75rem', color: '#b91c1c' }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No files uploaded.</p>
        )}
      </section>

      {r.events.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <strong>Events</strong>
          <ul data-field="events">
            {r.events.map((ev) => (
              <li key={ev.id}>{ev.title} — {ev.date}</li>
            ))}
          </ul>
        </section>
      )}

      {deleteError && (
        <div role="alert" style={{ color: '#b91c1c', marginBottom: '8px' }}>{deleteError}</div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button type="button" onClick={() => setEditOpen(true)}>Edit</button>
        <button type="button" onClick={handleDelete} style={{ color: '#b91c1c' }}>Delete</button>
      </div>

      {editOpen && (
        <ResearchFormModal
          existing={r}
          people={people}
          onClose={() => setEditOpen(false)}
          onCreate={async () => {}}
          onUpdate={async (id, payload) => { await updateResearch(id, payload); }}
        />
      )}
    </div>
  );
}
