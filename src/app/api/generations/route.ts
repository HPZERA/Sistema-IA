import { NextResponse } from "next/server";
import { listGenerations } from "@/lib/generations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? 30);
  const offset = Number(searchParams.get("offset") ?? 0);

  const items = await listGenerations({ search, limit, offset });
  return NextResponse.json({ generations: items });
}
