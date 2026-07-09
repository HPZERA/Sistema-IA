"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/ui/Section";
import { PromptFormState } from "@/types/formState";

interface TemplateRow {
  id: string;
  name: string;
  formSnapshot: PromptFormState;
}

interface FavoriteRow {
  id: string;
  type: "prompt" | "scenario";
  name: string;
  payload: unknown;
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  return res.json();
}

export function SavedItemsPanel({
  currentForm,
  currentPrompt,
  currentNegativePrompt,
  onApplyTemplate,
  onApplyScenarioFavorite,
  onApplyPromptFavorite,
}: {
  currentForm: PromptFormState;
  currentPrompt: string;
  currentNegativePrompt: string;
  onApplyTemplate: (formSnapshot: PromptFormState) => void;
  onApplyScenarioFavorite: (selections: Record<string, string[]>) => void;
  onApplyPromptFavorite: (prompt: string, negativePrompt: string) => void;
}) {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [promptFavorites, setPromptFavorites] = useState<FavoriteRow[]>([]);
  const [scenarioFavorites, setScenarioFavorites] = useState<FavoriteRow[]>([]);

  const [templateName, setTemplateName] = useState("");
  const [promptFavName, setPromptFavName] = useState("");
  const [scenarioFavName, setScenarioFavName] = useState("");

  async function refresh() {
    const [t, p, s] = await Promise.all([
      fetchJson("/api/templates"),
      fetchJson("/api/favorites?type=prompt"),
      fetchJson("/api/favorites?type=scenario"),
    ]);
    setTemplates(t.templates ?? []);
    setPromptFavorites(p.favorites ?? []);
    setScenarioFavorites(s.favorites ?? []);
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  async function saveTemplate() {
    if (!templateName.trim()) return;
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: templateName.trim(), formSnapshot: currentForm }),
    });
    setTemplateName("");
    await refresh();
  }

  async function savePromptFavorite() {
    if (!promptFavName.trim()) return;
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "prompt",
        name: promptFavName.trim(),
        payload: { prompt: currentPrompt, negativePrompt: currentNegativePrompt },
      }),
    });
    setPromptFavName("");
    await refresh();
  }

  async function saveScenarioFavorite() {
    if (!scenarioFavName.trim()) return;
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "scenario",
        name: scenarioFavName.trim(),
        payload: { scenarioModuleSelections: currentForm.scenarioModuleSelections },
      }),
    });
    setScenarioFavName("");
    await refresh();
  }

  async function removeTemplate(id: string) {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function removeFavorite(id: string) {
    await fetch(`/api/favorites/${id}`, { method: "DELETE" });
    await refresh();
  }

  const inputClass =
    "flex-1 rounded-lg border border-white/10 bg-neutral-900/80 px-2.5 py-1.5 text-xs text-neutral-100 outline-none focus:border-fuchsia-400/60";
  const saveBtnClass =
    "whitespace-nowrap rounded-lg border border-white/10 bg-neutral-900/70 px-2.5 py-1.5 text-xs text-neutral-300 hover:border-white/25";
  const itemRowClass = "flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-neutral-950/50 px-2.5 py-1.5 text-xs";

  return (
    <Section
      title="Templates e Favoritos"
      description="Salve a configuração inteira como template ('Editorial Praia') ou favorite só o prompt ou o cenário para reaplicar com um clique."
    >
      <div className="col-span-full flex flex-col gap-4">
        <div>
          <div className="mb-1.5 flex gap-2">
            <input
              className={inputClass}
              placeholder="Nome do template (ex: Editorial Praia)"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <button type="button" onClick={saveTemplate} className={saveBtnClass}>
              💾 Salvar template
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {templates.map((t) => (
              <div key={t.id} className={itemRowClass}>
                <span className="text-neutral-300">{t.name}</span>
                <span className="flex gap-1.5">
                  <button type="button" onClick={() => onApplyTemplate(t.formSnapshot)} className="text-fuchsia-300 hover:underline">
                    Aplicar
                  </button>
                  <button type="button" onClick={() => removeTemplate(t.id)} className="text-red-300 hover:underline">
                    Remover
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex gap-2">
            <input
              className={inputClass}
              placeholder="Nome do prompt favorito"
              value={promptFavName}
              onChange={(e) => setPromptFavName(e.target.value)}
            />
            <button type="button" onClick={savePromptFavorite} className={saveBtnClass}>
              ⭐ Favoritar prompt
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {promptFavorites.map((f) => {
              const payload = f.payload as { prompt: string; negativePrompt: string };
              return (
                <div key={f.id} className={itemRowClass}>
                  <span className="text-neutral-300">{f.name}</span>
                  <span className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => onApplyPromptFavorite(payload.prompt, payload.negativePrompt)}
                      className="text-fuchsia-300 hover:underline"
                    >
                      Aplicar
                    </button>
                    <button type="button" onClick={() => removeFavorite(f.id)} className="text-red-300 hover:underline">
                      Remover
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex gap-2">
            <input
              className={inputClass}
              placeholder="Nome do cenário favorito"
              value={scenarioFavName}
              onChange={(e) => setScenarioFavName(e.target.value)}
            />
            <button type="button" onClick={saveScenarioFavorite} className={saveBtnClass}>
              ⭐ Favoritar cenário
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {scenarioFavorites.map((f) => {
              const payload = f.payload as { scenarioModuleSelections: Record<string, string[]> };
              return (
                <div key={f.id} className={itemRowClass}>
                  <span className="text-neutral-300">{f.name}</span>
                  <span className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => onApplyScenarioFavorite(payload.scenarioModuleSelections)}
                      className="text-fuchsia-300 hover:underline"
                    >
                      Aplicar
                    </button>
                    <button type="button" onClick={() => removeFavorite(f.id)} className="text-red-300 hover:underline">
                      Remover
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
