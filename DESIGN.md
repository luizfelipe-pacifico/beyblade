# Design — Beyblade Arena

Mundo visual: **"Abertura do Anime"** (D-022). Toda tela do jogo é um quadro da abertura de Bakuten Shoot: a cor da fera bit do personagem toma o campo inteiro, com linhas de velocidade de borda dura, nome em cartela de título e VS amarelo inclinado. Base em tinta azul profunda (60%), superfícies de apoio (30%) e amarelo de chamada (10%), conforme D-018.

Este arquivo só aponta para as fontes; não copie valores para cá.

- Contrato completo, componentes e cuidados: [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
- Tokens (fonte única): [`design-system/tokens.json`](design-system/tokens.json), gerados para `src/design/tokens.css` e `site/app/tokens.css`
- Galeria viva: `/design-system` (`app/design-system/page.js`)
- Arte própria: [`docs/ART.md`](docs/ART.md)

Regras que nunca mudam: cantos retos; Dela Gothic One só em cartela, VS e anúncios; Barlow no resto com números tabulares; nada de desfoque, brilho, sombra em repouso ou degradê esmaecido (o jogo precisa rodar em GPU integrada); só `transform` e `opacity` animam; foco amarelo de 4px é o cursor do controle; texto ≥4,5:1 e texto grande ≥3:1.
