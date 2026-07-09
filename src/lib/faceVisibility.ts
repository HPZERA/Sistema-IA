import { FACE_VISIBILITY_OPTIONS } from "@/types/promptOptions";
import { PromptFormState } from "@/types/formState";

// Appended to the positive prompt whenever the selected framing hides the face, so the model is
// steered away from generating one even if other fields (pose, camera angle) imply a portrait.
export const FACE_ANONYMITY_POSITIVE_CLAUSES = [
  "no face visible",
  "no eyes visible",
  "no facial features visible",
  "no eye contact",
  "no reflection showing the face",
  "face completely hidden by framing, hair, camera angle or object",
  "do not generate any visible face",
  "do not show profile view of the face",
  "keep the person anonymous",
];

export const FACE_ANONYMITY_NEGATIVE_TERMS =
  "visible face, eyes, facial features, eye contact, front-facing portrait, face reflection, mirror face reflection, profile face, close-up face, visible mouth, visible nose";

function selectedFaceVisibilityOption(state: PromptFormState) {
  return FACE_VISIBILITY_OPTIONS.find((opt) => opt.value === state.faceVisibility);
}

export function faceVisibilityHidesFace(state: PromptFormState): boolean {
  return selectedFaceVisibilityOption(state)?.hidesFace ?? false;
}

/** Positive-prompt clause for the selected framing, plus the anonymity clauses (repeated once
 * more when concealment strength is "absolute") when that framing hides the face. */
export function buildFaceVisibilityPositiveClause(state: PromptFormState): string {
  const option = selectedFaceVisibilityOption(state);
  if (!option) return "";
  if (!option.hidesFace) return option.value;

  const anonymityClause = FACE_ANONYMITY_POSITIVE_CLAUSES.join(", ");
  const repeats = state.faceConcealmentStrength === "absolute" ? [anonymityClause, anonymityClause] : [anonymityClause];
  return [option.value, ...repeats].join(", ");
}

/** Negative-prompt terms for the selected framing (repeated once more when concealment strength
 * is "absolute"). Empty when the framing doesn't hide the face. */
export function buildFaceVisibilityNegativeTerms(state: PromptFormState): string {
  if (!faceVisibilityHidesFace(state)) return "";
  const repeats =
    state.faceConcealmentStrength === "absolute"
      ? [FACE_ANONYMITY_NEGATIVE_TERMS, FACE_ANONYMITY_NEGATIVE_TERMS]
      : [FACE_ANONYMITY_NEGATIVE_TERMS];
  return repeats.join(", ");
}
