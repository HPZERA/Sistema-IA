import { PromptFormState } from "@/types/formState";
import { FACE_ANONYMITY_POSITIVE_CLAUSES, FACE_ANONYMITY_NEGATIVE_TERMS } from "@/lib/faceVisibility";

function joinNonEmpty(parts: (string | undefined | null)[], sep = ", "): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(sep);
}

/** Master switch for the "Enquadramento Anônimo" module — everything below only reaches the
 * final prompt when this is on, so the module stays purely additive to every other field. */
export function isAnonymousFramingActive(state: PromptFormState): boolean {
  return state.anonymousFramingEnabled;
}

/** Positive-prompt clause: selected person/framing/object/environment plus the shared anonymity
 * clauses (src/lib/faceVisibility.ts) that force the face out of the shot no matter what other
 * modules (pose, camera, scene...) would otherwise imply. */
export function buildAnonymousFramingPositiveClause(state: PromptFormState): string {
  if (!isAnonymousFramingActive(state)) return "";

  const framingType = joinNonEmpty(state.anonymousFramingType);
  const focusObject = joinNonEmpty([...state.anonymousFocusObject, state.anonymousFocusObjectCustom]);

  const description = joinNonEmpty([
    state.anonymousPerson,
    framingType,
    focusObject ? `with focus on ${focusObject}` : "",
    state.anonymousEnvironment ? `in a ${state.anonymousEnvironment} setting` : "",
  ]);

  return joinNonEmpty([description, FACE_ANONYMITY_POSITIVE_CLAUSES.join(", ")]);
}

/** Negative-prompt terms enforcing anonymity — only contributed while the module is active. */
export function buildAnonymousFramingNegativeTerms(state: PromptFormState): string {
  if (!isAnonymousFramingActive(state)) return "";
  return FACE_ANONYMITY_NEGATIVE_TERMS;
}

export interface AnonymousFramingPreset {
  label: string;
  person: string;
  framingType: string[];
  focusObject: string[];
  environment: string;
}

// Ready-made examples from the product spec — applying one fills every category at once and
// switches the module on.
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
