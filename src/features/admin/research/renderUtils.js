export function renderResearchDetails(r) {
    return {
        title: r.title,
        abstract: r.abstract,
        category: r.category,
        status: r.status,
        authors: r.authors,
        adviser: r.adviser,
    };
}
export function renderResearchFiles(files) {
    return files.map((f) => ({ name: f.name, url: f.url }));
}
/**
 * Returns a new file list with the file matching `fileId` removed.
 * Mirrors the client-side state update after a successful deleteResearchFile API call.
 * Used for property-based testing of Property 10.
 */
export function deleteFileFromList(files, fileId) {
    return files.filter((f) => f.id !== fileId);
}
