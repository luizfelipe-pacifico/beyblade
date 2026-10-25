// Procedural synth: turns a JSON recipe into a 16-bit mono WAV buffer.
// Recipe format is documented in docs/AUDIO.md.

const TAU = Math.PI * 2;
const FILTER_UPDATE_EVERY = 32; // samples between coefficient updates
const FADE_SECONDS = 0.01; // avoids clicks at the edges
const WAVES = new Set(['sine', 'triangle', 'saw', 'square', 'noise', 'pink']);
const FILTER_TYPES = new Set(['lowpass', 'highpass', 'bandpass']);

export function envAt(env, t) {
  if (typeof env === 'number') return env;
  if (t <= env[0][0]) return env[0][1];
  for (let i = 1; i < env.length; i++) {
    const [t1, v1] = env[i];
    if (t <= t1) {
      const [t0, v0] = env[i - 1];
      return v0 + (v1 - v0) * ((t - t0) / (t1 - t0 || 1));
    }
  }
  return env[env.length - 1][1];
}

// Seeded PRNG so the same recipe always renders the same file.
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
}

class Biquad {
  constructor(type) {
    this.type = type;
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
  }

  set(freq, q, sr) {
    const w = (TAU * Math.min(Math.max(freq, 10), sr * 0.45)) / sr;
    const c = Math.cos(w);
    const a = Math.sin(w) / (2 * q);
    let b0, b1, b2;
    if (this.type === 'lowpass') [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
    else if (this.type === 'highpass') [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
    else [b0, b1, b2] = [a, 0, -a];
    const a0 = 1 + a;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
    this.a1 = (-2 * c) / a0; this.a2 = (1 - a) / a0;
  }

  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

function oscillator(wave, phase, rand, pink) {
  switch (wave) {
    case 'sine': return Math.sin(TAU * phase);
    case 'triangle': return 1 - 4 * Math.abs(phase - 0.5);
    case 'saw': return 2 * phase - 1;
    case 'square': return phase < 0.5 ? 1 : -1;
    case 'pink': {
      // Paul Kellet's economy pink-noise filter.
      const w = rand();
      pink[0] = 0.997 * pink[0] + 0.029591 * w;
      pink[1] = 0.985 * pink[1] + 0.032534 * w;
      pink[2] = 0.95 * pink[2] + 0.048056 * w;
      return (pink[0] + pink[1] + pink[2] + 0.1848 * w) * 3;
    }
    default: return rand();
  }
}

function renderLayer(layer, out, sr, seed) {
  const rand = rng(seed);
  const start = Math.floor((layer.start ?? 0) * sr);
  const end = layer.length ? Math.min(out.length, start + Math.floor(layer.length * sr)) : out.length;
  const voices = layer.unison ?? 1;
  const phases = Array.from({ length: voices }, (_, i) => i / voices);
  const spread = layer.detune ?? 15;
  const detunes = Array.from({ length: voices }, (_, i) =>
    voices === 1 ? 1 : 2 ** (((i / (voices - 1) - 0.5) * spread) / 1200));
  const filter = layer.filter && new Biquad(layer.filter.type);
  const formants = (layer.formants ?? []).map((f) => ({ ...f, bq: new Biquad('bandpass') }));
  const pink = [0, 0, 0];
  let growlPhase = 0, growlTarget = 0, growlValue = 0;

  for (let n = 0; start + n < end; n++) {
    const t = n / sr;
    if (n % FILTER_UPDATE_EVERY === 0) {
      if (filter) filter.set(envAt(layer.filter.freq, t), layer.filter.q ?? 0.707, sr);
      for (const f of formants) f.bq.set(envAt(f.freq, t), f.q ?? 5, sr);
    }
    let freq = envAt(layer.freq ?? 220, t);
    if (layer.vibrato) freq *= 2 ** ((Math.sin(TAU * layer.vibrato.rate * t) * layer.vibrato.depth) / 12);

    let s = 0;
    for (let v = 0; v < voices; v++) {
      phases[v] = (phases[v] + (freq * detunes[v]) / sr) % 1;
      s += oscillator(layer.wave, phases[v], rand, pink);
    }
    s /= Math.sqrt(voices);

    if (layer.growl) {
      // Random-walk amplitude modulation gives the rough "throat" texture of growls.
      growlPhase += layer.growl.rate / sr;
      if (growlPhase >= 1) { growlPhase -= 1; growlTarget = Math.abs(rand()); }
      growlValue += (growlTarget - growlValue) * 0.01;
      s *= 1 - layer.growl.depth + layer.growl.depth * growlValue * 2;
    }
    if (formants.length) s = formants.reduce((acc, f) => acc + f.bq.run(s) * (f.gain ?? 1), 0);
    if (filter) s = filter.run(s);
    if (layer.drive) s = Math.tanh(s * layer.drive) / Math.tanh(layer.drive);
    out[start + n] += s * envAt(layer.gain, t);
  }
}

// Schroeder reverb: 4 parallel combs + 2 series allpasses.
function reverb(buf, sr, { mix = 0.25, decay = 0.7, size = 1 }) {
  const line = (d) => ({ d: Math.max(1, Math.floor((d * size * sr) / 44100)), i: 0 });
  const combs = [1557, 1617, 1491, 1422].map(line);
  const alls = [225, 556].map(line);
  for (const c of [...combs, ...alls]) c.b = new Float32Array(c.d);
  const out = new Float32Array(buf.length);
  for (let n = 0; n < buf.length; n++) {
    let wet = 0;
    for (const c of combs) {
      const y = c.b[c.i];
      c.b[c.i] = buf[n] + y * decay;
      c.i = (c.i + 1) % c.d;
      wet += y;
    }
    wet /= combs.length;
    for (const a of alls) {
      const y = a.b[a.i];
      a.b[a.i] = wet + y * 0.5;
      a.i = (a.i + 1) % a.d;
      wet = y - wet * 0.5;
    }
    out[n] = buf[n] * (1 - mix) + wet * mix;
  }
  return out;
}

export function encodeWav(samples, sr) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), i * 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

export function validateRecipe(recipe) {
  const errors = [];
  if (!(recipe?.duration > 0 && recipe.duration <= 30)) errors.push('duration deve estar entre 0 e 30 s');
  if (!Array.isArray(recipe?.layers) || recipe.layers.length === 0) errors.push('layers deve ter ao menos 1 camada');
  for (const [i, l] of (recipe?.layers ?? []).entries()) {
    if (!WAVES.has(l.wave)) errors.push(`layers[${i}].wave inválido: ${l.wave}`);
    if (l.gain === undefined) errors.push(`layers[${i}].gain é obrigatório`);
    if (l.filter && !FILTER_TYPES.has(l.filter.type)) errors.push(`layers[${i}].filter.type inválido`);
  }
  return errors;
}

export function renderSamples(recipe) {
  const errors = validateRecipe(recipe);
  if (errors.length) throw new Error(errors.join('; '));
  const sr = recipe.sampleRate ?? 44100;
  let buf = new Float32Array(Math.ceil(recipe.duration * sr));
  recipe.layers.forEach((l, i) => renderLayer(l, buf, sr, (recipe.seed ?? 7) + i * 101));
  if (recipe.reverb) buf = reverb(buf, sr, recipe.reverb);
  let peak = 0;
  for (const s of buf) peak = Math.max(peak, Math.abs(s));
  const g = (recipe.gain ?? 0.9) / (peak || 1);
  const fade = Math.floor(sr * FADE_SECONDS);
  for (let i = 0; i < buf.length; i++) buf[i] *= g * Math.min(1, i / fade, (buf.length - 1 - i) / fade);
  return { samples: buf, sampleRate: sr };
}

export function renderWav(recipe) {
  const { samples, sampleRate } = renderSamples(recipe);
  return encodeWav(samples, sampleRate);
}
