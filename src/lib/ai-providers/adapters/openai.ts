import { AIModel, AIProviderConfig } from "@/types/aiProvider";
import { ConnectionTestResult, GenerateImageRequest, GenerateImageResult, ProviderAdapter } from "./types";

const BASE_URL = "https://api.openai.com/v1";

/** Heuristic: OpenAI's /models list includes every model (chat, embeddings, audio, ...); only
 * surface the ones that are actually image-generation models. */
function isImageModel(id: string): boolean {
  return id.startsWith("gpt-image") || id.startsWith("dall-e");
}

/** OpenAI's Images API only accepts a fixed set of sizes. */
function closestSupportedSize(width: number, height: number): string {
  const supported: [number, number][] = [
    [1024, 1024],
    [1024, 1536],
    [1536, 1024],
  ];
  const targetRatio = width / height;
  let best = supported[0];
  let bestDiff = Infinity;
  for (const [w, h] of supported) {
    const diff = Math.abs(w / h - targetRatio);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = [w, h];
    }
  }
  return `${best[0]}x${best[1]}`;
}

export const openaiAdapter: ProviderAdapter = {
  async generateImage(config: AIProviderConfig, request: GenerateImageRequest): Promise<GenerateImageResult> {
    const response = await fetch(`${config.endpoint ?? BASE_URL}/images/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: request.model.remoteId,
        prompt: request.prompt,
        size: closestSupportedSize(request.width, request.height),
        n: 1,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`OpenAI (${response.status}): ${text || response.statusText}`);
    }

    const data = await response.json();
    const first = data.data?.[0];
    if (!first) throw new Error("OpenAI não retornou nenhuma imagem.");

    const url: string = first.url ?? (first.b64_json ? `data:image/png;base64,${first.b64_json}` : "");
    if (!url) throw new Error("OpenAI retornou uma resposta em formato inesperado.");

    return { images: [{ url }] };
  },

  async testConnection(config: AIProviderConfig): Promise<ConnectionTestResult> {
    if (!config.apiKey.trim()) return { ok: false, message: "Nenhuma chave de API configurada." };
    const response = await fetch(`${config.endpoint ?? BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    if (response.ok) return { ok: true, message: "Conexão validada com sucesso." };
    if (response.status === 401) return { ok: false, message: "Chave de API inválida ou expirada." };
    return { ok: false, message: `Falha ao validar (${response.status}).` };
  },

  async listModels(config: AIProviderConfig): Promise<AIModel[]> {
    const response = await fetch(`${config.endpoint ?? BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    if (!response.ok) throw new Error(`Não foi possível listar modelos da OpenAI (${response.status}).`);

    const data = await response.json();
    const ids: string[] = (data.data ?? []).map((m: { id: string }) => m.id).filter(isImageModel);

    return ids.map((id) => ({
      id,
      label: id,
      remoteId: id,
      supportsNegativePrompt: false,
    }));
  },
};
