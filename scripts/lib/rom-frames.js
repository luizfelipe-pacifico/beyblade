// Decodificador dos conjuntos de quadros (sprites) do Beyblade G-Revolution.
// Reimplementa copyFrameToVramARM (ROM 0x083D36F4, copiada para a IWRAM no boot); formato em
// docs/REVERSE_ENGINEERING.md. Devolve os tiles de cada quadro já no formato da VRAM do GBA.

// Dicionário de linhas de cor única (ROM 0x083D2808): a palavra i repete o nibble i nos 8 pixels.
const ROW_DICTIONARY = Array.from({ length: 16 }, (_, i) => (i * 0x11111111) >>> 0);

function popcount(value) {
  let count = 0;
  for (let v = value; v; v >>= 1) count += v & 1;
  return count;
}

export function readFrameSetHeader(rom, offset) {
  return {
    frameCount: rom.readUInt32LE(offset),
    width: rom[offset + 4],
    height: rom[offset + 5],
    compressed: (rom[offset + 7] & 0x80) !== 0,
    bpp: rom[offset + 0x0c] & 1 ? 4 : 8,
    frameHeaderSize: rom[offset + 0x0d],
    tilesPerFrame: rom.readUInt16LE(offset + 0x0e),
    dataOffset: rom.readUInt32LE(offset + 0x10),
    frameTableOffset: rom.readUInt32LE(offset + 0x1c),
  };
}

// Um tile comprimido: byte de controle (2 bits por par de linhas: trocar a palavra-base pelo dicionário),
// nibbles de índice no dicionário e, por par de linhas, um byte de flags que diz quais bytes viram literais.
function decodeTile(rom, cursor, out, outAt, rowWords) {
  let control = rom[cursor];
  let nibbleAt = cursor + 1;
  let p = nibbleAt + Math.ceil(popcount(control) / 2);
  let highHalf = false;
  let word = ROW_DICTIONARY[0];
  const nextNibble = () => {
    highHalf = !highHalf;
    if (highHalf) return rom[nibbleAt] & 0xf;
    return rom[nibbleAt++] >> 4;
  };
  for (let pair = 0; pair < rowWords / 2; pair++) {
    const flags = rom[p++];
    for (let half = 0; half < 2; half++) {
      if (control & (1 << half)) word = ROW_DICTIONARY[nextNibble()];
      const bits = (flags >> (half * 4)) & 0xf;
      let value = word;
      for (let b = 0; b < 4; b++) {
        if (bits & (1 << b)) value = ((value & ~(0xff << (b * 8))) | (rom[p++] << (b * 8))) >>> 0;
      }
      out.writeUInt32LE(value >>> 0, outAt + (pair * 2 + half) * 4);
    }
    control >>= 2;
  }
  return p;
}

export function decodeFrame(rom, offset, frame, header = readFrameSetHeader(rom, offset)) {
  if (frame < 0 || frame >= header.frameCount) throw new RangeError(`quadro ${frame} fora de 0..${header.frameCount - 1}`);
  const tileBytes = header.bpp === 4 ? 32 : 64;
  const out = Buffer.alloc(header.tilesPerFrame * tileBytes);
  const relative = rom.readUInt32LE(offset + header.frameTableOffset + frame * 4);
  const start = offset + header.dataOffset + relative;
  let mask = rom.readUInt32LE(start);
  const reloadMask = header.frameHeaderSize > 4 ? rom.readUInt32LE(start + 4) : 0;
  let cursor = start + (header.frameHeaderSize & 0xfc);
  let outAt = 0;
  let remaining = header.tilesPerFrame;

  const dataTiles = (count) => {
    for (let t = 0; t < count; t++) {
      if (header.compressed) cursor = decodeTile(rom, cursor, out, outAt, tileBytes / 4);
      else cursor += rom.copy(out, outAt, cursor, cursor + tileBytes);
      outAt += tileBytes;
    }
  };

  // Máscara de 32 bits lida a partir do bit 0: sequência de 1s = tiles vazios (zero), de 0s = tiles com dados.
  while (remaining > 0) {
    if (mask === 0) {
      // Como no original: com mais de 32 tiles restantes, processa só o excedente antes de recarregar a máscara.
      const count = remaining > 32 ? remaining - 32 : remaining;
      dataTiles(count);
      remaining -= count;
      mask = reloadMask;
      continue;
    }
    let count = 0;
    while (mask & 1) { count++; mask >>>= 1; }
    if (count > 0) {
      outAt += count * tileBytes;
    } else {
      while (!(mask & 1)) { count++; mask >>>= 1; }
      dataTiles(count);
    }
    remaining -= count;
    if (remaining === 32) mask = reloadMask;
  }
  return out;
}
