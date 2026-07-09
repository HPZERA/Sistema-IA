import { NextResponse } from "next/server";
import { getProvider } from "@/lib/ai-providers/store";
import { getAdapter } from "@/lib/ai-providers/registry";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await getProvider(id);
  if (!provider) return NextResponse.json({ error: "Provedor não encontrado." }, { status: 404 });

  try {
    const adapter = getAdapter(provider.kind);
    const result = await adapter.testConnection(provider);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido ao testar a conexão.";
    return NextResponse.json({ ok: false, message }, { status: 200 });
  }
}
