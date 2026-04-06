import type { Research, ResearchFile } from './types';

/**
 * Returns a plain-object summary of the fields that must be present
 * on a research details view. Used for property-based testing of
 * rendering completeness (Property 4).
 */
export interface ResearchDetailsSummary {
  title: string;
  abstract: string;
  category: string;
  status: string;
  authors: string[];
  adviser: string;
}

export function renderResearchDetails(r: Research): ResearchDetailsSummary {
  return {
    title: r.title,
    abstract: r.abstract,
    category: r.category,
    status: r.status,
    authors: r.authors,
    adviser: r.adviser,
  };
}

/**
 * Returns a plain-object summary of each file that must be present
 * on a research details view. Used for property-based testing of
 * file rendering completeness (Property 11).
 */
export interface RenderedFile {
  name: string;
  url: string;
}

export function renderResearchFiles(files: ResearchFile[]): RenderedFile[] {
  return files.map((f) => ({ name: f.name, url: f.url }));
}

/**
 * Returns a new file list with the file matching `fileId` removed.
 * Mirrors the client-side state update after a successful deleteResearchFile API call.
 * Used for property-based testing of Property 10.
 */
export function deleteFileFromList(files: ResearchFile[], fileId: string): ResearchFile[] {
  return files.filter((f) => f.id !== fileId);
}
