# Dragoon Grip Attacker (ドラグーングリップアタッカー / Doragūn Gurippu Atakkā)

> **Imagens faltantes**: o CDN da wiki bloqueia com desafio anti-bot da Cloudflare, então nada foi baixado. Fontes:
> - Montada (deve virar `imagem.jpg`): https://beyblade.fandom.com/wiki/File:BCH8251beyattyptops.jpg (alternativa: https://beyblade.fandom.com/wiki/File:GripAttacker.jpg)
> - Anime: https://beyblade.fandom.com/wiki/File:Grip_Attacker_Anime_.png · destruída pelo Kai: https://beyblade.fandom.com/wiki/File:Destroyed_by_Kai.jpg
> - Peças: AR https://beyblade.fandom.com/wiki/File:Gripattackerar1.jpg · WD https://beyblade.fandom.com/wiki/File:Gripattwd1.jpg · BB https://beyblade.fandom.com/wiki/File:Gripbase1.jpg · todas as peças https://beyblade.fandom.com/wiki/File:Gripattackerparts1.jpg

| Campo | Valor |
|---|---|
| Dono | Tyson Granger |
| Código do produto | 17 (Takara, linha "Next Generation Beigoma Battle"). Hasbro: "Grip Attacker" |
| Tipo | Attack |
| Sistema | 4 Layer System (pré-Spin Gear: não tem Spin Gear) |
| Rotação | Direita (é a única bey "Dragoon" do Tyson que gira para a direita) |
| Fera Bit (Bit-Beast) | Nenhuma no anime. O Dragoon só entra na bey seguinte (Dragoon S), no ep. 2. O bit chip mostra o Dragoon |
| Série / temporada | Bakuten Shoot (2001), temporada 1 |
| Primeira aparição (anime) | Ep. 01 "The Blade Raider" |
| Antecessora → Sucessora | (Spin Dragoon, só num flashback de G-Rev ep. 40) → Dragoon S |

## 1. Peças (de cima para baixo)

| Camada | Peça | Descrição física | Função em batalha |
|---|---|---|---|
| Bit Chip | Dragoon | Chip com a arte do Dragoon | identidade |
| Attack Ring (AR) | Dragon Head (4 g) | Um dos menores ARs já fabricados. Tem 4 protuberâncias minúsculas feitas para a rotação direita e é frágil | Pouco contato: o dano vem mais do Weight Disk ("Weight Disk Attack") do que do AR |
| Weight Disk (WD) | Wide (13 g) | Hexagonal, largo, com o peso na periferia | Dá inércia e alcance. Melhora a velocidade e o smash |
| Spin Gear (SG) / Core | — (não existe no 4 Layer System) | — | — |
| Support Part / Sub Ring | — | — | — |
| Blade Base (BB) | Grip Base (7 g) | Base muito baixa, com ponta de **borracha flat extremamente larga** | Uma das bases mais rápidas de todos os tempos (smash e upper). Gira por **pouco tempo** e só funciona na rotação direita |

## 2. Formato e geometria
- Vista de cima: quase circular e compacta (o AR é pequeno), com 4 pontas mínimas. Simetria de 4 lados. Raio pequeno: quem fica para fora é o WD Wide.
- Peso na periferia (Wide). Com uma bey tão leve (~24 g estimados = AR 4 + WD 13 + BB 7 + chip), a inércia é baixa.
- Perfil bem baixo (Grip Base), o que ajuda a acertar por baixo.

## 3. Comportamento na arena
- **Movimento**: correria agressiva e caótica pela arena (rubber flat). Faz flower pattern rápido quando lançada inclinada.
- **Ataque**: velocidade alta e choques frequentes, mas com pouco "dente" (o AR quase não tem pontas). Ganha de beys amadoras por insistência e ritmo.
- **Defesa**: fraca. É leve e não tem nada que absorva impacto.
- **Stamina**: muito baixa. A borracha gasta a rotação depressa.
- **Pontos fortes**: velocidade, perfil baixo. **Fracos**: leve, frágil, pouca stamina e sem fera bit.
- **Matchups**: ganha de beys genéricas e lentas (Star Stinger do Billy, Kid Dragoon do Carlos). Perde feio para beys com fera bit (Dranzer S do Kai, que a destruiu).
- **Gimmick**: nenhum, além da ponta de borracha.

## 4. No anime
- **Especiais**: nenhum, porque ainda não tem fera bit. Na batalha com o Carlos, o Tyson pega **impulso correndo antes de lançar** e combina dois ripcords. Na noite anterior, treinou para deixá-la "quatro vezes mais rápida", como o Kenny pediu.
- **Batalhas**: ep. 1, vitória sobre o Billy (Star Stinger) e o Carlos (Kid Dragoon). Ep. 1–2, derrota para o Kai (Dranzer S): a bey é **destruída**.
- **Substituição**: depois de destruída, o Kenny e o Andrew ajudam a montar a Dragoon S, que recebe o Dragoon.

## 5. Tradução para o jogo

| Atributo | Valor | Justificativa |
|---|---|---|
| Ataque | 4 | O AR Dragon Head é minúsculo e frágil. O dano vem do WD e da velocidade |
| Defesa | 2 | Leve, sem peças defensivas |
| Stamina | 2 | Ponta de borracha larga e leve |
| Velocidade | 9 | A Grip Base está entre as bases mais rápidas da era plástica |
| Peso | 2 | ~24 g (estimativa): a mais leve da linha |
| Equilíbrio | 4 | Baixa e larga, mas leve, então perde estabilidade com impactos |
| Burst/Knockout-resist | 2 | É facilmente arremessada (perdeu e foi destruída pela Dranzer S) |

- **Movimento em IA**: `agressivo`. Órbita rápida e irregular, com investidas diretas. Velocidade alta no início que cai rápido (decaimento de rotação acelerado).
- **Especiais (no jogo)**: sem fera bit, então não tem especial de fera. Sugere-se uma habilidade de lançamento: **"Lançamento com corrida"**, que dá +25% de velocidade inicial nos primeiros 5 s. Custo 0, uso único por partida.
- **Física sugerida**: massa 0,75 · raio 0,9 · atrito da ponta 0,9 (borracha) · restituição 0,65.

Os mesmos dados ficam em `dados.json`.

## 6. Fontes
- https://beyblade.fandom.com/wiki/Dragoon_Grip_Attacker
- https://beyblade.fandom.com/wiki/Attack_Ring_-_Dragon_Head
- https://beyblade.fandom.com/wiki/Blade_Base_-_Grip_Base
- https://beyblade.fandom.com/wiki/Beyblade_-_Episode_01
- https://beyblade.fandom.com/wiki/Tyson_Granger
