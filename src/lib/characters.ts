import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { characters, characterImages } from "@/db/schema";
import { deleteBlob, uploadCharacterImage } from "@/lib/blob";
import {
  CharacterImage,
  CharacterInput,
  CharacterProfile,
  CharacterReferenceType,
  CharacterSummary,
  CharacterWithImages,
  ConsistencyLevel,
} from "@/types/character";

function toProfile(row: typeof characters.$inferSelect): CharacterProfile {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    age: row.age,
    height: row.height,
    skinColor: row.skinColor,
    eyeColor: row.eyeColor,
    faceShape: row.faceShape,
    hairColor: row.hairColor,
    hairLength: row.hairLength,
    hairType: row.hairType,
    bodyType: row.bodyType,
    weight: row.weight,
    tattoos: row.tattoos,
    piercings: row.piercings,
    accessories: row.accessories,
    style: row.style,
    notes: row.notes,
    basePrompt: row.basePrompt,
    consistencyLevel: row.consistencyLevel as ConsistencyLevel,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toImage(row: typeof characterImages.$inferSelect): CharacterImage {
  return {
    id: row.id,
    characterId: row.characterId,
    blobUrl: row.blobUrl,
    fileName: row.fileName,
    fileType: row.fileType,
    referenceType: row.referenceType as CharacterReferenceType,
    order: row.order,
    uploadedAt: row.uploadedAt.toISOString(),
  };
}

// Deliberately cheap: cover image + count only, never every image, so the list stays fast even
// with dozens of reference images per character.
export async function listCharacters(): Promise<CharacterSummary[]> {
  const db = getDb();
  const rows = await db.select().from(characters).orderBy(asc(characters.name));
  if (rows.length === 0) return [];

  const imageRows = await db
    .select()
    .from(characterImages)
    .where(inArray(characterImages.characterId, rows.map((r) => r.id)))
    .orderBy(asc(characterImages.order));

  const coverByCharacter = new Map<string, string>();
  const countByCharacter = new Map<string, number>();
  for (const img of imageRows) {
    countByCharacter.set(img.characterId, (countByCharacter.get(img.characterId) ?? 0) + 1);
    if (!coverByCharacter.has(img.characterId)) coverByCharacter.set(img.characterId, img.blobUrl);
  }

  return rows.map((row) => ({
    ...toProfile(row),
    coverImageUrl: coverByCharacter.get(row.id) ?? null,
    imageCount: countByCharacter.get(row.id) ?? 0,
  }));
}

export async function getCharacterWithImages(id: string): Promise<CharacterWithImages | undefined> {
  const db = getDb();
  const [row] = await db.select().from(characters).where(eq(characters.id, id));
  if (!row) return undefined;
  const imageRows = await db.select().from(characterImages).where(eq(characterImages.characterId, id)).orderBy(asc(characterImages.order));
  return { ...toProfile(row), images: imageRows.map(toImage) };
}

export async function createCharacter(input: CharacterInput): Promise<CharacterProfile> {
  const [row] = await getDb().insert(characters).values(input).returning();
  return toProfile(row);
}

export async function updateCharacter(id: string, patch: Partial<CharacterInput>): Promise<CharacterProfile | undefined> {
  const [row] = await getDb()
    .update(characters)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(characters.id, id))
    .returning();
  return row ? toProfile(row) : undefined;
}

export async function duplicateCharacter(id: string): Promise<CharacterProfile | undefined> {
  const db = getDb();
  const original = await getCharacterWithImages(id);
  if (!original) return undefined;

  const [row] = await db
    .insert(characters)
    .values({
      name: `${original.name} (cópia)`,
      gender: original.gender,
      age: original.age,
      height: original.height,
      skinColor: original.skinColor,
      eyeColor: original.eyeColor,
      faceShape: original.faceShape,
      hairColor: original.hairColor,
      hairLength: original.hairLength,
      hairType: original.hairType,
      bodyType: original.bodyType,
      weight: original.weight,
      tattoos: original.tattoos,
      piercings: original.piercings,
      accessories: original.accessories,
      style: original.style,
      notes: original.notes,
      basePrompt: original.basePrompt,
      consistencyLevel: original.consistencyLevel,
    })
    .returning();

  // Reference the same Blob objects rather than re-uploading — cheap copy, matches
  // duplicateConfiguration's coverImageUrl handling in src/lib/configurations.ts.
  if (original.images.length > 0) {
    await db.insert(characterImages).values(
      original.images.map((img) => ({
        characterId: row.id,
        blobUrl: img.blobUrl,
        fileName: img.fileName,
        fileType: img.fileType,
        referenceType: img.referenceType,
        order: img.order,
      }))
    );
  }

  return toProfile(row);
}

export async function deleteCharacter(id: string): Promise<boolean> {
  const db = getDb();
  const images = await db.select().from(characterImages).where(eq(characterImages.characterId, id));
  const rows = await db.delete(characters).where(eq(characters.id, id)).returning({ id: characters.id });
  if (rows.length === 0) return false;
  // Character row is gone (cascades the image rows); now clean up the actual blobs. Best-effort —
  // a stray blob left behind is a non-issue, but never let cleanup failure look like the delete failed.
  await Promise.allSettled(images.map((img) => deleteBlob(img.blobUrl)));
  return true;
}

export async function addCharacterImage(
  characterId: string,
  file: File,
  referenceType: CharacterReferenceType
): Promise<CharacterImage> {
  const db = getDb();
  const uploaded = await uploadCharacterImage(characterId, file);
  const existing = await db.select({ id: characterImages.id }).from(characterImages).where(eq(characterImages.characterId, characterId));
  const [row] = await db
    .insert(characterImages)
    .values({
      characterId,
      blobUrl: uploaded.url,
      fileName: uploaded.fileName,
      fileType: uploaded.fileType,
      referenceType,
      order: existing.length,
    })
    .returning();
  return toImage(row);
}

export async function replaceCharacterImage(imageId: string, file: File): Promise<CharacterImage | undefined> {
  const db = getDb();
  const [existing] = await db.select().from(characterImages).where(eq(characterImages.id, imageId));
  if (!existing) return undefined;
  const uploaded = await uploadCharacterImage(existing.characterId, file);
  const [row] = await db
    .update(characterImages)
    .set({ blobUrl: uploaded.url, fileName: uploaded.fileName, fileType: uploaded.fileType, uploadedAt: new Date() })
    .where(eq(characterImages.id, imageId))
    .returning();
  await deleteBlob(existing.blobUrl);
  return row ? toImage(row) : undefined;
}

export async function updateCharacterImage(
  imageId: string,
  patch: { order?: number; referenceType?: CharacterReferenceType }
): Promise<CharacterImage | undefined> {
  const [row] = await getDb().update(characterImages).set(patch).where(eq(characterImages.id, imageId)).returning();
  return row ? toImage(row) : undefined;
}

export async function deleteCharacterImage(imageId: string): Promise<boolean> {
  const db = getDb();
  const [existing] = await db.select().from(characterImages).where(eq(characterImages.id, imageId));
  if (!existing) return false;
  await db.delete(characterImages).where(eq(characterImages.id, imageId));
  await deleteBlob(existing.blobUrl);
  return true;
}
