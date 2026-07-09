import { describe, expect, it } from "vitest";
import {
  FACE_ANONYMITY_NEGATIVE_TERMS,
  buildFaceVisibilityNegativeTerms,
  buildFaceVisibilityPositiveClause,
  faceVisibilityHidesFace,
} from "@/lib/faceVisibility";
import { DEFAULT_FORM_STATE } from "@/types/formState";
import { FACE_VISIBILITY_OPTIONS } from "@/types/promptOptions";

const visibleOption = FACE_VISIBILITY_OPTIONS.find((o) => !o.hidesFace)!;
const hiddenOption = FACE_VISIBILITY_OPTIONS.find((o) => o.hidesFace)!;

describe("faceVisibilityHidesFace", () => {
  it("is false for a face-visible framing", () => {
    const state = { ...DEFAULT_FORM_STATE, faceVisibility: visibleOption.value };
    expect(faceVisibilityHidesFace(state)).toBe(false);
  });

  it("is true for a face-hiding framing", () => {
    const state = { ...DEFAULT_FORM_STATE, faceVisibility: hiddenOption.value };
    expect(faceVisibilityHidesFace(state)).toBe(true);
  });

  it("is false for an unrecognized value", () => {
    const state = { ...DEFAULT_FORM_STATE, faceVisibility: "not-a-real-option" };
    expect(faceVisibilityHidesFace(state)).toBe(false);
  });
});

describe("buildFaceVisibilityPositiveClause", () => {
  it("returns just the option value when the face stays visible", () => {
    const state = { ...DEFAULT_FORM_STATE, faceVisibility: visibleOption.value };
    expect(buildFaceVisibilityPositiveClause(state)).toBe(visibleOption.value);
  });

  it("appends anonymity clauses once for normal/strong concealment", () => {
    const state = {
      ...DEFAULT_FORM_STATE,
      faceVisibility: hiddenOption.value,
      faceConcealmentStrength: "normal",
    };
    const clause = buildFaceVisibilityPositiveClause(state);
    expect(clause.startsWith(hiddenOption.value)).toBe(true);
    expect(clause).toContain("keep the person anonymous");
    // Only one occurrence at "normal" strength.
    expect(clause.split("keep the person anonymous").length - 1).toBe(1);
  });

  it("repeats anonymity clauses twice for absolute concealment", () => {
    const state = {
      ...DEFAULT_FORM_STATE,
      faceVisibility: hiddenOption.value,
      faceConcealmentStrength: "absolute",
    };
    const clause = buildFaceVisibilityPositiveClause(state);
    expect(clause.split("keep the person anonymous").length - 1).toBe(2);
  });
});

describe("buildFaceVisibilityNegativeTerms", () => {
  it("is empty when the face stays visible", () => {
    const state = { ...DEFAULT_FORM_STATE, faceVisibility: visibleOption.value };
    expect(buildFaceVisibilityNegativeTerms(state)).toBe("");
  });

  it("includes the anonymity negative terms once at normal strength", () => {
    const state = {
      ...DEFAULT_FORM_STATE,
      faceVisibility: hiddenOption.value,
      faceConcealmentStrength: "normal",
    };
    expect(buildFaceVisibilityNegativeTerms(state)).toBe(FACE_ANONYMITY_NEGATIVE_TERMS);
  });

  it("repeats the anonymity negative terms at absolute strength", () => {
    const state = {
      ...DEFAULT_FORM_STATE,
      faceVisibility: hiddenOption.value,
      faceConcealmentStrength: "absolute",
    };
    expect(buildFaceVisibilityNegativeTerms(state)).toBe(
      `${FACE_ANONYMITY_NEGATIVE_TERMS}, ${FACE_ANONYMITY_NEGATIVE_TERMS}`
    );
  });
});
