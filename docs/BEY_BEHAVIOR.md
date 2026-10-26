# Comportamento das beys na arena por tipo

Pedido do usuário (2026-10-25): cada tipo de beyblade tem um estilo de movimento próprio, e o jogo deve reproduzi-lo. Este doc é a **especificação** para a simulação (`src/sim/`). Os números são ponto de partida para calibrar no M1/M3 e ficam como multiplicadores sobre `PHYSICS` em `src/sim/constants.js`.

## O que o brinquedo faz (e o que o usuário pediu)

| Tipo | Ponta típica | Comportamento | Pedido do usuário |
| --- | --- | --- | --- |
| **Ataque** | flat, grip (borracha) | Muita tração: corre rápido pela borda (no *tornado ridge*) e corta pelo centro em "pétalas" (**padrão flor**), batendo forte. Gasta giro rápido e sofre recuo (risco de se jogar para fora). | "mais rápida, porém para mais cedo" |
| **Resistência** (stamina) | sharp, bearing | Pouca tração: a inclinação da tigela vence e ela fica **no centro**, quase parada no lugar. Gira por mais tempo. Não consegue subir até a borda. | "não consegue correr para as bordas, sempre puxada para o centro" |
| **Defesa** | bola (metal ball) | Puxada para o centro, mas a ponta de bola rola: **orbita um círculo pequeno em volta do centro** em vez de parar. Pesada, absorve impacto, recuo baixo. | "puxa para o centro, mas não fica fixa: gira em torno do círculo menor do centro" |
| **Equilíbrio** (balance) | semi-flat, troca de modo | Meio-termo: órbita na região do meio da tigela, mistura de ataque e resistência. | (complementa os outros três) |

Fontes: [Beyblade Wiki: Type](https://beyblade.fandom.com/wiki/Type), [Beyblade Wiki: Balance](https://beyblade.fandom.com/wiki/Balance), [Wikipedia: Beyblade](https://en.wikipedia.org/wiki/Beyblade) (triângulo de vantagens e estádio em tigela), [Beyblade Wiki: Beystadium Super Attack Type](https://beyblade.fandom.com/wiki/Beystadium_Super_Attack_Type) e [Tornado Beystadium](https://beyblade.fandom.com/wiki/Tornado_Beystadium) (padrão flor e tornado ridge), [WorldBeyblade: Attack vs Defence vs Stamina vs Balance](https://worldbeyblade.org/Thread-Answered-Attack-vs-Defence-vs-Stamina-vs-Balance-in-Burst).

**Triângulo de vantagens:** detalhado em [Vantagens entre os tipos](#vantagens-entre-os-tipos-pesquisa-em-fóruns-e-wikis).

## Vantagens entre os tipos (pesquisa em fóruns e wikis)

### O triângulo e o porquê

| Confronto | Por que um vence o outro | Como reproduzir no jogo |
| --- | --- | --- |
| **Ataque > Resistência** | A de resistência é leve e de pouco atrito: fica no centro como alvo parado e voa ou cai com um golpe forte. | Golpe de ataque em alvo de resistência tem impulso maior (massa e resistência a knockout menores); a de resistência não foge porque não tem tração. |
| **Resistência > Defesa** | A defesa é pesada, e peso gasta giro mais rápido; a de resistência, leve e com pouco atrito, dura mais. "Peso é poder de defesa e fraqueza de resistência ao mesmo tempo." | A defesa perde giro mais rápido que a resistência; como as duas ficam perto do centro e quase não se derrubam, a rodada vai para Parada a favor da resistência. |
| **Defesa > Ataque** | A defesa fica no estádio sob impacto; o ataque gasta giro rápido e "muitas vezes perde se autodestruindo" (recuo que joga para fora). A Grip Defense, com ponta de borracha, é o melhor contra o ataque hiper-agressivo. | Recuo do atacante maior contra alvo pesado e de recuo baixo; a defesa absorve (massa ×1,5, recuo ×0,5) e o ataque arrisca o ring out próprio. |
| **Equilíbrio** | Fica **fora do triângulo**: não tem vantagem nem fraqueza fixa; vai bem contra combos fracos e serve para se adaptar ao adversário. | Atributos medianos; matchup neutro contra todos. |

O triângulo **não é regra rígida**: peças, lançamento e habilidade mudam o resultado ([Wikipedia](https://en.wikipedia.org/wiki/Beyblade)). Exceções conhecidas: resistência de formato circular e centro de gravidade baixo aguenta ataque; upper attack derruba quase qualquer tipo que consiga "pegar por baixo".

### Sentido de rotação

- **Mesma rotação:** no ponto de contato as superfícies andam em sentidos opostos → choques mais fortes e **mais recuo** → mais ring out (de quem apanha e de quem bate). Melhor para quem quer derrubar; a defesa por peso vai bem aqui.
- **Rotação oposta:** choques mais fracos e **menos recuo**, mas há **absorção/equalização de giro** (os contatos funcionam como engrenagens e dividem o giro). A rodada fica mais longa e vence quem tem mais *life after death* (resistência ao fim do giro). É a base das combinações "zumbi" da era plástica ("spin steal"). O anime vendia isso como truque das beys de rotação esquerda, mas acontece entre quaisquer duas de rotação oposta ([Beyblade Wiki: Spin Absorption](https://beyblade.fandom.com/wiki/Spin_Absorption)).
- **Gyro EG** (Engine Gear com giroscópio): é "praticamente impossível roubar giro" dela ([PlasticsDB](https://www.plasticsdb.com/competitive-combos-list)).

### Subtipos da era plástica (Bakuten Shoot)

| Arquétipo | Vence | Perde para | Observação |
| --- | --- | --- | --- |
| Smash Attack | quase tudo na força bruta | Grip Defense | risco × recompensa; precisa controlar o recuo |
| Upper Attack | quase tudo que consegue levantar por baixo | Circle Survivor | ruim em rotação direita contra a tigela funda |
| Spin-Stealing Attack / zumbi ofensivo | quem consegue desestabilizar e superar no giro | — | usar rotação oposta |
| Grip Defense | ataque mais pesado e hiper-agressivo | resistência que supera no giro | o anel de ataque sofre (pode quebrar) |
| Weight Defense | confrontos de mesma rotação | adversários de recuo pesado | clássica |
| Circle Survivor Defense | combos fracos, muito difícil de derrubar | golpes acima do prato | |
| Zumbi (resistência) | rotação oposta, pelo *life after death* | equilíbrio que derruba; Circle Survivor | |
| Compacts (equilíbrio) | combos fracos e defesas fracas | combos competitivos feitos contra eles | |

Fontes: [WorldBeyblade: type chart](https://worldbeyblade.org/Thread-Answered-Beyblade-type-chart), [WorldBeyblade: Attack vs Defence vs Stamina vs Balance](https://worldbeyblade.org/Thread-Answered-Attack-vs-Defence-vs-Stamina-vs-Balance-in-Burst), [WorldBeyblade: How to Cover All Types Weaknesses](https://worldbeyblade.org/Thread-How-to-Cover-All-Types-Weaknesses), [PlasticsDB: Competitive Combos List](https://www.plasticsdb.com/competitive-combos-list), [note.com: Type Matchups](https://note.com/kamen_a/n/n6c541b32ba7e?hl=en), [Beyblade Wiki: Spin Absorption](https://beyblade.fandom.com/wiki/Spin_Absorption), [Beyblade Wiki: Geist Fafnir](https://beyblade.fandom.com/wiki/Geist_Fafnir_Ratchet_Gyro).

### Regras de jogo derivadas (proposta)

As vantagens saem da física (massa, tração, recuo, perda de giro, rotação), não de um bônus fixo por tipo. Ajustes sugeridos, em cima da tabela do modelo abaixo:

- **Impulso do golpe** proporcional a ataque × velocidade relativa; × **1,3** em mesma rotação e × **0,8** em rotação oposta (já previsto em `pesquisa-bakuten/README.md`).
- **Recuo do atacante** × **1,3** em mesma rotação e × **0,7** em oposta; contra alvo de massa maior, o recuo cresce na proporção das massas.
- **Equalização de giro** só em rotação oposta: a cada contato, transfere `(giroA − giroB) × 0,05` da mais rápida para a mais lenta, multiplicado pelo *life after death* de quem recebe (resistência ×1,3, defesa ×1,0, ataque ×0,7).
- **Perda de giro pelo peso:** `spinDecay × (0,85 + 0,05 × peso)` (peso 1–10), o que faz a defesa perder para a resistência na Parada.
- **Upper attack:** golpe de anel do tipo upper levanta o alvo (perde tração por ~0,3 s e fica mais fácil de jogar para fora); contra Circle Survivor (Wolborg 4) o efeito é anulado.
- **Gyro EG** (Thunder Pegasus na ROM): imune à equalização.
- **Alvo de balanceamento** (matriz do M4, simulações sem input com giro inicial igual): ataque vence resistência em ~65–75%, resistência vence defesa em ~65–75%, defesa vence ataque em ~65–75%, equilíbrio entre 45% e 55% contra todos.

## Modelo para a simulação

Cada bey ganha um **alvo de órbita** (raio preferido, em fração do raio da arena) e um conjunto de multiplicadores. A força de "órbita" do protótipo passa a puxar a bey para o seu raio-alvo em vez de um raio único; o jogador desloca a bey a partir desse comportamento-base (o controle soma a ele, não o substitui).

| Parâmetro | Ataque | Equilíbrio | Defesa | Resistência |
| --- | --- | --- | --- | --- |
| Raio-alvo da órbita (fração do raio da arena) | 0,80 (borda) com mergulhos ao centro | 0,45–0,55 | 0,15–0,20 (círculo pequeno) | 0,00–0,06 (centro) |
| Padrão | flor: a cada ~1,2 s de borda, mergulha pelo centro e volta | órbita média, mergulho ocasional | órbita curta e constante em volta do centro | quase parada, leve precessão |
| Puxão da tigela para o centro (`bowlPull`) | ×0,6 | ×1,0 | ×1,4 | ×2,2 |
| Tração / controle do jogador (`control`) | ×1,4 | ×1,0 | ×0,7 | ×0,45 |
| Raio máximo que consegue alcançar | 1,0 (pode sair pelos bolsos) | 0,85 | 0,55 | 0,35 (nunca chega à borda) |
| Velocidade máxima (`maxSpeed`) | ×1,35 | ×1,0 | ×0,75 | ×0,55 |
| Perda de giro (`spinDecay`) | ×1,6 (para mais cedo) | ×1,0 | ×0,9 | ×0,55 (gira mais tempo) |
| Recuo próprio ao bater | ×1,4 | ×1,0 | ×0,5 | ×0,8 |
| Massa efetiva / resistência a empurrão | ×0,9 | ×1,0 | ×1,5 | ×1,0 |

Os multiplicadores se combinam com os atributos da bey (1–10, do catálogo e da ROM via `gbaOverlay`): uma bey de ataque com stamina 6 decai menos que uma com stamina 3, mas ainda mais que uma de resistência.

**Ponta manda mais que o rótulo.** O tipo da bey vem do catálogo, mas a ponta (`ponta` em `dados.json`: sharp, semi-flat, flat, grip, bola) é o que define o movimento no brinquedo. Regra sugerida: usar a ponta para escolher a coluna; o tipo só desempata. Beys com troca de modo (Dranzer S/F/V, Driger F, Dranzer V2) trocam de coluna quando o modo muda (ex.: Customize Clutch da Dranzer V2 passa de resistência para ataque abaixo de ~55% de giro, ver `BEYBLADES.md`).

**Fim de rodada:** com menos de ~20% de giro todas as beys perdem tração e "bambeiam" (*wobble*); a de resistência é a que mais demora a chegar lá. Isso já cria o "para mais cedo" do ataque sem regra especial.

## Física da tigela (arena funda)

O usuário notou que a bey "corre muito, como se a arena fosse plana". Causa no protótipo (`src/sim/match.js`): um empurrão tangencial **constante** (`PHYSICS.orbit`) injeta energia o tempo todo e a tigela puxa pouco (`bowlPull = 4 s⁻²`) perto das velocidades usadas. Numa tigela de verdade não existe motor: quem move a bey é a **gravidade na rampa** e o **atrito da ponta que gira**.

### O que a física diz

1. **A tigela é um poço de energia.** Subir a rampa troca velocidade por altura e descer devolve. Uma bey solta perto da borda desce acelerando, passa rápido pelo centro, sobe do outro lado freando e volta, como um pêndulo. Para um perfil parabólico `h(r) = d · (r/R)²` (profundidade `d` na borda de raio `R`), a aceleração horizontal é `a = −g · h′(r) = −(2 g d / R²) · r`: um oscilador com `ω₀ = √(2 g d) / R`. Os estádios reais têm a borda mais íngreme (parede/*tornado ridge*), por isso o termo cresce perto de `R`.
2. **A ponta é o "motor".** Em rampa, o eixo da bey inclina na direção da descida e ela passa a encostar a borda da ponta no chão. A borda gira com a bey e, com atrito, empurra a bey **de lado** (perpendicular à rampa), no sentido definido pela rotação. Isso gera a órbita em volta do centro. A força tem teto no atrito: `|F| ≤ μ · m · g`.
   - **Ponta fina (sharp):** quase sem borda e atrito baixo → quase não há empurrão lateral; a gravidade vence e ela escorrega para o centro e fica (resistência).
   - **Bola:** rola em vez de escorregar → pouco empurrão; desce para o centro e roda num círculo pequeno (defesa).
   - **Flat:** borda larga → empurrão forte → órbita larga e rápida; combinada com a oscilação da tigela vira o **padrão flor**.
   - **Grip/borracha:** atrito muito alto → empurrão máximo, mas gasta giro mais rápido (ataque).
   Explicações de fãs batem com isso: a bey tenta manter o centro de massa acima da ponta e "segue as curvas do piso"; uma ponta redonda escorrega para o centro e fica estável, uma flat não consegue ficar parada na rampa ([WorldBeyblade: The Physics of Beyblades](https://worldbeyblade.org/Thread-The-Physics-of-Beyblades), [Mall of Toys: How Beyblades Work](https://malloftoys.com/blogs/news/how-beyblades-work), [Toys Japan: The Science of Beyblade](https://toys-japan.com/the-science-of-beyblade-physics-in-action/)).
3. **Giro baixo = inclinação maior.** A precessão de um pião é mais rápida quanto menor o giro (`Ω = m g l / (I ω)`); com pouco giro o eixo inclina mais, a borda da ponta encosta mais e o movimento fica largo e errático (o "bambear" do fim da batalha) até cair. Piões de ponta arredondada precessionam em volta de um eixo fora deles e espiralam para dentro ([Cross, *The rise and fall of spinning tops*](https://www.researchgate.net/publication/258757498_The_rise_and_fall_of_spinning_tops); [Hantz e Lázár, Frontiers in Physics 2019](https://www.frontiersin.org/journals/physics/articles/10.3389/fphy.2019.00005/full)). Em plano inclinado, um pião girando segue uma trajetória **em ângulo com a rampa**, não reto morro abaixo ([Barthmann e Fischer, J. Phys. Commun. 2021](https://epub.uni-bayreuth.de/6528/1/Barthmann_2021_J._Phys._Commun._5_085003.pdf)).
4. **Atrito de deslizamento** sempre freia a velocidade em relação ao piso (`μ_k · g`). Sem o empurrão da ponta, toda bey acaba parada no ponto mais baixo, o centro.

Não há medida publicada da profundidade dos estádios; os números abaixo são de calibração.

### Modelo proposto para `src/sim/`

Por subpasso, em unidades do mundo (mm, s), com `g = 9810 mm/s²`:

```
// 1) gravidade na tigela (substitui bowlPull): perfil parabólico com borda mais íngreme
k      = 2 · g · depth / R²                         // depth ≈ 0,07·R → ω₀ ≈ 3,7 rad/s (período ≈ 1,7 s)
a_bowl = −k · r · (1 + rim · (r/R)⁴)                // rim ≈ 2: a rampa fica bem mais íngreme perto da parede

// 2) empurrão da ponta (substitui o orbit constante): lateral à rampa, sentido pela rotação
tilt   = clamp(slope(r) + wobble(spin), 0, maxTilt) // slope = |h′(r)|; wobble cresce quando spin < ~0,3
a_tip  = tipDrive · spin · tilt · g · tangente(dir) // tangente perpendicular a r; dir = +1 direita, −1 esquerda
a_tip  limitado por μ_tip · g                       // teto do atrito

// 3) atrito de deslizamento
a_fric = −μ_slide · g · v̂                          // freia sempre; zera só quando v → 0

// 4) jogador: inclina a bey (soma ao movimento, não é um carro)
a_ctrl = input · control · μ_tip · g                // também limitado pela tração da ponta
```

| Ponta | `tipDrive` | `μ_tip` (tração) | `μ_slide` | Resultado esperado |
| --- | --- | --- | --- | --- |
| sharp | 0,05 | 0,08 | 0,04 | escorrega e fica no centro |
| bola | 0,20 | 0,15 | 0,03 (rola) | círculo pequeno em volta do centro |
| semi-flat | 0,45 | 0,30 | 0,08 | órbita média |
| flat | 0,70 | 0,45 | 0,10 | órbita larga, padrão flor |
| grip | 0,90 | 0,80 | 0,12 | mais agressiva; perde giro mais rápido (multiplicar `spinDecay` pela tração) |

Esses parâmetros substituem boa parte dos multiplicadores por tipo da tabela acima: o comportamento de cada tipo **sai da ponta e da tigela**. Os multiplicadores ficam só para o que a ponta não explica (massa, recuo).

### Como mostrar a profundidade no 2D (e no 3D depois)

- **Sombreamento radial da tigela** (mais escuro no fundo ou na borda) e linhas concêntricas, para o jogador ler a rampa.
- **Altura da bey** `h(r)` usada no desenho: quanto mais alta na rampa, sombra mais deslocada e sprite levemente maior (câmera de cima); ao descer, ela "afunda". No 3D (D-006) a mesma `h(r)` vira a coordenada vertical.
- **Rastro** curto: no topo da rampa fica curto (bey lenta) e no fundo fica longo (bey rápida), deixando visível a troca entre altura e velocidade.

### Testes do modelo

- **Energia:** sem ponta, sem atrito e sem input, a soma `½v² + g·h(r)` fica constante (erro < 1% em 10 s).
- **Pêndulo:** solta parada em `0,8R` sem ponta, cruza o centro e volta perto de `0,8R` do outro lado em ~meio período.
- **Fundo:** com atrito e sem ponta, para no centro.
- **Por ponta:** sharp termina em `r < 0,1R`; bola oscila entre `0,1R` e `0,3R`; flat passa a maior parte do tempo acima de `0,5R` e cruza o centro (flor).

## Testes sugeridos (simulação determinística, sem DOM)

- Sem input, uma bey de resistência sozinha fica a menos de 0,1 do raio da arena do centro durante toda a rodada.
- Sem input, uma de defesa fica entre 0,1 e 0,3 e não para no centro (a distância média varia).
- Sem input, uma de ataque passa a maior parte do tempo acima de 0,6 e cruza o centro periodicamente (padrão flor).
- Com o mesmo giro inicial, a ordem de parada é ataque → equilíbrio → defesa → resistência.

## Aparência da arena: estilo Beyblade Burst

O usuário pediu a arena com a coloração da Beyblade Burst. O estádio da Burst é **azul**: o da Hasbro (B9499, 2016) é azul ([eBay B9499](https://www.ebay.com/itm/265594458938)) e os da Takara Tomy são azul translúcido ([DB Standard](https://beyblade.fandom.com/wiki/Beystadium_DB_Standard_Type)). Proposta para o renderizador (cores finais nos tokens do design system, D-018):

- **Tigela** em azul com degradê radial: mais claro e translúcido no centro, mais saturado e escuro perto da borda (passa a ideia de profundidade da tigela).
- **Tornado ridge** como um anel claro (branco/ciano) perto da borda; linhas finas brancas radiais e um círculo central marcado, como no plástico do brinquedo.
- **Parede** em azul mais escuro com borda clara; **bolsos de saída** em tom escuro, contrastando com a tigela.
- Camada estática, desenhada uma vez em cache (ARCHITECTURE §8), sem `shadowBlur` por frame.
