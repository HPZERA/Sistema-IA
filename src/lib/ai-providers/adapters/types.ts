import { AIModel, AIProviderConfig } from "@/types/aiProvider";

export interface GenerateImageRequest {
  model: AIProviderConfig["models"][number];
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
}

export interface GenerateImageResult {
  images: { url: string }[];
  creditsUsed?: number;
}

export interface ConnectionTestResult {
  ok: boolean;
  message: string;
}

export interface ProviderAdapter {
  generateImage(config: AIProviderConfig, request: GenerateImageRequest): Promise<GenerateImageResult>;
  testConnection(config: AIProviderConfig): Promise<ConnectionTestResult>;
  /**
   * Best-effort catalog discovery. Omitted entirely for providers with no public discovery
   * endpoint (fal, Black Forest Labs, custom) — the admin UI falls back to manual entry there.
   */
  listModels?(config: AIProviderConfig): Promise<AIModel[]>;
}
