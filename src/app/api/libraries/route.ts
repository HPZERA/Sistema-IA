import { NextResponse } from "next/server";
import { listLibraryModules } from "@/lib/libraries";
import { LIBRARY_KEYS, LibraryKey } from "@/types/library";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key && !LIBRARY_KEYS.includes(key as LibraryKey)) {
    return NextResponse.json({ error: "Biblioteca inválida." }, { status: 400 });
  }

  const modules = await listLibraryModules(key as LibraryKey | undefined);
  return NextResponse.json({ modules });
}
