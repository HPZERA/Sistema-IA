import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { FavoriteType, favorites } from "@/db/schema";

export interface FavoritePayloadPrompt {
  prompt: string;
  negativePrompt: string;
}

export interface FavoritePayloadScenario {
  scenarioModuleSelections: Record<string, string[]>;
}

export async function listFavorites(type?: FavoriteType) {
  const db = getDb();
  if (type) return db.select().from(favorites).where(eq(favorites.type, type)).orderBy(desc(favorites.createdAt));
  return db.select().from(favorites).orderBy(desc(favorites.createdAt));
}

export async function createFavorite(input: { type: FavoriteType; name: string; payload: unknown }) {
  const [row] = await getDb().insert(favorites).values(input).returning();
  return row;
}

export async function deleteFavorite(id: string) {
  const rows = await getDb().delete(favorites).where(eq(favorites.id, id)).returning({ id: favorites.id });
  return rows.length > 0;
}
