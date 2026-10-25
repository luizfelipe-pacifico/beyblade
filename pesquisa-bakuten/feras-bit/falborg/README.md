# Falborg (ファルボーグ)

![Emblema](emblema.svg) ![Idle](idle.svg)

| Campo | Valor |
|---|---|
| Animal | Falcão (隼, hayabusa) |
| Elemento | Vento |
| Inspiração | Ave de rapina; fera bit **artificial** da Abadia Balkov. O golpe evoca o *kamaitachi* (鎌鼬) |
| Dono | Bryan Kuznetsov (Boris Kuznetsov no JP) |
| Beys | Falborg (S1, só no anime) · Falborg 2 (G-Revolution) |
| Primeira aparição | S1 ep. 46 "First Strike"; a fera tem destaque no ep. 49 "A Wicked Wind Blows" |

## Inspiração
O falcão é o predador mais rápido do céu. Por isso a Falborg ataca com investidas e cortes de vento. O *kamaitachi* é, no folclore japonês, um vento que corta a pele sem ser visto. A Wikipedia JP descreve o golpe de Bryan como um "ataque assassino com kamaitachi" que atinge a bey diretamente. Como as outras feras dos Demolition Boys (Wolborg, Seaborg, Wyborg), foi criada artificialmente pela Abadia Balkov.

## Aparência
- **Anime** (frame em `personagens/bryan-kuznetsov/beyblades/falborg/anime-fera-bit.jpg`): ave de rapina azul-turquesa, com uma fileira de penas de ponta amarela na borda das asas, toques vermelhos nas pontas das asas e na cabeça e bico aberto.
- **Desenho do jogo** (arte original):
  - asas longas e pontudas abertas quase na horizontal, como num falcão pairando;
  - borda de ataque vermelha com faixa salmão;
  - primárias azul-petróleo com pontas vermelhas e amarelas;
  - secundárias com ponta amarela;
  - fileira de coberteiras roxas;
  - peito azul-claro com chevrons amarelos;
  - máscara vermelha no olho com faixa malar;
  - crista de penas vermelhas;
  - bico amarelo em gancho com ponta escura;
  - "calças" de penas e garras amarelas abertas;
  - cauda em leque com faixas amarelas e pontas vermelhas.

  Crista, chevrons, faixa malar e coberteiras roxas são **interpretação de design**.

## Personalidade
Reflete Bryan na S1: frio, sádico e impaciente. Ataca o blader além da bey (Ray é ferido "pelo vento invisível", sem que o juiz possa punir). Em G-Revolution, Bryan está mais leve e a fera aparece como arma de equipe contra a BEGA.

## Especiais
Os nomes são os da dublagem em inglês. A ficha BBA do dub mostra "Stroblitz".

| Bey | Golpe (EN) | Nome JP | Visual no anime | Efeito proposto no jogo |
|---|---|---|---|---|
| Falborg | **Stroblitz** | não confirmado (descrito como kamaitachi) | Tornado e lâminas de vento invisíveis que cortam a bey e ferem o blader adversário | 3 lâminas de vento em leque; cada acerto tira 5% de rotação e empurra o alvo 0,5 raio (100 / 18 s) |
| Falborg 2 | **Stroblitz Attack** | não confirmado | Um feixe branco ofuscante mira o oponente, atravessa a bey no impacto e pode estilhaçá-la | Carga 0,8 s e feixe/dash que atravessa o alvo: 2,2x ataque, "quebra" (-15% de rotação) abaixo de 30% (100 / 20 s) |

## Aparições marcantes
- **S1 ep. 46**: com Spencer (Seaborg 2), vence Max num 2 contra 1 e roubam a Draciel.
- **S1 ep. 49**: contra Ray (Driger F), vence a 1ª rodada arremessando um pedaço do estádio. Perde a 2ª por pressa. Na 3ª, Driger protege Ray e despedaça a Falborg.
- **G-Rev ep. 35**: com Tala e Spencer vence o BEGA Training Squad. Depois, com Spencer, perde para Garland (Apollon) e a Falborg 2 sai muito danificada.

## Paleta
| Uso | Hex |
|---|---|
| Primária (corpo, coberteiras) | `#2fa7c9` (sombra `#1b7393`, brilho `#9be6f7`) |
| Penas de voo | `#2b97bd` (sombra `#18658a`) |
| Secundária (pontas, chevrons, bico, garras) | `#f2c230` |
| Vermelho (crista, máscara, borda da asa) | `#d63a3a` |
| Roxo (coberteiras) | `#7b4bb3` |
| Peito | `#8fdcef` |
| Brilho / aura / vento | `#8fe8ff` · `#bff4ff` · `#ffffff` |
| Contorno | `#0d1226` |

## Animações
Grupos: `aura`, `fera`, `tail` (7 `.plume-t`), `wing-left`, `wing-right`, `claws`, `body`, `head`, `crest`, `particles`, `wind-back`, `wind-front`.
- **`emblema.svg`**: cabeça de falcão de perfil, com bico amarelo em gancho, máscara e crista vermelhas e pescoço de penas.
- **`idle.svg`** (2,8 s, loop):
  - pairar: o corpo sobe e desce;
  - as asas batem mais fundo que as das fênix;
  - a cabeça vigia, a crista ondula, a cauda balança e as garras se mexem;
  - rajadas de vento (arcos em degradê) passam pela fera;
  - penas soltas giram no ar.
- **`invocacao.svg`** (1,5 s): um tornado de anéis girando sobe da bey. O falcão sai girando, cresce e abre as asas com overshoot; anel de choque e penas espalhadas.
- **`ataque.svg`** (1,0 s, loop; Stroblitz / Stroblitz Attack):
  - o falcão recua para o alto à esquerda e ergue as asas;
  - mergulha com as asas recolhidas e linhas de velocidade;
  - ao abrir as asas, solta 5 lâminas de vento em crescente (*kamaitachi*) que giram e se espalham;
  - um feixe branco vertical cai sobre a bey;
  - termina num impacto com anel e raios.

## Sons
- **invocacao** (2,5 s): rajadas de vento varrendo 400–3000 Hz, assobio fino, baque grave e dois gritos de falcão ("kii… kiiii") com queda rápida de pitch.
- **rugido** (1,4 s): "kii-kii-kiiii", dois gritos curtos e um longo (saw 2,4–3 kHz com vibrato de 15–18 Hz) sobre o vento.
- **ataque** (1,3 s): sopro de mergulho, três "shhk" de lâminas de vento, um "shing" metálico (sine 4,2 kHz), o zumbido do feixe subindo e o impacto.

## Fontes
- https://beyblade.fandom.com/wiki/Falborg
- https://beyblade.fandom.com/wiki/Bit_Chip_-_Falborg
- https://beyblade.fandom.com/wiki/Stroblitz_Attack (a página "Stroblitz" não existe na wiki)
- https://ja.wikipedia.org/wiki/爆転シュート_ベイブレード_(アニメ) (seção ロシアチーム)
- `pesquisa-bakuten/personagens/bryan-kuznetsov/README.md` e `beyblades/falborg*/README.md`; frame `beyblades/falborg/anime-fera-bit.jpg`
