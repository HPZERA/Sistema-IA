import { ConfigurationType } from "@/db/schema";
import { PromptFormState } from "@/types/formState";
import { AnonymousFramingState } from "@/types/anonymousFraming";

export type { ConfigurationType };

export const CONFIGURATION_TYPE_OPTIONS: { value: ConfigurationType; label: string }[] = [
  { value: "personagem", label: "Personagem" },
  { value: "look", label: "Look" },
  { value: "cena", label: "Cena" },
  { value: "campanha", label: "Campanha" },
  { value: "anonimo", label: "Enquadramento Anônimo" },
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

// `formSnapshot` holds a PromptFormState for every type except "anonimo", where it holds a
// standalone AnonymousFramingState from the separate Enquadramento Anônimo page — the two never
// mix (src/types/anonymousFraming.ts).
export interface ConfigurationDetail extends ConfigurationSummary {
  formSnapshot: PromptFormState | AnonymousFramingState;
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
  formSnapshot: PromptFormState | AnonymousFramingState;
  prompt: string;
  negativePrompt?: string;
  providerId?: string | null;
  providerName?: string | null;
  modelId?: string | null;
  modelLabel?: string | null;
}
