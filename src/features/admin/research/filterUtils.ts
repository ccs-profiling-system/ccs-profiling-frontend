import type { Research, ResearchFilters, ResearchStatus } from './types';

export function filterByStatus(records: Research[], status: ResearchStatus): Research[] {
  return records.filter((r) => r.status === status);
}

export function filterByCategory(records: Research[], category: string): Research[] {
  return records.filter((r) => r.category === category);
}

export function filterByTitle(records: Research[], search: string): Research[] {
  const lowerSearch = search.toLowerCase();
  return records.filter((r) => r.title.toLowerCase().includes(lowerSearch));
}

export function applyFilters(records: Research[], filters: ResearchFilters): Research[] {
  let result = records;

  if (filters.status && filters.status !== '') {
    result = filterByStatus(result, filters.status);
  }

  if (filters.category && filters.category !== '') {
    result = filterByCategory(result, filters.category);
  }

  if (filters.titleSearch && filters.titleSearch.trim() !== '') {
    result = filterByTitle(result, filters.titleSearch);
  }

  return result;
}
