import { and, desc, eq, ilike } from "drizzle-orm";
import { getDb } from "@/db/client";
import { ConfigurationType, configurations } from "@/db/schema";
import { deleteBlob } from "@/lib/blob";
import { ConfigurationInput } from "@/types/configuration";

export async function listConfigurations(filter: { search?: string; type?: ConfigurationType } = {}) {
  const db = getDb();
  const conditions = [];
  if (filter.type) conditions.push(eq(configurations.type, filter.type));
  if (filter.search?.trim()) conditions.push(ilike(configurations.name, `%${filter.search.trim()}%`));

  if (conditions.length === 0) {
    return db.select().from(configurations).orderBy(desc(configurations.updatedAt));
  }
  return db
    .select()
    .from(configurations)
    .where(conditions.length === 1 ? conditions[0] : and(...conditions))
    .orderBy(desc(configurations.updatedAt));
}

export async function getConfiguration(id: string) {
  const [row] = await getDb().select().from(configurations).where(eq(configurations.id, id));
  return row;
}

function toValues(input: ConfigurationInput) {
  return {
    name: input.name,
    type: input.type,
    description: input.description ?? "",
    coverImageUrl: input.coverImageUrl ?? null,
    tags: input.tags ?? [],
    formSnapshot: input.formSnapshot,
    prompt: input.prompt,
    negativePrompt: input.negativePrompt ?? "",
    providerId: input.providerId ?? null,
    providerName: input.providerName ?? null,
    modelId: input.modelId ?? null,
    modelLabel: input.modelLabel ?? null,
  };
}

export async function createConfiguration(input: ConfigurationInput) {
  const [row] = await getDb().insert(configurations).values(toValues(input)).returning();
  return row;
}

export async function updateConfiguration(id: string, input: ConfigurationInput) {
  const [row] = await getDb()
    .update(configurations)
    .set({ ...toValues(input), updatedAt: new Date() })
    .where(eq(configurations.id, id))
    .returning();
  return row;
}

export async function updateConfigurationMeta(
  id: string,
  patch: { name?: string; type?: ConfigurationType; description?: string; coverImageUrl?: string | null; tags?: string[] }
) {
  const [row] = await getDb()
    .update(configurations)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(configurations.id, id))
    .returning();
  return row;
}

export async function duplicateConfiguration(id: string) {
  const original = await getConfiguration(id);
  if (!original) return undefined;
  const [row] = await getDb()
    .insert(configurations)
    .values({
      name: `${original.name} (cópia)`,
      type: original.type,
      description: original.description,
      coverImageUrl: original.coverImageUrl,
      tags: original.tags,
      formSnapshot: original.formSnapshot,
      prompt: original.prompt,
      negativePrompt: original.negativePrompt,
      providerId: original.providerId,
      providerName: original.providerName,
      modelId: original.modelId,
      modelLabel: original.modelLabel,
    })
    .returning();
  return row;
}

export async function deleteConfiguration(id: string) {
  const db = getDb();
  const [existing] = await db.select().from(configurations).where(eq(configurations.id, id));
  if (!existing) return false;
  await db.delete(configurations).where(eq(configurations.id, id));
  if (existing.coverImageUrl) await deleteBlob(existing.coverImageUrl).catch(() => {});
  return true;
}
