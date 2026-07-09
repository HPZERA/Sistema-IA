import { describe, expect, it } from "vitest";
import { MAX_AGE, MIN_AGE, scanTextForViolations, validateSubmission } from "@/lib/safety";

function validSubmission(overrides: Partial<Parameters<typeof validateSubmission>[0]> = {}) {
  return validateSubmission({
    age: 28,
    consentAccepted: true,
    freeTextFields: {},
    ...overrides,
  });
}

describe("validateSubmission", () => {
  it("accepts a valid adult submission with consent", () => {
    expect(validSubmission()).toEqual({ ok: true });
  });

  it("rejects age below the minimum", () => {
    const result = validSubmission({ age: MIN_AGE - 1 });
    expect(result.ok).toBe(false);
  });

  it("rejects age above the maximum", () => {
    const result = validSubmission({ age: MAX_AGE + 1 });
    expect(result.ok).toBe(false);
  });

  it("rejects a non-finite age", () => {
    const result = validSubmission({ age: NaN });
    expect(result.ok).toBe(false);
  });

  it("rejects when consent was not accepted", () => {
    const result = validSubmission({ consentAccepted: false });
    expect(result.ok).toBe(false);
  });

  it("rejects free text containing a blocked term", () => {
    const result = validSubmission({ freeTextFields: { cenario: "nude photo on the beach" } });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("cenario");
  });

  it("rejects free text referencing a real person or celebrity", () => {
    const result = validSubmission({ freeTextFields: { personagem: "looks like a real person" } });
    expect(result.ok).toBe(false);
  });

  it("rejects free text referencing minors", () => {
    const result = validSubmission({ freeTextFields: { detalhes: "teen model" } });
    expect(result.ok).toBe(false);
  });

  it("ignores empty/undefined free text fields", () => {
    const result = validSubmission({ freeTextFields: { a: undefined, b: "" } });
    expect(result.ok).toBe(true);
  });
});

describe("scanTextForViolations", () => {
  it("returns null for clean text", () => {
    expect(scanTextForViolations("elegant editorial photograph on a beach")).toBeNull();
  });

  it("flags nsfw-adjacent terms case-insensitively", () => {
    expect(scanTextForViolations("Totally NSFW content")).not.toBeNull();
  });
});
