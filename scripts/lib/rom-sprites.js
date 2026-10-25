// Localiza os conjuntos de quadros na ROM, deduz paletas e monta folhas de sprites (um quadro ao lado do outro).
import { bgr555 } from './gba-gfx.js';
import { decodeFrame, readFrameSetHeader } from './rom-frames.js';

const ROM_BASE = 0x08000000;
const ROM_END = 0x08400000;

function plausibleHeader(rom, offset) {
  if (offset + 0x20 > rom.length) return null;
  const h = readFrameSetHeader(rom, offset);
  if (h.frameCount < 1 || h.frameCount > 256) return null;
  if (!h.width || !h.height || h.width % 8 || h.height % 8 || h.width > 64 || h.height > 64) return null;
  if (h.tilesPerFrame !== (h.width / 8) * (h.height / 8)) return null;
  if (h.frameHeaderSize !== 4 && h.frameHeaderSize !== 8) return null;
  if (h.frameTableOffset < 0x20 || h.frameTableOffset > h.dataOffset || h.dataOffset > 0x2000) return null;
  try {
    decodeFrame(rom, offset, h.frameCount - 1, h);
  } catch {
    return null;
  }
  return h;
}

// Varre todos os ponteiros alinhados da ROM e guarda os destinos que têm cabeçalho de conjunto de quadros válido.
export function findFrameSets(rom) {
  const checked = new Map();
  for (let at = 0; at + 4 <= rom.length; at += 4) {
    const word = rom.readUInt32LE(at);
    if (word < ROM_BASE || word >= ROM_END || word & 3) continue;
    const offset = word - ROM_BASE;
    if (!checked.has(offset)) checked.set(offset, plausibleHeader(rom, offset));
  }
  return [...checked].filter(([, header]) => header).map(([offset, header]) => ({ offset, header })).sort((a, b) => a.offset - b.offset);
}

function looksLikePalette(rom, offset) {
  if (offset + 32 > rom.length) return false;
  let nonZero = 0;
  for (let i = 0; i < 16; i++) {
    const color = rom.readUInt16LE(offset + i * 2);
    if (color & 0x8000) return false;
    if (color) nonZero++;
  }
  return nonZero >= 3;
}

// Nos scripts do jogo o ponteiro do sprite costuma vir seguido do ponteiro da paleta. Escolhe o mais frequente.
export function guessPalettes(rom, sets) {
  const known = new Set(sets.map((s) => s.offset));
  const votes = new Map();
  for (let at = 0; at + 8 <= rom.length; at += 4) {
    const word = rom.readUInt32LE(at);
    if (word < ROM_BASE || word >= ROM_END) continue;
    const offset = word - ROM_BASE;
    if (!known.has(offset)) continue;
    const next = rom.readUInt32LE(at + 4);
    if (next < ROM_BASE || next >= ROM_END || next & 1) continue;
    const palette = next - ROM_BASE;
    if (known.has(palette) || !looksLikePalette(rom, palette)) continue;
    const tally = votes.get(offset) ?? new Map();
    tally.set(palette, (tally.get(palette) ?? 0) + 1);
    votes.set(offset, tally);
  }
  const result = new Map();
  for (const [offset, tally] of votes) result.set(offset, [...tally].sort((a, b) => b[1] - a[1])[0][0]);
  return result;
}

// Bonecos do mapa (ROM 0x0807BE2C, registros de 28 bytes marcados por 0x0807DB20): +4 sprite, +8 índice do blader
// (-1 = figurante). A paleta do blader vem da lista em 0x080910E8 (55 ponteiros, um por blader).
export function bladerPalettes(rom, { npcTable = 0x7be2c, npcSize = 0x1c, marker = 0x0807db20, paletteList = 0x910e8, bladers = 55 } = {}) {
  const result = new Map();
  for (let at = npcTable; rom.readUInt32LE(at) === marker; at += npcSize) {
    const blader = rom.readUInt32LE(at + 8);
    if (blader >= bladers) continue;
    result.set(rom.readUInt32LE(at + 4) - ROM_BASE, rom.readUInt32LE(paletteList + blader * 4) - ROM_BASE);
  }
  return result;
}

// Folha com todos os quadros lado a lado. Sem paleta, usa tons de cinza pelo índice da cor.
export function renderSheet(rom, offset, header, paletteOffset) {
  const { width: fw, height: fh, frameCount, bpp } = header;
  const width = fw * frameCount;
  const rgba = Buffer.alloc(width * fh * 4);
  const tileBytes = bpp === 4 ? 32 : 64;
  const tilesX = fw / 8;
  const color = (index) => {
    if (paletteOffset === null) {
      const gray = bpp === 4 ? index * 17 : index;
      return [gray, gray, gray];
    }
    return bgr555(rom.readUInt16LE(paletteOffset + index * 2));
  };
  for (let f = 0; f < frameCount; f++) {
    const tiles = decodeFrame(rom, offset, f, header);
    for (let py = 0; py < fh; py++) {
      for (let px = 0; px < fw; px++) {
        const base = ((py >> 3) * tilesX + (px >> 3)) * tileBytes;
        let index;
        if (bpp === 4) {
          const byte = tiles[base + (py & 7) * 4 + ((px & 7) >> 1)];
          index = px & 1 ? byte >> 4 : byte & 0xf;
        } else {
          index = tiles[base + (py & 7) * 8 + (px & 7)];
        }
        if (index === 0) continue;
        rgba.set([...color(index), 255], (py * width + f * fw + px) * 4);
      }
    }
  }
  return { width, height: fh, rgba };
}
