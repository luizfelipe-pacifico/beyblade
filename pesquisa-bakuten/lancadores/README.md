# Lançadores (shooters / launchers)

Catálogo dos lançadores usados pelos 10 personagens no anime **Bakuten Shoot Beyblade** (S1, V-Force, G-Revolution) e dos modelos de brinquedo Takara/Hasbro da época ([D-010](../../docs/DECISIONS.md#d-010-lançadores-fazem-parte-do-catálogo)). Cada pasta tem `dados.json` (schema da "Ficha do lançador" em [`docs/BEYBLADES.md`](../../docs/BEYBLADES.md)) e `README.md`. O `lancador.svg` será gerado por `scripts/render-art.js` a partir de `forma`.

- [`ripcords/`](ripcords/): catálogo de ripcords (D-021), ver a seção [Ripcords](#ripcords).
- [`_mapa.json`](_mapa.json): `"<personagem>/<bey>": "lancadores/<slug>"` para as 46 beys do [INDICE](../INDICE.md) (o lançador **principal** daquela bey no anime) e, na chave `personagens`, todos os lançadores que cada personagem usa.
- Campos além do exemplo do schema: `codigo_produto` (como na ficha de bey), `anime`, `referencias`, `duvidas`, `atributos.justificativa`/`atributos.fonte`, e parâmetros extras em `mecanica_jogo` e `forma` (todos opcionais para quem consome).

## Nomes

No Japão o lançador se chama **shooter** (シューター) e a corda dentada **winder** (ワインダー). A Hasbro usou "launcher" e "ripcord". A frase de lançamento é "Go Shoot!" (ゴーシュート) no original e "3, 2, 1... Let it rip!" na dublagem em inglês.

## Catálogo

| Lançador | Tipo | Rotação | Sistema | Anime | Força | rpm máx. | Precisão | Ângulo | Facilidade | Usado por |
|---|---|---|---|---|---|---|---|---|---|---|
| [EZ Shooter (Easy Shooter, rotação direita)](ez-shooter/) | ripcord | direita | spin-gear | sim | 6 | 6550 | 5 | 5 | 8 | Tyson, Ray, Kai, Lee, Tala, Bryan, Daichi, Brooklyn |
| [Left EZ Shooter (lançador esquerdo original, "Dragoon")](left-ez-shooter/) | ripcord | esquerda | spin-gear | sim | 6 | 6550 | 5 | 5 | 7 | Tyson |
| [Neo Reverse Shooter (Neo Left EZ Shooter)](neo-reverse-shooter/) | ripcord | esquerda | magnacore | sim | 7 | 6850 | 5 | 5 | 7 | Tyson |
| [EZ Shooter Grip (Easy Shooter Grip)](ez-shooter-grip/) | ripcord | direita | spin-gear | sim | 6 | 6650 | 7 | 7 | 9 | Max, Tyson |
| [Catapult Grip](catapult-grip/) | power | esquerda | spin-gear | sim | 8 | 6650 | 5 | 6 | 6 | Tyson |
| [Marksmen Grip (Sniper Grip)](marksmen-grip/) | ripcord | direita | spin-gear | sim | 6 | 6650 | 9 | 8 | 7 | Max |
| [Spring Shooter](spring-shooter/) | ripcord | direita | spin-gear | sim | 7 | 6800 | 6 | 6 | 8 | Kai |
| [Dragoon Shooter DX](dragoon-shooter-dx/) | ripcord | esquerda | spin-gear | sim | 7 | 6750 | 7 | 7 | 6 | Tyson |
| [Driger Shooter DX](driger-shooter-dx/) | ripcord | direita | spin-gear | sim | 7 | 6750 | 7 | 7 | 6 | Ray |
| [Dranzer Shooter DX](dranzer-shooter-dx/) | ripcord | direita | spin-gear | sim | 7 | 6750 | 7 | 7 | 6 | Kai |
| [Bey Ultimate Shooter (BeyUltimate Shooter)](bey-ultimate-shooter/) | ripcord | direita | magnacore | sim | 8 | 7000 | 7 | 6 | 7 | Ray |
| [Customize Grip (Off-White) - versão Tyson](customize-grip-tyson/) | ripcord | esquerda | engine-gear | sim | 7 | 6950 | 8 | 8 | 8 | Tyson |
| [Customize Grip (Gun Metallic / preto) - versão Kai](customize-grip-kai/) | ripcord | direita | engine-gear | sim | 7 | 6750 | 8 | 8 | 8 | Kai |
| [Customize Grip (Sky Blue) - versão Ray](customize-grip-ray/) | ripcord | direita | engine-gear | sim | 7 | 6750 | 8 | 8 | 8 | Ray |
| [Customize Grip (Dark Green) - versão Max](customize-grip-max/) | ripcord | direita | engine-gear | sim | 7 | 6750 | 8 | 8 | 8 | Max |
| [Turbo Winder (corda de Engine Gear)](turbo-winder/) | engine-gear | dupla | engine-gear | sim | 1 | — | 1 | 1 | 7 | Tyson, Kai, Ray, Max, Daichi, Tala, Bryan, Brooklyn, Lee |
| [Dual Shooter (HMS)](dual-shooter/) | ripcord | dupla | hms | sim | 8 | 7400 | 6 | 6 | 8 | Tyson, Kai, Max, Daichi |
| [HMS Customize Grip (Ray: Dual Shooter preto + G-Winder azul)](hms-customize-grip/) | ripcord | dupla | hms | sim | 8 | 7600 | 8 | 8 | 8 | Ray |
| [Mangual-lançador do Robert (anime)](griffolyon-flail/) | ripcord | direita | spin-gear | sim | 9 | 7200 | 5 | 7 | 4 | Robert |
| [RC Shooter (lançador-controle das RC Beyblades)](rc-shooter/) | power | direita | magnacore | não | 6 | 6400 | 7 | 6 | 5 | — |
| [EZ Shooter Power Custom](ez-shooter-power-custom/) | ripcord | direita | engine-gear | não | 8 | 7270 | 5 | 5 | 7 | — |
| [EZ Shooter Spring Custom](ez-shooter-spring-custom/) | ripcord | direita | magnacore | não | 6 | 6550 | 7 | 6 | 9 | — |
| [String Shooter (HMS Dual Shooter String Version)](string-shooter/) | string | dupla | hms | não | 7 | 7000 | 6 | 5 | 3 | — |
| [Bey Double Shooter](bey-double-shooter/) | ripcord | direita | hms | não | 4 | 4800 | 4 | 4 | 6 | — |
| [Duotron Launcher (Hasbro)](duotron-launcher/) | ripcord | direita | magnacore | não | 4 | 5000 | 3 | 4 | 6 | — |

Todos os atributos são **estimados** na escala 1–10. O EZ Shooter é a referência (rpm 6550, multiplicadores = 1). O Turbo Winder não lança: só dá corda no Engine Gear, então fica no mínimo da escala e sem rpm.

**Só no brinquedo** (nenhum dos 10 usa no anime; servem para loja/desafios): `ez-shooter-power-custom`, `ez-shooter-spring-custom`, `string-shooter`, `bey-double-shooter`, `duotron-launcher`, `rc-shooter`.

## Linha do tempo por personagem

| Personagem | S1 | V-Force | G-Revolution |
|---|---|---|---|
| Tyson | Lançador comum (Grip Attacker, ep. 1) → Left EZ Shooter (Dragoon S) → EZ Shooter Grip → **Catapult Grip** (ep. 8) → **Dragoon Shooter DX** (ep. 17, Dragoon S/F) | Neo Reverse Shooter (inferido do brinquedo Dragoon V) | **Customize Grip branco** (Dragoon G/GT) + Turbo Winder → **Dual Shooter** (Dragoon MS, ep. 39) |
| Kai | EZ Shooter (inferido) → **Spring Shooter** (ep. 14) → **Dranzer Shooter DX** (ep. 33, Dranzer F/Black Dranzer) | Customize Grip Gun Metallic (inferido: A-60 "Kai Version") | **Customize Grip preto/Gun Metallic** + Turbo Winder → Dual Shooter (inferido) |
| Ray | **EZ Shooter preto** (Driger S) → **Driger Shooter DX** (ep. 21) | Driger Shooter DX até o ep. 12 → **BeyUltimate Shooter azul** + Ultimate Winder verde | **Customize Grip Sky Blue** (EZ branco + Metal Trigger) → **HMS Customize Grip azul** + Dual Shooter preto (BEGA) |
| Max | **EZ Shooter Grip** (ep. 3) → **Marksmen Grip** (ep. 14) | Marksmen Grip (inferido) | **Customize Grip verde** + Turbo Winder → Dual Shooter (inferido) |
| Daichi | — | — | não confirmado (ficha padrão EZ Shooter) → Dual Shooter (inferido) |
| Tala, Bryan | não confirmado (ficha padrão) | — | não confirmado + Turbo Winder |
| Brooklyn | — | — | não confirmado: há uma imagem "Brooklyn's Launcher" na galeria da wiki, sem descrição em texto |
| Lee | não confirmado (ficha padrão) | — | não confirmado (+ Turbo Winder na Galeon 2 EG) |
| Robert | **Mangual** (wiki: "his launcher, and weapon, is a flail") | — | — |

## Mapa bey → lançador

O lançador principal de cada bey no anime (o mesmo de [`_mapa.json`](_mapa.json)). Confiança: **confirmado** = citado na wiki (personagem/episódio/produto do personagem); **inferido** = deduzido do brinquedo ou da sequência de episódios; **não confirmado (padrão)** = nenhuma fonte, ficha padrão.

| Bey | Lançador | Confiança |
|---|---|---|
| tyson-granger/dragoon-grip-attacker | [ez-shooter](ez-shooter/) | confirmado |
| tyson-granger/dragoon-s | [left-ez-shooter](left-ez-shooter/) | confirmado |
| tyson-granger/dragoon-f | [dragoon-shooter-dx](dragoon-shooter-dx/) | confirmado |
| tyson-granger/dranzer-f | [ez-shooter](ez-shooter/) | inferido |
| tyson-granger/master-dragoon | [ez-shooter](ez-shooter/) | inferido |
| tyson-granger/dragoon-v | [neo-reverse-shooter](neo-reverse-shooter/) | inferido |
| tyson-granger/dragoon-v2 | [neo-reverse-shooter](neo-reverse-shooter/) | inferido |
| tyson-granger/dragoon-v2-high-power-custom | [neo-reverse-shooter](neo-reverse-shooter/) | inferido |
| tyson-granger/dragoon-g | [customize-grip-tyson](customize-grip-tyson/) | confirmado |
| tyson-granger/dragoon-gt | [customize-grip-tyson](customize-grip-tyson/) | confirmado |
| tyson-granger/dragoon-ms | [dual-shooter](dual-shooter/) | confirmado |
| tyson-granger/dragoon-ms-ultimate-version | [dual-shooter](dual-shooter/) | confirmado |
| kai-hiwatari/dranzer-s | [spring-shooter](spring-shooter/) | confirmado |
| kai-hiwatari/dranzer-f | [dranzer-shooter-dx](dranzer-shooter-dx/) | confirmado |
| kai-hiwatari/black-dranzer | [dranzer-shooter-dx](dranzer-shooter-dx/) | inferido |
| kai-hiwatari/dranzer-v | [customize-grip-kai](customize-grip-kai/) | inferido |
| kai-hiwatari/dranzer-v2 | [customize-grip-kai](customize-grip-kai/) | inferido |
| kai-hiwatari/dranzer-g | [customize-grip-kai](customize-grip-kai/) | confirmado |
| kai-hiwatari/dranzer-gt | [customize-grip-kai](customize-grip-kai/) | confirmado |
| kai-hiwatari/dranzer-ms | [dual-shooter](dual-shooter/) | inferido |
| ray-kon/driger-s | [ez-shooter](ez-shooter/) | confirmado |
| ray-kon/driger-f | [driger-shooter-dx](driger-shooter-dx/) | confirmado |
| ray-kon/driger-v | [driger-shooter-dx](driger-shooter-dx/) | confirmado |
| ray-kon/driger-v2 | [bey-ultimate-shooter](bey-ultimate-shooter/) | confirmado |
| ray-kon/driger-g | [customize-grip-ray](customize-grip-ray/) | confirmado |
| ray-kon/driger-ms | [hms-customize-grip](hms-customize-grip/) | confirmado |
| max-tate/draciel-metal-ball-defenser | [ez-shooter-grip](ez-shooter-grip/) | confirmado |
| max-tate/draciel-s | [marksmen-grip](marksmen-grip/) | confirmado |
| max-tate/draciel-f | [marksmen-grip](marksmen-grip/) | inferido |
| max-tate/draciel-v | [marksmen-grip](marksmen-grip/) | inferido |
| max-tate/draciel-v2 | [marksmen-grip](marksmen-grip/) | inferido |
| max-tate/draciel-g | [customize-grip-max](customize-grip-max/) | confirmado |
| max-tate/draciel-ms | [dual-shooter](dual-shooter/) | inferido |
| daichi-sumeragi/gaia-dragoon | [ez-shooter](ez-shooter/) | não confirmado (padrão) |
| daichi-sumeragi/gaia-dragoon-v | [ez-shooter](ez-shooter/) | não confirmado (padrão) |
| daichi-sumeragi/gaia-dragoon-g | [ez-shooter](ez-shooter/) | não confirmado (padrão) |
| daichi-sumeragi/gaia-dragoon-ms | [dual-shooter](dual-shooter/) | inferido |
| tala/wolborg-2 | [ez-shooter](ez-shooter/) | não confirmado (padrão) |
| tala/wolborg-4 | [ez-shooter](ez-shooter/) | não confirmado (padrão) |
| bryan-kuznetsov/falborg | [ez-shooter](ez-shooter/) | não confirmado (padrão) |
| bryan-kuznetsov/falborg-2 | [ez-shooter](ez-shooter/) | não confirmado (padrão) |
| brooklyn-masefield/zeus | [ez-shooter](ez-shooter/) | não confirmado (padrão) |
| lee/galeon | [ez-shooter](ez-shooter/) | não confirmado (padrão) |
| lee/galeon-2 | [ez-shooter](ez-shooter/) | não confirmado (padrão) |
| lee/galeon-2-eg | [ez-shooter](ez-shooter/) | não confirmado (padrão) |
| robert-jurgen/griffolyon | [griffolyon-flail](griffolyon-flail/) | confirmado |

## Ripcords

A corda dentada é uma peça própria ([D-021](../../docs/DECISIONS.md#d-021-ripcords-catalogados-junto-com-os-lançadores)). As fichas ficam em [`ripcords/`](ripcords/). Cada lançador tem `ripcord_de_fabrica` e `ripcords_compativeis` no `dados.json`, e `_mapa.json` tem a chave `ripcords` (`"<personagem>/<bey>": "lancadores/ripcords/<slug>"`).

| Ripcord | Tipo | Sentido | Dentes | Mult. rpm | Desgaste/batalha | Spin | Facil. | Durab. |
|---|---|---|---|---|---|---|---|---|
| [Winder padrão (Beyblade Winder)](ripcords/winder-padrao/) | winder | direita | 45 | 1 | 2 | 5 | 8 | 5 |
| [Ripcord Hasbro (era plástica)](ripcords/winder-hasbro/) | ripcord | direita | 45 | 1 | 2 | 5 | 8 | 5 |
| [Dragon Winder](ripcords/dragon-winder/) | winder | esquerda | 68 | 1.05 | 2 | 7 | 8 | 6 |
| [Neo-Dragon Winder](ripcords/neo-dragon-winder/) | winder | esquerda | 68 | 1.06 | 2 | 7 | 9 | 6 |
| [Ultimate Winder](ripcords/ultimate-winder/) | winder | direita | 72 | 1.07 | 2 | 8 | 7 | 6 |
| [Ripcord alongado do Tyson (anime)](ripcords/ripcord-alongado-tyson/) | ripcord | direita | 90 | 1.1 | 10 | 8 | 3 | 2 |
| [Turbo Winder (corda de Engine Gear)](ripcords/turbo-winder/) | winder | dupla | 34 | 0 | 1 | 1 | 7 | 7 |
| [G-Winder (HMS)](ripcords/g-winder/) | winder | dupla | 68 | 1.05 | 1 | 7 | 8 | 9 |
| [Barbante do String Shooter](ripcords/corda-string-shooter/) | string | dupla | 0 | 1 | 1 | 7 | 2 | 6 |
| [Competition ripcord (GBA, id 1)](ripcords/gba-competition-ripcord/) | ripcord | dupla | — | 1.08 | 1 | 8 | 7 | 10 |
| [Super long ripcord (GBA, id 2)](ripcords/gba-super-long-ripcord/) | ripcord | dupla | — | 1.06 | 2 | 7 | 7 | 8 |
| [Extended ripcord (GBA, id 3)](ripcords/gba-extended-ripcord/) | ripcord | dupla | — | 1.03 | 3 | 6 | 7 | 6 |
| [Plastic ripcord (GBA, id 4)](ripcords/gba-plastic-ripcord/) | ripcord | dupla | — | 1 | 4 | 5 | 7 | 3 |

O que dá para afirmar:

- **Anime:** todos os 10 personagens puxam **ripcord/winder dentado**; nenhuma fonte mostra alguém usando barbante (o String Shooter é só brinquedo). Confirmados: o **ripcord alongado** do Tyson (S1 ep. 1), o winder **preto** do Ray (EZ Shooter, Driger Shooter, Customize Grip), o **Ultimate Winder verde** (V-Force ep. 12+) e o **G-Winder azul** do Ray na BEGA. Os demais são inferidos do brinquedo (Dragon Winder nas Dragoon, G-Winder no HMS) ou padrão.
- **Brinquedo:** winder padrão (o mais curto, com anel), Dragon Winder (68 dentes, pegador de dragão), Neo-Dragon Winder (pegador vertical, nas Dragoon posteriores e nas RC), G-Winder (único do HMS, mais grosso), Turbo Winder (corda do Engine Gear), Ultimate Winder (V-Force), barbante do String Shooter e o ripcord Hasbro (45 dentes, segundo a wiki). O A-118 "Spring Winder & EZ Shooter" e os A-73/74 "Winder Grip" existem na lista da Takara, mas sem descrição, e não foram catalogados.
- **GBA:** a ROM tem 4 ripcords (ids 1 Competition a 4 Plastic). Eles não somam stats; a durabilidade (máx. 100) cai id + strength por batalha (ver [`docs/REVERSE_ENGINEERING.md`](../../docs/REVERSE_ENGINEERING.md), "Lançadores e cordas"). Fichas `gba-*`.

## Como funciona um lançamento

### Força (rotação)

Nos lançadores de ripcord, o winder é uma **cremalheira** que gira um **pinhão** ligado aos prongs que seguram a bey. A rotação final depende de três coisas:

1. **Velocidade da mão no fim da puxada** (o principal). A mão acelera durante todo o curso; winder mais longo (Dragon Winder, 68 dentes) dá mais tempo para acelerar.
2. **Raio do pinhão**: rpm ≈ v / (2π·r) × 60. Pinhão menor = mais rpm com a mesma mão. O EZ Shooter Power Custom troca 10 por 9 dentes e ganha ~11% (wiki).
3. **Perdas**: atrito da corda na fenda (puxada torta, winder empenado), engrenagens extras (Left EZ original) e eletrônica (DX, RC).

Grips e molas (Spring Shooter, Spring Support, Spring Trigger) quase não mudam o rpm. O que eles fazem é deixar a puxada **reta e consistente**, de modo que a força chega mais perto do máximo do lançador.

### Ângulo

A bey sai com a inclinação que o lançador tinha. Lançar reto (0°) põe a ponta no chão sem quicar: bom para defesa e stamina (Max, Tala). Inclinar (10–30°) faz a bey "andar" e entrar em órbita ou investida (Ray, Bryan). Inclinações exageradas ou lançar de cima/para cima viram truques do anime: o "lançador virado para cima" do Tyson e a queda em investida do Robert. O grip é o que segura o ângulo: sem ele, a mão que puxa entorta o lançador.

### Sentido

Cada Spin Gear só aceita um sentido: abas para lançador direito ou esquerdo. Plásticos de rotação esquerda (linha Dragoon do Tyson) precisam de lançador esquerdo. Bey e lançador de sentidos opostos não se encaixam/giram, e o jogo deve impedir a combinação. No HMS, o Dual Shooter tem duas fendas e o mesmo lançador lança para os dois lados (beys MS "ambas" no índice). O String Shooter esconde o sentido do adversário.

## Mini-game de lançamento (DualShock 4)

Proposta para a etapa de lançamento do fluxo de D-005. A fase dura a contagem "3, 2, 1... Let it rip!".

| Controle | Ação | Leitura |
|---|---|---|
| **R2 (gatilho analógico, 0–255)** | Puxar o winder. O curso do gatilho é o curso da corda. | Posição → quanto da corda saiu; **velocidade** (derivada) → velocidade da mão; o pico de velocidade nos últimos 25% do curso vira a força. |
| **Analógico esquerdo** | Inclinar e mirar o lançador. | Eixo Y = inclinação (frente/trás, até `inclinacao_max_graus`); eixo X = direção no estádio. |
| **Analógico direito** | Ajuste fino da mira (opcional); no String Shooter, girar para enrolar o barbante. | — |
| **L1 / R1** | Escolher o sentido (só lançadores `rotacao: dupla` com `rotacao_selecionavel`). | — |
| **L2** | Beys Engine Gear: dar corda no Engine Gear antes da contagem (Turbo Winder). | Ciclos completos de L2 = carga da mola. |
| Giroscópio (opcional) | Inclinar o próprio controle em vez do analógico. | — |
| Vibração / light bar | Tensão da corda e tranco no fim (`recuo`). | Light bar na cor do lançador (`forma.cores.primaria`). |

**Cálculo sugerido** (os números vêm de `dados.json`):

```
t_ok      = |t_fim_puxada - t_rip| <= janela_perfeita_ms / 2          // acertou o "rip!"
v_norm    = clamp(pico_velocidade_R2 / velocidade_ref(tempo_ref), 0, 1.15)   // tempo_ref: ver ripcord abaixo
forca     = v_norm * (t_ok ? 1.0 : 0.85) * forca_maxima_lancador
mult_rip  = ripcord.mecanica_jogo.multiplicador_rpm / ripcord_de_fabrica.mecanica_jogo.multiplicador_rpm
rpm_lanc  = lancador.atributos.rpm_max * mult_rip * forca * fator_bey  // fator_bey: peso/inércia da bey (BEYBLADES.md)
tempo_ref = ripcord.mecanica_jogo.curso_puxada_mm / 0.85               // ms: ripcord mais longo pede puxada mais longa
durab    -= ripcord.mecanica_jogo.desgaste_por_batalha (+ strength nos gba-*); em 0 o ripcord quebra
angulo    = angulo_analogico + aleatorio(±desvio_angular_graus * (1 - assistencia_mira))
sentido   = lancador.rotacao == "dupla" ? escolha_L1_R1 : lancador.rotacao   // tem que bater com o Spin Gear
```

- A força vem do lançador; o comprimento e os dentes do ripcord definem quanto spin a puxada entrega (D-021). Os `rpm_max` dos lançadores foram estimados com o ripcord de fábrica, daí a razão `mult_rip`. O `tempo_puxada_ideal_ms` do lançador vale para o ripcord de fábrica.
- Soltar o R2 antes do fim do curso = puxada incompleta (força proporcional ao curso, sem bônus de janela).
- Puxar com o analógico mexendo muito (tremor) aumenta o desvio: é o efeito "puxada torta". Grips reduzem isso por meio de `assistencia_mira`.
- `precisao` e `controle_angulo` (1–10) podem escalar a sensibilidade do analógico e o tremor da mira; `facilidade` escala a largura da janela na dificuldade fácil.
- Extras por lançador ficam em `mecanica_jogo` (`velocidade_linear_bonus`, `mostra_ponto_de_queda`, `lanca_duas`, `sentido_oculto`, `controle_pos_lancamento`, `lancamento_aereo`, `carga_eg`) e são explicados no README de cada um.
- As técnicas de cada personagem (corrida do Tyson, lançamento aéreo do Robert, mira no centro do Max etc.) estão nos READMEs dos lançadores, na seção "Técnica de lançamento dos personagens".

## Modelos de brinquedo da era (resumo)

| Família | Códigos Takara | Notas |
|---|---|---|
| EZ Shooter / Easy Shooter (direito) | BeyShooter, EZ Shooter, A-22 | Padrão das Starters; Hasbro equivalente |
| Lançadores esquerdos | Left EZ (Dragoon S/F), Neo Reverse Shooter (Dragoon V vermelho, Dragoon G azul) | Dragon Winder / Neo-Dragon Winder |
| Variantes de EZ | A-4 Spring Shooter, A-83 Spring Custom, A-118 Spring Winder & EZ Shooter, A-119 Power Custom | |
| Grips | Easy Shooter Grip (+ Clear), Catapult Grip, Bey Grip Shooter, A-15 Sniper/Marksmen Grip, A-43/60/90/91/97/105 Customize Grip, A-73/74 Winder Grip, A-102 Trigger Grip | Peças: A-57/58/92 Rubber Grip, A-59/A-101 Spring Support, A-65/96 Metal Trigger, A-79 Metal Grip, A-68/106 Sniper Scope, A-86 Sniper Compass, A-113 Roller Support |
| Lançadores de fera (eletrônicos) | A-19 Dragoon, A-20 Driger, A-29 Dranzer Shooter DX; A-21 DX Shooter Code | Minijogos com winder e Bit Chips |
| V-Force | A-55/62/76 Bey Ultimate Shooter, A-72 Bey Max Shooter; Hasbro Duotron Launcher | Bey Max Shooter e Winder Grip: sem descrição nas fontes, não catalogados |
| Engine Gear | Turbo Winder em toda bey EG; A-103 Engine Gear Try Set | Zeus Starter Key (A-129) |
| HMS | Dual Shooter (Starters), MA-06 Light Blue, A-132 HMS Customize Grip, A-133 Rubber Grip, MA-05 Spring Trigger, MA-07 G-Winder, A-134 String Shooter, A-130/MA-02 Bey Double Shooter, MA-13 Winder Holder | Running Shooter (Round Shell MS) fora do escopo |
| RC | RC Shooter (Remote Control Beyblades; Hasbro RA-01) | Maior grip da era |

## Fotos

Só existe uma foto local de acessório de lançamento no repositório: a Zeus com a **Zeus Starter Key**, copiada (junto com o verso da caixa) para [`turbo-winder/referencia/`](turbo-winder/referencia/). As outras fotos da wiki estão atrás do CDN bloqueado e não foram baixadas (regra do brief).

## Pendências e incertezas

- Tala, Bryan, Lee, Daichi e Brooklyn: nenhuma fonte textual descreve o lançador deles; o mapa aponta para o EZ Shooter como padrão (confiança "não confirmado"). Capturas do anime ou da ROM do GBA (D-007) podem resolver.
- V-Force do Tyson e do Kai: lançador inferido do brinquedo/produto com o nome do personagem.
- Sentido de rotação do Dragoon Shooter DX (esquerdo) e do Duotron (direito) inferidos.
- Medidas, pesos, rpm e cores são estimativas coerentes entre si, com a justificativa em cada `dados.json`; nenhuma ficha técnica oficial foi encontrada (worldbeyblade.org não retornou dados de lançadores).

## Fontes principais

- Beyblade Wiki: [Launcher](https://beyblade.fandom.com/wiki/Launcher), [Ripcord Launcher](https://beyblade.fandom.com/wiki/Ripcord_Launcher), [Left-Spin Shooters](https://beyblade.fandom.com/wiki/Left-Spin_Shooters), [Ripcord](https://beyblade.fandom.com/wiki/Ripcord), [Grip](https://beyblade.fandom.com/wiki/Grip), [Launcher Grip](https://beyblade.fandom.com/wiki/Launcher_Grip), [Customize Grip](https://beyblade.fandom.com/wiki/Customize_Grip), [Marksmen Grip](https://beyblade.fandom.com/wiki/Marksmen_Grip), [Dual Shooter](https://beyblade.fandom.com/wiki/Dual_Shooter), [String Shooter](https://beyblade.fandom.com/wiki/String_Shooter), [Bey Double Shooter](https://beyblade.fandom.com/wiki/Bey_Double_Shooter), [Turbo Winders](https://beyblade.fandom.com/wiki/Turbo_Winders), [List of Original Series products (Takara)](https://beyblade.fandom.com/wiki/List_of_Original_Series_products_(Takara))
- Personagens: [Tyson Granger](https://beyblade.fandom.com/wiki/Tyson_Granger), [Ray Kon](https://beyblade.fandom.com/wiki/Ray_Kon), [Robert Jürgens](https://beyblade.fandom.com/wiki/Robert_J%C3%BCrgens), [Brooklyn](https://beyblade.fandom.com/wiki/Brooklyn)
- Episódios: S1 [01](https://beyblade.fandom.com/wiki/Beyblade_-_Episode_01), [03](https://beyblade.fandom.com/wiki/Beyblade_-_Episode_03), [04](https://beyblade.fandom.com/wiki/Beyblade_-_Episode_04), [08](https://beyblade.fandom.com/wiki/Beyblade_-_Episode_08), [14](https://beyblade.fandom.com/wiki/Beyblade_-_Episode_14), [17](https://beyblade.fandom.com/wiki/Beyblade_-_Episode_17), [21](https://beyblade.fandom.com/wiki/Beyblade_-_Episode_21), [33](https://beyblade.fandom.com/wiki/Beyblade_-_Episode_33); G-Rev [38](https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_38), [39](https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_39)
