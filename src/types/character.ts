export type ConsistencyLevel = "baixa" | "media" | "alta" | "muito-alta";

export const CONSISTENCY_LEVEL_OPTIONS: { value: ConsistencyLevel; label: string }[] = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "muito-alta", label: "Muito alta" },
];

export type CharacterReferenceType = "frente" | "perfil" | "costas" | "corpo-inteiro" | "outro";

export const CHARACTER_REFERENCE_TYPE_OPTIONS: { value: CharacterReferenceType; label: string }[] = [
  { value: "frente", label: "Frente" },
  { value: "perfil", label: "Perfil" },
  { value: "costas", label: "Costas" },
  { value: "corpo-inteiro", label: "Corpo inteiro" },
  { value: "outro", label: "Outro" },
];

export interface CharacterImage {
  id: string;
  characterId: string;
  blobUrl: string;
  fileName: string;
  fileType: string;
  referenceType: CharacterReferenceType;
  order: number;
  uploadedAt: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  gender: string;
  age: number;
  height: string;
  skinColor: string;
  eyeColor: string;
  faceShape: string;
  hairColor: string;
  hairLength: string;
  hairType: string;
  bodyType: string;
  weight: string;
  tattoos: string;
  piercings: string;
  accessories: string;
  style: string;
  notes: string;
  basePrompt: string;
  consistencyLevel: ConsistencyLevel;
  createdAt: string;
  updatedAt: string;
}

/** Cheap list-view shape: cover image + count only, not every image (see src/lib/characters.ts). */
export interface CharacterSummary extends CharacterProfile {
  coverImageUrl: string | null;
  imageCount: number;
}

export interface CharacterWithImages extends CharacterProfile {
  images: CharacterImage[];
}

export type CharacterInput = Omit<CharacterProfile, "id" | "createdAt" | "updatedAt">;
