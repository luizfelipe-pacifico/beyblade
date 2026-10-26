// Beys que cada personagem pode escolher no carrossel (D-023) e como desenhá-las.
// Fonte: src/content/beys.generated.json (scripts/sync-art.js): objeto id → bey com `slug`, `dono` (personagem)
// e `ordem` (0 = primeira no anime). O id é o que vai em b1/b2; o slug liga à pesquisa e à ROM.

// Agrupa os ids por personagem, na ordem do anime, com a bey padrão do roster na frente (onde o carrossel abre).
// Personagem sem nenhuma entrada cai na bey padrão do roster.
export function beysByCharacter(generated, roster) {
  const groups = Object.fromEntries(roster.map((c) => [c.slug, []]));
  const entries = Object.entries(generated).filter(([, b]) => b.dono && groups[b.dono]);
  entries.sort(([, a], [, b]) => (a.ordem ?? 0) - (b.ordem ?? 0));
  for (const [id, bey] of entries) groups[bey.dono].push(id);
  for (const c of roster) {
    const ids = groups[c.slug];
    if (ids.length === 0) ids.push(c.beySlug);
    else if (ids.includes(c.beySlug)) groups[c.slug] = [c.beySlug, ...ids.filter((id) => id !== c.beySlug)];
  }
  return groups;
}

// Vista de topo da bey: o sprite da ROM (folha de 3 quadros de 32x32: dois girando, um parado) quando
// public/rom existe; senão, a arte vetorial da pesquisa.
export function beyImage(id, generated, romData) {
  const slug = generated?.[id]?.slug ?? id;
  const rom = romData?.beys?.[slug];
  if (rom) return { kind: 'sprite', src: rom.sprite, frames: rom.frames, size: rom.frameSize.width };
  return { kind: 'svg', src: generated?.[id]?.sprite ?? `/art/beys/${slug}.svg` };
}

export function beyName(id, generated, romData) {
  const slug = generated?.[id]?.slug ?? id;
  return generated?.[id]?.nome ?? romData?.beys?.[slug]?.nome ?? slug;
}
