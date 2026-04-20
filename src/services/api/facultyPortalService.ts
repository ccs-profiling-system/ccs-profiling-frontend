import axios from 'axios';
import api from './axios';
import type {
  FacultyPortalProfile,
  FacultyCourse,
  TeachingLoadSummary,
  RosterStudent,
  AttendanceRecord,
  AttendanceSubmission,
  FacultyResearchProject,
  FacultyEvent,
  ProfileUpdatePayload,
  CourseMaterial,
  ResearchSubmissionPayload,
  EventParticipation,
  FacultyPortalSkill,
  FacultyPortalAffiliation,
  StudentParticipationRecord,
  ParticipationSubmission,
} from '@/features/faculty/types';

class FacultyPortalService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('facultyToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: FacultyPortalProfile }> {
    try {
      const response = await api.post<{ token: string; user: FacultyPortalProfile }>(
        '/auth/login',
        { email, password }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock login');
        return {
          token: 'mock-faculty-token',
          user: {
            id: '1',
            facultyId: 'FAC-001',
            firstName: 'Maria',
            lastName: 'Garcia',
            email,
            department: 'Computer Science',
            position: 'Associate Professor',
            specialization: 'Artificial Intelligence',
            status: 'active',
          },
        };
      }
      throw error;
    }
  }

  async getProfile(): Promise<FacultyPortalProfile> {
    try {
      const response = await api.get<FacultyPortalProfile>('/faculty/profile', {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock profile');
        return {
          id: '1',
          facultyId: 'FAC-001',
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria@ccs.edu.ph',
          department: 'Computer Science',
          position: 'Associate Professor',
          specialization: 'Artificial Intelligence',
          status: 'active',
        };
      }
      throw error;
    }
  }

  // ── Courses & Teaching Load ───────────────────────────────────────────────

  async getCourses(facultyId: string): Promise<FacultyCourse[]> {
    try {
      const response = await api.get<FacultyCourse[] | { data: FacultyCourse[] }>(
        `/admin/faculty/${facultyId}/subjects`,
        { headers: this.getAuthHeader() }
      );
      const raw = response.data;
      return Array.isArray(raw) ? raw : (raw as { data: FacultyCourse[] }).data ?? [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock courses');
        return [
          {
            subjectId: 'subj-1',
            subjectCode: 'CS101',
            subjectName: 'Introduction to Programming',
            section: 'A',
            semester: '1st',
            year: 2024,
            schedule: 'MWF 8:00-9:00 AM',
          },
          {
            subjectId: 'subj-2',
            subjectCode: 'CS201',
            subjectName: 'Data Structures',
            section: 'B',
            semester: '1st',
            year: 2024,
            schedule: 'TTh 10:00-11:30 AM',
          },
        ];
      }
      throw error;
    }
  }

  async getTeachingLoad(facultyId: string): Promise<TeachingLoadSummary> {
    try {
      const response = await api.get<TeachingLoadSummary | { data: TeachingLoadSummary }>(
        `/admin/faculty/${facultyId}/teaching-load`,
        { headers: this.getAuthHeader() }
      );
      const raw = response.data;
      return (raw as { data: TeachingLoadSummary }).data ?? (raw as TeachingLoadSummary);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock teaching load');
        return {
          totalUnits: 18,
          totalClasses: 3,
          currentSemester: '1st Semester 2024-2025',
        };
      }
      throw error;
    }
  }

  // ── Class Roster ──────────────────────────────────────────────────────────

  async getRoster(facultyId: string, subjectId: string): Promise<RosterStudent[]> {
    try {
      const response = await api.get<RosterStudent[] | { data: RosterStudent[] }>(
        `/faculty/courses/${subjectId}/roster`,
        { headers: this.getAuthHeader() }
      );
      const raw = response.data;
      return Array.isArray(raw) ? raw : (raw as { data: RosterStudent[] }).data ?? [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock roster');
        return [
          {
            id: 'stu-1',
            studentId: 'CS-001',
            firstName: 'John',
            lastName: 'Doe',
            program: 'BS Computer Science',
            yearLevel: 2,
            section: 'A',
          },
          {
            id: 'stu-2',
            studentId: 'CS-002',
            firstName: 'Jane',
            lastName: 'Smith',
            program: 'BS Information Technology',
            yearLevel: 2,
            section: 'A',
          },
        ];
      }
      throw error;
    }
  }

  // ── Attendance ────────────────────────────────────────────────────────────

  async getAttendance(courseId: string, date: string): Promise<AttendanceRecord[]> {
    try {
      const response = await api.get<AttendanceRecord[] | { data: AttendanceRecord[] }>(
        '/faculty/attendance',
        {
          params: { courseId, date },
          headers: this.getAuthHeader(),
        }
      );
      const raw = response.data;
      return Array.isArray(raw) ? raw : (raw as { data: AttendanceRecord[] }).data ?? [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock attendance');
        return [];
      }
      throw error;
    }
  }

  async submitAttendance(payload: AttendanceSubmission): Promise<void> {
    try {
      await api.post('/faculty/attendance', payload, {
        headers: this.getAuthHeader(),
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, skipping attendance submission');
        return;
      }
      throw error;
    }
  }

  // ── Research ──────────────────────────────────────────────────────────────

  async getResearchProjects(facultyId: string): Promise<FacultyResearchProject[]> {
    try {
      const response = await api.get<FacultyResearchProject[] | { data: FacultyResearchProject[] }>(
        `/admin/faculty/${facultyId}/research`,
        { headers: this.getAuthHeader() }
      );
      const raw = response.data;
      return Array.isArray(raw) ? raw : (raw as { data: FacultyResearchProject[] }).data ?? [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock research projects');
        return [
          {
            id: 'res-1',
            title: 'AI-Assisted Learning Systems',
            description: 'Research on applying machine learning to adaptive educational platforms.',
            status: 'ongoing',
            role: 'Principal Investigator',
          },
        ];
      }
      throw error;
    }
  }

  // ── Events ────────────────────────────────────────────────────────────────

  async getEvents(): Promise<FacultyEvent[]> {
    try {
      const response = await api.get<FacultyEvent[] | { data: FacultyEvent[] }>(
        '/admin/events',
        { headers: this.getAuthHeader() }
      );
      const raw = response.data;
      return Array.isArray(raw) ? raw : (raw as { data: FacultyEvent[] }).data ?? [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock events');
        return [
          {
            id: 'evt-1',
            title: 'Faculty Development Seminar',
            date: '2024-08-15',
            startTime: '09:00',
            endTime: '12:00',
            location: 'CCS Auditorium',
            category: 'Seminar',
            status: 'upcoming',
            description: 'Annual faculty development and training seminar.',
          },
        ];
      }
      throw error;
    }
  }
  // ── Profile ───────────────────────────────────────────────────────────────

  async updateProfile(facultyId: string, data: ProfileUpdatePayload): Promise<FacultyPortalProfile> {
    try {
      const response = await api.put<FacultyPortalProfile>(
        `/admin/faculty/${facultyId}`,
        data,
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock updateProfile');
        return {
          id: facultyId,
          facultyId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          department: data.department,
          position: data.position,
          specialization: data.specialization,
          status: 'active',
        };
      }
      throw error;
    }
  }

  // ── Materials ─────────────────────────────────────────────────────────────

  async getMaterials(courseId: string): Promise<CourseMaterial[]> {
    try {
      const response = await api.get<CourseMaterial[] | { data: CourseMaterial[] }>(
        `/faculty/courses/${courseId}/materials`,
        { headers: this.getAuthHeader() }
      );
      const raw = response.data;
      return Array.isArray(raw) ? raw : (raw as { data: CourseMaterial[] }).data ?? [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock getMaterials');
        return [];
      }
      throw error;
    }
  }

  async uploadMaterial(courseId: string, file: File): Promise<CourseMaterial> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<CourseMaterial>(
        `/faculty/courses/${courseId}/materials`,
        formData,
        { headers: { ...this.getAuthHeader(), 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock uploadMaterial');
        return {
          id: `mat-${Date.now()}`,
          fileName: file.name,
          fileType: file.type,
          uploadDate: new Date().toISOString(),
          downloadUrl: '',
        };
      }
      throw error;
    }
  }

  async deleteMaterial(courseId: string, materialId: string): Promise<void> {
    try {
      await api.delete(`/faculty/courses/${courseId}/materials/${materialId}`, {
        headers: this.getAuthHeader(),
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, skipping deleteMaterial');
        return;
      }
      throw error;
    }
  }

  // ── Research (write) ──────────────────────────────────────────────────────

  async createResearchProject(facultyId: string, data: ResearchSubmissionPayload): Promise<FacultyResearchProject> {
    try {
      const response = await api.post<FacultyResearchProject>(
        `/admin/faculty/${facultyId}/research`,
        data,
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock createResearchProject');
        return {
          id: `res-${Date.now()}`,
          title: data.title,
          description: data.description,
          status: data.status,
          role: data.role,
        };
      }
      throw error;
    }
  }

  async updateResearchProject(facultyId: string, projectId: string, data: ResearchSubmissionPayload): Promise<FacultyResearchProject> {
    try {
      const response = await api.put<FacultyResearchProject>(
        `/admin/faculty/${facultyId}/research/${projectId}`,
        data,
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock updateResearchProject');
        return {
          id: projectId,
          title: data.title,
          description: data.description,
          status: data.status,
          role: data.role,
        };
      }
      throw error;
    }
  }

  // ── Event Participation ───────────────────────────────────────────────────

  async registerEventParticipation(eventId: string): Promise<EventParticipation> {
    try {
      const response = await api.post<EventParticipation>(
        `/faculty/events/${eventId}/participate`,
        {},
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock registerEventParticipation');
        return {
          id: `part-${Date.now()}`,
          eventId,
          eventTitle: '',
          eventDate: new Date().toISOString(),
          status: 'registered',
        };
      }
      throw error;
    }
  }

  async getMyParticipation(): Promise<EventParticipation[]> {
    try {
      const response = await api.get<EventParticipation[] | { data: EventParticipation[] }>(
        '/faculty/events/participation',
        { headers: this.getAuthHeader() }
      );
      const raw = response.data;
      return Array.isArray(raw) ? raw : (raw as { data: EventParticipation[] }).data ?? [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock getMyParticipation');
        return [];
      }
      throw error;
    }
  }

  // ── Skills ────────────────────────────────────────────────────────────────

  async getSkills(): Promise<FacultyPortalSkill[]> {
    try {
      const response = await api.get<FacultyPortalSkill[] | { data: FacultyPortalSkill[] }>(
        '/faculty/profile/skills',
        { headers: this.getAuthHeader() }
      );
      const raw = response.data;
      return Array.isArray(raw) ? raw : (raw as { data: FacultyPortalSkill[] }).data ?? [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock getSkills');
        return [];
      }
      throw error;
    }
  }

  async updateSkills(skills: FacultyPortalSkill[]): Promise<FacultyPortalSkill[]> {
    try {
      const response = await api.put<FacultyPortalSkill[] | { data: FacultyPortalSkill[] }>(
        '/faculty/profile/skills',
        { skills },
        { headers: this.getAuthHeader() }
      );
      const raw = response.data;
      return Array.isArray(raw) ? raw : (raw as { data: FacultyPortalSkill[] }).data ?? [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock updateSkills');
        return skills;
      }
      throw error;
    }
  }

  // ── Affiliations ──────────────────────────────────────────────────────────

  async getAffiliations(): Promise<FacultyPortalAffiliation[]> {
    try {
      const response = await api.get<FacultyPortalAffiliation[] | { data: FacultyPortalAffiliation[] }>(
        '/faculty/profile/affiliations',
        { headers: this.getAuthHeader() }
      );
      const raw = response.data;
      return Array.isArray(raw) ? raw : (raw as { data: FacultyPortalAffiliation[] }).data ?? [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock getAffiliations');
        return [];
      }
      throw error;
    }
  }

  async updateAffiliations(affiliations: FacultyPortalAffiliation[]): Promise<FacultyPortalAffiliation[]> {
    try {
      const response = await api.put<FacultyPortalAffiliation[] | { data: FacultyPortalAffiliation[] }>(
        '/faculty/profile/affiliations',
        { affiliations },
        { headers: this.getAuthHeader() }
      );
      const raw = response.data;
      return Array.isArray(raw) ? raw : (raw as { data: FacultyPortalAffiliation[] }).data ?? [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock updateAffiliations');
        return affiliations;
      }
      throw error;
    }
  }

  // ── Student Participation ─────────────────────────────────────────────────

  async getParticipation(subjectId: string, date?: string): Promise<StudentParticipationRecord[]> {
    try {
      const response = await api.get<StudentParticipationRecord[] | { data: StudentParticipationRecord[] }>(
        `/faculty/courses/${subjectId}/participation`,
        { params: date ? { date } : {}, headers: this.getAuthHeader() }
      );
      const raw = response.data;
      return Array.isArray(raw) ? raw : (raw as { data: StudentParticipationRecord[] }).data ?? [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock getParticipation');
        return [];
      }
      throw error;
    }
  }

  async submitParticipation(subjectId: string, payload: ParticipationSubmission): Promise<void> {
    try {
      await api.post(
        `/faculty/courses/${subjectId}/participation`,
        payload,
        { headers: this.getAuthHeader() }
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, skipping submitParticipation');
        return;
      }
      throw error;
    }
  }
}

export default new FacultyPortalService();
