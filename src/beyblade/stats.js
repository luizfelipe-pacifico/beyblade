// Game attributes (1–10) derived from part data. Model and sources: docs/BEYBLADES.md and
// pesquisa-bakuten/ATRIBUTOS-ORIGEM.md. Pure functions, shared by the game and the research build.
import { isRunningCore, resolveTip } from './tips.js';

export const ATTRIBUTES = ['ataque', 'defesa', 'stamina', 'velocidade', 'peso', 'equilibrio', 'resistencia_knockout'];

// Typical masses when a part has no weight on record (g).
const DEFAULT_WEIGHT_G = {
  'bit-chip': 0.8, 'attack-ring': 5, 'support-part': 2, 'weight-disk': 14, 'spin-gear': 3, 'blade-base': 7,
};
const DEFAULT_FRICTION = 0.35;
const MAX_FRICTION = 0.85; // rubber grip
const MASS_RANGE_G = [24, 42]; // plastic-era beys
const HEIGHT_RANGE_MM = [20, 35];
const INERTIA_RANGE = [3000, 8000]; // g·mm², typical plastic beys
const CONTACT_RADIUS_RANGE_MM = [18, 26];

// Takara printed 0–4 stars per part for Attack/Defense/Stamina; a bey's total is AR + WD + floor part.
const STAR_SUM_FLOOR = 2; // weakest real totals sit around 2, strongest around 12
const STAR_SUM_SPAN = 10;
const NEUTRAL_STARS = 2;
const OFFICIAL_WEIGHT = 0.6; // the rest comes from measured physics

const CONTACT_SCORE = { smash: 1, spike: 1, upper: 0.85, slope: 0.5, defesa: 0.25, survival: 0.1 };
const TIP_STABILITY = {
  ball: 1, 'metal-ball': 1, 'semi-flat': 0.7, 'metal-semi-flat': 0.7, sharp: 0.5, 'metal-sharp': 0.5,
  bearing: 0.5, flat: 0.4, 'metal-flat': 0.45, 'grip-flat': 0.3, grip: 0.2,
};
const MOVEMENT_SCORE = { agressivo: 1, flower: 1, orbita: 0.6, erratico: 0.6, centro: 0.1 };
const WD_CENTERED = { centro: 1, equilibrado: 0.6, periferia: 0.3 };
const FREE_SPIN = new Set(['bearing', 'free-shaft']);
// Engine Gears release a spring mid-battle (Takara's "Engine Power"): burst of speed and attack.
const ENGINE_BOOST = { turbo: { velocidade: 1.5, ataque: 1 }, default: { velocidade: 1, ataque: 0.5 } };

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const clamp01 = (v) => clamp(v, 0, 1);
const norm = (v, [lo, hi]) => clamp01((v - lo) / (hi - lo));
const to10 = (v) => Math.round(clamp(v, 1, 10) * 10) / 10;
const scale10 = (v01) => 1 + 9 * clamp01(v01);
const round2 = (v) => Math.round(v * 100) / 100;

const byCategory = (parts, cat) => parts.filter((p) => p?.categoria === cat);
const first = (parts, cat) => byCategory(parts, cat)[0];
const num = (m) => (typeof m === 'number' ? m : m?.valor ?? null);

export function partWeight(part) {
  return num(part.medidas?.peso_g) ?? DEFAULT_WEIGHT_G[part.categoria] ?? 0;
}

// Dimensions of the assembled bey. SG and bit chip sit inside the AR/BB, so they add no height.
export function assembledMeasures(parts) {
  const weight = parts.reduce((sum, p) => sum + partWeight(p), 0);
  const diameter = Math.max(0, ...parts.map((p) => num(p.medidas?.diametro_mm) ?? 0));
  const stacked = ['attack-ring', 'weight-disk', 'blade-base'];
  const height = parts
    .filter((p) => stacked.includes(p.categoria) || isRunningCore(p))
    .reduce((sum, p) => sum + (num(p.medidas?.altura_mm) ?? 0), 0);
  return {
    peso_g: Math.round(weight * 10) / 10,
    diametro_mm: Math.round(diameter * 10) / 10,
    altura_mm: Math.round(height * 10) / 10,
  };
}

// Moment of inertia (g·mm²): rings for AR/WD, a tapered disc for the base, the rest near the axis.
export function inertia(parts) {
  return parts.reduce((sum, p) => {
    const m = partWeight(p);
    const ro = (num(p.medidas?.diametro_mm) ?? 0) / 2;
    const ri = p.forma?.raio_interno_mm ?? 0;
    if (['weight-disk', 'attack-ring', 'support-part'].includes(p.categoria)) return sum + (m * (ri ** 2 + ro ** 2)) / 2;
    if (p.categoria === 'blade-base') return sum + 0.6 * ((m * ro ** 2) / 2);
    return sum + (m * ro ** 2) / 2;
  }, 0);
}

// The floor part: Blade Base, or the Running Core on HMS beys without one.
function floorPart(parts) {
  return first(parts, 'blade-base') ?? parts.find((p) => isRunningCore(p));
}

// Parts Takara rated, as fans summed them: AR + WD + floor part, plus every extra rated layer
// (supporter rings, Engine Gears and special gears such as Zeus' Customize Gear; e.g. Dranzer GT
// = 10/5/7). Plain Spin Gears carry no stars; Support Parts and Bit Chips never enter the sum.
export function ratedParts(parts) {
  const core = [first(parts, 'attack-ring'), first(parts, 'weight-disk'), floorPart(parts)].filter(Boolean);
  const extras = parts.filter((p) => !core.includes(p) && p.stats_oficiais
    && !['support-part', 'bit-chip'].includes(p.categoria) && !(isRunningCore(p) && core.some(isRunningCore)));
  return { core, extras };
}

// Star totals per axis. A core part without stars (or without one axis) counts as neutral, so a
// missing record does not sink the bey.
export function officialStars(parts) {
  const { core, extras } = ratedParts(parts);
  const rated = [...core, ...extras].filter((p) => p.stats_oficiais);
  if (rated.length === 0) return null;
  const total = (key) => core.reduce((sum, p) => sum + (p.stats_oficiais?.[key] ?? NEUTRAL_STARS), 0)
    + extras.reduce((sum, p) => sum + (p.stats_oficiais[key] ?? 0), 0);
  return { ataque: total('ataque'), defesa: total('defesa'), stamina: total('stamina'), partes: rated.length };
}

export const starsTo10 = (sum) => clamp(1 + (9 * (sum - STAR_SUM_FLOOR)) / STAR_SUM_SPAN, 1, 10);

export function computeAttributes(parts, { anime = {} } = {}) {
  const ar = first(parts, 'attack-ring');
  const wd = first(parts, 'weight-disk');
  const bb = first(parts, 'blade-base');
  const sg = first(parts, 'spin-gear');
  const measures = assembledMeasures(parts);
  const tip = resolveTip(parts);

  const friction = tip?.atrito ?? bb?.fisica?.modos?.[0]?.atrito ?? DEFAULT_FRICTION;
  const mu = clamp01(friction / MAX_FRICTION);
  const mass = norm(measures.peso_g, MASS_RANGE_G);
  const height = norm(measures.altura_mm, HEIGHT_RANGE_MM);
  const inertiaN = norm(inertia(parts), INERTIA_RANGE);
  const recoil = ar?.fisica?.recoil ?? 0.4;
  const contact = CONTACT_SCORE[ar?.fisica?.tipo_contato] ?? 0.5;
  const reach = norm(ar?.fisica?.raio_contato_mm ?? (num(ar?.medidas?.diametro_mm) ?? 44) / 2, CONTACT_RADIUS_RANGE_MM);
  const stable = TIP_STABILITY[tip?.tipo] ?? 0.5;
  const movement = MOVEMENT_SCORE[bb?.fisica?.padrao_movimento] ?? (mu > 0.5 ? 0.8 : 0.4);
  const centered = WD_CENTERED[wd?.fisica?.distribuicao] ?? 0.6;
  const symmetry = Math.min(ar?.forma?.simetria ?? 3, 4) / 4;
  const freeSpin = FREE_SPIN.has(sg?.fisica?.gimmick) ? 1 : 0;
  const boost = sg?.fisica?.gimmick === 'engine-gear'
    ? ENGINE_BOOST[sg.fisica.ativacao?.modo] ?? ENGINE_BOOST.default
    : { velocidade: 0, ataque: 0 };

  // Physical share of each axis, 0..1.
  const fA = clamp01(0.35 * contact + 0.25 * mu + 0.2 * reach + 0.2 * mass - 0.2 * recoil);
  const fD = clamp01(0.4 * mass + 0.3 * (1 - recoil) + 0.3 * stable);
  const fS = clamp01(0.5 * inertiaN + 0.3 * (1 - mu) + 0.2 * freeSpin);

  const stars = officialStars(parts);
  const blend = (axis, physics) => (stars
    ? OFFICIAL_WEIGHT * starsTo10(stars[axis]) + (1 - OFFICIAL_WEIGHT) * scale10(physics)
    : scale10(physics));

  const raw = {
    ataque: blend('ataque', fA) + boost.ataque,
    defesa: blend('defesa', fD),
    stamina: blend('stamina', fS),
    velocidade: scale10(0.6 * mu + 0.25 * (1 - mass) + 0.15 * movement) + boost.velocidade,
    peso: scale10(mass),
    equilibrio: scale10(0.4 * centered + 0.3 * stable + 0.2 * symmetry + 0.1 * (1 - height)),
    resistencia_knockout: scale10(0.35 * mass + 0.25 * fD + 0.2 * mu + 0.2 * (1 - height)) - recoil,
  };

  const atributos = Object.fromEntries(ATTRIBUTES.map((k) => [k, to10(raw[k])]));
  const final = Object.fromEntries(ATTRIBUTES.map((k) => [k, to10(atributos[k] + (anime[k] ?? 0))]));
  return {
    medidas: measures,
    atributos_brinquedo: atributos,
    atributos: final,
    entradas: {
      ponta: tip?.tipo ?? null, origem_ponta: tip?.origem ?? null, atrito_ponta: friction,
      tipo_contato: ar?.fisica?.tipo_contato ?? null, recoil,
      distribuicao_peso: wd?.fisica?.distribuicao ?? null, simetria: ar?.forma?.simetria ?? null,
      engine_gear: sg?.fisica?.gimmick === 'engine-gear' ? sg.fisica.ativacao?.modo ?? 'clutch' : null,
      inercia_g_mm2: Math.round(inertia(parts)),
      estrelas_takara: stars,
      fisica: { ataque: round2(fA), defesa: round2(fD), stamina: round2(fS) },
    },
  };
}
