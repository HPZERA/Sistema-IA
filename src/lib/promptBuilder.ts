import { PromptFormState } from "@/types/formState";
import { BASE_QUALITY_NEGATIVE_TERMS, MANDATORY_SAFETY_NEGATIVE_TERMS } from "@/lib/safety";
import { PHOTOGRAPHY_STANDARD_CLAUSE, PHOTOGRAPHY_STANDARD_NEGATIVE_TERMS } from "@/lib/photographyStandard";
import { buildLibraryEnrichment, mergeLibrarySelections } from "@/lib/libraryPrompt";
import { buildCharacterEnrichment } from "@/lib/characterPrompt";
import { LibraryModule } from "@/types/library";
import { CharacterProfile } from "@/types/character";

function ageDescriptor(age: number): string {
  if (age < 25) return `${age}-year-old young adult`;
  if (age < 40) return `${age}-year-old adult`;
  return `${age}-year-old mature adult`;
}

function joinNonEmpty(parts: (string | undefined | null)[], sep = ", "): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(sep);
}

function libraryEnrichmentFor(state: PromptFormState, libraries: LibraryModule[]): string {
  const merged = mergeLibrarySelections(
    state.scenarioModuleSelections,
    state.clothingSelections,
    state.poseSelections,
    state.cameraSelections,
    state.lightingSelections
  );
  return buildLibraryEnrichment(merged, libraries);
}

/** FLUX and other natural-language T2I models respond best to a flowing descriptive sentence.
 * `libraries` is the flat list of Library modules (any/all of scenario, clothing, pose, camera,
 * lighting) needed to resolve the state's selections into prompt keywords; `character` is the
 * optionally-selected saved Character Library profile. Both are pure data — no DB access happens
 * here — so this stays safely importable from client components. */
export function buildNaturalLanguagePrompt(
  state: PromptFormState,
  libraries: LibraryModule[] = [],
  character?: CharacterProfile
): string {
  const subject = joinNonEmpty([
    ageDescriptor(state.age),
    state.gender,
    state.bodyType,
    state.skinTone,
    state.hair,
    state.distinguishingFeatures,
  ]);

  const wardrobe = joinNonEmpty([
    `wearing a ${state.wardrobeCategory}`,
    state.wardrobeDetails,
  ]);

  const accessories = joinNonEmpty([...state.accessories, state.accessoriesCustom]);

  const pose = joinNonEmpty([state.pose, state.poseCustom]);
  const scene = joinNonEmpty([state.scene, state.sceneDetails]);
  const libraryEnrichment = libraryEnrichmentFor(state, libraries);
  const characterEnrichment = buildCharacterEnrichment(character);

  const sentence = [
    `Editorial fashion photograph of a ${subject},`,
    `${wardrobe}${accessories ? `, accessorized with ${accessories}` : ""},`,
    `${pose}, in ${scene}.`,
    `Shot at ${state.cameraAngle} with a ${state.lens},`,
    `lit by ${state.lighting}, ${state.expression}.`,
    `${state.style}, ${state.realism}.`,
    libraryEnrichment ? `Additional details: ${libraryEnrichment}.` : "",
    characterEnrichment ? `Character identity: ${characterEnrichment}.` : "",
    PHOTOGRAPHY_STANDARD_CLAUSE,
  ].join(" ");

  return sentence.replace(/\s+/g, " ").trim();
}

/** SD/SDXL-family models generally respond better to comma-separated tag prompts. */
export function buildTagStylePrompt(
  state: PromptFormState,
  libraries: LibraryModule[] = [],
  character?: CharacterProfile
): string {
  const tags = [
    ageDescriptor(state.age),
    state.gender,
    state.bodyType,
    state.skinTone,
    state.hair,
    state.distinguishingFeatures,
    `wearing ${state.wardrobeCategory}`,
    state.wardrobeDetails,
    ...state.accessories,
    state.accessoriesCustom,
    state.pose,
    state.poseCustom,
    state.scene,
    state.sceneDetails,
    state.cameraAngle,
    state.lens,
    state.lighting,
    state.expression,
    state.style,
    state.realism,
    libraryEnrichmentFor(state, libraries),
    buildCharacterEnrichment(character),
    PHOTOGRAPHY_STANDARD_CLAUSE,
  ];
  return tags.map((t) => t?.trim()).filter(Boolean).join(", ");
}

export function buildPromptForProvider(
  state: PromptFormState,
  libraries: LibraryModule[] = [],
  character?: CharacterProfile
): string {
  if (state.provider === "sdxl" || state.provider === "sd3") {
    return buildTagStylePrompt(state, libraries, character);
  }
  return buildNaturalLanguagePrompt(state, libraries, character);
}

export function buildNegativePrompt(userNegativeExtra?: string): string {
  return joinNonEmpty([
    MANDATORY_SAFETY_NEGATIVE_TERMS,
    BASE_QUALITY_NEGATIVE_TERMS,
    PHOTOGRAPHY_STANDARD_NEGATIVE_TERMS,
    userNegativeExtra,
  ]);
}

/** Parses "W:H" style aspect ratios into a concrete pixel size for image-generation APIs. */
export function aspectRatioToSize(aspectRatio: string, maxDimension = 1024): { width: number; height: number } {
  const [wRatio, hRatio] = aspectRatio.split(":").map(Number);
  if (!wRatio || !hRatio) return { width: maxDimension, height: maxDimension };

  const roundTo16 = (n: number) => Math.max(16, Math.round(n / 16) * 16);

  if (wRatio >= hRatio) {
    const width = maxDimension;
    const height = roundTo16((maxDimension * hRatio) / wRatio);
    return { width, height };
  }
  const height = maxDimension;
  const width = roundTo16((maxDimension * wRatio) / hRatio);
  return { width, height };
}
