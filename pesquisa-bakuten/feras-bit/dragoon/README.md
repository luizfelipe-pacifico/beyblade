# Dragoon (ドラグーン): o dragão azul do vento

![Idle](idle.svg) ![Emblema](emblema.svg)

| Campo | Valor |
|---|---|
| Dono | Tyson Granger |
| Animal / elemento | Dragão / **vento** (wiki: "Spirit of Wind") |
| Inspiração | Seiryū (青龍, Qinglong), o Dragão Azul do Leste, um dos Quatro Símbolos. O nome junta "dragon" e "dragoon" |
| Beys | Dragoon S, F, V, V2, V2 High Power Custom, G, GT, MS, MS Ultimate Version (Grip Attacker e Master Dragoon não têm a fera) |

## Inspiração
Uma das quatro feras sagradas (com Dranzer, Driger e Draciel), as mais fortes do anime. Na história, Dragoon guarda a família de Tyson selado numa espada antiga; liberta-se para entrar na bey dele. É a única das quatro que nunca foi tomada por um adversário e, com o Dark Dragoon, a única fera que fala no anime.

## Aparência
- **Confirmado (wiki)**: dragão antropomórfico azul e turquesa; pescoço e cauda longos; pode ficar de pé sobre dois pés enormes com garras; braços longos com garras dispostas como dedos humanos; espinhos da cabeça pelas costas até a cauda (os Attack Rings das beys do Tyson são sempre pontudos por causa disso).
- **Por temporada**: na 1ª temporada as feras são espíritos monocromáticos (Dragoon turquesa claro); em V-Force ganha as cores do bit chip; em G-Revolution aparece só em vislumbres durante os especiais, às vezes só como a silhueta dentro do vento.
- **Interpretação de design no jogo (não confirmado em texto)**: corpo serpentino que sai de um redemoinho, ventre em placas turquesa, juba e bigodes brancos esvoaçantes, chifres cor de marfim voltados para trás, olhos vermelhos, ponta da cauda em tufo de vento.

## Personalidade
Guardião protetor e parceiro de igual para igual do Tyson; o laço entre os dois é o que liberta Dragoon do selo no filme *Fierce Battle*. Impetuoso como o dono: ataca de frente com tornados.

## Especiais por bey
| Bey | Especial | Visual no anime | Proposta no jogo |
|---|---|---|---|
| Dragoon S | Storm Attack | tornado em volta da bey, dragão dentro do vórtice | tornado de 4 s com knockback alto; bey quase parada |
| Dragoon F | Phantom Hurricane | furacão gigante | tornado grande de 5 s, dano contínuo |
| Dragoon V | Victory Tornado | investida guiada envolta em vórtice | dash guiado de 1,5 s |
| Dragoon V2 | Hyper Victory Tornado | investida com tornado de brilho vermelho | dash de 2 s, imune a recoil |
| Dragoon G | Galaxy Storm | tornado colossal que suga | tornado de 4 s que puxa e arremessa |
| Dragoon GT | Galaxy Turbo Twister | vários vórtices | tornado multivórtice em área grande |
| Dragoon MS | Evolution Storm | tornado que suga + mergulho do dragão | tornado de 2 s + dash muito forte |

Todos os ataques do Tyson são variações de tornado: no anime, a bey gira tão rápido que manipula o ar. Nomes japoneses dos golpes não foram levantados nesta pesquisa (ver READMEs das beys em `personagens/tyson-granger/`).

## Aparições marcantes
- S1 ep. 1–3: visão no selo da espada; entra na bey para salvar Kenny dos Blade Sharks.
- S1: empate contra Dranzer na segunda luta com Kai.
- S1 ep. 30: ofuscado pelo gigantesco Griffolyon de Robert.
- Filme *Fierce Battle*: selado na montanha e libertado pelo laço com Tyson.
- G-Rev ep. 51–52: rompe as trevas do Zeus com a força das feras dos amigos.

## Paleta
| Uso | Hex |
|---|---|
| Corpo (primária) | `#2a6fd1` / sombra `#1a449a` |
| Ventre e espinhos (secundária) | `#43d3c8` / sombra `#2a98a0` |
| Brilho / aura / vento | `#7fe9ff` |
| Juba e bigodes | `#eef7ff` / sombra `#a8c4e8` |
| Chifres | `#f4e3b0` / sombra `#c79f55` |
| Olhos | `#ff2f4a` |
| Contorno | `#0d1226` |

## Animações
- `emblema.svg`: cabeça de perfil, chifre, juba e bigode (azul, branco, contorno).
- `idle.svg` (3,2 s, loop): flutua sobre um redemoinho de 4 anéis girando (traços tracejados), respira, cabeça oscila e abre a boca, mechas da juba e bigodes ondulam separadamente, braços e cauda balançam, rajadas de vento e partículas sobem; aura pulsa.
- `invocacao.svg` (1,6 s, uma vez): coluna de luz e anel de choque na âncora; o dragão cresce da bey com overshoot, a cauda se desenrola, os braços abrem e ele ruge; aura e vento entram depois; termina na pose do idle.
- `ataque.svg` (1,1 s, loop): recua, avança mordendo e golpeando com as garras; funil de tornado à esquerda, três lâminas de vento em meia-lua e linhas de velocidade.
- Grupos animáveis: `aura`, `wind-back`, `wind-front`, `particles`, `tail`, `arm-right`, `body`, `head`, `jaw`, `mane`, `whiskers`, `arm-left`.

## Sons (`sons.json`)
- `invocacao` (2,6 s): estrondo grave + vento subindo (pink em bandpass varrendo) + assobio agudo; aos 1 s entra o rugido (saw com unison, growl, drive e formantes) com camada áspera em square e sub.
- `rugido` (1,8 s): rugido de dragão em camadas (corpo saw, aspereza square, sopro pink, sub) e cauda de vento.
- `ataque` (1,3 s): tornado com a frequência do filtro oscilando (giro do vento), impacto com noise em highpass + sub, rosnado curto.

## Fontes
- https://beyblade.fandom.com/wiki/Dragoon
- https://beyblade.fandom.com/wiki/Bit_Chip_-_Dragoon
- https://beyblade.fandom.com/wiki/List_of_Bit_Beasts
- READMEs/dados das beys em `pesquisa-bakuten/personagens/tyson-granger/beyblades/`
