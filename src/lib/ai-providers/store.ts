import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { aiProviders } from "@/db/schema";
import { AIProviderConfig, ProviderKind } from "@/types/aiProvider";
import { PROVIDER_KIND_INFO } from "@/lib/ai-providers/registry";

// Server-side only persistence for provider configs (API keys included). Never import this
// from a "use client" component. Backed by Postgres (see src/db/schema.ts) — this used to be a
// local JSON file, which doesn't survive Vercel's ephemeral serverless filesystem; the function
// signatures below are unchanged from that version, so nothing else in the app had to change.

function toConfig(row: typeof aiProviders.$inferSelect): AIProviderConfig {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind as AIProviderConfig["kind"],
    apiKey: row.apiKey,
    endpoint: row.endpoint ?? undefined,
    models: row.models,
    active: row.active,
    priority: row.priority,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// Curated starting point so the admin screen never opens completely empty — every entry here
// ships with sensible default models (registry.ts) but no API key, so it's created inactive
// with the "sem chave" badge until the admin pastes a real key and activates it. Ordered by
// priority as a rough "recommended first" ranking (cheap/fast FLUX hosts first).
const RECOMMENDED_PROVIDER_KINDS: { kind: ProviderKind; priority: number }[] = [
  { kind: "fal", priority: 10 },
  { kind: "black-forest-labs", priority: 20 },
  { kind: "replicate", priority: 30 },
  { kind: "stability-ai", priority: 40 },
  { kind: "openai", priority: 50 },
  { kind: "together-ai", priority: 60 },
];

let recommendedProvidersSeeded = false;

async function ensureRecommendedProvidersSeed(): Promise<void> {
  if (recommendedProvidersSeeded) return;
  const db = getDb();
  const existing = await db.select({ id: aiProviders.id }).from(aiProviders).limit(1);
  if (existing.length > 0) {
    recommendedProvidersSeeded = true;
    return;
  }

  for (const { kind, priority } of RECOMMENDED_PROVIDER_KINDS) {
    const info = PROVIDER_KIND_INFO[kind];
    await db.insert(aiProviders).values({
      id: `${kind}-recommended`,
      name: info.label,
      kind,
      apiKey: "",
      endpoint: info.defaultEndpoint,
      models: info.defaultModels,
      active: false,
      priority,
    });
  }
  recommendedProvidersSeeded = true;
}

export async function listProviders(): Promise<AIProviderConfig[]> {
  await ensureRecommendedProvidersSeed();
  const rows = await getDb().select().from(aiProviders);
  return rows.map(toConfig);
}

export async function getProvider(id: string): Promise<AIProviderConfig | undefined> {
  const rows = await getDb().select().from(aiProviders).where(eq(aiProviders.id, id));
  return rows[0] ? toConfig(rows[0]) : undefined;
}

export async function createProvider(
  input: Omit<AIProviderConfig, "id" | "createdAt" | "updatedAt">
): Promise<AIProviderConfig> {
  const id = `${input.kind}-${Date.now().toString(36)}`;
  const [row] = await getDb()
    .insert(aiProviders)
    .values({
      id,
      name: input.name,
      kind: input.kind,
      apiKey: input.apiKey,
      endpoint: input.endpoint,
      models: input.models,
      active: input.active,
      priority: input.priority,
    })
    .returning();
  return toConfig(row);
}

export async function updateProvider(
  id: string,
  patch: Partial<Omit<AIProviderConfig, "id" | "createdAt">>
): Promise<AIProviderConfig | undefined> {
  const [row] = await getDb()
    .update(aiProviders)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(aiProviders.id, id))
    .returning();
  return row ? toConfig(row) : undefined;
}

export async function deleteProvider(id: string): Promise<boolean> {
  const rows = await getDb().delete(aiProviders).where(eq(aiProviders.id, id)).returning({ id: aiProviders.id });
  return rows.length > 0;
}
