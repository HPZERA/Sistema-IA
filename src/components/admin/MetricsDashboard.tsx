"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Section } from "@/components/ui/Section";

interface Stats {
  totalImages: number;
  totalCostUsd: number;
  totalCredits: number;
  avgDurationMs: number;
  byProvider: { providerName: string; count: number }[];
  byModel: { modelLabel: string; count: number }[];
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-100">{value}</p>
    </div>
  );
}

function RankedBarList({ items }: { items: { label: string; count: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="col-span-full flex flex-col gap-2.5">
      {items.length === 0 && <p className="text-xs text-neutral-500">Sem dados ainda.</p>}
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-xs text-neutral-300" title={item.label}>
            {item.label}
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-sm bg-neutral-900/60">
            <div
              className="h-full rounded-r-sm bg-fuchsia-500/80"
              style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-neutral-400">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function MetricsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/metrics")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar métricas."));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 lg:px-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-50">Painel de métricas</h1>
          <p className="mt-1 text-sm text-neutral-400">Visão geral do uso do gerador de imagens.</p>
        </div>
        <Link href="/admin" className="text-xs text-neutral-400 hover:text-neutral-200">
          ← Gerenciador de IA
        </Link>
      </header>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {!stats && !error && <p className="text-sm text-neutral-500">Carregando métricas...</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Total de imagens" value={formatCompact(stats.totalImages)} />
            <StatTile label="Custo total estimado" value={`US$ ${stats.totalCostUsd.toFixed(2)}`} />
            <StatTile label="Créditos gastos" value={formatCompact(stats.totalCredits)} />
            <StatTile label="Tempo médio de geração" value={`${(stats.avgDurationMs / 1000).toFixed(1)}s`} />
          </div>

          <Section title="IA mais utilizada">
            <RankedBarList items={stats.byProvider.map((p) => ({ label: p.providerName, count: p.count }))} />
          </Section>

          <Section title="Modelo mais utilizado">
            <RankedBarList items={stats.byModel.map((m) => ({ label: m.modelLabel, count: m.count }))} />
          </Section>
        </>
      )}
    </div>
  );
}
