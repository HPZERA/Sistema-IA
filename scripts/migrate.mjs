// One-off migration runner, deliberately using the plain `pg` driver (not
// @neondatabase/serverless) — `drizzle-kit push`'s websocket-based introspection hangs
// indefinitely in some local network environments, while a direct TCP connection works fine.
// Usage: npm run db:migrate
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não encontrada em .env.local");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

await migrate(db, { migrationsFolder: "./drizzle" });
await pool.end();
console.log("Migrations applied.");
