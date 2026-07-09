# Prompt Studio — Fotografia Editorial IA

Módulo de geração de imagens por IA para SaaS de fotografia editorial, moda e lifestyle. Permite montar
prompts estruturados (personagem, roupas, acessórios, cenário, pose, câmera, lente, iluminação, expressão,
estilo, proporção e nível de realismo) e gerar imagens via **FLUX** ou **Stable Diffusion** (através da
[fal.ai](https://fal.ai)).

## Rodando localmente

```bash
npm install
npm run db:push   # aplica o schema no Postgres (precisa de DATABASE_URL em .env.local)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Banco de dados

Postgres via [Drizzle ORM](https://orm.drizzle.team) + driver serverless da Neon (`@neondatabase/serverless`) —
funciona tanto em desenvolvimento local quanto no ambiente serverless da Vercel (ao contrário de um arquivo
`.json` em disco, que não sobrevive entre invocações lá). Schema em `src/db/schema.ts`, cliente lazy (só
exige `DATABASE_URL` no momento da primeira query, não no boot) em `src/db/client.ts`.

```bash
# configurar DATABASE_URL (ex: gerado pela integração Postgres/Neon da Vercel)
npm run db:generate   # gera migration SQL a partir do schema
npm run db:push       # aplica direto no banco (bom para dev)
npm run db:migrate    # alternativa ao db:push via conexão TCP simples (ver nota abaixo)
npm run db:studio     # abre o Drizzle Studio para inspecionar os dados
```

> **Nota:** em alguns ambientes locais o `drizzle-kit push` trava indefinidamente em "Pulling schema
> from database..." — ele usa o driver websocket da Neon para introspecção, que pode não
> funcionar dependendo da rede. Se isso acontecer, use `npm run db:generate` (não depende de
> conexão) seguido de `npm run db:migrate` (`scripts/migrate.mjs`, conexão TCP simples via `pg`,
> mais confiável).

Tabelas: `ai_providers` (config dos provedores de IA, chaves incluídas), `generations` (histórico + custo/
créditos/tempo, também usada para o cache de prompts idênticos), `favorites` (prompts e cenários favoritados),
`templates` (configurações completas salvas para reaplicar com um clique), `library_modules` +
`library_options` (Biblioteca Universal — cenário, roupas, poses, câmeras, iluminação) e `characters` +
`character_images` (Biblioteca de Personagens; só metadados do Blob ficam no Postgres, nunca a imagem em si).

**Vercel Blob**: as imagens de referência de personagens são enviadas para o Vercel Blob
(`@vercel/blob`), não para o Postgres. É preciso configurar `BLOB_READ_WRITE_TOKEN` em `.env.local`
(gerado automaticamente ao anexar um Blob store ao projeto na Vercel) — sem ele, o upload/substituição/
exclusão de imagens de personagem falha, mas o resto do app funciona normalmente.

## Como funciona

- **Formulário estruturado** (`src/components/PromptStudio.tsx`): cada campo do briefing fotográfico vira
  um token de prompt (`src/types/promptOptions.ts`).
- **Motor de prompt** (`src/lib/promptBuilder.ts`): monta um prompt em linguagem natural (ideal para FLUX)
  ou em formato de tags separadas por vírgula (ideal para SDXL/SD3), conforme o modelo escolhido. O prompt
  gerado é **editável** antes da geração.
- **Guardrails de conteúdo** (`src/lib/safety.ts`): validação client-side e server-side que exige idade
  adulta (18–75), confirmação de uso legítimo (sem conteúdo sexual explícito, sem pessoas reais/deepfake,
  sem menores) e bloqueia termos proibidos em qualquer campo de texto livre. Um prompt negativo de
  segurança é sempre anexado, além dos termos de qualidade padrão.
- **Geração de imagem** (`src/lib/ai-providers/` + `src/app/api/generate/route.ts`): o prompt é enviado à
  API route, que revalida as regras de segurança no servidor e delega a geração para a camada de
  provedores de IA (ver seção abaixo). Nenhuma chave de API circula pelo navegador.

## Biblioteca Universal (Cenários, Roupas, Poses, Câmeras, Iluminação)

Camada adicional (não substitui os campos estruturados já existentes, como "Cenário" ou "Categoria da
roupa") que enriquece o prompt final com detalhes prontos, sem o usuário precisar digitá-los — e que é
**100% editável pela própria interface**, sem tocar em código.

- Cada biblioteca (`scenario`, `clothing`, `pose`, `camera`, `lighting`) é um conjunto de **módulos**
  (categorias, ex: "Praia") contendo **itens** (opções, ex: "Água cristalina"). Tipos em
  `src/types/library.ts`.
- Tudo é persistido em Postgres (`library_modules` + `library_options`, `src/lib/libraries.ts`) e servido
  por `/api/libraries` (+ `/api/libraries/modules/*` e `/api/libraries/options/*` para CRUD, duplicar e
  reordenar). Nenhuma das 5 bibliotecas tem lógica própria no código — a mesma UI genérica
  (`src/components/library/LibraryModules.tsx`) e o mesmo motor de enriquecimento
  (`src/lib/libraryPrompt.ts`) atendem todas.
- **"+"** em cada card de categoria (ou "+ Novo item" no modo "Gerenciar") abre um modal para cadastrar um
  item novo (`src/components/library/AddOptionModal.tsx`); **"+ Nova categoria"** cria um módulo novo
  (`AddModuleModal.tsx`). Ambos aparecem imediatamente na interface, sem redeploy. O modo "Gerenciar"
  também permite editar, duplicar, ativar/desativar, reordenar e excluir qualquer módulo ou item.
- Ao primeiro acesso de cada biblioteca com o banco vazio, o catálogo padrão é semeado automaticamente
  (`ensureLibrarySeed` em `src/lib/libraries.ts`, dados em `src/data/librarySeed.ts`) — inclui o catálogo
  original de Cenários (Praia, Espelho, Quarto, Academia, Piscina, Casa, Festa) e os novos catálogos de
  Roupas, Poses, Câmeras e Iluminação. Não é um passo manual de setup.
- No Prompt Studio, cada opção selecionada em qualquer uma das 5 bibliotecas entra automaticamente no
  prompt final (`src/lib/promptBuilder.ts`), junto com uma eventual identidade de personagem selecionada
  (ver seção seguinte).

## Biblioteca de Personagens

Aba separada (`/characters`, `src/components/characters/`) para salvar identidades visuais reutilizáveis:
nome, sexo, idade, altura, cor de pele/olhos, formato do rosto, cabelo (cor/comprimento/tipo), tipo físico,
peso, tatuagens, piercings, estilo, observações, nível de consistência (baixa/média/alta/muito alta) e
imagens de referência (`src/lib/characters.ts`, tabelas `characters` + `character_images`).

No Prompt Studio, a seção "Personagem" ganha um seletor opcional "Personagem salvo": ao escolher um
personagem, `src/lib/characterPrompt.ts` soma uma cláusula de identidade + consistência ao prompt final,
mantendo os campos de personagem existentes (idade, gênero, tom de pele etc.) intactos como estavam antes
— selecionar um personagem é aditivo, nunca obrigatório.

## Gerenciador de IA (camada de provedores)

O Prompt Studio nunca fala diretamente com uma API de geração de imagem — ele só produz um prompt +
prompt negativo + resolução. Quem decide qual IA efetivamente gera a imagem é a camada de provedores em
`src/lib/ai-providers/`:

```
Usuário monta o prompt (Prompt Studio)
        ↓
POST /api/generate  (valida segurança no servidor)
        ↓
generateImageWithFailover()  (src/lib/ai-providers/generate.ts)
        ↓
tenta o provedor/modelo preferido → se falhar, tenta o próximo provedor ativo por prioridade
        ↓
adapter.generateImage() do provedor (src/lib/ai-providers/adapters/*)
        ↓
imagem + informações de geração (IA, modelo, tempo, resolução, créditos) voltam para a UI
```

**Provedores já implementados**: Fal.ai, Black Forest Labs, OpenAI (GPT Image), Replicate (inclui Recraft e
Ideogram, hospedados lá), Together AI e Stability AI, além de um adapter **Personalizado** para qualquer
endpoint compatível (contrato documentado em `src/lib/ai-providers/adapters/custom.ts`).

**Para adicionar um novo provedor no futuro**: crie um arquivo em `src/lib/ai-providers/adapters/` que
implemente `ProviderAdapter` (`generateImage` + `testConnection`) e registre-o em
`src/lib/ai-providers/registry.ts` (`PROVIDER_ADAPTERS` + `PROVIDER_KIND_INFO`). Nada mais no sistema
precisa mudar — nem o Prompt Studio, nem a rota `/api/generate`, nem a UI.

**Configuração (chaves de API, endpoints, modelos, prioridade, ativo/inativo)** é feita em
`/admin` ("Gerenciador de IA"), nunca por variável de ambiente ou pelo navegador. As chaves ficam
armazenadas apenas no servidor via `src/lib/ai-providers/store.ts` (arquivo `.data/ai-providers.json`,
ignorado pelo git) e a API só expõe `hasApiKey: boolean` para o frontend — a chave em si nunca é
serializada na resposta.

**Failover**: se o provedor/modelo escolhido pelo usuário falhar, o backend tenta automaticamente os
demais provedores ativos em ordem de prioridade (menor número primeiro), registrando cada tentativa. A
tela de resultado mostra IA usada, modelo, tempo de geração, resolução, créditos (quando o provedor
informa) e, se houve failover, quantos provedores foram tentados antes do sucesso.

**Descoberta automática de modelos**: no card de cada provedor em `/admin`, o botão "Buscar modelos" chama
`adapter.listModels()` (quando o provedor expõe um endpoint de catálogo — OpenAI, Replicate, Together AI e
Stability AI já implementam isso; Fal.ai, Black Forest Labs e provedores personalizados não têm endpoint
público de descoberta, então continuam com cadastro manual). O admin escolhe quais modelos descobertos
aplicar, substituindo a lista atual — assim, quando o provedor lançar um modelo novo, ele aparece na próxima
busca sem precisar editar código.

**Custo por geração**: cada modelo tem um campo opcional "US$/img" (configurável em `/admin`, em branco por
padrão — nenhum valor é assumido/inventado). Quando preenchido, cada geração bem-sucedida grava esse valor
na tabela `generations`; sem ele, o custo aparece como "—" em vez de um número forjado.

**Cache**: antes de gerar, o backend calcula um hash de (prompt, prompt negativo, resolução, provedor,
modelo) e verifica se já existe uma geração idêntica concluída nas últimas 24h — se sim, devolve a mesma
imagem sem chamar o provedor de novo (`src/lib/generations.ts`, `findCachedGeneration`).

## Biblioteca, Favoritos e Templates

- **Biblioteca** (`/library`): grade com todas as imagens geradas, busca por texto do prompt, e por item:
  baixar de novo, abrir no Prompt Studio para editar/duplicar, ou gerar novamente com os mesmos parâmetros
  (inclusive tentando o mesmo provedor/modelo original, com failover se ele não estiver mais disponível).
- **Templates**: salvam a configuração inteira do formulário (`PromptFormState`) com um nome — um clique
  reaplica tudo.
- **Favoritos**: dois tipos independentes — `prompt` (texto do prompt + prompt negativo) e `scenario`
  (seleção de Módulos de Cenários). Ambos vivem no painel "Templates e Favoritos", no topo do Prompt Studio.

## Painel de métricas

Em `/admin/metrics`: total de imagens, custo total estimado, créditos gastos, tempo médio de geração, e um
ranking de IA/modelo mais utilizados — tudo agregado por SQL em `getGenerationStats()`
(`src/lib/generations.ts`).

## Sistema de filas (ainda não implementado)

Pedido, mas propositalmente deixado para depois: hoje cada geração é uma chamada HTTP síncrona dentro da
própria rota `/api/generate` (funciona bem para o volume atual). Uma fila de verdade, com posição/tempo
estimado para dezenas de gerações simultâneas, exige infraestrutura adicional (Redis/BullMQ, Upstash QStash,
Inngest ou similar) — uma decisão de arquitetura própria, separada desta rodada de mudanças.

## Política de conteúdo

Esta ferramenta é destinada exclusivamente a fotografia comercial/editorial de **adultos fictícios**
(moda, catálogo, lifestyle, publicidade). Não deve ser usada para gerar conteúdo sexual explícito, imagens
de menores, ou deepfakes de pessoas reais identificáveis — essas restrições são reforçadas por validação
no formulário e na API, além do filtro de segurança nativo do provedor de geração (`enable_safety_checker`).
