import { NextResponse } from "next/server";
import { getGenerationStats } from "@/lib/generations";

export async function GET() {
  const stats = await getGenerationStats();
  return NextResponse.json(stats);
}
