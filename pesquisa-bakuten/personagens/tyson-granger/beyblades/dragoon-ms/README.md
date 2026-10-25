# Dragoon MS – Dragoon Metal Storm (ドラグーンＭＳ〈メタルストーム〉 / Doragūn Metaru Sutōmu)

> **Imagens faltantes**: o CDN da wiki bloqueia com desafio anti-bot da Cloudflare, então nada foi baixado. Fontes:
> - Montada (deve virar `imagem.jpg`): https://beyblade.fandom.com/wiki/File:DragoonMS.jpg
> - Anime: https://beyblade.fandom.com/wiki/File:DragoonMSAnime.jpg
> - Peças: AR Metal Attacker https://beyblade.fandom.com/wiki/File:DGMS4.png · RC Grip Flat Core https://beyblade.fandom.com/wiki/File:DGMS5.png · lado https://beyblade.fandom.com/wiki/File:DGMS2.png · peças (scan) https://beyblade.fandom.com/wiki/File:DragoonMs_Scan_.jpg

| Campo | Valor |
|---|---|
| Dono | Tyson Granger (desenvolvida pelo Kenny, com ajuda da Emily e do Miguel) |
| Código do produto | A-126 (Takara, setembro de 2003. Hasbro, 2004) |
| Tipo | Attack |
| Sistema | Hard Metal System (HMS) |
| Rotação | Esquerda no anime (linha Dragoon). A wiki marca o brinquedo como "Dual-Spin" (o HMS permite lançar para os dois lados) |
| Fera Bit (Bit-Beast) | Dragoon (dragão azul, vento) |
| Série / temporada | G-Revolution (2003) |
| Primeira aparição (anime) | G-Rev ep. 39 "Rebel Alliance" |
| Antecessora → Sucessora | Dragoon GT → Dragoon MS Ultimate Version |

## 1. Peças (de cima para baixo)

| Camada | Peça | Descrição física | Função em batalha |
|---|---|---|---|
| Bit Protector (no lugar do Bit Chip) | Dragoon Emblem | Protetor de ABS branco (1º molde, o mais frouxo), com adesivo do emblema do Dragoon ou da fera | identidade / fera bit |
| Attack Ring (AR) | Metal Attacker (14 g) | **4 pontas de metal expostas** com pontas arredondadas (ABS por cima, moldura metálica) | Smash. Wiki: 4, 2 e 1 estrelas em ataque, defesa e stamina. Bom na época, depois superado |
| Weight Disk (WD) | Circle Wide (14 g) | Wide **perfeitamente circular** e liso, com peso na borda | Inércia periférica. Junto com o Ten Wide, o Wide mais pesado |
| Running Core (RC) | Grip Flat Core (1 g) | Ponta de **borracha muito macia** de ~4 mm de diâmetro, com uma aba de borracha a ~2 mm da base que pode raspar no tornado ridge | Grip enorme e movimento muito rápido. É o RC **mais baixo** que existe (ótimo para upper e smash) e o mais leve. Wiki: 3, 1 e 1 estrelas em ataque, defesa e stamina |
| Support Part / Sub Ring | — | — | — |
| Blade Base (BB) | — (no HMS, o RC substitui a base) | — | — |

## 2. Formato e geometria
- Vista de cima: compacta (HMS é **menor** que a era plástica), 4 pontas metálicas, simetria de 4.
- Metal no AR (14 g) + Circle Wide (14 g): densa e com momento de inércia alto para o tamanho. Massa total estimada ~32–35 g.
- Perfil **muito baixo** (Grip Flat Core): acerta por baixo da maioria dos adversários.

## 3. Comportamento na arena
- **Movimento**: muito agressivo e rápido. Se for lançada inclinada, a aba de borracha encosta no ridge e acelera ainda mais. É difícil de controlar.
- **Ataque**: smash metálico de 4 pontos com contato baixo.
- **Defesa**: baixa a média.
- **Stamina**: baixa (borracha macia).
- **Matchups**: perde para o Miguel (Dark Gargoyle) no 1º teste (ep. 40, ainda sem saber controlar o HMS). Vence a dupla da BEGA (ep. 41) e o Garland (Apollon, ep. 49). Enfrenta o Brooklyn (Zeus) nos ep. 51–52.
- **Gimmick**: HMS (peças metálicas, RC de borracha). Sem gimmick móvel.

## 4. No anime
- Nasce porque as beys do Tyson e do Ray ficaram destruídas no ep. 37 e a BEGA cortou o acesso a peças. O Kenny desenvolve o sistema HMS com a ajuda do Miguel e da Emily (ep. 38–39). No início o HMS é "complicado demais" e o Dragoon chega a fugir do Tyson no treino (ep. 40, volta ao básico).
- **Ataque especial**: **Evolution Storm**, estreia no ep. 49 "Principles of Victory" contra o Garland. O Tyson e o Dragoon criam um **tornado gigante**. O Dragoon sai pela base do tornado, voa contra o adversário e colide com a fera bit dele. É o último golpe principal do anime original.
- **Batalhas marcantes**: ep. 49, vence o Garland no Justice 5. Ep. 51–52, enfrenta o Brooklyn (Zeus) numa dimensão paralela. O Evolution Storm não faz efeito e a bey evolui para a **Ultimate Version** com o poder das feras de todos os amigos.

## 5. Tradução para o jogo

| Atributo | Valor | Justificativa |
|---|---|---|
| Ataque | 9 | AR metálico + RC baixo e rápido |
| Defesa | 5 | Metal denso, porém compacto |
| Stamina | 3 | Borracha macia |
| Velocidade | 9 | Grip Flat Core: um dos RCs de ataque mais rápidos |
| Peso | 6 | Metal, mas bey compacta (~32–35 g, estimativa) |
| Equilíbrio | 6 | Perfil muito baixo |
| Burst/Knockout-resist | 6 | Densa e baixa |

- **Movimento em IA**: `agressivo` com **controle difícil**: velocidade alta e trajetória com ruído (desvio aleatório maior). Investidas por baixo do adversário.
- **Especiais (no jogo)**:
  - **Evolution Storm**: fase 1 cria um tornado gigante (2 s, puxa os adversários). Fase 2 dispara o Dragoon num dash de longo alcance contra o adversário: dano muito alto e knockback. Custo 100, cooldown 24 s.
  - **Ridge Boost** (passiva, do formato do RC): ao passar perto do tornado ridge, ganha +20% de velocidade por 1 s.
- **Física sugerida**: massa 1,1 · raio 0,85 (HMS é menor) · atrito da ponta 0,9 · restituição 0,65.

Os mesmos dados ficam em `dados.json`.

## 6. Fontes
- https://beyblade.fandom.com/wiki/Dragoon_MS
- https://beyblade.fandom.com/wiki/Evolution_Storm
- https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_40
- https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_51
- https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_52
- https://beyblade.fandom.com/wiki/Tyson_Granger (Plot: G Revolutions, Justice 5)
