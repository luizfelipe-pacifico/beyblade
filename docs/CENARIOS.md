# Cenários clássicos do anime

Mapa dos locais de batalha do anime *Bakuten Shoot Beyblade* (2001), *V-Force* (2002) e *G-Revolution* (2003). Serve de referência para criar **estádios originais** em 2D visto de cima. **Nenhum frame ou imagem do anime é usado**: a arte é desenhada pelo projeto. Daqui só saem a ideia do lugar e uma regra de jogo. As descrições visuais e as paletas são sugestões feitas a partir das sinopses, não cores tiradas de frames.

Nomes: usamos os nomes da dublagem em inglês (Tyson, Kai, Ray, Max, Kenny), com o japonês entre parênteses na primeira menção (Takao, Kai, Rei, Max, Kyojyu). Os episódios são numerados por temporada, como nas páginas da wiki.

**Fontes principais** (consultadas em 2026-10-25):
- Beyblade Wiki (Fandom), páginas de episódio (seções *Plot* e *Featured Beybattles*): `https://beyblade.fandom.com/wiki/Beyblade_-_Episode_NN`, `.../Beyblade:_V-Force_-_Episode_NN`, `.../Beyblade:_G-Revolution_-_Episode_NN`
- Wikipedia: [Beyblade (season 1)](https://en.wikipedia.org/wiki/Beyblade_(season_1)), [Beyblade V-Force](https://en.wikipedia.org/wiki/Beyblade_V-Force), [Beyblade G-Revolution](https://en.wikipedia.org/wiki/Beyblade_G-Revolution)

Quando a fonte não confirma um detalhe, ele aparece como **não confirmado**.

## Correções da memória

- **Piscina pública:** a cena existe, mas é no **G-Revolution, episódio 3** ("Invitation to Battle"), não na primeira temporada. **Kai não aparece nela.** Quem se destaca na piscina é o **Daichi**: ele mostra que é um blader muito habilidoso num confronto que acaba com Tyson, Daichi, Kenny e Hilary expulsos de lá. A boia inflável e uma batalha formal na piscina são **não confirmados**: nenhuma sinopse fala de boia, e a wiki registra Tyson x Daichi como "sem resultado" no episódio.
- **Lago Baikal:** a batalha no lago congelado é **Kai (com Black Dranzer) contra os Bladebreakers** (episódio 45), não Kai x Tala. Tyson x Tala é a final do Mundial (episódios 50 e 51), num prato que vira um bloco de gelo.
- **Torneio americano:** não há sinopse de batalha na Estátua da Liberdade nem num porta-aviões na 1ª temporada. A Estátua da Liberdade aparece no **G-Rev 9**, como passeio em Nova York. Os pratos-tema do torneio americano confirmados são a rodovia New Jersey Turnpike e o diamante de beisebol.
- **Rio/ponte do episódio 1:** a sinopse da wiki situa a reunião dos bladers e o desafio do Blade Shark Carlos num **terraço**, e o local do Tyson x Carlos do dia seguinte não é dito. Margem de rio no ep. 1 é **não confirmado**. Batalhas à beira-rio confirmadas existem no V-Force (veja `margem-do-rio`).
- **Galpão da gangue do Kai:** a wiki chama o lugar só de "quartel-general dos Blade Sharks" (ep. 2), e Kai salta do teto. Ser um galpão é **não confirmado**.
- **Terraço da escola (V-Force):** não confirmado. O que existe é a **escola preparatória do Kai** (V-Force 5). Há um terraço no G-Rev 4, mas o local exato da batalha Rick x Eddy não ficou claro.
- **Vila dos White Tigers:** citada na 1ª temporada (ep. 17, 41), mas sem batalha confirmada dentro dela. A batalha mais próxima é no **G-Rev 34**, no bosque das colinas Baihuzu (Mystel x Lee), e ficou de fora desta lista.

## No jogo (D-039)

Primeira leva, em `src/content/cenarios.js`: `piscina-publica`, `parque-lago-cachoeira`, `terraco-blade-sharks`, `bb-shop`, `becos-hong-kong`, `torres-da-china`, `lago-baikal`, `prato-de-gelo-final`, `praia-de-treino` e `estadio-bega`. As regras do jogo são parâmetros da simulação (`atrito`, `ringOut`, `saida`, `vento`, `giro`); regras que pedem objetos na arena (caixas, árvores, piso que racha, ondas) ficam para quando a simulação tiver obstáculos. Os demais lugares da tabela entram em levas seguintes.

## Resumo

| slug | nome | temporada / ep. | regra sugerida | verificado |
|---|---|---|---|---|
| `terraco-blade-sharks` | Terraço dos Blade Sharks | T1 ep. 1 | vento lateral empurra os beys | sim |
| `qg-blade-sharks` | QG dos Blade Sharks | T1 ep. 2 | caixas no chão como obstáculos | sim (galpão: não) |
| `parque-lago-cachoeira` | Parque do lago e da cachoeira | T1 ep. 3 | borda de grama freia; o lago puxa para a cachoeira | sim (sem batalha formal) |
| `bb-shop` | Prato da BB Shop | T1 ep. 3 | parede alta: sem ring-out, só por giro | sim |
| `torneio-regional` | Torneio regional da BBA | T1 ep. 4 a 7 | battle royale: vários beys, o último a girar vence | sim |
| `becos-hong-kong` | Becos de Hong Kong | T1 ep. 8 | prato pequeno; paredes de beco rebatem | sim |
| `torres-da-china` | Topo das torres da China | T1 ep. 10 | ring-out vale o dobro (queda do alto) | sim |
| `arena-que-desmorona` | Arena que desmorona (final asiática) | T1 ep. 15 | o piso racha e vira escombros com o tempo | sim |
| `new-jersey-turnpike` | Prato New Jersey Turnpike | T1 ep. 25 | pistas que aceleram em linha reta | sim |
| `diamante-de-beisebol` | Diamante de beisebol | T1 ep. 28 | bases dão impulso; a grama freia | sim |
| `porao-do-navio` | Porão de carga do navio | T1 ep. 30 | o navio balança: o piso inclina de tempos em tempos | sim |
| `torre-eiffel` | Mirante da Torre Eiffel | T1 ep. 33 | treliça: buracos no chão | sim |
| `coliseu-de-enrique` | Coliseu do Enrique | T1 ep. 35 | arquibancadas em anel rebatem | sim |
| `lago-baikal` | Lago Baikal congelado | T1 ep. 45 | atrito baixo; o gelo racha e abre buracos | sim |
| `black-sea-bowl` | Black Sea Bowl | T1 ep. 48 | água no prato: ondas empurram | sim |
| `prato-de-gelo-final` | Prato de gelo da final | T1 ep. 50 e 51 | gelo e frio: giro cai mais rápido | sim |
| `parque-mr-x` | Parque do Mr. X | V-Force ep. 2 e 31 | árvores como obstáculos; grama freia | sim |
| `escola-preparatoria` | Escola preparatória do Kai | V-Force ep. 5 | pátio liso; bancos de concreto rebatem | sim (terraço: não) |
| `praia-de-treino` | Praia de treino | V-Force ep. 15 e 40 | areia freia muito; maré invade a borda | sim |
| `margem-do-rio` | Margem do rio | V-Force ep. 17 e 30 | ring-out para o lado do rio cai na água | sim |
| `torre-de-batalha` | Torre de Batalha | V-Force ep. 21 a 27 | um andar por partida, cada um com piso próprio | sim |
| `parque-abandonado` | Parque de diversões abandonado | V-Force ep. 37 e 38 | garrafas quebráveis e tábuas soltas | sim |
| `piscina-publica` | Piscina pública | G-Rev ep. 3 | ring-out cai na água; boia flutuante (inventada) | parcial |
| `estadio-ayers-rock` | Estádio Ayers Rock | G-Rev ep. 21 e 25 | rocha central: subir nela dá vantagem | sim |
| `estadio-bega` | Estádio da BEGA | G-Rev ep. 36 | grades sobem: sem ring-out, só por giro | sim |
| `casa-do-tyson` | Casa e dojo do Tyson | G-Rev ep. 50 (dojo: T1 ep. 1 a 3) | tatame; espadas de kendo como obstáculos | parcial |

---

## Temporada 1: Bakuten Shoot Beyblade (2001)

### `terraco-blade-sharks`: Terraço dos Blade Sharks
- **Temporada / ep.:** T1 ep. 1, "The Blade Raider"
- **Quem batalhou:** Tyson x Billy, num estádio da rua (Tyson vence). No terraço, Carlos (Blade Sharks) desafia Andrew e marca a batalha com Tyson. No dia seguinte, Tyson vence Carlos com o lançamento correndo e saltando, e Kai aparece e desafia Tyson. O local exato da batalha com Carlos é não confirmado.
- **Visual de cima:** laje de concreto cinza com rejunte, bancos de plateia alinhados em volta, um BeyStadium de plástico no centro, caixas d'água e mureta na borda. Fim de tarde.
- **Paleta:** `#8A8F96` `#5C6168` `#D9A35B` `#3B4A6B` `#F2E6C9`
- **Regra sugerida:** vento lateral em rajadas empurra levemente os beys para um dos lados.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_01

### `qg-blade-sharks`: QG dos Blade Sharks
- **Temporada / ep.:** T1 ep. 2, "Day of the Dragoon"
- **Quem batalhou:** Kai x Tyson (Kai destrói o bey de Tyson). Na revanche no QG, depois do sequestro do Kenny, os dois empatam e Dragoon e Dranzer aparecem pela primeira vez.
- **Visual de cima:** interior amplo e escuro, com teto alto (Kai salta de cima). Os Blade Sharks em volta abrem espaço para um BeyStadium. Galpão, caixotes e pilares são uma interpretação (**não confirmado**). Luz fria, de noite ou na penumbra.
- **Paleta:** `#2A2E35` `#4B535E` `#7A1F2B` `#C9C9C9` `#1E6FA8`
- **Regra sugerida:** caixotes no chão fora do prato funcionam como obstáculos que rebatem.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_02

### `parque-lago-cachoeira`: Parque do lago e da cachoeira
- **Temporada / ep.:** T1 ep. 3, "Take It to the Max!"
- **Quem batalhou:** não houve batalha formal. Tyson treina truques no parque e depois, com Max, usa o bey para salvar o cachorro Sparky do lago perto da cachoeira (Dragoon salta sobre a água e cai numa mureta de pedra). Aqui Tyson conhece Max.
- **Visual de cima:** gramado com morro, lago azul com ondulações, mureta de pedra, tronco boiando e uma cachoeira numa das bordas. Dia ensolarado.
- **Paleta:** `#6FAF4A` `#3E7D2E` `#3A8FC9` `#A7A29A` `#E8F4FA`
- **Regra sugerida:** a borda de grama freia o bey; o lado do lago tem corrente que puxa para a cachoeira (ring-out).
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_03

### `bb-shop`: Prato da BB Shop
- **Temporada / ep.:** T1 ep. 3, "Take It to the Max!"
- **Quem batalhou:** Tyson x Max (Max vence: a defesa de Draciel aguenta até o Dragoon perder resistência). Tyson tenta empurrar Draciel por uma parede do estádio.
- **Visual de cima:** loja de hobby do pai do Max: piso de madeira, prateleiras com peças, prato de treino com parede alta. Luz interna quente.
- **Paleta:** `#B07A45` `#7C5232` `#E3D3B5` `#2F6DB5` `#D94F3A`
- **Regra sugerida:** parede alta: não há ring-out, só vitória por parada de giro (favorece defesa e resistência).
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_03

### `torneio-regional`: Torneio regional da BBA
- **Temporada / ep.:** T1 ep. 4 a 7 ("The Qualifier Begins", "Draciel of Approval", "Dragoon Storm", "Thirteen Candles")
- **Quem batalhou:** blocos em battle royale num BeyStadium gigante (Kai vence Kenny; Max e Tyson vencem seus blocos); Kai x Max na semifinal (Kai vence, ep. 5); Tyson x Ray (ep. 6); final Tyson x Kai em melhor de 3 (Tyson vence e vira campeão nacional, ep. 7).
- **Visual de cima:** prato enorme e raso de plástico branco e azul, com faixas de setor, holofotes e plateia em anel; o narrador DJ Jazzman (Blader DJ) numa cabine. Interior iluminado.
- **Paleta:** `#F4F6F8` `#2C6BD1` `#E53935` `#FFC83D` `#1B1F2A`
- **Regra sugerida:** modo battle royale: vários beys (CPU) no prato, o último girando vence.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_04 e https://beyblade.fandom.com/wiki/Beyblade_-_Episode_07

### `becos-hong-kong`: Becos de Hong Kong
- **Temporada / ep.:** T1 ep. 8, "Bladin' in the Streets"
- **Quem batalhou:** Tyson x Bruce, blader de beco (Tyson vence por pouco). O bey do Kevin joga Dragoon para fora do estádio.
- **Visual de cima:** beco estreito, asfalto molhado, placas de neon, latões e caixas. Um prato improvisado pequeno no meio. Noite.
- **Paleta:** `#1C1F26` `#3D4250` `#FF3B6B` `#26E0C8` `#F2C14E`
- **Regra sugerida:** prato pequeno; as paredes do beco rebatem os beys de volta (ring-out só pelas pontas abertas).
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_08

### `torres-da-china`: Topo das torres da China
- **Temporada / ep.:** T1 ep. 10, "Battle in the Sky"
- **Quem batalhou:** Bladebreakers x Tall Boys no torneio asiático. Ray vence Andre, Max vence Waylan e Tyson vence Tommy com Dragoon Storm.
- **Visual de cima:** plataforma no alto de uma torre, com piso de pedra clara e moldura vermelha de estilo chinês, céu e nuvens em volta. Dia claro com vento.
- **Paleta:** `#C8352E` `#E8C26A` `#D9D2C3` `#87B7E3` `#FFFFFF`
- **Regra sugerida:** ring-out vale mais (conta como vitória de 2 pontos), por ser uma queda do alto.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_10

### `arena-que-desmorona`: Arena que desmorona (final asiática)
- **Temporada / ep.:** T1 ep. 15, "Going for the Gold"
- **Quem batalhou:** Max x Gary (White Tigers), melhor de 3: Max vence a 1ª e Gary vence a 2ª e a 3ª. Na 3ª, o prato inteiro desmorona em pedras e Draciel fica soterrado.
- **Visual de cima:** "blade circle" de pedra com rachaduras, cercado por pilares e degraus de estilo chinês. Dia.
- **Paleta:** `#9C8F7A` `#6B5F4E` `#C8352E` `#E3D8C1` `#4E7A3A`
- **Regra sugerida:** o piso racha em setores a cada impacto forte; um setor quebrado vira escombro (freia e desvia).
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_15

### `new-jersey-turnpike`: Prato New Jersey Turnpike
- **Temporada / ep.:** T1 ep. 25, "My Way or the Highway"
- **Quem batalhou:** Bladebreakers x Spintensity na semifinal do torneio americano. Max vence Luiz, Ray vence Frankie e Kai, no lugar de Tyson (com dor de barriga), vence Mario.
- **Visual de cima:** prato-tema de rodovia, com asfalto, faixas amarelas tracejadas, pistas em curva e um redemoinho no centro. Luz de estúdio.
- **Paleta:** `#3A3A3C` `#5A5A5E` `#FFD23F` `#FFFFFF` `#E4572E`
- **Regra sugerida:** pistas que aceleram o bey que corre no sentido delas e freiam no contrário.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_25

### `diamante-de-beisebol`: Diamante de beisebol
- **Temporada / ep.:** T1 ep. 28, "Bottom of the Ninth"
- **Quem batalhou:** Max x Michael (All Starz), final do torneio americano. Michael vence a 1ª e Max vence a 2ª e a 3ª, dando o título aos Bladebreakers.
- **Visual de cima:** prato que replica um campo de beisebol: grama em losango, terra alaranjada, bases brancas, montinho do arremessador no centro. Luz de estádio à noite.
- **Paleta:** `#3F8F3A` `#C9864A` `#FFFFFF` `#1D3557` `#E63946`
- **Regra sugerida:** passar por uma base dá um impulso curto; a grama freia e a terra não.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_28

### `porao-do-navio`: Porão de carga do navio
- **Temporada / ep.:** T1 ep. 30, "Cruising for a Bruising"
- **Quem batalhou:** Robert x bladers amadores (Robert vence) e Robert x Tyson (Robert vence com Griffolyon). A cena se passa na travessia do Atlântico.
- **Visual de cima:** piso de chapa de aço com rebites, contêineres e cordas, lâmpadas de gaiola. Penumbra.
- **Paleta:** `#4A5560` `#2B3138` `#B5651D` `#D4A017` `#8FA3B0`
- **Regra sugerida:** o navio balança: de tempos em tempos o piso "inclina" e todos os beys derivam para um lado.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_30

### `torre-eiffel`: Mirante da Torre Eiffel
- **Temporada / ep.:** T1 ep. 33, "Last Tangle in Paris"
- **Quem batalhou:** Bladebreakers x Dark Bladers no mirante da torre. Os Bladebreakers vencem, com Kai decidindo quase sozinho.
- **Visual de cima:** deck do mirante com treliça de ferro marrom, guarda-corpo, telhados de Paris lá embaixo. Fim de tarde ou noite.
- **Paleta:** `#5B4636` `#8C6B4F` `#2E3A59` `#F2B880` `#C9D6E3`
- **Regra sugerida:** treliça: alguns vãos no piso funcionam como buracos (cair num deles é ring-out).
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_33

### `coliseu-de-enrique`: Coliseu do Enrique
- **Temporada / ep.:** T1 ep. 35, "When in Rome... Beyblade!"
- **Quem batalhou:** Tyson x Enrique (Enrique vence com Amphilyon), no BeyStadium particular do Enrique, construído imitando o Coliseu.
- **Visual de cima:** arena oval de areia clara cercada por anéis de arquibancada de pedra e arcos. Sol forte de Roma.
- **Paleta:** `#E6CFA1` `#C4A57A` `#8E7356` `#B33A3A` `#F7EFE0`
- **Regra sugerida:** o anel de arquibancada rebate os beys (ring-out raro); a areia freia um pouco.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_35
- **Relacionado:** a final europeia contra os Majestics foi no Olympia Coliseum (ep. 39: Kai vence Johnny e Tyson vence Ralf/Robert), https://beyblade.fandom.com/wiki/Beyblade_-_Episode_39

### `lago-baikal`: Lago Baikal congelado
- **Temporada / ep.:** T1 ep. 45, "Breaking the Ice"
- **Quem batalhou:** Kai (Black Dranzer) x Tyson, Ray e Kenny (Kai vence). Depois, Max chega com o Draciel novo e os quatro bit-beasts juntos derrotam Black Dranzer. O gelo quebra, Kai cai na água e é puxado pelos amigos.
- **Visual de cima:** superfície de gelo azul-esbranquiçado com rachaduras, neve nas bordas, pinheiros escuros na margem. Dia frio e nublado.
- **Paleta:** `#DCEEF7` `#A9CFE3` `#5E8FAE` `#1F3B4D` `#FFFFFF`
- **Regra sugerida:** atrito muito baixo (o bey desliza); impactos fortes racham o gelo e abrem buracos de ring-out.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_45 e https://en.wikipedia.org/wiki/Beyblade_(season_1)

### `black-sea-bowl`: Black Sea Bowl
- **Temporada / ep.:** T1 ep. 48, "Victory in Defeat" (final do Mundial, na Rússia)
- **Quem batalhou:** Kai x Spencer (Demolition Boys). Spencer vence as duas rodadas: Seaborg usa a água do prato para levantar um tsunami.
- **Visual de cima:** prato com água escura na bacia, ilhas e plataformas de piso, iluminação de arena. Interior.
- **Paleta:** `#0E2A3B` `#1F5673` `#4FA3C7` `#D9E6EC` `#C0392B`
- **Regra sugerida:** a água ocupa parte do prato: freia, e de tempos em tempos uma onda empurra todos para a borda.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_48

### `prato-de-gelo-final`: Prato de gelo da final
- **Temporada / ep.:** T1 ep. 50, "New and Cyber-Improved...", e ep. 51, "Final Showdown!"
- **Quem batalhou:** Tyson x Tala (Yuri). Tala "escolhe perder" a 1ª rodada. Na 2ª, o ataque congelante prende o prato num bloco de gelo e Tala vence. Na 3ª, Tyson vence e é campeão mundial.
- **Visual de cima:** prato coberto de gelo e cristais, cercado por uma parede de gelo (cúpula), luz azulada.
- **Paleta:** `#E8F6FF` `#9FD3F0` `#4A7FB0` `#22334D` `#F5F7FA`
- **Regra sugerida:** "frio": o giro cai mais rápido para todos; parede de gelo, sem ring-out.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade_-_Episode_50 e https://beyblade.fandom.com/wiki/Beyblade_-_Episode_51

---

## V-Force (2002)

### `parque-mr-x`: Parque do Mr. X
- **Temporada / ep.:** V-Force ep. 2, "The Search for Mr. X", e ep. 31, "Attack of the Rock Bit Beast"
- **Quem batalhou:** ep. 2: Tyson reencontra o Mr. X (Ozuma) no parque e pede revanche (sem resultado no episódio). Ep. 31: Ray x Foxy num parque local, com Kai na plateia. Ray vence com a ajuda de Tyson.
- **Visual de cima:** gramado com caminhos de terra batida, árvores, bancos, um BeyStadium público. Tarde.
- **Paleta:** `#7BBF5A` `#4F8A3A` `#C8A878` `#5A4632` `#F4E9D0`
- **Regra sugerida:** árvores como obstáculos fixos; a borda de grama freia (ring-out para a grama vira "atolar").
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_02 e https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_31

### `escola-preparatoria`: Escola preparatória do Kai
- **Temporada / ep.:** V-Force ep. 5, "Guess Who's Back in Town?!"
- **Quem batalhou:** Wyatt x bladers da escola (Wyatt vence); Wyatt, com o Dranzer do Kai, x Dunga (Dunga vence); Kai x Dunga (empate).
- **Visual de cima:** pátio de escola particular, com piso de lajotas, canteiros, bancos de concreto e fachada de tijolo. Dia. O terraço é **não confirmado**.
- **Paleta:** `#C9B79C` `#8E3B2F` `#5E7C4A` `#E7E2D8` `#2E3B55`
- **Regra sugerida:** piso liso; bancos de concreto em volta rebatem os beys.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_05

### `praia-de-treino`: Praia de treino
- **Temporada / ep.:** V-Force ep. 15, "Show Me The Bit Beasts!" (e o penhasco do ep. 40, "Squeeze Play")
- **Quem batalhou:** ep. 15: Ray x Joseph (Ray vence), além de treinos entre os Bladebreakers. Ep. 40: Ray vence Max no treino à beira-mar; Ray e Zeo vencem Denny (dois Klarken) na beira de um penhasco.
- **Visual de cima:** areia clara, faixa de espuma, mar azul-esverdeado numa borda, rochas. Sol de verão.
- **Paleta:** `#F1DDA8` `#E0C27E` `#3BA6A6` `#1D6E8C` `#FFFFFF`
- **Regra sugerida:** areia freia muito; a maré avança e recua na borda do mar, encolhendo a área segura.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_15 e https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_40

### `margem-do-rio`: Margem do rio
- **Temporada / ep.:** V-Force ep. 17, "Hilary's Bey-B-Cue", e ep. 30, "Get a Piece of the Rock"
- **Quem batalhou:** ep. 17: depois do churrasco, à beira-rio, Tyson x Kane (empate). Ep. 30: Tyson treina na margem do rio e é desafiado por Ozuma e os Saint Shields (Zeo interrompe).
- **Visual de cima:** barranco de grama, faixa de cascalho, rio largo numa borda, talvez uma ponte ao fundo (a ponte é **não confirmada** nesses episódios). Tarde dourada.
- **Paleta:** `#8DBF6A` `#B9A98A` `#4C8FB8` `#2F5E7A` `#F2C46D`
- **Regra sugerida:** ring-out para o lado do rio "cai na água" (derrota imediata); o lado do cascalho freia.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_17 e https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_30

### `torre-de-batalha`: Torre de Batalha
- **Temporada / ep.:** V-Force ep. 21 a 27 ("Battle Tower Showdown" a "Building the Perfect Beast!")
- **Quem batalhou:** um andar por batalha: Bladebreakers x robôs; Max x Jim/Cyber Draciel (Jim vence e captura Draciel, ep. 22); Ray x Salima (ep. 23, andar-caverna); Kai x Goki (ep. 24); Tyson x Kane/Cyber Dragoon (Tyson vence, ep. 27). A torre desmorona no fim.
- **Visual de cima:** cada andar é um piso diferente: metal de laboratório, caverna de pedra e salão escuro com luzes vermelhas. Interior.
- **Paleta:** `#1B1E24` `#3C4452` `#00C2FF` `#FF2E4C` `#8A7E6A`
- **Regra sugerida:** modo escada: cada vitória sobe um andar, e cada andar tem atrito e obstáculos próprios.
- **Fonte:** https://en.wikipedia.org/wiki/Beyblade_V-Force e https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_27

### `parque-abandonado`: Parque de diversões abandonado
- **Temporada / ep.:** V-Force ep. 37, "Beybattle at the Bit-Beast Corral", e ep. 38, "The Fate of the Spark Battle"
- **Quem batalhou:** ep. 37: Max x Mariam na área do Velho Oeste (empate; Max vence a revanche). Ep. 38: Kai e Ray x Dunga e Joseph (Yusufu) numa montanha-russa abandonada (Kai e Ray vencem).
- **Visual de cima:** rua de cidade cenográfica do Velho Oeste: tábuas de madeira, saloon, garrafas de vidro (na versão japonesa os beys quebram garrafas), trilhos de montanha-russa enferrujados. Entardecer.
- **Paleta:** `#A0703F` `#6E4A2A` `#D9B26F` `#7A3B2E` `#3E5C76`
- **Regra sugerida:** garrafas quebráveis tiram um pouco de giro de quem bate nelas; tábuas soltas fazem o bey quicar.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_37 e https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_38

---

## G-Revolution (2003)

### `piscina-publica`: Piscina pública
- **Temporada / ep.:** G-Rev ep. 3, "Invitation to Battle" (オレには勝てん)
- **Quem batalhou:** Daichi mostra habilidade num "confronto" na piscina pública, que acaba com Tyson, Daichi, Kenny e Hilary expulsos. A wiki registra Tyson x Daichi como **sem resultado** no episódio, e a revanche aceita depois acontece na rua. **Kai não está na cena.** A boia inflável e uma batalha formal na piscina são **não confirmadas**. No mesmo episódio, Ray x Jin numa noite de tempestade (Jin vence), com Metal Driger usando os reflexos na água do chão.
- **Visual de cima:** piso de azulejo azul-claro em volta, raias, borda branca, a água como "prato". A boia-anel flutuando como estádio é uma ideia do jogo, não do anime. Dia de verão.
- **Paleta:** `#3FB8E6` `#9FE0F5` `#FFFFFF` `#F2F2F2` `#FF6F59`
- **Regra sugerida:** o estádio é uma boia flutuante que deriva devagar; ring-out cai na água (derrota). Variante de tempestade (Ray x Jin): poças que espelham e escondem o bey rival por instantes.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_03 e https://en.wikipedia.org/wiki/Beyblade_G-Revolution

### `estadio-ayers-rock`: Estádio Ayers Rock
- **Temporada / ep.:** G-Rev ep. 25, "Max Attacks!" (contexto no ep. 21, "Under Pressure", com o encontro no topo do Uluru)
- **Quem batalhou:** Tyson x Max (Tyson vence com Galaxy Storm). O computador sorteia o Ayers Rock Stadium, e Draciel chega a ser derrubado de cima da rocha para o prato. Na mesma etapa australiana, Daichi vence Rick (ep. 24).
- **Visual de cima:** prato de terra vermelha com uma grande rocha laranja-ferrugem no centro, arbustos secos na borda. Sol do deserto.
- **Paleta:** `#C1440E` `#E07A3F` `#F2C48D` `#6B8E4E` `#2A1A12`
- **Regra sugerida:** a rocha central é um planalto: o bey em cima dela ganha vantagem de ataque para baixo, mas sai dela se for atingido.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_25 e https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_21

### `estadio-bega`: Estádio da BEGA
- **Temporada / ep.:** G-Rev ep. 36, "Boris, the Blade Stops Here!"
- **Quem batalhou:** Tala x Garland. A wiki registra empate. A Wikipedia diz que Garland vence: Apollon joga Wolborg para fora e grades sobem do chão para manter o bey no prato, e Boris decide que só acaba quando um parar de girar.
- **Visual de cima:** prato metálico de estádio corporativo, logotipos, anel de grades retráteis na borda, telões. Iluminação de show.
- **Paleta:** `#14161C` `#3A3F4B` `#7B2CBF` `#E0E0E0` `#FFB000`
- **Regra sugerida:** depois de X segundos as grades sobem: ring-out deixa de existir e só vale a parada de giro.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_36

### `casa-do-tyson`: Casa e dojo do Tyson
- **Temporada / ep.:** dojo do vovô na T1 ep. 1 a 3 (treinos de kendo, sem batalha de bey confirmada); G-Rev ep. 26 (Tyson vence o avô num treino de kendo); **G-Rev ep. 50**, "Welcome to my Nightmare!" (batalha confirmada).
- **Quem batalhou:** G-Rev 50: Ming-Ming e Crusher atacam a casa do Tyson e parte dela desaba; Lee e Rick defendem (sem resultado). Na mesma página, Ray vence Lee num treino.
- **Visual de cima:** casa japonesa tradicional: tatame no dojo, piso de madeira, quintal de pedriscos com árvore, espadas de kendo na parede. Entardecer.
- **Paleta:** `#C8B27A` `#8B6B3D` `#E9E1CF` `#3C3C3C` `#7FA36B`
- **Regra sugerida:** tatame com atrito médio; espadas de kendo caídas formam obstáculos em linha.
- **Fonte:** https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_50, https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_26 e https://beyblade.fandom.com/wiki/Beyblade_-_Episode_01

---

## Outros locais vistos (não detalhados)

Locais confirmados nas fontes que podem virar cenário depois:

- T1 ep. 31: Londres (Kai derrota Cenotaph)
- T1 ep. 32: trem sequestrado e túnel
- T1 ep. 40: centro de treino do Boris em Moscou
- T1 ep. 41: parques de Moscou
- T1 ep. 42 a 44: a Abadia (Biovolt)
- V-Force ep. 1: torneio num supermercado
- V-Force ep. 9 a 11: ilha do Dr. B
- V-Force ep. 12: estádio sob uma ponte (Kai x Dunga, empate)
- G-Rev ep. 9: Nova York, beco perto da Estátua da Liberdade
- G-Rev ep. 23: prato de neve com totens (Kai vence Ray)
- G-Rev ep. 34: bosque das colinas Baihuzu (Mystel)
