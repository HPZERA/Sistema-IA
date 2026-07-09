import { NextResponse } from "next/server";
import { deleteOption, updateOption } from "@/lib/libraries";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido." }, { status: 400 });

  const option = await updateOption(id, {
    label: body.label?.trim(),
    keywords: body.keywords?.trim(),
    description: body.description?.trim(),
    order: typeof body.order === "number" ? body.order : undefined,
    active: typeof body.active === "boolean" ? body.active : undefined,
  });
  if (!option) return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  return NextResponse.json({ option });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await deleteOption(id);
  if (!removed) return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
