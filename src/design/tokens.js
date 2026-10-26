// Tokens sem dependência de DOM: usados pelo canvas, pelo catálogo e pelos testes.
import tokens from '../../design-system/tokens.json' with { type: 'json' };

export const colors = {
  tinta: tokens.colors.tinta, tinta2: tokens.colors['tinta-2'], tinta3: tokens.colors['tinta-3'],
  papel: tokens.colors.papel, texto2: tokens.colors['texto-2'], texto3: tokens.colors['texto-3'],
  chamada: tokens.colors.chamada, p1: tokens.colors.p1, p2: tokens.colors.p2, destructive: tokens.colors.destructive,
  // Brilho de carga na batalha: ataque (rush) e defesa têm cor e forma próprias (D-027).
  ataque: tokens.colors.ataque, defesa: tokens.colors.defesa,
};
export const feras = Object.fromEntries(Object.entries(tokens.beasts).map(([key, beast]) =>
  [key, { nome: beast.name, campo: beast.field, campoTexto: beast.text }]));

// Pares de texto/fundo que a interface usa de verdade (nome, texto, fundo, mínimo WCAG).
export const textPairs = [
  ['texto principal', colors.papel, colors.tinta, 4.5],
  ['texto principal em painel', colors.papel, colors.tinta3, 4.5],
  ['texto secundário', colors.texto2, colors.tinta, 4.5],
  ['texto secundário em painel', colors.texto2, colors.tinta3, 4.5],
  ['meta', colors.texto3, colors.tinta, 4.5],
  ['meta em painel', colors.texto3, colors.tinta2, 4.5],
  ['ação principal', colors.tinta, colors.chamada, 4.5],
  ['chamada sobre tinta', colors.chamada, colors.tinta, 4.5],
  ['etiqueta P1', colors.tinta, colors.p1, 4.5],
  ['etiqueta P2', colors.tinta, colors.p2, 4.5],
  ['erro', colors.destructive, colors.tinta, 4.5],
  ...Object.values(feras).map((f) => [`cartela ${f.nome}`, f.campoTexto, f.campo, 3]),
];

export const motion = tokens.motion;

function channel(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * channel(n >> 16) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

// Razão de contraste WCAG 2.x entre duas cores hex (#rrggbb).
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
