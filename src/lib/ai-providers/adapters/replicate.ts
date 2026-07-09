import { AIModel, AIProviderConfig } from "@/types/aiProvider";
import { ConnectionTestResult, GenerateImageRequest, GenerateImageResult, ProviderAdapter } from "./types";

const BASE_URL = "https://api.replicate.com/v1";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractOutputUrl(output: unknown): string | null {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  return null;
}

export const replicateAdapter: ProviderAdapter = {
  async generateImage(config: AIProviderConfig, request: GenerateImageRequest): Promise<GenerateImageResult> {
    const base = config.endpoint ?? BASE_URL;
    const input: Record<string, unknown> = {
      prompt: request.prompt,
      width: request.width,
      height: request.height,
    };
    if (request.model.supportsNegativePrompt) {
      input.negative_prompt = request.negativePrompt;
    }

    let response = await fetch(`${base}/models/${request.model.remoteId}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Token ${config.apiKey}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Replicate (${response.status}): ${text || response.statusText}`);
    }

    let prediction = await response.json();

    const deadline = Date.now() + 45_000;
    while (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled" && Date.now() < deadline) {
      await sleep(1500);
      response = await fetch(prediction.urls?.get ?? `${base}/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${config.apiKey}` },
      });
      if (!response.ok) continue;
      prediction = await response.json();
    }

    if (prediction.status !== "succeeded") {
      throw new Error(`Replicate: geração não concluída (status: ${prediction.status}).`);
    }

    const url = extractOutputUrl(prediction.output);
    if (!url) throw new Error("Replicate não retornou uma URL de imagem reconhecível.");

    return { images: [{ url }] };
  },

  async testConnection(config: AIProviderConfig): Promise<ConnectionTestResult> {
    if (!config.apiKey.trim()) return { ok: false, message: "Nenhuma chave de API configurada." };
    const response = await fetch(`${config.endpoint ?? BASE_URL}/account`, {
      headers: { Authorization: `Token ${config.apiKey}` },
    });
    if (response.ok) return { ok: true, message: "Conexão validada com sucesso." };
    if (response.status === 401) return { ok: false, message: "Chave de API inválida ou expirada." };
    return { ok: false, message: `Falha ao validar (${response.status}).` };
  },

  async listModels(config: AIProviderConfig): Promise<AIModel[]> {
    // Replicate's catalog spans thousands of models across every owner; the "text-to-image"
    // collection is the documented, curated subset that's actually relevant here.
    const response = await fetch(`${config.endpoint ?? BASE_URL}/collections/text-to-image`, {
      headers: { Authorization: `Token ${config.apiKey}` },
    });
    if (!response.ok) throw new Error(`Não foi possível listar modelos do Replicate (${response.status}).`);

    const data = await response.json();
    const models: { owner: string; name: string }[] = data.models ?? [];

    return models.map((m) => ({
      id: `${m.owner}/${m.name}`,
      label: m.name,
      remoteId: `${m.owner}/${m.name}`,
      supportsNegativePrompt: false,
    }));
  },
};
