# Arquitetura

Como o Beyblade Arena é organizado: processos, módulos, fluxo de dados e os padrões de jogos profissionais que adotamos (e por quê). Decisões que sustentam este documento: D-004 (Electron + Next.js), D-005 (fluxo estilo jogo de luta), D-006 (2D agora, 3D depois), D-011 (Prisma), D-012 (PostgreSQL no Docker, só no desenvolvimento), D-013 (Next serve UI e API) e D-014 (SQLite no `.exe`). Ver [`DECISIONS.md`](DECISIONS.md).

> **Estado atual vs. alvo.** Já existem: a API (`server.js`, Express 5, que repassa ao Next o que não é `/api`), `src/validate.js`, `src/db.js` (Prisma → PostgreSQL no Docker), o app Next com as abas Início, Personagens e Batalha (`app/(jogo)/`), a simulação determinística (`src/sim/`), o input de controle e teclado (`src/input/`), o render em canvas (`src/render/`) e a janela do Electron (`electron/main.js`), aberta por `pnpm run dev:all` (D-025). O que ainda é alvo está no [`ROADMAP.md`](ROADMAP.md).

---

## 1. Visão geral

```
┌──────────────────────────── Electron (.exe) ─────────────────────────────┐
│                                                                           │
│  Processo principal (Node)          Renderer (Chromium, sandbox)          │
│  ─────────────────────────          ─────────────────────────────         │
│  • ciclo de vida da janela          • UI em Next.js/React (menus, HUD)    │
│  • sobe o servidor Next na 5000     • jogo: simulação + render em canvas  │
│  • powerSaveBlocker na partida      • Gamepad API (2× DualShock 4)        │
│  • bloqueia navegação externa       • fetch('/api/...') ── só HTTP local  │
│                                                   │                       │
└───────────────────────────────────────────────────┼───────────────────────┘
                                                    ▼
                       Servidor Next.js em 127.0.0.1:5000
                       • route handlers /api/*  (hoje: Express ✅)
                       • src/validate.js (allowlist) ✅
                       • src/db.js → Prisma Client ✅
                                     ┌──────────────┴──────────────┐
                                     ▼ dev (D-012)                 ▼ .exe (D-014)
               Docker beyblade-db (postgres:18-alpine) ✅    arquivo SQLite em
               TCP 127.0.0.1:5434, volume pgdata             userData, sem Docker
```

**Por que assim:**

- **Renderer sem Node.** O guia oficial de segurança do Electron pede `contextIsolation`, `sandbox` e nada de `nodeIntegration` no renderer. Então o renderer nunca abre conexão com o banco: ele fala HTTP com o servidor local, que valida tudo. É o mesmo modelo cliente/servidor dos jogos online, só que dentro da máquina.
- **Uma porta só (5000).** O servidor do Next entrega a interface e a API (regra do `CLAUDE.md`). O Express é transitório (D-013).
- **Dois bancos, um código** (D-014): PostgreSQL no Docker no desenvolvimento (D-012) e SQLite no `.exe`, sem Docker para o jogador. `src/db.js` só usa recursos comuns aos dois.

## 2. Camadas do jogo

O jogo segue a separação clássica de engines comerciais: **simulação** (regras e física) não sabe nada de **apresentação** (render, som, vibração, UI). Isso é o que permite trocar o render 2D por 3D (D-006), testar a física em Node (D-003) e, no futuro, ter replays e partidas online.

```
 Dispositivos ─► Input ─► InputFrame ─┐
 (DS4, teclado)  (bindings, deadzone) │
                                      ▼
                         ┌──────── Simulação ────────┐
                         │  tick fixo, determinística │──► Eventos (hit, wall,
                         │  estado em unidades do     │     burst, ringout, ...)
                         │  mundo (mm, g, rad/s)      │          │
                         └────────────┬───────────────┘          │
                                      │ estado (somente leitura) │
                                      ▼                          ▼
                     Render 2D (canvas) / 3D depois     Áudio · Vibração · HUD
```

| Camada | Pasta (alvo) | Responsabilidade | Pode importar |
| --- | --- | --- | --- |
| Conteúdo | `src/content/`, `src/beyblade/` | Personagens, beys, peças, lançadores, arenas (dados validados). Atributos calculados das peças (D-009, `src/beyblade/stats.js`). | nada de DOM |
| Simulação | `src/sim/` | Física, colisão, perda de giro, finalizações, especiais, IA da CPU, máquina de estados da partida. | conteúdo |
| Input | `src/input/` | Gamepad API + teclado → `InputFrame` por jogador, bindings, deadzone, bordas. | — |
| Apresentação | `src/render/`, `src/audio/` | Desenha o estado, toca sons (D-008, `scripts/synth.js`), vibra o controle. | estado e eventos (leitura) |
| Telas | `app/` (Next.js) | Título, seleção de personagem, seleção de bey, controles, histórico, configurações. | tudo acima |
| Dados | `src/db.js`, `app/api/` | Persistência via Prisma. | só no servidor |

**Regra de dependência:** as setas só descem. `src/sim/` nunca importa nada de render, áudio, DOM, `window` ou `fetch`. Um teste em `node:test` precisa conseguir rodar uma partida inteira só com a simulação.

## 3. Game loop: timestep fixo com interpolação

Padrão do artigo *Fix Your Timestep!* (Glenn Fiedler), usado na prática por toda engine de física:

1. O `requestAnimationFrame` mede o tempo real do frame e soma num **acumulador**.
2. O tempo do frame é **limitado (0,25 s)** para evitar a "espiral da morte" depois de uma travada ou da janela voltar do segundo plano. Sob carga, o jogo fica mais lento em vez de explodir.
3. Enquanto o acumulador tiver pelo menos um `dt`: guarda o estado anterior, roda `step(state, input, dt)` e subtrai `dt`.
4. `alpha = acumulador / dt` → o render desenha a **interpolação entre o estado anterior e o atual**. O movimento fica suave em 60 Hz, 144 Hz ou com frames perdidos.

Valores do projeto:

| Parâmetro | Valor | Motivo |
| --- | --- | --- |
| Tick da simulação | **60 Hz** (`dt = 1/60 s`) | Input amostrado uma vez por tick (igual a jogos de luta, que rodam a 60 ticks/s) |
| Subpassos de física | **2 por tick** (120 Hz) | Beys rápidas atravessariam uma à outra em 60 Hz; o subpasso evita *tunneling* sem mudar o ritmo do input |
| Limite de frame | 0,25 s | Proteção contra a espiral da morte |
| Render | taxa do monitor, com interpolação | Desacoplado da física |

Pausa automática quando a janela perde o foco ou um controle desconecta (ver [`CONTROLLERS.md`](CONTROLLERS.md)).

## 4. Simulação determinística

Determinismo quer dizer **mesmo estado inicial + mesmos inputs = mesmo resultado, bit a bit**. É a base de replays, testes reproduzíveis e de netcode por rollback (o GGPO exige um motor determinístico que saiba salvar, carregar e avançar o estado). Regras:

- **Sem `Math.random()` na simulação.** Use um PRNG com semente (ex.: mulberry32) guardado **dentro do estado** da partida. Aleatoriedade visual (faíscas) pode usar outro gerador, fora da simulação.
- **Sem relógio de parede** (`Date.now`, `performance.now`) dentro do `step`: o tempo da simulação é `tick * dt`.
- **Os inputs são a única entrada externa.** Cada tick recebe `InputFrame[2]`; gravar a lista de `InputFrame` = gravar o replay.
- **Estado serializável** (objetos e arrays simples, sem classes com ciclos), copiável com `structuredClone`. Isso dá `saveState`/`loadState` de graça.
- **Ordem estável:** sempre iterar as entidades na mesma ordem.

> Ressalva honesta: ponto flutuante de JavaScript é determinístico na **mesma máquina e versão do motor**, o que basta para replays e testes locais. Para online entre máquinas diferentes, avaliar aritmética de ponto fixo antes de investir em rollback.

## 5. Modelo de entidades: "ECS leve"

Grandes jogos com muitas entidades usam **Entity Component System**: o Overwatch (palestra da Blizzard na GDC 2017) e o DOTS da Unity guardam dados em componentes contíguos e processam tudo por sistemas. Para nós (2 beys, 1 arena, até algumas centenas de partículas) uma biblioteca de ECS seria complexidade sem retorno. Adotamos **o espírito do ECS**, sem framework:

- **Dados separados de comportamento:** entidades são objetos simples (`{ id, pos, vel, spin, ... }`) em arrays no estado; não há classes com métodos de física.
- **Sistemas são funções puras em ordem fixa por subpasso:** `applyInput → applyForces (inclinação da tigela, órbita pelo giro) → integrate → collideBeys → collideWalls → decaySpin → checkFinishes`.
- **Comunicação por fila de eventos** (padrão *Event Queue* de *Game Programming Patterns*): a simulação gera `{ type: 'hit', impact, a, b }` e não toca som nem vibração. Áudio, partículas e rumble consomem a fila depois do tick.
- **Máquina de estados** da partida e das telas (padrão *State*): `title → modeSelect → characterSelect → beySelect → launch → battle → finishing → roundEnd → results`. Cada estado trata o input de um jeito (ex.: ✕ confirma no menu, dá investida na batalha).
- **Object pool** para partículas e faíscas, sem alocar dentro do loop (o GC não pode pausar no meio de uma colisão).

## 6. Input

- A cada tick, `navigator.getGamepads()` é lido de novo (os objetos são snapshots) e convertido, pelos bindings de cada jogador, num **`InputFrame`**: `{ move: {x, y}, held: {...}, pressed: {...} }`. A simulação só vê `InputFrame`, nunca o gamepad.
- Deadzone **radial** aplicada antes da direção; borda de botão (`pressed`) calculada contra o tick anterior.
- Bindings por jogador (botão, eixo ou tecla) salvos no banco (`controller_configs`), com o DualShock 4 como padrão (D-001). Detalhes em [`CONTROLLERS.md`](CONTROLLERS.md).
- **Teclado é um dispositivo de primeira classe** (D-015): gera o mesmo `InputFrame` que o controle, então dá para jogar inteiro sem controle, os dois no mesmo teclado ou misto. Sem controle na porta, o teclado do jogador fica ativo sozinho e a interface mostra as teclas.

## 7. Conteúdo orientado a dados

Como nos jogos de luta, números não ficam no código: personagens, beys, peças, lançadores e arenas são **dados** (JSON validado), e o código só interpreta.

- Fonte: `pesquisa-bakuten/` (perfis e `dados.json`), com atributos **calculados** das peças (D-009) e lançadores (D-010).
- Referência de calibração: valores extraídos da ROM do GBA (D-007, [`REVERSE_ENGINEERING.md`](REVERSE_ENGINEERING.md)).
- Arte e som gerados por script a partir dos mesmos dados (D-008).
- Balanceamento = editar dados e rodar os testes, sem mexer na física.

## 8. Renderização e performance em notebook sem placa de vídeo

Meta: **60 FPS estáveis em 1080p numa GPU integrada** (ex.: Intel UHD / Iris Xe, AMD Radeon Vega). O jogo é 2D vista de cima, então o gargalo é o preenchimento de pixels e a CPU, não geometria. O que adotamos:

| Técnica | Por quê |
| --- | --- |
| **Camadas estáticas em cache** (arena desenhada uma vez num `OffscreenCanvas`/canvas fora da tela) | Redesenhar gradientes e anéis a cada frame é o maior custo evitável |
| **Resolução de render limitada** (`devicePixelRatio` com teto de 1,5–2) e escala de resolução no preset Baixo | Telas 4K ou com zoom do Windows multiplicam os pixels |
| **Sem `shadowBlur`/`filter` no canvas por frame** | São caríssimos em GPU integrada; brilhos vêm de sprites pré-renderizados |
| **Sprites pré-renderizados** das beys (SVG → bitmap uma vez por tamanho) | `drawImage` é muito mais barato que desenhar caminhos complexos |
| **Teto de partículas** + object pool | Custo previsível nos choques fortes |
| **Presets de qualidade** (Alta / Média / Baixa) e "automático" pelo FPS medido | Notebook fraco continua jogável |
| **Interpolação** em vez de mais ticks | Movimento suave sem custo de física |
| `powerSaveBlocker` durante a partida | Evita a tela apagar ou a CPU reduzir o clock no meio da luta |

Medir antes de otimizar: painel Performance do DevTools e contador de FPS/tempo de frame em modo debug. O render 3D (D-006) vai reavaliar isso (WebGL/WebGPU).

## 9. Persistência

```
Tela (React) ── fetch ──► /api/* ──► validate.js (allowlist) ──► db.js (Prisma) ──► PostgreSQL (dev) | SQLite (.exe)
```

- A **validação acontece no servidor**, sempre; o cliente nunca é confiável (nem o nosso).
- A partida é gravada **no fim** (uma transação com partida + rodadas). Configurações de controle, com debounce, quando mudam.
- Banco indisponível (no dev, container parado) → a API responde `503` e o jogo continua jogável, só sem salvar.
- Schema e operação em [`DATABASE.md`](DATABASE.md).

## 10. Estrutura de pastas (alvo do MVP)

```
app/                     telas Next.js (App Router) e app/api/**/route.js
electron/                main.js (janela, servidor, segurança) e preload.js
src/
  sim/                   simulação determinística (sem DOM)
  input/                 gamepad + teclado → InputFrame
  render/                render 2D (canvas); render 3D depois
  audio/                 reprodução dos sons sintetizados
  content/  beyblade/    dados e cálculo de atributos
  validate.js  db.js     ✅ validação e acesso ao banco
  generated/prisma/      ✅ client gerado (fora do git)
prisma/                  ✅ schema.prisma + migrations/
scripts/                 geração de arte/som e utilitários
tests/                   ✅ node:test
docker-compose.yml       ✅ PostgreSQL
```

## Fontes

- Glenn Fiedler, [*Fix Your Timestep!*](https://gafferongames.com/post/fix_your_timestep/): acumulador, `dt` fixo, interpolação e limite contra a espiral da morte.
- Robert Nystrom, [*Game Programming Patterns*](https://gameprogrammingpatterns.com/contents.html): Game Loop, Update Method, Component, Event Queue, State, Object Pool.
- Timothy Ford (Blizzard), [*Overwatch Gameplay Architecture and Netcode*](https://gdcvault.com/play/1024001/-Overwatch-Gameplay-Architecture-and), GDC 2017: ECS e determinismo no Overwatch. Resumo secundário: [Edgegap](https://edgegap.com/blog/game-backend-deep-dive-overwatch-2016-netcode-architecture-rollback).
- Unity, [*On DOTS: Entity Component System*](https://unity.com/blog/engine-platform/on-dots-entity-component-system): por que o layout de dados importa.
- [GGPO (Wikipedia)](https://en.wikipedia.org/wiki/GGPO) e Infil, [*Netcode explained*](https://words.infil.net/w02-netcode-p5.html): rollback exige simulação determinística com save/load de estado.
- [JamJar: Timestep](https://jamjarweb.readthedocs.io/en/latest/architecture/timestep/) e [Code inComplete: The Game Loop](https://codeincomplete.com/articles/javascript-game-foundations-the-game-loop).
- Electron: [Security](https://www.electronjs.org/docs/latest/tutorial/security) e [Process Model](https://www.electronjs.org/docs/latest/tutorial/process-model).
- Next.js em Electron (export estático vs. `standalone`): [Stackademic](https://blog.stackademic.com/from-web-to-desktop-bringing-your-next-js-app-to-life-with-electron-js-dec8a0415cc1), [Appwrite: Next.js output modes](https://appwrite.io/blog/post/nextjs-output-modes.md).
