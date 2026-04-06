import axios from 'axios';
import type { Person } from './types';

export async function getPeople(): Promise<Person[]> {
  try {
    const [studentsRes, facultyRes] = await Promise.all([
      axios.get<Person[]>('/api/students'),
      axios.get<Person[]>('/api/faculty'),
    ]);

    const students: Person[] = studentsRes.data.map((p) => ({ ...p, role: 'student' as const }));
    const faculty: Person[] = facultyRes.data.map((p) => ({ ...p, role: 'faculty' as const }));

    return [...students, ...faculty];
  } catch (error) {
    console.error('Failed to fetch people:', error);
    // Return mock data as fallback
    return [
      { id: '1', name: 'John Doe', role: 'student' },
      { id: '2', name: 'Jane Smith', role: 'student' },
      { id: '3', name: 'Dr. Robert Johnson', role: 'faculty' },
      { id: '4', name: 'Prof. Sarah Williams', role: 'faculty' },
    ];
  }
}
