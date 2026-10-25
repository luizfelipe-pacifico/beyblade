# Beyblades: dados, peças, lançadores e atributos

Como o catálogo de `pesquisa-bakuten/` é organizado e como os atributos de jogo são calculados ([D-009](DECISIONS.md#d-009-atributos-calculados-a-partir-das-peças), [D-010](DECISIONS.md#d-010-lançadores-fazem-parte-do-catálogo)). Arte em [`ART.md`](ART.md); som em [`AUDIO.md`](AUDIO.md).

## Estrutura

```
pesquisa-bakuten/
  pecas/<categoria>/<slug>/        # catálogo único de peças (uma peça é usada por várias beys)
    dados.json  README.md  topo.svg  lateral.svg  [referencia/]
  lancadores/<slug>/               # lançadores
    dados.json  README.md  lancador.svg  [referencia/]
  feras-bit/<slug>/                # feras bit
    dados.json  README.md  emblema.svg  idle.svg  invocacao.svg  ataque.svg  sons.json  sons/*.wav
  personagens/<personagem>/
    README.md  retrato.svg  [referencia/]
    beyblades/<bey>/
      dados.json  README.md  montada.svg  explodida.svg  pecas/*.svg  [referencia/]
```

`<categoria>`: `bit-chip`, `attack-ring`, `support-part`, `weight-disk`, `spin-gear` (inclui cores, Engine Gears e Running Cores), `blade-base`.
Slugs em minúsculas com hífen, iguais ao nome em inglês da peça (`cross-dranzer`, `ten-heavy`, `customize-clutch-base`). Variações de uma mesma peça por bey ganham sufixo (`first-clutch-base-driger-g`).

Os SVGs `topo`, `lateral`, `montada`, `explodida` e `pecas/*.svg` são **gerados** por `scripts/build-research.js` (`npm run build:research`) a partir de `forma` e `cores`. Não edite à mão: mude os dados e rode o script.

## Ficha de peça (`pecas/<categoria>/<slug>/dados.json`)

```jsonc
{
  "id": "attack-ring/cross-dranzer",
  "categoria": "attack-ring",
  "nome": "Cross Dranzer",
  "nome_jp": "クロスドランザー",
  "sistema": "magnacore",                     // 4-layer | spin-gear | magnacore | engine-gear | hms
  "usado_em": ["kai-hiwatari/dranzer-v2"],    // <personagem>/<bey>
  "material": { "principal": "ABS", "outros": [], "obs": "" },
  "medidas": {                                // cada valor diz de onde veio
    "diametro_mm": { "valor": 44, "fonte": "estimado" },   // oficial | wiki | comunidade | medido | estimado
    "altura_mm":   { "valor": 7,  "fonte": "estimado" },
    "peso_g":      { "valor": 5.0, "fonte": "wiki" }
  },
  "stats_oficiais": { "ataque": 2, "defesa": 2, "stamina": 1, "fonte": "Beyblade Wiki, Part Infobox" },  // ou null
  "stats_gba": null,                          // preenchido pela engenharia reversa (REVERSE_ENGINEERING.md)
  "fisica": { },                              // por categoria, ver abaixo
  "forma": { },                               // parâmetros do gerador de arte, ver abaixo
  "cores": { "primaria": "#c8102e", "secundaria": "#f2b705", "detalhe": "#1a1a1a" },
  "acabamento": "opaco",                      // opaco | translucido | metalico | cromado
  "descricao": "Formato, contatos, detalhes visuais.",
  "funcao": "O que faz em batalha.",
  "fontes": ["https://beyblade.fandom.com/wiki/Attack_Ring_-_Cross_Dranzer"]
}
```

### Materiais (referência)

| Material | Onde aparece | Efeito |
|---|---|---|
| ABS | ARs, bases, SGs | Plástico rígido padrão |
| POM | Pontas de alguns bases/EGs | Baixo atrito, desgasta pouco |
| PC translúcido | Sub-ARs e peças coloridas | Mais frágil, só visual |
| Borracha | Pontas *grip* | Atrito alto: velocidade e ataque, perde stamina |
| Metal (zinco/aço) | Weight Disks, *Metal Weight Core*, pontas metálicas, AR de HMS | Massa e inércia |
| Ímã | *Magnecore*, *Magne Weight Disk* | Atração/repulsão em estádios magnéticos |

### `fisica` por categoria

| Categoria | Campos |
|---|---|
| `attack-ring`, `support-part` | `contatos` (n), `tipo_contato` (`smash` \| `upper` \| `slope` \| `defesa` \| `spike` \| `survival`), `recoil` (0–1), `raio_contato_mm`, `sentido_otimo` (`direita` \| `esquerda` \| `ambos`) |
| `weight-disk` | `distribuicao` (`centro` \| `equilibrado` \| `periferia`), `magnetico` (bool) |
| `spin-gear` | `rotacao` (`direita` \| `esquerda` \| `dupla`), `gimmick` (`nenhum` \| `metal-weight` \| `magnecore` \| `engine-gear` \| `bearing` \| `free-shaft` \| `running-core`), `ativacao` (`{ "modo": "nenhum" \| "clutch" \| "instantaneo" \| "turbo" \| "manual", "obs": "" }`) |
| `blade-base` | `tipo_ponta` (`sharp` \| `semi-flat` \| `flat` \| `grip` \| `ball` \| `metal-ball` \| `metal-flat` \| `metal-semi-flat` \| `metal-sharp` \| `bearing`), `raio_ponta_mm`, `atrito` (0–1), `padrao_movimento` (`centro` \| `flower` \| `orbita` \| `agressivo` \| `erratico`), `gimmick`, `modos` (lista `{ nome, tipo_ponta, atrito, gatilho }` para bases com troca/clutch) |
| `bit-chip` | `fera_bit` (slug em `feras-bit/`) |

Valores de referência para `atrito`: sharp 0,10 · metal-sharp 0,08 · bearing 0,05 · semi-flat 0,30 · metal-semi-flat 0,25 · flat 0,50 · metal-flat 0,40 · ball 0,25 · metal-ball 0,18 · grip 0,85.

### `forma` por categoria (contrato do gerador)

Escala em **mm**. Ângulos em graus, sentido horário visto de cima, 0° = topo.

**`attack-ring` e `support-part`**
```jsonc
{
  "simetria": 3,                // o lobo se repete N vezes em 360°
  "raio_base_mm": 17,           // anel entre os lobos
  "raio_interno_mm": 9,         // furo central
  "espessura_mm": 6,
  "lobos": [                    // ângulos dentro do setor 0..360/simetria; vários lobos por setor são permitidos
    { "inicio": 0, "pico": 25, "fim": 70, "raio_mm": 22,
      "borda": "reta",          // reta | rampa | curva | ponta | gancho  (forma da borda que bate no sentido de rotação)
      "altura_mm": 6 }
  ],
  "metal": false                // true para AR com moldura metálica (HMS)
}
```

**`weight-disk`**
```jsonc
{ "lados": 10, "raio_externo_mm": 19, "raio_interno_mm": 6, "espessura_mm": 2.6,
  "estilo": "heavy" }           // heavy | balance | wide | attack | magne | circle; lados = 0 para disco redondo
```

**`spin-gear`**
```jsonc
{ "tipo": "spin-gear", "raio_mm": 8, "altura_mm": 9, "dentes": 12,
  "nucleo": "normal" }          // tipo: spin-gear | engine-gear | running-core; nucleo: normal | metal | magne-n | magne-s | engine | bearing
```

**`blade-base`**
```jsonc
{ "simetria": 4, "raio_corpo_mm": 19, "altura_mm": 12, "perfil": "conico",   // conico | reto | saia
  "lobos": [ { "inicio": 0, "pico": 30, "fim": 60, "raio_mm": 21, "borda": "curva", "altura_mm": 4 } ],
  "ponta": { "tipo": "semi-flat", "raio_mm": 3, "altura_mm": 5 } }
```

**`bit-chip`**
```jsonc
{ "raio_mm": 7, "cor_fundo": "#1b3a8a", "emblema": "dragoon" }   // emblema = slug em feras-bit/ (usa emblema.svg)
```

## Ficha da beyblade (`personagens/<p>/beyblades/<b>/dados.json`)

Mantém os campos da primeira pesquisa e passa a apontar para o catálogo:

```jsonc
{
  "pecas": {                     // ids do catálogo, de cima para baixo
    "bit_chip": "bit-chip/dranzer-v2",
    "attack_ring": "attack-ring/cross-dranzer",
    "support_part": "support-part/cross-survivor",
    "weight_disk": "weight-disk/ten-balance",
    "spin_gear": "spin-gear/neo-right-sg-mw-core",
    "blade_base": "blade-base/customize-clutch-base"
  },
  "fera_bit": "dranzer",
  "lancador": "lancadores/dranzer-launcher",
  "medidas": { },                // calculadas: diametro_mm, altura_mm, peso_g
  "atributos": { },              // calculados (ver abaixo)
  "ajuste_anime": { "ataque": 1 },   // deltas que representam o anime; aplicados por cima do calculado
  "atributos_primeira_pesquisa": { } // valores escritos à mão antes do D-009, só referência
}
```

## Ficha do lançador (`lancadores/<slug>/dados.json`)

```jsonc
{
  "id": "lancadores/dragoon-launcher",
  "nome": "...", "nome_jp": "...",
  "tipo": "ripcord",              // ripcord | string | power | winder | engine-gear
  "rotacao": "esquerda",          // direita | esquerda | dupla
  "sistema": "spin-gear",
  "usado_por": [ { "personagem": "tyson-granger", "temporadas": ["s1"], "beys": ["dragoon-s"], "obs": "" } ],
  "acessorios": ["Launcher Grip"],
  "material": { "principal": "ABS", "outros": [] },
  "medidas": { "comprimento_mm": {}, "largura_mm": {}, "altura_mm": {}, "peso_g": {}, "curso_corda_mm": {} },
  "atributos": { "forca": 7, "rpm_max": 6000, "precisao": 6, "controle_angulo": 5, "facilidade": 7 },
  "mecanica_jogo": { "janela_perfeita_ms": 120, "forca_maxima": 1.0, "desvio_angular_graus": 6, "obs": "" },
  "forma": { "corpo": "retangular", "grip": true, "tipo_corda": "ripcord", "cores": { "primaria": "#...", "secundaria": "#..." } },
  "descricao": "...", "fontes": []
}
```

## Ficha do ripcord (`lancadores/ripcords/<slug>/dados.json`)

[D-021](DECISIONS.md#d-021-ripcords-catalogados-junto-com-os-lançadores). O lançador dá a força; o ripcord (comprimento e dentes) define quanto giro a puxada entrega.

```jsonc
{
  "id": "lancadores/ripcords/ripcord-padrao",
  "nome": "...", "nome_jp": "...",
  "tipo": "ripcord",              // ripcord | string | winder
  "sentido": "direita",           // direita | esquerda | dupla
  "compativel_com": ["lancadores/ez-shooter"],
  "usado_por": [ { "personagem": "tyson-granger", "beys": ["dragoon-s"], "obs": "" } ],
  "material": { "principal": "PP", "outros": [] },
  "medidas": { "comprimento_mm": {}, "largura_mm": {}, "espessura_mm": {}, "numero_dentes": {}, "passo_dente_mm": {}, "peso_g": {} },
  "atributos": { "spin_entregue": 7, "facilidade": 6, "durabilidade": 5 },
  "mecanica_jogo": { "curso_puxada_mm": 300, "multiplicador_rpm": 1.0, "desgaste_por_batalha": 2 },
  "forma": { "comprimento_mm": 330, "dentes": 100, "cor": "#f2f2f2", "pegador": "redondo", "cor_pegador": "#2a5bd7" },  // pegador: redondo | T | anel | retangular
  "fontes": []
}
```

Os lançadores listam `ripcords_compativeis`, e `lancadores/_mapa.json` tem a chave `ripcords` (`"<personagem>/<bey>" → id`). O build gera `ripcord.svg` (corda em escala real, dobrada em fileiras) e grava `ripcord` no `dados.json` da bey.

## Ficha da fera bit (`feras-bit/<slug>/dados.json`)

```jsonc
{
  "id": "dragoon", "nome": "Dragoon", "nome_jp": "ドラグーン",
  "inspiracao": "Seiryū, o Dragão Azul do Leste (Quatro Símbolos)",
  "animal": "dragão", "elemento": "vento",
  "cores": { "primaria": "#...", "secundaria": "#...", "brilho": "#..." },
  "donos": ["tyson-granger"], "beys": ["tyson-granger/dragoon-s"],
  "aparencia": "Descrição visual usada para desenhar.",
  "especiais": [ { "nome": "Phantom Hurricane", "bey": "dragoon-v2", "visual": "...", "efeito_jogo": "..." } ],
  "animacoes": { "idle": "idle.svg", "invocacao": "invocacao.svg", "ataque": "ataque.svg" },
  "sons": { "invocacao": "sons/invocacao.wav", "rugido": "sons/rugido.wav", "ataque": "sons/ataque.wav" },
  "overlay": { "ancora": [256, 448], "escala_rel_bey": 3.0, "opacidade": 0.9, "blend": "screen" },
  "fontes": []
}
```

### Campos extras aceitos

Os agentes de pesquisa acrescentaram campos opcionais; todos são válidos e o build os ignora quando não usa:
`aliases`, `pecas_relacionadas`, `hipotetico`, `cores.fonte`, `cores.variantes`, `cores_por_bey` (`{ "<personagem>/<bey>": { "primaria": ... } }`, aplicado pelo build), `medidas.*.obs`, `stats_oficiais.potencia_engine`, `fisica.ponta_origem`, `forma.moldura` (moldura metálica de AR do HMS) e `metal` por lobo. Nos lançadores: `codigo_produto`, `anime`, `referencias`, `duvidas`, `atributos.justificativa`/`fonte`.

## Como os criadores pensaram os atributos

Resumo das duas pesquisas (detalhes e fontes em [`pesquisa-bakuten/ATRIBUTOS-ORIGEM.md`](../pesquisa-bakuten/ATRIBUTOS-ORIGEM.md) e [`REVERSE_ENGINEERING.md`](REVERSE_ENGINEERING.md#como-o-jogo-pensa-os-atributos)):

- **Takara (o brinquedo):** cada peça tinha estrelas de 攻撃力 Ataque, 防御力 Defesa e 持久力 Stamina, de **0 a 4 com meia estrela**. O total da bey é **AR + WD + Blade Base** (ou Running Core / Engine Gear quando não há base); Spin Gear, Support Part e Bit Chip não entram. Ex.: Dranzer V2 = Cross Dranzer 2/2/1 + Ten Balance 1/2/3 + Customize Clutch Base 3/1/3 = **6/5/7**. Magnacore e Engine Gear tinham estrelas à parte (Magne Power, Engine Power). O HMS acrescentou peso oficial e "Battle Spec Data" (peso, rotação, velocidade).
- **Beyblade Wiki:** o `AttackStat/DefenseStat/StaminaStat` de cada peça é cópia dessas estrelas, arredondando meia estrela para cima (e com alguns erros, ex. War Lion).
- **Jogo de GBA G-Revolution (ROM):** o mesmo trio Ataque/Defesa/Endurance de 0 a 4 por peça (AR, WD, BB), somado; **não tem peso nem física**. Por cima soma `(exp do blader + exp da bey) / 100` em cada stat. A classe da bey (ataque/defesa/endurance/combinação) sai dos totais, e o RPM do lançamento vem do mini-game (`power`, `boost`) e da força do blader. Os valores ficam fora do git (D-007).
- **Jogos japoneses de GBA 2002:** seis barras na bey montada (Sleep, Attack, Guard, Speed, Weight, Search), ou seja, além do trio separam **velocidade** e **peso**.
- **Comunidade:** tipos Attack > Stamina > Defense > Attack (Balance sem vantagem fixa), recoil, upper, spin stealing, distribuição de peso do WD e atrito da ponta.

## Modelo de atributos do jogo

Implementado em [`src/beyblade/stats.js`](../src/beyblade/stats.js) (testes em `tests/stats.test.js` e `tests/tips.test.js`). Segue a lógica oficial e completa o que ela não cobre com as medidas físicas do catálogo:

1. **Estrelas Takara somadas** por eixo: `Of_X = AR_X + WD_X + (Base | Running Core | Engine Gear)_X` para Ataque, Defesa e Stamina. Peça com estrelas mas sem um dos valores conta 2 (neutro); se faltar estrela em alguma das três peças, a soma é escalada para três peças. Normalização: `of10 = 1 + 9·(Of − 2)/10` (somas reais vão de ~2 a ~12).
2. **Física medida** (0..1), a partir de `medidas`, `fisica` e `forma`:
   - `fA = 0,35·contato + 0,25·atrito + 0,2·alcance + 0,2·massa − 0,2·recoil` (contato: smash/spike 1, upper 0,85, slope 0,5, defesa 0,25, survival 0,1)
   - `fD = 0,4·massa + 0,3·(1 − recoil) + 0,3·estabilidade_da_ponta`
   - `fS = 0,5·inércia + 0,3·(1 − atrito) + 0,2·eixo_livre` (inércia = Σ m·(rᵢ² + rₑ²)/2 de AR/WD, base como disco cônico; eixo livre = bearing/free-shaft)
3. **Ataque, Defesa, Stamina** = `0,6·of10 + 0,4·(1 + 9·f)`. Sem estrelas, só a física.
4. **Velocidade** = `1 + 9·(0,6·atrito + 0,25·(1 − massa) + 0,15·padrão_de_movimento)`. **Peso** = massa total entre 24 e 42 g → 1–10. **Equilíbrio** = WD no centro, ponta estável, simetria do AR e altura baixa. **Resistência a KO** = massa, defesa física, atrito e altura baixa, menos o recoil.
5. **Engine Gear** (a mola que solta no meio da luta): +1 velocidade e +0,5 ataque; turbo +1,5 e +1.
6. **A ponta** vem da base; nas beys Engine Gear, da ponta do EG registrada na base (`ponta_origem`); no HMS, do Running Core (`src/beyblade/tips.js`).
7. **`ajuste_anime`**: deltas por bey (–3 a +3) aplicados por cima do valor do brinquedo para refletir o anime, sempre justificados no README da bey.

O build guarda em cada `dados.json` da bey: `atributos_brinquedo`, `ajuste_anime`, `atributos` (valor de jogo) e `calculo` (entradas usadas: ponta, atrito, recoil, inércia, estrelas somadas, parcelas físicas). Nada disso deve ser editado à mão, exceto `ajuste_anime`.

## Build

`npm run build:research` (= `node scripts/build-research.js`) regenera, a partir dos `dados.json`:
- `topo.svg` e `lateral.svg` de cada peça, `lancador.svg` de cada lançador;
- `montada.svg`, `explodida.svg`, `sprite.svg` (sprite de topo para o jogo 2D) e `pecas/*.svg` de cada bey;
- os campos calculados das beys (acima), o `INDICE.md` e `galeria/dados.js`;
- o bloco `<!-- auto:inicio -->…<!-- auto:fim -->` dos READMEs de beys, peças e lançadores (o resto do README é escrito à mão e não é tocado).

**Não rode o build em paralelo** com outra pessoa/agente editando `dados.json` de beys: ele lê e regrava todas as fichas.
