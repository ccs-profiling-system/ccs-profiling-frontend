import { useEffect, useState } from 'react';
import type { Event, EventStatus, CreateEventPayload } from './types';
import { useEvents, filterEventsByStatus } from './useEvents';
import { EventStatusBadge } from './EventStatusBadge';
import { EventFormModal } from './EventFormModal';
import { ParticipantAssignModal } from './ParticipantAssignModal';
import { FileAttachmentPanel } from './FileAttachmentPanel';

type FilterValue = EventStatus | 'all';

type ActiveModal =
  | { kind: 'create' }
  | { kind: 'edit'; event: Event }
  | { kind: 'participants'; event: Event }
  | { kind: 'attachments'; event: Event }
  | null;

export function EventsPage() {
  const { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent } =
    useEvents();

  const [filter, setFilter] = useState<FilterValue>('all');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formApiError, setFormApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const displayed = filterEventsByStatus(events, filter);

  async function handleSave(payload: CreateEventPayload) {
    setFormApiError(null);
    try {
      if (activeModal?.kind === 'edit') {
        await updateEvent(activeModal.event.id, payload);
      } else {
        await createEvent(payload);
      }
      setActiveModal(null);
    } catch (err: any) {
      setFormApiError(
        err?.response?.data?.message ?? err?.message ?? 'An error occurred.'
      );
      // form stays open, data preserved
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEvent(id);
    } catch {
      // error shown via hook's error state
    } finally {
      setDeleteConfirmId(null);
    }
  }

  function openCreate() {
    setFormApiError(null);
    setActiveModal({ kind: 'create' });
  }

  function openEdit(event: Event) {
    setFormApiError(null);
    setActiveModal({ kind: 'edit', event });
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Events</h1>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          + New Event
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="rounded bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm text-gray-600">
          Filter by status:
        </label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterValue)}
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-sm text-gray-500">Loading events…</p>
      )}

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'Type', 'Date', 'Venue', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    No events found.
                  </td>
                </tr>
              ) : (
                displayed.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{event.title}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{event.type}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(event.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{event.venue}</td>
                    <td className="px-4 py-3">
                      <EventStatusBadge status={event.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openEdit(event)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveModal({ kind: 'participants', event })}
                          className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          Participants
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveModal({ kind: 'attachments', event })}
                          className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          Attachments
                        </button>
                        {deleteConfirmId === event.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDelete(event.id)}
                              className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(event.id)}
                            className="text-xs px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {(activeModal?.kind === 'create' || activeModal?.kind === 'edit') && (
        <EventFormModal
          event={activeModal.kind === 'edit' ? activeModal.event : null}
          onSave={handleSave}
          onClose={() => setActiveModal(null)}
          apiError={formApiError}
        />
      )}

      {activeModal?.kind === 'participants' && (
        <ParticipantAssignModal
          eventId={activeModal.event.id}
          initialAssigned={activeModal.event.participants}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.kind === 'attachments' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Attachments — {activeModal.event.title}
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-4">
              <FileAttachmentPanel
                eventId={activeModal.event.id}
                initialAttachments={activeModal.event.attachments}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
