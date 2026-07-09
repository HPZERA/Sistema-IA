import { NextResponse } from "next/server";
import { duplicateCharacter } from "@/lib/characters";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const character = await duplicateCharacter(id);
  if (!character) return NextResponse.json({ error: "Personagem não encontrado." }, { status: 404 });
  return NextResponse.json({ character }, { status: 201 });
}
