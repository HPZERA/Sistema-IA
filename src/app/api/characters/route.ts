import { NextResponse } from "next/server";
import { createCharacter, listCharacters } from "@/lib/characters";
import { MAX_AGE, MIN_AGE, scanTextForViolations } from "@/lib/safety";
import { CharacterInput, ConsistencyLevel } from "@/types/character";

const CONSISTENCY_LEVELS: ConsistencyLevel[] = ["baixa", "media", "alta", "muito-alta"];

function validateCharacterInput(body: Record<string, unknown>): string | null {
  if (!(typeof body.name === "string" && body.name.trim())) return "Informe o nome do personagem.";
  const age = Number(body.age);
  if (!Number.isFinite(age) || age < MIN_AGE) return `A idade deve ser de no mínimo ${MIN_AGE} anos.`;
  if (age > MAX_AGE) return `Informe uma idade de até ${MAX_AGE} anos.`;
  if (body.consistencyLevel && !CONSISTENCY_LEVELS.includes(body.consistencyLevel as ConsistencyLevel)) {
    return "Nível de consistência inválido.";
  }
  const freeText = [body.notes, body.style, body.tattoos, body.piercings].filter(
    (v): v is string => typeof v === "string" && v.length > 0
  );
  for (const text of freeText) {
    if (scanTextForViolations(text)) return "Um dos campos contém um termo não permitido pela política de conteúdo.";
  }
  return null;
}

function toStringField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const characters = await listCharacters();
  return NextResponse.json({ characters });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido." }, { status: 400 });

  const error = validateCharacterInput(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const input: CharacterInput = {
    name: body.name.trim(),
    gender: toStringField(body.gender),
    age: Number(body.age),
    height: toStringField(body.height),
    skinColor: toStringField(body.skinColor),
    eyeColor: toStringField(body.eyeColor),
    faceShape: toStringField(body.faceShape),
    hairColor: toStringField(body.hairColor),
    hairLength: toStringField(body.hairLength),
    hairType: toStringField(body.hairType),
    bodyType: toStringField(body.bodyType),
    weight: toStringField(body.weight),
    tattoos: toStringField(body.tattoos),
    piercings: toStringField(body.piercings),
    style: toStringField(body.style),
    notes: toStringField(body.notes),
    consistencyLevel: (body.consistencyLevel as ConsistencyLevel) || "media",
  };

  const character = await createCharacter(input);
  return NextResponse.json({ character }, { status: 201 });
}
