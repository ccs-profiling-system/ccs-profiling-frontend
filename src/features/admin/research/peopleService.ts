import axios from 'axios';
import type { Person } from './types';

export async function getPeople(): Promise<Person[]> {
  const [studentsRes, facultyRes] = await Promise.all([
    axios.get<Person[]>('/api/students'),
    axios.get<Person[]>('/api/faculty'),
  ]);

  const students: Person[] = studentsRes.data.map((p) => ({ ...p, role: 'student' as const }));
  const faculty: Person[] = facultyRes.data.map((p) => ({ ...p, role: 'faculty' as const }));

  return [...students, ...faculty];
}
