"use client";

import { Modal } from "@/components/ui/Modal";
import { CONFIGURATION_TYPE_OPTIONS, ConfigurationDetail } from "@/types/configuration";

function typeLabel(type: string) {
  return CONFIGURATION_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export function ConfigurationDetailModal({
  configuration,
  onApply,
  onClose,
}: {
  configuration: ConfigurationDetail;
  onApply: (configuration: ConfigurationDetail) => void;
  onClose: () => void;
}) {
  const { formSnapshot: form } = configuration;

  return (
    <Modal title={configuration.name} onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        {configuration.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={configuration.coverImageUrl}
            alt={configuration.name}
            className="max-h-64 w-full rounded-lg border border-white/10 object-cover"
          />
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-0.5 text-fuchsia-200">
            {typeLabel(configuration.type)}
          </span>
          {configuration.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-neutral-800 px-2 py-0.5 text-neutral-400">
              {tag}
            </span>
          ))}
          <span>Atualizado em {new Date(configuration.updatedAt).toLocaleString("pt-BR")}</span>
        </div>

        {configuration.description && <p className="text-sm text-neutral-300">{configuration.description}</p>}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg border border-white/10 bg-neutral-900/60 p-3 text-xs">
          <dt className="text-neutral-500">Gênero / idade</dt>
          <dd className="text-neutral-200">
            {form.gender} · {form.age} anos
          </dd>
          <dt className="text-neutral-500">Corpo</dt>
          <dd className="text-neutral-200">{form.bodyType.join(", ") || "—"}</dd>
          <dt className="text-neutral-500">Roupas</dt>
          <dd className="text-neutral-200">{form.wardrobeCategory.join(", ") || "—"}</dd>
          <dt className="text-neutral-500">Cenário</dt>
          <dd className="text-neutral-200">{form.scene || "—"}</dd>
          <dt className="text-neutral-500">Pose</dt>
          <dd className="text-neutral-200">{form.pose.join(", ") || "—"}</dd>
          <dt className="text-neutral-500">Câmera</dt>
          <dd className="text-neutral-200">{form.cameraAngle.join(", ") || "—"}</dd>
          <dt className="text-neutral-500">Iluminação</dt>
          <dd className="text-neutral-200">{form.lighting || "—"}</dd>
          <dt className="text-neutral-500">Estilo</dt>
          <dd className="text-neutral-200">{form.style || "—"}</dd>
          <dt className="text-neutral-500">Visibilidade do rosto</dt>
          <dd className="text-neutral-200">{form.faceVisibility || "—"}</dd>
          <dt className="text-neutral-500">Enquadramento anônimo</dt>
          <dd className="text-neutral-200">{form.anonymousFramingEnabled ? "Ativo" : "Inativo"}</dd>
          <dt className="text-neutral-500">IA utilizada</dt>
          <dd className="text-neutral-200">
            {configuration.providerName ?? "—"}
            {configuration.modelLabel ? ` · ${configuration.modelLabel}` : ""}
          </dd>
        </dl>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-neutral-300">Prompt final</span>
          <p className="max-h-32 overflow-y-auto rounded-lg border border-white/10 bg-neutral-950/60 p-2.5 font-mono text-[12px] leading-relaxed text-neutral-300">
            {configuration.prompt || "—"}
          </p>
        </div>

        {configuration.negativePrompt && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-neutral-300">Prompt negativo</span>
            <p className="max-h-24 overflow-y-auto rounded-lg border border-white/10 bg-neutral-950/60 p-2.5 font-mono text-[12px] leading-relaxed text-neutral-300">
              {configuration.negativePrompt}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => onApply(configuration)}
          className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white"
        >
          Aplicar no Prompt Studio
        </button>
      </div>
    </Modal>
  );
}
