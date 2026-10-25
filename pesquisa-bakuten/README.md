# Pesquisa — Bakuten Shoot Beyblade

Base de conhecimento para o jogo offline de Beyblade. Cobre o anime **Bakuten Shoot Beyblade** (爆転シュート ベイブレード, 2001–2003) em suas três temporadas, os 10 principais personagens que batalham e **todas as beyblades que cada um usa no anime**, estudadas individualmente.

> As imagens nesta pasta vêm da Beyblade Wiki (fandom) e de fotos de produto Takara/Hasbro. São **referência interna de estudo** e não devem ir para o build do jogo — os assets finais precisam ser arte própria.

## Estrutura

```
pesquisa-bakuten/
  README.md                      ← este arquivo (visão geral, sistemas, arena, escala)
  _template/                     ← templates e brief usados na pesquisa
  personagens/
    <personagem>/
      README.md                  ← estudo do personagem
      foto.*                     ← imagem do personagem
      beyblades/
        <beyblade>/
          README.md              ← estudo individual: peças, formato, arena, anime, jogo
          imagem.*               ← beyblade montada
          anime.*                ← (quando houver) frame do anime
          pecas/                 ← (quando houver) fotos das peças
          dados.json             ← atributos e física prontos para o jogo
```

## As temporadas

| Temporada | Ano | Torneio / arco | Sistema de peças predominante |
|---|---|---|---|
| **Bakuten Shoot Beyblade** (S1) | 2001 | Regional → Asiático (China) → Americano → Europeu → Mundial (Rússia, Abadia Balkov, BioVolt) | Spin Gear System (SG) |
| **Beyblade 2002 / V-Force** (S2) | 2002 | Saint Shields, Psykick, Magical Ape Team, Zeo/Cerberus | Magnacore System (MG) |
| **G-Revolution** (S3) | 2003 | Campeonato Mundial em duplas/times, BEGA (Boris), Justice Five | Engine Gear System (EG/EGT) + HMS no final |

## Os 10 personagens

| # | Personagem | Equipe principal | Fera bit | Pasta |
|---|---|---|---|---|
| 1 | Tyson Granger (木ノ宮タカオ Takao Kinomiya) | Bladebreakers | Dragoon (dragão azul, Seiryū) | [tyson-granger](personagens/tyson-granger/) |
| 2 | Kai Hiwatari (火渡カイ) | Bladebreakers / Blitzkrieg Boys | Dranzer (fênix, Suzaku) | [kai-hiwatari](personagens/kai-hiwatari/) |
| 3 | Ray Kon (金李 Rei Kon) | Bladebreakers / White Tigers | Driger (tigre branco, Byakko) | [ray-kon](personagens/ray-kon/) |
| 4 | Max Tate (水原マックス Max Mizuhara) | Bladebreakers / PPB All Starz | Draciel (tartaruga, Genbu) | [max-tate](personagens/max-tate/) |
| 5 | Daichi Sumeragi (皇大地) | BBA Revolution | Gaia Dragoon / Strata Dragoon | [daichi-sumeragi](personagens/daichi-sumeragi/) |
| 6 | Tala (ユーリ Yuriy Ivanov) | Demolition Boys / Blitzkrieg Boys | Wolborg (lobo) | [tala](personagens/tala/) |
| 7 | Bryan Kuznetsov (ボリス Boris) | Demolition Boys / Blitzkrieg Boys | Falborg (falcão) | [bryan-kuznetsov](personagens/bryan-kuznetsov/) |
| 8 | Brooklyn Masefield (ブルックリン) | BEGA | Zeus | [brooklyn-masefield](personagens/brooklyn-masefield/) |
| 9 | Lee (雷 Rai) | White Tigers (White Tiger X) | Galeon (pantera negra) | [lee](personagens/lee/) |
| 10 | Robert Jurgen (ロバート) | Majestics | Griffolyon (grifo) | [robert-jurgen](personagens/robert-jurgen/) |

O índice completo de beyblades por personagem está em [INDICE.md](INDICE.md).

## Anatomia de uma beyblade (era Bakuten)

De cima para baixo:

| Peça | Sigla | O que faz | Como vira mecânica de jogo |
|---|---|---|---|
| **Bit Chip** | BC | Selo no topo com a fera bit. Sem efeito físico relevante. | Identidade visual + desbloqueio do especial |
| **Attack Ring** | AR | Principal ponto de contato. O formato define o tipo de golpe: *smash* (pontas verticais que empurram), *upper* (rampas que levantam o adversário), *defesa* (formato arredondado que desvia), *stamina/slope* (liso, pouco atrito). | Dano, direção do impulso, recuo (*recoil*) em si mesma |
| **Sub-Attack Ring** | SAR | Anel livre (ex.: Galeon Attacker) que gira solto e absorve impactos. | Redução de dano ao receber golpe |
| **Weight Disk** | WD | Disco de metal. Diâmetro maior = mais inércia na periferia (bom para ataque e stamina); menor e concentrado = estabilidade. Ex.: *Ten Heavy*, *Eight Wide*, *Six Balance*, *Wide Defense*. | Massa e momento de inércia |
| **Spin Gear** | SG | Engrenagem dentro da base que define o sentido de rotação (direita/esquerda) e carrega o núcleo (*core*). | Sentido de rotação |
| **Core** (MG) | — | No Magnacore: núcleo de metal (*MW Core*) ou ímã (*Magnecore*), muda peso e interação com estádios magnéticos. | Peso extra / atração magnética |
| **Engine Gear** | EG | No Engine Gear System: mola dentro da base que é carregada no lançamento e **solta força extra no meio da batalha** (clutch). Ex.: First Clutch, Final Clutch, Turbo. | Especial com gatilho (boost de velocidade/ataque) |
| **Blade Base** | BB | Corpo inferior + **ponta** (*tip*). A ponta é o que mais define o movimento: *sharp* (fino, parado no centro, stamina), *semi-flat* (equilíbrio), *flat* (rápido, agressivo), *grip/borracha* (muito rápido, muito atrito, gasta stamina), *bola* (defesa, rola), *mola/gimmicks* (Dranzer V2 clutch, Driger G, etc.). | Atrito com o chão, padrão de movimento |

### Sistemas
- **Spin Gear System (SG)** — temporada 1. Introduziu o Spin Gear e beys de rotação esquerda. Peças simples, quase sem gimmicks.
- **Magnacore System (MG)** — V-Force (dez/2001+). Núcleo e Spin Gear separados (6 camadas), ímãs nos *Magnetic Weight Disks* e cores. Estádios magnéticos alteram trajetória.
- **Engine Gear System (EG/EGT)** — G-Revolution (dez/2002+). Engine Gear com mola que dispara no meio da batalha. Engine Gear Turbo (jun/2003) usado só por Dragoon GT e Dranzer GT.
- **Hard Metal System (HMS)** — final de G-Revolution / filme. Beys menores, de metal, rotação muito estável (ex.: Dragoon MS, Dranzer MS, Driger MS, Draciel MS).

## A arena (Beystadium) e as condições de vitória

- Estádio em forma de **tigela**: a inclinação puxa a beyblade para o centro. Beys de stamina ficam no centro; atacantes de ponta flat/grip orbitam na borda e mergulham no centro para golpear (*flower pattern*: pétalas indo e voltando da borda).
- **Vitória** no anime: (1) **ring out** — adversário expulso do estádio, (2) **sleep out / parada** — adversário para de girar primeiro, (3) **destruição** — bey quebrada (comum no anime, raro no brinquedo).
- **Sentido de rotação**: em rotação **igual**, as superfícies no ponto de contato se movem em sentidos opostos → golpes mais violentos e mais recoil (melhor cenário para ring out). Em rotação **oposta**, as superfícies andam no mesmo sentido → impacto menor, mas há **equalização de spin**: a bey com mais rotação transfere spin para a outra (beys de stamina de rotação esquerda exploram isso para "roubar" spin de atacantes de direita).
- **Recoil**: quanto mais "pontudo" o AR, mais o golpe empurra o adversário **e** o próprio atacante. Beys de ataque arriscam se auto-eliminar.
- **Ímãs (MG)**: estádios com ímãs puxam ou repelem beys com Magnecore — ótimo gancho de mecânica de arena para o jogo.

## Escala de atributos (1–10) usada em todos os `dados.json`

| Atributo | O que mede | Âncoras |
|---|---|---|
| **Ataque** | Força do golpe e chance de ring out no adversário | 10 ≈ Dragoon V2 / Driger V · 3 ≈ stamina pura |
| **Defesa** | Absorção de impacto, desvio | 10 ≈ Draciel V2 / Draciel G · 3 ≈ attacker leve de ponta flat |
| **Stamina** | Tempo de rotação | 10 ≈ Wolborg 2 / Zeus · 3 ≈ grip/flat attacker |
| **Velocidade** | Deslocamento na arena | flat/grip alto · sharp/bola baixo |
| **Peso** | Massa relativa | metal weight / magnecore / engine gear / HMS pesam mais |
| **Equilíbrio** | Estabilidade, resistência a *wobble* | |
| **Resistência a knockout** | Capacidade de não ser expulsa | |

Sugestão de conversão para o motor de física (ponto de partida para tuning):

```
massa           = 0.8 + peso * 0.05           # 0.85 .. 1.3
atrito_ponta    = ver tabela de pontas (sharp 0.15, semi-flat 0.35, flat 0.55, grip 0.85, bola 0.30)
spin_inicial    = 100 * (força do lançamento)
decaimento_spin = base * (1.6 - stamina * 0.1) * atrito_ponta
impulso_golpe   = ataque * velocidade_relativa * (mesma_rotacao ? 1.3 : 0.8)
spin_transferido = rotacao_oposta ? (spin_a - spin_b) * 0.05 : 0   # equalização
recoil_proprio  = impulso_golpe * fator_AR (smash 0.6, upper 0.4, defesa 0.2)
dano_recebido   = impulso / (1 + defesa * 0.15 + resistencia_knockout * 0.1)
```

## Fontes gerais
- Beyblade Wiki (fandom): https://beyblade.fandom.com — páginas `Spin_Gear_System`, `Magnacore_System`, `Engine_Gear_System`, `Beystadium`, e as páginas individuais de cada personagem/beyblade/peça citadas em cada estudo.
- Cada estudo lista as fontes específicas usadas.

## Status das imagens

| Personagens | Situação |
|---|---|
| Max, Robert, Daichi, Brooklyn, Tala, Bryan | Imagens baixadas (personagem, bey montada, peças e frames do anime quando disponíveis) |
| Tyson, Kai, Ray, Lee | **Pendentes**: o CDN da wiki (`static.wikia.nocookie.net`) passou a responder com o desafio anti-bot da Cloudflare. Cada README tem uma seção "Imagens pendentes/faltantes" com o nome de arquivo esperado e o link da página `File:` da wiki; nos `dados.json`, `imagens` está vazio |

## Pontos em aberto nas fontes

Cada estudo marca como **"não confirmado"** o que a wiki não sustenta (dubladores PT-BR, nomes JP de alguns especiais, pesos totais estimados pela soma das peças, qual bey foi usada em certos episódios). As principais divergências estão nos READMEs dos personagens. Destaques:
- Wolborg (A-11), Wolborg MS, Falborg MS, Dranzer MF e Galeon MS aparecem **só no mangá**. Falborg 3 não existe.
- Falborg (S1) nunca saiu como brinquedo; as peças vêm do jogo de GBA.
- As Dragoons do Tyson giram para a **esquerda** no anime (exceto a Grip Attacker), embora algumas versões de brinquedo divirjam.
- Galeon 2 (Engine Gear) existe só no anime; o brinquedo Galeon 2 é Magnacore.
