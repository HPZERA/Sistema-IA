import { AIProviderConfig } from "@/types/aiProvider";
import { ConnectionTestResult, GenerateImageRequest, GenerateImageResult, ProviderAdapter } from "./types";

const BASE_URL = "https://fal.run";

export const falAdapter: ProviderAdapter = {
  async generateImage(config: AIProviderConfig, request: GenerateImageRequest): Promise<GenerateImageResult> {
    const body: Record<string, unknown> = {
      prompt: request.prompt,
      image_size: { width: request.width, height: request.height },
      num_images: 1,
      enable_safety_checker: true,
    };
    if (request.model.supportsNegativePrompt) {
      body.negative_prompt = request.negativePrompt;
    }

    const response = await fetch(`${config.endpoint ?? BASE_URL}/${request.model.remoteId}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Fal.ai (${response.status}): ${text || response.statusText}`);
    }

    const data = await response.json();
    const images = (data.images ?? []) as { url: string }[];
    if (!images.length) {
      throw new Error("Fal.ai não retornou nenhuma imagem (possivelmente bloqueada pelo filtro de segurança).");
    }
    return { images };
  },

  async testConnection(config: AIProviderConfig): Promise<ConnectionTestResult> {
    if (!config.apiKey.trim()) return { ok: false, message: "Nenhuma chave de API configurada." };
    return {
      ok: true,
      message: "Chave configurada. A Fal.ai não expõe um endpoint de verificação — a validação completa ocorre na primeira geração.",
    };
  },
};
