import { NextResponse } from "next/server";
import { deleteConfiguration, getConfiguration, updateConfiguration, updateConfigurationMeta } from "@/lib/configurations";
import { configurationTypeValues, ConfigurationType } from "@/db/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const configuration = await getConfiguration(id);
  if (!configuration) return NextResponse.json({ error: "Configuração não encontrada." }, { status: 404 });
  return NextResponse.json({ configuration });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });

  // Full save (from Prompt Studio "Atualizar configuração"): includes a fresh formSnapshot/prompt.
  if (body.formSnapshot) {
    if (!body?.name?.trim()) return NextResponse.json({ error: "Informe um nome." }, { status: 400 });
    if (!configurationTypeValues.includes(body.type)) {
      return NextResponse.json({ error: "Tipo de configuração inválido." }, { status: 400 });
    }
    const configuration = await updateConfiguration(id, {
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
    if (!configuration) return NextResponse.json({ error: "Configuração não encontrada." }, { status: 404 });
    return NextResponse.json({ configuration });
  }

  // Metadata-only edit (from "Minhas Configurações" → Editar): name/type/description/cover/tags.
  const patch: { name?: string; type?: ConfigurationType; description?: string; coverImageUrl?: string | null; tags?: string[] } = {};
  if (typeof body.name === "string") {
    if (!body.name.trim()) return NextResponse.json({ error: "Informe um nome." }, { status: 400 });
    patch.name = body.name.trim();
  }
  if (body.type !== undefined) {
    if (!configurationTypeValues.includes(body.type)) {
      return NextResponse.json({ error: "Tipo de configuração inválido." }, { status: 400 });
    }
    patch.type = body.type;
  }
  if (typeof body.description === "string") patch.description = body.description;
  if (body.coverImageUrl !== undefined) patch.coverImageUrl = body.coverImageUrl;
  if (Array.isArray(body.tags)) patch.tags = body.tags;

  const configuration = await updateConfigurationMeta(id, patch);
  if (!configuration) return NextResponse.json({ error: "Configuração não encontrada." }, { status: 404 });
  return NextResponse.json({ configuration });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await deleteConfiguration(id);
  if (!removed) return NextResponse.json({ error: "Configuração não encontrada." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
