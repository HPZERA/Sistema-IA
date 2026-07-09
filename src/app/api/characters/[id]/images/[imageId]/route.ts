import { NextResponse } from "next/server";
import { deleteCharacterImage, replaceCharacterImage, updateCharacterImage } from "@/lib/characters";
import { CharacterReferenceType } from "@/types/character";

const REFERENCE_TYPES: CharacterReferenceType[] = ["frente", "perfil", "costas", "corpo-inteiro", "outro"];

export async function PATCH(request: Request, { params }: { params: Promise<{ imageId: string }> }) {
  const { imageId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  if (body.referenceType !== undefined && !REFERENCE_TYPES.includes(body.referenceType)) {
    return NextResponse.json({ error: "Tipo de referência inválido." }, { status: 400 });
  }

  const image = await updateCharacterImage(imageId, {
    order: typeof body.order === "number" ? body.order : undefined,
    referenceType: body.referenceType,
  });
  if (!image) return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  return NextResponse.json({ image });
}

// Replaces the image file in place (same row/order/reference type) — deletes the old Blob object.
export async function PUT(request: Request, { params }: { params: Promise<{ imageId: string }> }) {
  const { imageId } = await params;
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });

  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const image = await replaceCharacterImage(imageId, file);
  if (!image) return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  return NextResponse.json({ image });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ imageId: string }> }) {
  const { imageId } = await params;
  const removed = await deleteCharacterImage(imageId);
  if (!removed) return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
