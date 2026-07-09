import { NextResponse } from "next/server";
import { addCharacterImage } from "@/lib/characters";
import { CharacterReferenceType } from "@/types/character";

const REFERENCE_TYPES: CharacterReferenceType[] = ["frente", "perfil", "costas", "corpo-inteiro", "outro"];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });

  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const referenceTypeRaw = formData.get("referenceType");
  const referenceType: CharacterReferenceType =
    typeof referenceTypeRaw === "string" && REFERENCE_TYPES.includes(referenceTypeRaw as CharacterReferenceType)
      ? (referenceTypeRaw as CharacterReferenceType)
      : "outro";

  const image = await addCharacterImage(id, file, referenceType);
  return NextResponse.json({ image }, { status: 201 });
}
