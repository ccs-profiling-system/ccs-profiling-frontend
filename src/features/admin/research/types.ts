export type ResearchStatus = 'ongoing' | 'completed' | 'published';

export interface ResearchFile {
  id: string;
  name: string;
  url: string;
}

export interface ResearchEvent {
  id: string;
  title: string;
  date: string; // ISO 8601
}

export interface Research {
  id: string;
  title: string;
  abstract: string;
  category: string;
  status: ResearchStatus;
  authors: string[];       // array of person IDs
  adviser: string;         // faculty ID
  files: ResearchFile[];
  events: ResearchEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateResearchPayload {
  title: string;
  abstract: string;
  category: string;
  status: ResearchStatus;
  authors: string[];
  adviser: string;
  files?: File[];
}

export interface UpdateResearchPayload extends Partial<Omit<CreateResearchPayload, 'files'>> {
  files?: File[];
}

export interface Person {
  id: string;
  name: string;
  role: 'student' | 'faculty';
}

export interface ResearchFilters {
  status?: ResearchStatus | '';
  category?: string;
  titleSearch?: string;
}
