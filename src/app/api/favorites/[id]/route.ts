import { NextResponse } from "next/server";
import { deleteFavorite } from "@/lib/favorites";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await deleteFavorite(id);
  if (!removed) return NextResponse.json({ error: "Favorito não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
