import { LibrarySelections } from "@/types/library";

export type ProviderId = "flux-dev" | "flux-schnell" | "flux-pro" | "sdxl" | "sd3";

export interface PromptFormState {
  // Subject
  age: number;
  gender: string;
  bodyType: string[]; // multi-select chip values
  bodyTypeCustom: string;
  skinTone: string;
  hair: string[]; // multi-select chip values
  hairCustom: string;
  distinguishingFeatures: string; // free text, sanitized

  // Face details
  faceShape: string;
  lips: string;
  nose: string;
  earrings: string;

  // Wardrobe
  wardrobeCategory: string[]; // multi-select chip values
  wardrobeCategoryCustom: string;
  wardrobeDetails: string; // color / pattern / material, free text
  accessories: string[]; // multi-select chip values
  accessoriesCustom: string;

  // Scene
  scene: string;
  sceneDetails: string; // free text: time of day, background extras

  // Composition
  pose: string[]; // multi-select chip values
  poseCustom: string;
  cameraAngle: string[]; // multi-select chip values
  cameraAngleCustom: string;
  lens: string;

  // Light & mood
  lighting: string;
  expression: string[]; // multi-select chip values
  expressionCustom: string;

  // Face visibility — controls whether/how the face appears (src/lib/faceVisibility.ts)
  faceVisibility: string;
  faceConcealmentStrength: string; // "normal" | "strong" | "absolute"

  // Enquadramento Anônimo — standalone anonymous/faceless composition module
  // (src/lib/anonymousFraming.ts). Additive: works alongside every other module.
  anonymousFramingEnabled: boolean;
  anonymousFramingType: string[]; // multi-select chip values
  anonymousFocusObject: string[]; // multi-select chip values
  anonymousFocusObjectCustom: string;
  anonymousEnvironment: string;
  anonymousPerson: string;
  anonymousHandDetails: string[]; // multi-select chip values — nails, jewelry, skin tone/texture
  anonymousHandDetailsCustom: string;
  anonymousCustomDescription: string; // free text, appended to the anonymous framing sentence

  // Photographic treatment
  style: string;
  aspectRatio: string;
  realism: string;

  // Generation
  provider: ProviderId;
  consentAccepted: boolean;

  // Universal Library selections — additive enrichment (moduleId -> selected option ids), one
  // record per library. `scenarioModuleSelections` keeps its original field name (predates the
  // other 4) for backward compatibility with already-saved templates/favorites/generations.
  scenarioModuleSelections: LibrarySelections;
  clothingSelections: LibrarySelections;
  poseSelections: LibrarySelections;
  cameraSelections: LibrarySelections;
  lightingSelections: LibrarySelections;

  // Character Library — optional saved identity that locks visual consistency on top of the
  // free-form "Personagem" fields above (src/lib/characterPrompt.ts).
  selectedCharacterId: string | null;
}

export const DEFAULT_FORM_STATE: PromptFormState = {
  age: 28,
  gender: "woman",
  bodyType: ["athletic muscular build"],
  bodyTypeCustom: "",
  skinTone: "tan skin tone",
  hair: ["long wavy blonde hair"],
  hairCustom: "",
  distinguishingFeatures: "",

  faceShape: "oval face shape",
  lips: "natural medium-full lips",
  nose: "straight refined nose",
  earrings: "no earrings",

  wardrobeCategory: ["fitted two-piece bikini"],
  wardrobeCategoryCustom: "",
  wardrobeDetails: "terracotta orange, minimal gold hardware",
  accessories: ["oversized sunglasses"],
  accessoriesCustom: "",

  scene: "sun-drenched tropical beach with turquoise water",
  sceneDetails: "late afternoon, soft breeze, blurred palm trees in background",

  pose: ["standing confidently with relaxed posture"],
  poseCustom: "",
  cameraAngle: ["eye-level angle"],
  cameraAngleCustom: "",
  lens: "85mm portrait lens with creamy bokeh",

  lighting: "warm golden hour sunlight",
  expression: ["relaxed genuine smile"],
  expressionCustom: "",

  faceVisibility: "face clearly visible, natural and unobstructed",
  faceConcealmentStrength: "normal",

  anonymousFramingEnabled: false,
  anonymousFramingType: [],
  anonymousFocusObject: [],
  anonymousFocusObjectCustom: "",
  anonymousEnvironment: "beach",
  anonymousPerson: "adult woman",
  anonymousHandDetails: [],
  anonymousHandDetailsCustom: "",
  anonymousCustomDescription: "",

  style: "high-fashion editorial photography",
  aspectRatio: "4:5",
  realism: "ultra-detailed photorealistic, shot on professional DSLR",

  provider: "flux-dev",
  consentAccepted: false,

  scenarioModuleSelections: {},
  clothingSelections: {},
  poseSelections: {},
  cameraSelections: {},
  lightingSelections: {},

  selectedCharacterId: null,
};
