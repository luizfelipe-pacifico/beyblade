# Engenharia reversa: Beyblade: Metal Fusion (Nintendo DS)

Terceira referência, só para **design de combate**: como a batalha funciona (controles, fluxo, condições de vitória, medidores, especiais). Mesmas regras da ROM de GBA ([D-007](DECISIONS.md#d-007-rom-de-gba-como-referência-e-fonte-inicial-de-assets)) e do disco de PS1 ([D-031](DECISIONS.md#d-031-jogo-de-ps1-como-segunda-referência-extraído-fora-do-repositório)): a ROM e tudo que sai dela **nunca vão para o git**. **As beys e os personagens de Metal Fusion não são usados no nosso jogo** (pedido do usuário); não extraímos sprites nem arte, e os nomes só aparecem aqui quando explicam uma mecânica.

## A ROM

| Campo | Valor |
| --- | --- |
| Arquivo | `5366 - Beyblade - Metal Fusion (U).nds` (dentro do `.zip` em `Downloads/`) |
| Título interno (0x00) | `BEYBLADE2LOC` |
| Código do jogo (0x0C) | `BBUY` (EUA) |
| Maker (0x10) | `18` (Hudson Soft) |
| Tamanho | 64 MiB (67.108.864 bytes; 62.461.500 usados) |
| SHA-1 | `99a3d1cd5816be3ea6b252f8eaf99a3c84bea055` |
| ARM9 | offset `0x4000`, 633.908 bytes, carga/entrada `0x02000000`/`0x02000800`; comprimido (BLZ), 1.075.832 bytes descomprimido |
| ARM7 | offset `0x13C600`, 160.048 bytes, carga `0x0237C000` |
| Overlays ARM9 | 77, todos comprimidos (BLZ) |
| NitroFS | 5.618 arquivos (incluindo os 77 overlays) em 88 pastas, 2.720 NARC |

## Como extrair

```
node scripts/extract-nds.js "<caminho>/5366 - Beyblade - Metal Fusion (U).nds"
```

Saída em **`../nds-metal-fusion/`** (ao lado do repositório; o script recusa uma pasta dentro dele):

- `arm9.bin`, `arm7.bin`: os executáveis como estão na ROM;
- `files/`: o NitroFS com os nomes originais, e os overlays em `files/overlay/overlay9_NNNN.bin`;
- `manifest.json`: cabeçalho, pastas e, por arquivo, id na FAT, caminho, offset, tamanho, SHA-1, dados do overlay (endereço na RAM, comprimido ou não) e marcas de NARC/LZ.

O parser fica em `scripts/lib/nitrofs.js` (cabeçalho, FNT/FAT, tabela de overlays, NARC, LZ10/LZ11 e BLZ dos overlays), testado com uma ROM sintética em `tests/nitrofs.test.js` (a suíte não precisa da ROM).

Scripts de análise (fora do repositório, em `../nds-metal-fusion/analysis/`): `msdt.mjs` decodifica os textos, `ovl.mjs` descomprime os overlays (`analysis/ovl/`), `arm9.mjs` descomprime o ARM9 e `strings.mjs` busca texto ASCII no código. Os textos decodificados ficam em `analysis/text/`.

## Mapa do sistema de arquivos

As pastas `_french/` e `_spanish/` repetem as de interface e texto traduzidas; a lista abaixo é a versão em inglês (raiz).

| Pasta | Arquivos | Conteúdo |
| --- | --- | --- |
| `mes/` | 54 | **Textos** (`.msdt`, formato abaixo) e métricas das fontes (`.msbs`). `mes_tutorial_text_h.msdt` tem os tutoriais da batalha |
| `fldcom/` | 142 | **Batalha**: HUD de cima/baixo (`b_battle_*`), resultados (`a_win`, `a_lose`, `a_draw`, `a_sleep`, `a_sta`, `a_crash`), placar (`b_point0..6` azul/vermelho), medidor do lançamento (`a_ShootGauge`), cortes dos especiais (`fi_*`), lançamento (`st_*`) e o minijogo de sobrevivência (`b_suvbtl_*`) |
| `bey/` | 1.716 | Modelos/texturas 3D das peças (`NN_NN.narc` + `NN_NNt.narc`) |
| `fld/` | 42 | Estádios 3D (`NN.narc` + `NN_t.narc`) |
| `eff/` | 257 | Efeitos de batalha |
| `cam/` | 2 | Câmeras do estádio (`stage_nomal.cam`, `stage_big.cam`) |
| `adv/` | 440 | Modo história (fundos, mapa) e telas dos tutoriais (`tutorial13..25_bg/obj`) |
| `menu/` | ~1.700 | Menus: seleção de bey, customização (`custom`, `parts`), Bey Force (`force`), estádio (`stage`), versus, resultado, sobrevivência, multiplayer, Wii |
| `sound/` | 1 | `sound_data.sdat` (SDAT padrão da Nintendo, 4 MB) |
| `child/` | 3 | `child.srl`: ROM enviada ao outro DS no download play |
| `dwc/` | 1 | Biblioteca do Nintendo Wi-Fi Connection |
| `font/`, `error/`, `info/`, `title_h/`, `nintendo/`, `hulogo/` | — | Fontes, telas de erro, aviso, título, logos |

Overlays com função identificada pelas strings internas:

| Overlay | Endereço | O que é |
| --- | --- | --- |
| 0 | `0x021D12C0` | Menu de **debug**: listas de especiais (`A_MOVE`, `S_WAVE`, `E_BARRIER`, `O.V.DRIVE`...), estádios (`00:NORMAL`..`08:GHOST`) e personagens |
| 2 | `0x021D12C0` | **Núcleo da batalha** (118 KB; carrega os efeitos `/eff/*.narc`) |
| 3 | `0x021EE1E0` | **Lançamento** (`shoot_count`, `shoot_hantei` = "julgamento", `sht_sps_light`) |
| 4 | `0x021EE1E0` | **Resultado e placar** (`RES:/sta.bin`, `win`, `lose`, `draw`, `sleep`, `crash`, `point_r0..6`, `point_b0..6`) |
| 17 | `0x021EE1E0` | Minijogo de **sobrevivência** (`b_suvbtl_obj`, `mini_sp`) |
| 30 | `0x021D4F40` | Ajuste do **microfone** (`/mes/mes_beymic.msdt`) |
| 37 | `0x021D4F40` | HUD com **tempo** (`time.ncel`/`time.ncgr`) |
| 76 | `0x021D12C0` | **Tutoriais** (`bey2_tuto_shoot`, `_attack`, `_jump`, `_guard`) |

### Formato dos textos (`.msdt`)

- `u16` nº de mensagens; depois um `u32` por mensagem com o offset **em unidades de u16** contado do fim da tabela (`2 + n × 4`).
- Caracteres em `u16`: `0x00` espaço, `0x10–0x19` = `0–9`, `0x21–0x3A` = `A–Z`, `0x41–0x5A` = `a–z`; pontuação em códigos baixos (`0x01` `!`, `0x02` `"`, `0x07` `'`, `0x0C` `,`, `0x0D` `-`, `0x0E` `.`, `0x1A` `:`, `0x1F` `?`, `0x96` `...`).
- Controle em `0x80xx`: `0x8001` fim de linha, `0x8005` quebra, `0x8003`/`0x8004` espera/página, `0x8007 n` cor (destaque), `0x800E a b` retrato/expressão do personagem, `0x8010 n` próxima mensagem, `0x8008` variável.

## Como a batalha funciona

Fontes: **[ROM]** = texto decodificado da própria ROM (arquivo indicado); **[web]** = pesquisa externa (links no fim). Citações curtas, em inglês como no jogo.

### Controles

A batalha é jogada **com a caneta na tela de toque**; os textos da ROM não citam nenhum botão na batalha (a palavra "button" só aparece em botões de menu na tela de toque, como "Touch the MOD button twice"). **Não achamos "X ataca a bey"** nesta versão: provavelmente é de outra versão/jogo (o de Wii usa o Wii Remote). A bey ataca sozinha; o jogador decide **para onde** ela vai e **quando** defender, pular, recuperar ou usar especial.

| Entrada no DS | Ação | Fonte |
| --- | --- | --- |
| Arrastar a corda do lançador até o canto inferior direito, ao ouvir "let it rip" | **Lançamento** | [ROM] `mes_tutorial_text_h` 2–3, 10–11 |
| Deslizar a caneta rápido numa direção | **Ataque**: a bey corre para lá "with a trail of flames"; se acertar, aparece **HIT** | [ROM] 51–52 |
| Tocar (rápido) um ponto da arena | **Pulo** até aquele ponto: desvia de ataques ou cai em cima do oponente | [ROM] 62 |
| Tocar a própria bey | **Defesa** (Guard): aparece uma barreira; ao bloquear, aparece **GUARD** | [ROM] 68, 71 |
| Segurar a caneta num ponto vazio | **Reverse**: recupera giro e equilíbrio (marca de recuperação sobre a bey). Um toque curto vira pulo | [ROM] 76–77 |
| Tocar o ícone do especial (quando o medidor SPIRIT acende) | **Especial** | [ROM] 88–89 |
| Gritar no microfone | Especiais/comandos de voz (sensibilidade ajustável em 4 níveis) | [ROM] `mes_beymic` 0, 5–10; [web] Worthplaying, TTPM |

Citações-chave [ROM, `mes/mes_tutorial_text_h.msdt`]:

- 51: "Let's say you wanna move yer Beyblade here... Just quickly slide the stylus in that direction."
- 52: "If you hit your opponent's Beyblade on the way, "HIT" shows up on screen. Combining movement and force like this is called an "attack.""
- 62: "Learnin' to jump opens up new doors, like dodging attacks, or even smackin' your opponent. You just gotta touch the area you wanna jump to"
- 68: "All you gotta do to guard is touch your own Beyblade. If a barrier appears around your Beyblade, you're good to go."
- 76–77: "the reverse'll restore your Beyblade's spin and balance. Just touch an area on the screen where nothin's at... Just make sure to hold the stylus down awhile, 'cause just a touch will make ya jump instead."

Segundo a análise da Worthplaying [web], o deslize custa um pouco de impulso ("at the cost of some momentum") e gritar no microfone para o especial falha às vezes (2 ou 3 tentativas).

### Fluxo da partida

1. **Preparação** (fora da batalha): escolher a bey (até 7 slots), montar as 5 peças (Face Bolt, Energy Ring, Fusion Wheel, Spin Track, Performance Tip), colocar **até 2 especiais** e a **Bey Force** (bônus de status que cresce com as batalhas). [ROM] `mes_beyselect`, `mes_tutorial_text_h` 21, 85, 102–107.
2. **Estádio**: 9 estádios com regras próprias (abaixo); no online, um é sorteado entre a escolha de cada jogador. [ROM] `mes_beystage` 33.
3. **Lançamento**: o lançador aparece com **contagem regressiva**; ao ouvir "let it rip", puxar a corda. O **Perfect Shot** depende de três coisas: "*speed*, *distance*, and *timing* when pulling the string" (puxar "as fast and far as you can"). Existe um medidor do lançamento (`fldcom/a_ShootGauge.narc`) e um "julgamento" (`shoot_hantei` no overlay 3). [ROM] 2–3, 8–12.
4. **Batalha**: a sua bey é a clara e a do oponente é a escura ("the bright Beyblade is yours. And the dark one's your opponent's", [ROM] 51). Tela de baixo (toque) é a arena; a de cima mostra informações (as peças de cada bey e se combinam com o tipo, [ROM] 44–45).
5. **Resultado da rodada** e placar; repete até alguém fechar a partida.

### Condições de vitória e placar

O overlay 4 carrega uma tela para cada fim de rodada [ROM, nomes de arquivo]:

| Tela | Provável significado |
| --- | --- |
| `sta` (`a_sta_bg`) | **Stadium out** (ring out): a bey saiu da arena |
| `sleep` (`a_sleep_bg`) | **Sleep out**: a bey parou de girar |
| `crash` (`a_crash_bg`) | **Crash**: bey destruída/derrubada. Um especial diz "A Beyblade attacked with this is guaranteed to crash" ([ROM] `mes_item08` 1075) |
| `draw` (`a_draw_bg`) | **Empate** |
| `win` / `lose` | Vitória / derrota |

- O placar vai de **0 a 6 pontos** por lado (`b_point0..6b` azul e `b_point0..6r` vermelho).
- **"First to four points wins the match"**, e os pontos dependem de **como** a bey adversária foi derrotada [web, Worthplaying]. Isso combina com o placar até 6: um último golpe que vale 2 ou 3 pontos pode passar de 4. O valor de cada tipo de vitória **não foi confirmado** no código (próximo passo: achar a tabela no overlay 4).
- No estádio *Dead or Alive* não há stadium out ("surrounded by walls, so there is no way to fall out of bounds", [ROM] `mes_beystage` 1).
- Há uma imagem de **tempo** no HUD (overlay 37); o limite de tempo não foi encontrado.

### Medidores

| Medidor | Como funciona | Fonte |
| --- | --- | --- |
| **Giro** (spin gauge) | Cai durante a batalha; Reverse e alguns especiais recuperam. Cheat "Player Spin Gauge Max" grava `0x3E1C` (15.900) em `0x0210250C` (u16); "Enemy Spin Gauge 0" zera `0x02102A68` → o giro é um valor de 16 bits, máximo provável ~15.900 | [web] códigos Action Replay (Almar's Guides) |
| **Equilíbrio** (balance) | Separado do giro: ataques de lado/de cima e tremores "knock off balance"; Reverse recupera "spin and balance" | [ROM] 76; `mes_item08` 1063, 1071–1073 |
| **SPIRIT** (canto inferior esquerdo) | Enche principalmente **atacando** ("by attacking like crazy"); cheio, o ícone do especial pisca. Tem **vários níveis**: especiais mais fortes gastam 2 ou mais barras | [ROM] 88–89 |
| Shoot gauge | Medidor do lançamento (Perfect Shot) | [ROM] `fldcom/a_ShootGauge.narc` |

### Especiais (tipos de efeito)

Cada bey leva até 2 especiais, em níveis/ranks; alguns só liberam depois de progredir ("Rank cannot be selected until you have achieved a rank of B", [ROM] `mes_beyfinish` 1). Os 17 especiais do jogo ([ROM] `mes_item08` 1041–1077) caem nestes tipos de efeito:

| Efeito | Exemplo de descrição |
| --- | --- |
| **Investida** com recuo | "Rush into your opponent's Beyblade to knock it back. This effect only lasts a short time." |
| **Aura de dano** por contato | "covered in plasma, sending anything it touches into electronic meltdown." |
| **Tremor** (pulo vertical que desequilibra o oponente) | "A vertical jump causes the stage to vibrate heavily, knocking your opponent's Beyblade off balance." |
| **Cura** de giro e equilíbrio (gradual ou metade de uma vez) | "causing its spin and balance to gradually recover." / "to recover by half." |
| **Escudo** (menos velocidade) | "A shield barrier forms to protect you from attacks, but this also reduces your speed." |
| **Peso** (não recua na colisão) | "extremely heavy, and you will not budge when collided into." |
| **Zona de vento** que joga o oponente para o alto | "your opponent's Beyblade is swept into the air when approaching it." |
| **Golpe por baixo/lado/de cima** | "upper attack, causing it to swirl into the air" / "Slice into ... from the side" / "Attack ... from above" |
| **Congelar** o oponente | "Chunks of ice cover your opponent's Beyblade, causing it to freeze for an easy attack target." |
| **Área** (chuva de meteoros) | "Meteors shower down from above, causing great damage to anything nearby." |
| **Finalizador** (crash garantido) | "The ultimate special move. A Beyblade attacked with this is guaranteed to crash." |
| **Overdrive** (giro no máximo) | "Your Beyblade is spun to its maximum speed, unleashing all of its power." |

### Tipos e estádios

- **Compatibilidade** (pedra-papel-tesoura), definida pela ponta: "Attack types are strong against Stamina types... Stamina types are strong against Defense types, and Defense types are strong against Attack types. Balance types are neutral" ([ROM] 36–39). Igual ao que já usamos.
- **Estádios** ([ROM] `mes_beystage` 0–9): Normal; Dead or Alive (paredes, sem stadium out); Tournament (maior, mais atrito); Gravel (muito atrito, pouco quique: bom para defesa); Ice (pouco atrito, muito quique: bom para ataque/resistência); Bombs (bomba onde a bey pula); Cocktail Typhoon (ventania no centro); Damage (paredes elétricas que dão dano); Ghosts (chefes finais); Random.

## O que aproveitar no nosso jogo

**As beys e os personagens de Metal Fusion não entram no jogo.** Aproveitamos só as ideias de combate, mapeadas para o nosso DualShock 4 (D-001):

| Mecânica do DS | No nosso jogo (DS4) | Observação |
| --- | --- | --- |
| Deslizar a caneta → investida com rastro de fogo, "HIT" ao acertar | **✕** (segurar carrega, soltar investe) + direção no analógico | Já temos. Ideia: rastro de fogo na investida e texto **HIT** no acerto; a investida custa um pouco de giro, como no DS |
| Tocar a própria bey → barreira, "GUARD" ao bloquear | **○** defender | Já temos. Ideia: barreira visível e texto **GUARD** quando bloqueia de fato |
| Tocar um ponto → pulo até lá (desviar ou cair em cima) | **L1** pular | Já temos. Ideia: o pulo cair **em cima** do oponente causa dano/desequilíbrio |
| — (o DS não tem esquiva separada; o pulo cumpre o papel) | **R1** esquivar | Mantém |
| Segurar num ponto vazio → **Reverse** (recupera giro e equilíbrio) | Candidato: **segurar ○** (ou ○ parado sem ataque chegando) | Mecânica nova; precisa de decisão. Dá uma saída defensiva ao tipo resistência |
| Medidor **SPIRIT** que enche atacando, com vários níveis; especiais de 1, 2+ barras | **L1+R1** especial da bit-beast | Ideia: medidor em barras, que enche principalmente com acertos; especiais mais fortes gastam mais barras |
| Até 2 especiais por bey, escolhidos antes | **L1+R1** (barra 1) / **✕+○** Engine Gear (barras 2+) | Encaixa nos dois comandos que já existem |
| Lançamento: contagem, "let it rip", Perfect Shot por velocidade, distância e tempo | Lançamento = timing do **✕** | Já temos o timing; ideia: mostrar a contagem e um "Perfect" quando o tempo for exato |
| Placar em pontos por tipo de vitória (primeiro a 4) | Rodadas da partida | Ideia: stadium out, sleep out e crash valendo pontos diferentes, até 4 pontos |
| Equilíbrio separado do giro | Simulação (`src/sim/`) | Ideia: golpes de lado/de cima e tremores tiram equilíbrio; com pouco equilíbrio a bey bambeia |
| Estádios com regra (paredes, gelo, cascalho, vento, paredes elétricas) | Arenas | Variações de atrito/quique/vento cabem na física atual (`BEY_BEHAVIOR.md`) |

Cada item aproveitado entra depois, com decisão própria em `DECISIONS.md`.

## Próximos passos (se precisar de números)

1. Achar no **overlay 4** a tabela de pontos por tipo de vitória e o total para vencer.
2. No **overlay 2** (núcleo, ARM, base `0x021D12C0`), ler o custo de giro da investida, a duração do Guard e o enchimento do SPIRIT (Ghidra: `ARM:LE:32:v5t`, carregar `analysis/ovl/ov02_21d12c0.bin` nesse endereço junto com `analysis/arm9.dec.bin` em `0x02000000`).
3. Conferir no emulador (melonDS/DeSmuME) o valor do giro em `0x0210250C` durante a batalha para calibrar a queda por segundo.

## Fontes externas

- Worthplaying, *NDS Review - 'Beyblade: Metal Fusion'* (2011): https://worthplaying.com/article/2011/5/2/reviews/81159-nds-review-beyblade-metal-fusion/ (controles de toque, microfone, primeiro a 4 pontos)
- TTPM, *Preview: Beyblade, The Video Game*: https://ttpm.com/preview-beyblade-the-video-game/ (toque + comandos de voz no microfone)
- Almar's Guides, códigos Action Replay (EUA): https://almarsguides.com/retro/walkthroughs/nds/games/beyblademetalfusion/actionreplay/ (endereços do medidor de giro)
- Wikipedia, *List of Beyblade: Metal Fusion video games*: https://en.wikipedia.org/wiki/List_of_Beyblade:_Metal_Fusion_video_games (lançamento: Japão em 2009 como *Metal Fight Beyblade*, EUA em 9/11/2010, Hudson)
