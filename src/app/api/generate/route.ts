import { NextResponse } from "next/server";
import { PromptFormState } from "@/types/formState";
import { validateSubmission } from "@/lib/safety";
import { buildPromptForProvider, buildNegativePrompt, aspectRatioToSize } from "@/lib/promptBuilder";
import { generateImageWithFailover, NoActiveProviderError } from "@/lib/ai-providers/generate";
import { computeCacheKey, findCachedGeneration, recordGeneration } from "@/lib/generations";
import { listLibraryModules } from "@/lib/libraries";
import { getCharacterWithImages } from "@/lib/characters";

interface GenerateRequestBody {
  form: PromptFormState;
  promptOverride?: string; // user-edited prompt takes precedence when provided
  negativePromptOverride?: string;
  providerId?: string; // preferred AI provider; falls back to highest-priority active one
  modelId?: string; // preferred model on that provider
}

export async function POST(request: Request) {
  let payload: GenerateRequestBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { form, promptOverride, negativePromptOverride, providerId, modelId } = payload;

  if (!form) {
    return NextResponse.json({ error: "Dados do formulário ausentes." }, { status: 400 });
  }

  // Server-side is the source of truth for safety validation — never trust the client alone.
  const check = validateSubmission({
    age: Number(form.age),
    consentAccepted: !!form.consentAccepted,
    freeTextFields: {
      "características físicas": form.distinguishingFeatures,
      "detalhes da roupa": form.wardrobeDetails,
      "acessórios (personalizado)": form.accessoriesCustom,
      "detalhes do cenário": form.sceneDetails,
      "pose (personalizada)": form.poseCustom,
      "prompt editado manualmente": promptOverride,
      // Note: the negative prompt is intentionally NOT scanned here — it's a "what to avoid"
      // list that always includes MANDATORY_SAFETY_NEGATIVE_TERMS (e.g. "child, minor,
      // nudity"), so running it through the same denylist used for generative content would
      // self-block every request.
    },
  });

  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: 422 });
  }

  // The client always keeps `prompt` in sync and sends it as `promptOverride`, so this path is
  // the exception — but it still has to resolve Library/Character selections into keywords
  // itself, since promptBuilder is a pure function that never touches the DB directly.
  let prompt = promptOverride?.trim();
  if (!prompt) {
    const libraries = await listLibraryModules();
    const character = form.selectedCharacterId ? await getCharacterWithImages(form.selectedCharacterId) : undefined;
    prompt = buildPromptForProvider(form, libraries, character);
  }
  const negativePrompt = negativePromptOverride?.trim() || buildNegativePrompt();
  const { width, height } = aspectRatioToSize(form.aspectRatio);

  const cacheKey = computeCacheKey({
    prompt,
    negativePrompt,
    providerId: providerId ?? "auto",
    modelId: modelId ?? "auto",
    width,
    height,
  });

  // Identical prompt + same provider/model/resolution recently generated? Serve it again for
  // free instead of paying the provider a second time. Storage issues here must never break
  // generation, so any DB failure just falls through to a normal (uncached) generation.
  try {
    const cached = await findCachedGeneration(cacheKey);
    if (cached?.imageUrl) {
      return NextResponse.json({
        images: [{ url: cached.imageUrl }],
        info: {
          providerId: cached.providerId ?? undefined,
          providerName: cached.providerName,
          modelId: cached.modelId,
          modelLabel: cached.modelLabel,
          durationMs: 0,
          width: cached.width,
          height: cached.height,
          creditsUsed: cached.creditsUsed ? Number(cached.creditsUsed) : undefined,
          costUsd: cached.costUsd ? Number(cached.costUsd) : undefined,
          servedFromCache: true,
          attempts: [],
        },
      });
    }
  } catch (err) {
    console.error("Cache lookup failed, continuing without cache:", err);
  }

  try {
    const result = await generateImageWithFailover({
      preferredProviderId: providerId,
      preferredModelId: modelId,
      prompt,
      negativePrompt,
      width,
      height,
    });

    try {
      await recordGeneration({
        prompt,
        negativePrompt,
        providerId: result.info.providerId,
        providerName: result.info.providerName,
        modelId: result.info.modelId,
        modelLabel: result.info.modelLabel,
        width,
        height,
        durationMs: result.info.durationMs,
        creditsUsed: result.info.creditsUsed,
        costUsd: result.info.costUsd,
        imageUrl: result.images[0]?.url,
        formSnapshot: form,
        status: "completed",
        cacheKey,
      });
    } catch (err) {
      console.error("Failed to record generation history (image was generated successfully):", err);
    }

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof NoActiveProviderError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    const message = err instanceof Error ? err.message : "Erro desconhecido ao gerar imagem.";

    try {
      await recordGeneration({
        prompt,
        negativePrompt,
        providerId,
        providerName: providerId ?? "desconhecido",
        modelId: modelId ?? "desconhecido",
        modelLabel: modelId ?? "desconhecido",
        width,
        height,
        status: "failed",
        errorMessage: message,
        cacheKey,
        formSnapshot: form,
      });
    } catch (recordErr) {
      console.error("Failed to record failed generation:", recordErr);
    }

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
