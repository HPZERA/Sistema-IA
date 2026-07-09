import { NextResponse } from "next/server";
import { createModule } from "@/lib/libraries";
import { LIBRARY_KEYS, LibraryKey } from "@/types/library";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name?.trim()) return NextResponse.json({ error: "Informe um nome." }, { status: 400 });
  if (!LIBRARY_KEYS.includes(body?.libraryKey)) return NextResponse.json({ error: "Biblioteca inválida." }, { status: 400 });

  const mod = await createModule({
    libraryKey: body.libraryKey as LibraryKey,
    name: body.name.trim(),
    icon: body.icon?.trim(),
    category: body.category?.trim(),
    complementaryPrompt: body.complementaryPrompt?.trim(),
  });
  return NextResponse.json({ module: mod }, { status: 201 });
}
