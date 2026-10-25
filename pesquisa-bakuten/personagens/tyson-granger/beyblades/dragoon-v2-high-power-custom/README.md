# Dragoon V2 High Power Custom (ドラグーンV2 ハイパワーカスタム / Doragūn Bikutorī Tsū Hai Pawā Kasutamu)

> **Imagens faltantes**: o CDN da wiki bloqueia com desafio anti-bot da Cloudflare, então nada foi baixado. Fontes:
> - Montada, brinquedo RC (deve virar `imagem.jpg`): https://beyblade.fandom.com/wiki/File:Beyblade-Dragoon-V2-V-Force-RC-27MHz.jpg
> - Anime (ep. 47): https://beyblade.fandom.com/wiki/File:Beyblade_V_Force_Episode_47_-English_Dub-_-Full-.1_240006.jpg · ep. 50–51: https://beyblade.fandom.com/wiki/File:Beyblade_V-Force_World_championship_Arc_Ep50-51_1168967.jpg
> - Ponta (frames do anime): https://beyblade.fandom.com/wiki/File:V2sp_lat.jpg , https://beyblade.fandom.com/wiki/File:V2sp_tip.jpg

| Campo | Valor |
|---|---|
| Dono | Tyson Granger (customização feita pelo Kenny) |
| Código do produto | RA-01 (Takara, linha **RC Beyblade**, 2004. A Hasbro lançou por engano como "Dragoon V") |
| Tipo | Attack |
| Sistema | Magnacore System (série V2). O brinquedo é a versão radiocontrolada |
| Rotação | Anime: esquerda, como toda a linha Dragoon pós-S1 (inferência). Brinquedo RC: **direita**, segundo o infobox. Ver inconsistências |
| Fera Bit (Bit-Beast) | Dragoon (dragão azul, vento) |
| Série / temporada | V-Force (2002) |
| Primeira aparição (anime) | V-Force ep. 47 "Deceit From Above" |
| Antecessora → Sucessora | Dragoon V2 → Dragoon G |

Outros nomes: "Dragoon Ultimate Customize" (anime JP, dito pelo Kenny) e "Dragoon Tune Up" (dublagem EN).

## 1. Peças (de cima para baixo)

| Camada | Peça | Descrição física | Função em batalha |
|---|---|---|---|
| Bit Chip | Dragoon (versão V) | Chip do Dragoon | fera bit |
| Attack Ring (AR) | Spike Dragon (4,8 g) | Igual ao da V2: 4 cabeças com faces planas e ranhuras | Smash esquerdo devastador, com recoil severo |
| Weight Disk (WD) | Não informado para a versão RC (**não confirmado**). No anime presume-se Magne WD, herdado da V2 | — | — |
| Spin Gear (SG) / Core | Não informado (**não confirmado**) | — | — |
| Support Part / Sub Ring | Reverse Attack (0,9 g cada) | Igual ao da V2 | contatos extras |
| Blade Base (BB) | RC Flat Base (37,7 g) | Base **larga e pesada** de rotação direita, com ponta **semi-flat** (amarela no anime e na Takara, branca na Hasbro). Feita para ser radiocontrolada com o lançador próprio | No brinquedo, permite controle remoto da direção. O peso muito maior muda tudo: mais inércia e menos aceleração |

## 2. Formato e geometria
- Vista de cima: a mesma silhueta de 4 cabeças da V2. A RC Flat Base é mais larga, então o raio total aumenta.
- Muito mais pesada (só a base pesa 37,7 g), com o peso concentrado embaixo: mais estável e mais difícil de jogar para fora.
- Perfil alto e largo.

## 3. Comportamento na arena
- **Anime**: na prática é uma V2 "afinada" pelo Kenny para o Mundial. Ataca com mais potência e resiste melhor (aguenta os raios da Dra. K no ep. 47 e vence a Burning Kerberous do Zeo).
- **Brinquedo**: semi-flat, pesada, com direção controlável por RC (gimmick de brinquedo, sem equivalente no anime).
- **Ataque**: máximo (Spike Dragon com mais massa).
- **Defesa/Stamina**: um pouco melhores que as da V2 por causa da massa (estimativa).
- **Matchups**: vence King (Uriel), Max (Draciel V2, ep. 49), Gordo (Orthros, ep. 50) e Zeo (Burning Kerberous, ep. 51). Contra o Kai no ep. 49, sem resultado.

## 4. No anime
- **Ep. 47**: o Kenny ajusta a V2 no "custom definitivo" (não é uma bey nova, e sim a melhor versão dela). Contra o King, a Dra. K tenta desativar o Dragoon com um feixe de partículas do teto, sem sucesso.
- **Ep. 49–51**: Mundial. Vitórias sobre o Max, o Gordo e, na final, o Zeo e a Burning Kerberous, que dão o bicampeonato.
- **Especiais**: o anime não lista um golpe próprio para a versão HPC. Presume-se o **Hyper Victory Tornado** herdado (**não confirmado** pelas fontes como nome usado nesses episódios).

## 5. Tradução para o jogo

| Atributo | Valor | Justificativa |
|---|---|---|
| Ataque | 10 | Spike Dragon + ajuste final do Kenny |
| Defesa | 5 | Mais massa que a V2 |
| Stamina | 4 | Semi-flat no brinquedo. No anime, borracha herdada (incerto) |
| Velocidade | 8 | Mais pesada, acelera menos que a V2 |
| Peso | 8 | Base de 37,7 g: a mais pesada do Tyson na era plástica |
| Equilíbrio | 6 | Peso baixo e largo |
| Burst/Knockout-resist | 6 | Mais massa |

- **Movimento em IA**: `orbita` agressiva, mais "pesada" e menos errática que a V2 (menos auto-KO).
- **Especiais (no jogo)**:
  - **Hyper Victory Tornado (Custom)**: igual ao da V2, com +15% de dano e duração de 2,5 s. Custo 100, cooldown 22 s.
  - **Tune Up** (passiva, nome da dublagem EN): o recoil que a bey sofre cai 30% em relação à V2.
- **Física sugerida**: massa 1,3 · raio 1,1 · atrito da ponta 0,55 (semi-flat) · restituição 0,7.

Os mesmos dados ficam em `dados.json`.

### Inconsistências nas fontes
- A página da Dragoon V2 diz que a **V2** foi usada até a final contra o Zeo. A página da HPC e a do ep. 47 dizem que ela foi ajustada para **HPC** no ep. 47. As páginas dos ep. 51 listam apenas "Dragoon V2". Aqui adotamos HPC do ep. 47 ao 51.
- O infobox do brinquedo diz "Right-Spin", mas a página do Tyson afirma que todas as Dragoons dele (menos a Grip Attacker) são de rotação esquerda. A rotação direita vale para o brinquedo RC. No anime, provavelmente esquerda.
- A Spike Dragon é descrita como lançada em "dezembro de 2001" na página da peça, mas a Dragoon V2 saiu em julho de 2002 (dezembro de 2001 é a data da Dragoon V).

## 6. Fontes
- https://beyblade.fandom.com/wiki/Dragoon_V2_High_Power_Custom
- https://beyblade.fandom.com/wiki/Dragoon_V2
- https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_47
- https://beyblade.fandom.com/wiki/Beyblade:_V-Force_-_Episode_51
- https://beyblade.fandom.com/wiki/Tyson_Granger (tabela de batalhas)
