import { NextResponse } from "next/server";
import { duplicateOption } from "@/lib/libraries";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const option = await duplicateOption(id);
  if (!option) return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  return NextResponse.json({ option }, { status: 201 });
}
