import { NextResponse } from "next/server";
import { deleteCharacter, getCharacterWithImages, updateCharacter } from "@/lib/characters";
import { MAX_AGE, MIN_AGE, scanTextForViolations } from "@/lib/safety";
import { CharacterInput, ConsistencyLevel } from "@/types/character";

const CONSISTENCY_LEVELS: ConsistencyLevel[] = ["baixa", "media", "alta", "muito-alta"];

const PATCHABLE_FIELDS: (keyof CharacterInput)[] = [
  "name",
  "gender",
  "height",
  "skinColor",
  "eyeColor",
  "faceShape",
  "hairColor",
  "hairLength",
  "hairType",
  "bodyType",
  "weight",
  "tattoos",
  "piercings",
  "accessories",
  "style",
  "notes",
  "basePrompt",
  "consistencyLevel",
];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const character = await getCharacterWithImages(id);
  if (!character) return NextResponse.json({ error: "Personagem não encontrado." }, { status: 404 });
  return NextResponse.json({ character });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido." }, { status: 400 });

  if (body.age !== undefined) {
    const age = Number(body.age);
    if (!Number.isFinite(age) || age < MIN_AGE) return NextResponse.json({ error: `A idade deve ser de no mínimo ${MIN_AGE} anos.` }, { status: 400 });
    if (age > MAX_AGE) return NextResponse.json({ error: `Informe uma idade de até ${MAX_AGE} anos.` }, { status: 400 });
  }
  if (body.consistencyLevel !== undefined && !CONSISTENCY_LEVELS.includes(body.consistencyLevel)) {
    return NextResponse.json({ error: "Nível de consistência inválido." }, { status: 400 });
  }
  for (const field of ["notes", "style", "tattoos", "piercings", "accessories", "basePrompt"] as const) {
    if (typeof body[field] === "string" && scanTextForViolations(body[field])) {
      return NextResponse.json({ error: `O campo "${field}" contém um termo não permitido pela política de conteúdo.` }, { status: 400 });
    }
  }

  const patch: Partial<CharacterInput> = {};
  for (const field of PATCHABLE_FIELDS) {
    if (typeof body[field] === "string") patch[field] = body[field].trim() as never;
  }
  if (body.age !== undefined) patch.age = Number(body.age);

  const character = await updateCharacter(id, patch);
  if (!character) return NextResponse.json({ error: "Personagem não encontrado." }, { status: 404 });
  return NextResponse.json({ character });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await deleteCharacter(id);
  if (!removed) return NextResponse.json({ error: "Personagem não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
