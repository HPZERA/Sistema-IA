// Generic "Library" system — every selectable category in the Prompt Studio (scenario, clothing,
// pose, camera, lighting, ...) is a set of modules (categories), each holding options (items).
// Selecting an option enriches the final prompt automatically (src/lib/libraryPrompt.ts). New
// libraries can be added later just by introducing a new `LibraryKey` value — no other code
// changes are needed, since nothing here has library-specific logic.

export type LibraryKey = "scenario" | "clothing" | "pose" | "camera" | "lighting";

export const LIBRARY_KEYS: LibraryKey[] = ["scenario", "clothing", "pose", "camera", "lighting"];

export const LIBRARY_LABELS: Record<LibraryKey, string> = {
  scenario: "Cenários",
  clothing: "Roupas",
  pose: "Poses",
  camera: "Câmeras",
  lighting: "Iluminação",
};

export interface LibraryOption {
  /** Stable identifier, unique within the module (DB row id). */
  id: string;
  /** Module (category) this option belongs to. */
  moduleId: string;
  /** Portuguese label shown to the user. */
  label: string;
  /** English keyword phrase injected into the generated prompt. */
  keywords: string;
  /** Optional free-text note shown in manage mode; not injected into the prompt. */
  description: string;
  /** Display order within the module. */
  order: number;
  /** Whether the option is currently offered to users. */
  active: boolean;
}

export interface LibraryModule {
  /** Stable identifier, unique across all modules (DB row id). */
  id: string;
  /** Which library this module belongs to. */
  libraryKey: LibraryKey;
  /** Display name, e.g. "Praia". */
  name: string;
  /** Emoji icon shown on the module card. */
  icon: string;
  /** Grouping used for filtering/organization, e.g. "Externo", "Interno". */
  category: string;
  /** Baseline phrase always added once, if any option in this module is selected. */
  complementaryPrompt: string;
  /** Display order among modules within the same library. */
  order: number;
  /** Whether the module is currently offered to users. */
  active: boolean;
  /** Selectable options belonging to this module. */
  options: LibraryOption[];
}

/** moduleId -> selected option ids within that module. Same shape for every library. */
export type LibrarySelections = Record<string, string[]>;
