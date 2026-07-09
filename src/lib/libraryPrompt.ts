import { LibraryModule, LibrarySelections } from "@/types/library";

/**
 * Turns Library selections into a prompt-ready enrichment string. Generic over whatever modules
 * are passed in — works identically for scenario, clothing, pose, camera or lighting selections
 * (or several merged together), since it only reads each module's declared fields. Adding a new
 * module or a whole new library requires no change here.
 */
export function buildLibraryEnrichment(
  selections: LibrarySelections | undefined,
  modules: LibraryModule[]
): string {
  if (!selections) return "";

  const parts: string[] = [];

  for (const mod of modules) {
    if (!mod.active) continue;
    const selectedIds = selections[mod.id];
    if (!selectedIds || selectedIds.length === 0) continue;

    const keywords = mod.options
      .filter((opt) => opt.active && selectedIds.includes(opt.id))
      .map((opt) => opt.keywords);

    if (keywords.length === 0) continue;

    parts.push([mod.complementaryPrompt, ...keywords].filter(Boolean).join(", "));
  }

  return parts.join(", ");
}

/** Merges the per-library selection records into one lookup keyed by module id (module ids are
 * DB-generated and globally unique across libraries, so this is safe). */
export function mergeLibrarySelections(...selections: (LibrarySelections | undefined)[]): LibrarySelections {
  const merged: LibrarySelections = {};
  for (const sel of selections) {
    if (!sel) continue;
    Object.assign(merged, sel);
  }
  return merged;
}
