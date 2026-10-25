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

## Controles da batalha (ROM) e proposta para o DualShock 4

Os textos de dica do próprio jogo (`TIP: ...`, ROM `0x08382924`–`0x08383676`) definem os comandos. A coluna DualShock 4 é **proposta**, para confirmar na D-001/[`CONTROLLERS.md`](CONTROLLERS.md):

| Ação | GBA (ROM) | DualShock 4 (proposta) |
| --- | --- | --- |
| Mover a bey | Direcional | Analógico esquerdo / direcional |
| Atacar (segurar carrega) | A | ✕ |
| Defender (segurar carrega) | B | ○ |
| Pular | L (toque) | L1 |
| Esquivar | R (toque) | R1 |
| Fera bit (especial) | L + R segurados | L1 + R1 segurados (ou △) |
| Engine Gear | A + B segurados | ✕ + ○ segurados (ou □) |
| Combo forte, depois de um "HIT!" | ↑, ↓, A | ↑, ↓, ✕ |
| Combo médio | ←, →, A | ←, →, ✕ |
| Combo fraco | →, ←, A | →, ←, ✕ |
| Lançar | A (com timing) | ✕ ou R2 (gatilho analógico) |

Efeitos sonoros do jogo batem com essas ações: `impact1`–`3`, `jump`, `land`, `evade`, `defend`, `eg_active`, `beast1`–`2`, `ripper`, `ripperboost`, `ripperpulled` **(ROM)**.

## Finais e regras

- **No jogo de GBA (ROM):** "Ring out" (bey expulsa do estádio) e "Spin down" (parou de girar); resenhas citam também a bey quebrada.
- **Pontuação do brinquedo:** nas regras atuais, ring out vale 2 pontos e o spin finish (o adversário parou de girar primeiro) vale 1; vence quem chegar a 3. Essas regras são da era Burst em diante; não há regra oficial publicada da era Bakuten Shoot, então o placar do nosso jogo é decisão de design (ver `validate.js`: `spin`, `ringout`, `burst` etc.).

## Lançador e ripcord

- O jogo de GBA tem **4 lançadores** (Plastic, Metal, Professional, Competition) e **4 ripcords** (Plastic, Extended, Super long, Competition) **(ROM)**, e os dois **quebram** com o uso ("Your launcher has broken!", "Your ripcord has broken!").
- Dica do jogo: "you can get extra power from your blade by using a longer ripcord" **(ROM)**.
- No nosso jogo de luta não há loja nem desgaste por enquanto: cada personagem entra com o lançador e o ripcord que usa (D-010, D-021). Desgaste fica como ideia para um modo futuro.

## O que a pesquisa na web acrescentou

- Resenhas da época dizem que quase toda luta era decidida pelo **RPM inicial** e pelos combos de fera bit, e que **ring out era raro**. É um alerta de balanceamento: no nosso jogo o lançamento não pode decidir sozinho a partida, e o ring out precisa acontecer de verdade ([Worthplaying](https://worthplaying.com/article/2004/12/25/reviews/21426-gba-review-beyblade-g-revolution/)).
- Também criticam que **todas as lutas eram na mesma arena**. Os 6 estádios da ROM (e a tela de escolha) resolvem isso.
- As FAQs na web se contradizem sobre os botões L/R ([almarsguides](https://almarsguides.com/retro/walkthroughs/gba/games/beybladeg-revolution/misc/controls/), [Cyberly](https://www.cyberly.org/game-cheats/game-boy-advance-gba/beyblade-g-revolution.html)); a tabela acima segue os textos da própria ROM.
- Pontuação das regras atuais: [Mall of Toys](https://malloftoys.com/en-gb/blogs/news/how-beyblade-scoring-works).

## Em aberto (perguntar ao usuário)

1. **Aleatório** sorteia só o personagem (a escolha da bey continua) ou personagem e bey?
2. Quando o P2 não entra, o P1 escolhe também a **bey da CPU**, ou a CPU usa a bey padrão do personagem?
3. O P2 pode entrar **a qualquer momento** da seleção (como no Street Fighter) ou só antes de o P1 confirmar o personagem?
4. Elenco: os **10 personagens** de `src/content/roster.js` ou também os outros bladers do jogo de GBA (são 55 na ROM, cada um com a sua bey)?
5. Controles: a proposta de mapeamento acima vira o padrão do DualShock 4?
