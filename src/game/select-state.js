// Máquina de estados da seleção estilo Street Fighter (D-023). Pura: sem DOM, sem relógio, testável em Node.
// Fluxo: cada vaga escolhe personagem → bey (carrossel) → pronta. O P2 entra apertando Start (Options) a
// qualquer momento da seleção; se não entrar, o P1 escolhe personagem e bey da CPU. Depois o P1 escolhe a arena.

export const RANDOM_CARD = 'aleatorio';
export const RANDOM_STAGE = 'aleatoria';

const emptySlot = (cursor = 0) => ({ step: 'character', cursor, character: null, randomPick: false, beyCursor: 0, bey: null });

// characters: lista de { slug }; beysOf(slug) → lista de slugs de bey (a primeira é a padrão).
// mode (D-005): 'versus' (P2 pode entrar), 'cpu' e 'treino' (P1 escolhe o adversário, P2 não entra) e
// 'arcade' (P1 escolhe só o próprio personagem e bey; os oponentes vêm da escada de src/game/arcade.js).
export function createSelect({ characters, beysOf, stages = 6, cols = 6, mode = 'versus' }) {
  return {
    characters: characters.map((c) => c.slug),
    beys: Object.fromEntries(characters.map((c) => [c.slug, beysOf(c.slug)])),
    stages,
    cols,
    mode,
    slots: [emptySlot(0), emptySlot(Math.min(1, characters.length - 1))],
    p2: 'none',
    phase: 'select',
    stageCursor: 0,
    stage: null,
    exit: false,
  };
}

// Quantidade de cards na grade: todos os personagens + Aleatório (o último).
export const cardCount = (s) => s.characters.length + 1;
export const isRandomCard = (s, index) => index === s.characters.length;

// Quem controla cada vaga agora: a vaga 1 é do P2 humano ou, sem ele, do P1 depois de terminar a própria.
export function controllerOf(s, slot) {
  if (slot === 0) return 0;
  if (s.p2 === 'human') return 1;
  if (s.p2 === 'cpu') return 0;
  return null;
}

// Vaga que um jogador está editando agora (ou null).
export function activeSlot(s, player) {
  if (s.phase !== 'select') return null;
  if (player === 1) return s.p2 === 'human' ? 1 : null;
  if (s.slots[0].step !== 'ready') return 0;
  return s.p2 === 'cpu' && s.slots[1].step !== 'ready' ? 1 : null;
}

const setSlot = (s, i, patch) => ({ ...s, slots: s.slots.map((slot, j) => (j === i ? { ...slot, ...patch } : slot)) });

function moveCursor(s, cursor, dir) {
  const n = cardCount(s);
  if (dir === 'left') return (cursor - 1 + n) % n;
  if (dir === 'right') return (cursor + 1) % n;
  if (dir === 'up') return cursor - s.cols >= 0 ? cursor - s.cols : cursor;
  if (dir === 'down') return Math.min(n - 1, cursor + s.cols);
  return cursor;
}

// Depois de cada confirmação: libera a CPU para o P1 ou passa para a escolha de arena.
function advance(s) {
  const [a, b] = s.slots;
  if (a.step === 'ready' && s.mode === 'arcade') return { ...s, phase: 'done' };
  if (a.step === 'ready' && s.p2 === 'none') return { ...s, p2: 'cpu' };
  if (a.step === 'ready' && b.step === 'ready') return { ...s, phase: 'stage' };
  return s;
}

function confirmSlot(s, i, rng) {
  const slot = s.slots[i];
  if (slot.step === 'character') {
    const randomPick = isRandomCard(s, slot.cursor);
    const index = randomPick ? Math.floor(rng() * s.characters.length) : slot.cursor;
    return setSlot(s, i, { step: 'bey', character: s.characters[index], randomPick, beyCursor: 0 });
  }
  if (slot.step === 'bey') {
    const list = s.beys[slot.character] ?? [];
    return advance(setSlot(s, i, { step: 'ready', bey: list[slot.beyCursor] ?? null }));
  }
  return s;
}

function backSlot(s, i) {
  const slot = s.slots[i];
  if (slot.step === 'ready') return setSlot(s, i, { step: 'bey', bey: null });
  if (slot.step === 'bey') return setSlot(s, i, { step: 'character', character: null, randomPick: false });
  return s;
}

// Aplica uma ação de um jogador. action: 'left' | 'right' | 'up' | 'down' | 'confirm' | 'back' | 'start'.
// rng() devolve um número em [0, 1) (Aleatório); injetado para os testes serem determinísticos.
export function reduceSelect(s, player, action, rng = Math.random) {
  if (s.phase === 'done' || s.exit) return s;

  if (s.phase === 'stage') {
    if (player !== 0) return s;
    const total = s.stages + 1;
    if (action === 'left') return { ...s, stageCursor: (s.stageCursor - 1 + total) % total };
    if (action === 'right') return { ...s, stageCursor: (s.stageCursor + 1) % total };
    if (action === 'confirm') {
      // Aleatória fica para a batalha sortear (entre os cenários); o resto é um estádio da ROM.
      const stage = s.stageCursor === s.stages ? RANDOM_STAGE : s.stageCursor;
      return { ...s, stage, phase: 'done' };
    }
    if (action === 'back') return { ...setSlot(s, 1, { step: 'bey', bey: null }), phase: 'select' };
    return s;
  }

  // Start do 2º controle: entra o P2 humano, mesmo que o P1 já esteja escolhendo a CPU.
  if (action === 'start' && player === 1 && s.p2 !== 'human' && s.mode === 'versus') {
    return { ...setSlot(s, 1, emptySlot(s.slots[1].cursor)), p2: 'human' };
  }

  const i = activeSlot(s, player);
  if (i === null) {
    // P2 pronto ainda pode cancelar; o P1 pode desfazer a própria escolha enquanto a CPU não começou.
    if (action === 'back' && player === 1 && s.p2 === 'human') return backSlot(s, 1);
    if (action === 'back' && player === 0 && s.slots[0].step === 'ready') return backSlot(s, 0);
    return s;
  }
  const slot = s.slots[i];

  if (action === 'confirm') return confirmSlot(s, i, rng);

  if (action === 'back') {
    if (slot.step !== 'character') return backSlot(s, i);
    // Voltar na escolha da CPU devolve o P1 para a própria bey; voltar na própria grade sai da tela.
    if (i === 1 && s.p2 === 'cpu') return { ...setSlot(s, 0, { step: 'bey', bey: null }), p2: 'none' };
    if (i === 1 && s.p2 === 'human') return { ...s, p2: 'none', slots: [s.slots[0], emptySlot(s.slots[1].cursor)] };
    return { ...s, exit: true };
  }

  if (slot.step === 'character') return setSlot(s, i, { cursor: moveCursor(s, slot.cursor, action) });

  if (slot.step === 'bey' && (action === 'left' || action === 'right')) {
    const n = (s.beys[slot.character] ?? []).length || 1;
    const beyCursor = (slot.beyCursor + (action === 'left' ? n - 1 : 1)) % n;
    return setSlot(s, i, { beyCursor });
  }
  return s;
}

// Link da batalha (contrato de app/(jogo)/batalha/page.js): p1, p2, b1, b2, arena e cpu=2 sem P2 humano.
// arena: `rom-<n>` para os estádios do GBA ou `aleatoria` (a batalha sorteia).
export function battleQuery(s) {
  const [a, b] = s.slots;
  if (s.mode === 'arcade') return new URLSearchParams({ p1: a.character, b1: a.bey }).toString();
  const params = new URLSearchParams({ p1: a.character, p2: b.character });
  if (a.bey) params.set('b1', a.bey);
  if (b.bey) params.set('b2', b.bey);
  if (s.stage !== null) params.set('arena', s.stage === RANDOM_STAGE ? RANDOM_STAGE : `rom-${s.stage}`);
  if (s.p2 !== 'human') params.set('cpu', '2');
  if (s.mode === 'treino') params.set('modo', 'treino');
  return params.toString();
}
