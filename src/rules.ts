import { tileValue } from "./scoring";

export function isJokerFigure(t) {
  return t.isJokerFigure === true;
}

export function isTwoTile(t) {
  return !isJokerFigure(t) && t.num === 2;
}

export function canActAsWild(t) {
  return isJokerFigure(t) || isTwoTile(t);
}

// ─── GROUP VALIDATION ────────────────────────────────────────────────────────

export function sequenceFrom(start, length) {
  return Array.from({ length }, (_, i) => ((start - 1 + i) % 13) + 1);
}

export function isLegalEscaleraWindow(start, length) {
  return start + length - 1 <= 14;
}

export function cyclicIndex(num, start) {
  return ((num - start + 13) % 13);
}

const COLOR_ORDER = {
  red: 0,
  blue: 1,
  black: 2,
  yellow: 3,
  joker: 4,
};

const ESCALERA_ORDER = [3,4,5,6,7,8,9,10,11,12,13,1,2];

const ESCALERA_RANK = Object.fromEntries(
  ESCALERA_ORDER.map((n,i)=>[n,i])
);

export function compareByEscalera(a,b) {
  const aw = canActAsWild(a);
  const bw = canActAsWild(b);

  if (aw !== bw) return aw ? 1 : -1;

  if (a.color !== b.color) {
    return (COLOR_ORDER[a.color] ?? 9) - (COLOR_ORDER[b.color] ?? 9);
  }

  return (ESCALERA_RANK[a.num] ?? 99) - (ESCALERA_RANK[b.num] ?? 99);
}

export function compareByPierna(a,b) {
  const aw = canActAsWild(a);
  const bw = canActAsWild(b);

  if (aw !== bw) return aw ? 1 : -1;

  if (a.num !== b.num) return a.num - b.num;

  return (COLOR_ORDER[a.color] ?? 9) - (COLOR_ORDER[b.color] ?? 9);
}

export function compareWildFirst(a,b) {
  const aw = canActAsWild(a);
  const bw = canActAsWild(b);

  if (aw !== bw) return aw ? -1 : 1;

  if (isJokerFigure(a) !== isJokerFigure(b)) {
    return isJokerFigure(a) ? -1 : 1;
  }

  if (a.color !== b.color) {
    return (COLOR_ORDER[a.color] ?? 9) - (COLOR_ORDER[b.color] ?? 9);
  }

  return a.num - b.num;
}

export function getEscaleraArrangement(tiles) {
  if (tiles.length < 3) return null;

  const fixedReals = tiles.filter(
    t => !isJokerFigure(t) && !isTwoTile(t)
  );

  if (fixedReals.length === 0) return null;

  const colors = new Set(fixedReals.map(t => t.color));

  if (colors.size !== 1) return null;

  const groupColor = fixedReals[0].color;

  const twos = tiles.filter(isTwoTile);
  const jokerFigures = tiles.filter(isJokerFigure);

  for (let start = 1; start <= 13; start++) {

    if (!isLegalEscaleraWindow(start, tiles.length)) continue;

    const seq = sequenceFrom(start, tiles.length);

    const positions = Array(tiles.length).fill(null);

    const replaceAs = {};

    let ok = true;

    for (const tile of fixedReals) {

      const pos = seq.findIndex(
        (n, idx) => n === tile.num && positions[idx] === null
      );

      if (pos === -1) {
        ok = false;
        break;
      }

      positions[pos] = tile;
    }

    if (!ok) continue;

    const wilds = [...jokerFigures];

    for (const two of twos) {

      const pos =
        two.color === groupColor
          ? seq.findIndex(
              (n, idx) => n === 2 && positions[idx] === null
            )
          : -1;

      if (pos !== -1) {
        positions[pos] = two;
      } else {
        wilds.push(two);
      }
    }

    const emptyIndexes = positions
      .map((v, idx) => v === null ? idx : null)
      .filter(v => v !== null);

    if (wilds.length !== emptyIndexes.length) continue;

    for (let i = 0; i < wilds.length; i++) {

      const wild = wilds[i];

      const idx = emptyIndexes[i];

      positions[idx] = wild;

      replaceAs[wild.id] = seq[idx];
    }

    return {
      orderedTiles: positions,
      replaceAs,
      sequence: seq,
    };
  }

  return null;
}

export function getPiernaArrangement(tiles) {

  if (tiles.length < 3 || tiles.length > 4) return null;

  const jokerFigures = tiles.filter(isJokerFigure);

  const twos = tiles.filter(isTwoTile);

  const nonWildReals = tiles.filter(
    t => !isJokerFigure(t) && !isTwoTile(t)
  );

  let targetNum = null;

  let baseTiles = [];

  let wilds = [];

  if (nonWildReals.length > 0) {

    const nums = new Set(nonWildReals.map(t => t.num));

    if (nums.size !== 1) return null;

    targetNum = nonWildReals[0].num;

    baseTiles = [...nonWildReals];

    wilds = [...twos, ...jokerFigures];

  } else if (twos.length > 0) {

    targetNum = 2;

    baseTiles = [...twos];

    wilds = [...jokerFigures];

  } else {

    return null;
  }

  if (wilds.length > 1) return null;

  const orderedTiles = [
    ...baseTiles.sort(compareByPierna),
    ...wilds.sort(compareWildFirst),
  ];

  const replaceAs = {};

  for (const wild of wilds) {

    if (wild.num !== targetNum || isJokerFigure(wild)) {
      replaceAs[wild.id] = targetNum;
    }
  }

  return {
    orderedTiles,
    replaceAs,
    targetNum,
  };
}

export function normalizeGroupTiles(tiles) {

  const escalera = getEscaleraArrangement(tiles);

  if (escalera) return escalera.orderedTiles;

  const pierna = getPiernaArrangement(tiles);

  if (pierna) return pierna.orderedTiles;

  return null;
}

export function isValidEscalera(tiles) {
  return getEscaleraArrangement(tiles) !== null;
}

export function isValidPierna(tiles) {
  return getPiernaArrangement(tiles) !== null;
}

export function isValidGroup(tiles) {

  if (tiles.length < 3) return false;

  return (
    isValidEscalera(tiles) ||
    isValidPierna(tiles)
  );
}

export function isCanasta(group) {
  return group.tiles.length >= 7;
}

export function groupUsesActiveWild(group) {

  const escalera = getEscaleraArrangement(group.tiles);

  if (escalera) {
    return Object.keys(escalera.replaceAs || {}).length > 0;
  }

  const pierna = getPiernaArrangement(group.tiles);

  if (pierna) {
    return Object.keys(pierna.replaceAs || {}).length > 0;
  }

  return group.tiles.some(t => canActAsWild(t));
}

export function isCanastaPura(group) {
  return isCanasta(group) && !groupUsesActiveWild(group);
}

export function isCanastalImpura(group) {
  return isCanasta(group) && groupUsesActiveWild(group);
}

export function playerHasCanasta(table, playerIdx) {

  return table.some(
    grp => grp.owner === playerIdx && isCanasta(grp)
  );
}

export function groupPoints(grp) {

  let pts = grp.tiles.reduce(
    (s,t)=>s+tileValue(t),
    0
  );

  if (isCanastaPura(grp)) pts += 200;
  else if (isCanastalImpura(grp)) pts += 100;

  return pts;
}