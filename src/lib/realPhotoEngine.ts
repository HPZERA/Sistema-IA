// Motor de Fotografia Real — shared enrichment layer that pushes generations toward authentic
// phone/camera photography instead of the polished "AI/CGI" look. Pure functions of a small state
// slice (src/types/promptOptions.ts REAL_PHOTO_STYLE_OPTIONS / IMAGE_PROFILE_OPTIONS /
// LIGHT_INTENSITY_OPTIONS / SATURATION_OPTIONS / CONTRAST_OPTIONS / HDR_OPTIONS) so both the main
// Prompt Studio (src/lib/promptBuilder.ts) and Enquadramento Anônimo (src/lib/anonymousFraming.ts)
// can apply the exact same treatment.

function joinNonEmpty(parts: (string | undefined | null)[], sep = ", "): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(sep);
}

export interface RealPhotoEngineState {
  photoStyle: string;
  imageProfile: string;
  lightIntensity: string;
  saturation: string;
  contrast: string;
  hdr: string;
}

// Maps each IMAGE_PROFILE_OPTIONS value to its full descriptive clause block. "muito-natural" is
// the product-spec default: an explicit list of phrases meant to counter the typical "AI-generated
// look" (overly perfect lighting, HDR, plastic skin).
const IMAGE_PROFILE_CLAUSES: Record<string, string> = {
  natural: "natural realistic photography, true-to-life color rendition, minimal retouching, authentic light and shadow",
  "muito-natural": [
    "Natural smartphone photography",
    "Authentic handheld photograph",
    "Natural exposure",
    "Neutral white balance",
    "Soft natural lighting",
    "Realistic shadows",
    "Moderate contrast",
    "Low saturation",
    "No exaggerated HDR",
    "No artificial sharpening",
    "Slight camera imperfections",
    "Slight sensor noise",
    "Authentic skin texture",
    "Natural color science",
    "Realistic dynamic range",
    "Natural highlights",
    "Natural skin tones",
    "Realistic smartphone processing",
  ].join(", "),
  instagram:
    "Instagram mobile photography aesthetic, casual social media snapshot, naturally vibrant but believable colors, slight mobile camera processing",
  editorial:
    "polished editorial photography finish, refined professional retouching while keeping realistic skin and light",
  cinematico: "cinematic color grading, filmic tonal range, subtle atmospheric mood, movie-still color science",
};

// Fixed negative terms tied specifically to the "Muito Natural" profile — the other profiles
// (Instagram, Editorial, Cinemático) intentionally allow some stylization, so these only apply
// when the product-spec default is active.
export const IMAGE_PROFILE_NATURAL_NEGATIVE_TERMS =
  "overprocessed HDR, oversaturated colors, excessive contrast, artificial lighting, CGI look, rendered look, waxy skin, plastic skin, unrealistic sharpness, exaggerated highlights, artificial color grading";

/** Positive enrichment clause: camera/style descriptor, image profile block, then the fine-grained
 * light intensity / saturation / contrast / HDR controls. Additive — safe to append to any prompt. */
export function buildRealPhotoEngineClause(state: RealPhotoEngineState): string {
  return joinNonEmpty([
    state.photoStyle,
    IMAGE_PROFILE_CLAUSES[state.imageProfile] ?? "",
    state.lightIntensity,
    state.saturation,
    state.contrast,
    state.hdr,
  ]);
}

/** Negative terms contributed by the engine — currently only the "Muito Natural" profile's fixed
 * anti-AI-look term list from the product spec. */
export function buildRealPhotoEngineNegativeTerms(state?: RealPhotoEngineState): string {
  if (!state || state.imageProfile !== "muito-natural") return "";
  return IMAGE_PROFILE_NATURAL_NEGATIVE_TERMS;
}
