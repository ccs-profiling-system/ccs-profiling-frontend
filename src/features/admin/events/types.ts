export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type EventType = 'seminar' | 'workshop' | 'defense' | 'meeting' | 'other';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: EventType;
  status: EventStatus;
  venue?: string;
  participants?: Participant[];
  attachments?: FileAttachment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  date: string;
  location: string;
  type: EventType;
  venue?: string;
  status?: EventStatus;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  type?: EventType;
  venue?: string;
  status?: EventStatus;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface AssignParticipantsPayload {
  eventId: string;
  participantIds: string[];
}

export interface FileAttachment {
  id: string;
  filename: string;
  fileType: 'pdf' | 'image' | 'document';
  url: string;
  size?: number;
  uploadedAt?: string;
}

export interface EventFormErrors {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  type?: string;
  venue?: string;
  status?: string;
}