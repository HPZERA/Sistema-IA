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

// `hidesFace: true` marks framings where the face must not be visible at all — selecting one of
// these auto-enriches the final prompt with the anonymity clauses from src/lib/faceVisibility.ts.
export type FaceVisibilityOption = Option & { hidesFace: boolean };

export const FACE_VISIBILITY_OPTIONS: FaceVisibilityOption[] = [
  { value: "face clearly visible, natural and unobstructed", label: "Rosto visível", hidesFace: false },
  { value: "face partially visible, naturally obstructed by hair, angle or object", label: "Rosto parcialmente visível", hidesFace: false },
  { value: "face fully covered by hair, no facial features visible", label: "Rosto coberto pelo cabelo", hidesFace: true },
  { value: "mirror selfie with the phone completely covering the face", label: "Rosto coberto pelo celular", hidesFace: true },
  { value: "photographed exclusively from behind, back to camera, face not visible", label: "Foto de costas", hidesFace: true },
  { value: "side framing with the face turned away or hidden by hair, face not visible", label: "Foto de lado sem mostrar o rosto", hidesFace: true },
  { value: "framing deliberately excludes the face from the shot", label: "Enquadramento sem rosto", hidesFace: true },
  { value: "body-only framing, head and face outside the frame", label: "Somente corpo", hidesFace: true },
  { value: "close-up of hands only, no body or face visible", label: "Somente mãos", hidesFace: true },
  { value: "close-up of legs only, no body or face visible", label: "Somente pernas", hidesFace: true },
  { value: "framing from the knees down only, no head, torso or face visible", label: "Do joelho para baixo", hidesFace: true },
  { value: "anonymous silhouette, face not visible", label: "Silhueta sem rosto", hidesFace: true },
  { value: "face positioned entirely outside the frame boundary", label: "Rosto fora do enquadramento", hidesFace: true },
];

export const FACE_CONCEALMENT_STRENGTH_OPTIONS: Option[] = [
  { value: "normal", label: "Normal" },
  { value: "strong", label: "Forte" },
  { value: "absolute", label: "Absoluta" },
];

export const FACE_SHAPE_OPTIONS: Option[] = [
  { value: "oval face shape", label: "Oval" },
  { value: "round face shape", label: "Redondo" },
  { value: "square face shape with a defined jawline", label: "Quadrado" },
  { value: "heart-shaped face with a narrow chin", label: "Coração" },
  { value: "diamond-shaped face with high cheekbones", label: "Diamante" },
  { value: "elongated oblong face shape", label: "Alongado" },
  { value: "soft rounded heart-shaped face", label: "Coração suave" },
];

export const LIPS_OPTIONS: Option[] = [
  { value: "natural thin lips", label: "Naturais finos" },
  { value: "natural medium-full lips", label: "Naturais médios" },
  { value: "natural full lips", label: "Naturais cheios" },
  { value: "lips with a subtle filler look, slightly plumped", label: "Preenchimento sutil" },
  { value: "voluminous lips with an evident filler look", label: "Preenchimento evidente" },
];

export const NOSE_OPTIONS: Option[] = [
  { value: "straight refined nose", label: "Reto" },
  { value: "small button nose", label: "Arrebitado" },
  { value: "aquiline nose with a defined bridge", label: "Aquilino" },
  { value: "narrow slender nose", label: "Fino" },
  { value: "wide nose with rounded tip", label: "Largo" },
  { value: "slightly upturned nose", label: "Levemente arrebitado" },
];

export const EARRING_OPTIONS: Option[] = [
  { value: "no earrings", label: "Sem brincos" },
  { value: "small delicate stud earrings", label: "Pontos pequenos" },
  { value: "thin gold hoop earrings", label: "Argolas finas" },
  { value: "large statement hoop earrings", label: "Argolas grandes" },
  { value: "elegant dangling drop earrings", label: "Pendentes" },
  { value: "classic pearl earrings", label: "Pérolas" },
  { value: "diamond stud earrings", label: "Brilhantes" },
];

// Enquadramento Anônimo — anonymous/faceless composition module. Values are English tokens;
// selecting any of these framings pairs with the automatic anonymity clauses in
// src/lib/anonymousFraming.ts (which reuses the FACE_ANONYMITY_* constants from faceVisibility.ts).
export const ANONYMOUS_FRAMING_TYPE_OPTIONS: Option[] = [
  { value: "photographed from behind, back to camera, face not visible", label: "Foto de costas" },
  { value: "side framing with the face turned away, face not visible", label: "Foto lateral sem rosto" },
  { value: "full body shot, face excluded from the frame", label: "Corpo inteiro sem rosto" },
  { value: "framing from the neck down, head and face not visible", label: "Do pescoço para baixo" },
  { value: "framing from the shoulders down, head and face not visible", label: "Do ombro para baixo" },
  { value: "framing from the chest down, head and face not visible", label: "Do peito para baixo" },
  { value: "framing from the waist down, head and face not visible", label: "Da cintura para baixo" },
  { value: "framing from the knees down only, head and face not visible", label: "Do joelho para baixo" },
  { value: "close-up of legs only, no head, torso or face visible", label: "Apenas pernas" },
  { value: "close-up of feet only, no head, torso or face visible", label: "Apenas pés" },
  { value: "close-up of a single arm only, no face visible", label: "Apenas braço" },
  { value: "close-up of a hand only, no face visible", label: "Apenas mão" },
  { value: "close-up of both hands only, no face visible", label: "Apenas mãos" },
  { value: "close-up of a hand holding an object, no face visible", label: "Mão segurando objeto" },
  { value: "close-up of an arm and hand, no face visible", label: "Braço e mão" },
  { value: "close-up of an arm and hand holding an object, no face visible", label: "Braço e mão segurando objeto" },
  { value: "close-up of arm, wrist and hand, no face visible", label: "Braço, pulso e mão" },
  { value: "close-up of a hand with painted nails, no face visible", label: "Mão com unhas pintadas" },
  { value: "close-up of a hand with a wristwatch, no face visible", label: "Mão com relógio" },
  { value: "close-up of a hand with bracelets, no face visible", label: "Mão com pulseiras" },
  { value: "close-up of a hand with rings, no face visible", label: "Mão com anéis" },
  { value: "close-up of feet in the sand, no head, torso or face visible", label: "Pés na areia" },
  { value: "silhouette shot, face not visible", label: "Silhueta sem rosto" },
  { value: "mirror selfie with the phone completely covering the face", label: "Selfie no espelho com rosto coberto" },
  { value: "person inside a car, framed so the face is not visible", label: "Pessoa dentro do carro sem mostrar rosto" },
];

export const ANONYMOUS_FOCUS_OBJECT_OPTIONS: Option[] = [
  { value: "glass", label: "Copo" },
  { value: "wine glass", label: "Taça" },
  { value: "cocktail drink", label: "Drink" },
  { value: "glass of draft beer", label: "Chope" },
  { value: "glass of beer", label: "Cerveja" },
  { value: "cup of coffee", label: "Café" },
  { value: "smartphone", label: "Celular" },
  { value: "handbag", label: "Bolsa" },
  { value: "car key", label: "Chave de carro" },
  { value: "Porsche car key", label: "Chave de Porsche" },
  { value: "car steering wheel", label: "Volante" },
  { value: "credit card", label: "Cartão" },
  { value: "Porsche sports car", label: "Porsche" },
  { value: "luxury car", label: "Carro de luxo" },
  { value: "wristwatch", label: "Relógio" },
  { value: "fine jewelry", label: "Joias" },
  { value: "sunglasses", label: "Óculos" },
  { value: "perfume bottle", label: "Perfume" },
  { value: "flower", label: "Flor" },
  { value: "travel suitcase", label: "Mala de viagem" },
];

export const ANONYMOUS_ENVIRONMENT_OPTIONS: Option[] = [
  { value: "beach", label: "Praia" },
  { value: "swimming pool", label: "Piscina" },
  { value: "bar", label: "Bar" },
  { value: "party", label: "Festa" },
  { value: "restaurant", label: "Restaurante" },
  { value: "bedroom", label: "Quarto" },
  { value: "bathroom", label: "Banheiro" },
  { value: "in front of a large mirror", label: "Espelho" },
  { value: "inside a car", label: "Carro" },
  { value: "inside a Porsche", label: "Porsche" },
  { value: "behind the wheel of a Porsche", label: "Volante de Porsche" },
  { value: "luxury car in the background", label: "Carro de luxo ao fundo" },
  { value: "on a private yacht", label: "Yacht" },
  { value: "hotel", label: "Hotel" },
  { value: "luxury resort", label: "Resort" },
  { value: "gym", label: "Academia" },
  { value: "living room", label: "Sala" },
  { value: "sofa", label: "Sofá" },
  { value: "balcony", label: "Varanda" },
  { value: "street", label: "Rua" },
  { value: "park", label: "Parque" },
];

export const ANONYMOUS_PERSON_OPTIONS: Option[] = [
  { value: "adult woman", label: "Mulher adulta" },
  { value: "adult man", label: "Homem adulto" },
  { value: "adult couple", label: "Casal adulto" },
  { value: "adult group of people", label: "Grupo adulto" },
];

// Hand/arm micro-details — additive to whichever "Tipo de enquadramento" is selected, only ever
// contributed to the prompt when explicitly chosen (src/lib/anonymousFraming.ts).
export const ANONYMOUS_HAND_DETAIL_OPTIONS: Option[] = [
  { value: "painted nails", label: "Unhas pintadas" },
  { value: "natural nails", label: "Unhas naturais" },
  { value: "wristwatch", label: "Relógio" },
  { value: "bracelets", label: "Pulseiras" },
  { value: "rings", label: "Anéis" },
  { value: "tanned skin", label: "Pele bronzeada" },
  { value: "fair skin", label: "Pele clara" },
  { value: "small skin marks", label: "Pequenas marcas na pele" },
  { value: "subtle veins", label: "Veias sutis" },
  { value: "realistic skin texture", label: "Textura realista" },
  { value: "natural light on skin", label: "Luz natural na pele" },
];

// Lighting presets exclusive to the Enquadramento Anônimo page (src/lib/anonymousFraming.ts) —
// candid/lifestyle wording distinct from the editorial STYLE/LIGHTING_OPTIONS above.
export const ANONYMOUS_LIGHTING_OPTIONS: Option[] = [
  { value: "soft natural daylight", label: "Luz natural" },
  { value: "warm golden hour sunlight", label: "Golden hour" },
  { value: "direct on-camera flash lighting", label: "Flash" },
  { value: "moody bar lighting", label: "Luz de bar" },
  { value: "low-light nighttime ambiance", label: "Luz noturna" },
  { value: "soft natural window light", label: "Luz de janela" },
];

// Camera/lens descriptors exclusive to the Enquadramento Anônimo page — mixes device, focal
// length and framing terms since candid anonymous shots are described that way in practice.
export const ANONYMOUS_CAMERA_OPTIONS: Option[] = [
  { value: "shot on smartphone", label: "Smartphone" },
  { value: "shot on DSLR camera", label: "DSLR" },
  { value: "50mm lens", label: "50mm" },
  { value: "85mm lens", label: "85mm" },
  { value: "close-up framing", label: "Close-up" },
  { value: "macro framing", label: "Macro" },
  { value: "shallow depth of field", label: "Profundidade de campo" },
];

export const MODEL_PROVIDER_OPTIONS: Option[] = [
  { value: "flux-dev", label: "FLUX.1 [dev] — alta qualidade" },
  { value: "flux-schnell", label: "FLUX.1 [schnell] — rápido" },
  { value: "flux-pro", label: "FLUX 1.1 [pro] — máxima qualidade" },
  { value: "sdxl", label: "Stable Diffusion XL" },
  { value: "sd3", label: "Stable Diffusion 3 Medium" },
];
