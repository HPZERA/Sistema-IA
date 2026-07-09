"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CharacterForm } from "@/components/characters/CharacterForm";
import { TextInput } from "@/components/ui/Field";
import { CharacterSummary, CharacterWithImages, CONSISTENCY_LEVEL_OPTIONS } from "@/types/character";
import { APPLY_CHARACTER_KEY } from "@/components/PromptStudio";
import { APPLY_CHARACTER_TO_ANONYMOUS_KEY } from "@/components/AnonymousFramingStudio";

export function CharacterLibrary() {
  const router = useRouter();
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CharacterWithImages | null>(null);
  const [search, setSearch] = useState("");

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/characters");
    const data = await res.json();
    setCharacters(data.characters ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function openEdit(id: string) {
    const res = await fetch(`/api/characters/${id}`);
    const data = await res.json();
    if (res.ok) setEditing(data.character);
  }

  async function handleDuplicate(id: string) {
    await fetch(`/api/characters/${id}/duplicate`, { method: "POST" });
    await refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover o personagem "${name}" e todas as suas imagens? Essa ação não pode ser desfeita.`)) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    await refresh();
  }

  function applyToPromptStudio(id: string) {
    window.sessionStorage.setItem(APPLY_CHARACTER_KEY, id);
    router.push("/");
  }

  function applyToAnonymousFraming(id: string) {
    window.sessionStorage.setItem(APPLY_CHARACTER_TO_ANONYMOUS_KEY, id);
    router.push("/enquadramento-anonimo");
  }

  function consistencyLabel(level: string) {
    return CONSISTENCY_LEVEL_OPTIONS.find((o) => o.value === level)?.label ?? level;
  }

  const filteredCharacters = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter((c) => c.name.toLowerCase().includes(q) || c.style.toLowerCase().includes(q));
  }, [characters, search]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 lg:px-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-50">Meus Personagens</h2>
          <p className="mt-1 max-w-2xl text-sm text-neutral-400">
            Salve manualmente identidades visuais reutilizáveis direto no sistema — tudo fica gravado no banco de
            dados. Depois é só abrir um personagem salvo e aplicar com 1 clique no Prompt Studio ou no Enquadramento
            Anônimo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="whitespace-nowrap rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white"
        >
          + Criar personagem
        </button>
      </header>

      {characters.length > 0 && (
        <TextInput value={search} onChange={setSearch} placeholder="Pesquisar personagens por nome ou estilo..." />
      )}

      {loading && <p className="text-sm text-neutral-500">Carregando personagens...</p>}

      {!loading && characters.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-neutral-900/40 p-4 text-sm text-neutral-400">
          Nenhum personagem cadastrado ainda. Clique em &quot;Criar personagem&quot; para criar o primeiro.
        </p>
      )}

      {!loading && characters.length > 0 && filteredCharacters.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-neutral-900/40 p-4 text-sm text-neutral-400">
          Nenhum personagem encontrado para &quot;{search}&quot;.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filteredCharacters.map((c) => (
          <div key={c.id} className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-900/40">
            <div className="aspect-square w-full bg-neutral-950">
              {c.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.coverImageUrl} alt={c.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl text-neutral-700">👤</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <span className="text-sm font-semibold text-neutral-100">{c.name}</span>
              <span className="text-[11px] text-neutral-500">
                {c.age} anos · {c.imageCount} imagem(ns) · consistência {consistencyLabel(c.consistencyLevel)}
              </span>
              <div className="mt-auto grid grid-cols-2 gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => applyToPromptStudio(c.id)}
                  className="col-span-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-2 py-1.5 text-[11px] font-semibold text-white"
                >
                  Aplicar no Prompt Studio
                </button>
                <button
                  type="button"
                  onClick={() => applyToAnonymousFraming(c.id)}
                  className="col-span-2 rounded-lg border border-white/10 bg-neutral-900/70 px-2 py-1 text-[11px] text-neutral-300 hover:border-white/25"
                >
                  Aplicar no Enquadramento Anônimo
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(c.id)}
                  className="rounded-lg border border-white/10 bg-neutral-900/70 px-2 py-1 text-[11px] text-neutral-300 hover:border-white/25"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(c.id)}
                  className="rounded-lg border border-white/10 bg-neutral-900/70 px-2 py-1 text-[11px] text-neutral-300 hover:border-white/25"
                >
                  Duplicar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.name)}
                  className="col-span-2 rounded-lg border border-red-400/30 px-2 py-1 text-[11px] text-red-300 hover:bg-red-400/10"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <CharacterForm
          onClose={() => {
            setCreating(false);
            refresh();
          }}
        />
      )}
      {editing && (
        <CharacterForm
          existing={editing}
          onClose={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
