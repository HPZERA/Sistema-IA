"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, TextInput } from "@/components/ui/Field";
import { LibraryKey, LibraryModule } from "@/types/library";

export function AddModuleModal({
  libraryKey,
  onClose,
  onCreated,
}: {
  libraryKey: LibraryKey;
  onClose: () => void;
  onCreated: (mod: LibraryModule) => void;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [category, setCategory] = useState("");
  const [complementaryPrompt, setComplementaryPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Informe um nome.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/libraries/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libraryKey, name, icon, category, complementaryPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar categoria.");
      onCreated(data.module);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Nova categoria" onClose={onClose}>
      <div className="grid grid-cols-1 gap-3">
        <Field label="Nome" full>
          <TextInput value={name} onChange={setName} placeholder="ex: Praia com falésias" />
        </Field>
        <Field label="Ícone (emoji)">
          <TextInput value={icon} onChange={setIcon} placeholder="🏖️" />
        </Field>
        <Field label="Agrupamento">
          <TextInput value={category} onChange={setCategory} placeholder="ex: Externo" />
        </Field>
        <Field label="Prompt complementar" full hint="Frase base somada uma vez ao prompt quando qualquer item desta categoria for selecionado.">
          <TextInput value={complementaryPrompt} onChange={setComplementaryPrompt} placeholder="opcional" />
        </Field>
        {error && <p className="col-span-full text-xs text-red-400">{error}</p>}
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="col-span-full rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </Modal>
  );
}
