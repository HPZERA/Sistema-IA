// Content-safety guardrails for the prompt studio.
// These checks run BOTH client-side (fast feedback) and server-side (source of truth,
// since the client can always be bypassed). Never remove the server-side check.

export const MIN_AGE = 18;
export const MAX_AGE = 75;

// Terms that push a "fashion/editorial" prompt into explicit sexual content or
// into depicting minors. Matched case-insensitively against every free-text field.
// This is intentionally conservative: it blocks generation rather than trying to
// silently rewrite the user's words.
const BLOCKED_TERM_PATTERNS: RegExp[] = [
  // Explicit sexual content / acts
  /\bnud[eo]s?\b/i,
  /\bnu[a]?\b/i,
  /\bnaked\b/i,
  /\bnsfw\b/i,
  /\bsex(o|ual|ualizad[oa])?\b/i,
  /\bporn\w*\b/i,
  /\berotic\w*\b/i,
  /\bfetiche\b|\bfetish\b/i,
  /\bgenit(a|á)li\w*\b/i,
  /\bmamilo\w*\b|\bnippl\w*\b/i,
  /\bsem roupa\b|\bpelad[oa]\b/i,
  // Minors / age-evasion — hard block, no exceptions
  /\bmenor(es)?\s*de\s*idade\b/i,
  /\bcrian[çc]a\b|\bchild\b|\bkid\b|\bminor\b/i,
  /\bteen\w*\b|\badolescente\b/i,
  /\bloli\w*\b|\bshota\w*\b/i,
  // Non-consensual identity misuse
  /\bdeepfake\b/i,
  /\bpessoa real\b|\breal person\b|\bcelebrity\b|\bcelebridade\b/i,
];

export type SafetyCheckResult = { ok: true } | { ok: false; reason: string };

export function scanTextForViolations(text: string): string | null {
  for (const pattern of BLOCKED_TERM_PATTERNS) {
    if (pattern.test(text)) return pattern.source;
  }
  return null;
}

/**
 * Validates the full form payload before any prompt is built or sent to a provider.
 * Checks: adult age range, consent flag, and denylist scan across all free-text fields.
 */
export function validateSubmission(input: {
  age: number;
  consentAccepted: boolean;
  freeTextFields: Record<string, string | undefined>;
}): SafetyCheckResult {
  if (!Number.isFinite(input.age) || input.age < MIN_AGE) {
    return { ok: false, reason: `A idade deve ser de no mínimo ${MIN_AGE} anos.` };
  }
  if (input.age > MAX_AGE) {
    return { ok: false, reason: `Informe uma idade de até ${MAX_AGE} anos.` };
  }
  if (!input.consentAccepted) {
    return {
      ok: false,
      reason: "É necessário confirmar a política de uso (conteúdo adulto, fictício e não sexual) antes de gerar.",
    };
  }
  for (const [field, value] of Object.entries(input.freeTextFields)) {
    if (!value) continue;
    const hit = scanTextForViolations(value);
    if (hit) {
      return {
        ok: false,
        reason: `O campo "${field}" contém um termo não permitido pela política de conteúdo.`,
      };
    }
  }
  return { ok: true };
}

// Always appended to the negative prompt, regardless of provider or user input,
// so accidental or adversarial prompts still steer the model away from disallowed content.
export const MANDATORY_SAFETY_NEGATIVE_TERMS =
  "nudity, exposed genitals, sexual content, explicit content, nsfw, underage, child, minor";

export const BASE_QUALITY_NEGATIVE_TERMS =
  "blurry, low quality, low resolution, distorted anatomy, deformed hands, extra limbs, watermark, text, logo, oversaturated, plastic skin";
