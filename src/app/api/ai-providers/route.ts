import { NextResponse } from "next/server";
import { AIModel, ProviderKind, toPublicProviderConfig } from "@/types/aiProvider";
import { createProvider, listProviders } from "@/lib/ai-providers/store";
import { PROVIDER_KIND_INFO } from "@/lib/ai-providers/registry";

export async function GET() {
  const providers = await listProviders();
  return NextResponse.json({ providers: providers.map(toPublicProviderConfig) });
}

interface CreateProviderBody {
  name: string;
  kind: ProviderKind;
  apiKey?: string;
  endpoint?: string;
  models?: AIModel[];
  active?: boolean;
  priority?: number;
}

export async function POST(request: Request) {
  let body: CreateProviderBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.name?.trim()) return NextResponse.json({ error: "Informe um nome para o provedor." }, { status: 400 });
  if (!body.kind || !PROVIDER_KIND_INFO[body.kind]) {
    return NextResponse.json({ error: "Tipo de provedor inválido." }, { status: 400 });
  }

  const kindInfo = PROVIDER_KIND_INFO[body.kind];
  const provider = await createProvider({
    name: body.name.trim(),
    kind: body.kind,
    apiKey: body.apiKey?.trim() ?? "",
    endpoint: body.endpoint?.trim() || kindInfo.defaultEndpoint,
    models: body.models && body.models.length > 0 ? body.models : kindInfo.defaultModels,
    active: body.active ?? false,
    priority: body.priority ?? 100,
  });

  return NextResponse.json({ provider: toPublicProviderConfig(provider) }, { status: 201 });
}
