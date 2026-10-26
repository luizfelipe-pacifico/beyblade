# Lançamento

Como a bey entra na arena: o mini-game de lançamento inspirado no **Beyblade Burst app** (Hasbro), adaptado ao controle de PS4. O pedido do usuário foi trazer o estilo de "acertar o local exato no clique e ir aumentando a energia final".

## Como é no Beyblade Burst app (pesquisa)

O que as fontes confirmam:

- **Toques no ritmo da contagem.** A partida começa com o jogador alinhando o lançamento e tocando a tela no tempo da contagem regressiva. A cada toque, **a faixa de acerto fica mais estreita** ([Beyblade Wiki: Beyblade Burst App](https://beyblade.fandom.com/wiki/Beyblade_Burst_App)).
- **Medidor de energia e Lançamento Perfeito.** Cada toque certo enche o medidor de energia acima do cronômetro. Acertando **8 dos 10 toques**, o jogador faz um **Perfect Launch**, que dá **stamina além do máximo normal** no início (mesma fonte).
- **Durante a batalha** existem stamina e burst. A habilidade básica de cada tipo tem contra-ataque: ataque = Smash Attack, defesa = toma o centro, resistência = recupera stamina, equilíbrio = aleatória. O **Avatar Attack** é outro evento de tempo ("toque na hora certa"), com 50–100% do dano conforme a precisão (mesma fonte).
- Nas tops com Bluetooth (Hasbro), deslizar para os lados muda o sentido e a velocidade do giro, e carregar energia libera o Avatar Attack ([Hasbro Newsroom](https://newsroom.hasbro.com/node/13216); [App Store](https://apps.apple.com/app/id1143164520)).
- O app perdeu as funções online em 20/08/2024 (versão 11.1.6) e aponta para o app do Beyblade X (App Store). Não achamos fonte confiável de mecânica nova de lançamento nas versões Surge e Rise, nem no app do X, onde só a medição de velocidade por acessório é citada. Páginas que descrevem "medidor de força e ângulo de 45°" no app do X parecem geradas automaticamente e foram descartadas.

No mundo real, a força do lançamento vem de puxar o ripcord **reto, rápido e até o fim**, com o lançador nivelado. Lançar inclinado ou fraco faz a bey cambalear e perder giro logo no começo. Isso fundamenta as regras de precisão abaixo ([World Beyblade Organization: dicas de lançamento](https://worldbeyblade.org/Thread-Tips-for-getting-the-best-launches-and-types-of-shooting-techniques); [Beyblade Art Shop: técnicas de lançamento](https://beybladeartshop.com/blogs/articles/launch-techniques-beyblade-battles)).

O jogo de GBA tem **lançamento antecipado** ("Premature launch"), lançadores e ripcords que influenciam o resultado, e a dica "você tira mais força da bey com um ripcord mais longo" **(ROM)**; ver [GAME_FLOW.md](GAME_FLOW.md#lançador-e-ripcord).

## Como fica no nosso jogo

Substitui o lançamento atual (uma barra em triângulo de 0,9 s, um aperto de ✕ trava a força, `src/sim/match.js`).

### Fluxo

1. **Mirar (contagem 3-2-1).** O analógico esquerdo, ou as setas, posiciona o **ponto de entrada** na beira do estádio, num arco de cerca de 90° do lado de cada jogador. Esse é o "lugar exato" do app: lançar perto do inimigo arrisca um choque logo de cara; lançar longe dá tempo de pegar velocidade. A direção inicial segue tangente à tigela, como hoje.
2. **Puxar o ripcord: 10 batidas.** Um **anel se fecha sobre o alvo**, em cima da bey, 10 vezes seguidas, num ritmo que acelera de leve (0,42 s → 0,30 s por batida, ~3,6 s no total). O jogador aperta **✕** (teclado: F para o P1, K para o P2) quando o anel encosta no alvo.
   - A janela de acerto **estreita a cada batida**, como no app: de ±110 ms na primeira a ±45 ms na décima.
   - Cada batida é julgada: **Perfeito** (terço central da janela), **Bom** (resto da janela) ou **Errou** (fora dela ou sem apertar).
   - Apertar duas vezes na mesma batida conta como erro: tocar o botão sem parar não compensa.
3. **Soltar.** Depois da décima batida, a bey entra na arena com a energia acumulada.

### Energia → giro

- O medidor começa em 0 e sobe por batida: **Perfeito +10%**, **Bom +6%**, **Errou 0**.
- O giro inicial é `spin = 0,55 + 0,45 × energia`, a mesma faixa de hoje (0,55–1).
- **Lançamento Perfeito:** **8 ou mais Perfeitos** em 10. O giro entra **acima do máximo**, `spin = 1,1`, e o excedente vai sendo gasto normalmente. Aparece "Lançamento perfeito!", o evento `perfect` que a interface já trata.
- **Precisão da direção:** cada erro soma um desvio de ângulo e velocidade no lançamento, a bey "cambaleando" de um lançamento torto. O sorteio com semente que já existe continua, para as órbitas não ficarem espelhadas.
- **Lançamento antecipado (GBA):** apertar ✕ antes do primeiro anel, ainda na mira, solta a bey na hora com a energia que tiver (0). É um erro do jogador, não um atalho.

### Lançador e ripcord (D-010, D-021)

Cada personagem entra com o seu lançador e ripcord. Os atributos são extraídos da ROM: a tabela de lançadores em `0x7aeec` e a de ripcords em `0x7aefc`.

- **Ripcord** mais longo = **mais energia por acerto**, até +2 pontos por Perfeito, seguindo a dica do GBA.
- **Lançador** melhor = **janela um pouco mais larga**, até +15 ms.

Os dois efeitos são pequenos de propósito. Quem decide a partida tem que ser a batalha, não o lançamento: as resenhas do GBA reclamavam que o RPM inicial decidia tudo (GAME_FLOW.md).

### CPU

A CPU "aperta" com um erro sorteado conforme `cpuNivel` (1–5): no nível 1 acerta ~40% das batidas; no 5, ~90%, com 50% de Perfeito. O sorteio usa a semente da partida (determinístico).

### Interface

- Anel que se fecha sobre a bey de cada jogador, nas cores de P1 e P2. Cada batida tem um clique (catraca do ripcord).
- Rótulo rápido em cada batida: "Perfeito!", "Bom" ou "Errou".
- Medidor "Energia" no lugar da "Força do lançamento", e uma faixa de 10 casas que acende conforme os acertos.
- Ao final, um clarão com o lançamento, e "Lançamento perfeito!" quando for o caso.
- Com `prefers-reduced-motion`, o anel vira uma barra que enche, com a mesma janela de tempo.

### Contrato com a simulação

O sim continua puro e determinístico, a 60 ticks/s:

- **estado:** `state.launch[slot] = { aim, beat, hits: [...], energy, early }`;
- **eventos:**
  - `launchBeat` (`slot`, `n`, `ticks até o alvo`), para a interface desenhar o anel;
  - `launchHit` (`slot`, `n`, `nota: 'perfeito' | 'bom' | 'errou'`, `energy`);
  - `perfect` e `go`, como hoje;
- `launchPower(state, slot)` passa a devolver a energia acumulada, e o HUD continua lendo como hoje.

Os testes (`tests/`) devem cobrir:

- a janela estreita a cada batida;
- 8 Perfeitos dão giro 1,1;
- apertar repetido conta como erro;
- o lançamento antecipado;
- a CPU determinística por semente.

## Implementação (2026-10-25)

- Lógica pura em `src/sim/launch.js` (`LAUNCH` com todos os números, `stepLaunchSlot`, `launchSpin`, `cpuLaunchPress`, `launchHud`); testes em `tests/launch.test.js`.
- `src/sim/match.js`: o lançamento termina quando os dois acabam as 10 batidas (ou soltam antes da hora), nunca antes da contagem. A bey acompanha a mira na beira da arena durante a contagem, e a direção de entrada gira junto. Cada batida errada soma 0,05 rad de desvio e abre a variação da força ("lançamento torto").
- A 60 Hz, o Perfeito é o terço central da janela, mas nunca menor que o próprio tick (±16 ms).
- Sem apertar nada, a bey entra com 0% de energia (giro 0,55) e, devagar demais, espirala até o centro. Os testes de órbita e o playtest usam um lançamento médio (3 Perfeitos e 1 Bom = 36%), perto da força padrão antiga (35%) em que a física foi calibrada.
- CPU (`src/sim/ai.js`): `cpuLaunchPress`, de ~40% (nível 1) a ~90% de acertos (nível 5).
- HUD (`battle-screen.jsx`): alvo com o anel que fecha, barra da mira na contagem, 10 casas (Perfeito em destaque, Bom claro, Errou apagado) e o medidor "Energia do lançamento"; estalo de interface e vibração em cada acerto.
- **Falta:** o efeito do lançador e do ripcord de cada personagem (o `bonus` de `stepLaunchSlot` já existe, sem dados ligados); a versão de barra para `prefers-reduced-motion`.

## Fontes

- Beyblade Wiki, *Beyblade Burst App*: https://beyblade.fandom.com/wiki/Beyblade_Burst_App
- App Store, *BEYBLADE BURST app*: https://apps.apple.com/app/id1143164520
- Hasbro Newsroom, lançamento do app: https://newsroom.hasbro.com/node/13216
- World Beyblade Organization, dicas de lançamento: https://worldbeyblade.org/Thread-Tips-for-getting-the-best-launches-and-types-of-shooting-techniques
- Beyblade Art Shop, técnicas de lançamento: https://beybladeartshop.com/blogs/articles/launch-techniques-beyblade-battles
- ROM do GBA (lançamento antecipado, lançadores, ripcords): [REVERSE_ENGINEERING.md](REVERSE_ENGINEERING.md)
