# Engenharia reversa: Beyblade G-Revolution (GBA)

Referência do jogo ([D-007](DECISIONS.md#d-007-rom-de-gba-como-referência-e-fonte-inicial-de-assets)). Aqui ficam as descobertas sobre a ROM: formato, onde estão os dados e o que já foi extraído. A ROM e os arquivos extraídos **nunca vão para o git**.

## A ROM

| Campo | Valor |
| --- | --- |
| Arquivo | `Beyblade G-Revolution (USA).gba` (mantido fora do repositório, em `Downloads/Beyblade G-Revolution/`) |
| Título interno (0xA0) | `BEYBLADEGREV` |
| Código do jogo (0xAC) | `BB2E` |
| Maker (0xB0) | `70` (Atari) |
| Tamanho | 4 MiB (4.194.304 bytes) |
| SHA-1 | `a89f7b4eb77dc986022201db51a676451ba7c5e4` |
| Save | EEPROM (`EEPROM_V124` na ROM) |
| CPU | ARM7TDMI (código ARM/Thumb), base de carga `0x08000000` |

## Como extrair

```
node scripts/extract-rom.js "<caminho>/Beyblade G-Revolution (USA).gba"
```

O script confere o código e o SHA-1 da ROM, lê as tabelas abaixo (`scripts/lib/rom.js`) e grava `assets-rom/data/catalog.json` (fora do git). Os testes (`tests/rom.test.js`) usam uma ROM sintética, então a suíte não precisa da ROM real.

### Sprites

```
node scripts/extract-graphics.js "<caminho>/Beyblade G-Revolution (USA).gba"
```

Extrai direto da ROM os **328 conjuntos de quadros** e os **6 estádios** (ver [Estádios e fundos](#estádios-e-fundos)) (beys, bladers, interface, fontes, efeitos) para `assets-rom/sprites/` (fora do git): uma folha PNG por conjunto, com os quadros lado a lado, e `sprites.json` com endereço, tamanho, nº de quadros e paleta. As 83 beys vão para `beys/` com a paleta do próprio registro (3 quadros de 32×32: dois girando, com borrão de movimento, e um parado).

**Formato** (reimplementação de `copyFrameToVramARM`, ROM `0x083D36F4`, rotina ARM copiada para a IWRAM no boot pelo ponteiro em `0x08000258`; código em `scripts/lib/rom-frames.js`):

| Offset | Tipo | Campo |
| --- | --- | --- |
| `0x00` | u32 | Nº de quadros |
| `0x04` / `0x05` | u8 | Largura / altura em pixels |
| `0x07` | u8 | Bit `0x80`: quadros comprimidos |
| `0x0c` | u8 | Bit `0x01`: 4bpp (32 bytes/tile); senão 8bpp |
| `0x0d` | u8 | Tamanho do cabeçalho de cada quadro (4 ou 8) |
| `0x0e` | u16 | Tiles por quadro |
| `0x10` | u32 | Offset base dos dados dos quadros |
| `0x1c` | u32 | Offset da tabela de quadros (u32 por quadro, relativo à base) |

Cada quadro começa com uma **máscara de 32 bits** lida a partir do bit 0: sequências de 1 são tiles vazios (zerados), sequências de 0 são tiles que vêm dos dados; com cabeçalho de 8 bytes, a 2ª palavra é a máscara dos 32 tiles seguintes. Um **tile comprimido** tem: byte de controle (2 bits por par de linhas: trocar a palavra-base por uma do dicionário), `ceil(popcount(controle)/2)` bytes de índices de 4 bits e, por par de linhas, um byte de flags (4 bits por linha) dizendo quais bytes da palavra-base são substituídos por literais. O dicionário (ROM `0x083D2808`) é `i × 0x11111111`: linhas de cor única. A palavra-base passa de uma linha para a outra.

**Paletas:** beys pelo ponteiro `0x18` do registro (os 16 primeiros valores BGR555). Para os outros conjuntos, a paleta é **deduzida**: nos scripts de cena (`0x090000`–`0x0BFFFF`) o ponteiro do sprite costuma vir seguido do ponteiro da paleta; o extrator escolhe o mais frequente e confere se são 16 cores BGR555 válidas. Assim saíram 90 conjuntos.

**Bladers no mapa:** a tabela de bonecos em `0x0807BE2C` (registros de 28 bytes marcados pela palavra `0x0807DB20`: `+4` sprite 16×32 de 15 quadros, `+8` índice do blader, `-1` = figurante) e a lista de paletas por blader em `0x080910E8` (55 ponteiros, blocos de `0x200` a partir de `0x0826E520`) coloriram 14 bladers (Louis, Chris, Ray, Max…). Os 141 conjuntos restantes (figurantes, Tyson e parte da interface) saem em tons de cinza.

### Estádios e fundos

Os fundos são blocos **LZ77 da BIOS** (cabeçalho `0x10` + tamanho; 214 blocos válidos na ROM) com um contêiner dentro (`scripts/lib/rom-bg.js`):

| Offset | Tipo | Campo |
| --- | --- | --- |
| `0x04` | u32 | Offset dos tiles (sempre `0x20`) |
| `0x08` | u32 | Tamanho dos tiles |
| `0x0c` | u32 | Offset do mapa |
| `0x10` | u32 | Tamanho do mapa |
| `0x18` | u32 | Flags (`1` nos fundos affine; outros valores ainda sem significado) |
| `0x1c` | u16 + u16 | Largura e altura em tiles |

**Estádios** (`0x0807800C`, 6 trios de ponteiros): chão, sombreado da tigela e paleta de 256 cores (512 bytes). Os dois fundos são **affine** (o hardware gira e aproxima): 64×64 tiles de 8bpp, mapa de 1 byte por tile, 512×512 px. O chão tem as marcações do estádio; a camada "tigela" é um gradiente concêntrico, provavelmente o sombreado da inclinação (as cores dela saem estranhas com a paleta do chão, então a paleta certa ou o uso dela ainda não foi confirmado). Saída em `assets-rom/stadiums/<n>-floor.png` e `<n>-bowl.png`.

**Outros fundos** (salas e cidades do modo história, avião, títulos): mesmo contêiner, com o **mapa comprimido por linha**:

- o mapa começa com uma tabela de `u32`, um offset por linha (nº de linhas = altura em tiles);
- cada linha: `u16` com o tamanho da linha em bytes e, em seguida, comandos `s16`: **negativo** = pular N tiles (transparentes); **positivo** = N entradas de mapa de texto do GBA em seguida (`u16`: tile em bits 0–9, espelho horizontal 10, vertical 11, banco de paleta 12–15).
- Ex.: `0022 fff8 000e <14 entradas> fff8` = pula 8, 14 tiles, pula 8 (30 de largura).
- Contêineres com `tilesLength = 0` usam os tiles de outro bloco (a 2ª camada do salão `0x08210F20` usa os tiles do `0x0820FFC0`).
- Registros de sala em ~`0x080929B4` (ponteiros para as camadas `0x0820FFC0`/`0x08210F20`). A paleta das salas **ainda não foi achada** (os candidatos `0x082188AC` e `0x08118DBC` não batem); por isso não estão no extrator.
- O salão do torneio (`0x0820FFC0`, 80×56 tiles: arquibancada, escada e estádio no centro) seria o cenário ideal da entrada na arena quando a paleta for achada.

**Não há retratos de personagem no GBA:** nem nos 328 conjuntos de sprites (o maior personagem é o boneco de 16×32) nem nos 37 fundos de tela (todos são salas, avião e títulos). A aparência G-Revolution dos personagens existe só nos bonecos de 29 quadros (`public/rom/walk/`).

### Controles e regras pelos textos do jogo

As dicas do próprio jogo (`TIP: ...`, `0x08382924`–`0x08383676`, nos 5 idiomas) definem os comandos da batalha: **A** ataca (segurar carrega), **B** defende (segurar carrega), **L** pula, **R** esquiva, **L+R** segurados soltam a fera bit, **A+B** segurados ativam o Engine Gear e, depois de um "HIT!", ↑↓A / ←→A / →←A fazem combo forte, médio e fraco. Finais: "Ring out" e "Spin down" (`0x083836BC`, `0x083836EC`). Lançamento: "Premature launch" (`0x083A49D4`). Lançadores e ripcords quebram ("Your launcher has broken!", `0x083A3E18`). A tabela completa, com a proposta para o DualShock 4, está em [`GAME_FLOW.md`](GAME_FLOW.md#controles-da-batalha-rom-e-proposta-para-o-dualshock-4).

### Quadros dos personagens principais

Os sprites 16×32 dos personagens principais têm **29 quadros** (os figurantes têm 15): andando de lado (≈0–7), de costas (8), de frente parado e andando (≈9–16), poses de lançamento (≈17–21), de costas andando (≈22–25) e de frente andando (≈26–28). A divisão exata ainda precisa ser confirmada pelas tabelas de animação; serve para a entrada na arena e o lançamento (D-023).

Identificação dos personagens e paletas: ver [Dados da ROM para o jogo](#dados-da-rom-para-o-jogo).

### Sprites pelo emulador (alternativa)

Para backgrounds, sprites affine ou para conferir algo na tela: no mGBA, **Tools > Scripting > File > Load script** com `scripts/mgba/dump-vram.lua` e jogue. A cada 30 frames, se os sprites mudaram, ele grava VRAM, paletas, OAM, registradores de vídeo e screenshot em `assets-rom/mgba/`. Depois, `node scripts/render-vram.js` grava um PNG por sprite distinto em `assets-rom/sprites-vram/` (decodificação em `scripts/lib/gba-gfx.js`).

### Dados da ROM para o jogo

```
node scripts/build-rom-assets.js "<caminho>/Beyblade G-Revolution (USA).gba"
```

Gera `public/rom/` (fora do git, D-007), que o jogo consome em `/rom/...`:

- `gba.json`: para cada bey da pesquisa que existe no GBA (35 de 46, mapa em `src/content/gba.js` → `GBA_BEYS`), as peças, a soma de attack/defense/endurance (0–12), rotação, temporada, nome do especial e o sprite; os quadros de caminhada por personagem; os 6 estádios; os 4 lançadores e 4 ripcords.
- `beys/<slug>.png`: 3 quadros de 32×32 (dois girando e um parado).
- `walk/<personagem>.png`: 29 quadros de 16×32, na ordem de `WALK_FRAMES` (0–7 parado de lado, 8 de costas, 9–16 de frente, 17–20 andando de lado, 21–24 de costas, 25–28 de frente; para a direita, espelhar).
- `stadiums/<n>-floor.png` e `<n>-bowl.png`: 512×512.
- `fx/<efeito>.png`: 19 efeitos de batalha de 64×64 (mapa em `GBA_FX`): letreiros animados HIT!, TIE!, REVERSAL e COMBO, anel de impacto, faíscas, estilhaços (burst), chamas, vento, esfera e espiral escuras, entre outros. A paleta deles não foi achada estaticamente (os bancos em `0x083002E0`–`0x083006E0` não batem), então saem em tons de cinza para o renderizador colorir com os tokens do design system; a cor original exige o dump pelo mGBA.

Funções puras para as telas e a simulação em `src/content/gba.js` (`gbaOverlay`, `toTenScale`, `walkInFrame`), com testes em `tests/gba-content.test.js`.

**Sprites dos personagens:** Tyson `0x083147C8` (paleta `0x083002E0`), Kai `0x083024A4`, Ray `0x08306910`, Max `0x08305DC0`, Daichi `0x0830191C`, Tala `0x08265590` (paletas da lista de bladers); Bryan `0x08303A84` e Lee `0x0830AB18` são identificações **prováveis**. Brooklyn e Robert não têm sprite no jogo de GBA. Corrige a nota anterior: o boneco de índice 12 é mesmo o Ray (bandana vermelha), não o Kai.

**Diferenças com o anime** que o jogo herda do GBA: Zeus gira para a esquerda (no anime, direita); Bryan usa Wyvern DJ na tabela de bladers (no anime, Falborg, que não existe no GBA); Driger S tem o bit de rotação esquerda. Beys do anime sem versão no GBA (Black Dranzer, Dranzer V2, Driger V2, Falborg, Falborg 2, Gaia Dragoon, Gaia Dragoon V, Dragoon MS Ultimate, Dragoon V2 High Power Custom, Draciel Metal Ball Defenser) usam só os dados da pesquisa.

## Descobertas

- **Textos sem compressão, em ASCII.** Cada texto existe em 5 idiomas, na ordem `en, fr, es, it, de`. O slot `fr` costuma estar vazio ou em inglês (a versão USA não tem francês completo).
- **Ponteiros** são absolutos, little-endian, com base `0x08000000` (endereço da ROM no GBA).
- O código mantém nomes de função de debug em texto (`getBeyBladeWithIndex`, `getRandomBeyBladeFromSeason`, `removeBladeFromTysonsCollection`). Eles servem de âncora para achar as funções no Ghidra.
- O roster do GBA tem beys que não estão em `pesquisa-bakuten/` (ex.: Ultimate Frostic Dranzer, Knight Dranzer, Metal Draciel, Torch Pegasus, Wyvern DJ, Gigars, Rock Bison).

### Tabela de feras bit e especiais (`0x796dc`, 71 registros de 40 bytes)

| Offset | Tamanho | Campo |
| --- | --- | --- |
| `0x00` | 5 × ponteiro | Nome da fera bit, um por idioma |
| `0x14` | 5 × ponteiro | Nome do especial, um por idioma |

Os registros `0x00`–`0x26` são feras genéricas (nome e especial iguais, ex.: `Dragoon`). Os de `0x27`–`0x46` têm especial próprio (ex.: `0x28` Driger → `Driger Slash`, `0x29` Driger → `Driger Disaster`, `0x43` Zeus → `Zeus Claws`).

### Tabela de beyblades (`0x7a1f4`, 83 registros de 40 bytes)

Vem logo depois da tabela de feras bit, no mesmo formato de 40 bytes.

| Offset | Tamanho | Campo | Confiança |
| --- | --- | --- | --- |
| `0x00` | 5 × ponteiro | Nome, um por idioma | confirmado |
| `0x14` | ponteiro | Gráfico da bey (provável: tiles) | provável |
| `0x18` | ponteiro | Paleta da bey | provável |
| `0x1c` | u8 | Tipo: `0` attack, `1` defense, `2` endurance, `3` combination (ordem dos textos "Attack type"…"Combination type") | provável; várias beys da S3 aparecem como `0` mesmo sendo de defesa |
| `0x1d` | u8 | Índice do Attack Ring | confirmado (Dragoon V2 → Spike Dragoon, Driger G → Triple Tiger) |
| `0x1e` | u8 | Índice do Weight Disk | confirmado (Dragoon V2 → Magnetic WD) |
| `0x1f` | u8 | Bits 0–4: índice do Spin Gear/Core. Bits 5–7: flags | índice confirmado (Draciel MS → Sharp Core, Dranzer MS → Manual Change Core) |
| `0x20` | u8 | Índice da Blade Base | confirmado (Dragoon V2 → Customize Grip, Dranzer F → Flame Change) |
| `0x21` | u8 | Índice na tabela de feras bit/especiais | confirmado |
| `0x22` | u8 | Desconhecido (sempre `0`) | — |
| `0x23` | u8 | Sempre `0xff` | — |
| `0x24` | u8 | "Base damage" da bey (sempre `0` na ROM). A função em `0x08034420` imprime `" blade %d base damage %d"` com este byte | confirmado (debug) |
| `0x25` | u8 | Temporada: `1` S1, `2` V-Force, `3` G-Rev; `0` = bey genérica/outros | confirmado: `getRandomBeyBladeFromSeason` (`0x0803DC70`) sorteia entre as beys com este byte igual ao pedido |
| `0x26` | s16 | Experiência da própria bey (`0` na ROM; cresce no save) | confirmado (entra na soma dos stats, ver abaixo) |

**Sentido de rotação (resolvido):** a função `0x0803DD2C` testa só o bit `0x40` do byte `0x1f`: ligado mostra "Left spin" (textos em `0x08097534`), desligado mostra "Right spin" (`0x08097548`). O bit `0x80` marca as de direita, mas o código não o lê ali. A Driger S com `0x40` aparece como esquerda no jogo (erro de dado da ROM). Dranzer MS e Wyvern DJ (`0x00`) caem em "Right spin".

**Sobre o tipo em `0x1c`:** ele não bate com a classe que a batalha usa. A IA e o rótulo de classe vêm da soma dos stats das peças (função `0x0803E2AC`, abaixo). Em 83 beys, `0x1c` concorda com essa classe em só 14. Pode ser só um rótulo de menu ou paleta.

### Listas de nomes de peças

Cada lista é uma tabela de idiomas: 5 ponteiros (um por idioma) para arrays de ponteiros de nome. O índice na lista é o que a tabela de beys usa.

| Lista | Tabela de idiomas | Itens |
| --- | --- | --- |
| Spin Gear / Core | `0x7b0c4` | 22 |
| Attack Ring | `0x7b6dc` | 77 |
| Blade Base | `0x7bb6c` | 42 |
| Weight Disk | `0x7bda4` | 19 |

Também existem listas de golpes de batalha (Normal/Super/Ultra attack e Normal/Super defense) e textos de menu, ainda não extraídas. Lançadores e cordas estão abaixo.

### Stats das peças: AR `0x7b6f0`, BB `0x7bb80`, WD `0x7bdb8`

Cada tabela de stats começa logo depois da tabela de idiomas da lista de nomes (tabela de idiomas + 20 bytes) e usa o mesmo índice. Entrada de 4 bytes:

| Offset | Tipo | Campo | Confiança |
| --- | --- | --- | --- |
| `0` | u8 | Attack | confirmado |
| `1` | u8 | Defense | confirmado |
| `2` | u8 | Endurance (stamina) | confirmado |
| `3` | u8 | Sempre `0` | — |

| Tabela | Endereço | Entradas | Faixa |
| --- | --- | --- | --- |
| Attack Ring | `0x0807B6F0` | 77 | 1–4 em cada stat |
| Blade Base | `0x0807BB80` | 42 | 0–4 (só Engine Stopper e Final Clutch Dranzer G têm `0`) |
| Weight Disk | `0x0807BDB8` | 19 | 1–4 |
| Spin Gear / Core | — | 22 | **sem tabela de stats**: o SG não entra na soma |

Como foi confirmado: a função em `0x08031928`–`0x08031A6E` soma o byte 0 de WD + BB + AR e imprime com `">--  att %d"` (`0x0833C464`); o byte 1 vai para `"def"` e o byte 2 para `"end"`. Exemplos (atk/def/end): Spike Dragoon `4/1/4`, Cross Dragon `3/2/2`, Triple Tiger `3/3/1`, Strike Turtle `2/4/2`; Fortress (BB) `3/1/1`, Customize Grip `1/3/4`; 6 Heavy `1/4/4`, 10 Heavy `3/4/2`, Magnetic WD `4/4/1`.

**Não existe peso.** Nenhuma tabela tem gramas nem um campo "weight"; o WD é só mais um trio atk/def/end. E os valores não seguem a física: o 10 Heavy não é o WD mais forte em defesa nem em resistência, e várias peças de defesa têm defesa baixa (Fortress `1`). Os números parecem ter sido balanceados à mão para o jogo, não medidos.

Funções auxiliares por peça: `0x0803EBD8` (AR), `0x0803EC5C` (BB) e `0x0803ECE0` (WD) somam os 3 stats e devolvem uma faixa: soma 1–3 → `0`, 4–6 → `1`, 7–9 → `2`, outros → `3`. Onde essa faixa aparece na tela ainda não foi visto (talvez nível ou raridade no menu de peças).

### Blader (personagens): `0x909c4`, `0x911cc`, nomes `0x90b7c`

- **Stats** (`0x080909C4`, 55 entradas de 8 bytes): `+0` u16 experiência, `+2` u8 desconhecido (provável Level; costuma ser igual ao `+3`), `+3` u8 Strength, `+7` u8 flags. Ex.: Kai `1300/11/11`, Ray `1300/8/8`, Max `900/2/2`, Daichi `1200/1/4`, Tala `2300/11/11`, Rick `2700/12/12`.
- **Bey de cada blader** (`0x080911CC`, 1 byte por blader): índice na tabela de beys (Kai → Dranzer G, Ray → Driger G, Max → Draciel G, Daichi → Strata Dragoon G, Tala → Wolborg 4). Os valores `0x54`–`0x58` sorteiam uma bey das temporadas `0`, `1`, `2`, `3`, `0` (função `0x08042CBC`).
- **Nomes** (`0x08090FF0`, tabela de idiomas → EN em `0x08090B7C`, 57 nomes; os 55 primeiros são os bladers acima, o último é Tyson).
- Em RAM ficam em `*[0x03000540]`: 55 × 48 bytes, com a bey inteira copiada a partir de `+8`.
- `matchBladerExperience` (`0x08042F4C`) ajusta à dificuldade: `exp = base + 100 × dificuldade` e `strength = strength + dificuldade`.

### Lançadores e cordas

| Id | Lançador | Corda | Preço lançador / corda |
| --- | --- | --- | --- |
| 1 | Competition launcher | Competition ripcord | 200 / 100 |
| 2 | Professional launcher | Super long ripcord | 50 / 30 |
| 3 | Metal launcher | Extended ripcord | 20 / 20 |
| 4 | Plastic launcher | Plastic ripcord | 10 / 10 |

Nomes: `0x0807AEEC` (lançadores) e `0x0807AEFC` (cordas), indexados por `id - 1`. Preços: tabela da loja em `0x08077AC0` (12 bytes: u16 categoria do inventário `2` corda / `3` lançador, u16 id, u16 quantidade, u16 preço, ponteiro do nome). No inventário cada item tem 4 bytes: id, equipado, durabilidade, categoria.

O lançador e a corda **não somam stats** à bey. O efeito encontrado é o desgaste (`0x0803D51C`): a cada batalha a durabilidade (máximo `100`, ver `0x0802BCD4`) cai `id + strength do jogador`. Ao chegar a `0` o item quebra ("Your launcher has broken!"). Um Competition (id 1) dura 100 lançamentos com strength 0; um Plastic (id 4), 25. Se o lançador muda a velocidade das barras do lançamento, isso ainda não foi encontrado.

### O que ainda falta achar

- Significado de `+2` do blader, do byte `0x1c` da bey e da faixa de `0x0803EBD8`.
- Efeito do Spin Gear / Engine Gear na batalha (`"do an ENGINE GEAR of %d"` em `0x0833C5C8`) e do especial da fera bit (`"start bit beast from select : power %d"`).
- Os números das tabelas de IA (abaixo). O cálculo local de dano foi identificado em `0x0802FFAC` / `0x080300D4` (seção abaixo); ainda falta mapear todos os estados que permitem ou impedem chamar essa rotina, os efeitos posteriores e os caminhos próprios de especiais/Engine Gear.
- Gráficos: paleta dos 141 conjuntos de sprites ainda em cinza (figurantes, Tyson e parte da interface), a paleta da camada "tigela" dos estádios e a compressão do mapa dos outros fundos (cidades, menus).
- Áudio. O motor de som é próprio (sem assinatura de M4A/Sappy, Krawall ou GAX; mensagens `"Not enough RAM for sound mixer"`, `"Out of audio channels"`, `"End Track Here"` em `0x083D250B`–`0x083D2590`). A lista de nomes dos 16 efeitos fica em `0x08077FA4` (`SFXID_impact1`–`3`, `jump`, `land`, `evade`, `defend`, `eg_active`, `beast1`–`2`, `ripper`, `ripperboost`, `ripperpulled`, `menuyes`, `menuno`, `select`), mas é só debug: não aponta para as amostras. Caminho mais curto: gravar o som pelo mGBA (File > Record A/V) em vez de decodificar o formato.

### Dano e defesa: avanço de 2026-10-25

Análise estática da ROM com SHA-1 conferido. Nesta sessão o MCP do REA não estava disponível; a continuação usou o desmontador Thumb local `../extracted/gba/dis.mjs`. Não houve execução no mGBA nem decompilação pelo REA nesta etapa.

**Rotinas identificadas:** `0x080300D4` calcula a contribuição de uma ação; `0x0802FFAC` combina as duas contribuições e desconta RPM; `0x080320CC` limita RPM negativo a zero. Há uma chamada ao resolvedor em `0x08032B24`, dentro da rotina iniciada em `0x08032A88`.

Cada objeto de combate aponta em `+0x04` para o participante (stats em `+0x10` ataque, `+0x14` defesa, `+0x18` endurance e RPM em `+0x0C`). No objeto de combate, `+0x2CC` é a ação e `+0x2C8` é seu subtipo. A tabela de nomes em `0x08077F44` confirma os IDs das ações:

| ID | Ação | Contribuição em `0x080300D4` |
| --- | --- | --- |
| 0 | `RPS_MOVE_ATTACK` | subtipo 0: ATK; 1: 2 × ATK; 2: 3 × ATK; demais: 0 |
| 1 | `RPS_MOVE_DEFENSE` | subtipo 0: DEF; 1: 2 × DEF; 2: 3 × DEF; demais: 0 |
| 2 | `RPS_MOVE_ENDURANCE` | ATK deslocado aritmeticamente 1 bit à direita (para ATK positivo, piso de ATK / 2) |
| 3 | `RPS_MOVE_BIT_BEAST` | ATK + DEF + END somente quando subtipo = 3; nos demais, 0 |
| 4 | `RPS_MOVE_BIT_BEAST_TARGET` | 0 nesta rotina |
| 5 | `RPS_MOVE_JUMP` | chama o gerador `0x080628B4` com argumento 4 |
| 6 | `RPS_MOVE_DODGE` | 0 nesta rotina |

O subtipo é registrado numericamente: ainda não foi confirmado como a interface escolhe cada valor. A contribuição zero de uma ação **não significa ausência de efeito**: podem existir outros caminhos para esquiva, alvo, salto e especiais. Para o salto, a rotina geradora termina em `0x08074264`, com comportamento de resto de divisão; o domínio esperado é 0–3, mas o teste descrito abaixo substitui o gerador por um retorno fixo e não valida sua distribuição.

**Resolvedor (`0x0802FFAC`):** pseudocódigo dos caminhos observados, com `a` e `b` representando contribuições, e não o dano recebido pelo mesmo jogador:

```text
a = contribuicao(P1)
b = contribuicao(P2)
se as duas ações forem ATTACK:
    a = divisao_inteira_com_sinal(a, 2)
    b = divisao_inteira_com_sinal(b, 2)
se P1 estiver em DEFENSE:
    antigo_b = b
    b = b - a
    a = a - antigo_b
se P2 estiver em DEFENSE:
    antigo_a = a
    a = a - b
    b = b - antigo_a
a = max(a, 0)
b = max(b, 0)
se b > P1.END: P1.objeto[+0x2B8] += (b - P1.END) >> 1
se a > P2.END: P2.objeto[+0x2B8] += (a - P2.END) >> 1
P1.RPM -= b
P2.RPM -= a
limitar RPM a zero
atualizar apresentação por 0x08031204
```

A divisão por 2 usa `0x080674A0` (`swi 6`, divisão da BIOS), com truncamento em direção a zero. O clamp de RPM em `0x080320CC` atende aos quatro slots de participantes. O significado e o consumo do acumulador `+0x2B8` ainda não foram rastreados; não o tratar como dano extra de RPM.

Exemplos derivados do pseudocódigo: dois ataques com ATK 11 e 7 causam perdas de RPM 3 e 5, respectivamente. Defesa 14 contra ataque 11 zera a contribuição ofensiva do atacante e deixa contribuição 3 do defensor, que reduz o RPM do atacante. Quando ambos defendem, os dois blocos são executados em sequência; preservar essa ordem em qualquer reprodução.

O resolvedor também devolve o ponteiro do lado com maior contribuição e escreve um código 0/1/2 e a contribuição vencedora pelos argumentos de saída. Empate retorna ponteiro nulo e contribuição 0. Isso descreve o resultado local da interação, **não o vencedor da partida**.

**Limites da descoberta:** antes da chamada em `0x08032B24`, existem verificações do byte `+0x311` dos dois objetos e chamadas a `0x08034880` com argumento 7. O significado desses bloqueios ainda precisa ser identificado. Portanto, a rotina acima não é apresentada como o sistema inteiro de batalha ou como prova de que toda colisão desconta RPM.

**Verificação reproduzível:** `node ../extracted/gba/check-combat.mjs`. O script local executa as instruções Thumb de `0x080300D4` com memória sintética em 147 combinações (7 ações × 7 subtipos × 3 conjuntos de stats), comparando os retornos com a tabela acima. O RNG é substituído por retorno 2, com conferência de endereço da chamada e argumento 4. Não testa o resolvedor inteiro, gráficos, áudio nem comportamento em tempo real. `combat-evidence.json` guarda SHA-1 da ROM e SHA-256 dos trechos analisados. Script e evidências ficam em `../extracted/gba/`, fora do repositório, junto dos dados locais da D-007.

Próximos passos desta frente: rastrear os bloqueios da chamada; identificar `+0x2B8`; mapear a escolha do subtipo; rastrear efeitos posteriores de feras e Engine Gear; conferir casos no emulador.

## Como o jogo pensa os atributos

A batalha do GBA não é física: é um "pedra, papel e tesoura" por turnos (`RPS_MOVE_ATTACK`, `RPS_MOVE_DEFENSE`, `RPS_MOVE_ENDURANCE`, `RPS_MOVE_BIT_BEAST`, `RPS_MOVE_JUMP`, `RPS_MOVE_DODGE`, em `0x0833C104`–`0x0833C17C`). Os atributos só alimentam esse sistema.

1. **Três stats, escala pequena.** Cada peça (AR, WD, BB) tem Attack, Defense e Endurance de 0 a 4. A bey é a **soma simples** das três peças, então cada stat vai de 3 a 12. O Spin Gear, o lançador, a corda e a fera bit não entram na soma.
2. **A experiência pesa mais que as peças.** Ao montar o participante da luta (`0x08031944`–`0x08031A1C`, struct de 44 bytes em `0x030002A0`):

   ```
   atk = AR.atk + WD.atk + BB.atk + (exp_blader + exp_bey) / 100
   def = AR.def + WD.def + BB.def + (exp_blader + exp_bey) / 100
   end = AR.end + WD.end + BB.end + (exp_blader + exp_bey) / 100
   ```

   A mesma parcela entra nos três stats. O Kai (exp 1300) ganha +13 em cada um, mais do que qualquer bey dá só com peças.
3. **A classe da bey vem dos stats** (`0x0803E2AC`): `atk > 8` → ataque; senão `def > 8` → defesa; senão `def > 5` e `end > 5` → resistência; senão combinação. Ela escolhe a IA do oponente (`0x08033B06`: "set an ATTACK/DEFENSE/ENDURANCE/COMBINATION AI"). Cada IA aponta para uma struct de 52 bytes: ataque `0x080784A4`, resistência `0x080784D8`, defesa `0x0807850C`, combinação `0x08078540`. Os 5 primeiros u32 parecem limiares de sorteio em 0–240 (ataque `45,160,45,150,240`; defesa `90,120,30,120,240`); significado não confirmado.
4. **Barras na tela:** cada stat aparece como `soma / 3 - 1` (`0x0803E328`, `0x0803E374`, `0x0803E3C0`), ou seja, 0 a 3 barras.
5. **Lançamento (RPM inicial)** (`0x0803CECC`). O minigame dá `power` e `boost` (escala 0–100):

   ```
   rpm = (power + boost) * exp / 100 + strength * (power + boost)
   se power > 94 e boost > 94: rpm = rpm * 1.25   (lançamento perfeito)
   ```

   `exp` é a mesma soma blader + bey. `strength` é a do Tyson (save `+0x878`) ou a do blader da IA (`+3`). A IA sorteia `power = 80 + rand(20)` e `boost = 75 + rand(25)`.
6. **Progressão:** vencer sobe a experiência (cada 100 pontos = +1 nos três stats) e a strength (mais RPM no lançamento, mas desgaste maior do lançador e da corda).

Para o nosso jogo, isso quer dizer: os números do GBA servem de **referência de balanceamento relativo** entre as peças (escala 0–4 por stat), não de física. Peso, raio e atrito continuam vindo das medidas reais (D-007 / `BEYBLADES.md`).

Dados completos (todas as entradas, nomes nos 5 idiomas e campos calculados) ficam fora do git, em `../extracted/gba/` (`parts.json`, `beys.json`, `characters.json`, `launchers.json`, `ai.json`, `notes.json`), gerados por `extract.mjs` (mesma pasta).

## Ferramentas

| Ferramenta | Para quê | Status |
| --- | --- | --- |
| REA (`rea-agents`, [morluto/rea](https://github.com/morluto/rea)) | Agente de engenharia reversa (MCP) ligado ao Ghidra | Em uso segundo o usuário; MCP não exposto nesta sessão de 2026-10-25 |
| Ghidra 12.2 + JDK 25 (Temurin) | Desmontar e descompilar o código ARM/Thumb | Instalado em `C:Usersluizf	oolsghidra_12.2_PUBLIC` (o Ghidra 12.2 **exige JDK 25**). Uso headless e scripts em [Ghidra headless](#ghidra-headless) |
| mGBA 0.10.5 | Emulador com debugger, visualizador de tiles/sprites/paletas e busca de memória | Instalado (winget `JeffreyPfau.mGBA`) |

### Ghidra headless

- O `analyzeHeadless.bat` **não aceita parênteses no caminho**: use uma cópia da ROM com nome simples, fora do repositório (ex.: `C:Usersluizf	oolsdlb2e.gba`).
- Importar como binário cru: `-loader BinaryLoader -loader-baseAddr 0x08000000 -processor ARM:LE:32:v4t`.
- A análise automática completa foi encerrada por falta de memória na máquina. Rode com `GHIDRA_HEADLESS_MAXMEM=768M`, `-noanalysis` e `-max-cpu 1`; os scripts criam as funções que importam.
- Scripts (fora do repositório, em `C:Usersluizf	oolsghidra-scripts`): `SeedGba.java` cria as funções Thumb a partir dos prólogos `push {…, lr}` (996 funções); `DecompRefs.java` descompila quem usa um valor de 32 bits (literal pool); `DecompAt.java` descompila a função que contém um endereço, voltando até o início de funções folha.
- Confirmado por esse caminho: `getRandomBeyBladeFromSeason` em `0x0803DC70` (filtra pelo byte `0x25`, 83 beys) e `getBeyBladeWithIndex` em `0x0803DCFC` (`índice × 0x28`); `0x0803EBB0` é só o leitor de nome de Attack Ring por idioma.

## Plano de extração

1. **Dados**: nomes, peças e stats (tabelas perto dos textos), parâmetros de física, regras de vitória.
2. **Gráficos**: sprites das beys, retratos dos personagens, arenas, efeitos (pelos visualizadores do mGBA ou por descompressão LZ77 da BIOS).
3. **Áudio**: músicas e efeitos.
4. **Comportamento**: lançamento, colisão, perda de rotação e especiais, observados no emulador e confirmados no código pelo Ghidra.

Cada valor extraído é registrado aqui com o endereço na ROM.
