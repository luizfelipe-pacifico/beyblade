// Leitura de imagens de CD de PlayStation (BIN/CUE, trilha MODE2/2352) e do sistema de arquivos ISO 9660.
// Setor cru de 2352 bytes: sync (12) + cabeçalho (4) + subcabeçalho XA (8) + dados.
// Form 1: 2048 bytes de dados (arquivos comuns). Form 2: 2324 bytes (vídeo STR, áudio XA), mantidos crus.

export const RAW_SECTOR = 2352;
export const USER_DATA = 2048;
const DATA_OFFSET = 24;
const SUBMODE_FORM2 = 0x20;

export function sectorCount(bin) {
  return Math.floor(bin.length / RAW_SECTOR);
}

// Bit 5 do submode (byte 18 do setor; repetido no 22) marca Form 2.
export function isForm2(bin, lba) {
  return (bin[lba * RAW_SECTOR + 18] & SUBMODE_FORM2) !== 0;
}

export function readUserData(bin, lba) {
  const start = lba * RAW_SECTOR + DATA_OFFSET;
  return bin.subarray(start, start + USER_DATA);
}

// Imagem ISO (2048 bytes por setor) com os dados de usuário de todos os setores.
export function toIso(bin) {
  const n = sectorCount(bin);
  const iso = Buffer.alloc(n * USER_DATA);
  for (let lba = 0; lba < n; lba++) readUserData(bin, lba).copy(iso, lba * USER_DATA);
  return iso;
}

function readRecord(data, at) {
  const length = data[at];
  if (!length) return null;
  const nameLength = data[at + 32];
  let name = data.toString('latin1', at + 33, at + 33 + nameLength);
  name = name.replace(/;1$/, '');
  return {
    length,
    lba: data.readUInt32LE(at + 2),
    size: data.readUInt32LE(at + 10),
    isDir: (data[at + 25] & 0x02) !== 0,
    name,
  };
}

// Lista recursiva de arquivos a partir do Primary Volume Descriptor (setor 16).
export function listFiles(bin) {
  const pvd = readUserData(bin, 16);
  if (pvd[0] !== 1 || pvd.toString('latin1', 1, 6) !== 'CD001') throw new Error('Primary Volume Descriptor não encontrado no setor 16');
  const volumeId = pvd.toString('latin1', 40, 72).trim();
  const root = readRecord(pvd, 156);
  const files = [];

  function walk(dir, path) {
    const sectors = Math.ceil(dir.size / USER_DATA);
    for (let s = 0; s < sectors; s++) {
      const data = readUserData(bin, dir.lba + s);
      let at = 0;
      while (at < USER_DATA) {
        const rec = readRecord(data, at);
        if (!rec) break;
        at += rec.length;
        // Entradas "." e ".." têm nome de 1 byte 0x00 / 0x01.
        if (rec.name === '\u0000' || rec.name === '\u0001') continue;
        const full = path ? `${path}/${rec.name}` : rec.name;
        if (rec.isDir) walk(rec, full);
        else files.push({ path: full, lba: rec.lba, size: rec.size });
      }
    }
  }

  walk(root, '');
  return { volumeId, files };
}

// Conteúdo de um arquivo: Form 1 vira os bytes do arquivo; se algum setor for Form 2, devolve os setores crus.
export function readFile(bin, file) {
  const sectors = Math.max(1, Math.ceil(file.size / USER_DATA));
  let form2 = false;
  for (let i = 0; i < sectors && !form2; i++) form2 = isForm2(bin, file.lba + i);
  if (form2) {
    // Em Form 2 o tamanho no diretório conta 2048 por setor; os dados reais ocupam o setor inteiro.
    return { raw: true, data: bin.subarray(file.lba * RAW_SECTOR, (file.lba + sectors) * RAW_SECTOR) };
  }
  const out = Buffer.alloc(file.size);
  for (let i = 0; i < sectors; i++) {
    const chunk = readUserData(bin, file.lba + i);
    chunk.copy(out, i * USER_DATA, 0, Math.min(USER_DATA, file.size - i * USER_DATA));
  }
  return { raw: false, data: out };
}

// SYSTEM.CNF diz qual executável o BIOS do PS1 carrega (ex.: BOOT = cdrom:\SLPS_034.20;1).
export function bootExecutable(systemCnf) {
  const m = /BOOT\s*=\s*cdrom:\\?([^;\r\n]+)/i.exec(systemCnf);
  return m ? m[1].replace(/\\/g, '/') : null;
}
