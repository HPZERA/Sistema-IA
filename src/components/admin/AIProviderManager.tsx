"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AIModel, AIProviderConfigPublic } from "@/types/aiProvider";
import { PROVIDER_KIND_INFO } from "@/lib/ai-providers/registry";
import { ProviderForm, ProviderFormValues } from "./ProviderForm";

type Mode = { type: "list" } | { type: "create" } | { type: "edit"; id: string };

export function AIProviderManager() {
  const [providers, setProviders] = useState<AIProviderConfigPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string }>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  const [discovering, setDiscovering] = useState<string | null>(null);
  const [discoveryError, setDiscoveryError] = useState<Record<string, string>>({});
  const [discovered, setDiscovered] = useState<Record<string, AIModel[]>>({});
  const [selectedDiscovered, setSelectedDiscovered] = useState<Record<string, Set<string>>>({});

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/ai-providers");
    const data = await res.json();
    setProviders(data.providers ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(values: ProviderFormValues) {
    const res = await fetch("/api/ai-providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Falha ao criar provedor.");
    setMode({ type: "list" });
    await refresh();
  }

  async function handleUpdate(id: string, values: ProviderFormValues) {
    const res = await fetch(`/api/ai-providers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Falha ao atualizar provedor.");
    setMode({ type: "list" });
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este provedor de IA? Essa ação não pode ser desfeita.")) return;
    await fetch(`/api/ai-providers/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function handleToggleActive(provider: AIProviderConfigPublic) {
    await fetch(`/api/ai-providers/${provider.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !provider.active }),
    });
    await refresh();
  }

  async function handlePriorityChange(provider: AIProviderConfigPublic, priority: number) {
    await fetch(`/api/ai-providers/${provider.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority }),
    });
    await refresh();
  }

  async function handleTestConnection(id: string) {
    setTestingId(id);
    try {
      const res = await fetch(`/api/ai-providers/${id}/test`, { method: "POST" });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [id]: data }));
    } finally {
      setTestingId(null);
    }
  }

  async function handleDiscoverModels(id: string) {
    setDiscovering(id);
    setDiscoveryError((prev) => ({ ...prev, [id]: "" }));
    try {
      const res = await fetch(`/api/ai-providers/${id}/models`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao buscar modelos.");
      const models: AIModel[] = data.models ?? [];
      setDiscovered((prev) => ({ ...prev, [id]: models }));
      setSelectedDiscovered((prev) => ({ ...prev, [id]: new Set(models.map((m) => m.id)) }));
    } catch (err) {
      setDiscoveryError((prev) => ({ ...prev, [id]: err instanceof Error ? err.message : "Erro desconhecido." }));
    } finally {
      setDiscovering(null);
    }
  }

  function toggleDiscoveredModel(providerId: string, modelId: string) {
    setSelectedDiscovered((prev) => {
      const current = new Set(prev[providerId] ?? []);
      if (current.has(modelId)) current.delete(modelId);
      else current.add(modelId);
      return { ...prev, [providerId]: current };
    });
  }

  async function applyDiscoveredModels(id: string) {
    const models = (discovered[id] ?? []).filter((m) => selectedDiscovered[id]?.has(m.id));
    if (models.length === 0) return;
    await fetch(`/api/ai-providers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ models }),
    });
    setDiscovered((prev) => ({ ...prev, [id]: [] }));
    await refresh();
  }

  const editingProvider = mode.type === "edit" ? providers.find((p) => p.id === mode.id) : undefined;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 lg:px-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-50">Gerenciador de IA</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-400">
            Cadastre e gerencie os provedores de geração de imagem. As chaves de API ficam armazenadas apenas no
            servidor e nunca são enviadas ao navegador.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/metrics" className="text-xs text-neutral-400 hover:text-neutral-200">
            Painel de métricas →
          </Link>
          <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-200">
            ← Voltar ao Prompt Studio
          </Link>
        </div>
      </header>

      {mode.type === "create" && (
        <ProviderForm onCancel={() => setMode({ type: "list" })} onSubmit={handleCreate} />
      )}
      {mode.type === "edit" && editingProvider && (
        <ProviderForm existing={editingProvider} onCancel={() => setMode({ type: "list" })} onSubmit={(v) => handleUpdate(editingProvider.id, v)} />
      )}

      {mode.type === "list" && (
        <button
          type="button"
          onClick={() => setMode({ type: "create" })}
          className="self-start rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white"
        >
          + Adicionar provedor
        </button>
      )}

      {loading && <p className="text-sm text-neutral-500">Carregando provedores...</p>}

      {!loading && providers.length === 0 && mode.type === "list" && (
        <p className="rounded-xl border border-white/10 bg-neutral-900/40 p-4 text-sm text-neutral-400">
          Nenhum provedor configurado ainda. Clique em &quot;Adicionar provedor&quot; para cadastrar o primeiro
          (Fal.ai, Black Forest Labs, OpenAI, Replicate, Together AI, Stability AI ou um provedor personalizado).
        </p>
      )}

      <div className="flex flex-col gap-3">
        {[...providers]
          .sort((a, b) => a.priority - b.priority)
          .map((provider) => {
            const testResult = testResults[provider.id];
            return (
              <div key={provider.id} className="rounded-xl border border-white/10 bg-neutral-900/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${provider.active ? "bg-emerald-400" : "bg-neutral-600"}`}
                      />
                      <span className="text-sm font-semibold text-neutral-100">{provider.name}</span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-neutral-400">
                        {PROVIDER_KIND_INFO[provider.kind].label}
                      </span>
                      {!provider.hasApiKey && (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300">
                          sem chave
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      {provider.models.length} modelo(s): {provider.models.map((m) => m.label).join(", ")}
                    </p>
                    {provider.endpoint && <p className="mt-0.5 text-[11px] text-neutral-600">{provider.endpoint}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                      Prioridade
                      <input
                        type="number"
                        defaultValue={provider.priority}
                        onBlur={(e) => handlePriorityChange(provider, Number(e.target.value))}
                        className="w-14 rounded-md border border-white/10 bg-neutral-950/60 px-1.5 py-1 text-xs text-neutral-200"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(provider)}
                      className="rounded-lg border border-white/10 bg-neutral-900/70 px-2.5 py-1 text-xs text-neutral-300 hover:border-white/25"
                    >
                      {provider.active ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      disabled={testingId === provider.id}
                      onClick={() => handleTestConnection(provider.id)}
                      className="rounded-lg border border-white/10 bg-neutral-900/70 px-2.5 py-1 text-xs text-neutral-300 hover:border-white/25 disabled:opacity-50"
                    >
                      {testingId === provider.id ? "Testando..." : "Testar conexão"}
                    </button>
                    <button
                      type="button"
                      disabled={discovering === provider.id}
                      onClick={() => handleDiscoverModels(provider.id)}
                      className="rounded-lg border border-white/10 bg-neutral-900/70 px-2.5 py-1 text-xs text-neutral-300 hover:border-white/25 disabled:opacity-50"
                    >
                      {discovering === provider.id ? "Buscando..." : "Buscar modelos"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode({ type: "edit", id: provider.id })}
                      className="rounded-lg border border-white/10 bg-neutral-900/70 px-2.5 py-1 text-xs text-neutral-300 hover:border-white/25"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(provider.id)}
                      className="rounded-lg border border-red-400/30 px-2.5 py-1 text-xs text-red-300 hover:bg-red-400/10"
                    >
                      Remover
                    </button>
                  </div>
                </div>

                {testResult && (
                  <p className={`mt-2 text-xs ${testResult.ok ? "text-emerald-400" : "text-red-400"}`}>
                    {testResult.message}
                  </p>
                )}

                {discoveryError[provider.id] && (
                  <p className="mt-2 text-xs text-amber-400">{discoveryError[provider.id]}</p>
                )}

                {discovered[provider.id]?.length > 0 && (
                  <div className="mt-3 rounded-lg border border-fuchsia-400/30 bg-neutral-950/50 p-3">
                    <p className="mb-2 text-xs text-neutral-400">
                      {discovered[provider.id].length} modelo(s) encontrado(s). Selecione quais usar (isso substitui a
                      lista atual de modelos deste provedor):
                    </p>
                    <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                      {discovered[provider.id].map((model) => (
                        <label key={model.id} className="flex items-center gap-2 text-xs text-neutral-300">
                          <input
                            type="checkbox"
                            checked={selectedDiscovered[provider.id]?.has(model.id) ?? false}
                            onChange={() => toggleDiscoveredModel(provider.id, model.id)}
                          />
                          {model.label}{" "}
                          <span className="text-neutral-600">({model.remoteId})</span>
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => applyDiscoveredModels(provider.id)}
                      className="mt-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Aplicar modelos selecionados
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
