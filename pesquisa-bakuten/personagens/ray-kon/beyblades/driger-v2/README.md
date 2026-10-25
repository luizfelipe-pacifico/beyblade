# Driger V2 (ドライガーV2 / Doraigā Barukan Tsū — "Driger Vulcan 2")

> **Imagem faltante** (`imagem`, `anime`): CDN da wiki bloqueou o download (desafio Cloudflare com `curl -A "Mozilla/5.0"`). Referência: `File:DrigerV201.jpg` (montada) e `File:DrigerV2_Anime.PNG` (anime) em https://beyblade.fandom.com/wiki/Driger_V2

| Campo | Valor |
|---|---|
| Dono | Ray Kon |
| Código do produto | A-75 (Takara), ¥580; lançamento JP ago/2002 |
| Tipo | Balance |
| Sistema | Magnacore System |
| Rotação | Direita |
| Fera Bit (Bit-Beast) | Driger – Tigre Branco |
| Série / temporada | V-Force (2002); usada também no início de G-Revolution |
| Primeira aparição (anime) | V-Force ep 38 "The Fate of the Spark Battle" |
| Antecessora → Sucessora | Driger V → Driger G |

## 1. Peças (de cima para baixo)

| Camada | Peça | Descrição física | Função em batalha |
|---|---|---|---|
| Bit Chip | Driger (V2) | chip com Driger | identidade / fera bit |
| Attack Ring (AR) | Upper Claw (7 g) | 2 cabeças de tigre seguidas de rampas longas que descem até o nível do WD; rampas mudam de ângulo em 2 pontos | upper attack (levanta o oponente) + "upward smash"; só eficaz em rotação direita |
| Weight Disk (WD) | Ten Balance (15 g) | 10 lados, massa balanceada | estabilidade/stamina médias |
| Spin Gear (SG) / Core | Neo Right SG (Metal Weight Core) (4 g) | Neo SG com núcleo de peso metálico, não magnético | mais peso central que SG comum |
| Support Part (SP) | Upper Attack SP (4 g) | partes baixas com rampa que se alinham à rampa do AR, dobrando o comprimento da rampa | começa a rampa mais baixa que qualquer AR → entra embaixo até de beys baixas; pode raspar no chão |
| Blade Base (BB) | Customize (Metal) Change Base (7 g) | versão atualizada da Metal Change: ponta metálica um pouco mais aguda, base mais alta, aceita SP | 2 modos (reta = sobrevivência, inclinada = ataque), menos agressiva que a da Driger S |

Divergência: a página Weight Disk - Ten Wide lista Driger V2 entre seus produtos, mas a infobox da Driger V2 diz Ten Balance. Adotado Ten Balance (infobox).

Fotos das peças: **faltantes** (CDN bloqueado). Existem na galeria de https://beyblade.fandom.com/wiki/Driger_V2 : `DriV2 6.jpg` (Upper Claw), `DriV2 7.jpg` (Upper Attack SP), `DriV2_5.jpg` (vista inferior), `Driger V2.jpg` (bit chip), `Bey, 2002 Driger V2 stats & parts.png`.

## 2. Formato e geometria
- Silhueta de 2 lados (2 cabeças de tigre + 2 rampas longas), simetria rotacional de 180°.
- Peso balanceado (Ten Balance + MW core), SP baixos aumentam a massa na periferia inferior.
- Perfil: rampas muito baixas (graças ao SP) — ótima para upper; a base mais alta ajuda a não raspar, mas a bey raspa quando perde equilíbrio.

## 3. Comportamento na arena
- **Movimento**: lançada inclinada, varredura agressiva pelo estádio; reta, fica no centro com a ponta metálica. Alterna modos ao ser atingida.
- **Ataque**: upper attack — entra por baixo, levanta e o degrau entre AR e SP finaliza o KO.
- **Defesa/Stamina**: médias; ponta metálica dá sobrevivência.
- **Pontos fortes**: "vence uma grande variedade de oponentes com pouca ou nenhuma customização" (wiki). **Fracos**: SP raspam no chão em ângulos fortes; inútil em rotação esquerda.
- **Gimmick**: Upper Attack SP + Change Base de 2 modos.

## 4. No anime
- **Vulcan Power Claw** (バルカンパワークロー): Driger é invocado, a bey brilha (aura vermelha) e investe com um upper attack poderoso enquanto Driger rasga a fera inimiga. Usado só 2 vezes: V-Force ep 40 (vs Max) e ep 48 (vs Gordo, sem efeitos especiais).
- Batalhas: estreia no tag Ray+Kai vs Dunga+Joseph (ep 38, vitória); vs Max (ep 40, vitória); tag com Zeo vs Denny (ep 40); vs Sanchez (ep 47, vitória); vs Gordo/Blizzard Orthrus (ep 48, empate); G-Rev ep 2 (tag com Tyson vs Daichi/Jin, sem resultado) e G-Rev ep 3 vs Jin of the Gale (Metal Driger) — derrota, que motiva a troca para Driger G.

## 5. Tradução para o jogo

| Atributo | Valor | Justificativa |
|---|---|---|
| Ataque | 8 | upper elite com SP (o brief cita Dragoon V2 como 10) |
| Defesa | 5 | 2 lados, peso médio |
| Stamina | 6 | ponta metálica, modo central |
| Velocidade | 7 | modo inclinado agressivo |
| Peso | 6 | AR 7 g + SP + MW core |
| Equilíbrio | 6 | SP raspam quando perde equilíbrio |
| Burst/Knockout-resist | 6 | peso médio, centro baixo |

- **Movimento em IA**: alterna "centro" e "varredura" (como Driger S), mas na varredura procura contato lateral-baixo; ao acertar, aplica impulso vertical (lift) ao alvo.
- **Especiais (no jogo)**: *Vulcan Power Claw* — investida com aura; o próximo impacto aplica lift alto + knockback (chance de KO), custo 130, cooldown 25 s.
- **Física sugerida (estimativa)**: massa relativa 1.05; raio 1.0; atrito da ponta 0.45 (0.25 centro / 0.6 inclinada); restituição 0.55; bônus de "lift" no contato.

Os mesmos dados ficam em `dados.json`.

## 6. Fontes
- https://beyblade.fandom.com/wiki/Driger_V2
- https://beyblade.fandom.com/wiki/Attack_Ring_-_Upper_Claw
- https://beyblade.fandom.com/wiki/Weight_Disk_-_Ten_Wide , https://beyblade.fandom.com/wiki/Weight_Disk_-_Ten_Balance
- https://beyblade.fandom.com/wiki/Vulcan_Power_Claw
- https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_38 , _48 ; https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_02 , _03
