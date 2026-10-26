'use client';

// Efeitos sintetizados na hora com Web Audio (som próprio, D-008), para o que não tem WAV.
let ctx = null;

function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// Escudo quebrando (D-042): estalo de ruído agudo (o vidro rachando) e tilintar de cacos caindo,
// cada um numa nota alta e curta, espalhados no tempo.
export function vidroQuebrando(volume = 0.6) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime;
  const saida = c.createGain();
  saida.gain.value = volume;
  saida.connect(c.destination);

  const dur = 0.35;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const dados = buf.getChannelData(0);
  for (let i = 0; i < dados.length; i++) dados[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / dados.length, 3);
  const ruido = c.createBufferSource();
  ruido.buffer = buf;
  const agudo = c.createBiquadFilter();
  agudo.type = 'highpass';
  agudo.frequency.value = 2500;
  const g = c.createGain();
  g.gain.setValueAtTime(0.9, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  ruido.connect(agudo).connect(g).connect(saida);
  ruido.start(t0);

  for (let k = 0; k < 9; k++) {
    const t = t0 + 0.02 + Math.random() * 0.45;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 2600 + Math.random() * 3800;
    const gk = c.createGain();
    gk.gain.setValueAtTime(0.0001, t);
    gk.gain.exponentialRampToValueAtTime(0.25, t + 0.004);
    gk.gain.exponentialRampToValueAtTime(0.0001, t + 0.12 + Math.random() * 0.12);
    osc.connect(gk).connect(saida);
    osc.start(t);
    osc.stop(t + 0.3);
  }
}
