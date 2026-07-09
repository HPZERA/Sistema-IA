import { AIProviderConfig } from "@/types/aiProvider";
import { ConnectionTestResult, GenerateImageRequest, GenerateImageResult, ProviderAdapter } from "./types";

const BASE_URL = "https://api.bfl.ai";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const blackForestLabsAdapter: ProviderAdapter = {
  async generateImage(config: AIProviderConfig, request: GenerateImageRequest): Promise<GenerateImageResult> {
    const base = config.endpoint ?? BASE_URL;

    const submitResponse = await fetch(`${base}/v1/${request.model.remoteId}`, {
      method: "POST",
      headers: {
        "x-key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: request.prompt,
        width: request.width,
        height: request.height,
      }),
    });

    if (!submitResponse.ok) {
      const text = await submitResponse.text().catch(() => "");
      throw new Error(`Black Forest Labs (${submitResponse.status}): ${text || submitResponse.statusText}`);
    }

    const { polling_url: pollingUrl } = await submitResponse.json();
    if (!pollingUrl) throw new Error("Black Forest Labs não retornou uma URL de acompanhamento (polling_url).");

    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      await sleep(1500);
      const pollResponse = await fetch(pollingUrl, { headers: { "x-key": config.apiKey } });
      if (!pollResponse.ok) continue;
      const pollData = await pollResponse.json();
      if (pollData.status === "Ready" && pollData.result?.sample) {
        return { images: [{ url: pollData.result.sample }] };
      }
      if (pollData.status === "Error" || pollData.status === "Failed") {
        throw new Error(`Black Forest Labs: geração falhou (${pollData.status}).`);
      }
    }
    throw new Error("Black Forest Labs: tempo limite excedido aguardando a geração.");
  },

  async testConnection(config: AIProviderConfig): Promise<ConnectionTestResult> {
    if (!config.apiKey.trim()) return { ok: false, message: "Nenhuma chave de API configurada." };
    return {
      ok: true,
      message: "Chave configurada. A validação completa ocorre na primeira geração.",
    };
  },
};
