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
