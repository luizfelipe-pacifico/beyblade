# Landing page — Beyblade Arena

App Next.js independente do jogo. Todo o código, componentes, imagens e configuração de publicação da landing ficam neste diretório.

## Desenvolvimento

Requer Node.js >= 24.11. Execute dentro de `site/`:

```sh
npm ci
npm run dev
```

A página abre em http://localhost:3000 (a porta 5000 é do jogo). Para gerar a versão estática, execute `npm run build`; os arquivos saem em `out/` (não versionada).

## Vercel

- Root Directory: `site`
- Framework Preset: Next.js
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `out`

Não precisa de banco de dados nem de variáveis de ambiente para o build. `NEXT_PUBLIC_SITE_URL` é opcional para definir o domínio das prévias de compartilhamento; na Vercel, o domínio de produção é detectado automaticamente.

As rotas são `/`, `/creditos/`, `/privacidade/` e `/termos/`. A página usa `noindex` nos metadados e nos cabeçalhos definidos em `vercel.json`.

## Conteúdo e imagens

Textos e links compartilhados ficam em `app/site.js`. O download aponta para `BeybladeArena-Setup.exe` na última GitHub Release; depende de o instalador ter sido publicado.

As imagens otimizadas em `public/images/` são versionadas e o build não depende do download dos originais. `images.json` registra as fontes e `npm run images` regenera os WebP usando o cache local. Os créditos aparecem em `/creditos/`. As imagens do anime pertencem aos respectivos titulares; o projeto é de fã, sem fins lucrativos.

## Design system

Jogo e landing compartilham a identidade documentada em `../docs/DESIGN_SYSTEM.md`: Dela Gothic One + Barlow, tinta azul profunda, superfícies azuis e amarelo de ação na proporção de referência 60/30/10. As cores das feras ficam no conteúdo dos personagens.

A fonte única dos tokens é `../design-system/tokens.json`. Na raiz do repositório, `node scripts/sync-design-tokens.js` atualiza `app/tokens.css`, que é versionado para permitir o build independente desta pasta. Não edite esse CSS gerado à mão.

Entradas na rolagem usam IntersectionObserver e keyframes CSS, uma vez por bloco. O conteúdo aparece mesmo sem JavaScript, e o modo de movimento reduzido desativa as animações. Perguntas usam `details`/`summary` nativos.

### Hero e ilustrações animadas

No celular, a ilustração aparece logo após o título, antes da descrição. O menu nativo permite saltar às seções e fecha com Escape ou ao sair com Tab. Personagens exibem retrato e vetor da beyblade; as quatro artes estão em `public/beyblades/`.

O fluxo da partida usa abas operáveis por setas e Home/End. O guia de comandos alterna entre DualShock 4 e teclado, seguindo `../docs/CONTROLLERS.md`. São prévias de funcionalidades planejadas. O roadmap mostra a etapa atual e expande as seguintes; a área de download explica que o instalador depende da primeira release. Créditos, termos e privacidade compartilham navegação e link para pular ao conteúdo.

A hero usa a Dragoon S real vetorizada de fotografia, com versões WebP responsivas de 480/960/1440px. `HeroBey.jsx` liga três voltas da bey ao progresso da rolagem da hero, com eventos passivos e no máximo uma atualização por frame. A rolagem não é presa; sem rolar, não há um loop de animação. Fora da tela, com a aba oculta ou com movimento reduzido, o efeito não processa frames.

`BattleLoop.jsx` mostra Dragoon S × Dranzer S em WebP animado (1152 × 648, 48 quadros, cerca de 1,3 MiB), com botão de pausa e poster estático. A animação só carrega quando entra na tela e o visitante permite movimento. Ela aparece na seção de controles e na etapa Batalha. É uma ilustração do conceito, não uma captura de gameplay.

Execute `npm run bey:assets` dentro de `site/` para traçar as fotografias versionadas em `assets/beyblades/` e gerar SVGs reais em curvas, máscaras vetoriais de transparência e as versões WebP. As matrizes não encapsulam fotos em SVG. Os detalhes são limitados pela referência; não há ampliação com detalhes inventados. `sources.json` registra origem e checksum de cada fotografia, e `/creditos/` identifica as fontes.

Depois, `npm run motion:assets` regenera o loop e o poster a partir das matrizes em `public/beyblades/`. O gerador lê as cores de `app/tokens.css` e rasteriza cada matriz uma única vez; não depende do catálogo fora desta pasta. Os arquivos gerados são versionados para a publicação continuar independente. A dependência VTracer é usada somente na geração, sem adicionar código ao navegador ou ao build estático.
