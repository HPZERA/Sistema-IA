import { NextResponse } from "next/server";
import { uploadConfigurationCover } from "@/lib/blob";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });

  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const uploaded = await uploadConfigurationCover(file);
  return NextResponse.json({ url: uploaded.url }, { status: 201 });
}
