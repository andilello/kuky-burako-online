export function tileValue(t: any) {
  if (t.isJokerFigure === true) return 50;
  if (t.num === 1) return 15;
  if (t.num === 2) return 20;
  if (t.num <= 7) return 5;
  return 10;
}

export function handPenalty(tiles: any[]) {
  return tiles.reduce((s, t) => s + tileValue(t), 0);
}

export function groupSum(tiles: any[]) {
  return tiles.reduce((s, t) => s + tileValue(t), 0);
}