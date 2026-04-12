import { useEffect, useState } from 'react';
import { MainLayout, Card } from '@/components/layout';
import { Plus, X, AlertCircle, Calendar } from 'lucide-react';
import type { Event, CreateEventPayload } from './types';
import { useEvents } from './useEvents';
import { EventFormModal } from './EventFormModal';
import { EventsAside } from './EventsAside';
import { ParticipantAssignModal } from './ParticipantAssignModal';
import { FileAttachmentPanel } from './FileAttachmentPanel';

type ActiveModal =
  | { kind: 'create' }
  | { kind: 'edit'; event: Event }
  | { kind: 'participants'; event: Event }
  | { kind: 'attachments'; event: Event }
  | null;

export function EventsPage() {
  const { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent } =
    useEvents();

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formApiError, setFormApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const displayed = Array.isArray(events) ? events : [];

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
    <MainLayout title="Events Management">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        <div className="xl:col-span-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-primary" />
              Events
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and organize events
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Event
          </button>
        </div>

        {/* Filter Section */}
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Total Events: <span className="font-semibold text-gray-900">{displayed.length}</span>
            </span>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <Card className="!p-6 border-l-4 border-l-secondary bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-secondary mb-1">Error Loading Events</h3>
                <p className="text-sm text-gray-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="!p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && displayed.length === 0 && (
          <Card className="!p-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first event</p>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </button>
            </div>
          </Card>
        )}

        {/* Events Table */}
        {!loading && displayed.length > 0 && (
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayed.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{event.title}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{event.description}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{event.location}</td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(event)}
                            className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            ✎
                          </button>
                          {deleteConfirmId === event.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDelete(event.id)}
                                className="p-2 text-white bg-secondary hover:bg-red-600 rounded-lg transition-colors"
                                title="Confirm Delete"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(event.id)}
                              className="p-2 text-gray-600 hover:text-secondary hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Attachments — {activeModal.event.title}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FileAttachmentPanel
                eventId={activeModal.event.id}
                initialAttachments={activeModal.event.attachments}
              />
            </Card>
          </div>
        )}
        </div>

      {/* Aside */}
      <div className="xl:col-span-4">
        <EventsAside events={Array.isArray(events) ? events : []} loading={loading} />
      </div>
    </div>
    </MainLayout>
  );
}
