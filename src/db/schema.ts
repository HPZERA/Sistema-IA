import { boolean, integer, jsonb, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { AIModel } from "@/types/aiProvider";
import { PromptFormState } from "@/types/formState";

export const aiProviders = pgTable("ai_providers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  apiKey: text("api_key").notNull().default(""),
  endpoint: text("endpoint"),
  models: jsonb("models").$type<AIModel[]>().notNull().default([]),
  active: boolean("active").notNull().default(false),
  priority: integer("priority").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const generationStatusValues = ["completed", "failed"] as const;
export type GenerationStatus = (typeof generationStatusValues)[number];

export const generations = pgTable("generations", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  prompt: text("prompt").notNull(),
  negativePrompt: text("negative_prompt").notNull().default(""),
  providerId: text("provider_id"),
  providerName: text("provider_name").notNull(),
  modelId: text("model_id").notNull(),
  modelLabel: text("model_label").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  durationMs: integer("duration_ms"),
  creditsUsed: numeric("credits_used"),
  costUsd: numeric("cost_usd"),
  imageUrl: text("image_url"),
  formSnapshot: jsonb("form_snapshot").$type<PromptFormState>(),
  status: text("status").$type<GenerationStatus>().notNull(),
  errorMessage: text("error_message"),
  cacheKey: text("cache_key"),
  servedFromCache: boolean("served_from_cache").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const favoriteTypeValues = ["prompt", "scenario"] as const;
export type FavoriteType = (typeof favoriteTypeValues)[number];

export const favorites = pgTable("favorites", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text("type").$type<FavoriteType>().notNull(),
  name: text("name").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const templates = pgTable("templates", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  formSnapshot: jsonb("form_snapshot").$type<PromptFormState>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Universal Library system — every selectable category in the Prompt Studio (scenario, clothing,
// pose, camera, lighting, ...) is a set of "modules" (categories, e.g. "Praia") each holding
// "options" (items, e.g. "Água cristalina"). `libraryKey` is a free-form string rather than a DB
// enum so a new library can be introduced later with no migration.
export const libraryModules = pgTable("library_modules", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  libraryKey: text("library_key").notNull(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default(""),
  category: text("category").notNull().default(""),
  complementaryPrompt: text("complementary_prompt").notNull().default(""),
  order: integer("order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const libraryOptions = pgTable("library_options", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  moduleId: text("module_id")
    .notNull()
    .references(() => libraryModules.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  keywords: text("keywords").notNull(),
  description: text("description").notNull().default(""),
  order: integer("order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const consistencyLevelValues = ["baixa", "media", "alta", "muito-alta"] as const;
export type ConsistencyLevel = (typeof consistencyLevelValues)[number];

// Character Library — reusable, consistent model identities. Kept separate from the ad-hoc
// "Personagem" fields already in PromptFormState; selecting one just adds an identity-lock
// enrichment on top (src/lib/characterPrompt.ts) without touching that existing form.
export const characters = pgTable("characters", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  gender: text("gender").notNull().default(""),
  age: integer("age").notNull(),
  height: text("height").notNull().default(""),
  skinColor: text("skin_color").notNull().default(""),
  eyeColor: text("eye_color").notNull().default(""),
  faceShape: text("face_shape").notNull().default(""),
  hairColor: text("hair_color").notNull().default(""),
  hairLength: text("hair_length").notNull().default(""),
  hairType: text("hair_type").notNull().default(""),
  bodyType: text("body_type").notNull().default(""),
  weight: text("weight").notNull().default(""),
  tattoos: text("tattoos").notNull().default(""),
  piercings: text("piercings").notNull().default(""),
  style: text("style").notNull().default(""),
  notes: text("notes").notNull().default(""),
  consistencyLevel: text("consistency_level").$type<ConsistencyLevel>().notNull().default("media"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const characterReferenceTypeValues = ["frente", "perfil", "costas", "corpo-inteiro", "outro"] as const;
export type CharacterReferenceType = (typeof characterReferenceTypeValues)[number];

// Only Blob metadata lives here — the image bytes themselves live in Vercel Blob, never base64
// in Postgres (keeps this table cheap to query even with dozens of images per character).
export const characterImages = pgTable("character_images", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  characterId: text("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  blobUrl: text("blob_url").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  referenceType: text("reference_type").$type<CharacterReferenceType>().notNull().default("outro"),
  order: integer("order").notNull().default(0),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});
