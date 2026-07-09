// Curated option lists for the editorial/fashion prompt studio.
// `value` is the English token injected into the generated prompt (FLUX/SD read English best).
// `label` is the Portuguese text shown in the UI.

export type Option = { value: string; label: string };

export const GENDER_OPTIONS: Option[] = [
  { value: "woman", label: "Feminino" },
  { value: "man", label: "Masculino" },
  { value: "androgynous person", label: "Andrógino / não-binário" },
];

export const BODY_TYPE_OPTIONS: Option[] = [
  { value: "slim toned build", label: "Esguio e tonificado" },
  { value: "athletic muscular build", label: "Atlético / musculoso" },
  { value: "curvy hourglass figure", label: "Curvilíneo" },
  { value: "plus-size figure", label: "Plus size" },
  { value: "petite frame", label: "Compleição miúda" },
  { value: "tall statuesque frame", label: "Alto(a) e esguio(a)" },
];

export const SKIN_TONE_OPTIONS: Option[] = [
  { value: "fair skin tone", label: "Clara" },
  { value: "light olive skin tone", label: "Clara oliva" },
  { value: "medium olive skin tone", label: "Média oliva" },
  { value: "tan skin tone", label: "Bronzeada" },
  { value: "brown skin tone", label: "Morena" },
  { value: "deep dark skin tone", label: "Pele escura" },
];

export const HAIR_OPTIONS: Option[] = [
  { value: "long straight dark hair", label: "Longo, liso e escuro" },
  { value: "long wavy blonde hair", label: "Longo, ondulado e loiro" },
  { value: "shoulder-length curly auburn hair", label: "Médio, cacheado, ruivo-acobreado" },
  { value: "short pixie cut hair", label: "Curto estilo pixie" },
  { value: "sleek high bun hairstyle", label: "Coque alto e liso" },
  { value: "wet-look slicked-back hair", label: "Molhado, penteado para trás" },
];

export const WARDROBE_CATEGORY_OPTIONS: Option[] = [
  { value: "fitted two-piece bikini", label: "Biquíni" },
  { value: "one-piece swimsuit", label: "Maiô" },
  { value: "tailored swim trunks", label: "Sunga / shorts de banho" },
  { value: "matching performance activewear set", label: "Roupa fitness" },
  { value: "flowing summer dress", label: "Vestido" },
  { value: "elegant silk nightgown", label: "Camisola elegante" },
  { value: "matching satin pajama set", label: "Pijama elegante" },
  { value: "casual denim and t-shirt outfit", label: "Roupa casual" },
  { value: "linen summer outfit", label: "Traje de verão" },
  { value: "tailored resort wear", label: "Roupa de resort" },
];

export const ACCESSORY_OPTIONS: Option[] = [
  { value: "oversized sunglasses", label: "Óculos de sol" },
  { value: "straw sun hat", label: "Chapéu de palha" },
  { value: "delicate gold jewelry", label: "Joias delicadas" },
  { value: "minimalist wristwatch", label: "Relógio" },
  { value: "woven beach tote bag", label: "Bolsa de praia" },
  { value: "silk scarf", label: "Lenço de seda" },
  { value: "ankle bracelet", label: "Tornozeleira" },
  { value: "wide fabric belt", label: "Cinto largo" },
];

export const SCENE_OPTIONS: Option[] = [
  { value: "sun-drenched tropical beach with turquoise water", label: "Praia" },
  { value: "resort infinity pool overlooking the ocean", label: "Piscina" },
  { value: "modern boutique gym with natural light", label: "Academia" },
  { value: "upscale hotel suite with floor-to-ceiling windows", label: "Quarto de hotel" },
  { value: "luxury tropical resort terrace", label: "Resort" },
  { value: "modern minimalist bedroom with soft daylight", label: "Quarto moderno" },
  { value: "in front of a large full-length mirror", label: "Espelho" },
  { value: "seamless studio backdrop with professional lighting", label: "Estúdio fotográfico" },
  { value: "sunny urban street with editorial backdrop", label: "Ambiente urbano externo" },
  { value: "lush green garden setting", label: "Jardim / área verde" },
  { value: "elegant modern bathroom with marble finishes", label: "Banheiro" },
  { value: "mirror selfie in a modern bedroom or bathroom", label: "Selfie no espelho" },
  { value: "spacious walk-in closet with organized wardrobe", label: "Closet" },
  { value: "stylish modern living room", label: "Sala de estar" },
  { value: "private balcony with skyline view", label: "Varanda" },
  { value: "rooftop terrace at sunset", label: "Rooftop" },
  { value: "cozy boutique café", label: "Café" },
  { value: "upscale restaurant interior", label: "Restaurante" },
  { value: "modern shopping mall interior", label: "Shopping" },
  { value: "lively city street", label: "Rua" },
  { value: "green public park", label: "Parque" },
  { value: "modern corporate office", label: "Escritório" },
  { value: "luxury high-rise apartment", label: "Apartamento de luxo" },
  { value: "private yacht deck", label: "Iate" },
  { value: "scenic countryside landscape", label: "Interior / campo" },
  { value: "mountain landscape", label: "Montanha" },
  { value: "forest setting", label: "Floresta" },
  { value: "calm lakeside setting", label: "Lago" },
];

export const POSE_OPTIONS: Option[] = [
  { value: "standing confidently with relaxed posture", label: "Em pé, postura confiante" },
  { value: "walking naturally mid-stride", label: "Caminhando" },
  { value: "sitting relaxed on a ledge or chair", label: "Sentado(a), relaxado(a)" },
  { value: "stretching in a dynamic athletic pose", label: "Alongando-se" },
  { value: "looking back over the shoulder", label: "Olhando por cima do ombro" },
  { value: "leaning casually against a wall or railing", label: "Apoiado(a) na parede" },
  { value: "captured in candid mid-motion", label: "Em movimento, estilo candid" },
  { value: "adjusting hair with one hand, natural gesture", label: "Ajustando o cabelo" },
  { value: "reflected in the mirror, adjusting outfit", label: "Refletido(a) no espelho" },
];

export const CAMERA_ANGLE_OPTIONS: Option[] = [
  { value: "eye-level angle", label: "Nível dos olhos" },
  { value: "low angle looking slightly upward", label: "Ângulo baixo" },
  { value: "high angle looking slightly downward", label: "Ângulo alto" },
  { value: "three-quarter angle", label: "Três quartos" },
  { value: "over-the-shoulder framing", label: "Sobre o ombro" },
  { value: "tight close-up framing", label: "Close-up" },
  { value: "full-body framing", label: "Corpo inteiro" },
  { value: "American shot framing from the thighs up", label: "Plano americano" },
];

export const LENS_OPTIONS: Option[] = [
  { value: "24mm wide-angle lens", label: "24mm grande angular" },
  { value: "35mm documentary-style lens", label: "35mm documental" },
  { value: "50mm standard prime lens", label: "50mm padrão" },
  { value: "85mm portrait lens with creamy bokeh", label: "85mm retrato" },
  { value: "100mm macro lens", label: "100mm macro" },
  { value: "135mm telephoto lens with compressed background", label: "135mm teleobjetiva" },
];

export const LIGHTING_OPTIONS: Option[] = [
  { value: "soft natural daylight", label: "Luz natural do dia" },
  { value: "warm golden hour sunlight", label: "Golden hour" },
  { value: "soft natural window light", label: "Luz natural de janela" },
  { value: "warm indoor ambient light", label: "Luz ambiente interna" },
  { value: "soft elegant bathroom lighting", label: "Iluminação de banheiro" },
  { value: "cozy warm bedroom lighting", label: "Iluminação de quarto" },
  { value: "elegant upscale hotel lighting", label: "Iluminação de hotel" },
  { value: "vibrant city lighting at night", label: "Luz da cidade (noturna)" },
  { value: "clean studio softbox lighting (only if a studio look is requested)", label: "Softbox de estúdio" },
  { value: "dramatic backlight with sun flare", label: "Contraluz / backlight" },
  { value: "diffused light from an overcast sky", label: "Luz difusa (dia nublado)" },
  { value: "even beauty-dish ring light", label: "Luz de ring light" },
  { value: "harsh midday sunlight with sharp shadows", label: "Luz dura de meio-dia" },
  { value: "cool blue dusk lighting", label: "Luz azulada do entardecer" },
];

export const EXPRESSION_OPTIONS: Option[] = [
  { value: "confident expression", label: "Confiante" },
  { value: "relaxed genuine smile", label: "Sorriso relaxado" },
  { value: "serene calm expression", label: "Sereno(a)" },
  { value: "joyful genuine laughter", label: "Alegre / risada genuína" },
  { value: "serious editorial gaze", label: "Sério(a), editorial" },
  { value: "contemplative distant gaze", label: "Contemplativo(a)" },
  { value: "direct confident eye contact with camera", label: "Olhar direto para a câmera" },
];

export const STYLE_OPTIONS: Option[] = [
  { value: "high-fashion editorial photography", label: "Editorial de moda" },
  { value: "clean e-commerce catalog photography", label: "Catálogo / e-commerce" },
  { value: "lifestyle influencer photography", label: "Lifestyle de influenciador" },
  { value: "glossy fashion magazine photography", label: "Revista de moda (glossy)" },
  { value: "minimalist studio photography", label: "Minimalista de estúdio" },
  { value: "summer advertising campaign photography", label: "Publicidade de verão" },
  { value: "cinematic fashion campaign still", label: "Still de campanha cinematográfico" },
];

export const ASPECT_RATIO_OPTIONS: Option[] = [
  { value: "1:1", label: "1:1 (quadrado)" },
  { value: "4:5", label: "4:5 (retrato social)" },
  { value: "3:4", label: "3:4 (retrato)" },
  { value: "2:3", label: "2:3 (retrato editorial)" },
  { value: "16:9", label: "16:9 (paisagem)" },
  { value: "9:16", label: "9:16 (stories/reels)" },
];

export const REALISM_OPTIONS: Option[] = [
  { value: "ultra-detailed photorealistic, shot on professional DSLR", label: "Fotorrealista ultra detalhado" },
  { value: "cinematic photorealism with filmic color grading", label: "Realismo cinematográfico" },
  { value: "polished editorial realism, retouched but natural", label: "Realismo editorial polido" },
  { value: "semi-stylized realism with soft painterly rendering", label: "Semi-estilizado" },
];

export const MODEL_PROVIDER_OPTIONS: Option[] = [
  { value: "flux-dev", label: "FLUX.1 [dev] — alta qualidade" },
  { value: "flux-schnell", label: "FLUX.1 [schnell] — rápido" },
  { value: "flux-pro", label: "FLUX 1.1 [pro] — máxima qualidade" },
  { value: "sdxl", label: "Stable Diffusion XL" },
  { value: "sd3", label: "Stable Diffusion 3 Medium" },
];
