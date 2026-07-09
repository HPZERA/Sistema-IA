import { PromptFormState } from "@/types/formState";
import { BASE_QUALITY_NEGATIVE_TERMS, MANDATORY_SAFETY_NEGATIVE_TERMS } from "@/lib/safety";
import { PHOTOGRAPHY_STANDARD_CLAUSE, PHOTOGRAPHY_STANDARD_NEGATIVE_TERMS } from "@/lib/photographyStandard";
import { buildLibraryEnrichment, mergeLibrarySelections } from "@/lib/libraryPrompt";
import { buildCharacterEnrichment } from "@/lib/characterPrompt";
import { buildFaceVisibilityNegativeTerms, buildFaceVisibilityPositiveClause } from "@/lib/faceVisibility";
import { buildAnonymousFramingNegativeTerms, buildAnonymousFramingPrompt, isAnonymousFramingActive } from "@/lib/anonymousFraming";
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

/** Multi-select chip fields (hair, wardrobe category, pose, camera angle, expression) all follow
 * the same shape: a list of preset values plus one free-text "custom" field the user can fill in
 * alongside (or instead of) the presets. */
function joinSelectionWithCustom(values: string[], custom: string): string {
  return joinNonEmpty([...values, custom]);
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
  const libraryEnrichment = libraryEnrichmentFor(state, libraries);
  const characterEnrichment = buildCharacterEnrichment(character);

  // The "Enquadramento Anônimo" module takes priority over the standard full-body
  // subject/wardrobe/pose sentence below — otherwise a "somente mão"/"somente braço" selection
  // would still describe a full body in frame alongside the anonymity clauses.
  if (isAnonymousFramingActive(state)) {
    const cameraAngle = joinSelectionWithCustom(state.cameraAngle, state.cameraAngleCustom);
    const sentence = [
      `${buildAnonymousFramingPrompt(state)}.`,
      cameraAngle || state.lens ? `Shot at ${joinNonEmpty([cameraAngle, state.lens])}.` : "",
      state.lighting ? `Lit by ${state.lighting}.` : "",
      joinNonEmpty([state.style, state.realism]) ? `${joinNonEmpty([state.style, state.realism])}.` : "",
      libraryEnrichment ? `Additional details: ${libraryEnrichment}.` : "",
      characterEnrichment ? `Character identity: ${characterEnrichment}.` : "",
    ].join(" ");
    return sentence.replace(/\s+/g, " ").trim();
  }

  const bodyType = joinSelectionWithCustom(state.bodyType, state.bodyTypeCustom);
  const hair = joinSelectionWithCustom(state.hair, state.hairCustom);
  const wardrobeCategory = joinSelectionWithCustom(state.wardrobeCategory, state.wardrobeCategoryCustom);
  const pose = joinSelectionWithCustom(state.pose, state.poseCustom);
  const cameraAngle = joinSelectionWithCustom(state.cameraAngle, state.cameraAngleCustom);
  const expression = joinSelectionWithCustom(state.expression, state.expressionCustom);

  const subject = joinNonEmpty([
    ageDescriptor(state.age),
    state.gender,
    bodyType,
    state.skinTone,
    hair,
    state.faceShape,
    state.lips,
    state.nose,
    state.earrings,
    state.distinguishingFeatures,
  ]);

  const wardrobe = joinNonEmpty([
    `wearing ${wardrobeCategory}`,
    state.wardrobeDetails,
  ]);

  const accessories = joinNonEmpty([...state.accessories, state.accessoriesCustom]);

  const scene = joinNonEmpty([state.scene, state.sceneDetails]);
  const faceVisibilityClause = buildFaceVisibilityPositiveClause(state);

  const sentence = [
    `Editorial fashion photograph of a ${subject},`,
    `${wardrobe}${accessories ? `, accessorized with ${accessories}` : ""},`,
    `${pose}, in ${scene}.`,
    `Shot at ${cameraAngle} with a ${state.lens},`,
    `lit by ${state.lighting}, ${expression}.`,
    `${state.style}, ${state.realism}.`,
    faceVisibilityClause ? `Face visibility: ${faceVisibilityClause}.` : "",
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
  // Same override priority as buildNaturalLanguagePrompt above: an active "Enquadramento
  // Anônimo" module replaces the full-body subject/wardrobe/pose tags entirely.
  if (isAnonymousFramingActive(state)) {
    const tags = [
      buildAnonymousFramingPrompt(state),
      ...state.cameraAngle,
      state.cameraAngleCustom,
      state.lens,
      state.lighting,
      state.style,
      state.realism,
      libraryEnrichmentFor(state, libraries),
      buildCharacterEnrichment(character),
    ];
    return tags.map((t) => t?.trim()).filter(Boolean).join(", ");
  }

  const tags = [
    ageDescriptor(state.age),
    state.gender,
    ...state.bodyType,
    state.bodyTypeCustom,
    state.skinTone,
    ...state.hair,
    state.hairCustom,
    state.faceShape,
    state.lips,
    state.nose,
    state.earrings,
    state.distinguishingFeatures,
    `wearing ${joinSelectionWithCustom(state.wardrobeCategory, state.wardrobeCategoryCustom)}`,
    state.wardrobeDetails,
    ...state.accessories,
    state.accessoriesCustom,
    ...state.pose,
    state.poseCustom,
    state.scene,
    state.sceneDetails,
    ...state.cameraAngle,
    state.cameraAngleCustom,
    state.lens,
    state.lighting,
    ...state.expression,
    state.expressionCustom,
    state.style,
    state.realism,
    buildFaceVisibilityPositiveClause(state),
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

export function buildNegativePrompt(state?: PromptFormState, userNegativeExtra?: string): string {
  // PHOTOGRAPHY_STANDARD_NEGATIVE_TERMS forbids "cropped limbs/hands/feet, awkward cropping" —
  // that directly fights the Enquadramento Anônimo module, which deliberately crops to a hand,
  // arm, or legs-only shot, so it's dropped while that module is active.
  const anonymousActive = state ? isAnonymousFramingActive(state) : false;
  return joinNonEmpty([
    MANDATORY_SAFETY_NEGATIVE_TERMS,
    BASE_QUALITY_NEGATIVE_TERMS,
    anonymousActive ? "" : PHOTOGRAPHY_STANDARD_NEGATIVE_TERMS,
    state ? buildFaceVisibilityNegativeTerms(state) : "",
    state ? buildAnonymousFramingNegativeTerms(state) : "",
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
