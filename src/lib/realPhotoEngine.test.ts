import { describe, expect, it } from "vitest";
import { buildRealPhotoEngineClause, buildRealPhotoEngineNegativeTerms, IMAGE_PROFILE_NATURAL_NEGATIVE_TERMS } from "@/lib/realPhotoEngine";

const baseState = {
  photoStyle: "realistic modern smartphone photography, authentic handheld phone camera look",
  imageProfile: "muito-natural",
  lightIntensity: "soft natural lighting",
  saturation: "low color saturation, muted natural tones",
  contrast: "natural balanced contrast",
  hdr: "no HDR processing, natural single exposure",
};

describe("buildRealPhotoEngineClause", () => {
  it("includes the camera/style descriptor and light/color controls", () => {
    const clause = buildRealPhotoEngineClause(baseState);
    expect(clause).toContain("realistic modern smartphone photography");
    expect(clause).toContain("soft natural lighting");
    expect(clause).toContain("low color saturation");
    expect(clause).toContain("natural balanced contrast");
    expect(clause).toContain("no HDR processing");
  });

  it("expands the 'muito-natural' image profile into its full clause block", () => {
    const clause = buildRealPhotoEngineClause(baseState);
    expect(clause).toContain("Natural smartphone photography");
    expect(clause).toContain("Authentic handheld photograph");
    expect(clause).toContain("Realistic smartphone processing");
  });

  it("swaps in a different clause block for other image profiles", () => {
    const clause = buildRealPhotoEngineClause({ ...baseState, imageProfile: "cinematico" });
    expect(clause).toContain("cinematic color grading");
    expect(clause).not.toContain("Natural smartphone photography");
  });
});

describe("buildRealPhotoEngineNegativeTerms", () => {
  it("includes the anti-AI-look terms when the 'muito-natural' profile is active", () => {
    expect(buildRealPhotoEngineNegativeTerms(baseState)).toBe(IMAGE_PROFILE_NATURAL_NEGATIVE_TERMS);
  });

  it("is empty for other image profiles", () => {
    expect(buildRealPhotoEngineNegativeTerms({ ...baseState, imageProfile: "editorial" })).toBe("");
  });

  it("is empty when no state is provided", () => {
    expect(buildRealPhotoEngineNegativeTerms()).toBe("");
  });
});
