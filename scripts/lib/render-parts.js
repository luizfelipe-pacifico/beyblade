import { isRunningCore, tipTypeFromName } from '../../src/beyblade/tips.js';

// SVG generator for parts, assembled beys, exploded views and launchers (docs/ART.md).
// Everything is drawn in millimetres; `forma` follows the contract in docs/BEYBLADES.md.

const INK = '#0d1226';
const PAPER = '#f4f1ea';
const FONT = "font-family='Segoe UI, Roboto, Arial, sans-serif'";
const ISO_SQUASH = 0.42; // vertical squash of the 3/4 camera
const STEP_DEG = 1;
// Shared by every HMS frame in a file; duplicate ids with identical content are harmless.
const METAL_GRADIENT = `<linearGradient id='metal' x1='0' y1='0' x2='1' y2='1'>
  <stop offset='0' stop-color='#f4f6f8'/><stop offset='0.45' stop-color='#a9b1ba'/>
  <stop offset='0.55' stop-color='#d7dce1'/><stop offset='1' stop-color='#6f7882'/></linearGradient>`;

// ---------- small helpers ----------

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const f = (n) => Math.round(n * 100) / 100;
const num = (m, d = null) => (typeof m === 'number' ? m : m?.valor ?? d);
const rad = (deg) => ((deg - 90) * Math.PI) / 180; // 0° = top, clockwise

export function shade(hex, amount) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? '');
  if (!m) return hex ?? '#888888';
  const v = parseInt(m[1], 16);
  const ch = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) =>
    Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount));
  return `#${ch.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

const palette = (part) => {
  const c = part.cores ?? {};
  const primaria = c.primaria ?? '#8a8f99';
  return { primaria, secundaria: c.secundaria ?? shade(primaria, -0.3), detalhe: c.detalhe ?? INK };
};

// ---------- outlines ----------

const easeInOut = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);

// Radius of one lobe at angle `a` (degrees inside the sector). The leading face is pico→fim.
function lobeRadius(lobe, a, base) {
  const { inicio = 0, pico, fim, raio_mm: peak, borda = 'curva' } = lobe;
  const p = pico ?? (inicio + fim) / 2;
  if (a < inicio || a > fim) return base;
  const h = peak - base;
  if (a <= p) return base + h * easeInOut((a - inicio) / (p - inicio || 1));
  const t = (a - p) / (fim - p || 1);
  switch (borda) {
    case 'reta': return t > 0.92 ? base + h * (1 - (t - 0.92) / 0.08) : peak;
    case 'rampa': return base + h * (1 - t);
    case 'ponta': return base + h * (1 - t) ** 2;
    case 'gancho': return t > 0.85 ? base + h * 1.08 * (1 - (t - 0.85) / 0.15) : peak + h * 0.08 * t;
    default: return base + h * (1 - easeInOut(t));
  }
}

// Polar outline [ [x,y], ... ] for ring-like parts (AR, SP, BB). `mirror` flips for left spin.
export function lobedOutline({ simetria = 1, lobos = [], raio_base_mm, raio_corpo_mm }, mirror = false) {
  const base = raio_base_mm ?? raio_corpo_mm ?? 18;
  const sector = 360 / Math.max(1, simetria);
  const pts = [];
  for (let deg = 0; deg < 360; deg += STEP_DEG) {
    const a = mirror ? (360 - deg) % sector : deg % sector;
    let r = base;
    for (const lobe of lobos) r = Math.max(r, lobeRadius(lobe, a, base));
    pts.push([r * Math.cos(rad(deg)), r * Math.sin(rad(deg))]);
  }
  return pts;
}

export function polygonOutline(sides, radius, rotation = 0) {
  if (!sides) {
    return Array.from({ length: 120 }, (_, i) => [radius * Math.cos((i / 120) * Math.PI * 2), radius * Math.sin((i / 120) * Math.PI * 2)]);
  }
  return Array.from({ length: sides }, (_, i) => {
    const a = ((i / sides) * 360 + rotation) * (Math.PI / 180);
    return [radius * Math.cos(a), radius * Math.sin(a)];
  });
}

const pathOf = (pts) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
const circlePath = (r) => `M${f(-r)} 0A${f(r)} ${f(r)} 0 1 0 ${f(r)} 0A${f(r)} ${f(r)} 0 1 0 ${f(-r)} 0Z`;

// ---------- per-category top-view shapes ----------

function spinMirror(part, spin) {
  const dir = spin ?? part.fisica?.sentido_otimo ?? part.fisica?.rotacao ?? 'direita';
  return dir === 'esquerda';
}

// Returns { outer: path, hole: path|null, radius, extra: svg } in mm, centred at 0,0.
export function topShape(part, spin) {
  const fm = part.forma ?? {};
  const col = palette(part);
  switch (part.categoria) {
    case 'attack-ring':
    case 'support-part': {
      const pts = lobedOutline(fm, spinMirror(part, spin));
      const radius = Math.max(...pts.map(([x, y]) => Math.hypot(x, y)));
      const inner = fm.raio_interno_mm ?? 8;
      const ridge = `<path d='${circlePath((fm.raio_base_mm ?? 17) * 0.82)}' fill='none' stroke='${shade(col.primaria, -0.35)}' stroke-width='0.5' opacity='0.7'/>`;
      // HMS rings: the metal frame shows as a silver band around the plastic caul.
      const frame = fm.moldura
        ? `<path d='${pathOf(lobedOutline(fm.moldura, spinMirror(part, spin)))}${circlePath((fm.moldura.raio_base_mm ?? 15) * 0.86)}' fill='url(#metal)' fill-rule='evenodd' stroke='${INK}' stroke-width='0.4' opacity='0.95'/>`
        : '';
      return { outer: pathOf(pts), hole: circlePath(inner), radius, extra: ridge + frame };
    }
    case 'weight-disk': {
      const ro = fm.raio_externo_mm ?? 19;
      const ri = fm.raio_interno_mm ?? 6;
      let pts = polygonOutline(fm.lados ?? 0, ro, -90);
      if (fm.estilo === 'attack' && fm.lados) {
        pts = pts.flatMap(([x, y], i) => {
          const a = Math.atan2(y, x) + Math.PI / fm.lados;
          return [[x, y], [ro * 0.86 * Math.cos(a), ro * 0.86 * Math.sin(a)]];
        });
      }
      const rim = ['wide', 'circle'].includes(fm.estilo)
        ? `<path d='${circlePath(ro * 0.78)}' fill='none' stroke='${shade(col.primaria, -0.4)}' stroke-width='0.6'/>` : '';
      const holes = fm.estilo === 'balance' || fm.estilo === 'heavy'
        ? Array.from({ length: 4 }, (_, i) => {
          const a = (i * Math.PI) / 2 + Math.PI / 4;
          return `<circle cx='${f(ro * 0.55 * Math.cos(a))}' cy='${f(ro * 0.55 * Math.sin(a))}' r='${f(ro * 0.07)}' fill='${shade(col.primaria, -0.5)}'/>`;
        }).join('') : '';
      const magnet = fm.estilo === 'magne'
        ? `<path d='M0 ${f(-ro)}A${f(ro)} ${f(ro)} 0 0 1 0 ${f(ro)}Z' fill='#c62828' opacity='0.35'/>` : '';
      return { outer: pathOf(pts), hole: circlePath(ri), radius: ro, extra: rim + holes + magnet };
    }
    case 'spin-gear': {
      const r = fm.raio_mm ?? 8;
      if (isRunningCore(part)) {
        const ring = `<circle r='${f(r * 0.6)}' fill='none' stroke='${shade(col.primaria, -0.4)}' stroke-width='0.5'/>`;
        return { outer: circlePath(r), hole: null, radius: r, extra: ring };
      }
      const teeth = fm.dentes ?? 12;
      const pts = [];
      for (let i = 0; i < teeth * 4; i++) {
        const a = (i / (teeth * 4)) * Math.PI * 2;
        const rr = i % 4 < 2 ? r : r * 0.86;
        pts.push([rr * Math.cos(a), rr * Math.sin(a)]);
      }
      const coreColor = { metal: '#9aa3ad', 'magne-n': '#c62828', 'magne-s': '#1e4fbf', engine: '#d4a017', bearing: '#c0c6cc' }[fm.nucleo] ?? shade(col.primaria, -0.2);
      const core = `<circle r='${f(r * 0.5)}' fill='${coreColor}' stroke='${INK}' stroke-width='0.4'/><circle r='${f(r * 0.16)}' fill='${INK}'/>`;
      return { outer: pathOf(pts), hole: null, radius: r, extra: core };
    }
    case 'blade-base': {
      const pts = lobedOutline({ ...fm, raio_base_mm: fm.raio_corpo_mm ?? 19 }, spinMirror(part, spin));
      const radius = Math.max(...pts.map(([x, y]) => Math.hypot(x, y)));
      const socket = `<circle r='${f((fm.raio_corpo_mm ?? 19) * 0.45)}' fill='${shade(col.primaria, -0.45)}' stroke='${INK}' stroke-width='0.4'/>`;
      return { outer: pathOf(pts), hole: null, radius, extra: socket };
    }
    case 'bit-chip': {
      const r = fm.raio_mm ?? 7;
      return { outer: circlePath(r), hole: null, radius: r, extra: '' };
    }
    default:
      return { outer: circlePath(10), hole: null, radius: 10, extra: '' };
  }
}

// Gradient + body + details for one part at the origin. `id` keeps gradient ids unique per file.
function partBody(part, id, { spin, emblems = {} } = {}) {
  const col = palette(part);
  const shape = topShape(part, spin);
  const metallic = part.acabamento === 'metalico' || part.acabamento === 'cromado' || part.categoria === 'weight-disk';
  const translucent = part.acabamento === 'translucido';
  const light = metallic ? shade(col.primaria, 0.55) : shade(col.primaria, 0.3);
  const grad = `<radialGradient id='g-${id}' cx='0.35' cy='0.3' r='0.85'>
    <stop offset='0' stop-color='${light}'/><stop offset='0.55' stop-color='${col.primaria}'/>
    <stop offset='1' stop-color='${shade(col.primaria, -0.35)}'/></radialGradient>`
    + (part.forma?.moldura ? METAL_GRADIENT : '');
  const d = shape.hole ? `${shape.outer}${shape.hole}` : shape.outer;
  let body = `<path d='${d}' fill='url(#g-${id})' fill-rule='evenodd' stroke='${INK}' stroke-width='0.5' stroke-linejoin='round'${translucent ? " fill-opacity='0.72'" : ''}/>`;
  body += shape.extra;
  if (part.categoria === 'bit-chip') {
    const r = part.forma?.raio_mm ?? 7;
    const emblem = emblems[part.forma?.emblema];
    body = `<circle r='${f(r)}' fill='${part.forma?.cor_fundo ?? col.primaria}' stroke='${INK}' stroke-width='0.5'/>`
      + (emblem ? nestedSvg(emblem, -r * 0.8, -r * 0.8, r * 1.6) : '')
      + `<path d='M${f(-r * 0.7)} ${f(-r * 0.25)}A${f(r)} ${f(r)} 0 0 1 ${f(r * 0.25)} ${f(-r * 0.7)}' stroke='#fff' stroke-width='0.5' fill='none' opacity='0.6'/>`;
  }
  return { defs: grad, body, radius: shape.radius };
}

// Inlines another SVG document (e.g. a bit-beast emblem) scaled into a box.
export function nestedSvg(svgText, x, y, size) {
  const inner = svgText.replace(/<\?xml[^>]*>/, '').replace(/<!--[\s\S]*?-->/g, '');
  const vb = /viewBox=["']([^"']+)["']/.exec(inner)?.[1] ?? '0 0 64 64';
  const content = inner.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return `<svg x='${f(x)}' y='${f(y)}' width='${f(size)}' height='${f(size)}' viewBox='${vb}'>${content}</svg>`;
}

// ---------- side profiles ----------

export function sideProfile(part) {
  const fm = part.forma ?? {};
  const col = palette(part);
  const r = topShape(part).radius;
  const h = num(part.medidas?.altura_mm) ?? fm.altura_mm ?? fm.espessura_mm ?? 5;
  const fill = `fill='${col.primaria}' stroke='${INK}' stroke-width='0.5' stroke-linejoin='round'`;
  switch (part.categoria) {
    case 'blade-base': {
      const tip = fm.ponta ?? {};
      const tr = tip.raio_mm ?? 2.5;
      const th = tip.altura_mm ?? 4;
      const bodyH = Math.max(1, h - th);
      const bottomR = fm.perfil === 'reto' ? r * 0.9 : fm.perfil === 'saia' ? r * 0.95 : r * 0.45;
      const body = `<path d='M${f(-r)} 0L${f(r)} 0L${f(bottomR)} ${f(bodyH)}L${f(-bottomR)} ${f(bodyH)}Z' ${fill}/>`;
      const tipColor = tip.tipo === 'grip' ? '#2b2b2b' : /metal|bearing/.test(tip.tipo ?? '') ? '#aab2bb' : shade(col.primaria, -0.25);
      const tf = `fill='${tipColor}' stroke='${INK}' stroke-width='0.4'`;
      let tipSvg;
      switch (tip.tipo) {
        case 'sharp': case 'metal-sharp':
          tipSvg = `<path d='M${f(-tr)} ${f(bodyH)}L${f(tr)} ${f(bodyH)}L0 ${f(bodyH + th)}Z' ${tf}/>`; break;
        case 'ball': case 'metal-ball':
          tipSvg = `<path d='M${f(-tr)} ${f(bodyH)}L${f(tr)} ${f(bodyH)}A${f(tr)} ${f(th)} 0 0 1 ${f(-tr)} ${f(bodyH)}Z' ${tf}/>`; break;
        case 'semi-flat': case 'metal-semi-flat':
          tipSvg = `<path d='M${f(-tr)} ${f(bodyH)}L${f(tr)} ${f(bodyH)}L${f(tr * 0.55)} ${f(bodyH + th)}L${f(-tr * 0.55)} ${f(bodyH + th)}Z' ${tf}/>`; break;
        default:
          tipSvg = `<path d='M${f(-tr)} ${f(bodyH)}L${f(tr)} ${f(bodyH)}L${f(tr)} ${f(bodyH + th)}L${f(-tr)} ${f(bodyH + th)}Z' ${tf}/>`;
      }
      return { svg: body + tipSvg, width: r * 2, height: bodyH + th };
    }
    case 'attack-ring':
    case 'support-part': {
      const peak = Math.max(h, ...(fm.lobos ?? []).map((l) => l.altura_mm ?? 0));
      const base = r * 0.82;
      return {
        svg: `<path d='M${f(-base)} ${f(peak - h)}L${f(-r)} ${f(peak - h * 0.4)}L${f(-r)} ${f(peak)}L${f(r)} ${f(peak)}L${f(r)} ${f(peak - h * 0.4)}L${f(base)} ${f(peak - h)}L${f(base * 0.6)} 0L${f(-base * 0.6)} 0Z' ${fill}/>`,
        width: r * 2, height: peak,
      };
    }
    case 'spin-gear': {
      const w = (fm.raio_mm ?? 8) * 2;
      const stripes = Array.from({ length: 5 }, (_, i) => `<line x1='${f(-w / 2 + (w / 6) * (i + 1))}' y1='0' x2='${f(-w / 2 + (w / 6) * (i + 1))}' y2='${f(h * 0.35)}' stroke='${INK}' stroke-width='0.3'/>`).join('');
      return { svg: `<rect x='${f(-w / 2)}' y='0' width='${f(w)}' height='${f(h)}' rx='0.8' ${fill}/>${stripes}`, width: w, height: h };
    }
    default:
      return { svg: `<rect x='${f(-r)}' y='0' width='${f(r * 2)}' height='${f(h)}' rx='0.6' ${fill}/>`, width: r * 2, height: h };
  }
}

// ---------- annotations ----------

function ruler(x, y) {
  return `<g ${FONT} font-size='2.4' fill='${INK}'><rect x='${x}' y='${y}' width='10' height='1.2' fill='${INK}'/>`
    + `<rect x='${x + 5}' y='${y}' width='5' height='1.2' fill='${PAPER}' stroke='${INK}' stroke-width='0.2'/>`
    + `<text x='${x + 5}' y='${y + 4.4}' text-anchor='middle'>10 mm</text></g>`;
}

function dimH(x1, x2, y, label) {
  return `<g stroke='${INK}' stroke-width='0.25' ${FONT} font-size='2.6' fill='${INK}'>`
    + `<line x1='${f(x1)}' y1='${f(y)}' x2='${f(x2)}' y2='${f(y)}'/>`
    + `<line x1='${f(x1)}' y1='${f(y - 1.2)}' x2='${f(x1)}' y2='${f(y + 1.2)}'/><line x1='${f(x2)}' y1='${f(y - 1.2)}' x2='${f(x2)}' y2='${f(y + 1.2)}'/>`
    + `<text x='${f((x1 + x2) / 2)}' y='${f(y - 1)}' text-anchor='middle' stroke='none'>${esc(label)}</text></g>`;
}

function dimV(x, y1, y2, label) {
  return `<g stroke='${INK}' stroke-width='0.25' ${FONT} font-size='2.6' fill='${INK}'>`
    + `<line x1='${f(x)}' y1='${f(y1)}' x2='${f(x)}' y2='${f(y2)}'/>`
    + `<line x1='${f(x - 1.2)}' y1='${f(y1)}' x2='${f(x + 1.2)}' y2='${f(y1)}'/><line x1='${f(x - 1.2)}' y1='${f(y2)}' x2='${f(x + 1.2)}' y2='${f(y2)}'/>`
    + `<text x='${f(x + 1.8)}' y='${f((y1 + y2) / 2 + 1)}' stroke='none'>${esc(label)}</text></g>`;
}

const fmtMm = (v) => `${String(f(v)).replace('.', ',')} mm`;
const fmtG = (v) => (v == null ? '? g' : `${String(f(v)).replace('.', ',')} g`);

function frame(w, h, body, title) {
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${f(w)} ${f(h)}' width='${f(w * 8)}' height='${f(h * 8)}'>`
    + `<title>${esc(title)}</title>`
    + `<rect width='${f(w)}' height='${f(h)}' rx='2' fill='${PAPER}'/>`
    + body + '</svg>\n';
}

function header(part, w) {
  const peso = num(part.medidas?.peso_g);
  const sub = [part.categoria, part.sistema, part.material?.principal, fmtG(peso)].filter(Boolean).join(' · ');
  return `<g ${FONT} fill='${INK}'><text x='3' y='6' font-size='3.6' font-weight='700'>${esc(part.nome)}</text>`
    + `<text x='3' y='10' font-size='2.4' opacity='0.75'>${esc(sub)}</text>`
    + `<text x='${f(w - 3)}' y='6' font-size='2.2' text-anchor='end' opacity='0.6'>vista de cima · escala 1:1 mm</text></g>`;
}

// ---------- public renderers ----------

export function renderPartTop(part, { emblems = {} } = {}) {
  const { defs, body, radius } = partBody(part, 'p', { emblems });
  const diameter = num(part.medidas?.diametro_mm) ?? radius * 2;
  const R = Math.max(radius, diameter / 2);
  const w = Math.max(70, R * 2 + 24);
  const h = R * 2 + 30;
  const cx = w / 2;
  const cy = 14 + R;
  const svg = header(part, w)
    + `<defs>${defs}<filter id='sh' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='0.9'/></filter></defs>`
    + `<g transform='translate(${f(cx + 0.8)} ${f(cy + 1.2)})' opacity='0.25' filter='url(#sh)'><circle r='${f(radius)}' fill='${INK}'/></g>`
    + `<g transform='translate(${f(cx)} ${f(cy)})'>${body}</g>`
    + dimH(cx - diameter / 2, cx + diameter / 2, cy + R + 5, `Ø ${fmtMm(diameter)}`)
    + ruler(3, h - 7);
  return frame(w, h, svg, `${part.nome} (topo)`);
}

export function renderPartSide(part) {
  const prof = sideProfile(part);
  const height = num(part.medidas?.altura_mm) ?? prof.height;
  const w = Math.max(70, prof.width + 30);
  const h = prof.height + 30;
  const cx = w / 2;
  const top = 15;
  const svg = header(part, w).replace('vista de cima', 'perfil lateral')
    + `<g transform='translate(${f(cx)} ${f(top)})'>${prof.svg}</g>`
    + dimV(cx + prof.width / 2 + 3, top, top + prof.height, fmtMm(height))
    + dimH(cx - prof.width / 2, cx + prof.width / 2, top + prof.height + 5, fmtMm(prof.width))
    + ruler(3, h - 7);
  return frame(w, h, svg, `${part.nome} (perfil)`);
}

// Stack order (bottom → top) and the height each layer occupies in the 3/4 view (mm).
const STACK = ['blade-base', 'spin-gear', 'weight-disk', 'support-part', 'attack-ring', 'bit-chip'];

function stackLayers(parts) {
  return [...parts].filter(Boolean).sort((a, b) => STACK.indexOf(a.categoria) - STACK.indexOf(b.categoria));
}

function layerThickness(p) {
  const h = num(p.medidas?.altura_mm);
  if (isRunningCore(p)) return h ?? 10;
  if (p.categoria === 'spin-gear') return 0; // hidden inside the base
  if (p.categoria === 'bit-chip') return 1;
  return Math.min(h ?? 4, p.categoria === 'blade-base' ? 10 : 7);
}

// One extruded layer in the 3/4 view: darker copies stepped down, then the lit top face.
function isoLayer(p, i, z, spin, emblems) {
  const { defs, body } = partBody(p, `i${i}`, { spin, emblems });
  const t = layerThickness(p);
  // Thin steps keep lobe edges smooth; <use> keeps the file small.
  const steps = Math.max(1, Math.round(t / 0.15));
  const col = shade(palette(p).primaria, -0.45);
  const wallId = `w${i}`;
  const shape = topShape(p, spin);
  // Bases taper towards the tip, so their lower copies shrink.
  const isBase = p.categoria === 'blade-base' || isRunningCore(p);
  const bottomScale = isBase ? { reto: 0.92, saia: 0.95 }[p.forma?.perfil] ?? 0.6 : 1;
  let s = '';
  if (isBase) s += isoTip(p, z);
  s += `<use href='#${wallId}' transform='translate(0 ${f(-z / ISO_SQUASH)}) scale(${f(bottomScale)})' stroke='${INK}' stroke-width='${f(1 / bottomScale)}'/>`;
  for (let k = steps; k >= 0; k--) {
    const sc = bottomScale + ((1 - bottomScale) * (steps - k)) / steps;
    const dy = -(z + (t * (steps - k)) / steps) / ISO_SQUASH;
    s += `<use href='#${wallId}' transform='translate(0 ${f(dy)}) scale(${f(sc)})'/>`;
  }
  s += `<path d='${shape.outer}' transform='translate(0 ${f(-(z + t) / ISO_SQUASH)})' fill='none' stroke='${INK}' stroke-width='0.9'/>`;
  s += `<g transform='translate(0 ${f(-(z + t) / ISO_SQUASH)})'>${body}</g>`;
  const wall = `<path id='${wallId}' d='${shape.outer}' fill='${col}' stroke='${col}' stroke-width='0.3'/>`;
  return { defs: defs + wall, svg: s, top: z + t };
}

// Tip under the base in the 3/4 view (drawn in squashed space, so heights are divided by ISO_SQUASH).
function isoTip(p, z) {
  const tip = p.forma?.ponta ?? { tipo: tipTypeFromName(p.nome) ?? 'flat', raio_mm: 2.5, altura_mm: 3 };
  const r = tip.raio_mm ?? 2.5;
  const h = (tip.altura_mm ?? 4) / ISO_SQUASH;
  const y0 = -z / ISO_SQUASH;
  const color = tip.tipo === 'grip' ? '#2b2b2b' : /metal|bearing/.test(tip.tipo ?? '') ? '#aab2bb' : shade(palette(p).primaria, -0.3);
  const st = `fill='${color}' stroke='${INK}' stroke-width='0.5'`;
  if (/sharp/.test(tip.tipo ?? '')) return `<path d='M${f(-r)} ${f(y0)}L0 ${f(y0 + h)}L${f(r)} ${f(y0)}Z' ${st}/>`;
  if (/ball/.test(tip.tipo ?? '')) return `<ellipse cx='0' cy='${f(y0 + h * 0.4)}' rx='${f(r)}' ry='${f(h * 0.6)}' ${st}/>`;
  const rb = /semi/.test(tip.tipo ?? '') ? r * 0.6 : r;
  return `<path d='M${f(-r)} ${f(y0)}L${f(-rb)} ${f(y0 + h)}A${f(rb)} ${f(rb)} 0 0 0 ${f(rb)} ${f(y0 + h)}L${f(r)} ${f(y0)}Z' ${st}/>`;
}

function isoStack(parts, spin, emblems, gap = 0) {
  let z = 0;
  let defs = '';
  let svg = '';
  const tops = [];
  stackLayers(parts).forEach((p, i) => {
    if (p.categoria === 'spin-gear' && gap === 0 && !isRunningCore(p)) return;
    const layer = isoLayer(p, i, z, spin, emblems);
    defs += layer.defs;
    svg += layer.svg;
    tops.push({ part: p, z, top: layer.top });
    z = layer.top + gap;
  });
  return { defs, svg, height: z, tops };
}

function statBars(attrs, x, y) {
  const labels = { ataque: 'Ataque', defesa: 'Defesa', stamina: 'Stamina', velocidade: 'Velocidade', peso: 'Peso', equilibrio: 'Equilíbrio', resistencia_knockout: 'Resist. KO' };
  return Object.entries(labels).map(([k, label], i) => {
    const v = attrs?.[k] ?? 0;
    const yy = y + i * 4.2;
    return `<g ${FONT} font-size='2.4' fill='${INK}'><text x='${x}' y='${f(yy + 2)}'>${label}</text>`
      + `<rect x='${x + 18}' y='${f(yy)}' width='30' height='2.4' rx='1.2' fill='#d9d4c7'/>`
      + `<rect x='${x + 18}' y='${f(yy)}' width='${f((v / 10) * 30)}' height='2.4' rx='1.2' fill='#c8452c'/>`
      + `<text x='${x + 50}' y='${f(yy + 2)}'>${String(v).replace('.', ',')}</text></g>`;
  }).join('');
}

export function renderBeyAssembled(bey, parts, { emblems = {} } = {}) {
  const spin = bey.rotacao?.startsWith('esq') ? 'esquerda' : 'direita';
  const iso = isoStack(parts, spin, emblems);
  const ISO_ZOOM = 1.6;
  const R = Math.max(20, ...parts.filter(Boolean).map((p) => topShape(p, spin).radius));
  const m = bey.medidas ?? {};
  const w = 200;
  const isoH = (R * 2 * ISO_SQUASH + iso.height + 8) * ISO_ZOOM;
  const h = Math.max(isoH + 26, 100);
  const cx = R * ISO_ZOOM + 8;
  const cy = 20 + (iso.height + R * ISO_SQUASH + 4) * ISO_ZOOM;
  const topParts = stackLayers(parts).filter((p) => p.categoria !== 'spin-gear' || isRunningCore(p));
  let topDefs = '';
  const topView = topParts.map((p, i) => {
    const b = partBody(p, `t${i}`, { spin, emblems });
    topDefs += b.defs;
    return b.body;
  }).join('');
  const tx = 2 * R * ISO_ZOOM + 20 + R * 0.6;
  const scaleTop = 0.6;
  const svg = `<defs>${iso.defs}${topDefs}</defs>`
    + `<g ${FONT} fill='${INK}'><text x='4' y='7' font-size='4.2' font-weight='700'>${esc(bey.nome)}</text>`
    + `<text x='4' y='11.5' font-size='2.5' opacity='0.75'>${esc([bey.tipo, bey.sistema, bey.rotacao, bey.codigo_produto].filter(Boolean).join(' · '))}</text></g>`
    + `<ellipse cx='${f(cx)}' cy='${f(cy + 4 * ISO_ZOOM)}' rx='${f(R * 1.05 * ISO_ZOOM)}' ry='${f(R * ISO_SQUASH * 1.05 * ISO_ZOOM)}' fill='${INK}' opacity='0.16'/>`
    + `<g transform='translate(${f(cx)} ${f(cy)}) scale(${ISO_ZOOM} ${f(ISO_SQUASH * ISO_ZOOM)})'>${iso.svg}</g>`
    + `<g transform='translate(${f(tx)} ${f(18 + R * scaleTop)}) scale(${scaleTop})'>${topView}</g>`
    + `<text x='${f(tx)}' y='${f(22 + R * 2 * scaleTop)}' ${FONT} font-size='2.2' text-anchor='middle' fill='${INK}' opacity='0.6'>vista de cima</text>`
    + `<g ${FONT} font-size='2.6' fill='${INK}'>`
    + `<text x='${f(w - 62)}' y='${f(h - 50)}'>Ø ${fmtMm(m.diametro_mm ?? R * 2)} · altura ${fmtMm(m.altura_mm ?? 0)}</text>`
    + `<text x='${f(w - 62)}' y='${f(h - 46)}'>peso ${fmtG(m.peso_g)}</text></g>`
    + statBars(bey.atributos, w - 62, h - 41)
    + ruler(4, h - 7);
  return frame(w, h, svg, `${bey.nome} (montada)`);
}

// Transparent top-down sprite of the whole bey (game sprite), 1 unit = 1 mm.
export function renderBeySprite(bey, parts, { emblems = {} } = {}) {
  const spin = bey.rotacao?.startsWith('esq') ? 'esquerda' : 'direita';
  const layers = stackLayers(parts).filter((p) => p.categoria !== 'spin-gear' || isRunningCore(p));
  const R = Math.max(10, ...layers.map((p) => topShape(p, spin).radius)) + 1;
  let defs = '';
  const body = layers.map((p, i) => {
    const b = partBody(p, `s${i}`, { spin, emblems });
    defs += b.defs;
    return b.body;
  }).join('');
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${f(-R)} ${f(-R)} ${f(R * 2)} ${f(R * 2)}' width='${f(R * 16)}' height='${f(R * 16)}'>`
    + `<title>${esc(bey.nome)} (sprite)</title><defs>${defs}</defs>${body}</svg>\n`;
}

export function renderBeyExploded(bey, parts, { emblems = {} } = {}) {
  const spin = bey.rotacao?.startsWith('esq') ? 'esquerda' : 'direita';
  const layers = stackLayers(parts);
  const R = Math.max(20, ...layers.map((p) => topShape(p, spin).radius));
  const GAP = 14;
  let defs = '';
  let body = '';
  let y = 22 + R * ISO_SQUASH;
  const labels = [];
  // Top of the stack first so the drawing reads top → bottom like the real assembly.
  [...layers].reverse().forEach((p, i) => {
    const t = Math.max(layerThickness(p), p.categoria === 'spin-gear' ? num(p.medidas?.altura_mm) ?? 6 : 0);
    const layer = isoLayer({ ...p, medidas: { ...p.medidas, altura_mm: { valor: t } } }, i, 0, spin, emblems);
    defs += layer.defs;
    const cy = y + t;
    body += `<g transform='translate(${f(R + 8)} ${f(cy)}) scale(1 ${ISO_SQUASH})'>${layer.svg}</g>`;
    labels.push({ p, y: cy - t / 2 });
    y = cy + R * ISO_SQUASH * 2 + GAP * 0.4;
  });
  const w = R * 2 + 100;
  const h = y + 10;
  const lx = R * 2 + 18;
  const text = labels.map(({ p, y: ly }) => {
    const mat = [p.material?.principal, ...(p.material?.outros ?? [])].filter(Boolean).join(' + ');
    return `<line x1='${f(R * 2 + 9)}' y1='${f(ly)}' x2='${f(lx - 1)}' y2='${f(ly)}' stroke='${INK}' stroke-width='0.25' stroke-dasharray='1 0.8'/>`
      + `<g ${FONT} fill='${INK}'><text x='${f(lx)}' y='${f(ly - 1)}' font-size='2.9' font-weight='700'>${esc(p.nome)}</text>`
      + `<text x='${f(lx)}' y='${f(ly + 2.6)}' font-size='2.2' opacity='0.8'>${esc(p.categoria)} · ${esc(mat || '?')} · ${fmtG(num(p.medidas?.peso_g))} · Ø ${fmtMm(num(p.medidas?.diametro_mm) ?? topShape(p).radius * 2)}</text></g>`;
  }).join('');
  const svg = `<defs>${defs}</defs>`
    + `<g ${FONT} fill='${INK}'><text x='4' y='7' font-size='4.2' font-weight='700'>${esc(bey.nome)}: vista explodida</text>`
    + `<text x='4' y='11.5' font-size='2.5' opacity='0.75'>peso total ${fmtG(bey.medidas?.peso_g)} · de cima para baixo</text></g>`
    + body + text + ruler(4, h - 7);
  return frame(w, h, svg, `${bey.nome} (explodida)`);
}

export function renderLauncher(launcher) {
  const fm = launcher.forma ?? {};
  const c = fm.cores ?? {};
  const prim = c.primaria ?? '#3a6fd8';
  const sec = c.secundaria ?? shade(prim, -0.3);
  const L = num(launcher.medidas?.comprimento_mm) ?? 95;
  const H = num(launcher.medidas?.altura_mm) ?? 40;
  const w = L + 70;
  const h = H + (fm.grip ? 60 : 30) + 20;
  const x0 = 10;
  const y0 = 18;
  const bodyH = H * 0.55;
  const style = `stroke='${INK}' stroke-width='0.6' stroke-linejoin='round'`;
  let s = `<defs><linearGradient id='lg' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${shade(prim, 0.35)}'/><stop offset='1' stop-color='${shade(prim, -0.25)}'/></linearGradient></defs>`;
  s += `<rect x='${x0}' y='${y0}' width='${f(L)}' height='${f(bodyH)}' rx='${fm.corpo === 'pistola' ? 8 : 4}' fill='url(#lg)' ${style}/>`;
  // Fork that holds the bey.
  s += `<path d='M${f(x0 + L * 0.62)} ${f(y0 + bodyH)}l-6 ${f(H * 0.35)}h4l5 ${f(-H * 0.2)}h${f(L * 0.2)}l5 ${f(H * 0.2)}h4l-6 ${f(-H * 0.35)}Z' fill='${sec}' ${style}/>`;
  s += `<rect x='${f(x0 + 6)}' y='${f(y0 + 4)}' width='${f(L * 0.4)}' height='${f(bodyH * 0.25)}' rx='1.5' fill='${shade(prim, 0.5)}' opacity='0.6'/>`;
  if (fm.grip) {
    s += `<path d='M${f(x0 + L * 0.18)} ${f(y0 + bodyH)}l-4 ${f(H * 0.9)}q0 6 7 6h10q6 0 5-6l-2 ${f(-H * 0.9)}Z' fill='${shade(sec, -0.1)}' ${style}/>`;
    for (let i = 1; i <= 4; i++) s += `<line x1='${f(x0 + L * 0.18 - 3 + i * 0.8)}' y1='${f(y0 + bodyH + i * H * 0.18)}' x2='${f(x0 + L * 0.18 + 13 - i * 0.4)}' y2='${f(y0 + bodyH + i * H * 0.18)}' stroke='${INK}' stroke-width='0.35' opacity='0.6'/>`;
  }
  if (fm.tipo_corda === 'string') {
    s += `<path d='M${f(x0 + L)} ${f(y0 + bodyH / 2)}q14 -6 22 4' fill='none' stroke='#eee' stroke-width='0.8'/>`;
    s += `<rect x='${f(x0 + L + 20)}' y='${f(y0 + bodyH / 2 - 2)}' width='14' height='12' rx='5' fill='${sec}' ${style}/>`;
  } else {
    const rl = 46;
    s += `<rect x='${f(x0 + L - 4)}' y='${f(y0 + bodyH / 2 - 2.5)}' width='${rl}' height='5' fill='#e8e2d0' ${style}/>`;
    for (let i = 0; i < 18; i++) s += `<rect x='${f(x0 + L - 2 + i * 2.4)}' y='${f(y0 + bodyH / 2 - 2.5)}' width='1' height='1.6' fill='${INK}'/>`;
    s += `<rect x='${f(x0 + L + rl - 6)}' y='${f(y0 + bodyH / 2 - 6)}' width='10' height='12' rx='3' fill='${sec}' ${style}/>`;
  }
  const spin = { direita: '↻ direita', esquerda: '↺ esquerda', dupla: '↻↺ dupla' }[launcher.rotacao] ?? '';
  s += `<g ${FONT} fill='${INK}'><text x='4' y='7' font-size='4' font-weight='700'>${esc(launcher.nome)}</text>`
    + `<text x='4' y='11.5' font-size='2.5' opacity='0.75'>${esc([launcher.tipo, spin, launcher.material?.principal].filter(Boolean).join(' · '))}</text></g>`;
  s += dimH(x0, x0 + L, h - 14, `${fmtMm(L)}`) + ruler(w - 16, h - 7);
  return frame(w, h, s, launcher.nome);
}

// Ripcord seen from above: toothed strip at real length plus the handle (docs/BEYBLADES.md).
export function renderRipcord(ripcord) {
  const fm = ripcord.forma ?? {};
  const L = num(ripcord.medidas?.comprimento_mm) ?? fm.comprimento_mm ?? 300;
  const width = num(ripcord.medidas?.largura_mm) ?? 9;
  const teeth = num(ripcord.medidas?.numero_dentes) ?? fm.dentes ?? Math.round(L / 3.2);
  const color = fm.cor ?? '#e8e2d0';
  const handleColor = fm.cor_pegador ?? '#3a6fd8';
  const style = `stroke='${INK}' stroke-width='0.5' stroke-linejoin='round'`;
  // Long cords are drawn folded in rows so the file stays readable at 1 mm = 1 unit.
  const ROW = 160;
  const rows = Math.max(1, Math.ceil(L / ROW));
  const x0 = 34;
  const y0 = 20;
  const gap = width + 10;
  const pitch = L / Math.max(1, teeth);
  let s = '';
  for (let r = 0; r < rows; r++) {
    const len = Math.min(ROW, L - r * ROW);
    const y = y0 + r * gap;
    const reverse = r % 2 === 1;
    const x = reverse ? x0 + ROW - len : x0;
    s += `<rect x='${f(x)}' y='${f(y)}' width='${f(len)}' height='${f(width)}' rx='1' fill='${color}' ${style}/>`;
    // Teeth are placed by their position along the whole cord, so none is lost at a fold.
    for (let i = Math.ceil((r * ROW) / pitch); i < teeth && i * pitch < r * ROW + len; i++) {
      s += `<rect x='${f(x + i * pitch - r * ROW + pitch * 0.2)}' y='${f(y)}' width='${f(pitch * 0.5)}' height='${f(width * 0.35)}' fill='${INK}' opacity='0.8'/>`;
    }
    if (r < rows - 1) {
      const cx = reverse ? x0 : x0 + ROW;
      s += `<path d='M${f(cx)} ${f(y + width / 2)}a${f(gap / 2)} ${f(gap / 2)} 0 0 ${reverse ? 0 : 1} 0 ${f(gap)}' fill='none' stroke='${color}' stroke-width='${f(width)}'/>`;
    }
  }
  const hy = y0 + width / 2;
  const handle = {
    anel: `<circle cx='18' cy='${f(hy)}' r='12' fill='none' stroke='${handleColor}' stroke-width='5'/><circle cx='18' cy='${f(hy)}' r='12' fill='none' ${style}/>`,
    T: `<rect x='22' y='${f(hy - 22)}' width='9' height='44' rx='4' fill='${handleColor}' ${style}/>`,
    retangular: `<rect x='8' y='${f(hy - 10)}' width='24' height='20' rx='3' fill='${handleColor}' ${style}/>`,
  }[fm.pegador] ?? `<circle cx='20' cy='${f(hy)}' r='11' fill='${handleColor}' ${style}/><circle cx='20' cy='${f(hy)}' r='4' fill='${PAPER}' ${style}/>`;
  const w = x0 + ROW + 24;
  const h = y0 + rows * gap + 22;
  const spin = { direita: '↻ direita', esquerda: '↺ esquerda', dupla: '↻↺ dupla' }[ripcord.sentido] ?? '';
  const body = `<g ${FONT} fill='${INK}'><text x='4' y='7' font-size='4' font-weight='700'>${esc(ripcord.nome)}</text>`
    + `<text x='4' y='11.5' font-size='2.5' opacity='0.75'>${esc([ripcord.tipo, spin, `${teeth} dentes`, ripcord.material?.principal].filter(Boolean).join(' · '))}</text></g>`
    + `<rect x='26' y='${f(hy - 1.5)}' width='${f(x0 - 26)}' height='3' fill='${handleColor}' ${style}/>` + handle + s + dimH(x0, x0 + Math.min(L, ROW), h - 12, `${fmtMm(L)}${rows > 1 ? ' (dobrado)' : ''}`) + ruler(w - 16, h - 7);
  return frame(w, h, body, ripcord.nome);
}
