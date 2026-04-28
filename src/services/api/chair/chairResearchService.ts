import api from '../axios';

export interface Research {
  id: string;
  title: string;
  abstract?: string;
  researchType: string;
  status: string;
  startDate?: string;
  completionDate?: string;
  publicationUrl?: string;
  authors: Array<{ id: string; name: string; role: string }>;
  advisers: Array<{ id: string; name: string; role: string }>;
  approvalStatus?: string;
}

export interface ChairResearchResponse {
  data: Research[];
  total: number;
  page: number;
  limit: number;
}

/** Map backend ResearchDTO (snake_case) to frontend Research (camelCase) */
function toResearch(raw: Record<string, unknown>): Research {
  // Map faculty_advisers array
  const rawAdvisers = (raw.faculty_advisers ?? raw.advisers ?? []) as Record<string, unknown>[];
  const advisers = rawAdvisers.map((a) => ({
    id:   a.id as string,
    name: a.name as string ?? `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim(),
    role: (a.adviser_role ?? a.role ?? 'adviser') as string,
  }));

  // Map student_researchers array
  const rawAuthors = (raw.student_researchers ?? raw.authors ?? []) as Record<string, unknown>[];
  const authors = rawAuthors.map((r) => ({
    id:   r.id as string,
    name: r.name as string ?? `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim(),
    role: (r.role ?? 'author') as string,
  }));

  return {
    id:             raw.id as string,
    title:          raw.title as string,
    abstract:       raw.abstract as string | undefined,
    researchType:   (raw.researchType ?? raw.research_type) as string,
    status:         raw.status as string,
    startDate:      (raw.startDate      ?? raw.start_date)      as string | undefined,
    completionDate: (raw.completionDate ?? raw.completion_date) as string | undefined,
    publicationUrl: (raw.publicationUrl ?? raw.publication_url) as string | undefined,
    authors,
    advisers,
    approvalStatus: (raw.approvalStatus ?? raw.approval_status) as string | undefined,
  };
}

class ChairResearchService {
  /**
   * Get research with filters and pagination
   */
  async getResearch(
    filters?: {
      researchType?: string;
      status?: string;
      approvalStatus?: string;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<ChairResearchResponse> {
    try {
      const params: Record<string, unknown> = {
        page,
        limit,
        ...(filters?.researchType   && { research_type: filters.researchType }),
        ...(filters?.status         && { status: filters.status }),
        ...(filters?.approvalStatus && { approval_status: filters.approvalStatus }),
      };

      const response = await api.get('/chair/research', { params });
      const raw = response.data;
      const items: Record<string, unknown>[] = raw.data ?? raw.research ?? raw;

      return {
        data:  Array.isArray(items) ? items.map(toResearch) : [],
        total: raw.meta?.total ?? raw.total ?? 0,
        page:  raw.meta?.page  ?? raw.page  ?? page,
        limit: raw.meta?.limit ?? raw.limit ?? limit,
      };
    } catch (error: any) {
      console.error('Error fetching research:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Get research by ID
   */
  async getResearchById(id: string): Promise<Research> {
    const response = await api.get(`/chair/research/${id}`);
    const raw = response.data.data ?? response.data;
    return toResearch(raw as Record<string, unknown>);
  }

  /**
   * Approve research
   */
  async approveResearch(id: string, notes?: string): Promise<any> {
    const response = await api.post(`/chair/research/${id}/approve`, { approver_notes: notes });
    return response.data;
  }

  /**
   * Reject research
   */
  async rejectResearch(id: string, notes: string): Promise<any> {
    const response = await api.post(`/chair/research/${id}/reject`, { rejection_reason: notes });
    return response.data;
  }

  /**
   * Get research statistics
   */
  async getResearchStats(): Promise<any> {
    try {
      const response = await api.get('/chair/research/stats');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching research stats:', error);
      return {
        total: 0,
        ongoing: 0,
        completed: 0,
        published: 0,
      };
    }
  }
}

export default new ChairResearchService();
