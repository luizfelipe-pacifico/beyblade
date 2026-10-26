# Roadmap: MVP até o Beta

Plano para chegar ao **Beta do Beyblade Arena**: batalha 2D de Beyblade para dois jogadores com DualShock 4, rodando como `.exe` no Windows. Segue as etapas usadas na indústria: **protótipo → vertical slice → alpha → beta**.

| Etapa | O que prova | Critério de saída |
| --- | --- | --- |
| **Protótipo** | O loop central é divertido | Duas beys batalhando com controle; dá vontade de jogar de novo |
| **Vertical slice** | Uma fatia com cara de jogo pronto | Uma partida completa, do menu ao resultado, com arte, som e vibração |
| **Alpha** | Tudo existe (*feature complete*) | Todos os modos e personagens do MVP jogáveis, mesmo com bugs e sem balanceamento |
| **Beta** | Conteúdo travado, só polimento | Sem features novas: correção de bugs, balanceamento, performance e empacotamento |

**Último avanço (2026-10-25):** os 10 personagens com a aparência do G-Revolution, entrada na arena ao lado do estádio de verdade, miniaturas das arenas, bey e arena aleatórias já sorteadas na seleção, e o lançamento no ritmo do Beyblade Burst app (D-046, D-049, D-052). Na batalha (outra sessão): contato que gasta giro e escudo, CPU que raciocina e física do giro como vida (D-048, D-051).

Escopo do MVP vem de D-001, D-004, D-005, D-006 e D-007 em [`DECISIONS.md`](DECISIONS.md). Legenda: ✅ feito · 🔄 em andamento · ⬜ a fazer.

---

## M0: Fundação técnica

Base para todo o resto.

- ✅ Validação da API em allowlist (`src/validate.js`) com testes
- ✅ Testes automáticos antes de todo push (D-003)
- ✅ PostgreSQL no Docker (D-012) e Prisma 7 com migrações e `CHECK` (D-011)
- ✅ API de configurações, preferências, partidas e estatísticas funcionando contra o banco
- ✅ Electron, Next.js e React instalados (D-004)
- ✅ App Next (App Router) do jogo na 5000, servido pelo `server.js` junto com a API (D-022, D-025)
- ⬜ Confirmar D-013 (Next serve UI e API sem Express)
- ⬜ Migrar as rotas do Express para route handlers do Next e remover `express`
- ✅ `electron/main.js`: janela do jogo com o checklist de segurança ([`SECURITY.md`](SECURITY.md#electron)); o servidor é subido pelo `dev:all`
- ✅ `pnpm run dev:all`: banco, jogo (5000), landing (3000) e Electron juntos (D-025)
- ⬜ Pipeline de conteúdo: dados de personagens, beys, peças e lançadores validados (D-009, D-010)

**Pronto quando:** `npm run dev` abre a janela do Electron com uma tela vazia vinda da porta 5000, e ela lê e grava no banco.

## M1: Protótipo da batalha

Responder: **é divertido?** Gráficos simples (círculos) e números de teste.

- ✅ Game loop com timestep fixo de 60 Hz, 2 subpassos de física e interpolação ([`ARCHITECTURE.md`](ARCHITECTURE.md#3-game-loop-timestep-fixo-com-interpolação))
- ✅ Simulação determinística em `src/sim/` (PRNG com semente, estado serializável), testável em Node
- ✅ Arena em tigela: inclinação puxando ao centro, parede e zonas de saída (tigela funda, raio 450 mm, D-028)
- ✅ Física das beys: movimento, colisão bey×bey e bey×parede, perda de giro, efeito do sentido de rotação (igual = mais recuo; oposto = equalização de giro)
- ✅ Finalizações: Parada, Fora e Decisão, melhor de 3 (D-026; sem burst, D-045)
- ✅ Input: 2× DualShock 4 e teclado (dois jogadores no mesmo teclado ou misto, D-015), `InputFrame` por tick, deadzone radial
- ✅ Comandos da D-024: ataque e defesa com carga, pulo, esquiva, fera bit (L1+R1), Engine Gear (✕+○), lançamento com timing
- ⬜ Combos depois de um "HIT!" (D-024)
- ✅ Fluxo da D-023: Aleatório, seleção de bey (com bey aleatória), entrada do P2 pelo Options e CPU, seleção de arena com a "foto do lugar" e animação de entrada ao lado do estádio de verdade (D-023, D-050, D-052)
- ✅ Testes: colisão, finalizações, desempate, determinismo, comandos e input

**Pronto quando:** duas pessoas jogam várias rodadas seguidas a 60 FPS e querem continuar, tanto com dois DualShock 4 quanto as duas no mesmo teclado.

## M2: Vertical slice

Uma partida **com cara de produto final**, de ponta a ponta, com 2 personagens.

- ✅ Fluxo D-005: modo → seleção de personagem → seleção de bey → arena → entrada → lançamento → batalha → resultado
- ✅ Tyson (Dragoon) e Kai (Dranzer) completos: dados e atributos das peças extraídos da ROM, retratos do PS1, sprites de caminhada do GBA (D-007, D-040)
- ✅ Fase de lançamento no ritmo, estilo Beyblade Burst app: mira, 10 batidas, energia e Lançamento Perfeito (D-049, [`LAUNCH.md`](LAUNCH.md)); ⬜ efeito do lançador e do ripcord de cada personagem (D-010)
- ✅ Arenas finalizadas: 10 cenários do anime e 6 estádios do GBA, em tigela funda (D-028, D-039, D-050)
- ✅ HUD: giro, especial, escudo, placar, cronômetro
- ✅ Sons sintetizados (D-008), sons de interface e vibração do DualShock 4
- 🔄 Menus navegáveis só com o controle **ou** só com o teclado (D-015), mostrando os símbolos do dispositivo em uso (seleção, modos e Arcade já navegam pelos dois)
- ⬜ Tela de Controles: escolher a porta, detectar o controle, remapear, deadzone e vibração, salvos no banco
- ⬜ Partida salva no histórico

**Pronto quando:** alguém que nunca viu o jogo liga dois controles e joga uma partida completa sem ajuda.

## M3: Alpha (feature complete)

Tudo que o MVP terá, mesmo sem polimento.

- ✅ Os 10 personagens com suas beys, com a aparência do G-Revolution: retratos do PS1 e da Beyblade Wiki (D-005, D-040, D-046)
- ✅ Especiais por bey (fera bit com animação, Engine Gear, crítico, escudo com vida) (D-036, D-041, D-042)
- ✅ Modos: **1 vs 1 local**, **1 vs CPU**, **Arcade** (7 lutas até o Brooklyn, com continues), **Treino**
- 🔄 IA da CPU que raciocina, com nível e CPU × CPU por comando (D-051); falta o perfil de cada personagem
- ⬜ Histórico e ranking (jogadores, beys, tipos de finalização)
- ⬜ Configurações: volume, presets de qualidade gráfica (Alta/Média/Baixa/Automático), tela cheia
- ⬜ Pausa, desconexão de controle no meio da partida e reconexão (com opção de continuar pelo teclado)
- ⬜ Valores da física calibrados com a ROM do GBA (D-007, [`REVERSE_ENGINEERING.md`](REVERSE_ENGINEERING.md))

**Pronto quando:** todo modo e personagem é jogável do início ao fim.

## M4: Beta

**Conteúdo travado.** Nada novo entra; só qualidade.

- ✅ CI no GitHub Actions: testes em Linux e Windows, builds do jogo e da landing, auditoria ([`CI.md`](CI.md))
- ⬜ Balanceamento: matriz de vitórias entre beys (simulações automáticas usando o determinismo), ajustes só nos dados
- ⬜ Performance: 60 FPS estáveis em 1080p numa **GPU integrada**, medidos e documentados ([`ARCHITECTURE.md`](ARCHITECTURE.md#8-renderização-e-performance-em-notebook-sem-placa-de-vídeo))
- ⬜ Empacotamento `.exe` (Electron + Next standalone) com banco SQLite em `userData` (D-014) e migrações aplicadas na primeira execução
- ⬜ Checklist de segurança do Electron completo
- ⬜ Sessões de teste com jogadores; bugs registrados e corrigidos com teste de regressão
- 🔄 Acessibilidade: `prefers-reduced-motion` já respeitado na seleção, entrada e lançamento; faltam contraste e P1/P2 sem depender só da cor

**Pronto quando:** dá para jogar uma noite inteira sem crash, sem travadas e sem bug bloqueante.

---

## Fora do MVP (depois do Beta)

- Render 3D da batalha (D-006): a simulação já fica pronta para isso
- Replays (gravação dos `InputFrame`)
- Jogo online (rollback no estilo GGPO), que exige a simulação determinística do M1
- Modo história, customização de peças, desbloqueáveis

## Riscos

| Risco | Impacto | Plano |
| --- | --- | --- |
| Dois bancos (PostgreSQL no dev, SQLite no `.exe`, D-014) | Query que funciona num e quebra no outro | `src/db.js` só com recursos comuns aos dois; testes das queries também no SQLite |
| Física pouco divertida | O jogo todo depende disso | Protótipo (M1) antes de qualquer arte; iterar só nos números |
| Performance em GPU integrada | Notebook fraco trava | Cache de camadas, presets de qualidade, medir desde o M1 |
| D-013 ainda não confirmada | Retrabalho na camada de API | Confirmar antes de começar o M0 |
| Assets da ROM (D-007) | Não podem ser distribuídos | Substituir pelos assets próprios (D-008) antes de qualquer distribuição |

## Fontes

- [Filament Games: Prototype, Alpha, MVP](https://filamentgames.com/blog/baby-steps-in-game-development-discovery-only-alpha-release-prototype-or-mvp)
- [Wayline: game development milestones](https://www.wayline.io/blog/setting-game-development-milestones-concept-launch)
- [Unity production milestones](https://pctechmag.com/2026/06/unity-production-milestones-what-each-stage-should-deliver/)
- [Game-Ace: game development stages](https://game-ace.com/blog/game-development-stages/)
