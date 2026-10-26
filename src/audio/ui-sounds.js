'use client';

// Sons de interface sintetizados na hora com Web Audio (D-008: som próprio, sem arquivos).
// Seguem o padrão dos menus de jogo de luta: tique curto ao mover, acorde subindo ao confirmar e descendo
// ao voltar, impacto grave ao travar a escolha, fanfarra quando entra um desafiante, catraca no carrossel.

let ctx = null;
let master = null;

function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
  }
  // O navegador só libera o áudio depois de um gesto; o Electron libera de saída.
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, { start = 0, dur = 0.08, type = 'square', gain = 0.3, to = null } = {}) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise({ start = 0, dur = 0.12, gain = 0.3, from = 4000, to = 800, q = 1.2 } = {}) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + start;
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t);
}

export const uiSounds = {
  move() {
    tone(1320, { dur: 0.035, gain: 0.12 });
  },
  confirm() {
    tone(660, { dur: 0.07, gain: 0.18 });
    tone(990, { start: 0.05, dur: 0.1, gain: 0.18 });
  },
  back() {
    tone(660, { dur: 0.07, gain: 0.15 });
    tone(440, { start: 0.05, dur: 0.1, gain: 0.15 });
  },
  lockIn() {
    tone(160, { dur: 0.35, type: 'sine', gain: 0.5, to: 45 });
    noise({ dur: 0.25, gain: 0.35, from: 6000, to: 300 });
    tone(1760, { start: 0.02, dur: 0.18, type: 'triangle', gain: 0.12 });
  },
  join() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, { start: i * 0.07, dur: 0.14, gain: 0.16 }));
    noise({ start: 0.28, dur: 0.3, gain: 0.2, from: 2000, to: 8000 });
  },
  carousel() {
    // Catraca do ripcord: três estalos rápidos.
    for (let i = 0; i < 3; i++) noise({ start: i * 0.025, dur: 0.02, gain: 0.25, from: 5000, to: 3000, q: 6 });
  },
  stage() {
    noise({ dur: 0.35, gain: 0.3, from: 300, to: 3000, q: 0.7 });
  },
  vs() {
    tone(90, { dur: 0.6, type: 'sine', gain: 0.6, to: 30 });
    noise({ dur: 0.5, gain: 0.4, from: 8000, to: 200 });
  },
};

// Fala gravada do personagem (public/audio/tts/<slug>/selecao.wav), quando existe.
export function playVoice(url, volume = 0.9) {
  if (typeof window === 'undefined' || !url) return;
  const a = new Audio(url);
  a.volume = volume;
  a.play().catch(() => {});
}
