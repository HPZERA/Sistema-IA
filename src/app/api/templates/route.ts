import { NextResponse } from "next/server";
import { createTemplate, listTemplates } from "@/lib/templates";

export async function GET() {
  const templates = await listTemplates();
  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name?.trim()) return NextResponse.json({ error: "Informe um nome." }, { status: 400 });
  if (!body?.formSnapshot) return NextResponse.json({ error: "Configuração ausente." }, { status: 400 });

  const template = await createTemplate({ name: body.name.trim(), formSnapshot: body.formSnapshot });
  return NextResponse.json({ template }, { status: 201 });
}
