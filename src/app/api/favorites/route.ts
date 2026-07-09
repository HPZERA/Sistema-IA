import { NextResponse } from "next/server";
import { createFavorite, listFavorites } from "@/lib/favorites";
import { FavoriteType, favoriteTypeValues } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as FavoriteType | null;
  const favorites = await listFavorites(type ?? undefined);
  return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name?.trim()) return NextResponse.json({ error: "Informe um nome." }, { status: 400 });
  if (!favoriteTypeValues.includes(body.type)) {
    return NextResponse.json({ error: "Tipo de favorito inválido." }, { status: 400 });
  }

  const favorite = await createFavorite({ type: body.type, name: body.name.trim(), payload: body.payload });
  return NextResponse.json({ favorite }, { status: 201 });
}
