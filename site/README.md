# Landing page — Beyblade Arena

App Next.js independente do jogo. Todo o código, componentes, imagens e configuração de publicação da landing ficam neste diretório.

## Desenvolvimento

Requer Node.js >= 24.11. Execute dentro de `site/`:

```sh
npm ci
npm run dev
```

A página abre em http://localhost:5000. Para gerar a versão estática, execute `npm run build`; os arquivos saem em `out/` (não versionada).

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
