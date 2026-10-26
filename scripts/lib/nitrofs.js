// Leitura de ROMs de Nintendo DS (.nds): cabeçalho, NitroFS (FNT/FAT), overlays, NARC e LZ10/LZ11.
// Funções puras sobre Buffer; quem grava em disco é o scripts/extract-nds.js.

const ascii = (buf, at, len) => buf.toString('latin1', at, at + len).replace(/\0+$/, '');

// Cabeçalho de 0x200 bytes no início da ROM (offsets do GBATEK).
export function readHeader(rom) {
  if (rom.length < 0x200) throw new Error('ROM menor que o cabeçalho do DS (0x200 bytes)');
  const u32 = (at) => rom.readUInt32LE(at);
  return {
    title: ascii(rom, 0x00, 12),
    gameCode: ascii(rom, 0x0c, 4),
    makerCode: ascii(rom, 0x10, 2),
    unitCode: rom[0x12],
    capacity: 128 * 1024 << rom[0x14], // tamanho do chip: 128 KB << n
    romVersion: rom[0x1e],
    arm9: { offset: u32(0x20), entry: u32(0x24), ramAddress: u32(0x28), size: u32(0x2c) },
    arm7: { offset: u32(0x30), entry: u32(0x34), ramAddress: u32(0x38), size: u32(0x3c) },
    fnt: { offset: u32(0x40), size: u32(0x44) },
    fat: { offset: u32(0x48), size: u32(0x4c) },
    arm9Overlays: { offset: u32(0x50), size: u32(0x54) },
    arm7Overlays: { offset: u32(0x58), size: u32(0x5c) },
    bannerOffset: u32(0x68),
    usedRomSize: u32(0x80),
    headerSize: u32(0x84),
  };
}

// FAT: 8 bytes por arquivo (início e fim, absolutos na ROM).
export function readFat(rom, header = readHeader(rom)) {
  const { offset, size } = header.fat;
  const entries = [];
  for (let at = offset; at < offset + size; at += 8) {
    entries.push({ start: rom.readUInt32LE(at), end: rom.readUInt32LE(at + 4) });
  }
  return entries;
}

// FNT: tabela principal (8 bytes por diretório) + subtabelas com os nomes.
// Byte de tipo: 0 = fim, 0x01–0x7F = arquivo (tamanho do nome), 0x81–0xFF = subdiretório (+ id u16).
export function readFnt(rom, header = readHeader(rom)) {
  const base = header.fnt.offset;
  const dirCount = rom.readUInt16LE(base + 6); // na entrada da raiz, o "pai" guarda o total de diretórios
  const names = new Map(); // id do arquivo -> caminho
  const dirs = [];

  function walk(dirIndex, path) {
    const entry = base + dirIndex * 8;
    let at = base + rom.readUInt32LE(entry);
    let fileId = rom.readUInt16LE(entry + 4);
    for (;;) {
      const type = rom[at++];
      if (type === 0) break;
      const len = type & 0x7f;
      const name = rom.toString('latin1', at, at + len);
      at += len;
      const full = path ? `${path}/${name}` : name;
      if (type & 0x80) {
        const id = rom.readUInt16LE(at);
        at += 2;
        if ((id & 0xfff) >= dirCount) throw new Error(`diretório ${id.toString(16)} fora da FNT`);
        dirs.push(full);
        walk(id & 0xfff, full);
      } else {
        names.set(fileId++, full);
      }
    }
  }

  walk(0, '');
  return { dirCount, dirs, names };
}

// Tabela de overlays: 32 bytes por overlay (id, endereço na RAM, tamanhos, id do arquivo na FAT, flags).
export function readOverlays(rom, table) {
  const list = [];
  for (let at = table.offset; at < table.offset + table.size; at += 32) {
    const flags = rom.readUInt32LE(at + 28);
    list.push({
      id: rom.readUInt32LE(at),
      ramAddress: rom.readUInt32LE(at + 4),
      ramSize: rom.readUInt32LE(at + 8),
      bssSize: rom.readUInt32LE(at + 12),
      fileId: rom.readUInt32LE(at + 24),
      compressed: (flags >>> 24 & 1) === 1, // bit 0 do byte alto: comprimido (BLZ)
    });
  }
  return list;
}

// Lista completa: arquivos com nome da FNT + overlays (sem nome, ganham um caminho em overlay/).
export function listFiles(rom) {
  const header = readHeader(rom);
  const fat = readFat(rom, header);
  const { names, dirs } = readFnt(rom, header);
  const files = [];
  for (const [id, path] of names) files.push({ id, path, ...fat[id] });
  for (const [kind, table] of [['overlay9', header.arm9Overlays], ['overlay7', header.arm7Overlays]]) {
    for (const ov of readOverlays(rom, table)) {
      const pad = String(ov.id).padStart(4, '0');
      files.push({ id: ov.fileId, path: `overlay/${kind}_${pad}.bin`, ...fat[ov.fileId], overlay: ov });
    }
  }
  files.sort((a, b) => a.id - b.id);
  return { header, dirs, files };
}

export function fileData(rom, file) {
  return rom.subarray(file.start, file.end);
}

// NARC: "NARC" + BTAF (FAT local) + BTNF (nomes, opcional) + GMIF (dados).
export function isNarc(buf) {
  return buf.length >= 16 && buf.toString('latin1', 0, 4) === 'NARC';
}

export function readNarc(buf) {
  if (!isNarc(buf)) throw new Error('não é um NARC');
  let at = buf.readUInt16LE(12); // tamanho do cabeçalho
  const blocks = {};
  for (let i = 0; i < buf.readUInt16LE(14) && at + 8 <= buf.length; i++) {
    const magic = buf.toString('latin1', at, at + 4);
    const size = buf.readUInt32LE(at + 4);
    blocks[magic] = { at, size };
    at += size;
  }
  const btaf = blocks.BTAF;
  const gmif = blocks.GMIF;
  if (!btaf || !gmif) throw new Error('NARC sem BTAF/GMIF');
  const count = buf.readUInt16LE(btaf.at + 8);
  const dataStart = gmif.at + 8;
  const files = [];
  for (let i = 0; i < count; i++) {
    const e = btaf.at + 12 + i * 8;
    const start = buf.readUInt32LE(e);
    const end = buf.readUInt32LE(e + 4);
    files.push(buf.subarray(dataStart + start, dataStart + end));
  }
  return files;
}

// LZ77 da BIOS do GBA/DS. Cabeçalho: tipo (0x10 ou 0x11) + tamanho descomprimido (24 bits).
// Flags lidas do bit 7 para o 0; bit 1 = referência, bit 0 = literal.
export function lzSize(buf) {
  if (buf.length < 4 || (buf[0] !== 0x10 && buf[0] !== 0x11)) return 0;
  return buf.readUIntLE(1, 3);
}

export function decompressLz(buf) {
  const type = buf[0];
  if (type !== 0x10 && type !== 0x11) throw new Error(`tipo de compressão desconhecido: 0x${type?.toString(16)}`);
  let size = buf.readUIntLE(1, 3);
  let at = 4;
  if (size === 0) { // tamanho estendido em 32 bits
    size = buf.readUInt32LE(4);
    at = 8;
  }
  const out = Buffer.alloc(size);
  let pos = 0;
  while (pos < size) {
    if (at >= buf.length) throw new Error('fluxo LZ terminou antes do fim');
    const flags = buf[at++];
    for (let bit = 7; bit >= 0 && pos < size; bit--) {
      if (!(flags >> bit & 1)) {
        out[pos++] = buf[at++];
        continue;
      }
      let len;
      let disp;
      if (type === 0x10) {
        const a = buf[at++];
        const b = buf[at++];
        len = (a >> 4) + 3;
        disp = ((a & 0xf) << 8 | b) + 1;
      } else {
        // LZ11: o nibble alto escolhe comprimentos de 4, 8 ou 16 bits.
        const a = buf[at];
        const hi = a >> 4;
        if (hi === 0) {
          len = ((a & 0xf) << 4 | buf[at + 1] >> 4) + 0x11;
          disp = ((buf[at + 1] & 0xf) << 8 | buf[at + 2]) + 1;
          at += 3;
        } else if (hi === 1) {
          len = ((a & 0xf) << 12 | buf[at + 1] << 4 | buf[at + 2] >> 4) + 0x111;
          disp = ((buf[at + 2] & 0xf) << 8 | buf[at + 3]) + 1;
          at += 4;
        } else {
          len = hi + 1;
          disp = ((a & 0xf) << 8 | buf[at + 1]) + 1;
          at += 2;
        }
      }
      if (disp > pos) throw new Error('referência LZ antes do início');
      for (let i = 0; i < len && pos < size; i++, pos++) out[pos] = out[pos - disp];
    }
  }
  return out;
}

// Compressão "BLZ" dos overlays/ARM9 (LZ invertido, lido do fim para o começo).
// Rodapé: u32 [-8] = (tamanho do cabeçalho << 24) | tamanho comprimido; u32 [-4] = bytes a mais.
export function decompressBlz(buf) {
  const footer = buf.readUInt32LE(buf.length - 8);
  const extra = buf.readUInt32LE(buf.length - 4);
  const headerLen = footer >>> 24;
  const compLen = footer & 0xffffff;
  const out = Buffer.alloc(buf.length + extra);
  buf.copy(out);
  let src = buf.length - headerLen;
  let dst = out.length;
  const stop = buf.length - compLen;
  while (src > stop) {
    const flags = out[--src];
    for (let bit = 7; bit >= 0 && src > stop; bit--) {
      if (!(flags >> bit & 1)) {
        out[--dst] = out[--src];
        continue;
      }
      const b1 = out[--src];
      const b0 = out[--src];
      const len = (b1 >> 4) + 3;
      const disp = ((b1 & 0xf) << 8 | b0) + 3;
      for (let i = 0; i < len; i++, dst--) out[dst - 1] = out[dst - 1 + disp];
    }
  }
  return out;
}
