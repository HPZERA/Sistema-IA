import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { templates } from "@/db/schema";
import { PromptFormState } from "@/types/formState";

export async function listTemplates() {
  return getDb().select().from(templates).orderBy(desc(templates.createdAt));
}

export async function createTemplate(input: { name: string; formSnapshot: PromptFormState }) {
  const [row] = await getDb()
    .insert(templates)
    .values({ name: input.name, formSnapshot: input.formSnapshot })
    .returning();
  return row;
}

export async function deleteTemplate(id: string) {
  const rows = await getDb().delete(templates).where(eq(templates.id, id)).returning({ id: templates.id });
  return rows.length > 0;
}
