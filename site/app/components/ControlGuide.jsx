'use client';

import { useRef, useState } from 'react';
import { Gamepad2, Keyboard } from 'lucide-react';
import { PsButton } from './PsButtons';

const INPUTS = [
  { id: 'pad', label: 'Controle de PS4', Icon: Gamepad2 },
  { id: 'keyboard', label: 'Teclado', Icon: Keyboard },
];
const ACTIONS = [
  ['Mover', 'Analógico ou direcional', 'W A S D', '↑ ← ↓ →'],
  ['Lançar', 'R2', 'R', 'I'],
  ['Investida', 'cross', 'F', 'K'],
  ['Defender', 'circle', 'G', 'L'],
  ['Especial', 'triangle', 'H', 'J'],
  ['Pausar', 'Options', 'Esc', 'P'],
];

export default function ControlGuide() {
  const [input, setInput] = useState(0);
  const tabs = useRef([]);
  const keyboard = input === 1;

  function onKeyDown(event) {
    const next = { ArrowRight: 1 - input, ArrowLeft: 1 - input, Home: 0, End: 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setInput(next);
    tabs.current[next].focus();
  }

  return (
    <div className="control-guide">
      <div className="input-tabs" role="tablist" aria-label="Ver comandos por dispositivo" onKeyDown={onKeyDown}>
        {INPUTS.map(({ id, label, Icon }, i) => (
          <button key={id} ref={(el) => { tabs.current[i] = el; }} type="button" role="tab"
            id={`input-${id}`} aria-controls="input-commands" aria-selected={input === i}
            tabIndex={input === i ? 0 : -1} onClick={() => setInput(i)}>
            <Icon size={20} aria-hidden="true" />{label}
          </button>
        ))}
      </div>
      <div id="input-commands" role="tabpanel" tabIndex={0} aria-labelledby={`input-${INPUTS[input].id}`}>
        <table className="command-table">
          <caption className="sr-only">Mapeamento padrão planejado para {INPUTS[input].label}</caption>
          <thead><tr><th scope="col">Ação</th><th scope="col">{keyboard ? 'Jogador 1' : 'Comando'}</th>{keyboard && <th scope="col">Jogador 2</th>}</tr></thead>
          <tbody>
            {ACTIONS.map(([action, pad, p1, p2]) => (
              <tr key={action}>
                <th scope="row">{action}</th>
                {keyboard ? <><td><kbd>{p1}</kbd></td><td><kbd>{p2}</kbd></td></> : (
                  <td>{['cross', 'circle', 'triangle'].includes(pad)
                    ? <PsButton name={pad} size={24} /> : <span>{pad}</span>}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="input-note small">{keyboard
          ? 'Enter confirma e Backspace volta nos menus. Os dois jogadores podem dividir o teclado.'
          : 'O mesmo mapeamento para os dois jogadores. Conecte os controles por USB ou Bluetooth.'}</p>
      </div>
      <p className="small input-note">Comandos planejados, com remapeamento por jogador. Também será possível combinar controle e teclado.</p>
    </div>
  );
}
