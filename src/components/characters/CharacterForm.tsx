"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, NumberInput, SelectField, TextArea, TextInput } from "@/components/ui/Field";
import { CharacterImageManager } from "@/components/characters/CharacterImageManager";
import { CONSISTENCY_LEVEL_OPTIONS, CharacterWithImages, ConsistencyLevel } from "@/types/character";
import { GENDER_OPTIONS } from "@/types/promptOptions";
import { MAX_AGE, MIN_AGE } from "@/lib/safety";

type FormFields = {
  name: string;
  gender: string;
  age: number;
  height: string;
  skinColor: string;
  eyeColor: string;
  faceShape: string;
  hairColor: string;
  hairLength: string;
  hairType: string;
  bodyType: string;
  weight: string;
  tattoos: string;
  piercings: string;
  style: string;
  notes: string;
  consistencyLevel: ConsistencyLevel;
};

const EMPTY: FormFields = {
  name: "",
  gender: GENDER_OPTIONS[0].value,
  age: 25,
  height: "",
  skinColor: "",
  eyeColor: "",
  faceShape: "",
  hairColor: "",
  hairLength: "",
  hairType: "",
  bodyType: "",
  weight: "",
  tattoos: "",
  piercings: "",
  style: "",
  notes: "",
  consistencyLevel: "media",
};

export function CharacterForm({
  existing,
  onClose,
}: {
  existing?: CharacterWithImages;
  onClose: () => void;
}) {
  const [fields, setFields] = useState<FormFields>(existing ? { ...existing } : EMPTY);
  const [characterId, setCharacterId] = useState<string | null>(existing?.id ?? null);
  const [images, setImages] = useState(existing?.images ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setError(null);
    if (!fields.name.trim()) {
      setError("Informe o nome do personagem.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(characterId ? `/api/characters/${characterId}` : "/api/characters", {
        method: characterId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao salvar personagem.");
      if (!characterId) setCharacterId(data.character.id);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={existing ? `Editar ${existing.name}` : "Novo personagem"} onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nome" full>
            <TextInput value={fields.name} onChange={(v) => update("name", v)} placeholder="ex: Sofia" />
          </Field>
          <Field label="Sexo">
            <SelectField value={fields.gender} onChange={(v) => update("gender", v)} options={GENDER_OPTIONS} />
          </Field>
          <Field label={`Idade (${MIN_AGE}–${MAX_AGE} anos)`}>
            <NumberInput value={fields.age} min={MIN_AGE} max={MAX_AGE} onChange={(v) => update("age", v)} />
          </Field>
          <Field label="Altura">
            <TextInput value={fields.height} onChange={(v) => update("height", v)} placeholder="ex: 1.70m, tall" />
          </Field>
          <Field label="Cor da pele">
            <TextInput value={fields.skinColor} onChange={(v) => update("skinColor", v)} placeholder="ex: tan" />
          </Field>
          <Field label="Cor dos olhos">
            <TextInput value={fields.eyeColor} onChange={(v) => update("eyeColor", v)} placeholder="ex: green" />
          </Field>
          <Field label="Formato do rosto">
            <TextInput value={fields.faceShape} onChange={(v) => update("faceShape", v)} placeholder="ex: oval" />
          </Field>
          <Field label="Cor do cabelo">
            <TextInput value={fields.hairColor} onChange={(v) => update("hairColor", v)} placeholder="ex: dark blonde" />
          </Field>
          <Field label="Comprimento do cabelo">
            <TextInput value={fields.hairLength} onChange={(v) => update("hairLength", v)} placeholder="ex: long" />
          </Field>
          <Field label="Tipo do cabelo">
            <TextInput value={fields.hairType} onChange={(v) => update("hairType", v)} placeholder="ex: wavy" />
          </Field>
          <Field label="Tipo físico">
            <TextInput value={fields.bodyType} onChange={(v) => update("bodyType", v)} placeholder="ex: athletic build" />
          </Field>
          <Field label="Peso aproximado">
            <TextInput value={fields.weight} onChange={(v) => update("weight", v)} placeholder="ex: 60kg" />
          </Field>
          <Field label="Tatuagens">
            <TextInput value={fields.tattoos} onChange={(v) => update("tattoos", v)} placeholder="opcional" />
          </Field>
          <Field label="Piercings">
            <TextInput value={fields.piercings} onChange={(v) => update("piercings", v)} placeholder="opcional" />
          </Field>
          <Field label="Estilo">
            <TextInput value={fields.style} onChange={(v) => update("style", v)} placeholder="ex: editorial, streetwear" />
          </Field>
          <Field label="Nível de consistência">
            <SelectField
              value={fields.consistencyLevel}
              onChange={(v) => update("consistencyLevel", v as ConsistencyLevel)}
              options={CONSISTENCY_LEVEL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </Field>
          <Field label="Observações" full>
            <TextArea rows={2} value={fields.notes} onChange={(v) => update("notes", v)} placeholder="opcional" />
          </Field>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Salvando..." : characterId ? "Salvar alterações" : "Criar personagem"}
          </button>
          {saved && <span className="text-xs text-emerald-400">Salvo.</span>}
        </div>

        {characterId ? (
          <div className="border-t border-white/10 pt-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-300">Imagens de referência</h4>
            <CharacterImageManager characterId={characterId} images={images} onImagesChange={setImages} />
          </div>
        ) : (
          <p className="rounded-lg border border-white/10 bg-neutral-900/40 p-3 text-xs text-neutral-500">
            Salve o personagem para poder enviar imagens de referência.
          </p>
        )}
      </div>
    </Modal>
  );
}
