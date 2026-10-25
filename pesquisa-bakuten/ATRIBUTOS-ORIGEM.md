# Como os criadores pensaram os atributos

Pesquisa sobre a origem dos números de Ataque/Defesa/Stamina das peças, como Takara, Hasbro e os jogos da época mostravam atributos, e qual física a comunidade usa. No fim há uma proposta de como combinar tudo nos atributos 1–10 do nosso jogo ([D-009](../docs/DECISIONS.md)).

Legenda de confiança: **confirmado** (duas fontes batem ou conferido por nós), **provável** (uma fonte boa, sem contradição), **não confirmado**.

## Resumo

| Fonte | Atributos | Escala | Soma as peças? | Confiança |
|---|---|---|---|---|
| Takara, especificação oficial por peça (era Bakuten, 1999–2004) | 攻撃力 Ataque, 防御力 Defesa, 持久力 Stamina (Endurance) | 0 a 4 estrelas, com **meia estrela** | Sim, na prática: o total da bey = AR + WD + Blade Base (ou Running Core / Engine Gear). Spin Gear, Support Part e Bit Chip ficam de fora | confirmado |
| Takara, Magnacore | マグネパワー Magne Power | 0 a 4 estrelas (quase nunca passa de 2) | Não (atributo à parte) | confirmado |
| Takara, Engine Gear | エンジンパワー Engine Power (+ A/D/S próprios do EG) | 0 a 4 estrelas | EG entra na soma A/D/S; Engine Power à parte | confirmado |
| Takara, HMS | A/D/S por peça + "Battle Spec Data" (peso, rotação, velocidade) | Estrelas 0–4 (Ultimate Attacker tem 4,5 de 5) | Sim (AR + WD + Running Core; Bit Protector fora) | A/D/S confirmado; Battle Spec só pela wiki |
| Beyblade Wiki, `{{Part Infobox}}` | `AttackStat`, `DefenseStat`, `StaminaStat`, `Weight` | Inteiros 0–4 | Não soma (só a peça) | Cópia das estrelas Takara, com meia estrela arredondada para cima e alguns erros de cópia |
| Hasbro (embalagem ocidental) | Tipo da bey: Attack / Defense / Endurance / Combination | Sem barras confirmadas | — | Barras/medidores **não confirmados** |
| GBA japonês *Bakuten Shoot Beyblade 2002* (tela "stats & parts") | スリープ Sleep, アタック Attack, ガード Guard, スピード Speed, ウエイト Weight, サーチ Search + elemento | ~0–999 com barra | Sim (valor da bey montada; peças trocáveis mudam os números) | confirmado (screenshot local) |
| GBA *Beyblade G-Revolution* (Atari, 2004) | ATK / DEF / END da bey, + nível/EXP da bey | 1 a 4 estrelas | Sim (muda ao trocar peças) | provável (relatos de jogadores; ROM ainda sem a tabela) |
| GameCube *Super Tournament Battle* | HP, Spin (0–9999), Legend Power; peças em graus α/β/γ | numérico | Sim | provável |
| PS1 *Let It Rip!* | Ataque, resistência, mobilidade (sobem por nível) | não confirmado | Sim (5 peças + lançador) | parcial |
| Comunidade (WBO, wiki) | Tipos Attack/Defense/Stamina/Balance e física de cada camada | qualitativo | — | consenso |

## 1. De onde vêm os números da wiki

### A escala é a das estrelas da Takara

A Takara dava a cada peça uma nota de 攻撃力 (ataque), 防御力 (defesa) e 持久力 (持久 = resistência; a Hasbro e a wiki traduzem como Stamina/Endurance) em **estrelas de 0 a 4, com meia estrela**. O blog japonês おばけブレーダー (obakeblader.com) transcreve essas notas peça por peça, junto com o texto de propaganda de cada peça (ex.: Spike Dragon: 「4枚のアタックポイントが敵に強烈な一撃を与えるぞっ！」) e o "formato" (形状: dragão, tartaruga etc.). O próprio blog diz: 「公式で設定されているパーツスペック」 ("especificação de peça definida oficialmente") e 「パーツごとの数値は公式ですが、それを合計した数値自体は非公式」 ("os números por peça são oficiais; a soma é nossa"). Na página da Dragoon MS UV o blog cita o 「商品同梱のカタログ」 (catálogo que vinha na caixa), então a origem provável é o material impresso da Takara (caixa/catálogo). **Não vimos foto da caixa**, então o lugar exato onde as estrelas eram impressas fica como provável.

Conferência com a infobox da wiki (estrelas Takara via obakeblader × wiki):

| Peça | Takara (A/D/S) | Wiki (A/D/S) | Resultado |
|---|---|---|---|
| Cross Dranzer (AR) | 2 / 2 / 1 | 2 / 2 / 1 | igual |
| Customize Clutch Base (BB) | 3 / 1 / 3 | 3 / 1 / 3 | igual |
| Ten Balance (WD) | 1 / 2 / 3 | 1 / 2 / 3 | igual |
| Upper Claw (AR) | 3 / 1 / 2 | 3 / 1 / 2 | igual |
| Triple Tiger (AR) | 3 / 1 / 1 | 3 / 1 / 1 | igual |
| Metal Attacker (AR, HMS) | 4 / 2 / 1 | 4 / 2 / 1 | igual |
| Grip Flat Core (RC, HMS) | 3 / 1 / 1 | 3 / 1 / 1 (★★★ / ★ / ★ na página da Dragoon MS) | igual |
| Spike Dragon (AR) | 3 / **1,5** / 1 | 3 / **2** / 1 | meia estrela arredondada para cima |
| Ten Wide (WD) | 1 / **1,5** / 4 | 1 / **2** / 4 | idem |
| Dragon Breaker (AR) | 3 / **2,5** / **2,5** | 3 / **3** / **3** | idem |
| War Lion (AR) | 2,5 / 2,5 / 1 | 1 / 3 / 2 | **erro na wiki** (são os números da Tiger Defenser) |

Conclusão: **os stats da wiki são as estrelas oficiais da Takara**, sem meia estrela e com alguns erros de cópia. Não vêm de cartões, do manual da Hasbro nem de jogos. Recomendação: guardar no catálogo o valor Takara com meia estrela (fonte obakeblader) e usar a wiki só como conferência.

Outros pontos:
- A soma que o blog faz bate com a soma "natural" das três camadas principais. Ex.: Dranzer V2 = Cross Dranzer 2/2/1 + Ten Balance 1/2/3 + Customize Clutch Base 3/1/3 = **6/5/7**, exatamente o total do blog. Draciel MS = Metal Defense 2/3/2 + Circle Wide 1/1/3 + Sharp Core 1/1/3 = **4/5/8**; Dranzer MS = 6,5/4,5/7,5 pelo mesmo cálculo. Support Parts também têm estrelas (Cross Survivor 2/0/2, Reverse Attack 2/0/0), mas o blog avisa que usa só a Blade Base nessas beys.
- **Spin Gears** não têm A/D/S (só o campo de Magne Power), exceto alguns tipos especiais (ex.: Neo Right SG Double Bearing:持久 3). **Engine Gears** têm A/D/S e Engine Power (ex.: Right EG Metal Semi-Flat 3/0/2, EP 2).
- **Bit Chip e Bit Protector não têm estrelas.** A infobox de dois Bit Protectors na wiki tem números (Draciel Emblem 1/3/3 com "Weight=3", Dranzer Emblem 1/2/1) num campo `EnduranceStat` que o template nem exibe; o peso real é 0,6 g e as somas Takara fecham sem eles. Tratados como erro.
- **Peso (`Weight`)** na wiki é medição de fã (o template mostra "±2 grams for sample variations"); bate com as medições do obakeblader na maioria dos casos (Cross Dranzer 5,0 × 5,1 g; Ten Balance 15,0 × 15,3 g; CCB 5,8 × 5,8 g). A Takara só passou a dar o peso oficial no HMS.
- A página de cada sistema na wiki (Spin Gear, Magnacore, Engine Gear, HMS) descreve a função das camadas, mas **não explica de onde vêm os stats**. A página "Statistic" da wiki define: Attack (攻撃力), Defense (防御力), Stamina (持久力), Magne Power e Engine Power em 4 estrelas ("não aparece na versão Hasbro"), e que o **HMS** introduziu a "Battle Spec Data" (バトルスペクデータ) com Weight (重量), Rotation (回転) e Speed (スピード).

### O que mostra "Bey, 2002 Dranzer V2 stats & parts.png"

A imagem não pode ser baixada (CDN da wiki bloqueado), mas os metadados dizem o suficiente:
- Tem **240 × 160 px**, a resolução exata da tela do Game Boy Advance, sem descrição nem legenda; aparece na galeria "Dranzer V2 - Takara" da página Dranzer V2.
- Faz parte de uma série de ~90 arquivos "Bey, 2002 <bey> stats & parts.png" (todos 240 × 160), enviados em 2019–2022; os comentários de upload dizem só "Bakuten Shoot - <bey>".
- O repositório tem uma dessas telas: [`personagens/bryan-kuznetsov/beyblades/falborg/referencia/pecas-gba-pecas-e-stats.png`](personagens/bryan-kuznetsov/beyblades/falborg/referencia/pecas-gba-pecas-e-stats.png). Ampliada, mostra o desenho do Attack Ring e da base com selos de elemento (火, 光), o menu 「ベイギミック」, o pedido 「ブースターをせんたくしてください」 ("escolha o booster") e seis barras: **スリープ 641, アタック 624, ガード 653, スピード 681, ウエイト 276, サーチ 703**.

Portanto a imagem da Dranzer V2 é a **tela de peças e atributos de um dos jogos de GBA japoneses "Bakuten Shoot Beyblade 2002"** (*Ikuze! Bakutō! Chō Jiryoku Battle!!* ou *Gekisen! Team Battle!!*, que usam o mesmo sistema), com as seis barras da Dranzer V2. Os valores exatos dela não foram lidos.

## 2. Como Takara e Hasbro apresentavam atributos

**Takara.**
- Por peça: estrelas de 攻撃力 / 防御力 / 持久力 (0–4, meia estrela), mais o "formato" (形状) e uma frase de efeito. Magnacore acrescentou マグネパワー e Engine Gear acrescentou エンジンパワー, ambos em 4 estrelas. O HMS acrescentou o peso oficial e a "Battle Spec Data".
- Por bey: o **tipo** (攻撃型 ataque, 防御型 defesa, 持久型 resistência, バランス型 equilíbrio), o sentido de rotação e a frase do personagem na caixa (パッケージセリフ, ex.: Draciel F 「見たか！これが玄武の真の力！！」).
- Não encontramos um gráfico de "power" total impresso pela Takara para a bey. O total somado é cálculo de fã.

**Hasbro.**
- Usava os tipos Attack / Defense / Endurance e **"Combination Type"/"Combo Type"** (no lugar de Balance) até o HMS (wiki, página "Type"). A ROM do G-Revolution (Atari/Hasbro) confirma esses quatro textos: "Attack type" … "Combination type" (ver [REVERSE_ENGINEERING.md](../docs/REVERSE_ENGINEERING.md)).
- Magne Power e Engine Power **não** aparecem nos produtos Hasbro (wiki, "Statistic").
- **Não confirmado:** barras ou medidores de atributos na embalagem Hasbro da era 2002–2004. Nenhuma fonte acessível descreve isso. As barras Attack/Defense/Stamina da Hasbro que aparecem nas buscas são da era Metal Fight (2009+), fora do nosso escopo.

## 3. Como os jogos da época mostravam atributos

| Jogo | Plataforma / origem | Atributos | Escala | Peças somam? |
|---|---|---|---|---|
| *Beyblade Fighting Tournament* (2000) | GBC, Hudson, só Japão | Feras bit em "séries" (Kid, Knight, Nightmare, Metal…) com força crescente; os chips japoneses traziam um código que destravava a fera (Driger S: "GER4") | não documentada | Sim; o jogo é quase só montar a bey e assistir |
| *Gekitō! Saikyō Blader* (2001) | GBA, Broccoli, só Japão | Peças coloridas com força progressiva (100, 101, 102…) | numérica | Sim |
| *Bakuten Shoot Beyblade 2002: Ikuze! Bakutō! Chō Jiryoku Battle!!* e *Gekisen! Team Battle!!* | GBA, só Japão | **Bey:** Sleep (持久), Attack, Guard, Speed (movimento e acerto), Weight (esquiva; talvez o quanto é empurrada), Search (alcance do ataque), elemento (terra/água/fogo/vento/céu, ~30–40% de vantagem), habilidades (DF, SP, SM/NM magnético…). **Ocultos:** AR = correção de ataque (0–50), WD = correção da barra de especial (0–25). **Blader:** Shoot, Power (+ Attack da bey = poder final), Sync, Guts e Critical ocultos | ~0–999 com barra (tela da Falborg) | Sim |
| *Beyblade: Let It Rip!* (PS1; no Japão *Bey Battle Tournament*, 2001) | PS1, Crave/Hudson | Bey de 5 peças + lançador; subir de nível aumenta resistência, mobilidade e poder de ataque; peças compradas com Bey Points | não confirmada (o guia "Blade Builder" do GameFAQs não abriu: 403) | Sim |
| *Beyblade VForce: Ultimate Blader Jam* (2003) | GBA, Atari/Full Fat, ocidental (não é tradução de jogo japonês segundo a wiki) | Barra de **spin** que cai com o tempo e barra de ataque; peças "mudam a física e o poder de ataque", mas o review do NWR diz que todas as beys parecem iguais | barras | Pouco efeito |
| *Beyblade G-Revolution* (2004) | GBA, Atari (a ROM do nosso D-007) | Bey: **ATK, DEF, END em 1–4 estrelas** + "Overall"; EXP da bey (zera se trocar mais de uma peça); RPM no lançamento (~4000 num lançamento perfeito); Engine Gear ativado com A+B. Blader: Experience, Level, Strength, Stamina, Power, Speed. A ROM guarda o tipo (attack/defense/endurance/combination) e os índices das peças | 1–4 estrelas | Sim (jogadores falam em combinações "4-4-2", "4-3-3") |
| *VForce: Super Tournament Battle* (2004; no Japão *Nettō! Magne Tag Battle*, 2002) | GameCube, Atari/Takara | **HP** (perder tudo = crash out), **Spin 0–9999** (zerar = sleep out), **Legend Power** (carrega o especial); peças em graus (ex.: "Spike Dragon Gamma"); nível do blader aumenta o HP | numérica | Sim |

Padrão comum: **os jogos não usam as estrelas da caixa diretamente.** Todos derivam três eixos (ataque, defesa, resistência) e somam um eixo de **movimento** (Speed/Search/mobilidade). Os japoneses de 2002 também separam **peso** (Weight) como atributo próprio, e quase todos guardam a rotação como recurso que se gasta (Sleep/Spin/RPM).

## 4. A física que a comunidade usa

**Tipos e o "triângulo".** São quatro tipos: Attack, Defense, Stamina (Endurance/Survival) e Balance (Combination na Hasbro antiga). O ciclo tradicional é: **Attack vence Stamina, Stamina vence Defense, Defense vence Attack**. Balance mistura características e não tem vantagem fixa (wiki "Type"; Wikipedia "Beyblade": os três primeiros têm "eficácia intransitiva").
- Attack: rápido, bate forte, gasta rotação; pouca estabilidade e perde mais spin em cada choque.
- Defense: peso para dentro (inward), estável, aguenta o choque e devolve.
- Stamina: ponta fina (sharp) e peso para fora (outward) para guardar momento angular.
- Balance: compromisso; depende do jogador.

**Papel de cada camada (sistemas plásticos e HMS).**

| Camada | O que decide | Variáveis |
|---|---|---|
| Bit Chip / Bit Protector | Identidade (fera bit). No HMS o Bit Protector é a trava das peças (moldes mais frouxos deixam a bey instável e mais lenta) | 0,6–1,4 g no centro: efeito físico desprezível |
| Attack Ring (+ Sub-AR, Support Part) | Contato: tipo de golpe (smash, upper, defesa/slope, spike), alcance e **recoil** | nº de contatos, ângulo, raio, espessura; peças livres (War Lion, Dragon Breaker) absorvem o choque |
| Weight Disk | Massa (13–17 g, quase metade da bey) e **distribuição**: Wide = periferia (inércia, stamina); Heavy/compacto = centro (estabilidade, velocidade de giro alta); Attack/Star = lobos externos | diâmetro, peso, formato (6/8/10 lados, circular) |
| Spin Gear / Engine Gear / Core | Sentido de rotação; gimmicks (núcleo de metal, ímã, bearing, free-shaft, Engine Gear que solta rotação guardada) | massa no centro, mecanismo |
| Blade Base / Running Core | Ponta = **atrito com o piso** e padrão de movimento: sharp (centro, stamina), semi-flat (equilíbrio), flat (flower), grip/borracha (muito rápido, agressivo, gasta rotação), ball/metal-ball (defesa, estável); bases com clutch trocam de modo | raio e material da ponta, altura, saia (contato baixo) |

**Conceitos usados para customizar.**
- **Recoil:** a bey é jogada para trás ao bater, perde stamina e pode sair sozinha da arena. Contatos grandes e retos (Spike Dragon) batem forte e sofrem muito recoil; o melhor smash é o que bate forte com pouco recoil.
- **Smash Attack:** ponta de contato fina concentra força (pressão), velocidade linear alta, borracha flat para manter o padrão flower, peso para fora para aumentar o torque. Leve = rápido; pesado = momento; pesado demais = lançamento fraco.
- **Upper Attack:** rampa que entra por baixo e levanta o adversário, tirando sua defesa; precisa de rotação alta e bey baixa.
- **Spin stealing / spin absorption ("Zombie"):** em rotações opostas, os contatos funcionam como engrenagens e a bey com menos rotação "puxa" giro da outra; contornos redondos e pontas com rolamento (bearing) ajudam. **Life After Death (LAD):** continuar girando deitada no fim; depende de um contorno inferior redondo (Wide Survivor).
- **Compact:** bey pesada com peso no centro (Ten Heavy + Heavy Metal Core) = rotação alta e difícil de desequilibrar.
- **Atrito da ponta:** quanto mais atrito, mais velocidade de deslocamento e mais perda de spin (grip > flat > semi-flat > ball > sharp > bearing); valores de referência em [`docs/BEYBLADES.md`](../docs/BEYBLADES.md).
- **Distribuição de peso no WD:** periferia aumenta o momento de inércia (I ≈ m·(r_int² + r_ext²)/2 para um anel), ou seja, mais stamina e mais força no choque; centro dá estabilidade e velocidade angular alta.

## Implicações para o nosso modelo

Proposta para os 7 atributos 1–10 (Ataque, Defesa, Stamina, Velocidade, Peso, Equilíbrio, Resistência a KO), combinando os stats oficiais por peça com as medidas físicas que o catálogo já guarda (`medidas`, `fisica`, `forma`).

**1. Guardar o oficial do jeito certo.**
- `stats_oficiais` deve vir das **estrelas Takara com meia estrela** (fonte obakeblader) e usar a wiki só como conferência. Onde as duas divergem por mais de 0,5 (ex.: War Lion), vale a Takara.
- Peças sem estrelas (Spin Gear comum, Bit Chip, Bit Protector) ficam `null` e não entram na soma oficial.
- Support Part: guardar as estrelas, mas não somar por padrão (a Takara não somava). No máximo, um bônus pequeno (×0,5).

**2. Soma oficial por eixo.**
`Of_X = AR_X + WD_X + (BB_X | RC_X | EG_X)` para X ∈ {A, D, S}. Nas beys estudadas cada eixo fica entre ~2 e ~12 (ex.: Dragoon GT A = 12; Master Dranzer A = 2; Draciel G S = 10). Normalizar para 1–10:
`of10(X) = clamp(1 + 9·(Of_X − 2)/10, 1, 10)`.

**3. Componente físico de cada eixo (0–1), calculado das medidas.**
- `massa` = peso total da bey; `I` = Σ momento de inércia das peças (o WD como anel; AR e base como discos/anéis pelo `forma`); `μ` = `fisica.atrito` da ponta; `recoil` e `tipo_contato` do AR.
- Física de Ataque: `fA = 0,35·contato(smash/upper/spike > slope > defesa) + 0,25·μ + 0,2·raio_contato_norm + 0,2·massa_norm − 0,2·recoil`.
- Física de Defesa: `fD = 0,4·massa_norm + 0,3·(1 − recoil) + 0,3·ponta_estável(ball/metal-ball/semi-flat)`.
- Física de Stamina: `fS = 0,5·I_norm + 0,3·(1 − μ) + 0,2·bônus_gimmick(bearing, free-shaft)`.

**4. Atributos finais (1–10).**

| Atributo | Fórmula proposta | Origem |
|---|---|---|
| **Ataque** | `0,6·of10(A) + 0,4·(1 + 9·fA)` | oficial + física |
| **Defesa** | `0,6·of10(D) + 0,4·(1 + 9·fD)` | oficial + física |
| **Stamina** | `0,6·of10(S) + 0,4·(1 + 9·fS)` | oficial + física |
| **Velocidade** | `1 + 9·(0,6·μ_norm + 0,25·(1 − massa_norm) + 0,15·padrão_movimento)` (flower/agressivo > órbita > centro) | só física (os jogos de GBA também tratam Speed à parte) |
| **Peso** | `1 + 9·(massa − 24)/(42 − 24)`, com clamp (plásticos ficam em ~25–42 g) | medida direta |
| **Equilíbrio** | `1 + 9·(0,4·WD_centro + 0,3·ponta_estável + 0,2·simetria_AR + 0,1·(1 − altura_norm))` | física |
| **Resistência a KO** | `1 + 9·(0,35·massa_norm + 0,25·fD + 0,2·μ_norm + 0,2·(1 − altura_norm)) − penalidade de recoil` | física + defesa |

Os pesos 0,6/0,4 dão prioridade à intenção da Takara e deixam a física desempatar beys com a mesma soma.

**5. Uso do resto.**
- **Tipo da bey** (attack/defense/endurance/balance): sai do maior `Of_X` (ou do texto oficial). O triângulo deve **surgir da física**: Attack bate e empurra; Stamina sobrevive mais que Defense; Defense devolve recoil ao Attack. No máximo, um multiplicador pequeno (±10%) se o teste mostrar que a física sozinha não basta.
- **Rotação** como recurso que se gasta (Sleep/Spin/RPM dos jogos): RPM inicial vem do lançador ([D-010](../docs/DECISIONS.md)); a perda por tempo vem da Stamina e do μ; a perda por choque vem do recoil e da diferença de Ataque/Defesa; a absorção de spin aparece em rotações opostas com AR redondo.
- **Magne Power / Engine Power:** atributos de gimmick (0–4 estrelas), usados como modificadores (atração/repulsão; liberação de rotação extra), não como eixo principal.
- **Bit Chip:** não altera atributos; só define fera, emblema e especial. Bit Protector idem (0,6 g).
- **Calibração:** quando a engenharia reversa do G-Revolution achar as tabelas de stats (`stats_gba`), comparar a ordem das beys com o nosso cálculo. As seis barras dos GBA japoneses (Sleep/Attack/Guard/Speed/Weight/Search) são uma segunda referência de como os criadores separavam os eixos (o Search pode virar o alcance de perseguição da IA).
- **`ajuste_anime`:** continua por cima do calculado, como diz a D-009.

## Fontes

- obakeblader (おばけブレーダー), estrelas Takara, pesos e textos por peça: [Attack Ring](http://obakeblader.com/2020/02/11/post-10640/), [Weight Disk](http://obakeblader.com/2021/06/26/post-16926/), [Blade Base/Running Core](http://obakeblader.com/2020/05/12/post-11931/), [Spin Gear/Engine Gear](http://obakeblader.com/2026/02/22/%E7%88%86%E8%BB%A2%E3%82%B7%E3%83%A5%E3%83%BC%E3%83%88%E3%83%99%E3%82%A4%E3%83%96%E3%83%AC%E3%83%BC%E3%83%89%E3%82%B9%E3%83%94%E3%83%B3%E3%82%AE%E3%82%A2%E3%83%BB%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%B3/), [性能一覧 (somas, "por peça é oficial")](http://obakeblader.com/2020/07/19/post-12253/), páginas por bey (ex.: [Dranzer V2](http://obakeblader.com/2018/10/16/post-2236/), [Draciel MS](http://obakeblader.com/2018/09/13/post-1837/), [Dragoon MS UV](http://obakeblader.com/2018/08/02/post-1508/))
- Beyblade Wiki (API, wikitext): [Template:Part Infobox](https://beyblade.fandom.com/wiki/Template:Part_Infobox), [Statistic](https://beyblade.fandom.com/wiki/Statistic), [Type](https://beyblade.fandom.com/wiki/Type), [Attack Ring - Cross Dranzer](https://beyblade.fandom.com/wiki/Attack_Ring_-_Cross_Dranzer), [Attack Ring - Spike Dragon](https://beyblade.fandom.com/wiki/Attack_Ring_-_Spike_Dragon), [Blade Base - Customize Clutch Base](https://beyblade.fandom.com/wiki/Blade_Base_-_Customize_Clutch_Base), [Weight Disk - Ten Balance](https://beyblade.fandom.com/wiki/Weight_Disk_-_Ten_Balance), [Attack Ring - War Lion](https://beyblade.fandom.com/wiki/Attack_Ring_-_War_Lion), [Weight Disk - Ten Wide](https://beyblade.fandom.com/wiki/Weight_Disk_-_Ten_Wide), [Attack Ring - Dragon Breaker](https://beyblade.fandom.com/wiki/Attack_Ring_-_Dragon_Breaker), [Attack Ring - Metal Attacker](https://beyblade.fandom.com/wiki/Attack_Ring_-_Metal_Attacker), [Running Core - Grip Flat Core](https://beyblade.fandom.com/wiki/Running_Core_-_Grip_Flat_Core), [Spin Gear System](https://beyblade.fandom.com/wiki/Spin_Gear_System), [Magnacore System](https://beyblade.fandom.com/wiki/Magnacore_System), [Engine Gear System](https://beyblade.fandom.com/wiki/Engine_Gear_System), [Hard Metal System](https://beyblade.fandom.com/wiki/Hard_Metal_System), [Dranzer V2](https://beyblade.fandom.com/wiki/Dranzer_V2), [File:Bey, 2002 Dranzer V2 stats & parts.png](https://beyblade.fandom.com/wiki/File:Bey,_2002_Dranzer_V2_stats_%26_parts.png) (metadados via `prop=imageinfo` e `list=allimages`), [Recoil](https://beyblade.fandom.com/wiki/Recoil), [Spin Equalization](https://beyblade.fandom.com/wiki/Spin_Equalization), [Smash Attack](https://beyblade.fandom.com/wiki/Smash_Attack), [Upper Attack](https://beyblade.fandom.com/wiki/Upper_Attack), [Weight Disk](https://beyblade.fandom.com/wiki/Weight_Disk), [Compact](https://beyblade.fandom.com/wiki/Compact), [Zombie](https://beyblade.fandom.com/wiki/Zombie)
- Jogos (wiki): [List of Beyblade Video Games](https://beyblade.fandom.com/wiki/List_of_Beyblade_Video_Games), [Beyblade Fighting Tournament](https://beyblade.fandom.com/wiki/Beyblade_Fighting_Tournament), [Gekitou! Saikyou Blader](https://beyblade.fandom.com/wiki/Bakuten_Shoot_Beyblade_-_Gekitou!_Saikyou_Blader), [Ikuze! Gekitou! Chou Jiryoku Battle!](https://beyblade.fandom.com/wiki/Bakuten_Shoot_Beyblade_2002_-_Ikuze!_Gekitou!_Chou_Jiryoku_Battle!), [Fierce Battle! Team Battle!!](https://beyblade.fandom.com/wiki/Bakuten_Shoot_Beyblade_2002_-_Fierce_Battle!_Team_Battle!!), [Beyblade: Let it Rip!](https://beyblade.fandom.com/wiki/Beyblade:_Let_it_Rip!), [VForce - Ultimate Blader Jam](https://beyblade.fandom.com/wiki/Beyblade_VForce_-_Ultimate_Blader_Jam), [GRevolution (Video Game)](https://beyblade.fandom.com/wiki/Beyblade_GRevolution_(Video_Game)), [VForce - Super Tournament Battle](https://beyblade.fandom.com/wiki/Beyblade_VForce_-_Super_Tournament_Battle)
- Blog de estratégia do GBA japonês: [ベイブレード2002 激戦チームバトル!! — ステータス関係](http://beyblade2002-team.blog.jp/archives/78951068.html)
- Screenshot local da tela de stats: `pesquisa-bakuten/personagens/bryan-kuznetsov/beyblades/falborg/referencia/pecas-gba-pecas-e-stats.png`
- PS1: [PSX Data Center, SLUS-01489](https://psxdatacenter.com/games/U/B/SLUS-01489.html); [GameFAQs, guias](https://gamefaqs.gamespot.com/ps/915143-beyblade-let-it-rip/faqs) (não acessível, 403)
- G-Revolution GBA: [Vizzed, tópico do jogo](https://www.vizzed.com/boards/thread.php?id=18711) (estrelas ATK/DEF/END, EXP da bey, RPM); [`docs/REVERSE_ENGINEERING.md`](../docs/REVERSE_ENGINEERING.md) (tipos e blader stats na ROM)
- Super Tournament Battle: [guia básico no speedrun.com](https://www.speedrun.com/beyblade_vforce_super_tournament_battle/guides/3qjnt) (HP, Spin 0–9999, Legend Power, citado via busca; página 403), [AbsolutCheats](https://www.absolutcheats.com/gcube/beyblade-super-tournament-battle-cheats) (peças "Gamma")
- Ultimate Blader Jam: [Nintendo World Report, review](https://nintendoworldreport.com/review/4209)
- Tipos: [Wikipedia, Beyblade](https://en.wikipedia.org/wiki/Beyblade)
