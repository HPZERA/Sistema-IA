import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Server-only — never import this from a "use client" component.
//
// Lazily initialized so that merely importing this module (which happens during Next.js's
// build-time page-data collection, even for routes that are never statically rendered)
// doesn't require DATABASE_URL to be set. The error below only surfaces once a query actually
// runs without the env var configured.
let cached: NeonHttpDatabase<typeof schema> | undefined;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (cached) return cached;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL não configurada. Configure a variável de ambiente (fornecida pela integração Postgres/Neon da Vercel) antes de usar o banco."
    );
  }
  const sql = neon(process.env.DATABASE_URL);
  cached = drizzle(sql, { schema });
  return cached;
}
