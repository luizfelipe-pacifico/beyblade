// Lançamento no ritmo, estilo Beyblade Burst app (D-049, docs/LAUNCH.md). Puro e em ticks de 60 Hz.
// Mira na contagem, depois 10 batidas: um anel fecha sobre a bey e o jogador aperta ✕ no encontro. A janela
// estreita a cada batida; Perfeito e Bom enchem a energia, e 8 Perfeitos dão o Lançamento Perfeito.

export const LAUNCH = {
  aimTicks: 180, // contagem 3-2-1 com a mira
  beats: 10,
  firstGap: 25, // ticks entre batidas: 0,42 s → 0,30 s
  lastGap: 18,
  firstWindow: 6.6, // meia janela em ticks: ±110 ms → ±45 ms
  lastWindow: 2.7,
  perfectGain: 0.1,
  goodGain: 0.06,
  perfectCount: 8,
  perfectSpin: 1.1, // acima do máximo, como no app
  aimSpeed: 1.2, // da mira por segundo com o analógico no fim
  tail: 12, // ticks depois da última janela até soltar
};

const lerp = (a, b, t) => a + (b - a) * t;
const frac = (n, t) => (t.beats > 1 ? n / (t.beats - 1) : 0);

// Tick (contado do início do lançamento) em que o anel encontra o alvo na batida n.
export function beatTick(n, t = LAUNCH) {
  let tick = t.aimTicks + t.firstGap;
  for (let i = 0; i < n; i++) tick += Math.round(lerp(t.firstGap, t.lastGap, frac(i, t)));
  return tick;
}

export const beatWindow = (n, t = LAUNCH) => lerp(t.firstWindow, t.lastWindow, frac(n, t));

// Perfeito no terço central da janela, nunca menor que o próprio tick (60 Hz não tem meio tick).
export function judge(n, delta, t = LAUNCH) {
  const w = beatWindow(n, t);
  if (Math.abs(delta) <= Math.max(1, w / 3)) return 'perfeito';
  if (Math.abs(delta) <= w) return 'bom';
  return 'errou';
}

export const launchEndTick = (t = LAUNCH) => beatTick(t.beats - 1, t) + Math.ceil(beatWindow(t.beats - 1, t)) + t.tail;

export function createLaunch() {
  return { aim: 0, beat: 0, hits: [], energy: 0, early: false, done: false };
}

// Avança um tick do lançamento de um jogador. tick: ticks desde o início; input: InputFrame ({ move, pressed }).
// bonus: energia extra por Perfeito (ripcord). Devolve os eventos desta vaga neste tick.
export function stepLaunchSlot(l, tick, input, { bonus = 0, t = LAUNCH } = {}) {
  const events = [];
  if (l.done) return events;
  const press = Boolean(input?.pressed?.attack);
  if (tick <= t.aimTicks) {
    l.aim = Math.max(-1, Math.min(1, l.aim + (input?.move?.x ?? 0) * (t.aimSpeed / 60)));
    // Lançamento antecipado (GBA): soltar ainda na mira entra na hora, sem energia.
    if (press) {
      l.early = true;
      l.done = true;
      events.push({ type: 'launchEarly' });
    }
    return events;
  }
  const marcar = (nota) => {
    const n = l.beat;
    l.hits.push(nota);
    if (nota === 'perfeito') l.energy += t.perfectGain + bonus;
    else if (nota === 'bom') l.energy += t.goodGain;
    l.energy = Math.min(1, Math.round(l.energy * 1000) / 1000);
    l.beat++;
    events.push({ type: 'launchHit', n, nota, energy: l.energy });
  };
  if (l.beat < t.beats && press) {
    const delta = tick - beatTick(l.beat, t);
    // Apertar fora da janela (cedo demais, ou de novo na mesma batida) gasta a batida como erro.
    marcar(judge(l.beat, delta, t));
  }
  // Passou a janela sem apertar: erro.
  while (l.beat < t.beats && tick > beatTick(l.beat, t) + beatWindow(l.beat, t)) marcar('errou');
  if (tick >= launchEndTick(t)) l.done = true;
  return events;
}

export const perfectLaunch = (l, t = LAUNCH) => l.hits.filter((h) => h === 'perfeito').length >= t.perfectCount;

// Giro de entrada: 0,55–1 pela energia, ou acima do máximo no Lançamento Perfeito.
export function launchSpin(l, t = LAUNCH) {
  if (perfectLaunch(l, t)) return t.perfectSpin;
  return 0.55 + 0.45 * l.energy;
}

export const launchMisses = (l) => (l.early ? 3 : l.hits.filter((h) => h === 'errou').length);

// CPU: aperta perto da batida com erro sorteado pelo nível (1–5). rand() em [0, 1), da semente da partida.
// Sorteia o atraso uma vez por batida e aperta quando chega a hora.
export function cpuLaunchPress(l, tick, nivel, rand, t = LAUNCH) {
  if (l.done || tick <= t.aimTicks || l.beat >= t.beats) return false;
  if (l.cpuBeat !== l.beat) {
    l.cpuBeat = l.beat;
    const acerto = lerp(0.4, 0.9, (Math.max(1, Math.min(5, nivel)) - 1) / 4);
    const w = beatWindow(l.beat, t);
    // Dentro da janela com a chance do nível (metade dos acertos do nível 5 são Perfeitos); senão, longe dela.
    const dentro = rand() < acerto;
    const alcance = dentro ? w * (nivel >= 5 && rand() < 0.55 ? 0.3 : 0.9) : w + 4;
    l.cpuDelta = Math.round((rand() * 2 - 1) * alcance) || (dentro ? 0 : Math.ceil(w) + 2);
  }
  return tick === beatTick(l.beat, t) + l.cpuDelta;
}

// O que o HUD desenha: fase, mira, notas e quanto falta (0–1) para o anel encontrar o alvo da batida atual.
export function launchHud(l, tick, t = LAUNCH) {
  if (!l) return null;
  const fase = l.done ? 'solta' : tick <= t.aimTicks ? 'mira' : 'ritmo';
  let anel = 0;
  if (fase === 'ritmo' && l.beat < t.beats) {
    const alvo = beatTick(l.beat, t);
    const antes = l.beat ? beatTick(l.beat - 1, t) : t.aimTicks;
    anel = Math.max(0, Math.min(1, (alvo - tick) / Math.max(1, alvo - antes)));
  }
  return { fase, aim: l.aim, hits: [...l.hits], beat: l.beat, anel, energy: l.energy, early: l.early, contagem: Math.max(0, Math.ceil((t.aimTicks - tick) / 60)) };
}
