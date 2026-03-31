import axios from 'axios';

export interface Room {
  id: string;
  name: string;
}

const BASE_URL = '/api/rooms';

export async function getRooms(): Promise<Room[]> {
  const response = await axios.get<Room[]>(BASE_URL);
  return response.data;
}
