import { NextResponse } from "next/server";
import { createConfiguration, listConfigurations } from "@/lib/configurations";
import { configurationTypeValues, ConfigurationType } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const typeParam = searchParams.get("type");
  const type =
    typeParam && configurationTypeValues.includes(typeParam as ConfigurationType)
      ? (typeParam as ConfigurationType)
      : undefined;

  const configurations = await listConfigurations({ search, type });
  return NextResponse.json({ configurations });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name?.trim()) return NextResponse.json({ error: "Informe um nome." }, { status: 400 });
  if (!configurationTypeValues.includes(body.type)) {
    return NextResponse.json({ error: "Tipo de configuração inválido." }, { status: 400 });
  }
  if (!body?.formSnapshot) return NextResponse.json({ error: "Configuração ausente." }, { status: 400 });

  const configuration = await createConfiguration({
    name: body.name.trim(),
    type: body.type,
    description: body.description ?? "",
    coverImageUrl: body.coverImageUrl ?? null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    formSnapshot: body.formSnapshot,
    prompt: body.prompt ?? "",
    negativePrompt: body.negativePrompt ?? "",
    providerId: body.providerId ?? null,
    providerName: body.providerName ?? null,
    modelId: body.modelId ?? null,
    modelLabel: body.modelLabel ?? null,
  });
  return NextResponse.json({ configuration }, { status: 201 });
}
