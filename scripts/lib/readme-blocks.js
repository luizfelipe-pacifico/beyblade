// Generated README sections (between markers) for beys, parts and launchers. The rest of each
// README is hand-written research and is never touched.
import { ATTRIBUTES } from '../../src/beyblade/stats.js';

const START = '<!-- auto:inicio (gerado por npm run build:research; não edite este bloco) -->';
const END = '<!-- auto:fim -->';
const LABELS = {
  ataque: 'Ataque', defesa: 'Defesa', stamina: 'Stamina', velocidade: 'Velocidade', peso: 'Peso',
  equilibrio: 'Equilíbrio', resistencia_knockout: 'Resistência a KO',
};
const SLOT_LABELS = {
  'bit-chip': 'Bit Chip', 'attack-ring': 'Attack Ring', 'support-part': 'Support Part',
  'weight-disk': 'Weight Disk', 'spin-gear': 'Spin Gear / Core', 'blade-base': 'Blade Base',
};

const br = (v) => (v == null ? '?' : String(Math.round(v * 10) / 10).replace('.', ','));
const measure = (m) => (m?.valor == null ? '?' : `${br(m.valor)}${m.fonte && m.fonte !== 'oficial' ? ` <sub>${m.fonte}</sub>` : ''}`);
const stars = (s) => (s ? ['ataque', 'defesa', 'stamina'].map((k) => br(s[k] ?? null)).join(' / ') : '—');
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|');

// Replaces the generated block, or inserts it right after the H1 title.
export function upsertBlock(readme, block) {
  const wrapped = `${START}\n${block.trim()}\n${END}`;
  const eol = readme.includes('\r\n') ? '\r\n' : '\n';
  const text = readme.replace(/\r\n/g, '\n');
  let out;
  if (text.includes(START) && text.includes(END)) {
    out = text.slice(0, text.indexOf(START)) + wrapped + text.slice(text.indexOf(END) + END.length);
  } else {
    const lines = text.split('\n');
    const h1 = lines.findIndex((l) => l.startsWith('# '));
    const at = h1 === -1 ? 0 : h1 + 1;
    // The old hero photo moved to referencia/; the generated block replaces it.
    const rest = lines.slice(at).filter((l, i) => !(i < 4 && /^!\[[^\]]*\]\((referencia\/)?(imagem|foto)\.[a-z]+\)\s*$/i.test(l)));
    out = [...lines.slice(0, at), '', wrapped, '', ...rest].join('\n').replace(/\n{3,}/g, '\n\n');
  }
  return out.replace(/\n/g, eol);
}

export function beyBlock({ bey, used, ownerName, root, launcher, beast, references }) {
  const m = bey.medidas ?? {};
  const lines = [];
  lines.push(`![${bey.nome}: montada](montada.svg)`, '');
  lines.push('| Ficha | |', '|---|---|');
  lines.push(`| Dono | [${cell(ownerName)}](../../README.md) |`);
  lines.push(`| Tipo · sistema · rotação | ${cell([bey.tipo, bey.sistema, bey.rotacao].filter(Boolean).join(' · '))} |`);
  if (bey.codigo_produto) lines.push(`| Código do produto | ${cell(bey.codigo_produto)} |`);
  lines.push(`| Montada | Ø ${br(m.diametro_mm)} mm · altura ${br(m.altura_mm)} mm · **${br(m.peso_g)} g** (soma das peças) |`);
  if (beast) lines.push(`| Fera bit | [${cell(beast.nome)}](${root}feras-bit/${beast.id}/) |`);
  if (launcher) lines.push(`| Lançador | [${cell(launcher.nome)}](${root}${bey.lancador}/) |`);
  if (bey.ripcord) lines.push(`| Ripcord | [${cell(bey.ripcord.split('/').pop())}](${root}${bey.ripcord}/) |`);
  lines.push('', '### Peças', '');
  lines.push('| Camada | Peça | Material | Ø mm | Altura mm | Peso g | Estrelas Takara (A / D / S) | Desenho |');
  lines.push('|---|---|---|---|---|---|---|---|');
  for (const p of used) {
    const mat = [p.material?.principal, ...(p.material?.outros ?? [])].filter(Boolean).join(' + ');
    lines.push(`| ${SLOT_LABELS[p.categoria] ?? p.categoria} | [${cell(p.nome)}](${root}pecas/${p.id}/) | ${cell(mat || '?')} | ${measure(p.medidas?.diametro_mm)} | ${measure(p.medidas?.altura_mm)} | ${measure(p.medidas?.peso_g)} | ${stars(p.stats_oficiais)} | [ver](pecas/${p.categoria}.svg) |`);
  }
  lines.push('', '<sub>Fonte de cada medida em subscrito (wiki, comunidade, estimado). Detalhes em cada ficha de peça.</sub>', '');
  lines.push('![Vista explodida](explodida.svg)', '');
  lines.push('### Atributos', '');
  lines.push('| Atributo | Brinquedo (calculado) | Ajuste anime | Jogo |', '|---|---|---|---|');
  for (const k of ATTRIBUTES) {
    const adj = bey.ajuste_anime?.[k];
    lines.push(`| ${LABELS[k]} | ${br(bey.atributos_brinquedo?.[k])} | ${adj ? (adj > 0 ? `+${br(adj)}` : br(adj)) : '—'} | **${br(bey.atributos?.[k])}** |`);
  }
  const c = bey.calculo ?? {};
  const bits = [
    c.ponta && `ponta ${c.ponta} (atrito ${br(c.atrito_ponta)})`,
    c.tipo_contato && `contato ${c.tipo_contato} (recoil ${br(c.recoil)})`,
    c.distribuicao_peso && `peso do WD na ${c.distribuicao_peso}`,
    c.engine_gear && `Engine Gear (${c.engine_gear})`,
    c.stats_oficiais && `estrelas Takara de ${c.stats_oficiais.partes} peça(s)`,
  ].filter(Boolean);
  lines.push('', `Calculado por \`src/beyblade/stats.js\` a partir de: ${bits.join(', ') || 'medidas das peças'}. Modelo em [docs/BEYBLADES.md](${root}../docs/BEYBLADES.md).`, '');
  if (beast) {
    lines.push('### Fera bit em cima da bey', '');
    lines.push(`<img src="${root}feras-bit/${beast.id}/idle.svg" width="240" alt="${cell(beast.nome)}"> <img src="sprite.svg" width="120" alt="sprite">`, '');
    const sounds = Object.entries(beast.sons ?? {}).map(([k, v]) => `[${k}](${root}feras-bit/${beast.id}/${v})`);
    if (sounds.length) lines.push(`Sons: ${sounds.join(' · ')}. Animações: [invocação](${root}feras-bit/${beast.id}/invocacao.svg) · [ataque](${root}feras-bit/${beast.id}/ataque.svg).`, '');
  }
  if (references.length) {
    lines.push('<details><summary>Fotos de referência (terceiros, só para estudo)</summary>', '');
    lines.push(references.map((r) => `[${r}](referencia/${r})`).join(' · '), '', '</details>');
  }
  return lines.join('\n');
}

export function partBlock(part, { usedBy, root }) {
  const lines = [];
  lines.push('<img src="topo.svg" width="380" alt="vista de cima"> <img src="lateral.svg" width="380" alt="perfil">', '');
  const mat = [part.material?.principal, ...(part.material?.outros ?? [])].filter(Boolean).join(' + ');
  lines.push('| Medidas e material | |', '|---|---|');
  lines.push(`| Diâmetro | ${measure(part.medidas?.diametro_mm)} mm |`);
  lines.push(`| Altura / espessura | ${measure(part.medidas?.altura_mm)} mm |`);
  lines.push(`| Peso | ${measure(part.medidas?.peso_g)} g |`);
  lines.push(`| Material | ${cell(mat || '?')}${part.acabamento ? ` (${part.acabamento})` : ''} |`);
  lines.push(`| Estrelas Takara (A / D / S) | ${stars(part.stats_oficiais)} |`);
  if (usedBy.length) lines.push(`| Usada em | ${usedBy.map(({ key, nome }) => `[${cell(nome)}](${root}personagens/${key.replace('/', '/beyblades/')}/)`).join(', ')} |`);
  return lines.join('\n');
}

export function launcherBlock(launcher) {
  const a = launcher.atributos ?? {};
  const lines = ['![Lançador](lancador.svg)', ''];
  lines.push('| Atributo | Valor |', '|---|---|');
  for (const [k, label] of [['forca', 'Força'], ['rpm_max', 'RPM máx. (estimado)'], ['precisao', 'Precisão'], ['controle_angulo', 'Controle de ângulo'], ['facilidade', 'Facilidade']]) {
    if (a[k] != null) lines.push(`| ${label} | ${br(a[k])} |`);
  }
  return lines.join('\n');
}

export function ripcordBlock(ripcord) {
  const m = ripcord.medidas ?? {};
  const a = ripcord.atributos ?? {};
  const lines = ['![Ripcord](ripcord.svg)', ''];
  lines.push('| Medida / atributo | Valor |', '|---|---|');
  lines.push(`| Comprimento | ${measure(m.comprimento_mm)} mm |`);
  lines.push(`| Largura · espessura | ${measure(m.largura_mm)} · ${measure(m.espessura_mm)} mm |`);
  lines.push(`| Dentes (passo) | ${measure(m.numero_dentes)} (${measure(m.passo_dente_mm)} mm) |`);
  lines.push(`| Peso | ${measure(m.peso_g)} g |`);
  for (const [k, label] of [['spin_entregue', 'Spin entregue'], ['facilidade', 'Facilidade'], ['durabilidade', 'Durabilidade']]) {
    if (a[k] != null) lines.push(`| ${label} | ${br(a[k])} |`);
  }
  return lines.join('\n');
}
