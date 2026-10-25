# Pesquisa — Bakuten Shoot Beyblade

Base de conhecimento para o jogo offline de Beyblade. Cobre o anime **Bakuten Shoot Beyblade** (爆転シュート ベイブレード, 2001–2003) em suas três temporadas, os 10 principais personagens que batalham e **todas as beyblades que cada um usa no anime**, estudadas individualmente.

Tudo o que é visual ou sonoro aqui é **arte própria** ([D-008](../docs/DECISIONS.md)): retratos, feras bit animadas, sons sintetizados e desenhos gerados das peças, beys, lançadores e ripcords, em escala real (mm). As fotos de terceiros (Beyblade Wiki, Takara/Hasbro) ficam só nas subpastas `referencia/`, como material de estudo, e nunca vão para o jogo.

**Comece pela [galeria](galeria/index.html)** (abra o arquivo no navegador): escolha um personagem e uma bey, veja a bey girando, invoque a fera bit com som e consulte atributos, peças, vistas montada e explodida, lançador e ripcord.

## Estrutura

```
pesquisa-bakuten/
  README.md                ← este arquivo
  INDICE.md                ← todas as beys com peso e atributos (gerado)
  ATRIBUTOS-ORIGEM.md      ← como Takara, Hasbro e os jogos pensaram os atributos
  galeria/                 ← galeria interativa (index.html + dados.js gerado)
  personagens/<personagem>/
    README.md  retrato.svg  referencia/
    beyblades/<bey>/
      README.md            ← ficha gerada + estudo (formato, arena, anime, mecânica no jogo, ajuste do anime)
      dados.json           ← peças (ids do catálogo), medidas, atributos calculados, fera, lançador, ripcord
      montada.svg  explodida.svg  sprite.svg  pecas/*.svg   (gerados)
      referencia/          ← fotos de terceiros
  pecas/<categoria>/<peça>/      ← catálogo único: 172 peças (bit-chip, attack-ring, support-part,
    dados.json  README.md          weight-disk, spin-gear, blade-base) com medidas, material,
    topo.svg  lateral.svg          estrelas Takara, física e forma; ESTRELAS.md = tabela das estrelas
  lancadores/<lançador>/   ← 25 lançadores (dados, README, lancador.svg)
  lancadores/ripcords/<ripcord>/ ← 13 ripcords (dados, README, ripcord.svg)
  feras-bit/<fera>/        ← 11 feras: emblema, idle, invocacao e ataque (SVG animado) + sons/*.wav
  sons-batalha/            ← lançamento, giro, choques, ring-out, parada, contagem (WAV sintetizado)
  _template/               ← briefs e templates usados na pesquisa
```

Os arquivos marcados como gerados saem de `npm run build:research` a partir dos `dados.json` (detalhes em [docs/BEYBLADES.md](../docs/BEYBLADES.md#build)). Sons: `node scripts/synth.js <sons.json> <pasta>` ([docs/AUDIO.md](../docs/AUDIO.md)). Padrão visual: [docs/ART.md](../docs/ART.md).

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
| 9 | Lee (雷 Rai) | White Tigers (White Tiger X) | Galeon (leão negro) | [lee](personagens/lee/) |
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

## Atributos

Sete atributos de 1 a 10 (Ataque, Defesa, Stamina, Velocidade, Peso, Equilíbrio, Resistência a KO), **calculados das peças** como a Takara pensava: estrelas oficiais de 0 a 4 por peça somadas (AR + WD + Base, mais Engine Gear e anéis extras) com 60% de peso, e física medida (massa, inércia, atrito da ponta, recoil, tipo de contato) com 40%. Velocidade, Peso, Equilíbrio e Resistência a KO vêm só das medidas. Um `ajuste_anime` por bey (–3 a +3, justificado no README) representa o desempenho no anime. Modelo completo e fontes: [docs/BEYBLADES.md](../docs/BEYBLADES.md#modelo-de-atributos-do-jogo) e [ATRIBUTOS-ORIGEM.md](ATRIBUTOS-ORIGEM.md); código em `src/beyblade/stats.js`.

## Fontes gerais
- Beyblade Wiki (fandom): https://beyblade.fandom.com — páginas `Spin_Gear_System`, `Magnacore_System`, `Engine_Gear_System`, `Beystadium`, e as páginas individuais de cada personagem/beyblade/peça citadas em cada estudo.
- Cada estudo lista as fontes específicas usadas.

## Pontos em aberto nas fontes

Cada estudo marca como **"não confirmado"** o que a wiki não sustenta (dubladores PT-BR, nomes JP de alguns especiais, pesos totais estimados pela soma das peças, qual bey foi usada em certos episódios). As principais divergências estão nos READMEs dos personagens. Destaques:
- Wolborg (A-11), Wolborg MS, Falborg MS, Dranzer MF e Galeon MS aparecem **só no mangá**. Falborg 3 não existe.
- Falborg (S1) nunca saiu como brinquedo; as peças vêm do jogo de GBA.
- As Dragoons do Tyson giram para a **esquerda** no anime (exceto a Grip Attacker), embora algumas versões de brinquedo divirjam.
- Galeon 2 (Engine Gear) existe só no anime; o brinquedo Galeon 2 é Magnacore.
- A Dragoon V2 High Power Custom é modelada pelo brinquedo RC (base com motor, 37,7 g), por isso pesa ~62 g; o anime fica no `ajuste_anime`.
- Medidas de diâmetro e altura são estimadas na maioria das peças (a fonte de cada valor está na ficha); pesos vêm da wiki/comunidade quando existem.
- Os retratos de Tyson, Kai, Ray e Lee foram desenhados sem foto de referência local e merecem conferência.
