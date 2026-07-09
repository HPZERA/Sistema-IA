import { describe, expect, it } from "vitest";
import {
  ANONYMOUS_FRAMING_NEGATIVE_TERMS,
  buildAnonymousFramingNegativeTerms,
  buildAnonymousFramingPrompt,
  isAnonymousFramingActive,
} from "@/lib/anonymousFraming";
import { buildNegativePrompt, buildPromptForProvider } from "@/lib/promptBuilder";
import { DEFAULT_FORM_STATE } from "@/types/formState";

const handOnlyState = {
  ...DEFAULT_FORM_STATE,
  anonymousFramingEnabled: true,
  anonymousFramingType: ["close-up of a hand only, no face visible"],
  anonymousFocusObject: ["glass"],
  anonymousEnvironment: "beach",
  anonymousPerson: "adult woman",
};

describe("isAnonymousFramingActive", () => {
  it("is false by default", () => {
    expect(isAnonymousFramingActive(DEFAULT_FORM_STATE)).toBe(false);
  });

  it("is true once the module is enabled", () => {
    expect(isAnonymousFramingActive(handOnlyState)).toBe(true);
  });
});

describe("buildAnonymousFramingPrompt", () => {
  it("is empty when the module is disabled", () => {
    expect(buildAnonymousFramingPrompt(DEFAULT_FORM_STATE)).toBe("");
  });

  it("describes only the hand for a 'apenas mão' selection, excluding face/body/head/torso", () => {
    const clause = buildAnonymousFramingPrompt(handOnlyState);
    expect(clause).toContain("only hand visible");
    expect(clause).toContain("no face");
    expect(clause).toContain("no body");
    expect(clause).toContain("no head");
    expect(clause).toContain("no torso");
    expect(clause).toContain("beach");
  });

  it("phrases the focus object as 'holding X' for hand-holding framings", () => {
    const state = {
      ...handOnlyState,
      anonymousFramingType: ["close-up of a hand holding an object, no face visible"],
    };
    expect(buildAnonymousFramingPrompt(state)).toContain("holding glass");
  });

  it("also phrases the focus object as 'holding X' for a plain hand-only crop", () => {
    // handOnlyState already selects "close-up of a hand only, no face visible" + glass — a bare
    // hand crop with an object selected should read as holding it, not "featuring" it.
    expect(buildAnonymousFramingPrompt(handOnlyState)).toContain("holding glass");
  });

  it("describes a knees-down crop without implying an upper body", () => {
    const state = {
      ...handOnlyState,
      anonymousFramingType: ["framing from the knees down only, head and face not visible"],
    };
    const clause = buildAnonymousFramingPrompt(state);
    expect(clause).toContain("only legs from knees down visible");
    expect(clause).toContain("no upper body");
  });

  it("describes a from-behind shot with the face fully hidden", () => {
    const state = {
      ...handOnlyState,
      anonymousFramingType: ["photographed from behind, back to camera, face not visible"],
    };
    const clause = buildAnonymousFramingPrompt(state);
    expect(clause).toContain("person photographed from behind");
    expect(clause).toContain("face fully hidden");
  });

  it("describes a mirror selfie with the phone covering the face", () => {
    const state = {
      ...handOnlyState,
      anonymousFramingType: ["mirror selfie with the phone completely covering the face"],
    };
    const clause = buildAnonymousFramingPrompt(state);
    expect(clause).toContain("mirror selfie");
    expect(clause).toContain("smartphone completely covering the face");
  });

  it("includes the free-text custom description when provided", () => {
    const state = { ...handOnlyState, anonymousCustomDescription: "editorial magazine style" };
    expect(buildAnonymousFramingPrompt(state)).toContain("editorial magazine style");
  });

  it("only adds hand/arm detail terms that were explicitly selected", () => {
    const withDetails = buildAnonymousFramingPrompt({
      ...handOnlyState,
      anonymousHandDetails: ["subtle veins", "painted nails"],
    });
    expect(withDetails).toContain("subtle veins");
    expect(withDetails).toContain("painted nails");
    expect(withDetails).not.toContain("wristwatch");

    const withoutDetails = buildAnonymousFramingPrompt(handOnlyState);
    expect(withoutDetails).not.toContain("subtle veins");
    expect(withoutDetails).not.toContain("painted nails");
  });
});

describe("buildAnonymousFramingNegativeTerms", () => {
  it("is empty when the module is disabled", () => {
    expect(buildAnonymousFramingNegativeTerms(DEFAULT_FORM_STATE)).toBe("");
  });

  it("returns the anonymous framing negative terms when active", () => {
    expect(buildAnonymousFramingNegativeTerms(handOnlyState)).toBe(ANONYMOUS_FRAMING_NEGATIVE_TERMS);
  });
});

describe("buildPromptForProvider with Enquadramento Anônimo active", () => {
  it("overrides the standard full-body sentence instead of appending to it", () => {
    const prompt = buildPromptForProvider(handOnlyState);
    expect(prompt).not.toContain("Editorial fashion photograph of a");
    expect(prompt).not.toContain(DEFAULT_FORM_STATE.wardrobeCategory[0]);
    expect(prompt).toContain("only hand visible");
  });

  it("still applies lighting and realism selections", () => {
    const prompt = buildPromptForProvider(handOnlyState);
    expect(prompt).toContain(handOnlyState.lighting);
    expect(prompt).toContain(handOnlyState.realism);
  });

  it("produces a tag-style prompt for SDXL that also overrides the full-body tags", () => {
    const prompt = buildPromptForProvider({ ...handOnlyState, provider: "sdxl" });
    expect(prompt).not.toContain(DEFAULT_FORM_STATE.wardrobeCategory[0]);
    expect(prompt).toContain("only hand visible");
  });
});

describe("buildNegativePrompt with Enquadramento Anônimo active", () => {
  it("drops the cropping-forbidding standard terms so the intentional crop isn't fought", () => {
    const negative = buildNegativePrompt(handOnlyState);
    expect(negative).not.toContain("cropped limbs");
    expect(negative).not.toContain("awkward cropping");
  });

  it("keeps the cropping-forbidding terms when the module is inactive", () => {
    const negative = buildNegativePrompt(DEFAULT_FORM_STATE);
    expect(negative).toContain("cropped limbs");
  });

  it("includes the anonymous framing negative terms", () => {
    expect(buildNegativePrompt(handOnlyState)).toContain("recognizable identity");
  });
});
