"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PromptFormState } from "@/types/formState";

interface GenerationRow {
  id: string;
  prompt: string;
  negativePrompt: string;
  providerId: string | null;
  providerName: string;
  modelId: string;
  modelLabel: string;
  width: number;
  height: number;
  imageUrl: string | null;
  formSnapshot: PromptFormState | null;
  createdAt: string;
}

const LOAD_GENERATION_KEY = "dark-brand:load-generation";

export function LibraryPage() {
  const router = useRouter();
  const [items, setItems] = useState<GenerationRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load(searchTerm: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    const res = await fetch(`/api/generations?${params.toString()}`);
    const data = await res.json();
    setItems(data.generations ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load("");
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    load(search);
  }

  function openInStudio(item: GenerationRow, autoGenerate: boolean) {
    window.sessionStorage.setItem(
      LOAD_GENERATION_KEY,
      JSON.stringify({
        formSnapshot: item.formSnapshot,
        prompt: item.prompt,
        negativePrompt: item.negativePrompt,
        providerId: item.providerId,
        modelId: item.modelId,
        autoGenerate,
      })
    );
    router.push("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 lg:px-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-50">Biblioteca</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-400">
            Suas imagens geradas. Pesquise, reabra no Prompt Studio para editar/duplicar, gere novamente ou baixe.
          </p>
        </div>
        <Link
          href="/"
          className="whitespace-nowrap rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/25"
        >
          ← Prompt Studio
        </Link>
      </header>

      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por prompt..."
          className="w-full max-w-sm rounded-lg border border-white/10 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-fuchsia-400/60"
        />
        <button
          type="submit"
          className="rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-white/25"
        >
          Pesquisar
        </button>
      </form>

      {loading && <p className="text-sm text-neutral-500">Carregando...</p>}
      {!loading && items.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-neutral-900/40 p-4 text-sm text-neutral-400">
          Nenhuma imagem gerada ainda.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-900/40">
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.prompt}
                className="aspect-square w-full cursor-pointer object-cover"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              />
            )}
            <div className="flex flex-1 flex-col gap-1.5 p-2.5">
              <p className="line-clamp-2 text-[11px] text-neutral-400">{item.prompt}</p>
              <p className="text-[10px] text-neutral-600">
                {item.providerName} · {item.modelLabel}
              </p>
              <p className="text-[10px] text-neutral-600">{new Date(item.createdAt).toLocaleString("pt-BR")}</p>

              {expandedId === item.id && (
                <div className="mt-1 flex flex-col gap-1 border-t border-white/10 pt-1.5 text-[10px] text-neutral-500">
                  <p>
                    <span className="text-neutral-600">Prompt negativo:</span> {item.negativePrompt}
                  </p>
                  <p>
                    <span className="text-neutral-600">Resolução:</span> {item.width}×{item.height}
                  </p>
                </div>
              )}

              <div className="mt-auto flex flex-wrap gap-1 pt-1.5">
                {item.imageUrl && (
                  <a
                    href={item.imageUrl}
                    download
                    className="rounded-md border border-white/10 bg-neutral-900/70 px-1.5 py-1 text-[10px] text-neutral-300 hover:border-white/25"
                  >
                    Baixar
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => openInStudio(item, false)}
                  className="rounded-md border border-white/10 bg-neutral-900/70 px-1.5 py-1 text-[10px] text-neutral-300 hover:border-white/25"
                >
                  Editar / Duplicar
                </button>
                <button
                  type="button"
                  onClick={() => openInStudio(item, true)}
                  className="rounded-md border border-fuchsia-400/30 bg-fuchsia-400/10 px-1.5 py-1 text-[10px] text-fuchsia-200 hover:bg-fuchsia-400/20"
                >
                  Gerar novamente
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { LOAD_GENERATION_KEY };
