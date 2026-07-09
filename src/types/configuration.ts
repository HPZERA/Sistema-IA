import { ConfigurationType } from "@/db/schema";
import { PromptFormState } from "@/types/formState";

export type { ConfigurationType };

export const CONFIGURATION_TYPE_OPTIONS: { value: ConfigurationType; label: string }[] = [
  { value: "personagem", label: "Personagem" },
  { value: "look", label: "Look" },
  { value: "cena", label: "Cena" },
  { value: "campanha", label: "Campanha" },
  { value: "outro", label: "Outro" },
];

export interface ConfigurationSummary {
  id: string;
  name: string;
  type: ConfigurationType;
  description: string;
  coverImageUrl: string | null;
  tags: string[];
  providerName: string | null;
  modelLabel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigurationDetail extends ConfigurationSummary {
  formSnapshot: PromptFormState;
  prompt: string;
  negativePrompt: string;
  providerId: string | null;
  modelId: string | null;
}

export interface ConfigurationInput {
  name: string;
  type: ConfigurationType;
  description?: string;
  coverImageUrl?: string | null;
  tags?: string[];
  formSnapshot: PromptFormState;
  prompt: string;
  negativePrompt?: string;
  providerId?: string | null;
  providerName?: string | null;
  modelId?: string | null;
  modelLabel?: string | null;
}
