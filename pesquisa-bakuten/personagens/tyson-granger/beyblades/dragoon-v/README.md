# Dragoon V – Dragoon Victory (ドラグーンＶ〈ビクトリー〉 / Doragūn Bikutorī)

> **Imagens faltantes**: o CDN da wiki bloqueia com desafio anti-bot da Cloudflare, então nada foi baixado. Fontes:
> - Montada (deve virar `imagem.jpg`): https://beyblade.fandom.com/wiki/File:Dragoon_Victory.jpg
> - Anime: https://beyblade.fandom.com/wiki/File:Dragoon_Victory_Anime.jpg
> - Peças: AR https://beyblade.fandom.com/wiki/File:DragoonVAttackRing.jpg · BB (por baixo) https://beyblade.fandom.com/wiki/File:DragoonVBladeBase(bottom).jpg · peças no anime https://beyblade.fandom.com/wiki/File:Imagem8.png · GIFs: https://beyblade.fandom.com/wiki/File:Ardragoonv.gif , https://beyblade.fandom.com/wiki/File:Sgdragoonv.gif , https://beyblade.fandom.com/wiki/File:Basedragoonv.gif

| Campo | Valor |
|---|---|
| Dono | Tyson Granger |
| Código do produto | A-41 (Takara, dezembro de 2001, 980 ienes. Hasbro, 2003) |
| Tipo | Attack |
| Sistema | Magnacore System |
| Rotação | Esquerda |
| Fera Bit (Bit-Beast) | Dragoon (dragão azul, vento) |
| Série / temporada | V-Force (2002) |
| Primeira aparição (anime) | V-Force ep. 01 "Shot Down in Flames" |
| Antecessora → Sucessora | Dragoon F → Dragoon V2 |

## 1. Peças (de cima para baixo)

| Camada | Peça | Descrição física | Função em batalha |
|---|---|---|---|
| Bit Chip | Dragoon | Chip do Dragoon | fera bit |
| Attack Ring (AR) | Eight Attacker | 8 protuberâncias para smash na rotação esquerda | Smash. Tem muito vão entre as pontas, então o recoil anula boa parte do dano (ataque 3, defesa 2, stamina 1 nas notas da wiki) |
| Weight Disk (WD) | Ten Wide (14 g) | Decagonal: o mais largo da série Wide | Inércia e alcance |
| Spin Gear (SG) / Core | Neo Left Spin Gear (4 g) | Neo SG com núcleo de Metal Weight (a ponta da base já tem o ímã) | Rotação esquerda e peso central extra |
| Support Part / Sub Ring | — | — | — |
| Blade Base (BB) | Magne Flat Base | 4 asas no corpo para smash. Eixo flat de **plástico duro com ímã embutido** (Magnecore) | Flat rápido. O plástico dura mais que a borracha, mas é menos rápido e menos controlável. O ímã interage com estádios e WDs magnéticos |

## 2. Formato e geometria
- Vista de cima: 8 pontas pequenas em anel (simetria de 8), raio grande por causa do Ten Wide.
- Massa periférica (Ten Wide) + metal weight central: inércia boa (~33 g, estimativa).
- Altura média.

## 3. Comportamento na arena
- **Movimento**: flower pattern largo e rápido (flat de plástico). Menos explosivo que a borracha, mas consistente por mais tempo.
- **Ataque**: muitos contatos pequenos. Recoil considerável.
- **Defesa**: baixa a média.
- **Stamina**: média-baixa. O flat de plástico gasta menos que a borracha.
- **Matchups**: perde para o Ozuma (Flash Leopard) duas vezes (ep. 1 e 3, na 2ª com o Dragoon "falhando") e para a IA que lê os movimentos (ep. 4). Ganha do Snakey (Sabel Cobra), do Daryl (ep. 11), do Ozuma (ep. 14) e do Kane (Cyber Dragoon, ep. 25–27).
- **Gimmick**: **Magnacore**: ímã na ponta, atraído ou repelido conforme o polo.

## 4. No anime
- **Ataque especial**: **Victory Tornado** (勝利竜巻 / ビクトリートルネード, Bikutorī Torunēdo), estreia no V-Force ep. 11 contra o Daryl (Darylanzer). No anime, a bey avança envolta num vórtice giratório. No mangá, é um tornado de múltiplos vórtices que repele vários adversários.
- **Batalhas marcantes**: ep. 1, derrota para o "Mr. X" (Ozuma). Ep. 4, consegue recuperar o Dragoon contra a IA do navio. Ep. 17, empate com o Kane. Ep. 25–27, vitória sobre o Kane e a Cyber Dragoon (cópia ciborgue do Dragoon).
- **Substituição**: fica danificada no prédio da Psykick. Em Nova York, a Judy Tate (mãe do Max) cria a Dragoon V2 (ep. 30).

## 5. Tradução para o jogo

| Atributo | Valor | Justificativa |
|---|---|---|
| Ataque | 7 | 8 pontas de smash com recoil. Abaixo da V2 |
| Defesa | 4 | Leve na periferia, sem SP |
| Stamina | 4 | Flat de plástico dura mais que borracha |
| Velocidade | 7 | Flat duro: rápido, mas menos que a borracha |
| Peso | 5 | Ten Wide + metal weight core |
| Equilíbrio | 5 | Média |
| Burst/Knockout-resist | 4 | Recoil alto (é jogada longe ao bater) |

- **Movimento em IA**: `flower` largo e rápido, com investidas quando o adversário estiver perto.
- **Especiais (no jogo)**:
  - **Victory Tornado**: a bey vira um projétil envolto em vórtice e faz uma investida guiada ao adversário (dash de 1,5 s). Dano alto e knockback médio. Diferente dos tornados da S1, ela **se move** durante o golpe. Custo 100, cooldown 20 s.
  - **Magnacore** (passiva): perto de outra bey Magnacore, atração (+choques) ou repulsão (−choques) conforme o polo escolhido antes da partida.
- **Física sugerida**: massa 0,95 · raio 1,05 · atrito da ponta 0,55 · restituição 0,72.

Os mesmos dados ficam em `dados.json`.

## 6. Fontes
- https://beyblade.fandom.com/wiki/Dragoon_V
- https://beyblade.fandom.com/wiki/Attack_Ring_-_Eight_Attacker
- https://beyblade.fandom.com/wiki/Blade_Base_-_Magne_Flat_Base
- https://beyblade.fandom.com/wiki/Weight_Disk_-_Ten_Wide
- https://beyblade.fandom.com/wiki/Victory_Tornado
- https://beyblade.fandom.com/wiki/Beyblade_VForce_-_Episode_03 , https://beyblade.fandom.com/wiki/Beyblade_VForce_-_Episode_04
