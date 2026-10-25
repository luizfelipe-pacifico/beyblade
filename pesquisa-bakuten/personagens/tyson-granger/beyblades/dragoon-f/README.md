# Dragoon F – Dragoon Fantom (ドラグーン ファントム / Doragūn Fantomu)

> **Imagens faltantes**: o CDN da wiki bloqueia com desafio anti-bot da Cloudflare, então nada foi baixado. Fontes:
> - Montada (deve virar `imagem.jpg`): https://beyblade.fandom.com/wiki/File:Dragoon_Fantom.jpg
> - Anime: https://beyblade.fandom.com/wiki/File:Dragoon.bey.jpg
> - Peças: AR https://beyblade.fandom.com/wiki/File:Dragoon_Fantom_Fighter_attack_ring.gif · BB https://beyblade.fandom.com/wiki/File:Dragoon_F%27s_Phantom_base.gif · peças e stats (Hasbro) https://beyblade.fandom.com/wiki/File:Bey,_2002_Dragoon_F_stats_%26_parts.png

| Campo | Valor |
|---|---|
| Dono | Tyson Granger (montada pelo Kenny) |
| Código do produto | A-25 (Takara). Hasbro: "Dragoon Fighter" |
| Tipo | Attack |
| Sistema | Spin Gear System |
| Rotação | Esquerda |
| Fera Bit (Bit-Beast) | Dragoon (dragão azul, vento) |
| Série / temporada | Bakuten Shoot (2001), temporada 1 |
| Primeira aparição (anime) | Ep. 23 "Showdown in Vegas" |
| Antecessora → Sucessora | Dragoon S → Dragoon V |

## 1. Peças (de cima para baixo)

| Camada | Peça | Descrição física | Função em batalha |
|---|---|---|---|
| Bit Chip | Dragoon (versão F) | Chip do Dragoon | fera bit |
| Attack Ring (AR) | Dual Dragon (6 g) | AR de **duas camadas**. A camada de cima tem 4 grandes cabeças de dragão com projeções para a esquerda (smash). A de baixo é um anel de 4 lâminas em "Dual Carbonate" (policarbonato) vermelho, que absorve choque | Smash esquerdo com mais durabilidade e absorção de impacto que o Reverse Dragon |
| Weight Disk (WD) | Eight Wide (13 g) | Octogonal e largo, com massa periférica | Mobilidade e inércia |
| Spin Gear (SG) / Core | Left Spin Gear | Abas para lançador esquerdo, mais longas que as do SG direito | Rotação esquerda |
| Support Part / Sub Ring | — | — | — |
| Blade Base (BB) | Fantom Grip Base | Base com eixo de **borracha vermelha alto** ("Grip Shaft") | Tem mais borracha que a Storm Grip, mas a borracha é dura e gera menos atrito. A base é mais alta, então fica um pouco menos rápida e mais vulnerável por baixo. Quando a borracha gasta, a bey fica hiperagressiva e a stamina despenca |

## 2. Formato e geometria
- Vista de cima: 4 cabeças de dragão grandes em simetria de 4 lados, com diâmetro moderado.
- Massa periférica (Eight Wide) e um anel inferior absorvente: um pouco mais pesada e robusta que a Dragoon S (~30–32 g, estimativa).
- Perfil **mais alto** que o da Dragoon S, o que a deixa mais exposta a upper attack.

## 3. Comportamento na arena
- **Movimento**: órbita agressiva, um pouco menos rápida que a da Dragoon S (borracha dura).
- **Ataque**: smash esquerdo com 4 cabeças. Bate com força e aguenta melhor o recoil por causa do anel de policarbonato.
- **Defesa**: média (absorção do anel inferior).
- **Stamina**: baixa.
- **Matchups**: ganha de attackers e balance (Jose, Steven/Tryhorn, Oliver empatou, Enrique na revanche, Robert/Griffolyon na revanche, Tala/Wolborg 2 na final). Perde no primeiro encontro com os Majestics (Robert, ep. 30, e Enrique, ep. 35). Contra a Black Dranzer, só vence quando se junta às outras três feras (ep. 45).
- **Gimmick**: nenhum, além da camada absorvente do AR.

## 4. No anime
- **Ataque especial**: **Phantom Hurricane** (幻影爆風撃 / ファントムハリケーン, Fantomu Harikēn), estreia no ep. 23. No anime é uma versão turbinada do Storm Attack: um tornado maior e mais forte com o Dragoon emergindo. No mangá, cria clones de vento que servem de chamariz. O Storm Attack continua sendo usado.
- **Batalhas marcantes**: torneio americano (ep. 23–27). Majestics na Europa (ep. 30–39: derrota e depois vitória sobre o Robert). Ep. 45, Black Dranzer, quando o Tyson lança a Dragoon F **junto com a Dranzer F** (ver `../dranzer-f`). Ep. 50–51, vitória sobre o Tala (Wolborg 2), que dá o título mundial.
- **Substituição**: no início de V-Force vira Dragoon V (Magnacore).

## 5. Tradução para o jogo

| Atributo | Valor | Justificativa |
|---|---|---|
| Ataque | 7 | Smash esquerdo com 4 cabeças, um pouco mais robusto que o da Dragoon S |
| Defesa | 5 | O anel de policarbonato absorve choques |
| Stamina | 3 | Borracha |
| Velocidade | 7 | Mais lenta que a S: a borracha dura e a base alta tiram velocidade |
| Peso | 4 | ~30–32 g (estimativa) |
| Equilíbrio | 5 | Mais alta, oscila um pouco mais |
| Burst/Knockout-resist | 5 | Mais pesada e com absorção. Aguentou a final contra o Tala |

- **Movimento em IA**: `agressivo` (órbita de borda com investidas). Ao ativar o especial, para no centro.
- **Especiais (no jogo)**:
  - **Phantom Hurricane**: tornado grande por 5 s, mais largo que o Storm Attack. Knockback alto e dano de rotação contínuo em quem estiver no raio. A bey fica quase parada. Custo 100, cooldown 22 s.
  - **Storm Attack** (herdado): versão menor, custo 70, cooldown 15 s.
- **Física sugerida**: massa 0,9 · raio 1,0 · atrito da ponta 0,75 · restituição 0,62.

Os mesmos dados ficam em `dados.json`.

## 6. Fontes
- https://beyblade.fandom.com/wiki/Dragoon_F
- https://beyblade.fandom.com/wiki/Attack_Ring_-_Dual_Dragon
- https://beyblade.fandom.com/wiki/Blade_Base_-_Fantom_Grip_Base (página vazia; a descrição veio da página da Dragoon F)
- https://beyblade.fandom.com/wiki/Phantom_Hurricane
- https://beyblade.fandom.com/wiki/Beyblade_-_Episode_23
- https://beyblade.fandom.com/wiki/Beyblade_-_Episode_45
