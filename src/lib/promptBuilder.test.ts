import { describe, expect, it } from "vitest";
import { aspectRatioToSize, buildNegativePrompt, buildPromptForProvider } from "@/lib/promptBuilder";
import { MANDATORY_SAFETY_NEGATIVE_TERMS } from "@/lib/safety";
import { DEFAULT_FORM_STATE } from "@/types/formState";
import { FACE_VISIBILITY_OPTIONS } from "@/types/promptOptions";

const hiddenFaceOption = FACE_VISIBILITY_OPTIONS.find((o) => o.hidesFace)!;

describe("buildPromptForProvider", () => {
  it("builds a natural-language sentence for FLUX-family providers", () => {
    const prompt = buildPromptForProvider({ ...DEFAULT_FORM_STATE, provider: "flux-dev" });
    expect(prompt).toContain("Editorial fashion photograph of a");
    expect(prompt).toContain(DEFAULT_FORM_STATE.scene);
  });

  it("builds a comma-separated tag prompt for SDXL/SD3 providers", () => {
    const prompt = buildPromptForProvider({ ...DEFAULT_FORM_STATE, provider: "sdxl" });
    expect(prompt).not.toContain("Editorial fashion photograph of a");
    expect(prompt.split(", ").length).toBeGreaterThan(5);
  });

  it("includes the face-visibility clause when a face-hiding framing is selected", () => {
    const state = { ...DEFAULT_FORM_STATE, faceVisibility: hiddenFaceOption.value };
    const prompt = buildPromptForProvider(state);
    expect(prompt).toContain("keep the person anonymous");
  });

  it("omits the face-visibility clause line when the face stays visible", () => {
    const prompt = buildPromptForProvider(DEFAULT_FORM_STATE);
    expect(prompt).not.toContain("keep the person anonymous");
  });
});

describe("buildNegativePrompt", () => {
  it("always includes the mandatory safety terms", () => {
    expect(buildNegativePrompt()).toContain(MANDATORY_SAFETY_NEGATIVE_TERMS);
  });

  it("appends face-anonymity negative terms only when the framing hides the face", () => {
    const visible = buildNegativePrompt(DEFAULT_FORM_STATE);
    const hidden = buildNegativePrompt({ ...DEFAULT_FORM_STATE, faceVisibility: hiddenFaceOption.value });
    expect(visible).not.toContain("recognizable identity");
    expect(hidden).toContain("recognizable identity");
  });

  it("appends user-supplied extra negative terms", () => {
    expect(buildNegativePrompt(undefined, "extra term")).toContain("extra term");
  });
});

describe("aspectRatioToSize", () => {
  it("returns a square size for 1:1", () => {
    expect(aspectRatioToSize("1:1", 1024)).toEqual({ width: 1024, height: 1024 });
  });

  it("caps the wider dimension at maxDimension for landscape ratios", () => {
    const { width, height } = aspectRatioToSize("16:9", 1024);
    expect(width).toBe(1024);
    expect(height).toBeLessThan(width);
  });

  it("caps the taller dimension at maxDimension for portrait ratios", () => {
    const { width, height } = aspectRatioToSize("9:16", 1024);
    expect(height).toBe(1024);
    expect(width).toBeLessThan(height);
  });

  it("falls back to a square when the ratio is malformed", () => {
    expect(aspectRatioToSize("not-a-ratio", 800)).toEqual({ width: 800, height: 800 });
  });
});
