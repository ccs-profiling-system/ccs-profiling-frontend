import axios from 'axios';
import type { Participant, AssignParticipantsPayload } from './types';

const BASE_URL = '/api/events';

export async function getAvailableParticipants(): Promise<Participant[]> {
  const response = await axios.get<Participant[]>('/api/participants');
  return response.data;
}

export async function assignParticipants(
  eventId: string,
  payload: AssignParticipantsPayload
): Promise<Participant[]> {
  const response = await axios.post<Participant[]>(
    `${BASE_URL}/${eventId}/participants`,
    payload
  );
  return response.data;
}

export async function removeParticipant(eventId: string, participantId: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${eventId}/participants/${participantId}`);
}
