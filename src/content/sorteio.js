// Sorteios da seleção (D-047). Puro: recebe o catálogo de beys (beys.generated.json) e o sorteio.
export const ALEATORIO = 'aleatoria';

// "aleatoria" vira uma das beys do próprio personagem; qualquer outro valor passa direto.
export function sortearBey(beys, personagem, escolha, random = Math.random) {
  if (escolha !== ALEATORIO) return escolha;
  const lista = Object.values(beys).filter((b) => b.dono === personagem);
  return lista.length ? lista[Math.floor(random() * lista.length) % lista.length].id : undefined;
}
