import api from '@/services/api/axios';
import type { Person } from './types';

export async function getPeople(): Promise<Person[]> {
  try {
    const [studentsRes, facultyRes] = await Promise.all([
      api.get<Person[]>('/admin/students'),
      api.get<Person[]>('/admin/faculty'),
    ]);

    const students: Person[] = studentsRes.data.map((p) => ({ ...p, role: 'student' as const }));
    const faculty: Person[] = facultyRes.data.map((p) => ({ ...p, role: 'faculty' as const }));

    return [...students, ...faculty];
  } catch (error) {
    console.error('Failed to fetch people:', error);
    // Return comprehensive mock data as fallback
    return [
      // Students
      { id: 's1', name: 'John Doe', role: 'student' },
      { id: 's2', name: 'Jane Smith', role: 'student' },
      { id: 's3', name: 'Maria Garcia', role: 'student' },
      { id: 's4', name: 'Alex Chen', role: 'student' },
      { id: 's5', name: 'Sarah Williams', role: 'student' },
      { id: 's6', name: 'David Lee', role: 'student' },
      { id: 's7', name: 'Emily Rodriguez', role: 'student' },
      { id: 's8', name: 'Carlos Santos', role: 'student' },
      { id: 's9', name: 'Lisa Reyes', role: 'student' },
      { id: 's10', name: 'Kevin Tan', role: 'student' },
      { id: 's11', name: 'Michelle Wong', role: 'student' },
      { id: 's12', name: 'Ryan Pascual', role: 'student' },
      
      // Faculty
      { id: 'f1', name: 'Dr. Robert Johnson', role: 'faculty' },
      { id: 'f2', name: 'Prof. Michael Brown', role: 'faculty' },
      { id: 'f3', name: 'Dr. Patricia Martinez', role: 'faculty' },
      { id: 'f4', name: 'Dr. Antonio Cruz', role: 'faculty' },
      { id: 'f5', name: 'Prof. Jennifer Lopez', role: 'faculty' },
      { id: 'f6', name: 'Dr. Thomas Anderson', role: 'faculty' },
      { id: 'f7', name: 'Prof. Elizabeth Taylor', role: 'faculty' },
      { id: 'f8', name: 'Dr. James Wilson', role: 'faculty' },
    ];
  }
}
