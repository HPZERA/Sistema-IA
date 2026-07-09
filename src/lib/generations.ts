import { createHash } from "crypto";
import { and, desc, eq, gt, ilike, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { generations, GenerationStatus } from "@/db/schema";
import { PromptFormState } from "@/types/formState";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // identical prompts are served from cache for 24h

export interface CacheLookupInput {
  prompt: string;
  negativePrompt: string;
  providerId: string;
  modelId: string;
  width: number;
  height: number;
}

export function computeCacheKey(input: CacheLookupInput): string {
  const normalized = JSON.stringify({
    prompt: input.prompt.trim(),
    negativePrompt: input.negativePrompt.trim(),
    providerId: input.providerId,
    modelId: input.modelId,
    width: input.width,
    height: input.height,
  });
  return createHash("sha256").update(normalized).digest("hex");
}

export async function findCachedGeneration(cacheKey: string) {
  const since = new Date(Date.now() - CACHE_TTL_MS);
  const rows = await getDb()
    .select()
    .from(generations)
    .where(and(eq(generations.cacheKey, cacheKey), eq(generations.status, "completed"), gt(generations.createdAt, since)))
    .orderBy(desc(generations.createdAt))
    .limit(1);
  return rows[0];
}

export interface RecordGenerationInput {
  prompt: string;
  negativePrompt: string;
  providerId?: string;
  providerName: string;
  modelId: string;
  modelLabel: string;
  width: number;
  height: number;
  durationMs?: number;
  creditsUsed?: number;
  costUsd?: number;
  imageUrl?: string;
  formSnapshot?: PromptFormState;
  status: GenerationStatus;
  errorMessage?: string;
  cacheKey?: string;
  servedFromCache?: boolean;
}

export async function recordGeneration(input: RecordGenerationInput) {
  const [row] = await getDb()
    .insert(generations)
    .values({
      prompt: input.prompt,
      negativePrompt: input.negativePrompt,
      providerId: input.providerId,
      providerName: input.providerName,
      modelId: input.modelId,
      modelLabel: input.modelLabel,
      width: input.width,
      height: input.height,
      durationMs: input.durationMs,
      creditsUsed: input.creditsUsed?.toString(),
      costUsd: input.costUsd?.toString(),
      imageUrl: input.imageUrl,
      formSnapshot: input.formSnapshot,
      status: input.status,
      errorMessage: input.errorMessage,
      cacheKey: input.cacheKey,
      servedFromCache: input.servedFromCache ?? false,
    })
    .returning();
  return row;
}

export interface ListGenerationsInput {
  search?: string;
  limit?: number;
  offset?: number;
}

export async function listGenerations({ search, limit = 30, offset = 0 }: ListGenerationsInput = {}) {
  const query = getDb()
    .select()
    .from(generations)
    .where(and(eq(generations.status, "completed"), search ? ilike(generations.prompt, `%${search}%`) : undefined))
    .orderBy(desc(generations.createdAt))
    .limit(limit)
    .offset(offset);
  return query;
}

export async function getGenerationById(id: string) {
  const rows = await getDb().select().from(generations).where(eq(generations.id, id));
  return rows[0];
}

export interface GenerationStats {
  totalImages: number;
  totalCostUsd: number;
  totalCredits: number;
  avgDurationMs: number;
  byProvider: { providerName: string; count: number }[];
  byModel: { modelLabel: string; count: number }[];
}

export async function getGenerationStats(): Promise<GenerationStats> {
  const db = getDb();

  const [totals] = await db
    .select({
      totalImages: sql<number>`count(*)::int`,
      totalCostUsd: sql<number>`coalesce(sum(${generations.costUsd}), 0)::float`,
      totalCredits: sql<number>`coalesce(sum(${generations.creditsUsed}), 0)::float`,
      avgDurationMs: sql<number>`coalesce(avg(${generations.durationMs}), 0)::float`,
    })
    .from(generations)
    .where(eq(generations.status, "completed"));

  const byProvider = await db
    .select({
      providerName: generations.providerName,
      count: sql<number>`count(*)::int`,
    })
    .from(generations)
    .where(eq(generations.status, "completed"))
    .groupBy(generations.providerName)
    .orderBy(desc(sql`count(*)`));

  const byModel = await db
    .select({
      modelLabel: generations.modelLabel,
      count: sql<number>`count(*)::int`,
    })
    .from(generations)
    .where(eq(generations.status, "completed"))
    .groupBy(generations.modelLabel)
    .orderBy(desc(sql`count(*)`));

  return {
    totalImages: totals?.totalImages ?? 0,
    totalCostUsd: totals?.totalCostUsd ?? 0,
    totalCredits: totals?.totalCredits ?? 0,
    avgDurationMs: totals?.avgDurationMs ?? 0,
    byProvider,
    byModel,
  };
}
