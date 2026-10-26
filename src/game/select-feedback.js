// Retorno de áudio e animação da seleção, decidido pela mudança de estado (puro, testável).
// Devolve a lista de efeitos de uma ação: { som, vaga?, voz?, flash? }. A tela toca os sons e as animações.

export function selectFeedback(prev, next, action) {
  if (prev === next) return [];
  const efeitos = [];

  if (prev.p2 !== 'human' && next.p2 === 'human') return [{ som: 'join', banner: 'p2' }];

  if (prev.phase !== next.phase) {
    if (next.phase === 'stage') efeitos.push({ som: 'stage' });
    if (next.phase === 'done') efeitos.push({ som: 'vs' });
    if (prev.phase === 'stage' && next.phase === 'select') efeitos.push({ som: 'back' });
    if (efeitos.length) return efeitos;
  }

  if (next.phase === 'stage') {
    if (prev.stageCursor !== next.stageCursor) efeitos.push({ som: 'move' });
    return efeitos;
  }

  next.slots.forEach((slot, vaga) => {
    const antes = prev.slots[vaga];
    if (antes.step === 'character' && slot.step === 'bey') efeitos.push({ som: 'lockIn', vaga, voz: slot.character, flash: true });
    else if (antes.step === 'bey' && slot.step === 'ready') efeitos.push({ som: 'confirm', vaga, rugido: slot.character, flash: true });
    else if (antes.step !== 'character' && slot.step === 'character') efeitos.push({ som: 'back', vaga });
    else if (antes.step === 'ready' && slot.step === 'bey') efeitos.push({ som: 'back', vaga });
    else if (antes.cursor !== slot.cursor) efeitos.push({ som: 'move', vaga });
    else if (antes.beyCursor !== slot.beyCursor) efeitos.push({ som: 'carousel', vaga });
  });

  if (efeitos.length === 0 && action === 'back') efeitos.push({ som: 'back' });
  return efeitos;
}
