import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { libraryModules, libraryOptions } from "@/db/schema";
import { LIBRARY_SEED } from "@/data/librarySeed";
import { LibraryKey, LibraryModule, LibraryOption, LIBRARY_KEYS } from "@/types/library";

function toOption(row: typeof libraryOptions.$inferSelect): LibraryOption {
  return {
    id: row.id,
    moduleId: row.moduleId,
    label: row.label,
    keywords: row.keywords,
    description: row.description,
    order: row.order,
    active: row.active,
  };
}

function toModule(row: typeof libraryModules.$inferSelect, options: LibraryOption[]): LibraryModule {
  return {
    id: row.id,
    libraryKey: row.libraryKey as LibraryKey,
    name: row.name,
    icon: row.icon,
    category: row.category,
    complementaryPrompt: row.complementaryPrompt,
    order: row.order,
    active: row.active,
    options,
  };
}

const seeded = new Set<LibraryKey>();

/** Inserts the default catalog for a library the first time it's ever queried. Idempotent within
 * a process via an in-memory guard, and safe against a fresh DB (checks for existing rows first)
 * — no separate seed script or manual step required. */
async function ensureLibrarySeed(libraryKey: LibraryKey): Promise<void> {
  if (seeded.has(libraryKey)) return;
  const db = getDb();
  const existing = await db
    .select({ id: libraryModules.id })
    .from(libraryModules)
    .where(eq(libraryModules.libraryKey, libraryKey))
    .limit(1);
  if (existing.length > 0) {
    seeded.add(libraryKey);
    return;
  }

  for (const [index, mod] of LIBRARY_SEED[libraryKey].entries()) {
    const [row] = await db
      .insert(libraryModules)
      .values({
        libraryKey,
        name: mod.name,
        icon: mod.icon,
        category: mod.category,
        complementaryPrompt: mod.complementaryPrompt,
        order: index,
      })
      .returning({ id: libraryModules.id });

    if (mod.options.length > 0) {
      await db.insert(libraryOptions).values(
        mod.options.map((opt, optIndex) => ({
          moduleId: row.id,
          label: opt.label,
          keywords: opt.keywords,
          description: opt.description ?? "",
          order: optIndex,
        }))
      );
    }
  }
  seeded.add(libraryKey);
}

export async function listLibraryModules(libraryKey?: LibraryKey): Promise<LibraryModule[]> {
  const db = getDb();
  const keys = libraryKey ? [libraryKey] : LIBRARY_KEYS;
  await Promise.all(keys.map(ensureLibrarySeed));

  const moduleRows = libraryKey
    ? await db.select().from(libraryModules).where(eq(libraryModules.libraryKey, libraryKey)).orderBy(asc(libraryModules.order))
    : await db.select().from(libraryModules).orderBy(asc(libraryModules.order));

  if (moduleRows.length === 0) return [];

  const optionRows = await db
    .select()
    .from(libraryOptions)
    .where(inArray(libraryOptions.moduleId, moduleRows.map((m) => m.id)))
    .orderBy(asc(libraryOptions.order));

  const optionsByModule = new Map<string, LibraryOption[]>();
  for (const row of optionRows) {
    const list = optionsByModule.get(row.moduleId) ?? [];
    list.push(toOption(row));
    optionsByModule.set(row.moduleId, list);
  }

  return moduleRows.map((row) => toModule(row, optionsByModule.get(row.id) ?? []));
}

export interface CreateModuleInput {
  libraryKey: LibraryKey;
  name: string;
  icon?: string;
  category?: string;
  complementaryPrompt?: string;
}

export async function createModule(input: CreateModuleInput): Promise<LibraryModule> {
  const db = getDb();
  const order = await currentModuleCount(input.libraryKey);
  const [row] = await db
    .insert(libraryModules)
    .values({
      libraryKey: input.libraryKey,
      name: input.name,
      icon: input.icon ?? "✨",
      category: input.category ?? "",
      complementaryPrompt: input.complementaryPrompt ?? "",
      order,
    })
    .returning();
  return toModule(row, []);
}

async function currentModuleCount(libraryKey: LibraryKey): Promise<number> {
  const rows = await getDb().select({ id: libraryModules.id }).from(libraryModules).where(eq(libraryModules.libraryKey, libraryKey));
  return rows.length;
}

export interface UpdateModuleInput {
  name?: string;
  icon?: string;
  category?: string;
  complementaryPrompt?: string;
  order?: number;
  active?: boolean;
}

export async function updateModule(id: string, patch: UpdateModuleInput): Promise<LibraryModule | undefined> {
  const db = getDb();
  const [row] = await db
    .update(libraryModules)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(libraryModules.id, id))
    .returning();
  if (!row) return undefined;
  const optionRows = await db.select().from(libraryOptions).where(eq(libraryOptions.moduleId, id)).orderBy(asc(libraryOptions.order));
  return toModule(row, optionRows.map(toOption));
}

export async function deleteModule(id: string): Promise<boolean> {
  const rows = await getDb().delete(libraryModules).where(eq(libraryModules.id, id)).returning({ id: libraryModules.id });
  return rows.length > 0;
}

export async function duplicateModule(id: string): Promise<LibraryModule | undefined> {
  const db = getDb();
  const [source] = await db.select().from(libraryModules).where(eq(libraryModules.id, id));
  if (!source) return undefined;
  const sourceOptions = await db.select().from(libraryOptions).where(eq(libraryOptions.moduleId, id)).orderBy(asc(libraryOptions.order));

  const order = await currentModuleCount(source.libraryKey as LibraryKey);
  const [copy] = await db
    .insert(libraryModules)
    .values({
      libraryKey: source.libraryKey,
      name: `${source.name} (cópia)`,
      icon: source.icon,
      category: source.category,
      complementaryPrompt: source.complementaryPrompt,
      order,
    })
    .returning();

  let copiedOptions: LibraryOption[] = [];
  if (sourceOptions.length > 0) {
    const inserted = await db
      .insert(libraryOptions)
      .values(
        sourceOptions.map((opt) => ({
          moduleId: copy.id,
          label: opt.label,
          keywords: opt.keywords,
          description: opt.description,
          order: opt.order,
        }))
      )
      .returning();
    copiedOptions = inserted.map(toOption);
  }

  return toModule(copy, copiedOptions);
}

export interface CreateOptionInput {
  moduleId: string;
  label: string;
  keywords: string;
  description?: string;
}

export async function createOption(input: CreateOptionInput): Promise<LibraryOption> {
  const db = getDb();
  const existing = await db.select({ id: libraryOptions.id }).from(libraryOptions).where(eq(libraryOptions.moduleId, input.moduleId));
  const [row] = await db
    .insert(libraryOptions)
    .values({
      moduleId: input.moduleId,
      label: input.label,
      keywords: input.keywords,
      description: input.description ?? "",
      order: existing.length,
    })
    .returning();
  return toOption(row);
}

export interface UpdateOptionInput {
  label?: string;
  keywords?: string;
  description?: string;
  order?: number;
  active?: boolean;
}

export async function updateOption(id: string, patch: UpdateOptionInput): Promise<LibraryOption | undefined> {
  const [row] = await getDb()
    .update(libraryOptions)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(libraryOptions.id, id))
    .returning();
  return row ? toOption(row) : undefined;
}

export async function deleteOption(id: string): Promise<boolean> {
  const rows = await getDb().delete(libraryOptions).where(eq(libraryOptions.id, id)).returning({ id: libraryOptions.id });
  return rows.length > 0;
}

export async function duplicateOption(id: string): Promise<LibraryOption | undefined> {
  const db = getDb();
  const [source] = await db.select().from(libraryOptions).where(eq(libraryOptions.id, id));
  if (!source) return undefined;
  const existing = await db.select({ id: libraryOptions.id }).from(libraryOptions).where(eq(libraryOptions.moduleId, source.moduleId));
  const [row] = await db
    .insert(libraryOptions)
    .values({
      moduleId: source.moduleId,
      label: `${source.label} (cópia)`,
      keywords: source.keywords,
      description: source.description,
      order: existing.length,
    })
    .returning();
  return toOption(row);
}
