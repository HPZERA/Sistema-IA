"use client";

import { useState } from "react";
import { AIModel, AIProviderConfigPublic, ProviderKind } from "@/types/aiProvider";
import { PROVIDER_KIND_INFO, PROVIDER_KIND_OPTIONS } from "@/lib/ai-providers/registry";

export interface ProviderFormValues {
  name: string;
  kind: ProviderKind;
  apiKey: string;
  endpoint: string;
  models: AIModel[];
  active: boolean;
  priority: number;
}

function emptyModel(): AIModel {
  return { id: "", label: "", remoteId: "", supportsNegativePrompt: false };
}

function initialValues(existing?: AIProviderConfigPublic): ProviderFormValues {
  if (existing) {
    return {
      name: existing.name,
      kind: existing.kind,
      apiKey: "",
      endpoint: existing.endpoint ?? "",
      models: existing.models,
      active: existing.active,
      priority: existing.priority,
    };
  }
  const kind: ProviderKind = "fal";
  const info = PROVIDER_KIND_INFO[kind];
  return {
    name: info.label,
    kind,
    apiKey: "",
    endpoint: info.defaultEndpoint ?? "",
    models: info.defaultModels,
    active: false,
    priority: 100,
  };
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-100 outline-none transition focus:border-fuchsia-400/60 focus:ring-1 focus:ring-fuchsia-400/40";

export function ProviderForm({
  existing,
  onCancel,
  onSubmit,
}: {
  existing?: AIProviderConfigPublic;
  onCancel: () => void;
  onSubmit: (values: ProviderFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<ProviderFormValues>(() => initialValues(existing));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProviderFormValues>(key: K, value: ProviderFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleKindChange(kind: ProviderKind) {
    const info = PROVIDER_KIND_INFO[kind];
    setValues((prev) => ({
      ...prev,
      kind,
      endpoint: info.defaultEndpoint ?? "",
      models: info.defaultModels.length > 0 ? info.defaultModels : prev.models,
      name: existing ? prev.name : info.label,
    }));
  }

  function updateModel(index: number, patch: Partial<AIModel>) {
    setValues((prev) => ({
      ...prev,
      models: prev.models.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  }

  function addModel() {
    setValues((prev) => ({ ...prev, models: [...prev.models, emptyModel()] }));
  }

  function removeModel(index: number) {
    setValues((prev) => ({ ...prev, models: prev.models.filter((_, i) => i !== index) }));
  }

  async function handleSubmit() {
    setError(null);
    if (!values.name.trim()) return setError("Informe um nome para o provedor.");
    if (values.models.length === 0) return setError("Adicione ao menos um modelo.");
    if (values.models.some((m) => !m.id.trim() || !m.label.trim() || !m.remoteId.trim())) {
      return setError("Preencha id, nome e identificador remoto de todos os modelos.");
    }
    if (values.kind === "custom" && !values.endpoint.trim()) {
      return setError("Provedores personalizados exigem um endpoint.");
    }

    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-fuchsia-400/30 bg-neutral-900/60 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-300">Nome</span>
          <input className={inputClass} value={values.name} onChange={(e) => update("name", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-300">Tipo de provedor</span>
          <select
            className={inputClass}
            value={values.kind}
            disabled={!!existing}
            onChange={(e) => handleKindChange(e.target.value as ProviderKind)}
          >
            {PROVIDER_KIND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-neutral-900">
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-300">
            Chave de API {existing && <span className="text-neutral-500">(deixe em branco para manter a atual)</span>}
          </span>
          <input
            className={inputClass}
            type="password"
            value={values.apiKey}
            placeholder={existing?.hasApiKey ? "•••••••• (configurada)" : "cole a chave aqui"}
            onChange={(e) => update("apiKey", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-300">Endpoint {values.kind !== "custom" && <span className="text-neutral-500">(opcional)</span>}</span>
          <input className={inputClass} value={values.endpoint} onChange={(e) => update("endpoint", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-300">Prioridade (menor = tentado primeiro)</span>
          <input
            className={inputClass}
            type="number"
            value={values.priority}
            onChange={(e) => update("priority", Number(e.target.value))}
          />
        </label>

        <label className="flex items-center gap-2 self-end pb-2 text-xs font-medium text-neutral-300">
          <input type="checkbox" checked={values.active} onChange={(e) => update("active", e.target.checked)} />
          Ativo
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Modelos</span>
          <button
            type="button"
            onClick={addModel}
            className="rounded-lg border border-white/10 bg-neutral-900/70 px-2.5 py-1 text-xs text-neutral-300 hover:border-white/25"
          >
            + Adicionar modelo
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {values.models.map((model, index) => (
            <div key={index} className="grid grid-cols-1 gap-2 rounded-lg border border-white/10 bg-neutral-950/60 p-2.5 sm:grid-cols-[1fr_1fr_1fr_5rem_auto_auto]">
              <input
                className={inputClass}
                placeholder="id (ex: flux-pro)"
                value={model.id}
                onChange={(e) => updateModel(index, { id: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Nome exibido (ex: Flux Pro)"
                value={model.label}
                onChange={(e) => updateModel(index, { label: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Identificador remoto (API)"
                value={model.remoteId}
                onChange={(e) => updateModel(index, { remoteId: e.target.value })}
              />
              <input
                className={inputClass}
                type="number"
                step="0.001"
                placeholder="US$/img"
                value={model.costPerImage ?? ""}
                onChange={(e) => updateModel(index, { costPerImage: e.target.value ? Number(e.target.value) : undefined })}
              />
              <label className="flex items-center gap-1.5 whitespace-nowrap px-1 text-xs text-neutral-400">
                <input
                  type="checkbox"
                  checked={model.supportsNegativePrompt}
                  onChange={(e) => updateModel(index, { supportsNegativePrompt: e.target.checked })}
                />
                Neg. prompt
              </label>
              <button
                type="button"
                onClick={() => removeModel(index)}
                className="rounded-lg border border-red-400/30 px-2 text-xs text-red-300 hover:bg-red-400/10"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={handleSubmit}
          className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 bg-neutral-900/70 px-4 py-2 text-xs text-neutral-300 hover:border-white/25"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
