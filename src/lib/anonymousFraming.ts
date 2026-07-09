import { AnonymousFramingState } from "@/types/anonymousFraming";
import { FACE_ANONYMITY_POSITIVE_CLAUSES } from "@/lib/faceVisibility";
import { MANDATORY_SAFETY_NEGATIVE_TERMS } from "@/lib/safety";

function joinNonEmpty(parts: (string | undefined | null)[], sep = ", "): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(sep);
}

interface FramingRule {
  /** Primary composition description for this framing (what IS in frame). */
  crop: string;
  /** "no X" / hidden-face style clauses specific to this framing (what must NOT be in frame). */
  exclusions: string[];
}

// Maps each ANONYMOUS_FRAMING_TYPE_OPTIONS value (src/types/promptOptions.ts) to the exact
// crop/exclusion wording the product spec calls for per framing (hand-only, arm-only, knees-down,
// from-behind, mirror-selfie...). Selecting one of these must never still describe a full body —
// that's what buildAnonymousFramingPrompt below uses this table to prevent.
const FRAMING_RULES: Record<string, FramingRule> = {
  "close-up of a hand only, no face visible": {
    crop: "only hand visible, close-up composition",
    exclusions: ["no face", "no body", "no eyes", "no head", "no torso"],
  },
  "close-up of a hand holding an object, no face visible": {
    crop: "only hand visible, close-up composition",
    exclusions: ["no face", "no body", "no eyes", "no head", "no torso"],
  },
  "close-up of both hands only, no face visible": {
    crop: "only both hands visible, close-up composition",
    exclusions: ["no face", "no body", "no eyes", "no head", "no torso"],
  },
  "close-up of a hand with painted nails, no face visible": {
    crop: "only hand visible, close-up composition, painted nails in focus",
    exclusions: ["no face", "no body", "no eyes", "no head", "no torso"],
  },
  "close-up of a hand with a wristwatch, no face visible": {
    crop: "only hand and wrist visible, close-up composition, wristwatch in focus",
    exclusions: ["no face", "no body", "no eyes", "no head", "no torso"],
  },
  "close-up of a hand with bracelets, no face visible": {
    crop: "only hand and wrist visible, close-up composition, bracelets in focus",
    exclusions: ["no face", "no body", "no eyes", "no head", "no torso"],
  },
  "close-up of a hand with rings, no face visible": {
    crop: "only hand visible, close-up composition, rings in focus",
    exclusions: ["no face", "no body", "no eyes", "no head", "no torso"],
  },
  "close-up of a single arm only, no face visible": {
    crop: "only arm visible",
    exclusions: ["no face", "no head", "no full body"],
  },
  "close-up of an arm and hand, no face visible": {
    crop: "only arm and hand visible",
    exclusions: ["no face visible"],
  },
  "close-up of an arm and hand holding an object, no face visible": {
    crop: "only arm and hand visible",
    exclusions: ["no face visible"],
  },
  "close-up of arm, wrist and hand, no face visible": {
    crop: "only arm, wrist and hand visible",
    exclusions: ["no face visible"],
  },
  "close-up of feet in the sand, no head, torso or face visible": {
    crop: "only feet visible, feet in the sand",
    exclusions: ["no head", "no torso", "no face"],
  },
  "silhouette shot, face not visible": {
    crop: "silhouette shot",
    exclusions: ["face not visible", "no facial features visible"],
  },
  "framing from the knees down only, head and face not visible": {
    crop: "only legs from knees down visible, feet visible",
    exclusions: ["no upper body", "no torso", "no face"],
  },
  "close-up of legs only, no head, torso or face visible": {
    crop: "only legs visible",
    exclusions: ["no head", "no torso", "no face"],
  },
  "close-up of feet only, no head, torso or face visible": {
    crop: "only feet visible",
    exclusions: ["no head", "no torso", "no face"],
  },
  "photographed from behind, back to camera, face not visible": {
    crop: "person photographed from behind",
    exclusions: ["face fully hidden", "no facial profile", "no eyes visible"],
  },
  "side framing with the face turned away, face not visible": {
    crop: "side framing with the face turned away",
    exclusions: ["no facial profile", "no eyes visible"],
  },
  "full body shot, face excluded from the frame": {
    crop: "full body shot",
    exclusions: ["face excluded from the frame", "no face visible"],
  },
  "framing from the neck down, head and face not visible": {
    crop: "framed from the neck down",
    exclusions: ["no head", "no face"],
  },
  "framing from the shoulders down, head and face not visible": {
    crop: "framed from the shoulders down",
    exclusions: ["no head", "no face"],
  },
  "framing from the chest down, head and face not visible": {
    crop: "framed from the chest down",
    exclusions: ["no head", "no face"],
  },
  "framing from the waist down, head and face not visible": {
    crop: "framed from the waist down",
    exclusions: ["no head", "no face"],
  },
  "mirror selfie with the phone completely covering the face": {
    crop: "mirror selfie",
    exclusions: ["smartphone completely covering the face", "no reflection of face visible"],
  },
  "person inside a car, framed so the face is not visible": {
    crop: "person framed inside a car",
    exclusions: ["no face visible"],
  },
};

// Framing types whose "Objeto em foco" selection should read as "hand holding [object]" rather
// than a looser "featuring [object]" — any hand/arm-only crop, since a selected object alongside
// one of these reads naturally as being held.
const HAND_HOLDING_FRAMING_TYPES = new Set([
  "close-up of a hand only, no face visible",
  "close-up of a hand holding an object, no face visible",
  "close-up of both hands only, no face visible",
  "close-up of a hand with painted nails, no face visible",
  "close-up of a hand with a wristwatch, no face visible",
  "close-up of a hand with bracelets, no face visible",
  "close-up of a hand with rings, no face visible",
  "close-up of a single arm only, no face visible",
  "close-up of an arm and hand, no face visible",
  "close-up of an arm and hand holding an object, no face visible",
  "close-up of arm, wrist and hand, no face visible",
]);

const DEFAULT_FRAMING_RULE: FramingRule = {
  crop: "no body above the selected crop",
  exclusions: [],
};

// Environment values that already read naturally with a leading preposition
// (e.g. "inside a car", "in front of a large mirror") shouldn't get a second one prepended.
function environmentPhrase(environment: string): string {
  if (!environment) return "";
  if (/^(in|on|inside|at)\b/i.test(environment)) return environment;
  return `at the ${environment}`;
}

/**
 * Builds the entire prompt for the "Enquadramento Anônimo" page from every field it exposes:
 * pessoa, parte visível, objeto em foco, ambiente, detalhes da mão/braço, iluminação, câmera and
 * prompt personalizado (src/types/anonymousFraming.ts). Pure function of that state alone — it
 * never reads anything from the main Prompt Studio (src/lib/promptBuilder.ts).
 */
export function buildAnonymousFramingPrompt(state: AnonymousFramingState): string {
  const person = state.person || "adult person";
  const environment = state.environment;
  const focusObject = joinNonEmpty([...state.focusObject, state.focusObjectCustom]);
  const handDetails = joinNonEmpty([...state.handDetails, state.handDetailsCustom]);
  const cameraDetails = joinNonEmpty(state.camera);

  const selectedTypes = state.framingType;
  const rules = selectedTypes.length
    ? selectedTypes.map((t) => FRAMING_RULES[t] ?? DEFAULT_FRAMING_RULE)
    : [DEFAULT_FRAMING_RULE];
  const holdsObject = selectedTypes.some((t) => HAND_HOLDING_FRAMING_TYPES.has(t));

  const crop = joinNonEmpty(rules.map((r) => r.crop));
  const objectClause = focusObject ? (holdsObject ? `holding ${focusObject}` : `featuring ${focusObject}`) : "";
  const exclusions = Array.from(new Set(rules.flatMap((r) => r.exclusions)));

  return joinNonEmpty([
    `Ultra-realistic anonymous lifestyle photograph of an ${person}${environment ? ` ${environmentPhrase(environment)}` : ""}`,
    crop || objectClause ? `showing ${joinNonEmpty([crop, objectClause])}` : "",
    environment ? `${environment} blurred in the background` : "",
    joinNonEmpty(exclusions),
    FACE_ANONYMITY_POSITIVE_CLAUSES.join(", "),
    "no body above the selected crop",
    handDetails,
    state.lighting,
    cameraDetails,
    state.customPrompt,
    "photorealistic, authentic smartphone photography, natural color grading",
  ]);
}

/** Fixed negative-prompt terms for the Enquadramento Anônimo page — always the same regardless of
 * which fields are selected, so the model never renders a face, extra body parts or AI artifacts. */
export const ANONYMOUS_FRAMING_NEGATIVE_TERMS =
  "visible face, eyes, facial features, head, torso, full body, portrait, front-facing person, profile face, face reflection, mirror reflection, recognizable identity, extra fingers, deformed hand, bad anatomy, plastic skin, waxy skin, oversaturated colors, AI-looking image";

/** Full negative prompt for this page: the fixed anonymity/quality terms above plus the app-wide
 * mandatory safety terms (nudity, minors, ...) — never the main Prompt Studio's negative prompt. */
export function buildAnonymousFramingNegativePrompt(): string {
  return joinNonEmpty([MANDATORY_SAFETY_NEGATIVE_TERMS, ANONYMOUS_FRAMING_NEGATIVE_TERMS]);
}

export interface AnonymousFramingPreset {
  label: string;
  person: string;
  framingType: string[];
  focusObject: string[];
  environment: string;
}

// Ready-made examples from the product spec — applying one fills every category at once.
export const ANONYMOUS_FRAMING_PRESETS: AnonymousFramingPreset[] = [
  {
    label: "Mulher adulta na praia segurando um copo, mostrando apenas braço, mão e copo.",
    person: "adult woman",
    framingType: ["close-up of an arm and hand holding an object, no face visible"],
    focusObject: ["glass"],
    environment: "beach",
  },
  {
    label: "Homem adulto segurando chope, mostrando apenas braço e mão.",
    person: "adult man",
    framingType: ["close-up of an arm and hand holding an object, no face visible"],
    focusObject: ["glass of draft beer"],
    environment: "bar",
  },
  {
    label: "Mulher adulta de costas indo para uma festa.",
    person: "adult woman",
    framingType: ["photographed from behind, back to camera, face not visible"],
    focusObject: [],
    environment: "party",
  },
  {
    label: "Homem adulto de costas dentro da piscina.",
    person: "adult man",
    framingType: ["photographed from behind, back to camera, face not visible"],
    focusObject: [],
    environment: "swimming pool",
  },
  {
    label: "Mulher adulta dentro de uma Porsche, mostrando apenas mão no volante.",
    person: "adult woman",
    framingType: ["close-up of a hand holding an object, no face visible"],
    focusObject: ["car steering wheel"],
    environment: "inside a Porsche",
  },
  {
    label: "Mulher adulta apoiando a mão em uma Porsche, sem rosto visível.",
    person: "adult woman",
    framingType: ["close-up of a hand only, no face visible"],
    focusObject: ["Porsche sports car"],
    environment: "inside a Porsche",
  },
  {
    label: "Foto de pernas e pés na areia da praia.",
    person: "adult woman",
    framingType: [
      "close-up of legs only, no head, torso or face visible",
      "close-up of feet only, no head, torso or face visible",
    ],
    focusObject: [],
    environment: "beach",
  },
  {
    label: "Selfie no espelho com celular cobrindo completamente o rosto.",
    person: "adult woman",
    framingType: ["mirror selfie with the phone completely covering the face"],
    focusObject: ["smartphone"],
    environment: "in front of a large mirror",
  },
];
