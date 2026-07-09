import { AIModel, AIProviderConfig } from "@/types/aiProvider";
import { ConnectionTestResult, GenerateImageRequest, GenerateImageResult, ProviderAdapter } from "./types";

const BASE_URL = "https://api.stability.ai";

const SUPPORTED_ASPECT_RATIOS: [string, number][] = [
  ["1:1", 1],
  ["16:9", 16 / 9],
  ["21:9", 21 / 9],
  ["2:3", 2 / 3],
  ["3:2", 3 / 2],
  ["4:5", 4 / 5],
  ["5:4", 5 / 4],
  ["9:16", 9 / 16],
  ["9:21", 9 / 21],
];

function closestAspectRatio(width: number, height: number): string {
  const target = width / height;
  let best = SUPPORTED_ASPECT_RATIOS[0];
  let bestDiff = Infinity;
  for (const entry of SUPPORTED_ASPECT_RATIOS) {
    const diff = Math.abs(entry[1] - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = entry;
    }
  }
  return best[0];
}

export const stabilityAdapter: ProviderAdapter = {
  async generateImage(config: AIProviderConfig, request: GenerateImageRequest): Promise<GenerateImageResult> {
    const form = new FormData();
    form.append("prompt", request.prompt);
    form.append("aspect_ratio", closestAspectRatio(request.width, request.height));
    form.append("output_format", "png");
    if (request.model.supportsNegativePrompt && request.negativePrompt) {
      form.append("negative_prompt", request.negativePrompt);
    }

    const response = await fetch(`${config.endpoint ?? BASE_URL}/v2beta/stable-image/generate/${request.model.remoteId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "image/*",
      },
      body: form,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Stability AI (${response.status}): ${text || response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return { images: [{ url: `data:image/png;base64,${base64}` }] };
  },

  async testConnection(config: AIProviderConfig): Promise<ConnectionTestResult> {
    if (!config.apiKey.trim()) return { ok: false, message: "Nenhuma chave de API configurada." };
    const response = await fetch(`${config.endpoint ?? BASE_URL}/v1/user/account`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    if (response.ok) return { ok: true, message: "Conexão validada com sucesso." };
    if (response.status === 401) return { ok: false, message: "Chave de API inválida ou expirada." };
    return { ok: false, message: `Falha ao validar (${response.status}).` };
  },

  async listModels(config: AIProviderConfig): Promise<AIModel[]> {
    const response = await fetch(`${config.endpoint ?? BASE_URL}/v1/engines/list`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    if (!response.ok) throw new Error(`Não foi possível listar modelos da Stability AI (${response.status}).`);

    const engines: { id: string; name: string; type?: string }[] = await response.json();

    return engines
      .filter((e) => !e.type || e.type === "PICTURE")
      .map((e) => ({
        id: e.id,
        label: e.name,
        remoteId: e.id,
        supportsNegativePrompt: true,
      }));
  },
};
