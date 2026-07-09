import { NextResponse } from "next/server";
import { duplicateModule } from "@/lib/libraries";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mod = await duplicateModule(id);
  if (!mod) return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
  return NextResponse.json({ module: mod }, { status: 201 });
}
