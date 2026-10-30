# Assets e referência visual

Os quatro retratos foram reconstruídos a partir das capturas do Figma fornecidas pelo usuário. **Não são exports originais do Figma nem reproduções pixel a pixel.** Os personagens preservam os elementos pedidos: macaco com óculos e jaqueta verde; macaco cinza com chapéu e moletom roxo; gorila com blazer creme; macaco dourado com fones verdes.

## Arquivos

Originais PNG: `assets/originals/emerald.png`, `sage.png`, `ivory.png`, `golden.png`. Versões utilizadas: `public/art/{emerald,sage,ivory,golden}.webp` (640 px) e `*-small.webp` (320 px). `node scripts/optimize-assets.mjs` reproduz somente o redimensionamento e a codificação WebP com Sharp; os PNGs são preservados.

## Prompt de geração

Referência: captura enviada pelo usuário, `2-Foto-2.jpg`. Uma geração por personagem, com o seguinte template:

> Use case: identity-preserve. Input is a screenshot reference of NFT marketplace artwork. Reconstruct ONLY [subject]. Produce one square 1024x1024 clean standalone NFT portrait asset with no interface, text, labels, borders or other characters. Match the exact character identity, face proportions, clothing, pose and premium softly-lit 3D illustration style visible in the reference. Head and upper torso, looking slightly right, fills the square, as in reference. Do not redesign or turn into a flat cartoon. Remove all surrounding screenshot UI.

Subjects: brown chimp with cream round green sunglasses, emerald varsity jacket with cream sleeves and gold pendant, pale cream background; grey chimp with sage bucket hat and purple hoodie, pale cream background; dark gorilla with black hair, cream blazer and dark green turtleneck, mint background; orange chimp with green headphones and cream shirt, pale cream background.

## Ajustes e limites

A composição usa fundo marrom, ocre, fonte monoespaçada, hero com retrato, filtros laterais no desktop e recolhíveis no mobile, cartões em duas colunas e navegação inferior. Labels, foco e controles foram ampliados para legibilidade. Os nove nomes e preços iniciais seguem os prints mais recentes. Os demais NFTs e as contagens de categorias/redes pertencem às fixtures funcionais; não reproduzem números decorativos sem dados correspondentes. Os SVGs da versão inicial permanecem no histórico de trabalho, mas os NFTs usam WebP.

Fonte local Roboto Mono, com licença em `public/fonts/`. Ícones Lucide. A inspeção de todos os frames e a exportação dos assets originais continuam dependendo de acesso ao arquivo Figma. As baselines Playwright verificam regressões da implementação, não comprovam equivalência ao design.
