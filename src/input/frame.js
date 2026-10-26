// Conversão pura de controle e teclado em InputFrame (ARCHITECTURE.md §6). Sem DOM: testável em Node.
// Mapas padrão de docs/CONTROLLERS.md (D-001, D-015).

export const ACTIONS = ['attack', 'defend', 'jump', 'dodge', 'pause', 'confirm', 'back', 'prevTab', 'nextTab'];

// Teclado (D-015) espelhando os botões da D-024: F/K = ✕, G/L = ○, R/I = L1, T/O = R1, Esc/P = Options.
// Troca de aba só pelo P1 (Q/E) para não colidir com a esquiva do P2 no O.
export const KEYBOARD = [
  {
    up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD',
    attack: ['KeyF'], defend: ['KeyG'], jump: ['KeyR'], dodge: ['KeyT'], pause: ['Escape'],
    confirm: ['KeyF', 'Enter'], back: ['KeyG', 'Backspace'], prevTab: ['KeyQ'], nextTab: ['KeyE'],
  },
  {
    up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
    attack: ['KeyK'], defend: ['KeyL'], jump: ['KeyI'], dodge: ['KeyO'], pause: ['KeyP'],
    confirm: ['KeyK'], back: ['KeyL'], prevTab: [], nextTab: [],
  },
];

// Índices do mapeamento "standard" do DualShock 4 (CONTROLLERS.md, D-024).
const PAD = { attack: [0], defend: [1], jump: [4], dodge: [5], pause: [9], confirm: [0], back: [1], prevTab: [4], nextTab: [5] };
const DPAD = { up: 12, down: 13, left: 14, right: 15 };
const TRIGGER_THRESHOLD = 0.5;

export const DEFAULT_DEADZONE = 0.2;

// Zona morta radial: mede o vetor inteiro, não cada eixo, e reescala para não "pular" na borda.
export function radialDeadzone(x, y, deadzone = DEFAULT_DEADZONE) {
  const m = Math.hypot(x, y);
  if (m <= deadzone) return { x: 0, y: 0 };
  const scaled = Math.min(1, (m - deadzone) / (1 - deadzone));
  return { x: (x / m) * scaled, y: (y / m) * scaled };
}

const pressedButton = (b) => Boolean(b && (b.pressed || b.value > TRIGGER_THRESHOLD));

function normalize(x, y) {
  const m = Math.hypot(x, y);
  return m > 1 ? { x: x / m, y: y / m } : { x, y };
}

export function readPad(pad, deadzone = DEFAULT_DEADZONE) {
  if (!pad) return null;
  const buttons = pad.buttons ?? [];
  let move = radialDeadzone(pad.axes?.[0] ?? 0, pad.axes?.[1] ?? 0, deadzone);
  const dx = (pressedButton(buttons[DPAD.right]) ? 1 : 0) - (pressedButton(buttons[DPAD.left]) ? 1 : 0);
  const dy = (pressedButton(buttons[DPAD.down]) ? 1 : 0) - (pressedButton(buttons[DPAD.up]) ? 1 : 0);
  if (dx || dy) move = normalize(dx, dy);
  const held = {};
  for (const [action, indices] of Object.entries(PAD)) held[action] = indices.some((i) => pressedButton(buttons[i]));
  return { move, held };
}

export function readKeys(keys, map) {
  const has = (code) => keys.has(code);
  // Diagonal com duas teclas tem tamanho 1: não anda mais rápido na diagonal.
  const move = normalize((has(map.right) ? 1 : 0) - (has(map.left) ? 1 : 0), (has(map.down) ? 1 : 0) - (has(map.up) ? 1 : 0));
  const held = {};
  for (const action of ACTIONS) held[action] = (map[action] ?? []).some(has);
  return { move, held };
}

// Junta controle e teclado do mesmo jogador (os dois valem ao mesmo tempo) e calcula as bordas.
export function makeFrame(sources, prevHeld = {}) {
  const live = sources.filter(Boolean);
  let move = { x: 0, y: 0 };
  for (const s of live) if (Math.hypot(s.move.x, s.move.y) > Math.hypot(move.x, move.y)) move = s.move;
  const held = {};
  const pressed = {};
  for (const action of ACTIONS) {
    held[action] = live.some((s) => s.held[action]);
    pressed[action] = held[action] && !prevHeld[action];
  }
  return { move, held, pressed };
}
