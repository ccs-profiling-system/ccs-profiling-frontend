export type EventType = 'seminar' | 'workshop' | 'defense' | 'meeting' | 'other';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Participant {
  id: string;
  name: string;
  role: 'student' | 'faculty';
}

export interface FileAttachment {
  id: string;
  filename: string;
  fileType: 'pdf' | 'image' | 'document';
  url: string;
  uploadedAt: string;
}

export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: string; // ISO 8601 datetime string
  venue: string;
  status: EventStatus;
  researchId?: string;
  subjectIds?: string[];
  participants: Participant[];
  attachments: FileAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  title: string;
  type: EventType;
  date: string;
  venue: string;
  status?: EventStatus;
  researchId?: string;
  subjectIds?: string[];
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

export interface AssignParticipantsPayload {
  participantIds: string[];
}
