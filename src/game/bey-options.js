// Beys que cada personagem pode escolher no carrossel (D-023) e como desenhá-las.
// Fonte: src/content/beys.generated.json (scripts/sync-art.js). Quando as entradas tiverem `dono`, o carrossel
// mostra todas as beys do personagem na ordem do anime; sem isso, só a bey padrão do roster.

// Agrupa as beys por personagem. `generated`: objeto slug → bey; `roster`: lista de { slug, beySlug }.
export function beysByCharacter(generated, roster) {
  const groups = Object.fromEntries(roster.map((c) => [c.slug, []]));
  const ordered = Object.values(generated).filter((b) => b.dono && groups[b.dono]);
  ordered.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  for (const bey of ordered) groups[bey.dono].push(bey.slug);
  for (const c of roster) {
    if (groups[c.slug].length === 0) groups[c.slug].push(c.beySlug);
    // A bey padrão do roster vem primeiro: é onde o carrossel abre.
    else if (groups[c.slug].includes(c.beySlug)) groups[c.slug] = [c.beySlug, ...groups[c.slug].filter((s) => s !== c.beySlug)];
  }
  return groups;
}

// Vista de topo da bey: o sprite da ROM (folha de 3 quadros de 32x32: dois girando, um parado) quando
// public/rom existe; senão, a arte vetorial da pesquisa.
export function beyImage(slug, romData) {
  const rom = romData?.beys?.[slug];
  if (rom) return { kind: 'sprite', src: rom.sprite, frames: rom.frames, size: rom.frameSize.width };
  return { kind: 'svg', src: `/art/beys/${slug}.svg` };
}

export function beyName(slug, generated, romData) {
  return generated[slug]?.nome ?? romData?.beys?.[slug]?.nome ?? slug;
}
