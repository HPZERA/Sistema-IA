// The AI Provider layer decouples the Prompt Studio (which only ever produces a prompt +
// negative prompt + target resolution) from whichever image-generation backend actually
// renders it. Adding a new backend means writing one adapter (src/lib/ai-providers/adapters)
// and registering it in src/lib/ai-providers/registry.ts — nothing else in the system needs
// to change.

export type ProviderKind =
  | "fal"
  | "black-forest-labs"
  | "openai"
  | "replicate"
  | "together-ai"
  | "stability-ai"
  | "custom";

export interface AIModel {
  /** Stable slug used within this app (shown in the model selector). */
  id: string;
  /** Display label, e.g. "Flux Pro". */
  label: string;
  /** The exact identifier the provider's API expects (endpoint slug, model name, version, etc.). */
  remoteId: string;
  /** Whether this model accepts a negative prompt. */
  supportsNegativePrompt: boolean;
  /** Admin-configured estimated cost per image in USD, used for cost reporting. Optional. */
  costPerImage?: number;
}

export interface AIProviderConfig {
  /** Stable identifier, unique across all configured providers. */
  id: string;
  /** Display name, e.g. "Fal.ai — conta principal". */
  name: string;
  /** Which adapter implementation handles this provider. */
  kind: ProviderKind;
  /** Stored server-side only. Never sent to the client. */
  apiKey: string;
  /** Override base URL — required for "custom" providers, optional override for the rest. */
  endpoint?: string;
  models: AIModel[];
  active: boolean;
  /** Lower number = tried first during failover. */
  priority: number;
  createdAt: string;
  updatedAt: string;
}

/** Safe-to-send-to-the-client projection of a provider config — the API key is never included. */
export interface AIProviderConfigPublic {
  id: string;
  name: string;
  kind: ProviderKind;
  endpoint?: string;
  models: AIModel[];
  active: boolean;
  priority: number;
  hasApiKey: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toPublicProviderConfig(config: AIProviderConfig): AIProviderConfigPublic {
  const { apiKey, ...rest } = config;
  return { ...rest, hasApiKey: apiKey.trim().length > 0 };
}

export interface GenerationAttempt {
  providerId: string;
  providerName: string;
  modelId: string;
  modelLabel: string;
  ok: boolean;
  error?: string;
}

export interface GenerationInfo {
  providerId: string;
  providerName: string;
  modelId: string;
  modelLabel: string;
  durationMs: number;
  width: number;
  height: number;
  creditsUsed?: number;
  costUsd?: number;
  servedFromCache: boolean;
  attempts: GenerationAttempt[];
}
