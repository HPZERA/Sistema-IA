"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, SelectField, TextInput, TextArea } from "@/components/ui/Field";
import { CONFIGURATION_TYPE_OPTIONS, ConfigurationDetail, ConfigurationType } from "@/types/configuration";
import { PromptFormState } from "@/types/formState";

interface ExistingConfigurationRef {
  id: string;
  name: string;
  type: ConfigurationType;
  description: string;
  coverImageUrl: string | null;
  tags: string[];
}

export function SaveConfigurationModal({
  form,
  prompt,
  negativePrompt,
  providerId,
  providerName,
  modelId,
  modelLabel,
  existing,
  onClose,
  onSaved,
}: {
  form: PromptFormState;
  prompt: string;
  negativePrompt: string;
  providerId: string | null;
  providerName: string | null;
  modelId: string | null;
  modelLabel: string | null;
  existing: ExistingConfigurationRef | null;
  onClose: () => void;
  onSaved: (saved: ConfigurationDetail) => void;
}) {
  const [mode, setMode] = useState<"update" | "new">(existing ? "update" : "new");
  const [name, setName] = useState(existing?.name ?? "");
  const [type, setType] = useState<ConfigurationType>(existing?.type ?? "outro");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [tagsInput, setTagsInput] = useState((existing?.tags ?? []).join(", "));
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(existing?.coverImageUrl ?? null);
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

      const payload = {
        name: name.trim(),
        type,
        description,
        coverImageUrl: finalCoverImageUrl,
        tags,
        formSnapshot: form,
        prompt,
        negativePrompt,
        providerId,
        providerName,
        modelId,
        modelLabel,
      };

      const useUpdate = mode === "update" && existing;
      const res = await fetch(useUpdate ? `/api/configurations/${existing!.id}` : "/api/configurations", {
        method: useUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao salvar configuração.");
      onSaved(data.configuration);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Salvar configuração completa" onClose={onClose} wide>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {existing && (
          <div className="col-span-full flex flex-wrap gap-4 rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-300">
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={mode === "update"} onChange={() => setMode("update")} />
              Atualizar &quot;{existing.name}&quot;
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={mode === "new"} onChange={() => setMode("new")} />
              Salvar como nova configuração
            </label>
          </div>
        )}

        <Field label="Nome da configuração" full>
          <TextInput value={name} onChange={setName} placeholder="ex: Homem Praia Sem Rosto" />
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
          {saving ? "Salvando..." : mode === "update" ? "Atualizar configuração" : "Salvar configuração"}
        </button>
      </div>
    </Modal>
  );
}
