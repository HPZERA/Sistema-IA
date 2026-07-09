import { LibraryKey } from "@/types/library";

// Default catalog for every library, inserted once per `libraryKey` the first time it's queried
// with zero rows in the DB (see `ensureLibrarySeed` in src/lib/libraries.ts). This is the only
// place default modules/options are hardcoded — from here on, everything is managed through the
// "+" buttons in the UI and lives in Postgres (library_modules / library_options).

export interface LibrarySeedOption {
  label: string;
  keywords: string;
  description?: string;
}

export interface LibrarySeedModule {
  name: string;
  icon: string;
  category: string;
  complementaryPrompt: string;
  options: LibrarySeedOption[];
}

// "scenario" content is copied verbatim from the original src/data/scenarioModules.ts so the
// existing catalog (Praia, Espelho, Quarto, Academia, Piscina, Casa, Festa) keeps working exactly
// as before, just DB-backed now instead of hardcoded.
const SCENARIO_SEED: LibrarySeedModule[] = [
  {
    name: "Praia",
    icon: "🏖️",
    category: "Externo",
    complementaryPrompt: "tropical beach lifestyle photography atmosphere",
    options: [
      { label: "Areia branca", keywords: "white sand" },
      { label: "Água cristalina", keywords: "crystal clear water" },
      { label: "Mar azul-turquesa", keywords: "turquoise blue sea" },
      { label: "Ondas suaves", keywords: "gentle waves" },
      { label: "Coqueiros", keywords: "coconut palm trees" },
      { label: "Vegetação tropical", keywords: "tropical vegetation" },
      { label: "Pedras naturais", keywords: "natural rock formations" },
      { label: "Montanhas", keywords: "mountains in the background" },
      { label: "Resort de luxo", keywords: "luxury beach resort" },
      { label: "Praia deserta", keywords: "secluded empty beach" },
      { label: "Pôr do sol", keywords: "sunset sky" },
      { label: "Sol de verão", keywords: "bright summer sun" },
      { label: "Céu limpo", keywords: "clear blue sky" },
      { label: "Guarda-sol", keywords: "beach umbrella" },
      { label: "Espreguiçadeiras", keywords: "beach lounge chairs" },
      { label: "Caminhando na areia", keywords: "walking on the sand" },
      { label: "Caminhando na água", keywords: "walking through the water" },
      { label: "Sentada na areia", keywords: "sitting on the sand" },
      { label: "Saindo do mar", keywords: "emerging from the sea" },
    ],
  },
  {
    name: "Espelho",
    icon: "🪞",
    category: "Interno",
    complementaryPrompt: "mirror selfie photography style",
    options: [
      { label: "Espelho de corpo inteiro", keywords: "full-length mirror" },
      { label: "Espelho de banheiro", keywords: "bathroom mirror" },
      { label: "Espelho de quarto", keywords: "bedroom mirror" },
      { label: "Espelho de closet", keywords: "closet mirror" },
      { label: "Selfie", keywords: "mirror selfie" },
      { label: "Celular na mão", keywords: "holding a phone in hand" },
      { label: "Flash ligado", keywords: "camera flash reflection visible" },
      { label: "Luz natural", keywords: "natural light" },
      { label: "Reflexo realista", keywords: "realistic mirror reflection" },
      { label: "Quarto moderno", keywords: "modern bedroom" },
      { label: "Banheiro moderno", keywords: "modern bathroom" },
      { label: "Closet de luxo", keywords: "luxury walk-in closet" },
    ],
  },
  {
    name: "Quarto",
    icon: "🛏️",
    category: "Interno",
    complementaryPrompt: "cozy bedroom atmosphere",
    options: [
      { label: "Quarto moderno", keywords: "modern bedroom" },
      { label: "Quarto de hotel", keywords: "hotel room" },
      { label: "Cama", keywords: "bed" },
      { label: "Cabeceira", keywords: "headboard" },
      { label: "Cortinas", keywords: "curtains" },
      { label: "Janela", keywords: "window" },
      { label: "Abajur", keywords: "bedside lamp" },
      { label: "Decoração minimalista", keywords: "minimalist decor" },
      { label: "Iluminação natural", keywords: "natural lighting" },
      { label: "Sentada na cama", keywords: "sitting on the bed" },
      { label: "Em pé", keywords: "standing" },
      { label: "Ao lado da janela", keywords: "standing next to the window" },
    ],
  },
  {
    name: "Academia",
    icon: "🏋️",
    category: "Fitness",
    complementaryPrompt: "modern gym atmosphere",
    options: [
      { label: "Academia premium", keywords: "premium gym" },
      { label: "Halteres", keywords: "dumbbells" },
      { label: "Equipamentos", keywords: "gym equipment" },
      { label: "Espelho", keywords: "gym mirror" },
      { label: "Área de musculação", keywords: "weightlifting area" },
      { label: "Esteira", keywords: "treadmill" },
      { label: "Peso livre", keywords: "free weights" },
      { label: "Ambiente fitness", keywords: "fitness environment" },
      { label: "Iluminação interna", keywords: "indoor gym lighting" },
      { label: "Lifestyle fitness", keywords: "fitness lifestyle photography" },
    ],
  },
  {
    name: "Piscina",
    icon: "🏊",
    category: "Externo",
    complementaryPrompt: "resort poolside atmosphere",
    options: [
      { label: "Piscina", keywords: "swimming pool" },
      { label: "Piscina de resort", keywords: "resort pool" },
      { label: "Borda infinita", keywords: "infinity edge" },
      { label: "Deck", keywords: "pool deck" },
      { label: "Hotel", keywords: "hotel poolside" },
      { label: "Água azul", keywords: "blue pool water" },
      { label: "Reflexos", keywords: "water reflections" },
      { label: "Espreguiçadeiras", keywords: "pool lounge chairs" },
      { label: "Sol", keywords: "bright sunlight" },
      { label: "Fundo tropical", keywords: "tropical background" },
    ],
  },
  {
    name: "Festa",
    icon: "🎉",
    category: "Vida noturna",
    complementaryPrompt: "nightlife party atmosphere",
    options: [
      { label: "Festa", keywords: "party" },
      { label: "Rooftop", keywords: "rooftop venue" },
      { label: "Balada", keywords: "nightclub" },
      { label: "Restaurante", keywords: "restaurant" },
      { label: "Bar", keywords: "bar" },
      { label: "Luzes noturnas", keywords: "night lights" },
      { label: "Flash", keywords: "camera flash lighting" },
      { label: "Pessoas desfocadas", keywords: "blurred people in background" },
      { label: "Ambiente sofisticado", keywords: "sophisticated upscale atmosphere" },
    ],
  },
  {
    name: "Casa",
    icon: "🏠",
    category: "Interno",
    complementaryPrompt: "modern home lifestyle atmosphere",
    options: [
      { label: "Sala moderna", keywords: "modern living room" },
      { label: "Sofá", keywords: "sofa" },
      { label: "Cozinha", keywords: "kitchen" },
      { label: "Mesa", keywords: "table" },
      { label: "Janela", keywords: "window" },
      { label: "Apartamento moderno", keywords: "modern apartment" },
      { label: "Casa de luxo", keywords: "luxury house" },
      { label: "Varanda", keywords: "balcony" },
      { label: "TV", keywords: "television" },
      { label: "Decoração contemporânea", keywords: "contemporary decor" },
    ],
  },
];

const CLOTHING_SEED: LibrarySeedModule[] = [
  {
    name: "Biquínis",
    icon: "👙",
    category: "Praia",
    complementaryPrompt: "wearing a bikini",
    options: [
      { label: "Cortininha", keywords: "cortininha-style tie-side bikini" },
      { label: "Asa-delta", keywords: "asymmetrical asa-delta bikini top" },
      { label: "Cintura alta", keywords: "high-waisted bikini bottom" },
      { label: "Esportivo", keywords: "sporty athletic bikini" },
      { label: "Luxo", keywords: "luxury designer bikini" },
      { label: "Branco", keywords: "white bikini" },
      { label: "Preto", keywords: "black bikini" },
      { label: "Verde", keywords: "green bikini" },
      { label: "Vermelho", keywords: "red bikini" },
      { label: "Azul", keywords: "blue bikini" },
      { label: "Rosa", keywords: "pink bikini" },
    ],
  },
  {
    name: "Maiô",
    icon: "🩱",
    category: "Praia",
    complementaryPrompt: "wearing a one-piece swimsuit",
    options: [
      { label: "Cavado", keywords: "high-cut one-piece swimsuit" },
      { label: "Tradicional", keywords: "classic one-piece swimsuit" },
      { label: "Manga longa", keywords: "long-sleeve one-piece swimsuit" },
    ],
  },
  {
    name: "Camisola",
    icon: "👘",
    category: "Íntimo",
    complementaryPrompt: "wearing a nightgown",
    options: [
      { label: "Seda", keywords: "silk nightgown" },
      { label: "Cetim", keywords: "satin nightgown" },
      { label: "Algodão", keywords: "cotton nightgown" },
      { label: "Curta", keywords: "short nightgown" },
      { label: "Longa", keywords: "long nightgown" },
    ],
  },
  {
    name: "Roupas Casuais",
    icon: "👕",
    category: "Casual",
    complementaryPrompt: "wearing casual everyday clothing",
    options: [
      { label: "Camiseta", keywords: "t-shirt" },
      { label: "Cropped", keywords: "cropped top" },
      { label: "Regata", keywords: "tank top" },
      { label: "Blazer", keywords: "blazer" },
      { label: "Jaqueta", keywords: "jacket" },
      { label: "Moletom", keywords: "sweatshirt" },
    ],
  },
  {
    name: "Parte de Baixo",
    icon: "👖",
    category: "Casual",
    complementaryPrompt: "wearing",
    options: [
      { label: "Short jeans", keywords: "denim shorts" },
      { label: "Short curto", keywords: "short shorts" },
      { label: "Saia", keywords: "skirt" },
      { label: "Calça jeans", keywords: "jeans" },
      { label: "Calça social", keywords: "tailored dress pants" },
      { label: "Legging", keywords: "leggings" },
    ],
  },
  {
    name: "Calçados",
    icon: "👟",
    category: "Acessórios",
    complementaryPrompt: "wearing",
    options: [
      { label: "Tênis", keywords: "sneakers" },
      { label: "Salto alto", keywords: "high heels" },
      { label: "Sandália", keywords: "sandals" },
      { label: "Chinelo", keywords: "flip-flops" },
      { label: "Bota", keywords: "boots" },
      { label: "Bota de cano longo", keywords: "knee-high boots" },
    ],
  },
  {
    name: "Acessórios",
    icon: "👜",
    category: "Acessórios",
    complementaryPrompt: "accessorized with",
    options: [
      { label: "Óculos escuros", keywords: "sunglasses" },
      { label: "Boné", keywords: "baseball cap" },
      { label: "Chapéu", keywords: "hat" },
      { label: "Bolsa", keywords: "handbag" },
      { label: "Mochila", keywords: "backpack" },
      { label: "Relógio", keywords: "wristwatch" },
      { label: "Colares", keywords: "necklaces" },
      { label: "Brincos", keywords: "earrings" },
      { label: "Pulseiras", keywords: "bracelets" },
    ],
  },
];

const POSE_SEED: LibrarySeedModule[] = [
  {
    name: "Poses",
    icon: "🧍",
    category: "Geral",
    complementaryPrompt: "",
    options: [
      { label: "Em pé", keywords: "standing" },
      { label: "Caminhando", keywords: "walking" },
      { label: "Sentada", keywords: "sitting" },
      { label: "Ajoelhada", keywords: "kneeling" },
      { label: "Cruzando as pernas", keywords: "crossing legs" },
      { label: "Encostada na parede", keywords: "leaning against the wall" },
      { label: "De costas", keywords: "facing away from camera, back to the camera" },
      { label: "Olhando para trás", keywords: "looking back over the shoulder" },
      { label: "Segurando o celular", keywords: "holding a phone" },
      { label: "Selfie", keywords: "taking a selfie" },
      { label: "Correndo", keywords: "running" },
      { label: "Sentada na cama", keywords: "sitting on the bed" },
      { label: "Sentada no sofá", keywords: "sitting on the sofa" },
      { label: "Sentada na areia", keywords: "sitting on the sand" },
      { label: "Dentro da piscina", keywords: "inside the swimming pool" },
    ],
  },
];

const CAMERA_SEED: LibrarySeedModule[] = [
  {
    name: "Câmeras",
    icon: "📷",
    category: "Geral",
    complementaryPrompt: "",
    options: [
      { label: "Selfie", keywords: "selfie shot" },
      { label: "Selfie no espelho", keywords: "mirror selfie shot" },
      { label: "DSLR", keywords: "shot on a professional DSLR camera" },
      { label: "Celular", keywords: "shot on a smartphone camera" },
      { label: "Drone", keywords: "aerial drone shot" },
      { label: "Vista superior", keywords: "top-down view" },
      { label: "Vista inferior", keywords: "low-angle view from below" },
      { label: "35mm", keywords: "35mm lens" },
      { label: "50mm", keywords: "50mm lens" },
      { label: "85mm", keywords: "85mm lens" },
      { label: "Grande angular", keywords: "wide-angle lens" },
    ],
  },
];

const LIGHTING_SEED: LibrarySeedModule[] = [
  {
    name: "Iluminação",
    icon: "💡",
    category: "Geral",
    complementaryPrompt: "",
    options: [
      { label: "Golden Hour", keywords: "warm golden hour sunlight" },
      { label: "Luz natural", keywords: "natural light" },
      { label: "Luz da janela", keywords: "window light" },
      { label: "Flash", keywords: "camera flash lighting" },
      { label: "Luz ambiente", keywords: "warm ambient light" },
      { label: "Luz de estúdio", keywords: "studio lighting" },
      { label: "Contraluz", keywords: "backlight, dramatic rim light" },
      { label: "Céu nublado", keywords: "diffused light from an overcast sky" },
      { label: "Pôr do sol", keywords: "sunset light" },
      { label: "Nascer do sol", keywords: "sunrise light" },
    ],
  },
];

export const LIBRARY_SEED: Record<LibraryKey, LibrarySeedModule[]> = {
  scenario: SCENARIO_SEED,
  clothing: CLOTHING_SEED,
  pose: POSE_SEED,
  camera: CAMERA_SEED,
  lighting: LIGHTING_SEED,
};
