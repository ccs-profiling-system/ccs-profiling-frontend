/**
 * Returns records whose status matches the given status value.
 * If status is empty/undefined, returns all records.
 */
export function filterByStatus(records, status) {
    if (!status)
        return records;
    return records.filter((r) => r.status === status);
}
/**
 * Returns records whose category matches the given category value.
 * If category is empty/undefined, returns all records.
 */
export function filterByCategory(records, category) {
    if (!category || category.trim() === '')
        return records;
    return records.filter((r) => r.category === category);
}
/**
 * Returns records whose title contains the search string (case-insensitive).
 * If search is empty/undefined, returns all records.
 */
export function filterByTitle(records, search) {
    if (!search || search.trim() === '')
        return records;
    const lower = search.toLowerCase();
    return records.filter((r) => r.title.toLowerCase().includes(lower));
}
/**
 * Applies all active filters from a ResearchFilters object in combination.
 */
export function applyFilters(records, filters) {
    // Safety check: ensure records is an array
    if (!Array.isArray(records))
        return [];
    let result = records;
    result = filterByStatus(result, filters.status);
    result = filterByCategory(result, filters.category);
    result = filterByTitle(result, filters.titleSearch);
    return result;
}
