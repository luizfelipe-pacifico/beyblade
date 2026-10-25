// Rebuilds generated research assets: part/bey/launcher SVGs, computed attributes and the index.
// Usage: node scripts/build-research.js   (see docs/BEYBLADES.md)
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { computeAttributes } from '../src/beyblade/stats.js';
import {
  renderBeyAssembled, renderBeyExploded, renderBeySprite, renderRipcord, renderLauncher, renderPartSide, renderPartTop,
} from './lib/render-parts.js';
import { beyBlock, launcherBlock, partBlock, ripcordBlock, upsertBlock } from './lib/readme-blocks.js';

const ROOT = join(import.meta.dirname, '..', 'pesquisa-bakuten');
const CHARACTER_ORDER = ['tyson-granger', 'kai-hiwatari', 'ray-kon', 'max-tate', 'daichi-sumeragi', 'tala',
  'bryan-kuznetsov', 'brooklyn-masefield', 'lee', 'robert-jurgen'];
// Bey `pecas` keys → catalog categories, top to bottom.
const SLOT_CATEGORY = {
  bit_chip: 'bit-chip', attack_ring: 'attack-ring', support_part: 'support-part',
  weight_disk: 'weight-disk', spin_gear: 'spin-gear', blade_base: 'blade-base',
};

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const writeJson = (p, data) => writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
const dirs = (p) => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name) : []);

function loadParts() {
  const parts = new Map();
  for (const cat of dirs(join(ROOT, 'pecas'))) {
    for (const slug of dirs(join(ROOT, 'pecas', cat))) {
      const file = join(ROOT, 'pecas', cat, slug, 'dados.json');
      if (existsSync(file)) parts.set(`${cat}/${slug}`, { ...readJson(file), id: `${cat}/${slug}`, _dir: dirname(file) });
    }
  }
  return parts;
}

function loadEmblems() {
  const emblems = {};
  for (const slug of dirs(join(ROOT, 'feras-bit'))) {
    const file = join(ROOT, 'feras-bit', slug, 'emblema.svg');
    if (existsSync(file)) emblems[slug] = readFileSync(file, 'utf8');
  }
  return emblems;
}

// Slot → part id(s). Prefers ids already in the bey file, then the category maps in pecas/_mapa.
function loadMaps() {
  const maps = {};
  const dir = join(ROOT, 'pecas', '_mapa');
  for (const cat of Object.values(SLOT_CATEGORY)) {
    const file = join(dir, `${cat}.json`);
    maps[cat] = existsSync(file) ? readJson(file) : {};
  }
  const launchers = join(ROOT, 'lancadores', '_mapa.json');
  maps.lancadores = existsSync(launchers) ? readJson(launchers) : {};
  return maps;
}

function resolveSlot(bey, beyKey, slot, maps, parts) {
  const current = bey.pecas?.[slot];
  const fromMap = maps[SLOT_CATEGORY[slot]][beyKey];
  const candidates = [current, fromMap].flat().filter((v) => typeof v === 'string');
  const ids = candidates.filter((id) => parts.has(id));
  return ids.length ? [...new Set(ids)] : null;
}

function beyKeys() {
  const keys = [];
  for (const who of CHARACTER_ORDER) {
    for (const bey of dirs(join(ROOT, 'personagens', who, 'beyblades'))) keys.push(`${who}/${bey}`);
  }
  return keys;
}

function updateReadme(file, block) {
  if (existsSync(file)) writeFileSync(file, upsertBlock(readFileSync(file, 'utf8'), block));
}

// Order matters: "Black Dranzer" before "Dranzer", "Gaia Dragoon" before "Dragoon".
const BEAST_SLUGS = ['black-dranzer', 'gaia-dragoon', 'dranzer', 'dragoon', 'driger', 'draciel', 'wolborg', 'falborg', 'zeus', 'galeon', 'griffolyon'];

// The first research stored the beast as free text; the build keeps that text and a slug the game can use.
function beastFields(bey, used) {
  const text = bey.fera_bit_descricao ?? (BEAST_SLUGS.includes(bey.fera_bit) ? null : bey.fera_bit) ?? null;
  if (/^nenhuma/i.test(text ?? '')) return { fera_bit: null, fera_bit_descricao: text };
  const fromText = text && BEAST_SLUGS.find((slug) => text.toLowerCase().includes(slug.replace('-', ' ')));
  const fromChip = used.find((p) => p.categoria === 'bit-chip')?.forma?.emblema;
  const slug = (BEAST_SLUGS.includes(bey.fera_bit) && bey.fera_bit) || fromText || fromChip || null;
  return { fera_bit: slug, ...(text && { fera_bit_descricao: text }) };
}

function characterName(who) {
  const readme = join(ROOT, 'personagens', who, 'README.md');
  return existsSync(readme) ? readFileSync(readme, 'utf8').match(/^# (.+)$/m)?.[1]?.trim() ?? who : who;
}

function main() {
  const parts = loadParts();
  const emblems = loadEmblems();
  const maps = loadMaps();
  const report = { pecas: parts.size, beys: 0, lancadores: 0, slots_sem_peca: [] };

  for (const part of parts.values()) {
    writeFileSync(join(part._dir, 'topo.svg'), renderPartTop(part, { emblems }));
    writeFileSync(join(part._dir, 'lateral.svg'), renderPartSide(part));
  }

  for (const slug of dirs(join(ROOT, 'lancadores'))) {
    const file = join(ROOT, 'lancadores', slug, 'dados.json');
    if (!existsSync(file)) continue;
    const launcher = readJson(file);
    writeFileSync(join(ROOT, 'lancadores', slug, 'lancador.svg'), renderLauncher(launcher));
    updateReadme(join(ROOT, 'lancadores', slug, 'README.md'), launcherBlock(launcher));
    report.lancadores++;
  }

  for (const slug of dirs(join(ROOT, 'lancadores', 'ripcords'))) {
    const dir = join(ROOT, 'lancadores', 'ripcords', slug);
    if (!existsSync(join(dir, 'dados.json'))) continue;
    const ripcord = readJson(join(dir, 'dados.json'));
    writeFileSync(join(dir, 'ripcord.svg'), renderRipcord(ripcord));
    updateReadme(join(dir, 'README.md'), ripcordBlock(ripcord));
    report.ripcords = (report.ripcords ?? 0) + 1;
  }

  const index = [];
  const usedBy = new Map();
  for (const key of beyKeys()) {
    const [who, slug] = key.split('/');
    const dir = join(ROOT, 'personagens', who, 'beyblades', slug);
    const file = join(dir, 'dados.json');
    if (!existsSync(file)) continue;
    const bey = readJson(file);

    const pecas = {};
    const used = [];
    const placeholders = [];
    for (const slot of Object.keys(SLOT_CATEGORY)) {
      const ids = resolveSlot(bey, key, slot, maps, parts);
      if (!ids) {
        // The bey has this layer but the part is unconfirmed: count a typical part in the stats only.
        const original = bey.pecas_nomes_originais?.[slot] ?? bey.pecas?.[slot];
        if (original && !/integrad|running core/i.test(String(original))) {
          report.slots_sem_peca.push(`${key}:${slot}`);
          pecas[slot] = null;
          placeholders.push({ categoria: SLOT_CATEGORY[slot], nome: 'não confirmado', medidas: {} });
        }
        continue;
      }
      // HMS cores sometimes appear under two slots; a part is counted once.
      const fresh = ids.filter((id) => !used.some((u) => u.id === id));
      if (fresh.length === 0) { report.duplicadas = [...(report.duplicadas ?? []), `${key}:${slot}`]; continue; }
      ids.splice(0, ids.length, ...fresh);
      pecas[slot] = ids.length === 1 ? ids[0] : ids;
      // Shared parts (e.g. Right SG) come in different colours per bey.
      used.push(...ids.map((id) => {
        const p = parts.get(id);
        const colors = p.cores_por_bey?.[key];
        return colors ? { ...p, cores: { ...p.cores, ...colors } } : p;
      }));
    }

    const computed = computeAttributes([...used, ...placeholders], { anime: bey.ajuste_anime ?? {} });
    if (!bey.atributos_primeira_pesquisa && bey.atributos) bey.atributos_primeira_pesquisa = bey.atributos;
    if (!bey.pecas_nomes_originais && bey.pecas) bey.pecas_nomes_originais = bey.pecas;
    Object.assign(bey, {
      pecas,
      ...beastFields(bey, used),
      lancador: maps.lancadores[key] ?? bey.lancador ?? null,
      ripcord: maps.lancadores.ripcords?.[key] ?? bey.ripcord ?? null,
      medidas: computed.medidas,
      atributos_brinquedo: computed.atributos_brinquedo,
      ajuste_anime: bey.ajuste_anime ?? {},
      atributos: computed.atributos,
      calculo: computed.entradas,
    });
    writeJson(file, bey);

    writeFileSync(join(dir, 'montada.svg'), renderBeyAssembled(bey, used, { emblems }));
    writeFileSync(join(dir, 'explodida.svg'), renderBeyExploded(bey, used, { emblems }));
    writeFileSync(join(dir, 'sprite.svg'), renderBeySprite(bey, used, { emblems }));
    mkdirSync(join(dir, 'pecas'), { recursive: true });
    for (const p of used) writeFileSync(join(dir, 'pecas', `${p.categoria}.svg`), renderPartTop(p, { emblems }));

    const beastFile = bey.fera_bit && join(ROOT, 'feras-bit', bey.fera_bit, 'dados.json');
    const beast = beastFile && existsSync(beastFile) ? { id: bey.fera_bit, ...readJson(beastFile) } : null;
    const launcherFile = bey.lancador && join(ROOT, bey.lancador, 'dados.json');
    const refDir = join(dir, 'referencia');
    updateReadme(join(dir, 'README.md'), beyBlock({
      bey, used, ownerName: characterName(who), root: '../../../../',
      launcher: launcherFile && existsSync(launcherFile) ? readJson(launcherFile) : null,
      beast, references: existsSync(refDir) ? readdirSync(refDir) : [],
    }));
    for (const p of used) (usedBy.get(p.id) ?? usedBy.set(p.id, []).get(p.id)).push({ key, nome: bey.nome });
    index.push({ who, slug, bey, used });
    report.beys++;
  }

  for (const part of parts.values()) {
    updateReadme(join(part._dir, 'README.md'), partBlock(part, { usedBy: usedBy.get(part.id) ?? [], root: '../../../' }));
  }
  writeIndex(index);
  writeGalleryData(index);
  console.log(JSON.stringify(report, null, 2));
}

// Data file for galeria/index.html. A .js (not .json) so the page works from file:// without fetch.
function writeGalleryData(rows) {
  const rel = (...p) => ['..', ...p].join('/');
  const has = (...p) => existsSync(join(ROOT, ...p));
  const feras = {};
  for (const slug of dirs(join(ROOT, 'feras-bit'))) {
    const file = join(ROOT, 'feras-bit', slug, 'dados.json');
    const data = existsSync(file) ? readJson(file) : {};
    feras[slug] = {
      nome: data.nome ?? slug,
      overlay: data.overlay ?? null,
      anim: Object.fromEntries(['idle', 'invocacao', 'ataque'].filter((a) => has('feras-bit', slug, `${a}.svg`)).map((a) => [a, rel('feras-bit', slug, `${a}.svg`)])),
      sons: Object.fromEntries(['invocacao', 'rugido', 'ataque'].filter((a) => has('feras-bit', slug, 'sons', `${a}.wav`)).map((a) => [a, rel('feras-bit', slug, 'sons', `${a}.wav`)])),
    };
  }
  const personagens = CHARACTER_ORDER.map((who) => {
    const readme = join(ROOT, 'personagens', who, 'README.md');
    const nome = existsSync(readme) ? readFileSync(readme, 'utf8').match(/^# (.+)$/m)?.[1] ?? who : who;
    return {
      id: who, nome,
      retrato: has('personagens', who, 'retrato.svg') ? rel('personagens', who, 'retrato.svg') : null,
      beys: rows.filter((r) => r.who === who).map(({ slug, bey, used }) => {
        const base = ['personagens', who, 'beyblades', slug];
        const launcher = bey.lancador && has(bey.lancador, 'dados.json') ? readJson(join(ROOT, bey.lancador, 'dados.json')) : null;
        return {
          id: slug, nome: bey.nome, tipo: bey.tipo, sistema: bey.sistema, rotacao: bey.rotacao, fera: bey.fera_bit,
          medidas: bey.medidas, atributos: bey.atributos, atributos_brinquedo: bey.atributos_brinquedo,
          sprite: rel(...base, 'sprite.svg'), montada: rel(...base, 'montada.svg'), explodida: rel(...base, 'explodida.svg'),
          pecas: used.map((p) => ({ nome: p.nome, categoria: p.categoria, material: p.material?.principal ?? null,
            peso_g: p.medidas?.peso_g?.valor ?? null, imagem: rel(...base, 'pecas', `${p.categoria}.svg`) })),
          lancador: launcher ? { nome: launcher.nome, imagem: rel(bey.lancador, 'lancador.svg'), atributos: launcher.atributos ?? null } : null,
          ripcord: bey.ripcord && has(bey.ripcord, 'dados.json')
            ? { nome: readJson(join(ROOT, bey.ripcord, 'dados.json')).nome, imagem: rel(bey.ripcord, 'ripcord.svg') } : null,
        };
      }),
    };
  });
  const sons = Object.fromEntries(has('sons-batalha', 'sons')
    ? readdirSync(join(ROOT, 'sons-batalha', 'sons')).filter((n) => n.endsWith('.wav')).map((n) => [n.replace('.wav', ''), rel('sons-batalha', 'sons', n)])
    : []);
  mkdirSync(join(ROOT, 'galeria'), { recursive: true });
  writeFileSync(join(ROOT, 'galeria', 'dados.js'),
    `// Gerado por npm run build:research. Não edite.\nwindow.GALERIA = ${JSON.stringify({ personagens, feras, sons })};\n`);
}

function writeIndex(rows) {
  const a = (b, k) => String(b.atributos?.[k] ?? '-').replace('.', ',');
  const lines = rows.map(({ who, slug, bey }) => `| ${who} | [${bey.nome}](personagens/${who}/beyblades/${slug}/) | ${bey.tipo ?? '?'} | ${bey.sistema ?? '?'} | ${bey.rotacao ?? '?'} | ${String(bey.medidas?.peso_g ?? '?').replace('.', ',')} g | ${['ataque', 'defesa', 'stamina', 'velocidade', 'peso', 'equilibrio', 'resistencia_knockout'].map((k) => a(bey, k)).join(' / ')} |`);
  writeFileSync(join(ROOT, 'INDICE.md'), `# Índice de beyblades

Gerado por \`npm run build:research\` a partir dos \`dados.json\` (não edite à mão). Atributos calculados das peças + ajuste do anime ([docs/BEYBLADES.md](../docs/BEYBLADES.md)): **Atq / Def / Sta / Vel / Peso / Equil / Res. KO** (1–10).

| Personagem | Beyblade | Tipo | Sistema | Rotação | Peso | Atributos |
|---|---|---|---|---|---|---|
${lines.join('\n')}

Total: ${rows.length} beyblades.
`);
}

main();
