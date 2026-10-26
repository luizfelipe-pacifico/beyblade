// Ampliação de pixel art sem borrar: Scale2x (algoritmo EPX/AdvMAME2x). Cada pixel vira 2x2 e as diagonais
// ganham degraus menores olhando os vizinhos; aplicado duas vezes dá 4x. Trabalha em RGBA (Buffer).

function same(px, i, j) {
  return px.readUInt32LE(i * 4) === px.readUInt32LE(j * 4);
}

export function scale2x(rgba, width, height) {
  const out = Buffer.alloc(rgba.length * 4);
  const w2 = width * 2;
  const copy = (dst, src) => rgba.copy(out, dst * 4, src * 4, src * 4 + 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const a = y > 0 ? p - width : p; // cima
      const b = x < width - 1 ? p + 1 : p; // direita
      const c = x > 0 ? p - 1 : p; // esquerda
      const d = y < height - 1 ? p + width : p; // baixo
      const o = (y * 2) * w2 + x * 2;
      const diff = !same(rgba, a, d) && !same(rgba, c, b);
      copy(o, diff && same(rgba, c, a) ? a : p);
      copy(o + 1, diff && same(rgba, a, b) ? b : p);
      copy(o + w2, diff && same(rgba, d, c) ? c : p);
      copy(o + w2 + 1, diff && same(rgba, b, d) ? d : p);
    }
  }
  return { rgba: out, width: width * 2, height: height * 2 };
}

export function scale4x(rgba, width, height) {
  const once = scale2x(rgba, width, height);
  return scale2x(once.rgba, once.width, once.height);
}
