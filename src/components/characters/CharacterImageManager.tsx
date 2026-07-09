"use client";

import { useRef, useState } from "react";
import { SelectField } from "@/components/ui/Field";
import { CHARACTER_REFERENCE_TYPE_OPTIONS, CharacterImage, CharacterReferenceType } from "@/types/character";

export function CharacterImageManager({
  characterId,
  images,
  onImagesChange,
}: {
  characterId: string;
  images: CharacterImage[];
  onImagesChange: (images: CharacterImage[]) => void;
}) {
  const [uploadReferenceType, setUploadReferenceType] = useState<CharacterReferenceType>("frente");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);

  const sorted = [...images].sort((a, b) => a.order - b.order);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded: CharacterImage[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("referenceType", uploadReferenceType);
        const res = await fetch(`/api/characters/${characterId}/images`, { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Falha ao enviar imagem.");
        uploaded.push(data.image);
      }
      onImagesChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(image: CharacterImage) {
    if (!confirm("Remover esta imagem de referência?")) return;
    await fetch(`/api/characters/${characterId}/images/${image.id}`, { method: "DELETE" });
    onImagesChange(images.filter((img) => img.id !== image.id));
  }

  async function handleReferenceTypeChange(image: CharacterImage, referenceType: CharacterReferenceType) {
    await fetch(`/api/characters/${characterId}/images/${image.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referenceType }),
    });
    onImagesChange(images.map((img) => (img.id === image.id ? { ...img, referenceType } : img)));
  }

  async function handleMove(image: CharacterImage, direction: -1 | 1) {
    const idx = sorted.findIndex((img) => img.id === image.id);
    const neighbor = sorted[idx + direction];
    if (!neighbor) return;
    await Promise.all([
      fetch(`/api/characters/${characterId}/images/${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: neighbor.order }),
      }),
      fetch(`/api/characters/${characterId}/images/${neighbor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: image.order }),
      }),
    ]);
    onImagesChange(
      images.map((img) => {
        if (img.id === image.id) return { ...img, order: neighbor.order };
        if (img.id === neighbor.id) return { ...img, order: image.order };
        return img;
      })
    );
  }

  function requestReplace(image: CharacterImage) {
    setReplacingId(image.id);
    replaceInputRef.current?.click();
  }

  async function handleReplaceFile(files: FileList | null) {
    if (!files || files.length === 0 || !replacingId) return;
    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/characters/${characterId}/images/${replacingId}`, { method: "PUT", body: formData });
    const data = await res.json();
    if (res.ok) onImagesChange(images.map((img) => (img.id === replacingId ? data.image : img)));
    setReplacingId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SelectField
          value={uploadReferenceType}
          onChange={(v) => setUploadReferenceType(v as CharacterReferenceType)}
          options={CHARACTER_REFERENCE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
        <label className="cursor-pointer rounded-lg border border-dashed border-white/15 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:border-fuchsia-400/50 hover:text-fuchsia-200">
          {uploading ? "Enviando..." : "+ Enviar imagens"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
        <input
          ref={replaceInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleReplaceFile(e.target.files)}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}

      {sorted.length === 0 ? (
        <p className="text-xs text-neutral-500">Nenhuma imagem enviada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sorted.map((image) => (
            <div key={image.id} className="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-neutral-950/50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.blobUrl} alt={image.fileName} className="aspect-square w-full rounded-md object-cover" />
              <SelectField
                value={image.referenceType}
                onChange={(v) => handleReferenceTypeChange(image, v as CharacterReferenceType)}
                options={CHARACTER_REFERENCE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
              <div className="flex flex-wrap items-center gap-1">
                <button type="button" onClick={() => handleMove(image, -1)} className="rounded-md border border-white/10 bg-neutral-900/70 px-1.5 py-0.5 text-[10px] text-neutral-400 hover:border-white/25">
                  ↑
                </button>
                <button type="button" onClick={() => handleMove(image, 1)} className="rounded-md border border-white/10 bg-neutral-900/70 px-1.5 py-0.5 text-[10px] text-neutral-400 hover:border-white/25">
                  ↓
                </button>
                <button type="button" onClick={() => requestReplace(image)} className="rounded-md border border-white/10 bg-neutral-900/70 px-2 py-0.5 text-[10px] text-neutral-300 hover:border-white/25">
                  Substituir
                </button>
                <button type="button" onClick={() => handleDelete(image)} className="rounded-md border border-red-400/30 px-2 py-0.5 text-[10px] text-red-300 hover:bg-red-400/10">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
