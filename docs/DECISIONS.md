# Registro de decisões

Toda decisão de produto ou técnica tomada durante o desenvolvimento entra aqui, a mais recente no topo. Uma decisão só muda com uma nova entrada que a substitua (marque a antiga como **Substituída por D-XXX**); não apague o histórico.

Formato:

```
## D-XXX: título curto
- Data: AAAA-MM-DD
- Status: Aceita | Substituída por D-YYY
- Contexto: por que a decisão foi necessária
- Decisão: o que foi decidido
- Consequências: o que isso implica no código, nos testes e na documentação
```

---

## D-052: giro como vida, lado do golpe, pisão, inclinação e Engine Gear

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu (pela outra sessão), pensando em física: a batalha durar mais, com o giro como barra de vida (o tempo gasta pouco e os choques gastam mais); a força do impacto depender do giro, do peso e da aceleração; golpe pelas costas tirar mais e de frente menos, dividido entre os dois; golpe pulando em cima empurrar para longe e desequilibrar; a bey ter uma inclinação que define o movimento; e o Engine Gear recuperar 40% do giro (60% na ataque), demorar a recarregar e, depois de usado, o giro gastar um pouco mais rápido.
- Decisão:
  - **giro como vida:** perda à toa 0,011 → 0,006 por segundo (parada, a bey dura 2 a 3 minutos); o choque é o que mais gasta;
  - **força do golpe:** o dano que uma bey causa escala com a parte da massa dela no choque e, em 25%, com o giro dela; a velocidade (aceleração da investida) já entra no impacto. Com peso maior no giro, o playtest mostrou bola de neve: quem perdia giro primeiro batia cada vez mais fraco e perdia sempre;
  - **lado do golpe (`HIT_ANGLE`):** pelas costas (o alvo já andava para longe de quem bate) até +60%; de frente até −30%, e o dano das duas se aproxima da média. Medido com as velocidades de antes do empurrão (o teste achou que medir depois invertia o lado);
  - **pisão (`STOMP`):** cair do pulo em cima da outra empurra pela massa de quem cai, tira giro e inclina muito o eixo dela; contra o escudo, conta como uma pancada forte;
  - **inclinação (`TILT`):** cada bey tem um desvio do eixo, somado à inclinação da rampa. A ponta rola de lado em relação a essa inclinação, no sentido do giro (sem desvio, é a órbita de sempre; com desvio, a bey vai para onde foi empurrada). Choques e pisões inclinam na direção do empurrão; o giro endireita o eixo (efeito giroscópico, mais rápido com mais giro); inclinada, a bey perde tração e a borda raspa e gasta giro;
  - **Engine Gear (`ENGINE_GEAR`):** +40% de giro (+60% na ataque), recarga de 30 s e, até o fim da rodada, perda de giro ×1,3;
  - recalibrado pelo playtest: dano por impacto `0,00007/S`; crítico ×6,2. Medido (20 partidas): ataque afobada 0% contra a defesa, precisa 35%; espelho 45%; rodada com investidas ~24 s (antes ~19 s); CPU × CPU ~35 a 45 s.
- Consequências: testes em `tests/fisica-giro.test.js` (Engine Gear e recarga, gasto maior depois, giro dura parado, costas × frente na mesma aproximação, pisão, inclinação que move e endireita). O playtest passou a alternar quem fica defasado no espelho, e `playtest` e `cpu:duelo` aceitam `TUNE` para testar valores sem mexer no código.

## D-052: entrada na arena mais realista e seleção com bey e arena aleatórias

- Data: 2026-10-25
- Status: Aceita (usa a D-047 e a D-050)
- Contexto: o usuário pediu a animação dos personagens indo para o estádio mais realista e reclamou que aparecia só um círculo, com os personagens parando em cima da arena e não ao lado. Também pediu a "foto do lugar" na escolha do estádio e a bey aleatória na seleção.
- Decisão:
  - **entrada** (`src/game/walk-in.js`, pura, e `walk-in.jsx`):
    - o estádio de verdade (`desenharEstadio`, D-050) deitado em perspectiva;
    - os dois entram pelas laterais andando de lado com os quadros do GBA (P1 espelhado, porque os quadros olham para a esquerda) e **freiam** até parar ao lado do prato, virados para ele;
    - o quadro da caminhada segue a **distância andada**, não o relógio, então o pé não escorrega; um pulinho no meio do passo e uma sombra no chão; a câmera recua devagar;
    - no fim, os retratos (PS1 "bravo" ou o retrato do jogo) cruzam a tela com o VS. São ~4,8 s no total;
  - **arena aleatória** sorteada na própria seleção, entre os cenários do anime, para a entrada mostrar o mesmo lugar da batalha; só fica `aleatoria` se não houver cenário na lista;
  - **miniaturas da escolha de arena** com o mesmo desenho do estádio (chão do lugar + prato), um canvas por card;
  - **bey aleatória**: última opção do carrossel de quem tem mais de uma bey ("?", "Sorteia uma das N"); vai como `b=aleatoria` e a batalha sorteia (D-047).
- Consequências: `walkInFrame` (caminhada de costas) sai de `src/content/gba.js`; testes em `tests/walk-in.test.js` e `tests/select-state.test.js`.

## D-051: CPU que raciocina e CPU × CPU por comando

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu que a CPU raciocine (ataque, defenda, ative o Engine Gear e a fera bit, escolha como se mover) e que dê para pôr duas CPUs para batalhar só por comando, para testar e mapear o comportamento e os pontos de melhoria.
- Decisão: `src/sim/ai.js` (`createCpu({ slot, nivel, seed })`), pura e determinística, com sorteio próprio: a cada olhada escolhe uma intenção (fera, Engine Gear, defender, esquivar, carregar/investir, rondar ou segurar o centro), registrada com o motivo em `log`; níveis 1 a 5 mudam reação, precisão no estalo, mira, ousadia, defesa e lançamento. A batalha usa a CPU no P2 em 1 × CPU e arcade (`cpuNivel`, padrão 3); no treino o P2 é um boneco. `npm run cpu:duelo` joga CPU × CPU sem tela e imprime o relatório com pontos de melhoria. Achado no caminho: o loop da batalha apagava as bordas de todos os comandos nos ticks extras do frame, o que perderia o aperto do lançamento da CPU; agora só as do controle.
- Consequências: [`IA.md`](IA.md) (raciocínio, níveis, medições, pontos de melhoria); testes em `tests/ai.test.js` (determinismo, lançamento, usa ataque/defesa/fera/Engine Gear, nível alto solta mais no estalo, defende a investida).

## D-050: estádio de verdade para a entrada na arena e a escolha do estádio

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário reclamou que na entrada na arena aparece só um círculo, e não a arena de verdade (com o fundo da tigela), e pediu a "foto do lugar" na escolha do estádio em vez da cor.
- Decisão: `src/render/estadio-preview.js` exporta `desenharEstadio(canvas, cenario)`, que desenha parado, com o mesmo render da batalha, o chão do cenário e o prato (tigela funda, curvas de nível, parede, bolsos). A "foto" de cada lugar é esse desenho próprio (nenhum quadro do anime). A entrada na arena e a grade de estádios são telas da outra sessão, que passam a usar a função e põem os personagens nas laterais do prato.
- Consequências: `ArenaRenderer.desenharParado()` (sem beys).

## D-048: encostar já dá dano, faísca e empurra; escudo gasta no contato

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu (pela outra sessão) que as beys, só de relar, já tirem giro, soltem faísca e empurrem a outra, e que com o escudo levantado o contato também o gaste.
- Decisão: quando as beys se sobrepõem sem velocidade de aproximação (raspão), o atrito das bordas girando tira giro de cada uma (`rubDamage` × giro médio, por tempo de contato), empurra uma para longe da outra pelo giro (`rubPush`, dividido pela massa) e solta o evento `contato` (faísca pequena, sem som nem vibração, no máximo a cada 0,08 s). Choque abaixo do limiar de "hit" também solta `contato`. Com o escudo levantado, o raspão gasta a vida dele por tempo (`SHIELD.contactWear`, 18% por segundo encostado) e qualquer pancada tira no mínimo 6% de `perHit`; a regra de duas pancadas fortes da D-042 continua.
- Consequências: testes em `tests/critico.test.js` (raspão tira giro, afasta e solta faísca; escudo gasta encostado). Playtest dentro do esperado.

## D-049: lançamento no ritmo, estilo Beyblade Burst app

- Data: 2026-10-25
- Status: Aceita (especificação; implementação no sim pela sessão da batalha)
- Contexto: o usuário pediu para trazer o lançamento do Beyblade Burst app ("acertar o local exato no clique e ir aumentando a energia final"), pesquisado na web e documentado.
- Decisão: mira do ponto de entrada na contagem; 10 batidas com um anel que se fecha sobre a bey e janela que estreita (±110 → ±45 ms); Perfeito +10%, Bom +6%; **8 Perfeitos = Lançamento Perfeito** com giro 1,1 (acima do máximo, como no app); erros entortam o lançamento; o lançamento antecipado do GBA solta na hora sem energia; ripcord e lançador dão efeitos pequenos para o lançamento não decidir a partida. Detalhes, contrato com o sim e fontes em [`LAUNCH.md`](LAUNCH.md).
- Consequências: substitui a barra em triângulo de um aperto (`src/sim/match.js`); testes listados em LAUNCH.md.

## D-047: bey aleatória na seleção

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu a opção "aleatório" também na escolha das beys.
- Decisão: `b1`/`b2` aceitam `aleatoria`; a página da batalha sorteia uma das beys **do próprio personagem** (`src/content/sorteio.js`, `sortearBey`), no servidor, para a bey não mudar entre o HTML e a hidratação. A opção "Aleatória" no carrossel de beys é da tela de seleção (outra sessão), que só precisa mandar `b1=aleatoria`.
- Consequências: testes em `tests/sorteio.test.js`.

## D-046: retratos do G-Revolution da wiki para quem não está no PS1

- Data: 2026-10-25
- Status: Aceita (completa a D-033 e a D-040)
- Contexto: depois dos retratos do PS1 (D-040), Tala, Bryan, Brooklyn, Lee e Robert continuavam com o retrato próprio. O usuário pediu para buscar na web a aparência deles e trazê-la para todos ficarem com a aparência real.
- Decisão:
  - `scripts/retratos-wiki.js` (`npm run art:wiki`) baixa pela API da Beyblade Wiki a arte do G-Revolution de cada um: arte oficial do Lee, do Tala e do Bryan; wallpaper oficial do Brooklyn; um quadro do anime do Robert (a wiki não tem arte oficial dele no G-Rev). Recorta o busto em 4:5, tira o fundo e amplia para 512×640;
  - fundo: preenchimento a partir das bordas, por cor parecida (fundo branco) ou por teste de cor (fundo estampado azul do Brooklyn, parede verde do Robert), parado pelo contorno escuro do anime;
  - **raster embutido em vez de vetor:** traçar imagens tão pequenas (160–340 px) deu 2–4 MB de ruído por retrato. O PNG ampliado com Lanczos vai dentro de um `retrato.svg` (~0,4–0,6 MB), então o caminho `retrato(slug)` não muda;
  - como na D-033, tudo fica em `assets-usuario/` (fora do git) e o `sync-art` põe o retrato no lugar do próprio; apagar `assets-usuario/personagens/vetor/<slug>.svg` volta ao retrato próprio.
- Consequências: o recorte e o fundo de cada um estão em `RETRATOS_WIKI` (versionado, só nomes de arquivo e números). Robert sai de um quadro do anime, com resto de parede no canto; trocar por arte oficial quando aparecer. Passo a passo em [`ART.md`](ART.md#retratos-do-g-revolution-da-wiki-d-046).

## D-045: sem burst; só vitória por giro e por ring out

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário lembrou que neste jogo (era Bakuten Shoot) não existe burst: só vitória por resistência e por tirar da arena.
- Decisão: a simulação não tem mais burst (estado, chance por impacto e finalização); a rodada acaba por **parada** (giro), **decisão** (mais giro quando o tempo acaba), **fora** (ring out) ou empate. Sem o burst, o playtest mostrou que o ring out tinha ficado impossível: ao baixar o ritmo (D-041), a velocidade de saída não acompanhou e a da borda ficou acima do teto de velocidade. As duas foram escaladas na mesma proporção (bolso 260 → 200, borda 650 → 500, ×S). Contra a defesa no centro (fisicamente difícil de tirar: subir da metade da tigela até a borda pede ~1,6 m/s), o crítico vence tirando giro: ×4 no alvo e quem acerta sente 40% do choque.
- Consequências: medido (20 partidas): ataque afobada 0% contra a defesa, precisa 55%. Testes: o de finalizações não aceita mais `burst`; nos testes, "tirar a outra bey do palco" usa o estado `out`. A API ainda aceita `burst` no histórico, para não invalidar partidas antigas.

## D-044: sem barra de abas; o jogo ocupa a tela inteira

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu para tirar o cabeçalho com Início, Personagens e Batalha no topo, que fazia o jogo parecer um site.
- Decisão: a casca (`game-shell.jsx`) não tem mais cabeçalho nem a troca de aba por L1/R1 (Q/E); o jogo ocupa a janela inteira (`h-dvh`) e cada tela tem a própria navegação de jogo: ✕ avança, ○ volta, Options pausa (a pausa da batalha sai para a seleção). A casca guarda só a abertura e a música de cada tela. As telas que descontavam a altura da barra (`calc(100dvh - 3.5rem)`) passaram a `h-dvh`, inclusive as da outra sessão (só essa classe). As skills instaladas não têm nada específico de jogo para isto; a regra veio do D-022 (nada de "cara de app").
- Consequências: substitui a parte de abas da D-025 (`dev:all` continua abrindo o jogo no Electron).

## D-043: playtest automático e empurrão do choque limitado pela física

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu um md para eu testar o jogo jogando e achar falhas básicas, sempre pensando em física e em como as coisas deveriam se comportar.
- Decisão:
  - [`PLAYTEST.md`](PLAYTEST.md) com os princípios de física (momento, energia, gravidade na tigela, atrito, giro, tipos, colisão) e o roteiro do playtest na tela; `npm run playtest` (`scripts/playtest.js`) joga partidas com jogadores roteirizados (`nada`, `afobado`, `preciso`), confere invariantes a cada tick (NaN, fora da arena, giro fora de 0–1, velocidade absurda, beys atravessadas) e expectativas de equilíbrio por tipo e por cenário;
  - o primeiro playtest achou um erro de física: o crítico multiplicava o empurrão inteiro e jogava a defesa a ~3,5 m/s, mais rápido do que o ataque chegou. O empurrão de cada bey agora é limitado pela parte do impulso que cabe a ela (conservação do momento) mais um empurrão normal do giro; no crítico, o giro no ponto certo rende até 1,6× essa parte (`CRITICAL.pushShare`). Para o crítico continuar valendo sem inventar energia, ele tira mais giro do alvo (×3) e quem acerta sente metade do choque (`CRITICAL.selfDamage`);
  - medido depois (20 partidas): ataque afobada vence a defesa em 5%, a precisa (quadro a quadro) em 40%; parada, 0%.
- Consequências: o evento `hit` leva o empurrão de cada bey (`empurrao`); regressão em `tests/critico.test.js`, confirmada falhando sem a correção. Rodar o playtest depois de mexer em física ou regras.

## D-042: escudo com vida, que segura o desgaste e quebra como vidro

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu que, ao bater numa bey de escudo levantado, só quem atacou sofra o desgaste; que o escudo tenha vida, aguente duas pancadas e quebre com animação de vidro e som; e que recarregue quando não usado, bem devagar. Também pediu que toda correção ganhe teste de regressão (registrado no `CLAUDE.md`).
- Decisão:
  - com ○ segurado e o escudo inteiro, a bey que defende **não perde giro no choque**; quem bateu perde normalmente;
  - o escudo tem vida 0–1 (`SHIELD`): cada pancada tira até 0,5 pela força (forte = `strongImpact` ou mais), então **duas pancadas fortes quebram**; um crítico tira em dobro e quebra sozinho; choque fraco só arranha;
  - quebrado, ele cai na hora e não levanta até recarregar 25%; fora de uso, recarrega 3% por segundo (~33 s do zero ao cheio);
  - visual: o hexágono fica mais transparente e racha conforme perde vida; ao quebrar, 18 cacos de vidro saem girando com um clarão e o aviso entra depois deles; som de vidro sintetizado (`src/audio/sfx.js`, ruído agudo + tilintar); painel com a barra "Escudo".
- Consequências: testes em `tests/critico.test.js` (sem desgaste com escudo, quebra na segunda pancada, não levanta quebrado, recarrega).

## D-041: ritmo mais lento, giro gasto nos choques e golpe crítico difícil

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário achou a batalha rápida demais e notou que a ataque tinha 0% de chance contra a defesa. Pediu golpes críticos, feitos de maneira exata (ponto e momento do choque), para a ataque poder vencer a defesa só com jogo muito bom; e que, depois de atacar, a bey que volta a correr em volta gaste pouco giro, com os choques sendo o maior desgaste.
- Decisão:
  - **ritmo:** `maxSpeed` 650 → 500 e investida 430 → 360 (×S); perda de giro parada 0,018 → 0,011 por segundo, investida 0,03 → 0,01; o choque vira o maior gasto (força do impacto + atrito de contato `contactDamage`); burst só acima de 450 (×S) de impacto;
  - **crítico (`CRITICAL`):** soltar ✕ até 0,08 s depois do estalo da carga cheia arma a investida perfeita por 0,35 s. Ela só vira crítico se o choque for **de frente** (a no máximo ~12° da linha entre os centros) e no **ponto certo**, empurrando o alvo para a borda (de dentro para fora). No crítico, o recuo do tipo e a defesa segurada do alvo quase não protegem (recuo ×2,4 com piso em 1) e o dano de giro é ×2,4; quem acerta recua pela metade. Aparece "Crítico!", com faíscas, vibração e câmera lenta curta;
  - medido com duelos automáticos (Dragoon G × Draciel G, 30 partidas): investindo sem soltar no estalo, a ataque vence 0 a 3%; soltando sempre no estalo e só de perto, cerca de 50%. Rodada com investidas ~20 s (antes ~12 s); sem investir, ~60 s.
- Consequências: testes em `tests/critico.test.js` (crítico só no estalo, de frente e para fora) e o de mira reescrito em `tests/sim.test.js` (`aimAt` exportado). O painel de comandos explica o crítico.

## D-040: retratos e feras bit do jogo de PS1 no jogo, ampliados com Scale4x

- Data: 2026-10-25
- Status: Aceita (é a primeira peça do PS1 que entra no jogo, como previa a D-031)
- Contexto: o usuário pediu para usar os retratos do PS1 (Bey Battle Tournament 2) na seleção, com qualidade melhor (vetorizados ou aprimorados), e fazer o mesmo com as feras bit. A descompressão ECD foi resolvida e o disco tem retratos de meio-corpo com expressões (`BCHR`, 128×128) e feras bit em arte do anime (`BSJEF`, 256×128).
- Decisão:
  - os retratos do PS1 substituem o retrato vetorial na seleção dos personagens que existem nele (Tyson, Kai, Ray, Max, Daichi), com expressões: normal parado, comemorando ao travar a escolha; os demais continuam com o retrato próprio;
  - as feras bit do PS1 aparecem atrás do personagem ao travar a escolha (Dragoon, Dranzer, Draciel, Driger);
  - qualidade: **Scale2x aplicado duas vezes (4×)**, algoritmo próprio para pixel art (bordas lisas sem borrar). A vetorização foi testada e ficou mais serrilhada e pesada (~340 KB por retrato), então fica de fora;
  - como na D-007, o material do PS1 **não entra no git**: é gerado em `public/ps1/` por `scripts/build-ps1-assets.js` a partir do disco extraído; sem ele, o jogo cai na arte própria.
- Consequências: mapeamento em `src/content/ps1.js` (índices, versionado). Substitui em parte a D-008 só para esses retratos e feras, no uso pessoal; antes de qualquer distribuição, voltam a ser arte própria.

## D-039: cenários clássicos do anime como estádios, sorteados no início

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu os cenários clássicos do anime (a piscina pública, o parque etc.) dentro do jogo, mapeados e, no início, sorteados.
- Decisão:
  - mapa de 26 lugares, com episódio, quem batalhou, descrição de cima, paleta sugerida e regra, em [`CENARIOS.md`](CENARIOS.md). A lembrança da piscina foi corrigida: é no G-Revolution, ep. 3, com o Daichi; a boia é ideia do jogo, não do anime;
  - primeira leva de **10 cenários** em `src/content/cenarios.js` (módulo puro, também lido pela seleção): piscina pública, parque do lago, terraço dos Blade Sharks, BB Shop, becos de Hong Kong, torres da China, lago Baikal, prato de gelo da final, praia de treino e estádio da BEGA;
  - cada um tem **regras** que a simulação aplica (`createMatch({ regras })`): `atrito` (gelo 0,4; areia 1,8), `ringOut: false` (parede alta ou grade), `saida` (sair mais fácil, ex.: torres 0,7), `vento` (terraço) e `giro` (frio drena mais), e um **tema** que o render desenha uma vez em cache: o chão do lugar em volta do prato (`src/render/cenario-fundo.js`), as cores da tigela e da parede, a boia da piscina e as grades da BEGA;
  - contrato da arena: `arena=<slug>` | `rom-0…rom-5` (tigela com a imagem do estádio do GBA, sem regra) | ausente ou `aleatoria` → sorteio entre os cenários do anime, de novo a cada partida. O painel mostra o lugar, o episódio e a regra;
  - toda a arte é própria e desenhada em código; nenhum quadro do anime é usado.
- Consequências: testes em `tests/cenarios.test.js` (catálogo, resolução da arena, gelo × areia, parede alta, vento, frio). Os outros 16 lugares do mapa entram em levas seguintes.

## D-038: abertura do G-Revolution em vídeo e a música dela na tela inicial

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário mandou a abertura do anime em vídeo (MP4) para ser a abertura do jogo e o MP3 só com a música, como opção.
- Decisão: o vídeo fica em `public/video/abertura.mp4` e a música em `public/audio/musica/abertura.mp3`, **fora do git** como as outras faixas (D-030). Ao abrir o jogo pela tela inicial, o vídeo toca em tela cheia **uma vez por sessão** (`sessionStorage`); ✕ / F / Enter, ○ ou Esc pulam. A tela inicial só monta depois, para o mesmo botão não confirmar as duas coisas. Sem o arquivo, ou se o navegador recusar tocar, a abertura some sem erro. A tela inicial passa a tocar a música da abertura; a faixa de fundo #2 (`inicio`) fica para as outras telas de menu (modos, arcade).
- Consequências: `src/components/game/intro-video.jsx`; mapa das faixas em [`AUDIO.md`](AUDIO.md#músicas-de-fundo-d-030).

## D-037: ROM de DS (Metal Fusion) como referência de design de combate

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário mandou a ROM de DS *Beyblade: Metal Fusion* para engenharia reversa da gameplay (controles, estilo de combate), avisando que as beys e personagens desse jogo não entram no nosso.
- Decisão: a ROM é só referência de **design de combate**. `scripts/extract-nds.js` (com `scripts/lib/nitrofs.js`: cabeçalho, FNT/FAT, overlays, NARC, LZ10/LZ11) extrai para `../nds-metal-fusion/`, fora do repositório, e recusa saída dentro dele; nada da ROM vai para o git (mesmas regras da D-007 e da D-031). Não se extrai arte, beys nem personagens.
- Consequências: achados em [`NDS_METAL_FUSION.md`](NDS_METAL_FUSION.md). O combate de lá é todo na caneta (deslizar = investida com rastro de fogo, tocar = pulo, tocar na própria bey = defesa, segurar = recuperar giro e equilíbrio), com medidor SPIRIT em barras e pontos por tipo de vitória; as ideias para o DualShock 4 estão no fim do doc e cada uma entra por decisão própria.

## D-036: choques que afastam pela força, investida mirada e a fera bit que sai

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu choques mais realistas (as beys se afastam um pouco, mais quanto mais forte o impacto, com faísca), que o ataque carregado vá na direção da outra bey ("está jogando em qualquer lugar") e que o especial faça a fera bit brilhar e aparecer em cima, com a bey "pegando fogo" e um brilho mostrando que a fera saiu. Pela outra sessão, também pediu a fera em 3D, todos os atributos subindo por um tempo limitado e voltando depois.
- Decisão:
  - **choque:** o recuo do giro passa a crescer com o impacto (0,3× a 2,5× do valor base); medido, a distância 20 ticks depois vai de ~100 mm num toque a ~330 mm numa pancada; faíscas mais numerosas e um clarão no ponto do choque proporcional à força, com velocidade limitada para não saírem da arena;
  - **investida:** ao soltar ✕ ela sempre mira na outra bey, antecipando onde ela vai estar (até 0,35 s); o direcional só corrige a mira em até ±25°; a velocidade da investida troca a direção em vez de se somar à da órbita;
  - **fera bit:** L1 + R1 com a barra cheia solta a fera por `FERA.seconds` (8 s): ataque, defesa, peso, resistência a KO, velocidade (incluindo o teto do tipo da D-032) e stamina ×`FERA.boost` (1,25); o golpe próprio do tipo continua por cima. Não acumula: com a fera fora, L1 + R1 não invoca de novo. Ao acabar, o evento `feraEnd` avisa e os valores voltam;
  - **visual:** clarão com raios na cor da fera (a coluna de luz vista de cima) e câmera lenta de 0,9 s só no relógio do loop (a simulação segue determinística); a arte `invocacao.svg` sai da bey em pseudo-3D (CSS `perspective` + `rotateX`/`scale`, só transform e opacity) e fica translúcida acompanhando a bey; a bey ganha línguas de fogo na cor da fera e o chip brilha; o painel mostra a contagem e "+25%". Com movimento reduzido não há câmera lenta, raios nem animação 3D.
- Consequências: testes em `tests/sim.test.js` (mira com o direcional para trás, afastamento maior na pancada, fera com tempo e sem acumular). Em desenvolvimento, `window.__batalha` expõe o estado para os scripts de verificação.

## D-035: modos na batalha (versus, CPU, arcade e treino)

- Data: 2026-10-25
- Status: Aceita
- Contexto: a outra sessão montou os modos Arcade e Treino (D-005) e combinou o contrato com a batalha.
- Decisão: `/batalha` aceita `modo=versus|cpu|arcade|treino`, `etapa=<0..20>` (0 = primeira luta) e `cpuNivel=<1..5>` (valores fora disso caem no padrão; `cpu=2` continua valendo e equivale a `modo=cpu`). Fora do versus o P2 é da máquina (neutro até existir a IA, que vai ler `cpuNivel`). **Arcade:** o resultado mostra só "Continuar", que vai para `/arcade?etapa=<n>&resultado=vitoria|derrota`; a pausa volta para o arcade. **Treino:** `createMatch({ treino: true })` tira o relógio, não conta pontos e o boneco (P2) não perde giro; a pausa tem "Reiniciar" (L1 / R, porque ✕ já é confirmar).
- Consequências: teste em `tests/sim.test.js`; as telas `/modos` e `/arcade` são da outra sessão.

## D-034: `dev:all` fecha quem estiver na porta e abre de novo

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu que todo `pnpm run dev:all` feche o que estiver na porta e a abra de novo, em vez de parar com "porta em uso".
- Decisão: antes de subir o jogo (5000) e a landing (3000), o `scripts/dev-all.js` acha quem escuta na porta (`netstat -ano` + `tasklist` no Windows, `lsof` fora dele), encerra a árvore do processo e espera a porta liberar. A porta nunca é trocada. **Exceção:** processo do Docker (`com.docker*`, `wslrelay`, `vpnkit`) não é derrubado, porque levaria junto todos os contêineres do usuário; o script avisa qual porta é de contêiner e segue (a landing não sobe; o jogo para).
- Consequências: rodar `dev:all` de novo fecha a janela e o servidor anteriores. Hoje a 3000 é de um contêiner do usuário (`talentum-local-1`), então a landing continua sem subir até ele ser parado.

## D-032: movimento no estilo do app da Burst, com teto de velocidade por tipo

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário (via a outra sessão) pediu o movimento mais parecido com o do app da Beyblade Burst, a bey "ainda acelera muito" e cada tipo deve ter teto de velocidade (ataque a mais rápida), mas uma pancada forte ainda tem que jogar para fora.
- Decisão:
  - a força **própria** (rampa, ponta, comando) não leva a bey acima do teto do tipo, em fração de `PHYSICS.maxSpeed`: ataque 1,00, equilíbrio 0,80, defesa 0,65, resistência 0,50 (`TYPES.*.cap`). Acima do teto ela pode mudar de direção, não ganhar velocidade;
  - o que um **choque**, a investida ou o especial dão acima do teto não é cortado: o excesso decai com meia-vida de 0,25 s (`MOTION.excessHalfLife`), então a pancada ainda chega à borda e aos bolsos;
  - o **comando guia** em vez de dirigir: 45% vira empurrão (com teto na tração da ponta) e o resto curva a trajetória sem ganhar velocidade, em arco.
- Consequências: medido em `tests/sim-bowl.test.js` (ordem das velocidades máximas por tipo, excesso que decai sem corte imediato, ring out por pancada). A ataque agora corre em órbita larga pela borda em vez de cruzar o centro. Ainda falta a investida "sobe na borda e mergulha no oponente" do app.

## D-033: retratos do G-Revolution vetorizados de imagens do usuário

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu os personagens com a aparência real do G-Revolution, a partir de imagens do anime vetorizadas. A ROM do GBA não tem retratos (só bonecos 16×32; levantado pela outra sessão).
- Decisão: o usuário escolhe e salva as imagens em `assets-usuario/personagens/<slug>.*`; `scripts/vetorizar-retratos.js` (sharp para quantizar com paleta exata e alfa binário, imagetracerjs para traçar em 2×) gera o SVG 512×640, e o `sync-art` usa esse vetor no lugar do retrato próprio. O projeto não baixa frames do anime. Tudo em `assets-usuario/` fica fora do git, como a ROM (D-007).
- Consequências: `imagetracerjs` e `sharp` como dependências de desenvolvimento; passo a passo em [`ART.md`](ART.md#retratos-do-anime-vetorizados-d-033). D-032 fica reservada para a física do movimento (em andamento).

## D-031: jogo de PS1 como segunda referência, extraído fora do repositório

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário trouxe *Bakuten Shoot Beyblade 2002: Bey Battle Tournament 2* (PS1, Japão, SLPM-87130), cujas funcionalidades estão mais próximas da proposta final, e pediu para começar a engenharia reversa "separado, sem afetar os jogos", convertendo e guardando primeiro e extraindo aos poucos depois.
- Decisão:
  - o disco (BIN/CUE) é convertido e extraído por `scripts/extract-ps1.js` para **`../ps1-bbt2/`, fora do repositório** (ISO, arquivos e `manifest.json`); o script recusa uma saída dentro do repositório;
  - nada do PS1 entra no jogo por enquanto; cada coisa aproveitada vem depois, em atualizações próprias, com decisão registrada;
  - as mesmas regras da D-007 valem: o disco e tudo o que sair dele nunca vão para o git.
- Consequências: código do extrator e testes (ISO sintética) no repositório; mapa do disco e próximos passos em [`PS1.md`](PS1.md). O jogo de PS1 é 3D, então é a referência natural para a refatoração 3D (D-006).

## D-030: músicas de fundo baixadas pelo usuário, fora do git

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário baixou quatro faixas "unreleased" do Beyblade (duas de fundo e duas versões do tema de batalha) e pediu que fossem renomeadas e usadas por contexto.
- Decisão: as faixas ficam em `public/audio/musica/` com nomes por contexto (`menu-inicio`, `menu-selecao`, `batalha`, `batalha-decisiva`), **nunca no git**, como a ROM (D-007): são gravações com direitos autorais, só para uso pessoal. `src/audio/music.js` toca uma por vez, em laço, e a falta de um arquivo deixa a tela em silêncio, sem erro. As cópias repetidas do download foram ignoradas (mesmo hash).
- Consequências: mapa das faixas em [`AUDIO.md`](AUDIO.md#músicas-de-fundo-d-030). Um build para distribuir não pode levar essas faixas.

## D-029: arena e beys com volume, no estilo do estádio da Burst

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário achou o estilo "mais criança, mais flat" e pediu algo mais realista e fiel ao anime; a [`BEY_BEHAVIOR.md`](BEY_BEHAVIOR.md) pede a arena com as cores do estádio da Burst.
- Decisão: na **batalha**, a regra "flat, sem brilho nem degradê" da D-022 deixa de valer para o canvas. A arena ganha tigela de plástico azul translúcido (clara no fundo, saturada na borda), curvas de nível calculadas de `bowlHeight`, linhas radiais, círculo central, tornado ridge claro, parede com luz de cima à esquerda, oclusão e bolsos escuros. As beys ganham sombra que se afasta com a altura na rampa e no pulo, escala leve pela altura, borrão de giro, rastro da velocidade e faíscas aditivas. Para continuar leve na GPU integrada, todo degradê e desfoque é desenhado **uma vez** em canvas de cache; por frame só há `drawImage`, arcos e linhas. Com movimento reduzido, não há rastro nem borrão. Menus e HUD continuam na D-022.
- Consequências: tudo isso fica em `src/render/arena-renderer.js`; a simulação não muda. Substitui em parte a D-022 (só o canvas da batalha).

## D-028: física da tigela funda e comportamento pela ponta

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu que cada tipo de bey se comporte como no brinquedo (ataque rápido que para antes; resistência sempre puxada para o centro; defesa girando num círculo pequeno em volta do centro) e notou que a bey "corria como se a arena fosse plana". A especificação está em [`BEY_BEHAVIOR.md`](BEY_BEHAVIOR.md).
- Decisão:
  - a tigela é **funda** (perfil `h(r)` parabólico com borda íngreme, profundidade 0,2·R, período de pêndulo ~2,1 s): a gravidade na rampa substitui o empurrão constante do protótipo;
  - a **ponta** (de `calculo.ponta` no catálogo) define o movimento: empurrão lateral na rampa, impulso para frente, tração máxima e atrito; o tipo só cobre massa, recuo e *life after death* na equalização de giro; o comando do jogador inclina a bey e é limitado pela tração da ponta;
  - atrito estático para bey parada; perda de giro cresce com o peso e a tração da ponta;
  - arena com **raio de 450 mm (~20:1)**, beys no tamanho real, velocidades escaladas por um fator único.
- Consequências: o comportamento é medido em `tests/sim-bowl.test.js` (energia, pêndulo, raio por ponta, ordem de parada ataque → equilíbrio → defesa → resistência). Upper attack e Gyro EG da especificação ainda não estão implementados. Substitui o raio de 360 mm da D-026.

## D-027: brilho de carga do ataque e da defesa

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu que, ao segurar ✕, a bey brilhe para medir a força do rush, e que a defesa tenha outro estilo de brilho, na cor de defesa.
- Decisão: **ataque** com halo laranja (token `ataque`) que cresce e pulsa mais rápido com a carga, anel serrilhado girando que fecha na carga cheia e um "estalo" (anel que se expande uma vez, com vibração) quando enche; **defesa** com escudo hexagonal ciano (token `defesa`), sólido e parado, mais grosso conforme firma. Forma e movimento diferentes, não só a cor; halo pré-renderizado (sem `shadowBlur`); com movimento reduzido nada gira, pulsa nem se expande.
- Consequências: tokens `ataque` e `defesa` em `design-system/tokens.json`; evento `chargeFull` na simulação.

## D-026: regras da batalha do protótipo (melhor de 3, arena 16:1)

- Data: 2026-10-25
- Status: Proposta (aguardando confirmação do usuário); implementada para o protótipo M1
- Contexto: o usuário pediu para já batalhar dentro do Electron. O placar é decisão de design ([`GAME_FLOW.md`](GAME_FLOW.md#finais-e-regras)), e o usuário achou a arena pequena (proporção do brinquedo, ~9:1).
- Decisão: partida em **melhor de 3 rodadas**, como num jogo de luta (D-005); cada rodada termina em **Parada** (spin finish), **Fora** (ring out) ou **Burst**; aos 60 s vence quem tem mais giro (**Decisão**); empate não pontua. Arena com **raio de 360 mm** (~16:1, como o GBA), beys no tamanho real, velocidades e limiares escalados ×1,8 para o ritmo não mudar. Especiais genéricos por tipo de bey até os efeitos de cada fera (M3).
- Consequências: `src/sim/constants.js` concentra os números (calibração no M1/M3); `tests/sim.test.js` cobre lançamento, colisão, finais, desempate e determinismo. Combos depois de um "HIT!" (D-024) ainda não existem.

## D-025: jogo na 5000, landing na 3000 e `pnpm run dev:all`

- Data: 2026-10-25
- Status: Aceita (substitui a regra de porta única do `CLAUDE.md`)
- Contexto: o usuário pediu o jogo na porta 5000, a landing na 3000 e um comando `pnpm run dev:all` que abra a janela do Electron com o jogo e as abas Início, Personagens e Batalha. Na primeira execução a janela abriu a landing: um preview antigo dela continuava escutando a 5000 em IPv6.
- Decisão:
  - **jogo** (Express + Next, `server.js`) sempre em `127.0.0.1:5000`; **landing** (`site/`) sempre na **3000**; nenhuma das duas cai para outra porta se a sua estiver ocupada;
  - `pnpm run dev:all` (= `node scripts/dev-all.js`) copia a arte, tenta subir o PostgreSQL, inicia jogo e landing e só abre o Electron quando a 5000 responde com o cabeçalho `X-Beyblade-App: jogo`; fechar a janela encerra tudo;
  - o projeto continua **instalado pelo npm** (`package-lock.json`); o pnpm só roda scripts (`verifyDepsBeforeRun: false` em `pnpm-workspace.yaml`), porque a instalação automática dele antes do `run` tentou converter o `node_modules` e falhou com arquivos em uso.
- Consequências: a landing não sobe quando a 3000 está ocupada (nesta máquina, por um container de outro projeto); o jogo segue normalmente. Abas trocam por L1/R1 (Q/E no teclado) só fora da batalha, onde L1/R1 são pulo e esquiva (D-024).

## D-024: controles da batalha iguais aos do jogo de GBA

- Data: 2026-10-25
- Status: Aceita (substitui o "mapeamento padrão das ações, proposta inicial" do `CONTROLLERS.md`)
- Contexto: as FAQs na web se contradizem sobre os botões do jogo de GBA; os textos de dica da própria ROM definem os comandos. O usuário escolheu manter os comandos do GBA adaptados ao DualShock 4.
- Decisão: ✕ ataca e ○ defende (segurar carrega), L1 pula, R1 esquiva, L1+R1 segurados soltam a fera bit, ✕+○ segurados ativam o Engine Gear, combos com direcional + ✕ depois de um "HIT!", ✕ com timing no lançamento e Options para pausar e para o P2 entrar.
- Consequências: as ações por jogador passam a ser `attack`, `defend`, `jump`, `dodge`, `launch`, `pause` e as direções; as combinações saem delas. `src/validate.js` (`ACTIONS`) e os testes mudam quando o input for implementado. Tabela em [`CONTROLLERS.md`](CONTROLLERS.md#mapeamento-padrão-das-ações).

## D-023: fluxo de partida estilo Street Fighter, entrada do 2º jogador e entrada na arena

- Data: 2026-10-25
- Status: Aceita (detalha a D-005; os modos dela continuam valendo)
- Contexto: o usuário detalhou como a partida começa: tela com todos os personagens, escolha da bey do personagem, entrada do 2º jogador pelo Start, escolha da arena e a animação dos personagens andando até a arena, como no jogo de GBA. A jogabilidade (beys, lançadores, ripcords) vem do jogo de GBA.
- Decisão:
  - **Seleção de personagem** com todos os personagens disponíveis e uma opção **Aleatório** junto com eles;
  - depois do personagem, **seleção da beyblade daquele personagem**;
  - **2º jogador:** se alguém apertar **Options (Start)** num segundo controle durante a seleção (ou a tecla de Start do P2 no teclado, D-015), abre o cursor do **Player 2**. Se ninguém apertar, a mesma pessoa escolhe em seguida o personagem (e a bey) da **CPU**;
  - depois dos personagens, **seleção da arena** (estádio);
  - antes da batalha, **animação de entrada**: os personagens escolhidos andam até a arena; em seguida vêm o lançamento e a batalha;
  - **jogabilidade com dados do jogo de GBA** (D-007): beys e peças com seus stats, lançadores e ripcords, controles e regras de batalha confirmados na ROM. Detalhes em [`GAME_FLOW.md`](GAME_FLOW.md).
- Consequências: a máquina de estados das telas ([`ARCHITECTURE.md`](ARCHITECTURE.md#5-modelo-de-entidades-ecs-leve)) ganha `stageSelect` e `walkIn` entre `beySelect` e `launch`, e a seleção precisa tratar a entrada do P2 a qualquer momento antes de confirmar. Respostas do usuário: Aleatório sorteia só o personagem; sem P2, o P1 escolhe personagem e bey da CPU; elenco com os 10 personagens do roster; o P2 entra a qualquer momento da seleção.

## D-022: direção visual "Abertura do Anime" e shadcn/ui no jogo

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu um design system e uma rota para ele, validados com as skills taste, impeccable e Emil Kowalski, e o shadcn/ui como biblioteca de componentes do jogo. Nas perguntas, ele escolheu a sensação "abertura do anime" e marcou como errado: cara de app/dashboard, infantil demais, pesado no notebook e fugir da 1ª geração. Na página de decisão do impeccable (sorteio: transmissão do torneio BBA), ele escolheu a alternativa "Abertura do Anime".
- Decisão:
  - toda tela do jogo é um quadro da abertura de Bakuten Shoot: o **campo da fera bit** do personagem toma a área inteira, com linhas de velocidade de borda dura, nome em cartela de título (Dela Gothic One) e VS amarelo inclinado;
  - **shadcn/ui** (base Radix, estilo `radix-nova`, JavaScript) para os componentes de interface, ajustados aos tokens: cantos retos, foco amarelo de 4px (o cursor de quem joga no controle), pressão em `scale(0.97)`, sem desfoque nem `transition-all`;
  - componentes do jogo em `src/components/game/` e a galeria viva em `/design-system`.
- Consequências: os tokens seguem a fonte única da D-018. O Express em `server.js` repassa ao Next tudo o que não é `/api`, para o jogo e a API ficarem juntos na porta 5000 até a D-013 ser confirmada. A arte própria (D-008) é copiada de `pesquisa-bakuten/` para `public/art/` por `scripts/sync-art.js` (gerado, fora do git). Detalhes em [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md#componentes-do-jogo).

## D-021: ripcords catalogados junto com os lançadores

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu para lembrar dos ripcords. No brinquedo, a corda dentada é uma peça própria (curta, longa, de lançador de corda, de Engine Gear, com pegador diferente); no jogo de GBA, lançador e ripcord são itens separados (4 de cada), com durabilidade que cai a cada batalha.
- Decisão: cada ripcord vira uma ficha em `pesquisa-bakuten/lancadores/ripcords/<slug>/` (medidas, nº de dentes, comprimento, material, sentido, compatibilidade com lançadores, atributos de lançamento e arte gerada). Cada lançador indica os ripcords compatíveis, e cada personagem/bey aponta para o ripcord que usa no anime quando a fonte disser.
- Consequências: no mini-game de lançamento, a força vem do lançador e o comprimento/dentes do ripcord definem quanto spin a puxada entrega (ver [`BEYBLADES.md`](BEYBLADES.md)).

## D-020: modelos físicos reais como referência das artes da landing

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário rejeitou a aparência dos sprites simplificados e pediu beyblades reais, vetorizadas, com detalhes e nitidez.
- Decisão: substituir as quatro matrizes por traçados em curvas de fotografias dos brinquedos clássicos, preservando peças, cores e adesivos. Guardar as fontes e sua procedência localmente. Não embutir raster em SVG nem inventar detalhe ausente na referência. Entregar WebP responsivo para evitar o peso dos vetores detalhados no navegador; manter os SVGs completos. Regenerar a animação em 1152 × 648 com as mesmas artes.
- Consequências: o pipeline usa VTracer apenas em desenvolvimento, verifica checksums e produz máscaras vetoriais de transparência. Créditos deixam de atribuir essas artes como originais do catálogo. Os direitos das fotos permanecem com seus titulares. Giro por scroll, pausa, movimento reduzido, duas fontes e paleta 60/30/10 continuam definidos por D-019 e D-018.

## D-019: hero vetorial com giro na rolagem e demonstrações animadas

- Data: 2026-10-25
- Status: Substituída por D-020 quanto às fontes das artes; comportamento de movimento mantido
- Contexto: o usuário pediu uma hero mais visual, com uma beyblade girando ao rolar, ícones e imagens animadas de melhor qualidade.
- Decisão: usar a arte própria da Dragoon S em SVG na hero, com rotação vinculada à rolagem; substituir a imagem da seção de controles por uma demonstração de batalha em WebP animado gerado dos SVGs, também usado na etapa Batalha. Manter as duas fontes e a paleta 60/30/10.
- Consequências: a hero não perde resolução ao ampliar; a demonstração tem poster e pausa, respeita movimento reduzido e não roda fora da tela. As ilustrações e sua origem ficam creditadas em `site/public/beyblades/README.md` e na página de créditos. Não são capturas de gameplay.

## D-018: design unificado, duas fontes e proporção 60/30/10

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu a refatoração da landing com Taste, Impeccable e Emil Kowalski, unificando o design system durante o processo e seguindo o princípio de menos é mais.
- Decisão: usar Dela Gothic One e Barlow; tinta azul profunda como base (60%), superfícies azuis de apoio (30%) e amarelo de ação (10%). As cores das feras ficam no conteúdo de identidade. Tokens comuns em `design-system/tokens.json`, com CSS gerado para jogo e landing. Animações da landing disparam na rolagem, uma vez por bloco, respeitando movimento reduzido.
- Consequências: `docs/DESIGN_SYSTEM.md` documenta o contrato; testes detectam divergências entre as saídas. `site/` continua independente para o build na Vercel. Pesquisa e backend em andamento não entram nesta refatoração.

## D-016: landing page pública em Next.js, com download do `.exe` pelo GitHub Releases

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu uma landing page em português com um botão que baixa o instalador do jogo, usando Next.js, imagens da web e as skills de design instaladas.
- Decisão:
  - a landing é um **app Next.js separado em `site/`** (não é o app do jogo da D-013), com **export estático** (`output: 'export'`), publicado na **Vercel** (Root Directory = `site`);
  - o botão principal baixa o **instalador `.exe` para Windows** (D-004) pelo link fixo `https://github.com/luizfelipe-pacifico/beyblade/releases/latest/download/BeybladeArena-Setup.exe`. O instalador fica **anexado às GitHub Releases, nunca commitado** (o GitHub recusa arquivos acima de 100 MB);
  - enquanto não houver release, o botão continua ativo e a página avisa que o jogo está **em desenvolvimento**, mostrando o estágio atual do [`ROADMAP.md`](ROADMAP.md);
  - **público principal:** amigos e conhecidos que recebem o link;
  - **imagens do anime** (*Beyblade*, Bakuten Shoot) podem ser usadas na landing, por decisão do usuário (substitui a proposta inicial de usar só imagens livres). Fonte e créditos ficam em `site/CREDITS.md`;
  - a página é **`noindex`** (meta `robots` + cabeçalho `X-Robots-Tag` na Vercel): não aparece em buscadores e só é acessada por quem recebe o link;
  - **contato público** pelas Issues do GitHub (sem e-mail exposto).
- Consequências: o `noindex` reduz a exposição, mas não muda os direitos autorais: o detentor ainda pode pedir remoção à Vercel/GitHub. Por isso o nome "Beyblade" e as imagens do anime vêm com aviso de **projeto de fã, sem fins lucrativos e não afiliado à Takara Tomy, Hasbro, Nelvana ou d-rights**. A página não coleta dados (sem analytics, cookies ou formulários), o que mantém a política de privacidade simples. O instalador não pode conter material extraído da ROM (D-007): só arte própria (D-008). Detalhes em [`LANDING.md`](LANDING.md).

## D-017: licença MIT para o código

- Data: 2026-10-25
- Status: Aceita
- Contexto: o projeto vai ter download público e precisava de uma licença definida.
- Decisão: código sob **licença MIT** (`LICENSE` na raiz). A licença cobre só o código e a arte própria; marcas, personagens e nomes da franquia Beyblade pertencem aos donos e não são licenciados.
- Consequências: `LICENSE`, `README.md` e a página de termos deixam claro o que a MIT cobre e o que não cobre. Imagens de terceiros seguem as próprias licenças, listadas em `site/CREDITS.md`.

## D-015: jogo completo pelo teclado quando não há controle

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu que quem não tiver controle consiga jogar com o teclado do computador. A D-001 já previa o teclado como fallback, mas sem definir até onde.
- Decisão:
  - **tudo** é jogável pelo teclado, não só a batalha: menus, seleção de personagem e bey, lançamento, pausa e tela de Controles;
  - **dois jogadores no mesmo teclado**, com blocos de teclas separados (P1 à esquerda, P2 à direita), e também **misto** (um no DualShock 4, outro no teclado);
  - sem controle na porta do jogador, o teclado dele fica ativo automaticamente e a interface mostra as teclas em vez dos símbolos do PS4; com controle, os dois funcionam ao mesmo tempo;
  - teclas remapeáveis na tela de Controles e salvas no banco, como os botões do controle. Mapeamento padrão em [`CONTROLLERS.md`](CONTROLLERS.md#teclado).
- Consequências: o input converte teclado e gamepad no mesmo `InputFrame` ([`ARCHITECTURE.md`](ARCHITECTURE.md#6-input)), então a simulação não sabe de onde veio o comando. Teclados de notebook têm limite de teclas simultâneas (*ghosting*), por isso o layout padrão evita juntar as teclas dos dois jogadores na mesma região. Os testes de input cobrem o teclado, e "pronto" exige testar com teclado também.

## D-014: PostgreSQL só no desenvolvimento; SQLite no `.exe`

- Data: 2026-10-25
- Status: Aceita
- Contexto: D-012 deixava o `.exe` dependente do Docker Desktop para salvar dados (risco registrado em [`DATABASE.md`](DATABASE.md#risco-conhecido) e no [`ROADMAP.md`](ROADMAP.md)). O usuário definiu o papel de cada banco.
- Decisão:
  - **PostgreSQL no Docker** é usado só no desenvolvimento e nos testes em `localhost`;
  - o **`.exe` empacotado usa SQLite**: um arquivo local na pasta de dados do usuário (`app.getPath('userData')`), sem Docker nem serviço externo.
- Consequências:
  - substitui em parte a D-012, que vale só para o ambiente de desenvolvimento;
  - o schema do Prisma tem um `provider` fixo, então os dois bancos exigem **um schema e um client por provider** (ex.: `prisma/schema.prisma` para PostgreSQL e um schema SQLite gerado a partir dele), com migrações separadas. O adapter SQLite do Prisma 7 e o jeito de compilar o driver nativo para o Electron ainda precisam ser escolhidos e registrados;
  - o código de acesso a dados (`src/db.js`) não pode usar recurso exclusivo do PostgreSQL (tipos, `$queryRaw` com SQL específico), para funcionar nos dois;
  - os testes precisam cobrir as queries também no SQLite, que é o banco que o jogador usa de verdade.

## D-013: Next.js serve interface e API na porta 5000, dentro do Electron

- Data: 2026-10-25
- Status: Proposta (aguardando confirmação do usuário)
- Contexto: com D-004 (Electron + Next.js) e D-012 (PostgreSQL), falta definir quem fala com o banco. O `server.js` com Express é da stack original e duplicaria o servidor do Next.
- Decisão: o servidor do Next.js (App Router) roda em `127.0.0.1:5000` e expõe a API em *route handlers* (`app/api/**/route.js`), que usam `src/validate.js` e o Prisma. O processo principal do Electron sobe esse servidor (`next dev -p 5000` em dev, saída `standalone` no build) e abre a janela nele. O renderer não tem acesso a Node (`contextIsolation`, `sandbox`); tudo passa pela API HTTP local.
- Consequências: o Express em `server.js` é **transitório** e sai quando as rotas forem migradas (marco M0 do [`ROADMAP.md`](ROADMAP.md)). Detalhes em [`ARCHITECTURE.md`](ARCHITECTURE.md).

## D-012: banco PostgreSQL em container Docker

- Data: 2026-10-25
- Status: Aceita, restrita ao desenvolvimento pela D-014
- Contexto: o usuário pediu o banco rodando em container Docker. O SQLite é um arquivo embutido no processo e não roda como serviço, então foi preciso escolher um banco cliente-servidor. Opções apresentadas: PostgreSQL no Docker, manter SQLite sem Docker, ou SQLite agora e Postgres depois. O usuário escolheu PostgreSQL no Docker.
- Decisão: **PostgreSQL 18** (`postgres:18-alpine`) via `docker-compose.yml`, publicado só em `127.0.0.1:5434` (5432/5433 já estavam ocupadas na máquina), volume nomeado `pgdata`, healthcheck com `pg_isready` e credenciais no `.env` (fora do git).
- Consequências: substitui o "SQLite nativo via `node:sqlite`" da stack original e define a persistência que a D-004 deixou em aberto. O Docker Desktop precisa estar rodando para o jogo salvar dados (`npm run db:up`); isso entra como risco para o `.exe` no [`ROADMAP.md`](ROADMAP.md). Schema, migrações e operação em [`DATABASE.md`](DATABASE.md).

## D-011: Prisma como ORM

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu um ORM. Opções apresentadas: Drizzle ou Prisma. O usuário escolheu Prisma.
- Decisão: **Prisma ORM 7** (`prisma`, `@prisma/client`) com o driver adapter `@prisma/adapter-pg` (`pg`). Generator `prisma-client`, com client gerado em `src/generated/prisma/` (fora do git, regerado no `postinstall`). Configuração em `prisma7.config.ts`, que carrega o `.env` com `process.loadEnvFile()` (nativo, sem `dotenv`). Migrações versionadas em `prisma/migrations/`.
- Consequências: substitui o "sem ORM" e as migrações por `PRAGMA user_version` da stack original. O Prisma 8 ainda está em release candidate e só será adotado quando sair estável, com nova entrada aqui. SQL manual só via `$queryRaw` com template literal (parametrizado), nunca `$queryRawUnsafe`.

## D-010: lançadores fazem parte do catálogo

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu os lançadores junto com as beyblades; o fluxo de D-005 tem uma etapa de lançamento.
- Decisão: cada lançador usado no anime (e os modelos de brinquedo da época) vira uma ficha em `pesquisa-bakuten/lancadores/` com medidas, material, sentido de rotação, atributos (força, RPM, precisão, controle) e arte própria. Cada personagem aponta para o lançador que usa.
- Consequências: a fase de lançamento do jogo usa os atributos do lançador junto com os da beyblade (ver [`BEYBLADES.md`](BEYBLADES.md)).

## D-009: atributos calculados a partir das peças

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário quer atributos base (velocidade, força etc.) mapeados como os criadores pensaram, para cada peça e para a bey completa.
- Decisão: cada peça tem medidas físicas (mm, g), material, os stats oficiais Ataque/Defesa/Stamina (wiki/Takara) e, quando extraídos, os valores do jogo de GBA (D-007). Os atributos da bey são **calculados** dessas peças por fórmulas documentadas em [`BEYBLADES.md`](BEYBLADES.md) e implementadas em `src/beyblade/stats.js` (com testes). Um ajuste separado (`ajuste_anime`) representa o desempenho exagerado do anime.
- Consequências: os atributos escritos à mão na primeira pesquisa passam a ser só referência; o valor de jogo é o calculado. Mudou peça → recalcula com `npm run build:research`.

## D-008: arte e som próprios gerados a partir dos dados

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário quer imagens padronizadas e de qualidade bem superior às baixadas da wiki (que são de terceiros, de tamanhos e ângulos variados e, em parte, bloqueadas pelo CDN), além de feras bit animadas com som para aparecer em cima da beyblade.
- Decisão:
  - peças, beys montadas, vistas explodidas e lançadores são **SVG gerados por script** a partir dos parâmetros de forma de cada peça (`scripts/build-research.js`), com padrão único de ângulo, escala (mm) e iluminação;
  - feras bit e retratos de personagens são **SVG vetoriais originais**, com animações CSS (idle, invocação, ataque) seguindo [`ART.md`](ART.md);
  - sons das feras e da batalha são **sintetizados** a partir de receitas JSON (`scripts/synth.js`, ver [`AUDIO.md`](AUDIO.md));
  - fotos da wiki ficam só como referência, em subpastas `referencia/`.
- Consequências: esses assets são próprios e podem ir para o git (diferente do material extraído da ROM em D-007). A extração de sprites da ROM continua possível, mas não é a fonte desses assets.

## D-007: ROM de GBA como referência e fonte inicial de assets

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário quer recriar a batalha do *Beyblade G-Revolution* (GBA, Atari/Hasbro, 2003) e usar o jogo original como base, ajustando depois. É um projeto pessoal, sem comercialização, para rodar só no PC dele.
- Decisão:
  - a ROM `Beyblade G-Revolution (USA).gba` (código `BB2E`, SHA-1 `a89f7b4eb77dc986022201db51a676451ba7c5e4`) é a referência de engenharia reversa: regras, números, fluxo de telas e dados de peças;
  - **inicialmente**, sprites, retratos e sons podem ser **extraídos da ROM** para uso no jogo; depois serão ajustados ou trocados aos poucos;
  - a ROM e tudo o que for extraído dela **nunca entram no git** (ficam fora do repositório ou em pasta no `.gitignore`).
- Consequências: substitui em parte a regra de assets de [`BEST_PRACTICES.md`](BEST_PRACTICES.md#13-assets-e-direitos-autorais) para este uso pessoal; o build/exe não deve ser distribuído. Descobertas da engenharia reversa vão em [`REVERSE_ENGINEERING.md`](REVERSE_ENGINEERING.md).

## D-006: batalha em 2D agora, refatoração para 3D depois

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário quer começar em 2D e depois refatorar tudo para 3D.
- Decisão: a primeira versão é 2D com arena vista de cima (canvas). Tudo é documentado pensando na migração para 3D.
- Consequências: a simulação (física, regras, IA, input) fica totalmente separada da renderização e trabalha em unidades do mundo (não em pixels), para que o renderer 2D possa ser trocado por um 3D sem reescrever a lógica. Valores calibrados e limitações do 2D vão para os docs do assunto.

## D-005: formato de luta estilo Street Fighter e modos de jogo

- Data: 2026-10-25
- Status: Aceita
- Contexto: não vamos replicar a história do jogo de GBA; o foco é a batalha.
- Decisão:
  - fluxo: **seleção de personagem** (todos disponíveis desde o início: Tyson, Kai, Ray, Max, Daichi etc.) → **seleção da beyblade** daquele personagem → **lançamento** → **batalha na arena**;
  - modos da primeira versão: **1 vs 1 local**, **1 vs CPU**, **Arcade** (sequência de CPUs até um chefe) e **Treino**;
  - todo o controle pelo DualShock 4 (D-001), incluindo menus e lançamento.
- Consequências: personagens e beyblades vêm da pesquisa em `pesquisa-bakuten/` (perfis de IA já descritos lá); a IA da CPU usa o perfil de cada personagem.

## D-004: jogo como executável Windows (Electron + Next.js)

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário quer jogar por um `.exe` no Windows em vez de um emulador de `.gba`.
- Decisão: frontend em **Next.js** rodando dentro do **Electron**, empacotado como `.exe` para Windows. Em desenvolvimento, o servidor continua na porta 5000 (`CLAUDE.md`).
- Consequências: substitui o "frontend estático em `public/`" da stack original. A forma de persistência no app empacotado (banco, API) ainda precisa ser definida e registrada.

## D-003: testes automáticos antes de todo push

- Data: 2026-10-25
- Status: Aceita
- Contexto: queremos que nada quebrado chegue ao GitHub e que bugs corrigidos não voltem.
- Decisão: suíte com `node:test` (`npm test`), hook `pre-push` versionado em `.githooks/` que bloqueia o push se algum teste falhar, e regra de teste de regressão para todo bug corrigido.
- Consequências: o hook é ativado por `git config core.hooksPath .githooks` (feito automaticamente pelo script `prepare` no `npm install`). Nunca usar `git push --no-verify` para pular os testes. Detalhes em [`BEST_PRACTICES.md`](BEST_PRACTICES.md#10-testes).

## D-002: documentação contínua em Markdown

- Data: 2026-10-25
- Status: Aceita
- Contexto: o projeto é desenvolvido com apoio de IA, que não guarda memória entre sessões; o contexto precisa estar nos arquivos.
- Decisão: toda decisão, requisito e descoberta é registrada em `docs/` durante o trabalho, e os docs são relidos no início de cada tarefa.
- Consequências: regra no `CLAUDE.md`; este arquivo existe para isso.

## D-001: controle principal é o DualShock 4 (PS4)

- Data: 2026-10-25
- Status: Aceita
- Contexto: o jogo é para dois jogadores locais com controle. Precisamos de um controle de referência para mapeamentos padrão, textos da interface e testes.
- Decisão: o jogo é projetado e testado primeiro com **dois controles DualShock 4 (PS4)**. O teclado continua como fallback e outros controles devem funcionar via remapeamento, mas não são a referência.
- Consequências:
  - mapeamento padrão dos botões baseado no layout do DualShock 4 (ver [`CONTROLLERS.md`](CONTROLLERS.md));
  - interface mostra os símbolos do PS4 (✕ ○ □ △, L1/R1, L2/R2, Options);
  - toda funcionalidade de input é testada com DualShock 4 antes de ser dada como pronta.
