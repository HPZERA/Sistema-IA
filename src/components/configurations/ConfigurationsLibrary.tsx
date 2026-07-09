"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextInput, SelectField } from "@/components/ui/Field";
import { CONFIGURATION_TYPE_OPTIONS, ConfigurationDetail, ConfigurationType } from "@/types/configuration";
import { LOAD_CONFIGURATION_KEY } from "@/components/PromptStudio";
import { LOAD_ANONYMOUS_CONFIGURATION_KEY } from "@/components/AnonymousFramingStudio";
import { ConfigurationDetailModal } from "@/components/configurations/ConfigurationDetailModal";
import { EditConfigurationModal } from "@/components/configurations/EditConfigurationModal";

export function ConfigurationsLibrary() {
  const router = useRouter();
  const [items, setItems] = useState<ConfigurationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ConfigurationType | "">("");
  const [viewing, setViewing] = useState<ConfigurationDetail | null>(null);
  const [editing, setEditing] = useState<ConfigurationDetail | null>(null);

  async function refresh() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (typeFilter) params.set("type", typeFilter);
    const res = await fetch(`/api/configurations?${params.toString()}`);
    const data = await res.json();
    setItems(data.configurations ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const timeout = setTimeout(refresh, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter]);

  function typeLabel(type: string) {
    return CONFIGURATION_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
  }

  function applyConfiguration(config: ConfigurationDetail) {
    if (config.type === "anonimo") {
      window.sessionStorage.setItem(LOAD_ANONYMOUS_CONFIGURATION_KEY, JSON.stringify(config));
      router.push("/enquadramento-anonimo");
      return;
    }
    window.sessionStorage.setItem(LOAD_CONFIGURATION_KEY, JSON.stringify(config));
    router.push("/");
  }

  async function duplicateConfiguration(id: string) {
    await fetch(`/api/configurations/${id}/duplicate`, { method: "POST" });
    await refresh();
  }

  async function deleteConfiguration(id: string, name: string) {
    if (!confirm(`Excluir a configuração "${name}"? Essa ação não pode ser desfeita.`)) return;
    await fetch(`/api/configurations/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 lg:px-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-50">Minhas Configurações</h2>
          <p className="mt-1 max-w-2xl text-sm text-neutral-400">
            Configurações completas salvas manualmente no Prompt Studio: personagem, roupas, cenário, pose,
            enquadramento, iluminação, câmera, estilo, prompt e IA usada. Aplique com 1 clique para recarregar tudo
            exatamente como estava.
          </p>
        </div>
        <Link
          href="/"
          className="whitespace-nowrap rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/25"
        >
          ← Prompt Studio
        </Link>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <TextInput value={search} onChange={setSearch} placeholder="Pesquisar configurações por nome..." />
        </div>
        <div className="sm:w-56">
          <SelectField
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as ConfigurationType | "")}
            options={[{ value: "", label: "Todos os tipos" }, ...CONFIGURATION_TYPE_OPTIONS]}
          />
        </div>
      </div>

      {loading && <p className="text-sm text-neutral-500">Carregando configurações...</p>}

      {!loading && items.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-neutral-900/40 p-4 text-sm text-neutral-400">
          Nenhuma configuração encontrada. Monte tudo no Prompt Studio e clique em &quot;Salvar configuração
          completa&quot; para criar a primeira.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-900/40">
            <div className="aspect-video w-full bg-neutral-950">
              {item.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.coverImageUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl text-neutral-700">🗂️</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-neutral-100">{item.name}</span>
                <span className="whitespace-nowrap rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] font-medium text-fuchsia-200">
                  {typeLabel(item.type)}
                </span>
              </div>
              {item.description && <p className="line-clamp-2 text-[11px] text-neutral-500">{item.description}</p>}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-[11px] text-neutral-600">
                Atualizado em {new Date(item.updatedAt).toLocaleDateString("pt-BR")}
                {item.modelLabel ? ` · ${item.modelLabel}` : ""}
              </span>

              <div className="mt-auto grid grid-cols-2 gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => applyConfiguration(item)}
                  className="col-span-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-2 py-1.5 text-[11px] font-semibold text-white"
                >
                  {item.type === "anonimo" ? "Aplicar no Enquadramento Anônimo" : "Aplicar no Prompt Studio"}
                </button>
                <button
                  type="button"
                  onClick={() => setViewing(item)}
                  className="rounded-lg border border-white/10 bg-neutral-900/70 px-2 py-1 text-[11px] text-neutral-300 hover:border-white/25"
                >
                  Abrir
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="rounded-lg border border-white/10 bg-neutral-900/70 px-2 py-1 text-[11px] text-neutral-300 hover:border-white/25"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => duplicateConfiguration(item.id)}
                  className="rounded-lg border border-white/10 bg-neutral-900/70 px-2 py-1 text-[11px] text-neutral-300 hover:border-white/25"
                >
                  Duplicar
                </button>
                <button
                  type="button"
                  onClick={() => deleteConfiguration(item.id, item.name)}
                  className="rounded-lg border border-red-400/30 px-2 py-1 text-[11px] text-red-300 hover:bg-red-400/10"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewing && (
        <ConfigurationDetailModal configuration={viewing} onApply={applyConfiguration} onClose={() => setViewing(null)} />
      )}
      {editing && (
        <EditConfigurationModal
          configuration={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
