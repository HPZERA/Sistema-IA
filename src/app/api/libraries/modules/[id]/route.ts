import { NextResponse } from "next/server";
import { deleteModule, updateModule } from "@/lib/libraries";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido." }, { status: 400 });

  const mod = await updateModule(id, {
    name: body.name?.trim(),
    icon: body.icon?.trim(),
    category: body.category?.trim(),
    complementaryPrompt: body.complementaryPrompt?.trim(),
    order: typeof body.order === "number" ? body.order : undefined,
    active: typeof body.active === "boolean" ? body.active : undefined,
  });
  if (!mod) return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
  return NextResponse.json({ module: mod });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await deleteModule(id);
  if (!removed) return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
