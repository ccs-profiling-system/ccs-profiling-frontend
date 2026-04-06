import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useResearch } from './useResearch';
import { ResearchStatusBadge } from './ResearchStatusBadge';
import { ResearchFormModal } from './ResearchFormModal';
import { applyFilters } from './filterUtils';
import { getPeople } from './peopleService';
import type { Research, ResearchFilters, ResearchStatus, Person } from './types';
import { VALID_RESEARCH_STATUSES } from './validation';

export function ResearchPage() {
  const navigate = useNavigate();
  const { research, loading, error, fetchResearch, createResearch, updateResearch, deleteResearch } = useResearch();

  // Debug: Log research to see what it actually is
  console.log('ResearchPage - research:', research, 'type:', typeof research, 'isArray:', Array.isArray(research));

  // Ensure research is always an array
  const safeResearch = Array.isArray(research) ? research : [];

  const [filters, setFilters] = useState<ResearchFilters>({ status: '', category: '', titleSearch: '' });
  const [people, setPeople] = useState<Person[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Research | undefined>(undefined);

  useEffect(() => {
    fetchResearch();
    getPeople().then(setPeople).catch(() => {});
  }, [fetchResearch]);

  const filtered = applyFilters(safeResearch, filters);

  // Derive unique categories from loaded research for the filter dropdown
  const categories = Array.from(new Set(safeResearch.map((r) => r.category))).filter(Boolean);

  function setFilter<K extends keyof ResearchFilters>(key: K, value: ResearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  async function handleDelete(r: Research) {
    if (!window.confirm(`Delete "${r.title}"?`)) return;
    await deleteResearch(r.id);
  }

  return (
    <MainLayout title="Research">
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>Research</h1>
        <button type="button" onClick={() => setCreateOpen(true)}>+ New Research</button>
      </div>

      {/* Filter controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select
          aria-label="Filter by status"
          value={filters.status ?? ''}
          onChange={(e) => setFilter('status', e.target.value as ResearchStatus | '')}
        >
          <option value="">All statuses</option>
          {VALID_RESEARCH_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <select
          aria-label="Filter by category"
          value={filters.category ?? ''}
          onChange={(e) => setFilter('category', e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="text"
          aria-label="Search by title"
          placeholder="Search by title..."
          value={filters.titleSearch ?? ''}
          onChange={(e) => setFilter('titleSearch', e.target.value)}
          style={{ padding: '6px 8px' }}
        />
      </div>

      {/* Loading / error states */}
      {loading && <div>Loading...</div>}
      {error && <div role="alert" style={{ color: '#b91c1c', marginBottom: '12px' }}>{error}</div>}

      {/* Research list */}
      {!loading && filtered.length === 0 && (
        <div data-testid="empty-state">No research records match the current filters.</div>
      )}

      {filtered.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() => navigate(`/admin/research/${r.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td style={tdStyle}>{r.title}</td>
                <td style={tdStyle}>{r.category}</td>
                <td style={tdStyle}>
                  <ResearchStatusBadge status={r.status} />
                </td>
                <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setEditTarget(r)}
                    style={{ marginRight: '8px' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r)}
                    style={{ color: '#b91c1c' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create modal */}
      {createOpen && (
        <ResearchFormModal
          people={people}
          onClose={() => setCreateOpen(false)}
          onCreate={async (payload) => { await createResearch(payload); }}
          onUpdate={async () => {}}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <ResearchFormModal
          existing={editTarget}
          people={people}
          onClose={() => setEditTarget(undefined)}
          onCreate={async () => {}}
          onUpdate={async (id, payload) => { await updateResearch(id, payload); }}
        />
      )}
    </div>
    </MainLayout>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #e5e7eb', fontWeight: 600,
};
const tdStyle: React.CSSProperties = {
  padding: '8px 12px', borderBottom: '1px solid #e5e7eb',
};
