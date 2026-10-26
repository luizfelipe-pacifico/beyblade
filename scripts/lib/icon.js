// Funções puras do ícone (scripts/build-icon.mjs): achar o círculo do emblema e montar um .ico.

// O fundo falso é um quadriculado de cinzas claros, sem cor. O emblema tem borda azul-marinho e muita cor.
export function isBackground([r, g, b]) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min < 18 && min > 170;
}

// Lança raios do centro da imagem para fora e marca, em cada um, o último pixel que não é fundo.
// Ajusta um círculo por mínimos quadrados (Kåsa) nesses pontos, descartando os 10% mais distantes da mediana.
export function circleFromRays(pixel, width, height, rays = 360) {
  const cx0 = width / 2;
  const cy0 = height / 2;
  const maxR = Math.min(width, height) / 2 - 1;
  const points = [];
  for (let k = 0; k < rays; k++) {
    const t = (k / rays) * Math.PI * 2;
    const dx = Math.cos(t);
    const dy = Math.sin(t);
    // De fora para dentro: o primeiro pixel que não é fundo é a borda do emblema.
    for (let d = maxR; d > 0; d--) {
      if (!isBackground(pixel(cx0 + dx * d, cy0 + dy * d))) {
        points.push([cx0 + dx * d, cy0 + dy * d, d]);
        break;
      }
    }
  }
  const radii = points.map((p) => p[2]).sort((a, b) => a - b);
  const median = radii[Math.floor(radii.length / 2)];
  const kept = points
    .map((p) => [p, Math.abs(p[2] - median)])
    .sort((a, b) => a[1] - b[1])
    .slice(0, Math.ceil(points.length * 0.9))
    .map(([p]) => p);
  return fitCircle(kept);
}

// Ajuste algébrico de círculo: resolve x² + y² + D·x + E·y + F = 0 por mínimos quadrados.
export function fitCircle(points) {
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sz = 0, sxz = 0, syz = 0;
  for (const [x, y] of points) {
    const z = x * x + y * y;
    sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sz += z; sxz += x * z; syz += y * z;
  }
  const n = points.length;
  // Sistema normal 3x3 em (D, E, F), resolvido por Cramer.
  const m = [
    [sxx, sxy, sx],
    [sxy, syy, sy],
    [sx, sy, n],
  ];
  const v = [-sxz, -syz, -sz];
  const det = (a) => a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
  const d0 = det(m);
  const col = (i) => m.map((row, r) => row.map((val, c) => (c === i ? v[r] : val)));
  const D = det(col(0)) / d0;
  const E = det(col(1)) / d0;
  const F = det(col(2)) / d0;
  const cx = -D / 2;
  const cy = -E / 2;
  return { cx, cy, r: Math.sqrt(cx * cx + cy * cy - F) };
}

// Arquivo .ico com imagens PNG embutidas (aceito pelo Windows Vista+ e pelos navegadores).
export function encodeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, png } of images) {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size; // 0 significa 256
    e[1] = size >= 256 ? 0 : size;
    e[2] = 0;
    e[3] = 0;
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += png.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}
