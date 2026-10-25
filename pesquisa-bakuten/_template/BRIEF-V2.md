# Brief comum: fase 2 da pesquisa (padronização, peças, lançadores, feras bit)

Repositório: `C:\Users\luizf\Projects\beyblade-gaming\beyblade`. Jogo de Beyblade baseado em **Bakuten Shoot Beyblade** (2001–2003).

## Leia antes de começar
- `CLAUDE.md` e `docs/DECISIONS.md` (principalmente D-005 a D-010)
- `docs/BEYBLADES.md` (schemas de peça, bey, lançador e fera bit: **siga à risca**)
- `docs/ART.md` (padrão visual) e `docs/AUDIO.md` (sons)
- `pesquisa-bakuten/README.md` e os `README.md`/`dados.json` das beys relevantes em `pesquisa-bakuten/personagens/`

## Regras
- Textos (README, descrições) em **português (PT-BR)**; nomes de peças e ataques no original. Código, ids de grupos SVG e nomes de arquivos de código em inglês.
- Escreva **só** nos arquivos/pastas do seu escopo (dito no seu pedido). Outra sessão está mexendo em `package.json`, `server.js`, `src/db.js`, `prisma/` e `docs/`: não toque neles. **Não faça commit.**
- Fontes de texto: API da Beyblade Wiki funciona com curl (`https://beyblade.fandom.com/api.php?action=parse&page=<Página>&prop=wikitext&format=json&formatversion=2`), além de WebSearch/WebFetch (worldbeyblade.org tem pesos e medidas de peças).
- **Não baixe imagens** de `static.wikia.nocookie.net`: o CDN responde com desafio anti-bot e **não é permitido contorná-lo** (headers falsos, Referer etc.). Fotos de referência só podem vir de arquivos que **já existem** no repositório (copie, não mova).
- Não invente fatos. Todo número tem `fonte`: `oficial` | `wiki` | `comunidade` | `medido` | `estimado`. Estimativas devem ser coerentes entre si (ex.: a soma dos pesos das peças ≈ peso total conhecido da bey; diâmetros típicos de beys plásticas ficam em ~40–50 mm, altura total ~25–35 mm).
- Node 24 disponível (`node -e`, scripts .js/.mjs no scratchpad). Sem Python. Não instale pacotes.
- JSON: valide todos com `node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" <arquivo>`.

## Ferramentas prontas
- **Sons**: `node scripts/synth.js <sons.json> <pasta-saida>` (formato em `docs/AUDIO.md`).
- **Ver um SVG** (inclusive frames de animação): `npx electron scripts/svg-preview.cjs <pasta-saida-png> <arquivo.svg> [mais.svg] --times=0,0.6,1.2 --size=512`. Gera PNGs que você pode abrir com a ferramenta Read para **olhar** o resultado. Use isso para revisar e melhorar a arte até ficar boa; ponha os PNGs no seu scratchpad, não no repositório.

## Relatório final (até 15 linhas)
O que foi criado (contagens/slugs), o que ficou como estimativa ou não confirmado, e dúvidas para o coordenador.
