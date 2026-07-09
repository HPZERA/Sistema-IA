import { AIModel, AIProviderConfig } from "@/types/aiProvider";
import { ConnectionTestResult, GenerateImageRequest, GenerateImageResult, ProviderAdapter } from "./types";

const BASE_URL = "https://api.together.xyz/v1";

export const togetherAiAdapter: ProviderAdapter = {
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
        width: request.width,
        height: request.height,
        n: 1,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Together AI (${response.status}): ${text || response.statusText}`);
    }

    const data = await response.json();
    const first = data.data?.[0];
    if (!first) throw new Error("Together AI não retornou nenhuma imagem.");

    const url: string = first.url ?? (first.b64_json ? `data:image/png;base64,${first.b64_json}` : "");
    if (!url) throw new Error("Together AI retornou uma resposta em formato inesperado.");

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
    if (!response.ok) throw new Error(`Não foi possível listar modelos da Together AI (${response.status}).`);

    const data = await response.json();
    const models: { id: string; type?: string; display_name?: string }[] = Array.isArray(data) ? data : data.data ?? [];

    return models
      .filter((m) => m.type === "image")
      .map((m) => ({
        id: m.id,
        label: m.display_name ?? m.id,
        remoteId: m.id,
        supportsNegativePrompt: false,
      }));
  },
};
