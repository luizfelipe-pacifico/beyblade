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

## Mapeamento padrão das ações (proposta inicial)

| Ação      | DualShock 4                     |
| --------- | ------------------------------- |
| Mover     | Analógico esquerdo e D-pad      |
| `dash`    | ✕                               |
| `guard`   | ○                               |
| `special` | △                               |
| `launch`  | R2                              |
| `pause`   | Options                         |

Atualize esta tabela e registre em `DECISIONS.md` se o mapeamento padrão mudar.

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
