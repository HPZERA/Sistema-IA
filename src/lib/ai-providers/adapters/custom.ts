import { AIProviderConfig } from "@/types/aiProvider";
import { ConnectionTestResult, GenerateImageRequest, GenerateImageResult, ProviderAdapter } from "./types";

/**
 * Generic adapter for self-hosted or third-party endpoints that don't match any of the
 * built-in providers. The endpoint must accept:
 *   POST { model, prompt, negative_prompt, width, height }  (Bearer auth if an API key is set)
 * and respond with:
 *   { "images": [{ "url": "..." }] }
 */
export const customAdapter: ProviderAdapter = {
  async generateImage(config: AIProviderConfig, request: GenerateImageRequest): Promise<GenerateImageResult> {
    if (!config.endpoint) throw new Error("Provedor personalizado sem endpoint configurado.");

    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: request.model.remoteId,
        prompt: request.prompt,
        negative_prompt: request.negativePrompt,
        width: request.width,
        height: request.height,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Provedor personalizado (${response.status}): ${text || response.statusText}`);
    }

    const data = await response.json();
    const images = (data.images ?? []) as { url: string }[];
    if (!images.length) throw new Error("O endpoint personalizado não retornou nenhuma imagem.");
    return { images };
  },

  async testConnection(config: AIProviderConfig): Promise<ConnectionTestResult> {
    if (!config.endpoint) return { ok: false, message: "Nenhum endpoint configurado." };
    return {
      ok: true,
      message: "Endpoint configurado. A validação completa ocorre na primeira geração.",
    };
  },
};
