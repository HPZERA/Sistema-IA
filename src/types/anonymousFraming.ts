// Standalone state for the "Enquadramento Anônimo" page (src/app/enquadramento-anonimo).
// Deliberately independent from PromptFormState (src/types/formState.ts) — this page never
// reads or writes the main Prompt Studio's fields, and its generated prompt is built only from
// the fields below (src/lib/anonymousFraming.ts).
export interface AnonymousFramingState {
  person: string;
  framingType: string[]; // exclusive single-select, kept as a 0-1 length array for chip reuse
  focusObject: string[];
  focusObjectCustom: string;
  environment: string;
  handDetails: string[];
  handDetailsCustom: string;
  lighting: string;
  camera: string[];
  customPrompt: string;
  consentAccepted: boolean;

  // Motor de Fotografia Real — pushes generations toward authentic phone/camera photography
  // instead of a polished "AI/CGI" look (src/lib/realPhotoEngine.ts).
  photoStyle: string;
  imageProfile: string;
  lightIntensity: string;
  saturation: string;
  contrast: string;
  hdr: string;
}

export const DEFAULT_ANONYMOUS_FRAMING_STATE: AnonymousFramingState = {
  person: "adult woman",
  framingType: [],
  focusObject: [],
  focusObjectCustom: "",
  environment: "beach",
  handDetails: [],
  handDetailsCustom: "",
  lighting: "warm golden hour sunlight",
  camera: [],
  customPrompt: "",
  consentAccepted: false,

  photoStyle: "realistic modern smartphone photography, authentic handheld phone camera look",
  imageProfile: "muito-natural",
  lightIntensity: "soft natural lighting",
  saturation: "low color saturation, muted natural tones",
  contrast: "natural balanced contrast",
  hdr: "no HDR processing, natural single exposure",
};
