export type ResearchStatus = 'ongoing' | 'completed' | 'published';

export interface ResearchFile {
  id: string;
  name: string;
  url: string;
}

export interface ResearchEvent {
  id: string;
  title: string;
  date: string;
}

export interface Research {
  id: string;
  title: string;
  abstract: string;
  category: string;
  status: ResearchStatus;
  authors: string[];
  adviser: string;
  files: ResearchFile[];
  events: ResearchEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ResearchFilters {
  search?: string;
  status?: string;
  category?: string;
}
