// Compressão "ECD" do Bey Battle Tournament 2 (PS1) e texturas TIM. Reimplementa a função do executável em
// 0x800211B0 (SLPM_871.30); formato em docs/PS1.md.
//
// Cabeçalho de 16 bytes, campos big-endian: "ECD\x01", bytes iniciais sem compressão, tamanho total dos
// dados (inclui os iniciais) e tamanho descomprimido. Depois vem um LZSS com janela de 1 KB:
// - os bytes iniciais vão direto para a saída e NÃO entram no anel;
// - anel de 1024 bytes zerado, cursor começando em 0x3BE (1024 - 66, o maior comprimento de cópia);
// - flags lidas do bit 0 ao 7; bit 1 = literal; bit 0 = cópia de 2 bytes (a, c):
//   posição = a | (c & 0xC0) << 2, comprimento = (c & 0x3F) + 3.

import { bgr555 } from './gba-gfx.js';

export function isEcd(buf, offset = 0) {
  return buf.length >= offset + 16 && buf.toString('latin1', offset, offset + 4) === 'ECD\u0001';
}

export function ecdDecompress(buf, offset = 0) {
  if (!isEcd(buf, offset)) throw new Error(`sem cabeçalho ECD em 0x${offset.toString(16)}`);
  const prefix = buf.readUInt32BE(offset + 4);
  const total = buf.readUInt32BE(offset + 8);
  const size = buf.readUInt32BE(offset + 12);
  const src = buf.subarray(offset + 16, offset + 16 + total);
  const out = Buffer.alloc(size);
  let n = 0;
  for (let i = 0; i < prefix && n < size; i++) out[n++] = src[i];

  const ring = new Uint8Array(1024);
  let r = 0x3be;
  let p = prefix;
  let flags = 0;
  const next = () => (p < src.length ? src[p++] : -1);
  const emit = (byte) => {
    if (n < size) out[n++] = byte;
    ring[r] = byte;
    r = (r + 1) & 0x3ff;
  };

  for (;;) {
    flags >>= 1;
    if (!(flags & 0x100)) {
      const f = next();
      if (f < 0) break;
      flags = f | 0xff00;
    }
    if (flags & 1) {
      const byte = next();
      if (byte < 0) break;
      emit(byte);
    } else {
      const a = next();
      const c = next();
      if (a < 0 || c < 0) break;
      const pos = a | ((c & 0xc0) << 2);
      const len = (c & 0x3f) + 3;
      for (let k = 0; k < len; k++) emit(ring[(pos + k) & 0x3ff]);
    }
  }
  return out;
}

// Arquivos do jogo: tabela de offsets u32 no início (o primeiro offset diz o tamanho da tabela).
export function containerEntries(buf) {
  if (buf.length < 4) return [];
  const count = buf.readUInt32LE(0) / 4;
  if (!Number.isInteger(count) || count < 1 || count > 4096 || count * 4 > buf.length) return [];
  const entries = [];
  for (let i = 0; i < count; i++) {
    const at = buf.readUInt32LE(i * 4);
    if (at > 0 && at < buf.length) entries.push({ index: i, offset: at });
  }
  return entries;
}

// TIM do PS1 (4bpp/8bpp com paleta, ou 16bpp direto) → RGBA. Cor 0x0000 é transparente, como no hardware.
export function timToRgba(tim) {
  if (tim.readUInt32LE(0) !== 0x10) throw new Error('não é TIM');
  const flags = tim.readUInt32LE(4);
  const mode = flags & 7;
  let at = 8;
  let clut = null;
  if (flags & 8) {
    const bnum = tim.readUInt32LE(at);
    clut = tim.subarray(at + 12, at + bnum);
    at += bnum;
  }
  const wWords = tim.readUInt16LE(at + 8);
  const height = tim.readUInt16LE(at + 10);
  const pixels = tim.subarray(at + 12);
  const width = mode === 0 ? wWords * 4 : mode === 1 ? wWords * 2 : wWords;
  const rgba = Buffer.alloc(width * height * 4);
  const put = (i, color) => {
    if ((color & 0xffff) === 0) return;
    const [r, g, b] = bgr555(color & 0x7fff);
    rgba.set([r, g, b, 255], i * 4);
  };
  for (let i = 0; i < width * height; i++) {
    if (mode === 0) {
      const byte = pixels[i >> 1];
      put(i, clut.readUInt16LE((i & 1 ? byte >> 4 : byte & 0xf) * 2));
    } else if (mode === 1) {
      put(i, clut.readUInt16LE(pixels[i] * 2));
    } else {
      put(i, pixels.readUInt16LE(i * 2));
    }
  }
  return { width, height, rgba };
}
