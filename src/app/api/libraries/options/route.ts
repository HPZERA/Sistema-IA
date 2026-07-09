import { NextResponse } from "next/server";
import { createOption } from "@/lib/libraries";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.moduleId) return NextResponse.json({ error: "Categoria (módulo) é obrigatória." }, { status: 400 });
  if (!body?.label?.trim()) return NextResponse.json({ error: "Informe um nome." }, { status: 400 });
  if (!body?.keywords?.trim()) return NextResponse.json({ error: "Informe as palavras-chave do prompt." }, { status: 400 });

  const option = await createOption({
    moduleId: body.moduleId,
    label: body.label.trim(),
    keywords: body.keywords.trim(),
    description: body.description?.trim(),
  });
  return NextResponse.json({ option }, { status: 201 });
}
