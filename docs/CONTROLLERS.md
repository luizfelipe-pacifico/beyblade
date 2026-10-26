# Controles

Controle de referência: **DualShock 4 (PS4)**, dois jogadores ([D-001](DECISIONS.md#d-001-controle-principal-é-o-dualshock-4-ps4)). Teclado é fallback.

## Mapeamento "standard" do DualShock 4 na Gamepad API

Quando o navegador reconhece o controle, `gamepad.mapping === 'standard'` e os índices seguem o layout padrão do W3C:

| Índice | Botão PS4         | Índice | Botão PS4             |
| ------ | ----------------- | ------ | --------------------- |
| 0      | ✕ Cross           | 9      | Options               |
| 1      | ○ Circle          | 10     | L3 (clique analógico esq.) |
| 2      | □ Square          | 11     | R3 (clique analógico dir.) |
| 3      | △ Triangle        | 12     | D-pad ↑               |
| 4      | L1                | 13     | D-pad ↓               |
| 5      | R1                | 14     | D-pad ←               |
| 6      | L2 (analógico, `value` 0 a 1) | 15 | D-pad →          |
| 7      | R2 (analógico, `value` 0 a 1) | 16 | PS                |
| 8      | Share             | 17     | Clique do touchpad (nem todo navegador expõe) |

| Eixo | Significado                         |
| ---- | ----------------------------------- |
| 0    | Analógico esquerdo X (-1 esq., +1 dir.) |
| 1    | Analógico esquerdo Y (-1 cima, +1 baixo) |
| 2    | Analógico direito X                 |
| 3    | Analógico direito Y                 |

> Se `mapping` não for `'standard'` (acontece em alguns navegadores/sistemas), os índices podem ser diferentes. Por isso existe a tela de configuração de bindings por jogador.

## Mapeamento padrão das ações

Segue os comandos do jogo de GBA, confirmados nos textos de dica da ROM ([D-024](DECISIONS.md#d-024-controles-da-batalha-iguais-aos-do-jogo-de-gba), [`GAME_FLOW.md`](GAME_FLOW.md#controles-da-batalha-rom-e-proposta-para-o-dualshock-4)).

| Ação | DualShock 4 | Equivalente no GBA |
| --- | --- | --- |
| Mover | Analógico esquerdo e D-pad | Direcional |
| `attack` (segurar carrega) | ✕ | A |
| `defend` (segurar carrega) | ○ | B |
| `jump` | L1 (toque) | L |
| `dodge` | R1 (toque) | R |
| Fera bit | L1 + R1 segurados | L + R |
| Engine Gear | ✕ + ○ segurados | A + B |
| Combos depois de um "HIT!" | ↑↓✕ forte, ←→✕ médio, →←✕ fraco | ↑↓A, ←→A, →←A |
| `launch` | ✕ no ritmo (10 batidas) e analógico/direcional para a mira, D-049 | A |
| `pause` / entrar como P2 | Options | Start |

Fera bit, Engine Gear e combos são **combinações** de `attack`, `defend`, `jump`, `dodge` e direções, então não têm binding próprio: remapear os botões base remapeia as combinações. As ações aceitas nas configurações salvas (`src/validate.js`, `ACTIONS`) e as lidas pelo input (`src/input/frame.js`) já são estas.

Atualize esta tabela e registre em `DECISIONS.md` se o mapeamento padrão mudar.

## Teclado

Quem não tiver controle joga pelo teclado ([D-015](DECISIONS.md#d-015-jogo-completo-pelo-teclado-quando-não-há-controle)): batalha, menus e configurações. Os dois jogadores podem dividir o mesmo teclado, ou um usa o DualShock 4 e o outro o teclado.

### Mapeamento padrão

| Ação (botão do DualShock 4) | Jogador 1 (lado esquerdo) | Jogador 2 (lado direito) |
| --- | --- | --- |
| Mover | `W` `A` `S` `D` | Setas `↑` `←` `↓` `→` |
| `attack` (✕): ataque, confirmar, lançamento | `F` | `K` |
| `defend` (○): defesa, voltar | `G` | `L` |
| `jump` (L1) | `R` | `I` |
| `dodge` (R1) | `T` | `O` |
| Fera bit (L1 + R1) | `R` + `T` | `I` + `O` |
| Engine Gear (✕ + ○) | `F` + `G` | `K` + `L` |
| `pause` (Options) | `Esc` | `P` |
| Trocar aba (L1 / R1), fora da batalha | `Q` / `E` | — |

Implementado em `src/input/frame.js` (D-024, D-025). Na batalha, L1/R1 são pulo e esquiva, então as abas só trocam nos menus.

Atalhos de menu para qualquer jogador: `Enter` confirma e `Backspace` volta.

### Regras

- **Teclas por posição física** (`event.code`, ex.: `KeyW`), não pelo caractere (`event.key`). Assim o layout funciona igual em teclado ABNT2, US ou com acentos.
- **Ativação automática:** sem controle conectado na porta do jogador, o teclado dele já está ativo e a interface mostra as teclas (`F`, `R`...) no lugar de ✕, R2 etc. Com controle conectado, os dois continuam funcionando.
- **Movimento digital:** tecla vale 1 (sem analógico). Diagonal (`W`+`D`) é normalizada para o vetor ter tamanho 1, para não andar mais rápido na diagonal.
- **Teclas presas:** ao perder o foco da janela (`blur`), todas as teclas são soltas. Senão uma tecla segurada durante o Alt+Tab continuaria "apertada".
- **Campos de texto** (nome do jogador) não disparam ações: digitar "W" no nome não move a beyblade.
- **Teclas que rolam a página** (setas, espaço) têm o padrão do navegador bloqueado durante o jogo.
- **Remapeável** na tela de Controles (clique em "Adicionar" e aperte a tecla), salvo no banco junto com os bindings do controle. `Esc` cancela a captura, por isso não pode ser capturado como tecla.

### Limite do teclado (ghosting)

Teclados comuns, principalmente de notebook, não registram certas combinações de 3 ou mais teclas ao mesmo tempo (*key rollover* limitado). Com dois jogadores no mesmo teclado isso aparece como "a tecla não respondeu". O layout padrão separa os jogadores nos dois lados do teclado para reduzir o problema. Se acontecer, remapeie para outras teclas e anote aqui a combinação que falhou.

## Cuidados conhecidos

- **Deadzone:** analógicos do DualShock 4 raramente param exatamente em 0, ainda mais em controles usados. O valor é configurável por jogador (0 a 0,9).
- **L2/R2 são analógicos:** use `buttons[6|7].value` com um limiar (ex.: `> 0.5`) em vez de só `pressed`, se precisar de sensibilidade.
- **Vibração:** o DualShock 4 suporta `vibrationActuator` (`dual-rumble`) no Chrome/Edge; verifique antes de usar e respeite a opção `rumble`.
- **Light bar e touchpad** não são acessíveis pela Gamepad API (exigiriam WebHID); fora do escopo por enquanto.
- **Steam aberto** pode capturar o DualShock 4 (Steam Input) e alterar o que o navegador recebe; feche-o se o controle se comportar de forma estranha.
- **Ordem dos jogadores:** o `index` do gamepad depende da ordem de conexão. Identifique cada jogador pela configuração salva, e peça "pressione ✕ para entrar" se houver dúvida.
- **Conexão:** funciona via USB e Bluetooth. Ao reconectar, o índice pode mudar; trate `gamepaddisconnected` pausando a partida.

## Como testar

1. Conecte os dois DualShock 4 e abra `http://localhost:5000`.
2. Confirme em [gamepad-tester](https://hardwaretester.com/gamepad) ou no console (`navigator.getGamepads()`) que `mapping` é `'standard'`.
3. Teste cada ação para os dois jogadores, desconecte/reconecte um controle no meio da partida e confira a pausa.
