# Fluxo da partida

Como uma partida começa e acontece, do menu à batalha ([D-023](DECISIONS.md#d-023-fluxo-de-partida-estilo-street-fighter-entrada-do-2º-jogador-e-entrada-na-arena), que detalha a [D-005](DECISIONS.md#d-005-formato-de-luta-estilo-street-fighter-e-modos-de-jogo)). A jogabilidade segue o *Beyblade G-Revolution* de GBA; o que foi confirmado na ROM está marcado como **(ROM)**, com o endereço em [`REVERSE_ENGINEERING.md`](REVERSE_ENGINEERING.md).

## Telas, em ordem

```
modo → personagem (P1, e P2 se entrar) → beyblade → [CPU: personagem → beyblade] → arena → entrada → lançamento → batalha → resultado
```

| Estado | O que acontece |
| --- | --- |
| `characterSelect` | Grade com **todos os personagens** e a opção **Aleatório**. O P1 escolhe. Se alguém apertar **Options** num 2º controle (ou o Start do P2 no teclado, D-015), abre o cursor do **P2**, que escolhe em paralelo. |
| `beySelect` | Cada jogador escolhe uma das beys **do personagem que escolheu** (no jogo de GBA cada blader tem a sua, ver tabela de bladers na ROM). |
| CPU | Se o P2 não entrou, o **P1 escolhe o personagem e a bey da CPU** logo depois dos seus. |
| `stageSelect` | Escolha do estádio. A ROM tem **6 estádios** (chão + sombreado da tigela) **(ROM)**. |
| `walkIn` | Os dois personagens **andam até a arena** usando os quadros de caminhada do jogo (29 quadros por personagem principal, com caminhada de lado, de frente e de costas e as poses de lançamento) **(ROM)**. |
| `launch` | Mini-game de lançamento. O jogo de GBA tem **lançamento antecipado** ("Premature launch") e o lançador e o ripcord influenciam o resultado **(ROM)**. |
| `battle` | Batalha até um dos finais abaixo. |
| `results` | Placar, revanche, voltar à seleção. |

## Implementação da seleção (2026-10-25)

- Lógica pura em `src/game/select-state.js` (máquina de estados com testes) e `src/game/select-feedback.js` (qual som/animação tocar em cada mudança).
- Tela em `src/components/game/character-select.jsx`: cards do elenco no centro (6 colunas, Aleatório no fim), personagem de cada lado com luz de recorte na cor do jogador, carrossel das beys **em cima do personagem** (`bey-carousel.jsx`, vista de topo da ROM girando, nome embaixo, "n de N · tipo"), escolha de arena (`stage-select.jsx`, 6 estádios da ROM + Aleatória) e entrada (`walk-in.jsx`, sprites de caminhada do GBA subindo até o estádio em perspectiva, com o VS).
- Input em `src/hooks/use-select-input.js`: teclado por evento (um toque rápido nunca se perde entre dois quadros) e controle por polling; segurar a direção repete o passo.
- Link da batalha: `/batalha?p1&p2&b1&b2&arena[&cpu=2]` (`battleQuery`), com os ids de `beys.generated.json`. `arena` = slug de um dos 10 cenários do anime (`src/content/cenarios.js`, D-039), `rom-0`…`rom-5` (estádios do GBA) ou `aleatoria`, que a batalha sorteia entre os cenários. A grade de arena mostra cenários, estádios e Aleatória, com nome, episódio de origem e a regra do cenário.
- **Pendente de arte:** não existe imagem de corpo inteiro dos personagens (o GBA só tem bonecos de 16×32 e a pesquisa tem retratos de busto, 512×640). A seleção usa o retrato até a arte de corpo inteiro existir (D-008).

### Modos de jogo (D-005)

Início → **Jogar** → `/modos` (`mode-select.jsx`) → `/personagens?modo=versus|cpu|arcade|treino`:

| Modo | Seleção | Batalha |
| --- | --- | --- |
| **1 vs 1** (`versus`) | P2 entra com Options; sem ele, o P1 escolhe a CPU | `/batalha?p1&p2&b1&b2&arena[&cpu=2]` |
| **1 vs CPU** (`cpu`) | P2 não entra; o P1 escolhe personagem e bey da CPU | `…&cpu=2` |
| **Treino** (`treino`) | Igual ao 1 vs CPU | `…&cpu=2&modo=treino`: sem relógio, P2 parado, Options com Reiniciar/Sair |
| **Arcade** (`arcade`) | O P1 escolhe só o próprio personagem e bey | Escada em `/arcade` (`arcade-screen.jsx`) |

**Arcade** (`src/game/arcade.js`, com testes): 7 lutas contra a CPU com oponentes sorteados e o **Brooklyn (Zeus) como chefe final**; nível da CPU de 1 a 5 subindo com a etapa; 3 continues que repetem a luta perdida; fim de jogo e "Campeão!". A escada fica na `sessionStorage` (`arcade-storage.js`). Cada luta vai para `/batalha?…&cpu=2&modo=arcade&etapa=<n>&cpuNivel=<1..5>&arena=aleatoria`, e a batalha devolve `/arcade?etapa=<n>&resultado=vitoria|derrota` (o resultado é aplicado uma vez só, mesmo recarregando).

### Retorno de interface (game feel)

Padrão dos menus de jogo de luta, aplicado na seleção. Sons sintetizados na hora (`src/audio/ui-sounds.js`, Web Audio, D-008) e animações em `select.css`, todas desligadas com `prefers-reduced-motion`:

| Momento | Som | Animação |
| --- | --- | --- |
| Mover o cursor | tique curto e agudo | cursor pulsando com brilho na cor do jogador |
| Travar o personagem | impacto grave + fala do personagem (`/audio/tts/<slug>/selecao.wav`) | flash na cor do jogador e tranco na figura |
| Girar o carrossel | catraca (três estalos, como o ripcord) | bey e nome entram com "pop" |
| Travar a bey | acorde subindo + rugido da fera (`/audio/feras/<fera>/rugido.wav`) | flash; a bey para de girar |
| Entrar o P2 (Options) | fanfarra subindo | faixa "Novo desafiante!" atravessando a tela |
| Voltar | acorde descendo | — |
| Ir para a arena | "whoosh" | — |
| Confirmar a arena | golpe grave | "VS" entrando com escala e personagens andando até o estádio |

## Controles da batalha (ROM) e proposta para o DualShock 4

Os textos de dica do próprio jogo (`TIP: ...`, ROM `0x08382924`–`0x08383676`) definem os comandos. A coluna DualShock 4 é o padrão ([D-024](DECISIONS.md#d-024-controles-da-batalha-iguais-aos-do-jogo-de-gba), [`CONTROLLERS.md`](CONTROLLERS.md)):

| Ação | GBA (ROM) | DualShock 4 |
| --- | --- | --- |
| Mover a bey | Direcional | Analógico esquerdo / direcional |
| Atacar (segurar carrega) | A | ✕ |
| Defender (segurar carrega) | B | ○ |
| Pular | L (toque) | L1 |
| Esquivar | R (toque) | R1 |
| Fera bit (especial) | L + R segurados | L1 + R1 segurados |
| Engine Gear | A + B segurados | ✕ + ○ segurados |
| Combo forte, depois de um "HIT!" | ↑, ↓, A | ↑, ↓, ✕ |
| Combo médio | ←, →, A | ←, →, ✕ |
| Combo fraco | →, ←, A | →, ←, ✕ |
| Lançar | A (com timing) | ✕ (com timing) |

Efeitos sonoros do jogo batem com essas ações: `impact1`–`3`, `jump`, `land`, `evade`, `defend`, `eg_active`, `beast1`–`2`, `ripper`, `ripperboost`, `ripperpulled` **(ROM)**.

## Finais e regras

- **No jogo de GBA (ROM):** "Ring out" (bey expulsa do estádio) e "Spin down" (parou de girar); resenhas citam também a bey quebrada.
- **Pontuação do brinquedo:** nas regras atuais, ring out vale 2 pontos e o spin finish (o adversário parou de girar primeiro) vale 1; vence quem chegar a 3. Essas regras são da era Burst em diante; não há regra oficial publicada da era Bakuten Shoot, então o placar do nosso jogo é decisão de design (ver `validate.js`: `spin`, `ringout`, `burst` etc.).

## Proporção entre arena e bey

O usuário achou a arena pequena. Comparação (pesquisa de 2026-10-25):

| Referência | Bey | Arena | Proporção (diâmetro) |
| --- | --- | --- | --- |
| Brinquedo, era Bakuten | 43–48 mm (`diametro_mm` das beys em `pesquisa-bakuten/`) | ~34–48 cm: Beystadium Attack Type 34 cm, Balance Type 48,3 cm, padrão ~40–44 cm ([Attack Type](https://mfbeyblade.fandom.com/wiki/Beystadium_Attack_Type), [Balance Type](https://beyblade.fandom.com/wiki/Beystadium_Balance_Type), [HLJ](https://www.hlj.co.jp/product/TKT17376)) | ~8:1 a 10:1 |
| Jogo de GBA **(ROM)** | sprite de 32 px | chão do estádio de 512 px | ~16:1 |
| Anime | — | sem medida publicada; os estádios são mostrados bem maiores que o brinquedo | maior que o brinquedo |
| Nosso protótipo (`ARENA_RADIUS = 200`) | ~44 mm | 400 mm | ~9:1 |

O protótipo está fiel ao brinquedo, e por isso parece apertado. **Proposta:** usar a proporção do GBA, ~16:1 (raio da arena ≈ 360 mm, mantendo o raio das beys), escalando junto as velocidades e distâncias da física. Os sites japoneses e a wiki não trazem a medida da arena do anime; o número do anime é só visual.

## Lançador e ripcord

- O jogo de GBA tem **4 lançadores** (Plastic, Metal, Professional, Competition) e **4 ripcords** (Plastic, Extended, Super long, Competition) **(ROM)**, e os dois **quebram** com o uso ("Your launcher has broken!", "Your ripcord has broken!").
- Dica do jogo: "you can get extra power from your blade by using a longer ripcord" **(ROM)**.
- No nosso jogo de luta não há loja nem desgaste por enquanto: cada personagem entra com o lançador e o ripcord que usa (D-010, D-021). Desgaste fica como ideia para um modo futuro.

## O que a pesquisa na web acrescentou

- Resenhas da época dizem que quase toda luta era decidida pelo **RPM inicial** e pelos combos de fera bit, e que **ring out era raro**. É um alerta de balanceamento: no nosso jogo o lançamento não pode decidir sozinho a partida, e o ring out precisa acontecer de verdade ([Worthplaying](https://worthplaying.com/article/2004/12/25/reviews/21426-gba-review-beyblade-g-revolution/)).
- Também criticam que **todas as lutas eram na mesma arena**. Os 6 estádios da ROM (e a tela de escolha) resolvem isso.
- As FAQs na web se contradizem sobre os botões L/R ([almarsguides](https://almarsguides.com/retro/walkthroughs/gba/games/beybladeg-revolution/misc/controls/), [Cyberly](https://www.cyberly.org/game-cheats/game-boy-advance-gba/beyblade-g-revolution.html)); a tabela acima segue os textos da própria ROM.
- Pontuação das regras atuais: [Mall of Toys](https://malloftoys.com/en-gb/blogs/news/how-beyblade-scoring-works).

## Respostas do usuário (2026-10-25)

- **Aleatório** sorteia só o personagem; a escolha da bey continua.
- Sem o P2, o **P1 escolhe o personagem e a bey da CPU**, nas mesmas telas.
- Elenco: os **10 personagens** de `src/content/roster.js`, cada um com as suas beys. Os outros bladers da ROM ficam de fora.
- Controles da batalha **iguais aos do GBA**, adaptados ao DualShock 4 como na tabela acima ([D-024](DECISIONS.md#d-024-controles-da-batalha-iguais-aos-do-jogo-de-gba)).
- Padrão adotado sem pergunta: o P2 pode entrar **a qualquer momento da seleção de personagem**, como no Street Fighter.
