import { useState, useEffect, useMemo } from 'react';
import type { Participant } from './types';
import { useParticipants } from './useParticipants';

interface ParticipantAssignModalProps {
  eventId: string;
  initialAssigned?: Participant[];
  onClose: () => void;
}

type Tab = 'students' | 'faculty';

export function ParticipantAssignModal({
  eventId,
  initialAssigned = [],
  onClose,
}: ParticipantAssignModalProps) {
  const { available, loading, error, fetchAvailable, assign, remove } =
    useParticipants(eventId);

  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [search, setSearch] = useState('');
  // Track selected IDs as a Set for O(1) toggle
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initialAssigned.map((p) => p.id))
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailable();
  }, [fetchAvailable]);

  const students = useMemo(
    () => available.filter((p) => p.role === 'student'),
    [available]
  );
  const faculty = useMemo(
    () => available.filter((p) => p.role === 'faculty'),
    [available]
  );

  const listForTab = activeTab === 'students' ? students : faculty;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? listForTab.filter((p) => p.name.toLowerCase().includes(q)) : listForTab;
  }, [listForTab, search]);

  function toggleParticipant(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaveError(null);
    setSaving(true);
    try {
      await assign(Array.from(selectedIds));
      onClose();
    } catch (err: any) {
      // Preserve selection state on error (selectedIds unchanged)
      setSaveError(
        err?.response?.data?.message ?? err?.message ?? 'Failed to save participants.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(participantId: string) {
    setSaveError(null);
    try {
      await remove(participantId);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(participantId);
        return next;
      });
    } catch (err: any) {
      setSaveError(
        err?.response?.data?.message ?? err?.message ?? 'Failed to remove participant.'
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Assign Participants</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Errors */}
          {(error || saveError) && (
            <div className="rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {saveError ?? error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b">
            {(['students', 'faculty'] as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setSearch(''); }}
                className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab}…`}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* List */}
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No {activeTab} found.</p>
          ) : (
            <ul className="divide-y divide-gray-100 border rounded">
              {filtered.map((p) => {
                const isSelected = selectedIds.has(p.id);
                return (
                  <li key={p.id} className="flex items-center justify-between px-3 py-2">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleParticipant(p.id)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{p.name}</span>
                    </label>
                    {isSelected && (
                      <button
                        type="button"
                        onClick={() => handleRemove(p.id)}
                        className="text-xs text-red-500 hover:text-red-700 ml-2"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
