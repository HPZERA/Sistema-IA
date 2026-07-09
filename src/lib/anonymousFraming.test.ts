import { describe, expect, it } from "vitest";
import {
  ANONYMOUS_FRAMING_NEGATIVE_TERMS,
  buildAnonymousFramingNegativePrompt,
  buildAnonymousFramingPrompt,
} from "@/lib/anonymousFraming";
import { DEFAULT_ANONYMOUS_FRAMING_STATE } from "@/types/anonymousFraming";

const handOnlyState = {
  ...DEFAULT_ANONYMOUS_FRAMING_STATE,
  framingType: ["close-up of a hand only, no face visible"],
  focusObject: ["glass"],
  environment: "beach",
  person: "adult woman",
};

describe("buildAnonymousFramingPrompt", () => {
  it("builds a sentence even with nothing selected beyond the defaults", () => {
    expect(buildAnonymousFramingPrompt(DEFAULT_ANONYMOUS_FRAMING_STATE)).toContain("adult woman");
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
      framingType: ["close-up of a hand holding an object, no face visible"],
    };
    expect(buildAnonymousFramingPrompt(state)).toContain("holding glass");
  });

  it("also phrases the focus object as 'holding X' for a plain hand-only crop", () => {
    expect(buildAnonymousFramingPrompt(handOnlyState)).toContain("holding glass");
  });

  it("describes a knees-down crop without implying an upper body", () => {
    const state = {
      ...handOnlyState,
      framingType: ["framing from the knees down only, head and face not visible"],
    };
    const clause = buildAnonymousFramingPrompt(state);
    expect(clause).toContain("only legs from knees down visible");
    expect(clause).toContain("no upper body");
  });

  it("describes a from-behind shot with the face fully hidden", () => {
    const state = {
      ...handOnlyState,
      framingType: ["photographed from behind, back to camera, face not visible"],
    };
    const clause = buildAnonymousFramingPrompt(state);
    expect(clause).toContain("person photographed from behind");
    expect(clause).toContain("face fully hidden");
  });

  it("describes a mirror selfie with the phone covering the face", () => {
    const state = {
      ...handOnlyState,
      framingType: ["mirror selfie with the phone completely covering the face"],
    };
    const clause = buildAnonymousFramingPrompt(state);
    expect(clause).toContain("mirror selfie");
    expect(clause).toContain("smartphone completely covering the face");
  });

  it("includes the free-text custom prompt when provided", () => {
    const state = { ...handOnlyState, customPrompt: "editorial magazine style" };
    expect(buildAnonymousFramingPrompt(state)).toContain("editorial magazine style");
  });

  it("includes lighting and camera selections", () => {
    const state = { ...handOnlyState, lighting: "warm golden hour sunlight", camera: ["shot on smartphone"] };
    const clause = buildAnonymousFramingPrompt(state);
    expect(clause).toContain("warm golden hour sunlight");
    expect(clause).toContain("shot on smartphone");
  });

  it("only adds hand/arm detail terms that were explicitly selected", () => {
    const withDetails = buildAnonymousFramingPrompt({
      ...handOnlyState,
      handDetails: ["subtle veins", "painted nails"],
    });
    expect(withDetails).toContain("subtle veins");
    expect(withDetails).toContain("painted nails");
    expect(withDetails).not.toContain("wristwatch");

    const withoutDetails = buildAnonymousFramingPrompt(handOnlyState);
    expect(withoutDetails).not.toContain("subtle veins");
    expect(withoutDetails).not.toContain("painted nails");
  });
});

describe("buildAnonymousFramingNegativePrompt", () => {
  it("always includes the fixed anonymous framing negative terms", () => {
    expect(buildAnonymousFramingNegativePrompt()).toContain(ANONYMOUS_FRAMING_NEGATIVE_TERMS);
  });

  it("always includes the mandatory safety negative terms", () => {
    expect(buildAnonymousFramingNegativePrompt()).toContain("nudity");
  });

  it("includes the Motor de Fotografia Real anti-AI-look terms for the default 'Muito Natural' profile", () => {
    expect(buildAnonymousFramingNegativePrompt(DEFAULT_ANONYMOUS_FRAMING_STATE)).toContain("overprocessed HDR");
  });

  it("omits the Motor de Fotografia Real terms for other image profiles", () => {
    const state = { ...DEFAULT_ANONYMOUS_FRAMING_STATE, imageProfile: "editorial" };
    expect(buildAnonymousFramingNegativePrompt(state)).not.toContain("overprocessed HDR");
  });
});

describe("buildAnonymousFramingPrompt — Motor de Fotografia Real", () => {
  it("includes the default photo style and 'Muito Natural' clause block", () => {
    const clause = buildAnonymousFramingPrompt(DEFAULT_ANONYMOUS_FRAMING_STATE);
    expect(clause).toContain("realistic modern smartphone photography");
    expect(clause).toContain("Authentic handheld photograph");
  });
});
