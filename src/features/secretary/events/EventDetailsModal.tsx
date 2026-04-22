import { Modal } from '@/components/layout';
import { Badge } from '@/components/ui';
import { Calendar, MapPin, Users, User, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import type { Event } from '@/types/secretary';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export function EventDetailsModal({
  isOpen,
  onClose,
  event,
}: EventDetailsModalProps) {
  if (!event) return null;

  const getStatusColor = () => {
    switch (event.status) {
      case 'draft':
        return 'bg-gray-50 border-gray-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (event.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  const startDateTime = formatDateTime(event.startDate);
  const endDateTime = formatDateTime(event.endDate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Status Banner */}
        <div className={`rounded-lg p-4 border ${getStatusColor()}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Status:</span>
                <Badge
                  variant={
                    event.status === 'draft'
                      ? 'gray'
                      : event.status === 'pending'
                      ? 'warning'
                      : event.status === 'approved'
                      ? 'success'
                      : 'gray'
                  }
                >
                  {event.status.toUpperCase()}
                </Badge>
              </div>
              {event.status === 'approved' && (
                <p className="text-sm text-green-700 mt-1">
                  This event has been approved by the department chair.
                </p>
              )}
              {event.status === 'rejected' && (
                <p className="text-sm text-red-700 mt-1">
                  This event was not approved. See reason below.
                </p>
              )}
              {event.status === 'pending' && (
                <p className="text-sm text-yellow-700 mt-1">
                  Waiting for department chair approval.
                </p>
              )}
              {event.status === 'draft' && (
                <p className="text-sm text-gray-700 mt-1">
                  This event is in draft status. Submit for approval when ready.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Event Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="info">{event.eventType}</Badge>
          </div>
          <p className="text-gray-700 leading-relaxed">{event.description}</p>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Start Date & Time</p>
                <p className="text-gray-900 font-semibold">{startDateTime.date}</p>
                <p className="text-sm text-gray-600">{startDateTime.time}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">End Date & Time</p>
                <p className="text-gray-900 font-semibold">{endDateTime.date}</p>
                <p className="text-sm text-gray-600">{endDateTime.time}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-gray-900 font-semibold">{event.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Organizer</p>
                <p className="text-gray-900 font-semibold">{event.organizer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Target Audience */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">Target Audience</p>
              <div className="flex flex-wrap gap-2">
                {event.targetAudience.map((audience) => (
                  <Badge key={audience} variant="info" size="sm">
                    {audience}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Max Participants */}
        {event.maxParticipants && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-gray-700">Maximum Participants</p>
                <p className="text-gray-900 font-semibold">{event.maxParticipants}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submission Info */}
        {event.submittedAt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Submission Information</h3>
            <div className="space-y-1 text-sm">
              <p className="text-blue-800">
                <span className="font-medium">Submitted by:</span> {event.submittedByName}
              </p>
              <p className="text-blue-800">
                <span className="font-medium">Submitted on:</span>{' '}
                {new Date(event.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Review Info */}
        {event.reviewedAt && (
          <div className={`border rounded-lg p-4 ${
            event.status === 'approved' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
              event.status === 'approved' ? 'text-green-900' : 'text-red-900'
            }`}>
              {event.status === 'approved' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Review Information
            </h3>
            <div className={`space-y-1 text-sm ${
              event.status === 'approved' ? 'text-green-800' : 'text-red-800'
            }`}>
              <p>
                <span className="font-medium">Reviewed by:</span> {event.reviewedByName}
              </p>
              <p>
                <span className="font-medium">Reviewed on:</span>{' '}
                {new Date(event.reviewedAt).toLocaleString()}
              </p>
              {event.reviewNotes && (
                <div className="mt-2 pt-2 border-t border-current/20">
                  <p className="font-medium">Notes:</p>
                  <p className="mt-1">{event.reviewNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
