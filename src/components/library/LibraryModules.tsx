"use client";

import { useMemo, useState } from "react";
import { ChipMultiSelect } from "@/components/ui/ChipMultiSelect";
import { TextInput } from "@/components/ui/Field";
import { AddModuleModal } from "@/components/library/AddModuleModal";
import { AddOptionModal } from "@/components/library/AddOptionModal";
import { LibraryKey, LibraryModule, LibraryOption, LibrarySelections } from "@/types/library";

async function patchJson(url: string, body: unknown) {
  await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

export function LibraryModules({
  libraryKey,
  modules,
  onRefresh,
  selections,
  onToggleOption,
}: {
  libraryKey: LibraryKey;
  modules: LibraryModule[];
  onRefresh: () => void | Promise<void>;
  selections: LibrarySelections;
  onToggleOption: (moduleId: string, optionId: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [manageMode, setManageMode] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);
  const [addOptionForModuleId, setAddOptionForModuleId] = useState<string | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);

  const sortedModules = useMemo(() => [...modules].sort((a, b) => a.order - b.order), [modules]);

  const visibleModules = useMemo(() => {
    const base = manageMode ? sortedModules : sortedModules.filter((m) => m.active);
    if (!search.trim()) return base;
    const q = search.trim().toLowerCase();
    return base.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.options.some((o) => o.label.toLowerCase().includes(q))
    );
  }, [sortedModules, manageMode, search]);

  function toggleExpanded(moduleId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  async function toggleModuleActive(mod: LibraryModule) {
    await patchJson(`/api/libraries/modules/${mod.id}`, { active: !mod.active });
    await onRefresh();
  }

  async function deleteModuleConfirmed(mod: LibraryModule) {
    if (!confirm(`Remover a categoria "${mod.name}" e todos os seus itens? Essa ação não pode ser desfeita.`)) return;
    await fetch(`/api/libraries/modules/${mod.id}`, { method: "DELETE" });
    await onRefresh();
  }

  async function duplicateModule(mod: LibraryModule) {
    await fetch(`/api/libraries/modules/${mod.id}/duplicate`, { method: "POST" });
    await onRefresh();
  }

  async function moveModule(mod: LibraryModule, direction: -1 | 1) {
    const idx = sortedModules.findIndex((m) => m.id === mod.id);
    const neighbor = sortedModules[idx + direction];
    if (!neighbor) return;
    await Promise.all([
      patchJson(`/api/libraries/modules/${mod.id}`, { order: neighbor.order }),
      patchJson(`/api/libraries/modules/${neighbor.id}`, { order: mod.order }),
    ]);
    await onRefresh();
  }

  async function toggleOptionActive(opt: LibraryOption) {
    await patchJson(`/api/libraries/options/${opt.id}`, { active: !opt.active });
    await onRefresh();
  }

  async function deleteOptionConfirmed(opt: LibraryOption) {
    if (!confirm(`Remover o item "${opt.label}"?`)) return;
    await fetch(`/api/libraries/options/${opt.id}`, { method: "DELETE" });
    await onRefresh();
  }

  async function duplicateOption(opt: LibraryOption) {
    await fetch(`/api/libraries/options/${opt.id}/duplicate`, { method: "POST" });
    await onRefresh();
  }

  async function moveOption(mod: LibraryModule, opt: LibraryOption, direction: -1 | 1) {
    const sorted = [...mod.options].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((o) => o.id === opt.id);
    const neighbor = sorted[idx + direction];
    if (!neighbor) return;
    await Promise.all([
      patchJson(`/api/libraries/options/${opt.id}`, { order: neighbor.order }),
      patchJson(`/api/libraries/options/${neighbor.id}`, { order: opt.order }),
    ]);
    await onRefresh();
  }

  return (
    <div className="col-span-full flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <TextInput value={search} onChange={setSearch} placeholder="Pesquisar categorias e itens..." />
        <button
          type="button"
          onClick={() => setManageMode((v) => !v)}
          className={`whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            manageMode ? "border-fuchsia-400/70 bg-fuchsia-400/10 text-fuchsia-200" : "border-white/10 bg-neutral-900/70 text-neutral-300 hover:border-white/25"
          }`}
        >
          {manageMode ? "Gerenciar: ativo" : "Gerenciar"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {visibleModules.map((mod) => {
          const selectedCount = selections[mod.id]?.length ?? 0;
          const isExpanded = expanded.has(mod.id);
          return (
            <div
              key={mod.id}
              className={`relative flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-center transition ${
                isExpanded ? "border-fuchsia-400/70 bg-fuchsia-400/10" : "border-white/10 bg-neutral-900/60 hover:border-white/25"
              } ${!mod.active ? "opacity-50" : ""}`}
            >
              <button type="button" onClick={() => toggleExpanded(mod.id)} className="flex w-full flex-col items-center gap-1">
                {selectedCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-500 text-[10px] font-semibold text-white">
                    {selectedCount}
                  </span>
                )}
                <span className="text-2xl leading-none">{mod.icon}</span>
                <span className="text-xs font-medium text-neutral-200">{mod.name}</span>
                <span className="text-[10px] text-neutral-500">{mod.category || (!mod.active ? "Inativo" : "")}</span>
              </button>
              <button
                type="button"
                onClick={() => setAddOptionForModuleId(mod.id)}
                title={`Adicionar item em ${mod.name}`}
                className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-neutral-800 text-[11px] font-bold text-neutral-300 hover:border-fuchsia-400/70 hover:text-fuchsia-200"
              >
                +
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowAddModule(true)}
        className="self-start rounded-lg border border-dashed border-white/15 bg-transparent px-3 py-1.5 text-xs font-medium text-neutral-400 hover:border-fuchsia-400/50 hover:text-fuchsia-200"
      >
        + Nova categoria
      </button>

      {visibleModules
        .filter((mod) => expanded.has(mod.id))
        .map((mod) => {
          const sortedOptions = [...mod.options].sort((a, b) => a.order - b.order);
          const optionsToShow = manageMode ? sortedOptions : sortedOptions.filter((o) => o.active);
          return (
            <div key={mod.id} className="rounded-xl border border-white/10 bg-neutral-900/40 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                  <span>{mod.icon}</span>
                  <span>{mod.name}</span>
                  <span className="font-normal text-neutral-500">— selecione uma ou mais opções</span>
                </div>
                {manageMode && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button type="button" onClick={() => moveModule(mod, -1)} className="rounded-md border border-white/10 bg-neutral-900/70 px-1.5 py-1 text-[10px] text-neutral-400 hover:border-white/25">
                      ↑
                    </button>
                    <button type="button" onClick={() => moveModule(mod, 1)} className="rounded-md border border-white/10 bg-neutral-900/70 px-1.5 py-1 text-[10px] text-neutral-400 hover:border-white/25">
                      ↓
                    </button>
                    <button type="button" onClick={() => setEditingModuleId(editingModuleId === mod.id ? null : mod.id)} className="rounded-md border border-white/10 bg-neutral-900/70 px-2 py-1 text-[10px] text-neutral-300 hover:border-white/25">
                      Editar
                    </button>
                    <button type="button" onClick={() => duplicateModule(mod)} className="rounded-md border border-white/10 bg-neutral-900/70 px-2 py-1 text-[10px] text-neutral-300 hover:border-white/25">
                      Duplicar
                    </button>
                    <button type="button" onClick={() => toggleModuleActive(mod)} className="rounded-md border border-white/10 bg-neutral-900/70 px-2 py-1 text-[10px] text-neutral-300 hover:border-white/25">
                      {mod.active ? "Desativar" : "Ativar"}
                    </button>
                    <button type="button" onClick={() => deleteModuleConfirmed(mod)} className="rounded-md border border-red-400/30 px-2 py-1 text-[10px] text-red-300 hover:bg-red-400/10">
                      Excluir
                    </button>
                  </div>
                )}
              </div>

              {manageMode && editingModuleId === mod.id && (
                <ModuleEditForm mod={mod} onDone={() => setEditingModuleId(null)} onSaved={onRefresh} />
              )}

              {!manageMode && (
                <div className="flex flex-col gap-2">
                  <ChipMultiSelect
                    options={optionsToShow.map((opt) => ({ value: opt.id, label: opt.label }))}
                    selected={selections[mod.id] ?? []}
                    onToggle={(optionId) => onToggleOption(mod.id, optionId)}
                  />
                  <button
                    type="button"
                    onClick={() => setAddOptionForModuleId(mod.id)}
                    className="self-start rounded-lg border border-dashed border-white/15 px-2.5 py-1 text-[11px] font-medium text-neutral-400 hover:border-fuchsia-400/50 hover:text-fuchsia-200"
                  >
                    + Adicionar item em {mod.name}
                  </button>
                </div>
              )}

              {manageMode && (
                <div className="flex flex-col gap-1.5">
                  {optionsToShow.map((opt) =>
                    editingOptionId === opt.id ? (
                      <OptionEditForm key={opt.id} opt={opt} onDone={() => setEditingOptionId(null)} onSaved={onRefresh} />
                    ) : (
                      <div
                        key={opt.id}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-neutral-950/50 px-2.5 py-1.5 ${
                          !opt.active ? "opacity-50" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-neutral-200">{opt.label}</span>
                          <span className="ml-2 text-[10px] text-neutral-500">{opt.keywords}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <button type="button" onClick={() => moveOption(mod, opt, -1)} className="rounded-md border border-white/10 bg-neutral-900/70 px-1.5 py-0.5 text-[10px] text-neutral-400 hover:border-white/25">
                            ↑
                          </button>
                          <button type="button" onClick={() => moveOption(mod, opt, 1)} className="rounded-md border border-white/10 bg-neutral-900/70 px-1.5 py-0.5 text-[10px] text-neutral-400 hover:border-white/25">
                            ↓
                          </button>
                          <button type="button" onClick={() => setEditingOptionId(opt.id)} className="rounded-md border border-white/10 bg-neutral-900/70 px-2 py-0.5 text-[10px] text-neutral-300 hover:border-white/25">
                            Editar
                          </button>
                          <button type="button" onClick={() => duplicateOption(opt)} className="rounded-md border border-white/10 bg-neutral-900/70 px-2 py-0.5 text-[10px] text-neutral-300 hover:border-white/25">
                            Duplicar
                          </button>
                          <button type="button" onClick={() => toggleOptionActive(opt)} className="rounded-md border border-white/10 bg-neutral-900/70 px-2 py-0.5 text-[10px] text-neutral-300 hover:border-white/25">
                            {opt.active ? "Desativar" : "Ativar"}
                          </button>
                          <button type="button" onClick={() => deleteOptionConfirmed(opt)} className="rounded-md border border-red-400/30 px-2 py-0.5 text-[10px] text-red-300 hover:bg-red-400/10">
                            Excluir
                          </button>
                        </div>
                      </div>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => setAddOptionForModuleId(mod.id)}
                    className="self-start rounded-lg border border-dashed border-white/15 px-2.5 py-1 text-[11px] font-medium text-neutral-400 hover:border-fuchsia-400/50 hover:text-fuchsia-200"
                  >
                    + Novo item
                  </button>
                </div>
              )}
            </div>
          );
        })}

      {showAddModule && (
        <AddModuleModal libraryKey={libraryKey} onClose={() => setShowAddModule(false)} onCreated={() => onRefresh()} />
      )}
      {addOptionForModuleId && (
        <AddOptionModal
          modules={sortedModules}
          initialModuleId={addOptionForModuleId}
          onClose={() => setAddOptionForModuleId(null)}
          onCreated={() => onRefresh()}
        />
      )}
    </div>
  );
}

function ModuleEditForm({ mod, onDone, onSaved }: { mod: LibraryModule; onDone: () => void; onSaved: () => void | Promise<void> }) {
  const [name, setName] = useState(mod.name);
  const [icon, setIcon] = useState(mod.icon);
  const [category, setCategory] = useState(mod.category);
  const [complementaryPrompt, setComplementaryPrompt] = useState(mod.complementaryPrompt);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await patchJson(`/api/libraries/modules/${mod.id}`, { name, icon, category, complementaryPrompt });
    setSaving(false);
    await onSaved();
    onDone();
  }

  return (
    <div className="mb-3 grid grid-cols-1 gap-2 rounded-lg border border-white/10 bg-neutral-950/60 p-3 sm:grid-cols-2">
      <TextInput value={name} onChange={setName} placeholder="Nome" />
      <TextInput value={icon} onChange={setIcon} placeholder="Ícone" />
      <TextInput value={category} onChange={setCategory} placeholder="Agrupamento" />
      <TextInput value={complementaryPrompt} onChange={setComplementaryPrompt} placeholder="Prompt complementar" />
      <div className="col-span-full flex gap-2">
        <button type="button" disabled={saving} onClick={save} className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={onDone} className="rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-1.5 text-xs text-neutral-300 hover:border-white/25">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function OptionEditForm({ opt, onDone, onSaved }: { opt: LibraryOption; onDone: () => void; onSaved: () => void | Promise<void> }) {
  const [label, setLabel] = useState(opt.label);
  const [keywords, setKeywords] = useState(opt.keywords);
  const [description, setDescription] = useState(opt.description);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await patchJson(`/api/libraries/options/${opt.id}`, { label, keywords, description });
    setSaving(false);
    await onSaved();
    onDone();
  }

  return (
    <div className="grid grid-cols-1 gap-2 rounded-lg border border-fuchsia-400/30 bg-neutral-950/60 p-3 sm:grid-cols-3">
      <TextInput value={label} onChange={setLabel} placeholder="Nome" />
      <TextInput value={keywords} onChange={setKeywords} placeholder="Palavras-chave" />
      <TextInput value={description} onChange={setDescription} placeholder="Descrição (opcional)" />
      <div className="col-span-full flex gap-2">
        <button type="button" disabled={saving} onClick={save} className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={onDone} className="rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-1.5 text-xs text-neutral-300 hover:border-white/25">
          Cancelar
        </button>
      </div>
    </div>
  );
}
