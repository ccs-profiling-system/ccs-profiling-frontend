import axios from 'axios';

export interface Room {
  id: string;
  name: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/rooms';

export async function getRooms(): Promise<Room[]> {
  try {
    const response = await axios.get<Room[]>(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    // Return mock data for development
    return [
      { id: '1', name: 'Room 101' },
      { id: '2', name: 'Room 102' },
      { id: '3', name: 'Room 103' },
      { id: '4', name: 'Lab 1' },
      { id: '5', name: 'Lab 2' },
    ];
  }
}
