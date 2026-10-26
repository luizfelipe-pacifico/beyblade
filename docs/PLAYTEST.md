# Playtest: testar jogando e pensando em física

Como o jogo é testado jogando, para achar falhas básicas antes de o usuário achar (D-043). Os testes de `tests/` travam o que já foi resolvido; o playtest procura o que ainda ninguém viu. **Regra:** toda falha achada aqui vira correção **e** teste de regressão no mesmo commit (`CLAUDE.md`, "Testes e regressão").

## Princípio: a física manda

Antes de mexer em qualquer número, pergunte como um pião de verdade se comportaria. O jogo pode exagerar para ficar divertido, mas não pode inventar energia nem quebrar o que o jogador entende intuitivamente:

| Fenômeno | Como deve ser | Sinal de problema |
| --- | --- | --- |
| Conservação do momento | Num choque, cada bey recebe só a parte do impulso que cabe a ela (mais leve recua mais). O empurrão extra vem do giro e é limitado. | Uma bey sai do choque mais rápida do que a outra chegou. |
| Energia | Sem ponta, atrito e arrasto, a bola na tigela oscila sem ganhar nem perder energia (`tests/sim-bowl.test.js`). | Velocidade que cresce sozinha; bey que "acelera do nada". |
| Gravidade na tigela | O fundo puxa; quanto mais longe do centro, mais forte (rampa íngreme perto da borda). | Bey que corre como se a arena fosse plana. |
| Atrito | Gelo escorrega, areia freia; bey parada fica parada (atrito estático). | Bey parada que rasteja; gelo que freia igual ao chão. |
| Giro | Perde devagar girando à toa; perde muito nos choques; giro baixo bambeia. | Bey que para mais rápido sem bater do que batendo. |
| Tipos | Ataque rápida e de vida curta; defesa pesada e difícil de tirar; resistência longa no centro; equilíbrio no meio. | Um tipo que nunca vence, ou que vence sempre. |
| Colisão | Duas beys nunca se atravessam; ninguém atravessa a parede. | Sobreposição grande; bey ativa fora do raio da arena. |

## Playtest automático: `npm run playtest`

`scripts/playtest.js` joga partidas inteiras com jogadores roteirizados e confere tudo a cada tick:

- **Jogadores:** `nada` (só lança), `afobado` (investe a cada 1,5 s sem esperar a carga) e `preciso` (solta ✕ no estalo da carga cheia e só com o alvo perto: o melhor que dá para jogar, quadro a quadro).
- **Invariantes físicas, a cada tick:** número inválido (NaN), bey ativa fora da arena, giro fora de 0–1, velocidade acima de 2,5× o teto (choque e especial passam do teto por um instante; mais que isso é absurdo) e beys atravessadas (sobreposição acima de 15% do raio).
- **Expectativas de jogo:** a ataque afobada quase nunca vence a defesa (≤ 15%); a ataque precisa consegue (25–80%); parada, a defesa dura mais; o espelho fica perto de 50%; rodada com investidas entre 12 e 45 s; sem investidas, 35 s ou mais.
- **Cenários:** o mesmo confronto em cada cenário do anime (`src/content/cenarios.js`).

Uso: `npm run playtest` (20 partidas por confronto) ou `node scripts/playtest.js 40` para mais precisão. Sai com código 1 se algo ficar fora do esperado. As faixas são largas de propósito: o objetivo é achar o que fugiu muito.

Cuidado ao ler: o roteiro do P2 fica meio ciclo defasado no espelho. Dois roteiros idênticos no mesmo tick deixam a luta perfeitamente simétrica e empatam para sempre, coisa que duas pessoas nunca fazem.

## Playtest na tela (Electron)

Para o que só se vê jogando (animação, HUD, som, sensação), a batalha roda no Electron com teclas simuladas. Em desenvolvimento, `window.__batalha` expõe o estado da partida para o script posicionar as beys (ex.: forçar um choque contra o escudo) e conferir o resultado. Use janela `offscreen` para capturar mesmo com a tela bloqueada. Roteiro mínimo de cada sessão:

1. Início → abertura (pula com ✕) → Jogar → modos → seleção → batalha, sem erro no console.
2. Lançamento: a barra oscila e trava no ✕; as duas beys entram.
3. Batalha: investida mirando no oponente; estalo da carga; crítico de frente e para fora; escudo racha e quebra em duas pancadas; fera bit sai com a contagem no painel e volta no fim.
4. Fim: resultado, revanche, histórico salvo.
5. Cada cenário: o chão do lugar aparece, a regra faz o que diz (gelo escorrega, parede alta não deixa sair).

## O que o playtest já achou

| Data | Achado | Causa | Correção e teste |
| --- | --- | --- | --- |
| 2026-10-25 | Ataque com 0% contra a defesa | Sem forma de o ataque vencer a massa e o pouco recuo da defesa | Golpe crítico difícil (D-041); `tests/critico.test.js` |
| 2026-10-25 | Defesa jogada a ~3,5 m/s por um crítico | O crítico multiplicava o empurrão inteiro, criando energia | Empurrão limitado pelo momento (D-043); regressão em `tests/critico.test.js` |
| 2026-10-25 | Espelho empatando para sempre | Roteiro do teste perfeitamente simétrico (não é do jogo) | P2 defasado no roteiro |
