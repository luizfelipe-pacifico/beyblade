# IA da CPU

Como a CPU joga (D-051). Código em `src/sim/ai.js`, puro e determinístico: lê o estado da partida e devolve um `InputFrame` por tick, como um jogador com controle. Tem o próprio sorteio com semente; não usa o da partida.

## Raciocínio

A cada "olhada" (o tempo de reação do nível) a CPU avalia a situação e escolhe uma **intenção**; entre olhadas, segue o plano. Apertos de mais de um tick (L1 + R1 da fera, ✕ + ○ do Engine Gear, toque de pulo e esquiva) viram um plano de alguns ticks. Ordem de prioridade:

1. **Fera bit**, com a barra cheia e no momento do tipo: ataque com o oponente perto; resistência com o giro baixo; defesa sob ameaça ou com giro baixo.
2. **Engine Gear**, uma vez por rodada: com o giro abaixo de 60% ou para fechar contra um oponente fraco.
3. **Defender** (○) contra uma investida carregada chegando, se o escudo aguenta; abaixa antes de quebrar (escudo abaixo de 35%).
4. **Esquivar** (R1) se a investida chega e o escudo está quebrado ou fraco; a resistência também esquiva para fugir do contato.
5. **Carregar e investir** (✕) com o oponente perto: no nível alto, mira o crítico (espera o alvo ficar entre ela e a borda e solta no estalo); sem mirar, solta antes de encher.
6. **Mover:** a ataque ronda perto da borda, longe dos bolsos ("sobe na rampa e mergulha", como no app da Burst); defesa, resistência e equilíbrio voltam para o fundo da tigela.

No lançamento, trava a barra quando ela passa da força que o nível espera (com um pouco de sorte).

## Níveis (`NIVEIS`)

| Nível | Reação | Solta no estalo | Erro de mira | Ousadia | Defende a ameaça | Lançamento mínimo |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0,45 s | 15% | 0,6 rad | 35% | 30% | 45% |
| 3 | 0,25 s | 50% | 0,3 rad | 60% | 60% | 72% |
| 5 | 0,12 s | 88% | 0,08 rad | 80% | 90% | 90% |

A batalha usa o nível de `cpuNivel` (padrão 3). No treino o P2 é um boneco parado, sem IA.

## CPU × CPU, só por comando

`npm run cpu:duelo -- --p1 dragoon-g --p2 draciel-g --n1 5 --n2 3 --partidas 20 [--arena lago-baikal] [--log]` joga sem tela e imprime: vitórias e finais, quanto tempo cada CPU passou em cada intenção, investidas (e quantas no estalo), críticos, feras, Engine Gear, esquivas, escudos quebrados, o giro no fim das rodadas e **pontos de melhoria** (ex.: nunca soltou a fera, deixa o escudo quebrar demais, defende mais da metade do tempo). `--log` mostra o raciocínio da primeira partida, decisão por decisão, com o motivo. Não aparece no jogo.

## Medições (2026-10-25, 10 partidas cada)

| Confronto | Resultado | Observação |
| --- | --- | --- |
| Dragoon G (ataque, 3) × Draciel G (defesa, 3) | 0 × 10 | Esperado: ataque contra defesa só vence com jogo de elite |
| Dragoon G (5) × Draciel G (3) | 2 × 8 | Com o crítico, a ataque nível 5 já vence às vezes |
| Dranzer G (3) × Dranzer G (3) | 5 × 5 | Espelho equilibrado |
| Draciel G (2) × Driger G (4) | 8 × 2 | A defesa segura a ataque mesmo com nível menor |

## Pontos de melhoria conhecidos

- A ataque nível 5 ainda vence pouco da defesa (20%); o jogador roteirizado "preciso" do playtest chega a 55%, então dá para ela escolher melhor o momento (esperar o alvo subir a rampa antes de investir).
- A CPU não usa o pulo para escapar nem para cair em cima do oponente.
- O equilíbrio usa a mesma estratégia da defesa; poderia alternar ronda e centro conforme o oponente.
