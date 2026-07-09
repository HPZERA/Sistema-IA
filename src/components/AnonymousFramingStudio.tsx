"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Field, SelectField, TextInput, TextArea } from "@/components/ui/Field";
import { ChipMultiSelect } from "@/components/ui/ChipMultiSelect";
import { Modal } from "@/components/ui/Modal";
import {
  ANONYMOUS_CAMERA_OPTIONS,
  ANONYMOUS_ENVIRONMENT_OPTIONS,
  ANONYMOUS_FOCUS_OBJECT_OPTIONS,
  ANONYMOUS_FRAMING_TYPE_OPTIONS,
  ANONYMOUS_HAND_DETAIL_OPTIONS,
  ANONYMOUS_LIGHTING_OPTIONS,
  ANONYMOUS_PERSON_OPTIONS,
} from "@/types/promptOptions";
import { AnonymousFramingState, DEFAULT_ANONYMOUS_FRAMING_STATE } from "@/types/anonymousFraming";
import {
  ANONYMOUS_FRAMING_PRESETS,
  AnonymousFramingPreset,
  buildAnonymousFramingNegativePrompt,
  buildAnonymousFramingPrompt,
} from "@/lib/anonymousFraming";
import { validateSubmission } from "@/lib/safety";
import { ConfigurationDetail } from "@/types/configuration";

export const LOAD_ANONYMOUS_CONFIGURATION_KEY = "dark-brand:load-anonymous-configuration";

type GeneratedImage = { url: string };

type LoadedAnonymousConfiguration = Pick<ConfigurationDetail, "id" | "name" | "description" | "tags">;

type ChipField = "framingType" | "focusObject" | "handDetails" | "camera";

export function AnonymousFramingStudio() {
  const [form, setForm] = useState<AnonymousFramingState>(DEFAULT_ANONYMOUS_FRAMING_STATE);
  // Tracks whether the user picked any option since the page loaded — while false, the prompt
  // panel stays blank instead of showing a sentence built from the untouched defaults.
  const [touched, setTouched] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState(() => buildAnonymousFramingNegativePrompt());
  const [promptTouched, setPromptTouched] = useState(false);

  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [loadedConfiguration, setLoadedConfiguration] = useState<LoadedAnonymousConfiguration | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(LOAD_ANONYMOUS_CONFIGURATION_KEY);
    if (!raw) return;
    window.sessionStorage.removeItem(LOAD_ANONYMOUS_CONFIGURATION_KEY);
    try {
      const payload: ConfigurationDetail = JSON.parse(raw);
      setForm(payload.formSnapshot as AnonymousFramingState);
      setPrompt(payload.prompt);
      setNegativePrompt(payload.negativePrompt);
      setPromptTouched(true);
      setTouched(true);
      setLoadedConfiguration({
        id: payload.id,
        name: payload.name,
        description: payload.description,
        tags: payload.tags,
      });
    } catch {
      // ignore malformed handoff payloads
    }
  }, []);

  useEffect(() => {
    if (promptTouched) return;
    setPrompt(touched ? buildAnonymousFramingPrompt(form) : "");
  }, [form, promptTouched, touched]);

  function updateField<K extends keyof AnonymousFramingState>(key: K, value: AnonymousFramingState[K]) {
    setTouched(true);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleChip(key: ChipField, value: string) {
    setTouched(true);
    // "Parte visível" is exclusive: clicking a crop marks only that one, instead of accumulating
    // previously-clicked crops (which produced contradictory prompts).
    if (key === "framingType") {
      setForm((prev) => ({ ...prev, framingType: prev.framingType.includes(value) ? [] : [value] }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  }

  function applyPreset(preset: AnonymousFramingPreset) {
    setTouched(true);
    setForm((prev) => ({
      ...prev,
      person: preset.person,
      framingType: preset.framingType,
      focusObject: preset.focusObject,
      focusObjectCustom: "",
      environment: preset.environment,
    }));
  }

  function resyncPromptFromFields() {
    setPrompt(touched ? buildAnonymousFramingPrompt(form) : "");
    setNegativePrompt(buildAnonymousFramingNegativePrompt());
    setPromptTouched(false);
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
  }

  const clientSafetyCheck = validateSubmission({
    age: 25,
    consentAccepted: form.consentAccepted,
    freeTextFields: {
      "objeto em foco (personalizado)": form.focusObjectCustom,
      "detalhes da mão/braço (personalizado)": form.handDetailsCustom,
      "prompt personalizado": form.customPrompt,
      "prompt editado": prompt,
    },
  });

  async function handleGenerate() {
    setError(null);
    if (!clientSafetyCheck.ok) {
      setError(clientSafetyCheck.reason);
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: { age: 25, consentAccepted: form.consentAccepted, aspectRatio: "4:5" },
          promptOverride: prompt,
          negativePromptOverride: negativePrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar imagem.");
      setImages(data.images ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[1fr_420px] lg:px-8">
      <div className="flex flex-col gap-5">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-50">🕶️ Enquadramento Anônimo</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-400">
              Página independente para composições sem rosto: apenas mão, braço, pernas, pés, costas ou selfie sem
              rosto. O prompt aqui é construído do zero, exclusivamente com as opções desta página — nunca com dados
              do Prompt Studio principal.
            </p>
          </div>
          <Link
            href="/"
            className="whitespace-nowrap rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/25"
          >
            ← Prompt Studio
          </Link>
        </header>

        {loadedConfiguration && (
          <p className="rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-400">
            Carregado de: <strong className="text-neutral-300">{loadedConfiguration.name}</strong>
          </p>
        )}

        <Section title="Pessoa e ambiente">
          <Field label="Pessoa">
            <SelectField value={form.person} onChange={(v) => updateField("person", v)} options={ANONYMOUS_PERSON_OPTIONS} />
          </Field>
          <Field label="Ambiente">
            <SelectField
              value={form.environment}
              onChange={(v) => updateField("environment", v)}
              options={ANONYMOUS_ENVIRONMENT_OPTIONS}
            />
          </Field>
        </Section>

        <Section
          title="Parte visível"
          description="Selecione a composição sem rosto — clicar em outra opção troca a seleção."
        >
          <Field label="Parte visível" full>
            <ChipMultiSelect
              options={ANONYMOUS_FRAMING_TYPE_OPTIONS}
              selected={form.framingType}
              onToggle={(v) => toggleChip("framingType", v)}
            />
          </Field>
        </Section>

        <Section title="Objeto em foco">
          <Field label="Objeto em foco" full>
            <ChipMultiSelect
              options={ANONYMOUS_FOCUS_OBJECT_OPTIONS}
              selected={form.focusObject}
              onToggle={(v) => toggleChip("focusObject", v)}
            />
          </Field>
          <Field label="Objeto em foco (personalizado)" full>
            <TextInput
              value={form.focusObjectCustom}
              onChange={(v) => updateField("focusObjectCustom", v)}
              placeholder="ex: colar de pérolas"
            />
          </Field>
        </Section>

        <Section title="Detalhes da mão/braço" description="Só entram no prompt se selecionados aqui.">
          <Field label="Detalhes da mão/braço" full>
            <ChipMultiSelect
              options={ANONYMOUS_HAND_DETAIL_OPTIONS}
              selected={form.handDetails}
              onToggle={(v) => toggleChip("handDetails", v)}
            />
          </Field>
          <Field label="Detalhes da mão/braço (personalizado)" full>
            <TextInput
              value={form.handDetailsCustom}
              onChange={(v) => updateField("handDetailsCustom", v)}
              placeholder="ex: aliança de casamento"
            />
          </Field>
        </Section>

        <Section title="Iluminação e câmera">
          <Field label="Iluminação">
            <SelectField
              value={form.lighting}
              onChange={(v) => updateField("lighting", v)}
              options={ANONYMOUS_LIGHTING_OPTIONS}
            />
          </Field>
          <Field label="Câmera" full>
            <ChipMultiSelect options={ANONYMOUS_CAMERA_OPTIONS} selected={form.camera} onToggle={(v) => toggleChip("camera", v)} />
          </Field>
        </Section>

        <Section title="Prompt personalizado">
          <Field label="Prompt personalizado" full hint="Opcional: detalhes extras adicionados ao final do prompt.">
            <TextArea value={form.customPrompt} onChange={(v) => updateField("customPrompt", v)} placeholder="opcional" />
          </Field>
        </Section>

        <Section title="Exemplos prontos">
          <div className="col-span-full flex flex-col gap-1.5">
            {ANONYMOUS_FRAMING_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-1.5 text-left text-xs text-neutral-300 hover:border-fuchsia-400/50 hover:text-neutral-100"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Section>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <Section
          title="Prompt Gerado"
          description="Exclusivo desta página: construído somente com pessoa, parte visível, objeto em foco, ambiente, detalhes de mão/braço, iluminação, câmera e prompt personalizado selecionados ao lado."
        >
          <Field label="Prompt" full>
            <TextArea
              rows={8}
              value={prompt}
              placeholder="Selecione as opções ao lado (parte visível, objeto, ambiente...) para gerar o prompt."
              onChange={(v) => {
                setPrompt(v);
                setPromptTouched(true);
              }}
            />
          </Field>
          <Field label="Prompt negativo" full hint="Termos de anonimato e segurança são sempre incluídos.">
            <TextArea rows={3} value={negativePrompt} onChange={setNegativePrompt} />
          </Field>
          <div className="col-span-full flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resyncPromptFromFields}
              className="rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/25"
            >
              Sincronizar do formulário
            </button>
            <button
              type="button"
              onClick={copyPrompt}
              className="rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/25"
            >
              Copiar prompt
            </button>
            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/25"
            >
              💾 Salvar configuração anônima
            </button>
          </div>
        </Section>

        <Section title="Política de conteúdo">
          <label className="col-span-full flex items-start gap-2.5 text-xs text-neutral-300">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={form.consentAccepted}
              onChange={(e) => setForm((prev) => ({ ...prev, consentAccepted: e.target.checked }))}
            />
            <span>
              Confirmo que este conteúdo é destinado a fins editoriais/comerciais legítimos, retrata exclusivamente
              adultos fictícios (não pessoas reais identificáveis) e não contém nudez ou conteúdo sexual explícito.
            </span>
          </label>
        </Section>

        <Section title="Geração">
          <div className="col-span-full">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {isGenerating ? "Gerando..." : "Gerar imagem"}
            </button>
          </div>
          {!clientSafetyCheck.ok && <p className="col-span-full text-xs text-amber-400">{clientSafetyCheck.reason}</p>}
          {error && <p className="col-span-full text-xs text-red-400">{error}</p>}
        </Section>

        {images.length > 0 && (
          <Section title="Resultado">
            <div className="col-span-full grid grid-cols-1 gap-3">
              {images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img.url} alt="Imagem gerada" className="w-full rounded-lg border border-white/10" />
              ))}
            </div>
          </Section>
        )}
      </aside>

      {showSaveModal && (
        <SaveAnonymousConfigurationModal
          form={form}
          prompt={prompt}
          negativePrompt={negativePrompt}
          existing={loadedConfiguration}
          onClose={() => setShowSaveModal(false)}
          onSaved={(saved) => {
            setLoadedConfiguration({ id: saved.id, name: saved.name, description: saved.description, tags: saved.tags });
            setShowSaveModal(false);
          }}
        />
      )}
    </div>
  );
}

function SaveAnonymousConfigurationModal({
  form,
  prompt,
  negativePrompt,
  existing,
  onClose,
  onSaved,
}: {
  form: AnonymousFramingState;
  prompt: string;
  negativePrompt: string;
  existing: LoadedAnonymousConfiguration | null;
  onClose: () => void;
  onSaved: (saved: ConfigurationDetail) => void;
}) {
  const [mode, setMode] = useState<"update" | "new">(existing ? "update" : "new");
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [tagsInput, setTagsInput] = useState((existing?.tags ?? []).join(", "));
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
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const payload = {
        name: name.trim(),
        type: "anonimo",
        description,
        tags,
        formSnapshot: form,
        prompt,
        negativePrompt,
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
    <Modal title="Salvar configuração anônima" onClose={onClose} wide>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {existing && (
          <div className="col-span-full flex flex-wrap gap-4 rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-300">
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={mode === "update"} onChange={() => setMode("update")} />
              Atualizar &quot;{existing.name}&quot;
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={mode === "new"} onChange={() => setMode("new")} />
              Salvar como nova
            </label>
          </div>
        )}

        <Field label="Nome da configuração" full>
          <TextInput value={name} onChange={setName} placeholder="ex: Mão com taça na praia" />
        </Field>
        <Field label="Tags (separadas por vírgula)" full>
          <TextInput value={tagsInput} onChange={setTagsInput} placeholder="opcional: praia, mão, taça" />
        </Field>
        <Field label="Descrição" full hint="opcional">
          <TextArea rows={2} value={description} onChange={setDescription} placeholder="opcional" />
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
