"use client";

import { useEffect, useState } from "react";
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
  CONTRAST_OPTIONS,
  HDR_OPTIONS,
  IMAGE_PROFILE_OPTIONS,
  LIGHT_INTENSITY_OPTIONS,
  REAL_PHOTO_STYLE_OPTIONS,
  SATURATION_OPTIONS,
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
import { CharacterProfile } from "@/types/character";

export const LOAD_ANONYMOUS_CONFIGURATION_KEY = "dark-brand:load-anonymous-configuration";
// Handoff from "Meus Personagens" → Aplicar no Enquadramento Anônimo (src/components/characters/CharacterLibrary.tsx).
export const APPLY_CHARACTER_TO_ANONYMOUS_KEY = "dark-brand:apply-character-anonymous";

type GeneratedImage = { url: string };

type LoadedAnonymousConfiguration = Pick<ConfigurationDetail, "id" | "name" | "description" | "tags">;

type ChipField = "framingType" | "focusObject" | "handDetails" | "camera";

function joinNonEmpty(parts: (string | undefined | null)[], sep = ", "): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(sep);
}

// Maps a saved Character Library profile onto this page's own, independent field set — only the
// traits that still make sense once the face/body are out of frame (gender, skin, tattoos,
// accessories, base prompt). Never touches PromptFormState or the main Prompt Studio.
function characterToAnonymousFields(character: CharacterProfile): Partial<AnonymousFramingState> {
  const person = character.gender === "man" ? "adult man" : "adult woman";
  const handDetailsCustom = joinNonEmpty([
    character.skinColor ? `${character.skinColor} skin` : "",
    character.tattoos ? `tattoos: ${character.tattoos}` : "",
    character.accessories,
  ]);
  return { person, handDetailsCustom, customPrompt: character.basePrompt };
}

export function AnonymousFramingStudio() {
  const [form, setForm] = useState<AnonymousFramingState>(DEFAULT_ANONYMOUS_FRAMING_STATE);
  // Tracks whether the user picked any option since the page loaded — while false, the prompt
  // panel stays blank instead of showing a sentence built from the untouched defaults.
  const [touched, setTouched] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState(() => buildAnonymousFramingNegativePrompt(DEFAULT_ANONYMOUS_FRAMING_STATE));
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
    const characterId = window.sessionStorage.getItem(APPLY_CHARACTER_TO_ANONYMOUS_KEY);
    if (!characterId) return;
    window.sessionStorage.removeItem(APPLY_CHARACTER_TO_ANONYMOUS_KEY);
    fetch(`/api/characters/${characterId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.character) return;
        setTouched(true);
        setForm((prev) => ({ ...prev, ...characterToAnonymousFields(data.character) }));
      })
      .catch(() => {
        // ignore — character may have been deleted since the handoff was created
      });
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
    setNegativePrompt(buildAnonymousFramingNegativePrompt(form));
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
        <header>
          <h1 className="text-2xl font-semibold text-neutral-50">🕶️ Enquadramento Anônimo</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-400">
            Página independente para composições sem rosto: apenas mão, braço, pernas, pés, costas ou selfie sem
            rosto. O prompt aqui é construído do zero, exclusivamente com as opções desta página — nunca com dados
            do Prompt Studio principal.
          </p>
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

        <Section
          title="Motor de Fotografia Real"
          description="Empurra a geração para uma aparência de fotografia real tirada por uma pessoa (smartphone ou câmera profissional), evitando o aspecto editorial e a iluminação perfeita típicos de imagens geradas por IA."
        >
          <Field label="Estilo fotográfico">
            <SelectField
              value={form.photoStyle}
              onChange={(v) => updateField("photoStyle", v)}
              options={REAL_PHOTO_STYLE_OPTIONS}
            />
          </Field>
          <Field
            label="Perfil de imagem"
            hint={
              form.imageProfile === "muito-natural"
                ? "Aplica automaticamente um conjunto reforçado de termos de naturalidade ao prompt e ao prompt negativo."
                : undefined
            }
          >
            <SelectField
              value={form.imageProfile}
              onChange={(v) => updateField("imageProfile", v)}
              options={IMAGE_PROFILE_OPTIONS}
            />
          </Field>
          <Field label="Intensidade da luz">
            <SelectField
              value={form.lightIntensity}
              onChange={(v) => updateField("lightIntensity", v)}
              options={LIGHT_INTENSITY_OPTIONS}
            />
          </Field>
          <Field label="Saturação">
            <SelectField value={form.saturation} onChange={(v) => updateField("saturation", v)} options={SATURATION_OPTIONS} />
          </Field>
          <Field label="Contraste">
            <SelectField value={form.contrast} onChange={(v) => updateField("contrast", v)} options={CONTRAST_OPTIONS} />
          </Field>
          <Field label="HDR" hint="Nunca use HDR alto — mantenha em Desativado ou Baixo para o resultado mais realista.">
            <SelectField value={form.hdr} onChange={(v) => updateField("hdr", v)} options={HDR_OPTIONS} />
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
