export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  location: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  date: string;
  location: string;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}
