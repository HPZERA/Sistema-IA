import { CharacterProfile } from "@/types/character";

const CONSISTENCY_CLAUSE: Record<CharacterProfile["consistencyLevel"], string> = {
  baixa: "keep a loosely similar look to the reference character across generations",
  media: "keep a consistent look and recognizable identity matching the reference character across generations",
  alta: "maintain the same facial identity, features and body characteristics as the reference character across every generation",
  "muito-alta": "strictly preserve the exact same facial identity, facial features, and body characteristics as the reference character in every single generation, as if it were the same real photographed person",
};

function joinNonEmpty(parts: (string | undefined | null)[], sep = ", "): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(sep);
}

/** Turns a selected Character Library profile into a prompt enrichment clause that locks visual
 * identity, appended the same way scenario/library enrichment is (see src/lib/libraryPrompt.ts). */
export function buildCharacterEnrichment(character: CharacterProfile | undefined): string {
  if (!character) return "";

  const traits = joinNonEmpty([
    `${character.age}-year-old ${character.gender || "adult"}`,
    character.height,
    character.skinColor ? `${character.skinColor} skin` : "",
    character.eyeColor ? `${character.eyeColor} eyes` : "",
    character.faceShape ? `${character.faceShape} face shape` : "",
    joinNonEmpty([character.hairColor, character.hairLength, character.hairType, "hair"], " "),
    character.bodyType,
    character.weight,
    character.tattoos ? `tattoos: ${character.tattoos}` : "",
    character.piercings ? `piercings: ${character.piercings}` : "",
    character.accessories ? `accessories: ${character.accessories}` : "",
    character.style ? `${character.style} style` : "",
    character.notes,
  ]);

  const identity = `the recurring model ${character.name}: ${traits}`;
  const consistency = CONSISTENCY_CLAUSE[character.consistencyLevel];

  return joinNonEmpty([identity, consistency, character.basePrompt]);
}
