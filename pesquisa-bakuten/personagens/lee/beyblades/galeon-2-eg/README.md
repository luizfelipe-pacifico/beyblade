# Galeon 2 — Engine Gear (ガルオン2 / Garuon 2) — versão exclusiva do anime

> **Imagem faltante** (`imagem`, `anime`): CDN da wiki bloqueou o download (desafio Cloudflare com `curl -A "Mozilla/5.0"`). Referências na galeria de https://beyblade.fandom.com/wiki/Galeon_2_(Engine_Gear) : `Galeon 2 G.jpg` (frame do anime da bey montada), `Galeon 2 G parts.jpg` (vista explodida mostrada numa tela no anime), `Galeon 2 G spins.jpg`. Não existe brinquedo, portanto não há foto de produto.

| Campo | Valor |
|---|---|
| Dono | Lee |
| Código do produto | — (não lançada como brinquedo) |
| Tipo | Balance (segundo a wiki) |
| Sistema | Engine Gear System |
| Rotação | Direita |
| Fera Bit (Bit-Beast) | Galeon – leão negro |
| Série / temporada | G-Revolution (2003) |
| Primeira aparição (anime) | G-Rev ep 10 "It's a Battle Royal...!" (segundo a infobox da wiki) |
| Antecessora → Sucessora | Galeon 2 (Magnacore) → — |

## 1. Peças (de cima para baixo)

| Camada | Peça | Descrição física | Função em batalha |
|---|---|---|---|
| Bit Chip | Galeon | chip com Galeon | identidade / fera bit |
| Attack Ring (AR) | Howling Leo | 6 pontas de ataque | golpes frequentes |
| Weight Disk (WD) | Wide Attack ("Wide Attacker", 13,7 g) | disco hexagonal com pontos de ataque nos cantos; um pouco menos largo e mais central que o Wide comum | adiciona ataque e mantém stamina |
| Engine Gear (EG) | Right EG (Metal Semi-Flat) (11 g) | motor de corda com ponta metálica quase plana | arrancada de velocidade quando liberado; ponta agressiva |
| Blade Base (BB) | First Clutch Base (Instant Release) | base de liberação imediata | ativa o EG logo após o pouso |

Peças conforme a infobox da wiki (modelo fictício). Fotos das peças: inexistentes como brinquedo; ver referência `Galeon 2 G parts.jpg` acima.

## 2. Formato e geometria
- Mesma silhueta de 6 pontas da Galeon 2, com WD hexagonal de cantos ofensivos.
- Massa central alta (Engine Gear de 11 g).
- Perfil um pouco mais alto que a versão Magnacore (EG + base clutch) — estimativa.

## 3. Comportamento na arena (inferido das peças; não há brinquedo para testar)
- **Movimento**: arrancada rápida logo após o pouso (EG instantâneo), depois órbita agressiva com ponta metálica plana.
- **Ataque**: alto no início da batalha.
- **Defesa/Stamina**: médias; o boost se esgota cedo.
- **Matchups**: forte contra beys que demoram a se posicionar; fraca contra stamina/defensivas que sobrevivem ao rush.
- **Gimmick**: Engine Gear.

## 4. No anime
- **Spiral Lightning**: raios em espiral que desorientam e expulsam o oponente (estreia ep 10 contra Tyson).
- Vista explodida mostrada numa tela no anime (referência `Galeon 2 G parts.jpg`), confirmando a construção com Engine Gear.
- Batalhas: as páginas de episódio da wiki não distinguem as versões; as batalhas de Lee do ep 10 em diante (ver `../galeon-2/README.md`) podem ser atribuídas a esta versão.

## 5. Tradução para o jogo

| Atributo | Valor | Justificativa |
|---|---|---|
| Ataque | 8 | Howling Leo + Wide Attack + boost do EG |
| Defesa | 5 | base de EG menos estável |
| Stamina | 5 | EG gasta cedo |
| Velocidade | 8 | Engine Gear + ponta flat de metal |
| Peso | 7 | EG de 11 g |
| Equilíbrio | 5 | rush inicial |
| Burst/Knockout-resist | 6 | peso alto |

- **Movimento em IA**: fase 1 (0–4 s) rush com +50% de velocidade; fase 2 órbita média com investidas (igual à Galeon 2).
- **Especiais (no jogo)**: *Spiral Lightning* — igual à Galeon 2 (desorienta 1,5 s + empurrão para a borda); custo 130, cooldown 26 s.
- **Física sugerida (estimativa)**: massa relativa 1.10; raio 1.05; atrito da ponta 0.6; restituição 0.55.

Os mesmos dados ficam em `dados.json`.

## 6. Fontes
- https://beyblade.fandom.com/wiki/Galeon_2_(Engine_Gear)
- https://beyblade.fandom.com/wiki/Weight_Disk_-_Wide_Attack
- https://beyblade.fandom.com/wiki/Engine_Gear_-_Right_EG_(Metal_Semi-Flat)
- https://beyblade.fandom.com/wiki/Blade_Base_-_First_Clutch_Base
- https://beyblade.fandom.com/wiki/Spiral_Lightning
- https://beyblade.fandom.com/wiki/Beyblade:_G-Revolution_-_Episode_10
