"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, SelectField, TextArea, TextInput } from "@/components/ui/Field";
import { LibraryModule, LibraryOption } from "@/types/library";

export function AddOptionModal({
  modules,
  initialModuleId,
  onClose,
  onCreated,
}: {
  modules: LibraryModule[];
  initialModuleId?: string;
  onClose: () => void;
  onCreated: (moduleId: string, option: LibraryOption) => void;
}) {
  const [moduleId, setModuleId] = useState(initialModuleId ?? modules[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    if (!moduleId) {
      setError("Selecione uma categoria.");
      return;
    }
    if (!label.trim()) {
      setError("Informe um nome.");
      return;
    }
    if (!keywords.trim()) {
      setError("Informe as palavras-chave do prompt.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/libraries/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, label, keywords, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar item.");
      onCreated(moduleId, data.option);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Novo item" onClose={onClose}>
      <div className="grid grid-cols-1 gap-3">
        <Field label="Nome" full>
          <TextInput value={label} onChange={setLabel} placeholder="ex: Praia com falésias" />
        </Field>
        <Field label="Categoria" full>
          <SelectField value={moduleId} onChange={setModuleId} options={modules.map((m) => ({ value: m.id, label: `${m.icon} ${m.name}` }))} />
        </Field>
        <Field label="Palavras-chave do prompt" full hint="Termo em inglês injetado automaticamente no prompt final.">
          <TextInput value={keywords} onChange={setKeywords} placeholder="ex: cliffside beach" />
        </Field>
        <Field label="Descrição" full hint="Opcional — visível apenas no modo de gerenciamento.">
          <TextArea rows={2} value={description} onChange={setDescription} />
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
