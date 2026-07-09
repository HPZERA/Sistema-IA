import { NextResponse } from "next/server";
import { AIModel, toPublicProviderConfig } from "@/types/aiProvider";
import { deleteProvider, updateProvider } from "@/lib/ai-providers/store";

interface UpdateProviderBody {
  name?: string;
  apiKey?: string; // omitted or empty string => keep the existing key
  endpoint?: string;
  models?: AIModel[];
  active?: boolean;
  priority?: number;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: UpdateProviderBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name.trim();
  if (body.apiKey) patch.apiKey = body.apiKey.trim(); // blank input intentionally keeps the current key
  if (body.endpoint !== undefined) patch.endpoint = body.endpoint.trim() || undefined;
  if (body.models !== undefined) patch.models = body.models;
  if (body.active !== undefined) patch.active = body.active;
  if (body.priority !== undefined) patch.priority = body.priority;

  const updated = await updateProvider(id, patch);
  if (!updated) return NextResponse.json({ error: "Provedor não encontrado." }, { status: 404 });

  return NextResponse.json({ provider: toPublicProviderConfig(updated) });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await deleteProvider(id);
  if (!removed) return NextResponse.json({ error: "Provedor não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
