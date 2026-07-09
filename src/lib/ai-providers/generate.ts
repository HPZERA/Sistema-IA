import { AIProviderConfig, GenerationAttempt, GenerationInfo } from "@/types/aiProvider";
import { listProviders } from "./store";
import { getAdapter } from "./registry";

export interface GenerateImageWithFailoverInput {
  /** User's preferred provider, if any. Falls back to the highest-priority active provider. */
  preferredProviderId?: string;
  /** User's preferred model on the preferred provider, if any. Falls back to that provider's first model. */
  preferredModelId?: string;
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
}

export interface GenerateImageWithFailoverResult {
  images: { url: string }[];
  info: GenerationInfo;
}

interface Candidate {
  provider: AIProviderConfig;
  model: AIProviderConfig["models"][number];
}

export class NoActiveProviderError extends Error {
  constructor() {
    super("Nenhum provedor de IA ativo está configurado. Configure um em Gerenciador de IA.");
    this.name = "NoActiveProviderError";
  }
}

function buildCandidateList(
  providers: AIProviderConfig[],
  preferredProviderId?: string,
  preferredModelId?: string
): Candidate[] {
  const active = providers.filter((p) => p.active && p.models.length > 0);
  const byPriority = [...active].sort((a, b) => a.priority - b.priority);

  const candidates: Candidate[] = [];
  const seenProviderIds = new Set<string>();

  if (preferredProviderId) {
    const preferred = active.find((p) => p.id === preferredProviderId);
    if (preferred) {
      const model =
        preferred.models.find((m) => m.id === preferredModelId) ?? preferred.models[0];
      candidates.push({ provider: preferred, model });
      seenProviderIds.add(preferred.id);
    }
  }

  for (const provider of byPriority) {
    if (seenProviderIds.has(provider.id)) continue;
    candidates.push({ provider, model: provider.models[0] });
    seenProviderIds.add(provider.id);
  }

  return candidates;
}

/**
 * Tries the preferred provider/model first, then falls back through the remaining active
 * providers in priority order until one succeeds or all have been tried.
 */
export async function generateImageWithFailover(
  input: GenerateImageWithFailoverInput
): Promise<GenerateImageWithFailoverResult> {
  const providers = await listProviders();
  const candidates = buildCandidateList(providers, input.preferredProviderId, input.preferredModelId);

  if (candidates.length === 0) throw new NoActiveProviderError();

  const attempts: GenerationAttempt[] = [];

  for (const candidate of candidates) {
    const startedAt = Date.now();
    try {
      const adapter = getAdapter(candidate.provider.kind);
      const result = await adapter.generateImage(candidate.provider, {
        model: candidate.model,
        prompt: input.prompt,
        negativePrompt: input.negativePrompt,
        width: input.width,
        height: input.height,
      });

      attempts.push({
        providerId: candidate.provider.id,
        providerName: candidate.provider.name,
        modelId: candidate.model.id,
        modelLabel: candidate.model.label,
        ok: true,
      });

      return {
        images: result.images,
        info: {
          providerId: candidate.provider.id,
          providerName: candidate.provider.name,
          modelId: candidate.model.id,
          modelLabel: candidate.model.label,
          durationMs: Date.now() - startedAt,
          width: input.width,
          height: input.height,
          creditsUsed: result.creditsUsed,
          costUsd: candidate.model.costPerImage,
          servedFromCache: false,
          attempts,
        },
      };
    } catch (err) {
      attempts.push({
        providerId: candidate.provider.id,
        providerName: candidate.provider.name,
        modelId: candidate.model.id,
        modelLabel: candidate.model.label,
        ok: false,
        error: err instanceof Error ? err.message : "Erro desconhecido.",
      });
    }
  }

  const summary = attempts.map((a) => `${a.providerName} (${a.modelLabel}): ${a.error}`).join(" | ");
  throw new Error(`Todos os provedores de IA disponíveis falharam. ${summary}`);
}
