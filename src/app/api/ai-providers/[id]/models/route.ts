import { NextResponse } from "next/server";
import { getProvider } from "@/lib/ai-providers/store";
import { getAdapter } from "@/lib/ai-providers/registry";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await getProvider(id);
  if (!provider) return NextResponse.json({ error: "Provedor não encontrado." }, { status: 404 });

  const adapter = getAdapter(provider.kind);
  if (!adapter.listModels) {
    return NextResponse.json(
      { error: "Este provedor não oferece descoberta automática de modelos. Cadastre os modelos manualmente." },
      { status: 400 }
    );
  }

  try {
    const models = await adapter.listModels(provider);
    return NextResponse.json({ models });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido ao buscar modelos.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
