export const COLORS = ["red", "blue", "black", "yellow"];

export const NUMBERS = Array.from({ length: 13 }, (_, i) => i + 1);

export function buildDeck() {
  const deck = [];

  for (let copy = 0; copy < 2; copy++) {
    for (const color of COLORS) {
      for (const num of NUMBERS) {
        deck.push({
          color,
          num,
          id: `${color}-${num}-${copy}`,
          isJokerFigure: false,
        });
      }
    }

    deck.push({
      color: "joker",
      num: 0,
      id: `joker-fig-${copy}`,
      isJokerFigure: true,
    });
  }

  return deck;
}

export function shuffle(arr: any[]) {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}