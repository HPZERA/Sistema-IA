import { NextResponse } from "next/server";
import { duplicateConfiguration } from "@/lib/configurations";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const configuration = await duplicateConfiguration(id);
  if (!configuration) return NextResponse.json({ error: "Configuração não encontrada." }, { status: 404 });
  return NextResponse.json({ configuration }, { status: 201 });
}
