import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { aiProviders } from "@/db/schema";
import { AIProviderConfig } from "@/types/aiProvider";

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

export async function listProviders(): Promise<AIProviderConfig[]> {
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
