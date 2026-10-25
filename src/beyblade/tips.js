// Where a bey touches the stadium. Plastic-era beys keep the tip on the Blade Base;
// Engine Gear beys on the Engine Gear (CEW) and HMS beys on the Running Core.

export const TIP_FRICTION = {
  'metal-sharp': 0.08, bearing: 0.05, sharp: 0.1, 'metal-ball': 0.18, ball: 0.25, 'metal-semi-flat': 0.25,
  'semi-flat': 0.3, 'metal-flat': 0.4, flat: 0.5, 'grip-flat': 0.7, grip: 0.85,
};

// Order matters: the first pattern that matches the name wins.
const NAME_PATTERNS = [
  [/metal[\s-]*sharp/i, 'metal-sharp'], [/bearing/i, 'bearing'], [/metal[\s-]*ball|g[\s-]*ball|oil[\s-]*ball/i, 'metal-ball'],
  [/metal[\s-]*semi[\s-]*flat/i, 'metal-semi-flat'], [/metal[\s-]*flat/i, 'metal-flat'], [/grip[\s-]*flat/i, 'grip-flat'],
  [/semi[\s-]*flat/i, 'semi-flat'], [/sharp/i, 'sharp'], [/grip/i, 'grip'], [/ball/i, 'ball'], [/flat/i, 'flat'],
];

export function tipTypeFromName(name) {
  return NAME_PATTERNS.find(([re]) => re.test(name ?? ''))?.[1] ?? null;
}

const isRunningCore = (p) => p?.forma?.tipo === 'running-core' || p?.fisica?.gimmick === 'running-core';

// Returns { tipo, atrito, origem } for the assembled bey, or null when nothing is known.
export function resolveTip(parts) {
  const bb = parts.find((p) => p?.categoria === 'blade-base');
  const sg = parts.find((p) => p?.categoria === 'spin-gear');
  if (bb?.fisica?.tipo_ponta || bb?.fisica?.atrito != null) {
    const tipo = bb.fisica.tipo_ponta ?? null;
    const base = bb.fisica.atrito ?? TIP_FRICTION[tipo] ?? null;
    // Clutch/change bases switch tips mid-battle: average the modes so both phases count.
    const modes = (bb.fisica.modos ?? []).map((m) => m.atrito ?? TIP_FRICTION[m.tipo_ponta]).filter((v) => v != null);
    const atrito = modes.length > 1 ? modes.reduce((a, b) => a + b, 0) / modes.length : base;
    return { tipo, atrito, origem: bb.id ?? 'blade-base', ...(modes.length > 1 && { modos: modes.length }) };
  }
  if (sg && (isRunningCore(sg) || sg.fisica?.tipo_ponta)) {
    const tipo = sg.fisica?.tipo_ponta ?? tipTypeFromName(sg.nome) ?? tipTypeFromName(sg.id);
    if (tipo) return { tipo, atrito: sg.fisica?.atrito ?? TIP_FRICTION[tipo], origem: sg.id ?? 'spin-gear' };
  }
  return null;
}

export { isRunningCore };
