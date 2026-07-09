import { AIModel, ProviderKind } from "@/types/aiProvider";
import { ProviderAdapter } from "./adapters/types";
import { falAdapter } from "./adapters/fal";
import { blackForestLabsAdapter } from "./adapters/blackForestLabs";
import { openaiAdapter } from "./adapters/openai";
import { replicateAdapter } from "./adapters/replicate";
import { togetherAiAdapter } from "./adapters/togetherAi";
import { stabilityAdapter } from "./adapters/stability";
import { customAdapter } from "./adapters/custom";

// Adding a new backend = write one adapter file + add one entry here (and, optionally, a
// default model catalog below for the "add provider" convenience list in the admin UI).
export const PROVIDER_ADAPTERS: Record<ProviderKind, ProviderAdapter> = {
  fal: falAdapter,
  "black-forest-labs": blackForestLabsAdapter,
  openai: openaiAdapter,
  replicate: replicateAdapter,
  "together-ai": togetherAiAdapter,
  "stability-ai": stabilityAdapter,
  custom: customAdapter,
};

export function getAdapter(kind: ProviderKind): ProviderAdapter {
  const adapter = PROVIDER_ADAPTERS[kind];
  if (!adapter) throw new Error(`Nenhum adapter registrado para o tipo de provedor "${kind}".`);
  return adapter;
}

export interface ProviderKindInfo {
  label: string;
  defaultEndpoint?: string;
  defaultModels: AIModel[];
}

export const PROVIDER_KIND_INFO: Record<ProviderKind, ProviderKindInfo> = {
  fal: {
    label: "Fal.ai",
    defaultModels: [
      { id: "flux-dev", label: "Flux Dev", remoteId: "fal-ai/flux/dev", supportsNegativePrompt: false },
      { id: "flux-schnell", label: "Flux Schnell", remoteId: "fal-ai/flux/schnell", supportsNegativePrompt: false },
      { id: "flux-pro", label: "Flux Pro", remoteId: "fal-ai/flux-pro/v1.1", supportsNegativePrompt: false },
      { id: "sdxl", label: "Stable Diffusion XL", remoteId: "fal-ai/fast-sdxl", supportsNegativePrompt: true },
      { id: "sd3", label: "Stable Diffusion 3 Medium", remoteId: "fal-ai/stable-diffusion-v3-medium", supportsNegativePrompt: true },
    ],
  },
  "black-forest-labs": {
    label: "Black Forest Labs",
    defaultEndpoint: "https://api.bfl.ai",
    defaultModels: [
      { id: "flux-pro-1.1", label: "Flux Pro 1.1", remoteId: "flux-pro-1.1", supportsNegativePrompt: false },
      { id: "flux-pro", label: "Flux Pro", remoteId: "flux-pro", supportsNegativePrompt: false },
      { id: "flux-dev", label: "Flux Dev", remoteId: "flux-dev", supportsNegativePrompt: false },
    ],
  },
  openai: {
    label: "OpenAI",
    defaultEndpoint: "https://api.openai.com/v1",
    defaultModels: [{ id: "gpt-image-1", label: "GPT Image", remoteId: "gpt-image-1", supportsNegativePrompt: false }],
  },
  replicate: {
    label: "Replicate",
    defaultEndpoint: "https://api.replicate.com/v1",
    defaultModels: [
      { id: "flux-pro", label: "Flux Pro", remoteId: "black-forest-labs/flux-1.1-pro", supportsNegativePrompt: false },
      { id: "flux-dev", label: "Flux Dev", remoteId: "black-forest-labs/flux-dev", supportsNegativePrompt: false },
      { id: "sdxl", label: "Stable Diffusion XL", remoteId: "stability-ai/sdxl", supportsNegativePrompt: true },
      { id: "recraft-v3", label: "Recraft V3", remoteId: "recraft-ai/recraft-v3", supportsNegativePrompt: false },
      { id: "ideogram-v2", label: "Ideogram V2", remoteId: "ideogram-ai/ideogram-v2", supportsNegativePrompt: false },
    ],
  },
  "together-ai": {
    label: "Together AI",
    defaultEndpoint: "https://api.together.xyz/v1",
    defaultModels: [
      { id: "flux-schnell", label: "Flux.1 Schnell", remoteId: "black-forest-labs/FLUX.1-schnell", supportsNegativePrompt: false },
      { id: "flux-dev", label: "Flux.1 Dev", remoteId: "black-forest-labs/FLUX.1-dev", supportsNegativePrompt: false },
    ],
  },
  "stability-ai": {
    label: "Stability AI",
    defaultEndpoint: "https://api.stability.ai",
    defaultModels: [
      { id: "ultra", label: "Stable Image Ultra", remoteId: "ultra", supportsNegativePrompt: true },
      { id: "core", label: "Stable Image Core", remoteId: "core", supportsNegativePrompt: true },
      { id: "sd3.5-large", label: "Stable Diffusion 3.5 Large", remoteId: "sd3.5-large", supportsNegativePrompt: true },
    ],
  },
  custom: {
    label: "Personalizado",
    defaultModels: [],
  },
};

export const PROVIDER_KIND_OPTIONS: { value: ProviderKind; label: string }[] = (
  Object.keys(PROVIDER_KIND_INFO) as ProviderKind[]
).map((kind) => ({ value: kind, label: PROVIDER_KIND_INFO[kind].label }));
