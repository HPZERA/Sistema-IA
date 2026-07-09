"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, SelectField, TextInput, TextArea } from "@/components/ui/Field";
import { CONFIGURATION_TYPE_OPTIONS, ConfigurationDetail, ConfigurationType } from "@/types/configuration";

export function EditConfigurationModal({
  configuration,
  onClose,
  onSaved,
}: {
  configuration: ConfigurationDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(configuration.name);
  const [type, setType] = useState<ConfigurationType>(configuration.type);
  const [description, setDescription] = useState(configuration.description);
  const [tagsInput, setTagsInput] = useState(configuration.tags.join(", "));
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(configuration.coverImageUrl);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCoverFileChange(file: File | null) {
    setCoverFile(file);
    if (file) setCoverImageUrl(URL.createObjectURL(file));
  }

  async function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Informe um nome.");
      return;
    }
    setSaving(true);
    try {
      let finalCoverImageUrl = coverImageUrl;
      if (coverFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", coverFile);
        const uploadRes = await fetch("/api/configurations/cover", { method: "POST", body: uploadForm });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? "Falha ao enviar imagem de capa.");
        finalCoverImageUrl = uploadData.url;
      }

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/configurations/${configuration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type, description, coverImageUrl: finalCoverImageUrl, tags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao salvar configuração.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Editar configuração" onClose={onClose} wide>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nome da configuração" full>
          <TextInput value={name} onChange={setName} />
        </Field>
        <Field label="Tipo">
          <SelectField value={type} onChange={(v) => setType(v as ConfigurationType)} options={CONFIGURATION_TYPE_OPTIONS} />
        </Field>
        <Field label="Tags (separadas por vírgula)">
          <TextInput value={tagsInput} onChange={setTagsInput} placeholder="opcional: praia, verão, editorial" />
        </Field>
        <Field label="Descrição" full hint="opcional">
          <TextArea rows={2} value={description} onChange={setDescription} placeholder="opcional" />
        </Field>
        <Field label="Imagem de capa" full hint="opcional">
          <div className="flex items-center gap-3">
            {coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImageUrl} alt="Capa" className="h-14 w-14 rounded-lg border border-white/10 object-cover" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleCoverFileChange(e.target.files?.[0] ?? null)}
              className="text-xs text-neutral-400"
            />
            {coverImageUrl && (
              <button
                type="button"
                onClick={() => {
                  setCoverFile(null);
                  setCoverImageUrl(null);
                }}
                className="text-xs text-red-300 hover:underline"
              >
                Remover
              </button>
            )}
          </div>
        </Field>

        {error && <p className="col-span-full text-xs text-red-400">{error}</p>}

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="col-span-full rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </Modal>
  );
}
