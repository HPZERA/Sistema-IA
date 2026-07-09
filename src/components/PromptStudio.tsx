"use client";

import { useEffect, useMemo, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Field, SelectField, TextInput, NumberInput, TextArea } from "@/components/ui/Field";
import { ChipMultiSelect } from "@/components/ui/ChipMultiSelect";
import { LibraryModules } from "@/components/library/LibraryModules";
import {
  ACCESSORY_OPTIONS,
  ANONYMOUS_ENVIRONMENT_OPTIONS,
  ANONYMOUS_FOCUS_OBJECT_OPTIONS,
  ANONYMOUS_FRAMING_TYPE_OPTIONS,
  ANONYMOUS_HAND_DETAIL_OPTIONS,
  ANONYMOUS_PERSON_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  BODY_TYPE_OPTIONS,
  CAMERA_ANGLE_OPTIONS,
  EARRING_OPTIONS,
  EXPRESSION_OPTIONS,
  FACE_CONCEALMENT_STRENGTH_OPTIONS,
  FACE_SHAPE_OPTIONS,
  FACE_VISIBILITY_OPTIONS,
  GENDER_OPTIONS,
  HAIR_OPTIONS,
  LIPS_OPTIONS,
  NOSE_OPTIONS,
  LENS_OPTIONS,
  LIGHTING_OPTIONS,
  MODEL_PROVIDER_OPTIONS,
  POSE_OPTIONS,
  REALISM_OPTIONS,
  SCENE_OPTIONS,
  SKIN_TONE_OPTIONS,
  STYLE_OPTIONS,
  WARDROBE_CATEGORY_OPTIONS,
} from "@/types/promptOptions";
import { faceVisibilityHidesFace } from "@/lib/faceVisibility";
import { ANONYMOUS_FRAMING_PRESETS, AnonymousFramingPreset } from "@/lib/anonymousFraming";
import { DEFAULT_FORM_STATE, PromptFormState, ProviderId } from "@/types/formState";
import { buildNegativePrompt, buildPromptForProvider } from "@/lib/promptBuilder";
import { MAX_AGE, MIN_AGE, validateSubmission } from "@/lib/safety";
import { AIProviderConfigPublic, GenerationInfo } from "@/types/aiProvider";
import { LIBRARY_KEYS, LibraryKey, LibraryModule } from "@/types/library";
import { CharacterSummary } from "@/types/character";
import Link from "next/link";
import { SaveConfigurationModal } from "@/components/configurations/SaveConfigurationModal";
import { ConfigurationDetail } from "@/types/configuration";

type GeneratedImage = { url: string };

const LOAD_GENERATION_KEY = "dark-brand:load-generation";
export const LOAD_CONFIGURATION_KEY = "dark-brand:load-configuration";

interface LoadGenerationPayload {
  formSnapshot?: PromptFormState;
  prompt?: string;
  negativePrompt?: string;
  providerId?: string;
  modelId?: string;
  autoGenerate?: boolean;
}

type LoadedConfiguration = Pick<
  ConfigurationDetail,
  "id" | "name" | "type" | "description" | "coverImageUrl" | "tags"
>;

type LibrarySelectionField = "scenarioModuleSelections" | "clothingSelections" | "poseSelections" | "cameraSelections" | "lightingSelections";

const LIBRARY_SELECTION_FIELD: Record<LibraryKey, LibrarySelectionField> = {
  scenario: "scenarioModuleSelections",
  clothing: "clothingSelections",
  pose: "poseSelections",
  camera: "cameraSelections",
  lighting: "lightingSelections",
};

const LIBRARY_SECTION_TITLE: Record<LibraryKey, string> = {
  scenario: "Módulos de Cenários",
  clothing: "Roupas",
  pose: "Poses",
  camera: "Câmeras",
  lighting: "Iluminação",
};

const EMPTY_LIBRARIES: Record<LibraryKey, LibraryModule[]> = {
  scenario: [],
  clothing: [],
  pose: [],
  camera: [],
  lighting: [],
};

export function PromptStudio() {
  const [form, setForm] = useState<PromptFormState>(DEFAULT_FORM_STATE);
  const [prompt, setPrompt] = useState(() => buildPromptForProvider(DEFAULT_FORM_STATE));
  const [negativePrompt, setNegativePrompt] = useState(() => buildNegativePrompt(DEFAULT_FORM_STATE));
  const [promptTouched, setPromptTouched] = useState(false);

  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiProviders, setAiProviders] = useState<AIProviderConfigPublic[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>(undefined);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(undefined);
  const [showChangeAI, setShowChangeAI] = useState(false);
  const [generationInfo, setGenerationInfo] = useState<GenerationInfo | null>(null);
  const [pendingAutoGenerate, setPendingAutoGenerate] = useState(false);

  const [libraries, setLibraries] = useState<Record<LibraryKey, LibraryModule[]>>(EMPTY_LIBRARIES);
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);

  const [anonymousFramingOpen, setAnonymousFramingOpen] = useState(false);
  // Tracks whether the user has picked any option inside the Enquadramento Anônimo module since
  // it was last turned on — while false, the auto-built prompt is kept blank instead of showing
  // the module's default/empty-selection sentence.
  const [anonymousOptionsTouched, setAnonymousOptionsTouched] = useState(false);

  const [showSaveConfiguration, setShowSaveConfiguration] = useState(false);
  const [loadedConfiguration, setLoadedConfiguration] = useState<LoadedConfiguration | null>(null);

  async function refreshLibraries() {
    const res = await fetch("/api/libraries");
    const data = await res.json();
    const modules: LibraryModule[] = data.modules ?? [];
    const grouped: Record<LibraryKey, LibraryModule[]> = { scenario: [], clothing: [], pose: [], camera: [], lighting: [] };
    for (const mod of modules) grouped[mod.libraryKey]?.push(mod);
    setLibraries(grouped);
  }

  async function refreshCharacters() {
    const res = await fetch("/api/characters");
    const data = await res.json();
    setCharacters(data.characters ?? []);
  }

  useEffect(() => {
    refreshLibraries();
    refreshCharacters();
  }, []);

  const allLibraryModules = useMemo(() => LIBRARY_KEYS.flatMap((key) => libraries[key]), [libraries]);
  const selectedCharacter = characters.find((c) => c.id === form.selectedCharacterId) ?? undefined;

  // Handoff from the Library ("Editar/Duplicar" or "Gerar novamente"): load a past
  // generation's exact form/prompt back into the studio.
  useEffect(() => {
    const raw = window.sessionStorage.getItem(LOAD_GENERATION_KEY);
    if (!raw) return;
    window.sessionStorage.removeItem(LOAD_GENERATION_KEY);
    try {
      const payload: LoadGenerationPayload = JSON.parse(raw);
      if (payload.formSnapshot) setForm(payload.formSnapshot);
      if (payload.prompt) setPrompt(payload.prompt);
      if (payload.negativePrompt) setNegativePrompt(payload.negativePrompt);
      setPromptTouched(true);
      if (payload.providerId) setSelectedProviderId(payload.providerId);
      if (payload.modelId) setSelectedModelId(payload.modelId);
      if (payload.autoGenerate) setPendingAutoGenerate(true);
    } catch {
      // ignore malformed handoff payloads
    }
  }, []);

  // Handoff from "Minhas Configurações" → Aplicar: load a manually-saved configuration's
  // exact form/prompt/model back into the studio.
  useEffect(() => {
    const raw = window.sessionStorage.getItem(LOAD_CONFIGURATION_KEY);
    if (!raw) return;
    window.sessionStorage.removeItem(LOAD_CONFIGURATION_KEY);
    try {
      const payload: ConfigurationDetail = JSON.parse(raw);
      setForm(payload.formSnapshot);
      setPrompt(payload.prompt);
      setNegativePrompt(payload.negativePrompt);
      setPromptTouched(true);
      if (payload.providerId) setSelectedProviderId(payload.providerId);
      if (payload.modelId) setSelectedModelId(payload.modelId);
      setLoadedConfiguration({
        id: payload.id,
        name: payload.name,
        type: payload.type,
        description: payload.description,
        coverImageUrl: payload.coverImageUrl,
        tags: payload.tags,
      });
    } catch {
      // ignore malformed handoff payloads
    }
  }, []);

  useEffect(() => {
    fetch("/api/ai-providers")
      .then((res) => res.json())
      .then((data) => {
        const list: AIProviderConfigPublic[] = data.providers ?? [];
        setAiProviders(list);
        const activeSorted = list.filter((p) => p.active).sort((a, b) => a.priority - b.priority);
        if (activeSorted[0]) {
          setSelectedProviderId(activeSorted[0].id);
          setSelectedModelId(activeSorted[0].models[0]?.id);
        }
      })
      .catch(() => {});
  }, []);

  const selectedProvider = aiProviders.find((p) => p.id === selectedProviderId);

  function handleProviderChange(providerId: string) {
    setSelectedProviderId(providerId);
    const provider = aiProviders.find((p) => p.id === providerId);
    setSelectedModelId(provider?.models[0]?.id);
  }

  // Auto-regenerate the prompt from the structured fields, unless the user has
  // manually edited the textarea (in which case they must hit "Sincronizar" to overwrite it).
  useEffect(() => {
    if (promptTouched) return;
    if (form.anonymousFramingEnabled && !anonymousOptionsTouched) {
      setPrompt("");
      return;
    }
    setPrompt(buildPromptForProvider(form, allLibraryModules, selectedCharacter));
  }, [form, promptTouched, allLibraryModules, selectedCharacter, anonymousOptionsTouched]);

  const clientSafetyCheck = useMemo(
    () =>
      validateSubmission({
        age: Number(form.age),
        consentAccepted: form.consentAccepted,
        freeTextFields: {
          "tipo de corpo (personalizado)": form.bodyTypeCustom,
          "cabelo (personalizado)": form.hairCustom,
          "características físicas": form.distinguishingFeatures,
          "categoria da roupa (personalizada)": form.wardrobeCategoryCustom,
          "detalhes da roupa": form.wardrobeDetails,
          "acessórios (personalizado)": form.accessoriesCustom,
          "detalhes do cenário": form.sceneDetails,
          "pose (personalizada)": form.poseCustom,
          "ângulo de câmera (personalizado)": form.cameraAngleCustom,
          "expressão facial (personalizada)": form.expressionCustom,
          "objeto em foco (personalizado)": form.anonymousFocusObjectCustom,
          "detalhes da mão/braço (personalizado)": form.anonymousHandDetailsCustom,
          "enquadramento anônimo (descrição personalizada)": form.anonymousCustomDescription,
          "prompt editado": prompt,
          "personagem (observações)": selectedCharacter?.notes,
          "personagem (estilo)": selectedCharacter?.style,
        },
      }),
    [form, prompt, selectedCharacter]
  );

  function update<K extends keyof PromptFormState>(key: K, value: PromptFormState[K]) {
    if (typeof key === "string" && key.startsWith("anonymous") && key !== "anonymousFramingEnabled") {
      setAnonymousOptionsTouched(true);
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAccessory(value: string) {
    setForm((prev) => ({
      ...prev,
      accessories: prev.accessories.includes(value)
        ? prev.accessories.filter((v) => v !== value)
        : [...prev.accessories, value],
    }));
  }

  type ChipField =
    | "bodyType"
    | "hair"
    | "wardrobeCategory"
    | "pose"
    | "cameraAngle"
    | "expression"
    | "anonymousFramingType"
    | "anonymousFocusObject"
    | "anonymousHandDetails";

  function toggleChipField(key: ChipField, value: string) {
    if (key === "anonymousFramingType" || key === "anonymousFocusObject" || key === "anonymousHandDetails") {
      setAnonymousOptionsTouched(true);
    }
    // "Tipo de enquadramento" is exclusive: clicking a crop marks only that one, instead of
    // accumulating previously-clicked crops (which produced contradictory prompts, e.g. "only
    // hand visible" + "photographed from behind" at once).
    if (key === "anonymousFramingType") {
      setForm((prev) => ({
        ...prev,
        anonymousFramingType: prev.anonymousFramingType.includes(value) ? [] : [value],
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  }

  function randomFrom<T extends { value: string }>(options: T[]): string {
    return options[Math.floor(Math.random() * options.length)].value;
  }

  function randomizeFace() {
    setForm((prev) => ({
      ...prev,
      faceShape: randomFrom(FACE_SHAPE_OPTIONS),
      lips: randomFrom(LIPS_OPTIONS),
      nose: randomFrom(NOSE_OPTIONS),
      earrings: randomFrom(EARRING_OPTIONS),
    }));
  }

  function applyAnonymousFramingPreset(preset: AnonymousFramingPreset) {
    setAnonymousOptionsTouched(true);
    setForm((prev) => ({
      ...prev,
      anonymousFramingEnabled: true,
      anonymousFramingType: preset.framingType,
      anonymousFocusObject: preset.focusObject,
      anonymousFocusObjectCustom: "",
      anonymousEnvironment: preset.environment,
      anonymousPerson: preset.person,
    }));
    setAnonymousFramingOpen(true);
  }

  function toggleLibraryOption(libraryKey: LibraryKey, moduleId: string, optionId: string) {
    const field = LIBRARY_SELECTION_FIELD[libraryKey];
    setForm((prev) => {
      const current = prev[field][moduleId] ?? [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return {
        ...prev,
        [field]: { ...prev[field], [moduleId]: next },
      };
    });
  }

  function resyncPromptFromFields() {
    setPrompt(
      form.anonymousFramingEnabled && !anonymousOptionsTouched
        ? ""
        : buildPromptForProvider(form, allLibraryModules, selectedCharacter)
    );
    setNegativePrompt(buildNegativePrompt(form));
    setPromptTouched(false);
  }

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
          form,
          promptOverride: prompt,
          negativePromptOverride: negativePrompt,
          providerId: selectedProviderId,
          modelId: selectedModelId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar imagem.");
      setImages(data.images ?? []);
      setGenerationInfo(data.info ?? null);
      if (data.info?.providerId) {
        setSelectedProviderId(data.info.providerId);
        setSelectedModelId(data.info.modelId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
  }

  useEffect(() => {
    if (!pendingAutoGenerate) return;
    setPendingAutoGenerate(false);
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAutoGenerate]);

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[1fr_420px] lg:px-8">
      <div className="flex flex-col gap-5">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-50">Prompt Studio — Fotografia Editorial IA</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-400">
              Monte prompts estruturados para geração de imagens editoriais, de moda e lifestyle com FLUX ou Stable
              Diffusion. Preencha os campos abaixo — o prompt final é gerado automaticamente e pode ser editado antes
              da geração.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/library"
              className="whitespace-nowrap rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/25"
            >
              Biblioteca →
            </Link>
            <Link
              href="/characters"
              className="whitespace-nowrap rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/25"
            >
              Personagens →
            </Link>
            <Link
              href="/configurations"
              className="whitespace-nowrap rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/25"
            >
              Minhas Configurações →
            </Link>
            <Link
              href="/admin"
              className="whitespace-nowrap rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/25"
            >
              Gerenciador de IA →
            </Link>
          </div>
        </header>

        <Section
          title="Configuração"
          description="Salve manualmente tudo o que você montou no Prompt Studio — personagem, roupas, cenário, pose, enquadramento, iluminação, câmera, estilo, prompt e IA usada — para reaplicar depois com 1 clique."
        >
          <div className="col-span-full flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSaveConfiguration(true)}
              className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white"
            >
              💾 Salvar configuração completa
            </button>
            {loadedConfiguration && (
              <span className="text-xs text-neutral-500">
                Carregado de: <strong className="text-neutral-300">{loadedConfiguration.name}</strong>
              </span>
            )}
          </div>
        </Section>

        <Section title="Modelo de IA">
          <Field label="Provedor / modelo" full>
            <SelectField
              value={form.provider}
              onChange={(v) => update("provider", v as ProviderId)}
              options={MODEL_PROVIDER_OPTIONS}
            />
          </Field>
        </Section>

        <Section title="Personagem" description="Idade adulta e características físicas gerais.">
          <Field
            label="Personagem salvo"
            full
            hint="Opcional. Selecionar um personagem da Biblioteca de Personagens trava a identidade visual no prompt final, mantendo os campos abaixo como base."
          >
            <SelectField
              value={form.selectedCharacterId ?? ""}
              onChange={(v) => update("selectedCharacterId", v || null)}
              options={[{ value: "", label: "Nenhum — usar campos abaixo" }, ...characters.map((c) => ({ value: c.id, label: c.name }))]}
            />
          </Field>
          <Field label={`Idade (${MIN_AGE}–${MAX_AGE} anos)`}>
            <NumberInput value={form.age} min={MIN_AGE} max={MAX_AGE} onChange={(v) => update("age", v)} />
          </Field>
          <Field label="Gênero">
            <SelectField value={form.gender} onChange={(v) => update("gender", v)} options={GENDER_OPTIONS} />
          </Field>
          <Field label="Tipo de corpo" full>
            <ChipMultiSelect options={BODY_TYPE_OPTIONS} selected={form.bodyType} onToggle={(v) => toggleChipField("bodyType", v)} />
          </Field>
          <Field label="Tipo de corpo (personalizado)" full hint="Ex: cintura fina, quadril largo, abdômen definido. Sem conteúdo sexual ou de menores.">
            <TextInput value={form.bodyTypeCustom} onChange={(v) => update("bodyTypeCustom", v)} placeholder="opcional" />
          </Field>
          <Field label="Tom de pele">
            <SelectField value={form.skinTone} onChange={(v) => update("skinTone", v)} options={SKIN_TONE_OPTIONS} />
          </Field>
          <Field label="Cabelo" full>
            <ChipMultiSelect options={HAIR_OPTIONS} selected={form.hair} onToggle={(v) => toggleChipField("hair", v)} />
          </Field>
          <Field label="Cabelo (personalizado)" full>
            <TextInput value={form.hairCustom} onChange={(v) => update("hairCustom", v)} placeholder="opcional" />
          </Field>
          <Field label="Características adicionais" hint="Ex: sardas, tatuagem discreta. Sem conteúdo sexual ou de menores.">
            <TextInput
              value={form.distinguishingFeatures}
              onChange={(v) => update("distinguishingFeatures", v)}
              placeholder="opcional"
            />
          </Field>

          <div className="col-span-full flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Rosto</span>
            <button
              type="button"
              onClick={randomizeFace}
              className="rounded-lg border border-white/10 bg-neutral-900/70 px-2.5 py-1 text-xs text-neutral-300 hover:border-white/25"
            >
              🎲 Gerar rosto aleatório
            </button>
          </div>
          <Field label="Formato do rosto">
            <SelectField value={form.faceShape} onChange={(v) => update("faceShape", v)} options={FACE_SHAPE_OPTIONS} />
          </Field>
          <Field label="Lábios" hint="Natural ou com aspecto de preenchimento.">
            <SelectField value={form.lips} onChange={(v) => update("lips", v)} options={LIPS_OPTIONS} />
          </Field>
          <Field label="Nariz">
            <SelectField value={form.nose} onChange={(v) => update("nose", v)} options={NOSE_OPTIONS} />
          </Field>
          <Field label="Brincos">
            <SelectField value={form.earrings} onChange={(v) => update("earrings", v)} options={EARRING_OPTIONS} />
          </Field>
        </Section>

        <Section title="Roupas e acessórios">
          <Field label="Categoria da roupa" full>
            <ChipMultiSelect
              options={WARDROBE_CATEGORY_OPTIONS}
              selected={form.wardrobeCategory}
              onToggle={(v) => toggleChipField("wardrobeCategory", v)}
            />
          </Field>
          <Field label="Categoria da roupa (personalizado)" full>
            <TextInput
              value={form.wardrobeCategoryCustom}
              onChange={(v) => update("wardrobeCategoryCustom", v)}
              placeholder="opcional"
            />
          </Field>
          <Field label="Cor / padrão / material">
            <TextInput
              value={form.wardrobeDetails}
              onChange={(v) => update("wardrobeDetails", v)}
              placeholder="ex: linho branco, listras finas"
            />
          </Field>
          <Field label="Acessórios" full>
            <ChipMultiSelect options={ACCESSORY_OPTIONS} selected={form.accessories} onToggle={toggleAccessory} />
          </Field>
          <Field label="Acessórios (personalizado)" full>
            <TextInput
              value={form.accessoriesCustom}
              onChange={(v) => update("accessoriesCustom", v)}
              placeholder="opcional"
            />
          </Field>
        </Section>

        <Section title="Cenário e composição">
          <Field label="Cenário">
            <SelectField value={form.scene} onChange={(v) => update("scene", v)} options={SCENE_OPTIONS} />
          </Field>
          <Field label="Detalhes do cenário">
            <TextInput
              value={form.sceneDetails}
              onChange={(v) => update("sceneDetails", v)}
              placeholder="ex: pôr do sol, reflexos na água"
            />
          </Field>
          <Field label="Pose" full>
            <ChipMultiSelect options={POSE_OPTIONS} selected={form.pose} onToggle={(v) => toggleChipField("pose", v)} />
          </Field>
          <Field label="Pose (personalizada)">
            <TextInput value={form.poseCustom} onChange={(v) => update("poseCustom", v)} placeholder="opcional" />
          </Field>
          <Field label="Ângulo de câmera" full>
            <ChipMultiSelect
              options={CAMERA_ANGLE_OPTIONS}
              selected={form.cameraAngle}
              onToggle={(v) => toggleChipField("cameraAngle", v)}
            />
          </Field>
          <Field label="Ângulo de câmera (personalizado)">
            <TextInput
              value={form.cameraAngleCustom}
              onChange={(v) => update("cameraAngleCustom", v)}
              placeholder="opcional"
            />
          </Field>
          <Field label="Lente">
            <SelectField value={form.lens} onChange={(v) => update("lens", v)} options={LENS_OPTIONS} />
          </Field>
        </Section>

        {LIBRARY_KEYS.map((libraryKey) => (
          <Section
            key={libraryKey}
            title={LIBRARY_SECTION_TITLE[libraryKey]}
            description="Clique em uma categoria para abrir as opções relacionadas. As opções escolhidas são adicionadas automaticamente ao prompt final. Use os botões “+” para cadastrar novas categorias e itens sem precisar editar código."
          >
            <LibraryModules
              libraryKey={libraryKey}
              modules={libraries[libraryKey]}
              onRefresh={refreshLibraries}
              selections={form[LIBRARY_SELECTION_FIELD[libraryKey]]}
              onToggleOption={(moduleId, optionId) => toggleLibraryOption(libraryKey, moduleId, optionId)}
            />
          </Section>
        ))}

        <Section title="Iluminação e expressão">
          <Field label="Iluminação">
            <SelectField value={form.lighting} onChange={(v) => update("lighting", v)} options={LIGHTING_OPTIONS} />
          </Field>
          <Field label="Expressão facial" full>
            <ChipMultiSelect
              options={EXPRESSION_OPTIONS}
              selected={form.expression}
              onToggle={(v) => toggleChipField("expression", v)}
            />
          </Field>
          <Field label="Expressão facial (personalizado)" full>
            <TextInput value={form.expressionCustom} onChange={(v) => update("expressionCustom", v)} placeholder="opcional" />
          </Field>
        </Section>

        <Section
          title="🕶️ Enquadramento Anônimo"
          description="Módulo dedicado a composições sem rosto: mostra apenas partes do corpo, objetos ou ângulos anônimos. Quando ativo, ele tem prioridade sobre o enquadramento padrão de corpo inteiro (Roupas e Pose deixam de aparecer no prompt), mas continua respeitando Câmera, Iluminação e Realismo."
        >
          <div className="col-span-full flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2.5">
            <label className="flex items-center gap-2.5 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={form.anonymousFramingEnabled}
                onChange={(e) => {
                  update("anonymousFramingEnabled", e.target.checked);
                  setAnonymousOptionsTouched(false);
                  if (e.target.checked) setAnonymousFramingOpen(true);
                }}
              />
              <span className="font-medium">Ativar Enquadramento Anônimo</span>
            </label>
            <button
              type="button"
              onClick={() => setAnonymousFramingOpen((v) => !v)}
              className="whitespace-nowrap rounded-lg border border-white/10 bg-neutral-900/70 px-2.5 py-1 text-xs text-neutral-300 hover:border-white/25"
            >
              {anonymousFramingOpen ? "Ocultar opções ▲" : "Configurar opções ▼"}
            </button>
          </div>

          {form.anonymousFramingEnabled && (
            <p className="col-span-full rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[11px] text-emerald-300">
              Ativo: o sistema adiciona automaticamente instruções de anonimato ao prompt positivo e negativo (sem
              rosto, olhos, contato visual, características faciais ou reflexo do rosto visíveis; identidade não
              reconhecível).
            </p>
          )}

          {anonymousFramingOpen && (
            <>
              <Field label="Pessoa">
                <SelectField
                  value={form.anonymousPerson}
                  onChange={(v) => update("anonymousPerson", v)}
                  options={ANONYMOUS_PERSON_OPTIONS}
                />
              </Field>
              <Field label="Ambiente">
                <SelectField
                  value={form.anonymousEnvironment}
                  onChange={(v) => update("anonymousEnvironment", v)}
                  options={ANONYMOUS_ENVIRONMENT_OPTIONS}
                />
              </Field>

              <Field label="Tipo de enquadramento" full hint="Selecione uma opção de composição sem rosto — clicar em outra troca a seleção.">
                <ChipMultiSelect
                  options={ANONYMOUS_FRAMING_TYPE_OPTIONS}
                  selected={form.anonymousFramingType}
                  onToggle={(v) => toggleChipField("anonymousFramingType", v)}
                />
              </Field>

              <Field label="Objeto em foco" full>
                <ChipMultiSelect
                  options={ANONYMOUS_FOCUS_OBJECT_OPTIONS}
                  selected={form.anonymousFocusObject}
                  onToggle={(v) => toggleChipField("anonymousFocusObject", v)}
                />
              </Field>
              <Field label="Objeto em foco (personalizado)" full>
                <TextInput
                  value={form.anonymousFocusObjectCustom}
                  onChange={(v) => update("anonymousFocusObjectCustom", v)}
                  placeholder="ex: colar de pérolas"
                />
              </Field>

              <Field label="Detalhes da mão/braço" full hint="Só entram no prompt se selecionados aqui.">
                <ChipMultiSelect
                  options={ANONYMOUS_HAND_DETAIL_OPTIONS}
                  selected={form.anonymousHandDetails}
                  onToggle={(v) => toggleChipField("anonymousHandDetails", v)}
                />
              </Field>
              <Field label="Detalhes da mão/braço (personalizado)" full>
                <TextInput
                  value={form.anonymousHandDetailsCustom}
                  onChange={(v) => update("anonymousHandDetailsCustom", v)}
                  placeholder="ex: aliança de casamento"
                />
              </Field>
              <Field label="Descrição personalizada" full>
                <TextArea
                  value={form.anonymousCustomDescription}
                  onChange={(v) => update("anonymousCustomDescription", v)}
                  placeholder="opcional: detalhes extras adicionados ao final do enquadramento anônimo"
                />
              </Field>

              <div className="col-span-full flex flex-col gap-1.5 border-t border-white/10 pt-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Exemplos prontos
                </span>
                <div className="flex flex-col gap-1.5">
                  {ANONYMOUS_FRAMING_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyAnonymousFramingPreset(preset)}
                      className="rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-1.5 text-left text-xs text-neutral-300 hover:border-fuchsia-400/50 hover:text-neutral-100"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </Section>

        <Section
          title="Visibilidade do Rosto"
          description="Define se e como o rosto aparece na imagem. Ao escolher uma opção 'sem rosto', o sistema adiciona automaticamente instruções de anonimato ao prompt final (positivo e negativo)."
        >
          <Field label="Enquadramento" full>
            <SelectField
              value={form.faceVisibility}
              onChange={(v) => update("faceVisibility", v)}
              options={FACE_VISIBILITY_OPTIONS}
            />
          </Field>
          <Field
            label="Força da ocultação do rosto"
            hint={
              faceVisibilityHidesFace(form)
                ? "Em 'Absoluta', as instruções de anonimato são repetidas no prompt positivo e no negativo para reforço máximo."
                : "Só se aplica quando o enquadramento escolhido acima esconde o rosto."
            }
          >
            <SelectField
              value={form.faceConcealmentStrength}
              onChange={(v) => update("faceConcealmentStrength", v)}
              options={FACE_CONCEALMENT_STRENGTH_OPTIONS}
            />
          </Field>
        </Section>

        <Section title="Estilo e formato final">
          <Field label="Estilo fotográfico">
            <SelectField value={form.style} onChange={(v) => update("style", v)} options={STYLE_OPTIONS} />
          </Field>
          <Field label="Nível de realismo">
            <SelectField value={form.realism} onChange={(v) => update("realism", v)} options={REALISM_OPTIONS} />
          </Field>
          <Field label="Proporção da imagem">
            <SelectField
              value={form.aspectRatio}
              onChange={(v) => update("aspectRatio", v)}
              options={ASPECT_RATIO_OPTIONS}
            />
          </Field>
        </Section>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <Section
          title="Prompt gerado"
          description="Editável antes da geração. O padrão fotográfico (realismo, corpo visível em quadro, textura de pele natural, sem marca d'água) é sempre aplicado automaticamente ao final do prompt."
        >
          <Field label="Prompt" full>
            <TextArea
              rows={8}
              value={prompt}
              placeholder={
                form.anonymousFramingEnabled && !anonymousOptionsTouched
                  ? "Enquadramento Anônimo ativo — selecione as opções do módulo (parte visível, objeto, ambiente...) para gerar o prompt."
                  : undefined
              }
              onChange={(v) => {
                setPrompt(v);
                setPromptTouched(true);
              }}
            />
          </Field>
          <Field label="Prompt negativo" full hint="Termos de segurança e qualidade são sempre incluídos.">
            <TextArea rows={3} value={negativePrompt} onChange={setNegativePrompt} />
          </Field>
          <div className="col-span-full flex gap-2">
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
          </div>
        </Section>

        <Section title="Política de conteúdo">
          <label className="col-span-full flex items-start gap-2.5 text-xs text-neutral-300">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={form.consentAccepted}
              onChange={(e) => update("consentAccepted", e.target.checked)}
            />
            <span>
              Confirmo que este conteúdo é destinado a fins editoriais/comerciais legítimos, retrata exclusivamente
              adultos ({MIN_AGE}+) fictícios (não pessoas reais identificáveis) e não contém nudez ou conteúdo sexual
              explícito.
            </span>
          </label>
        </Section>

        <Section title="Geração">
          <div className="col-span-full flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <span
                className={`h-2 w-2 rounded-full ${
                  selectedProvider?.hasApiKey && selectedProvider.active ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span>
                IA: <strong className="text-neutral-100">{selectedProvider?.name ?? "nenhuma configurada"}</strong>
                {selectedProvider && (
                  <>
                    {" "}
                    · Modelo:{" "}
                    <strong className="text-neutral-100">
                      {selectedProvider.models.find((m) => m.id === selectedModelId)?.label ?? "—"}
                    </strong>
                  </>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowChangeAI((v) => !v)}
              className="whitespace-nowrap rounded-lg border border-white/10 bg-neutral-900/70 px-2.5 py-1 text-xs text-neutral-300 hover:border-white/25"
            >
              Alterar IA
            </button>
          </div>

          {showChangeAI && (
            <>
              <Field label="Fornecedor da IA">
                <SelectField
                  value={selectedProviderId ?? ""}
                  onChange={handleProviderChange}
                  options={aiProviders
                    .filter((p) => p.active)
                    .sort((a, b) => a.priority - b.priority)
                    .map((p) => ({ value: p.id, label: p.name }))}
                />
              </Field>
              <Field label="Modelo">
                <SelectField
                  value={selectedModelId ?? ""}
                  onChange={setSelectedModelId}
                  options={(selectedProvider?.models ?? []).map((m) => ({ value: m.id, label: m.label }))}
                />
              </Field>
              {aiProviders.filter((p) => p.active).length === 0 && (
                <p className="col-span-full text-xs text-amber-400">
                  Nenhum provedor ativo. Configure um em{" "}
                  <Link href="/admin" className="underline">
                    Gerenciador de IA
                  </Link>
                  .
                </p>
              )}
            </>
          )}

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
          {!clientSafetyCheck.ok && (
            <p className="col-span-full text-xs text-amber-400">{clientSafetyCheck.reason}</p>
          )}
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
            {generationInfo && (
              <dl className="col-span-full grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg border border-white/10 bg-neutral-900/60 p-3 text-xs">
                <dt className="text-neutral-500">IA utilizada</dt>
                <dd className="text-neutral-200">{generationInfo.providerName}</dd>
                <dt className="text-neutral-500">Modelo utilizado</dt>
                <dd className="text-neutral-200">{generationInfo.modelLabel}</dd>
                <dt className="text-neutral-500">Tempo de geração</dt>
                <dd className="text-neutral-200">{(generationInfo.durationMs / 1000).toFixed(1)}s</dd>
                <dt className="text-neutral-500">Resolução</dt>
                <dd className="text-neutral-200">
                  {generationInfo.width}×{generationInfo.height}
                </dd>
                <dt className="text-neutral-500">Créditos utilizados</dt>
                <dd className="text-neutral-200">{generationInfo.creditsUsed ?? "—"}</dd>
                <dt className="text-neutral-500">Custo estimado</dt>
                <dd className="text-neutral-200">
                  {generationInfo.costUsd != null ? `US$ ${generationInfo.costUsd.toFixed(3)}` : "—"}
                </dd>
                {generationInfo.servedFromCache && (
                  <>
                    <dt className="text-neutral-500">Origem</dt>
                    <dd className="text-emerald-400">
                      Servido do cache (prompt idêntico gerado recentemente) — sem custo adicional
                    </dd>
                  </>
                )}
                {generationInfo.attempts.length > 1 && (
                  <>
                    <dt className="text-neutral-500">Failover</dt>
                    <dd className="text-neutral-200">
                      {generationInfo.attempts.length - 1} provedor(es) indisponível(is) antes do sucesso
                    </dd>
                  </>
                )}
              </dl>
            )}
          </Section>
        )}
      </aside>

      {showSaveConfiguration && (
        <SaveConfigurationModal
          form={form}
          prompt={prompt}
          negativePrompt={negativePrompt}
          providerId={selectedProviderId ?? null}
          providerName={selectedProvider?.name ?? null}
          modelId={selectedModelId ?? null}
          modelLabel={selectedProvider?.models.find((m) => m.id === selectedModelId)?.label ?? null}
          existing={loadedConfiguration}
          onClose={() => setShowSaveConfiguration(false)}
          onSaved={(saved) => {
            setLoadedConfiguration({
              id: saved.id,
              name: saved.name,
              type: saved.type,
              description: saved.description,
              coverImageUrl: saved.coverImageUrl,
              tags: saved.tags,
            });
            setShowSaveConfiguration(false);
          }}
        />
      )}
    </div>
  );
}
