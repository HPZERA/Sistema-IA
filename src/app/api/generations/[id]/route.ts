import { NextResponse } from "next/server";
import { getGenerationById } from "@/lib/generations";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const generation = await getGenerationById(id);
  if (!generation) return NextResponse.json({ error: "Geração não encontrada." }, { status: 404 });
  return NextResponse.json({ generation });
}
