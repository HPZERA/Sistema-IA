import { NextResponse } from "next/server";
import { deleteTemplate } from "@/lib/templates";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await deleteTemplate(id);
  if (!removed) return NextResponse.json({ error: "Template não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
