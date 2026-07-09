import { del, put } from "@vercel/blob";

// Server-only — never import this from a "use client" component. Requires BLOB_READ_WRITE_TOKEN
// (provided automatically by a Vercel Blob store attached to the project; set it manually in
// .env.local for local development).

export async function uploadCharacterImage(
  characterId: string,
  file: File
): Promise<{ url: string; fileName: string; fileType: string }> {
  const pathname = `characters/${characterId}/${Date.now()}-${file.name}`;
  const blob = await put(pathname, file, { access: "public" });
  return { url: blob.url, fileName: file.name, fileType: file.type || "application/octet-stream" };
}

export async function deleteBlob(url: string): Promise<void> {
  await del(url);
}
