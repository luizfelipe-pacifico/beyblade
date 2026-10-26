// Copia a arte própria (D-008) de pesquisa-bakuten/ para public/art/, onde o Next a serve.
// pesquisa-bakuten/ continua sendo a fonte da verdade; public/art/ é gerado e fica fora do git.
// Só SVG e WAV próprios: fotos da wiki (referencia/, *.jpg) são de terceiros e nunca vão para o jogo.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { roster } from '../src/content/roster.js';

const root = path.join(import.meta.dirname, '..');
const source = path.join(root, 'pesquisa-bakuten');
const target = path.join(root, 'public', 'art');
const audioTarget = path.join(root, 'public', 'audio');

rmSync(target, { recursive: true, force: true });
for (const dir of ['batalha', 'feras']) rmSync(path.join(audioTarget, dir), { recursive: true, force: true });

let copied = 0;
function copyFiles(fromDir, toDir, ext = '.svg') {
  if (!existsSync(fromDir)) return;
  for (const entry of readdirSync(fromDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(ext)) {
      mkdirSync(toDir, { recursive: true });
      cpSync(path.join(fromDir, entry.name), path.join(toDir, entry.name));
      copied++;
    }
  }
}

for (const fera of readdirSync(path.join(source, 'feras-bit'), { withFileTypes: true })) {
  if (!fera.isDirectory()) continue;
  copyFiles(path.join(source, 'feras-bit', fera.name), path.join(target, 'feras', fera.name));
  // Sons sintetizados (D-008) também são próprios e podem ir para o jogo.
  copyFiles(path.join(source, 'feras-bit', fera.name, 'sons'), path.join(audioTarget, 'feras', fera.name), '.wav');
}
copyFiles(path.join(source, 'sons-batalha', 'sons'), path.join(audioTarget, 'batalha'), '.wav');
for (const p of readdirSync(path.join(source, 'personagens'), { withFileTypes: true })) {
  if (p.isDirectory()) copyFiles(path.join(source, 'personagens', p.name), path.join(target, 'personagens', p.name));
}
// Retratos vetorizados das imagens do usuário (D-033, fora do git) têm prioridade sobre o próprio.
const vetores = path.join(root, 'assets-usuario', 'personagens', 'vetor');
if (existsSync(vetores)) {
  for (const f of readdirSync(vetores)) {
    if (!f.endsWith('.svg')) continue;
    const dir = path.join(target, 'personagens', f.slice(0, -4));
    mkdirSync(dir, { recursive: true });
    cpSync(path.join(vetores, f), path.join(dir, 'retrato.svg'));
  }
}

// Bey de cada personagem do elenco: sprite de topo (gerado pelo build-research, em mm) e os dados
// que a batalha usa. O JSON é gerado e fica fora do git; a fonte é o dados.json da pesquisa.
const beys = {};
// Ordem no anime: segue a cadeia antecessora → sucessora da pesquisa; o que sobra vai no fim, por nome.
function cronologia(fichas) {
  const porSlug = new Map(fichas.map((f) => [f.slug, f]));
  const inicio = fichas.filter((f) => !porSlug.has(f.d.antecessora));
  const ordem = [];
  for (const f of inicio) {
    for (let atual = f; atual && !ordem.includes(atual); atual = porSlug.get(atual.d.sucessora)) ordem.push(atual);
  }
  for (const f of [...fichas].sort((x, y) => x.slug.localeCompare(y.slug))) if (!ordem.includes(f)) ordem.push(f);
  return ordem;
}
for (const p of roster) {
  const base = path.join(source, 'personagens', p.slug, 'beyblades');
  const fichas = readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(path.join(base, e.name, 'dados.json')))
    .map((e) => ({ slug: e.name, dir: path.join(base, e.name), d: JSON.parse(readFileSync(path.join(base, e.name, 'dados.json'), 'utf8')) }));
  cronologia(fichas).forEach(({ slug, dir, d }, ordem) => {
    // Duas fichas com o mesmo slug (a Dranzer F do Kai e a que o Tyson usou): a chave ganha o dono.
    const id = beys[slug] ? `${slug}@${p.slug}` : slug;
    const arquivo = `${id.replace('@', '--')}.svg`;
    const sprite = path.join(dir, 'sprite.svg');
    if (existsSync(sprite)) {
      mkdirSync(path.join(target, 'beys'), { recursive: true });
      cpSync(sprite, path.join(target, 'beys', arquivo));
      copied++;
    }
    const especial = (d.especiais ?? [])[0];
    beys[id] = {
      id,
      slug,
      dono: p.slug,
      ordem,
      sprite: existsSync(sprite) ? `/art/beys/${arquivo}` : null,
      nome: slug === p.beySlug ? p.bey : d.nome,
      tipo: d.tipo,
      rotacao: d.rotacao,
      ponta: d.calculo?.ponta ?? null,
      atributos: d.atributos,
      medidas: { diametro_mm: d.medidas?.diametro_mm, peso_g: d.medidas?.peso_g },
      especial: typeof especial === 'string' ? especial : especial?.nome ?? 'Especial',
      // ✕+○ (Engine Gear, D-024) só existe nas beys do sistema Engine Gear.
      engineGear: d.sistema === 'engine-gear',
    };
  });
}
writeFileSync(path.join(root, 'src', 'content', 'beys.generated.json'), `${JSON.stringify(beys, null, 2)}\n`);

console.log(`art: ${copied} arquivos (SVG e WAV) copiados para public/; dados de ${Object.keys(beys).length} beys em src/content/beys.generated.json`);
