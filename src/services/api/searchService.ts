import api from './axios';

export interface SearchResult {
  id: string;
  type: 'student' | 'faculty' | 'event' | 'research';
  title: string;
  subtitle?: string;
  metadata?: Record<string, any>;
}

export interface StudentSearchResult {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  program?: string;
  year_level?: number;
  status: string;
}

export interface FacultySearchResult {
  id: string;
  faculty_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  department: string;
  position?: string;
  status: string;
}

export interface EventSearchResult {
  id: string;
  event_name: string;
  event_type: string;
  description?: string;
  event_date: string;
  location?: string;
}

export interface ResearchSearchResult {
  id: string;
  title: string;
  research_type: string;
  status: string;
  start_date?: string;
  authors?: string;
}

export interface GlobalSearchResponse {
  students: StudentSearchResult[];
  faculty: FacultySearchResult[];
  events: EventSearchResult[];
  research: ResearchSearchResult[];
  meta: {
    total: number;
    query: string;
    executionTime: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
}

const searchService = {
  /**
   * Global search across all entities
   */
  async globalSearch(query: string, type?: 'students' | 'faculty' | 'events' | 'research'): Promise<GlobalSearchResponse> {
    const params: any = { q: query };
    if (type) params.type = type;
    
    const response = await api.get<ApiResponse<GlobalSearchResponse>>('/v1/admin/search', { params });
    return response.data.data;
  },

  /**
   * Search students only
   */
  async searchStudents(query: string): Promise<StudentSearchResult[]> {
    const response = await api.get<ApiResponse<StudentSearchResult[]>>('/v1/admin/search/students', {
      params: { q: query }
    });
    return response.data.data;
  },

  /**
   * Search faculty only
   */
  async searchFaculty(query: string): Promise<FacultySearchResult[]> {
    const response = await api.get<ApiResponse<FacultySearchResult[]>>('/v1/admin/search/faculty', {
      params: { q: query }
    });
    return response.data.data;
  },

  /**
   * Search events only
   */
  async searchEvents(query: string): Promise<EventSearchResult[]> {
    const response = await api.get<ApiResponse<EventSearchResult[]>>('/v1/admin/search/events', {
      params: { q: query }
    });
    return response.data.data;
  },

  /**
   * Search research only
   */
  async searchResearch(query: string): Promise<ResearchSearchResult[]> {
    const response = await api.get<ApiResponse<ResearchSearchResult[]>>('/v1/admin/search/research', {
      params: { q: query }
    });
    return response.data.data;
  },

  /**
   * Convert global search results to unified SearchResult format
   */
  formatGlobalResults(results: GlobalSearchResponse): SearchResult[] {
    const formatted: SearchResult[] = [];

    results.students.forEach(s => {
      formatted.push({
        id: s.id,
        type: 'student',
        title: `${s.first_name} ${s.last_name}`,
        subtitle: `${s.student_id} • ${s.program || 'N/A'}`,
        metadata: s
      });
    });

    results.faculty.forEach(f => {
      formatted.push({
        id: f.id,
        type: 'faculty',
        title: `${f.first_name} ${f.last_name}`,
        subtitle: `${f.faculty_id} • ${f.department}`,
        metadata: f
      });
    });

    results.events.forEach(e => {
      formatted.push({
        id: e.id,
        type: 'event',
        title: e.event_name,
        subtitle: `${e.event_type} • ${new Date(e.event_date).toLocaleDateString()}`,
        metadata: e
      });
    });

    results.research.forEach(r => {
      formatted.push({
        id: r.id,
        type: 'research',
        title: r.title,
        subtitle: `${r.research_type} • ${r.status}`,
        metadata: r
      });
    });

    return formatted;
  }
};

export default searchService;
