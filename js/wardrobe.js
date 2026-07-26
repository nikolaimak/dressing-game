// Wardrobe: every garment is generated SVG in the same black-marker style
// as the source drawing (bell gowns, spiky crowns, top hats, bead necklaces...).

import {
  stroke,
  solid,
  scribble,
  hatch,
  loops,
  speckle,
  beads,
  blob,
  dot,
  rng,
  ellipsePts,
  arcPts,
  teeth,
  scallop,
  star,
  PAPER,
} from './marker.js';
import { A, SHOULDER, WAIST_HALF, torsoPts, armPath } from './figures.js';

const CX = A.cx;

/* ------------------------------------------------------------------ helpers */

function skirtPts(waistHalf, waistY, hemHalf, hemY, bow = 16) {
  const pts = [[CX - waistHalf, waistY]];
  pts.push([CX - hemHalf * 0.68, waistY + (hemY - waistY) * 0.48]);
  pts.push([CX - hemHalf, hemY - 14]);
  for (let i = 1; i < 8; i++) {
    const t = i / 8;
    pts.push([CX - hemHalf + 2 * hemHalf * t, hemY + bow * Math.sin(Math.PI * t)]);
  }
  pts.push([CX + hemHalf, hemY - 14]);
  pts.push([CX + hemHalf * 0.68, waistY + (hemY - waistY) * 0.48]);
  pts.push([CX + waistHalf, waistY]);
  return pts;
}

function bodicePts(kind, { top = A.shoulderY - 2, bottom = A.waistY + 6, pad = 4 } = {}) {
  return torsoPts(kind, { top, bottom, pad });
}

function limb(pts, P, w = 20, seed = 101) {
  return (
    stroke(pts, { w: w + 5, seed, color: P.ink }) + stroke(pts, { w, seed: seed + 1, color: P.fill })
  );
}

function sleeves(kind, style, P, seed = 111) {
  const l = armPath(kind, 'l');
  const r = armPath(kind, 'r');
  if (style === 'none') return '';
  if (style === 'long') return limb(l, P, 19, seed) + limb(r, P, 19, seed + 4);
  if (style === 'short') {
    const cut = (p) => [p[0], [(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2 + 6]];
    return limb(cut(l), P, 23, seed) + limb(cut(r), P, 23, seed + 4);
  }
  if (style === 'puff') {
    const sh = SHOULDER[kind];
    return (
      solid(ellipsePts(CX - sh - 2, A.shoulderY + 16, 20, 18, 16), { seed, color: P.fill, edge: 5, edgeColor: P.ink }) +
      solid(ellipsePts(CX + sh + 2, A.shoulderY + 16, 20, 18, 16), { seed: seed + 2, color: P.fill, edge: 5, edgeColor: P.ink })
    );
  }
  if (style === 'bell') {
    const bell = (side) => {
      const p = armPath(kind, side);
      const hand = p[2];
      const el = p[1];
      const dir = side === 'l' ? -1 : 1;
      return solid(
        [
          [p[0][0], p[0][1] - 2],
          [el[0] + dir * 14, el[1]],
          [hand[0] + dir * 20, hand[1] + 4],
          [hand[0] - dir * 10, hand[1] + 6],
          [el[0] - dir * 6, el[1] + 4],
          [p[0][0] - dir * 12, p[0][1] + 6],
        ],
        { seed: seed + (side === 'l' ? 0 : 3), color: P.fill, edge: 5, edgeColor: P.ink }
      );
    };
    return bell('l') + bell('r');
  }
  return '';
}

function trousers(P, { hemY = A.ankleY - 10, w = 22, seed = 121, flare = 0 } = {}) {
  const l = [
    [CX - 12, A.hipY - 10],
    [A.legLx - 3, A.kneeY],
    [A.footLx - flare, hemY],
  ];
  const r = [
    [CX + 12, A.hipY - 10],
    [A.legRx + 3, A.kneeY],
    [A.footRx + flare, hemY],
  ];
  return limb(l, P, w, seed) + limb(r, P, w, seed + 6);
}

function shoeShape(x, y, dir, P, seed, style = 'flat') {
  const toe = x + dir * 20;
  if (style === 'heel') {
    return solid(
      [
        [x - 9, y - 8],
        [x + 9, y - 8],
        [toe, y + 12],
        [toe - dir * 4, y + 18],
        [x - dir * 6, y + 16],
        [x - dir * 7, y + 4],
      ],
      { seed, color: P.fill, edge: 5, edgeColor: P.ink }
    );
  }
  if (style === 'boot') {
    return (
      solid(
        [
          [x - 11, y - 46],
          [x + 11, y - 46],
          [x + 10, y + 4],
          [toe + dir * 2, y + 6],
          [toe, y + 17],
          [x - 12, y + 17],
          [x - 12, y + 4],
        ],
        { seed, color: P.fill, edge: 5, edgeColor: P.ink }
      ) + beads([[x - 10, y - 42], [x - 10, y - 4]], { r: 3, gap: 11, seed: seed + 9, color: P.ink })
    );
  }
  if (style === 'point') {
    return solid(
      [
        [x - 11, y - 10],
        [x + 11, y - 10],
        [toe + dir * 10, y + 10],
        [toe + dir * 12, y + 17],
        [x - 12, y + 17],
      ],
      { seed, color: P.fill, edge: 5, edgeColor: P.ink }
    );
  }
  if (style === 'sandal') {
    return (
      solid(
        [
          [x - 12, y + 8],
          [toe + dir * 4, y + 6],
          [toe + dir * 4, y + 17],
          [x - 12, y + 17],
        ],
        { seed, color: P.fill, edge: 5, edgeColor: P.ink }
      ) +
      stroke([[x - 8, y + 6], [x + dir * 6, y - 10]], { w: 6, seed: seed + 2, color: P.fill }) +
      stroke([[x + dir * 12, y + 4], [x + dir * 2, y - 12]], { w: 6, seed: seed + 3, color: P.fill })
    );
  }
  if (style === 'chunky') {
    return (
      solid(
        [
          [x - 13, y - 12],
          [x + 13, y - 12],
          [toe, y + 2],
          [toe, y + 10],
          [x - 13, y + 10],
        ],
        { seed, color: P.fill, edge: 5, edgeColor: P.ink }
      ) +
      solid(
        [
          [x - 15, y + 8],
          [toe + dir * 3, y + 8],
          [toe + dir * 3, y + 19],
          [x - 15, y + 19],
        ],
        { seed: seed + 4, color: P.fill, edge: 5, edgeColor: P.ink }
      )
    );
  }
  // flat
  return solid(
    [
      [x - 12, y - 8],
      [x + 12, y - 8],
      [toe, y + 4],
      [toe, y + 17],
      [x - 12, y + 17],
    ],
    { seed, color: P.fill, edge: 5, edgeColor: P.ink }
  );
}

function pair(fn) {
  return (P) => fn(A.footLx - 2, A.ankleY + 2, -1, P, 131) + fn(A.footRx + 2, A.ankleY + 2, 1, P, 137);
}

function gloveShape(from, to, P, seed) {
  return (
    limb([from, to], P, 20, seed) +
    solid(ellipsePts(to[0], to[1] + 9, 12, 13, 14), { seed: seed + 3, color: P.fill, edge: 5, edgeColor: P.ink })
  );
}

/* ------------------------------------------------------------------- lady */

const ladyOutfits = [
  {
    id: 'ball-gown',
    name: 'Ball Gown',
    preview: [10, 100, 220, 330],
    draw: (P) => {
      const skirt = skirtPts(24, 196, 102, 392, 18);
      return (
        loops(skirt, { count: 13, w: 4.6, seed: 201, color: P.fill, edge: 7, edgeColor: P.ink }) +
        speckle(skirt, { count: 12, r: 8, seed: 202, color: P.ink }) +
        sleeves('lady', 'puff', P, 203) +
        solid(bodicePts('lady', { top: A.shoulderY + 4 }), { seed: 205, color: P.fill }) +
        beads(scallop(CX - 96, CX + 96, 396, 6, 10), { r: 5, gap: 17, seed: 207, color: P.ink }) +
        dot(CX, 176, 7, 209, P.ink)
      );
    },
  },
  {
    id: 'night-gown',
    name: 'Midnight Gown',
    preview: [20, 100, 200, 330],
    draw: (P) => {
      const skirt = skirtPts(22, 194, 78, 396, 10);
      return (
        solid(skirt, { seed: 211, color: P.fill, edge: 6, edgeColor: P.ink }) +
        sleeves('lady', 'bell', P, 213) +
        solid(bodicePts('lady', { top: A.shoulderY + 6 }), { seed: 215, color: P.fill }) +
        beads(scallop(CX - 74, CX + 74, 400, 5, 8), { r: 5.5, gap: 16, seed: 217, color: P.ink })
      );
    },
  },
  {
    id: 'ruffle-gown',
    name: 'Ruffle Gown',
    preview: [14, 100, 212, 330],
    draw: (P) => {
      const skirt = skirtPts(23, 196, 92, 388, 14);
      let s = loops(skirt, { count: 9, w: 4, seed: 221, color: P.fill, edge: 7, edgeColor: P.ink });
      [[46, 268], [68, 322], [90, 372]].forEach(([hw, y], i) => {
        s += stroke(scallop(CX - hw, CX + hw, y, 5 + i, 11), { w: 5.5, seed: 223 + i, color: P.ink });
      });
      return (
        s +
        sleeves('lady', 'puff', P, 227) +
        solid(bodicePts('lady', { top: A.shoulderY + 4 }), { seed: 229, color: P.fill })
      );
    },
  },
  {
    id: 'star-gown',
    name: 'Star Gown',
    preview: [14, 100, 212, 330],
    draw: (P) => {
      const skirt = skirtPts(24, 196, 96, 390, 16);
      return (
        scribble(skirt, { gap: 14, w: 3.6, angle: 62, seed: 231, color: P.fill, edge: 7, edgeColor: P.ink }) +
        speckle(skirt, { count: 26, r: 4, seed: 232, color: P.ink, base: null }) +
        sleeves('lady', 'none', P) +
        solid(bodicePts('lady', { top: A.chestY - 22 }), { seed: 233, color: P.fill }) +
        star(CX, 186, 20, 6, 235, P.ink) +
        stroke(scallop(CX - 92, CX + 92, 394, 7, 12), { w: 5.5, seed: 237, color: P.ink })
      );
    },
  },
  {
    id: 'polka-frock',
    name: 'Polka Frock',
    preview: [24, 100, 192, 260],
    draw: (P) => {
      const skirt = skirtPts(22, 196, 66, 312, 12);
      return (
        speckle(skirt, { count: 30, r: 5, seed: 241, color: P.fill, edge: 7, edgeColor: P.ink, base: PAPER }) +
        sleeves('lady', 'puff', P, 243) +
        speckle(bodicePts('lady', { top: A.shoulderY + 2 }), { count: 14, r: 4.5, seed: 245, color: P.fill, edge: 6, edgeColor: P.ink, base: PAPER }) +
        stroke(scallop(CX - 64, CX + 64, 318, 6, 9), { w: 5, seed: 247, color: P.ink })
      );
    },
  },
  {
    id: 'cape-gown',
    name: 'Cape Gown',
    preview: [10, 96, 220, 334],
    draw: (P) => {
      const skirt = skirtPts(23, 196, 88, 390, 14);
      const cape = [
        [CX - 46, A.shoulderY + 2],
        [CX - 62, 200],
        [CX - 40, 214],
        [CX, 220],
        [CX + 40, 214],
        [CX + 62, 200],
        [CX + 46, A.shoulderY + 2],
        [CX, A.shoulderY - 8],
      ];
      return (
        hatch(skirt, { gap: 15, w: 4, angle: 74, seed: 251, color: P.fill, edge: 7, edgeColor: P.ink }) +
        solid(bodicePts('lady', { top: A.shoulderY + 6 }), { seed: 253, color: P.fill }) +
        scribble(cape, { gap: 9, w: 4, angle: -30, seed: 255, color: P.fill, edge: 6, edgeColor: P.ink }) +
        beads([[CX - 20, A.shoulderY - 4], [CX + 20, A.shoulderY - 4]], { r: 5, gap: 14, seed: 257, color: P.ink })
      );
    },
  },
  {
    id: 'pinafore',
    name: 'Pinafore',
    preview: [26, 100, 188, 240],
    draw: (P) => {
      const skirt = skirtPts(22, 198, 58, 296, 10);
      const bib = [
        [CX - 26, A.chestY - 6],
        [CX + 26, A.chestY - 6],
        [CX + 24, A.waistY + 4],
        [CX - 24, A.waistY + 4],
      ];
      return (
        hatch(skirt, { gap: 11, w: 4, angle: 100, seed: 261, color: P.fill, edge: 6, edgeColor: P.ink }) +
        solid(bib, { seed: 263, color: P.fill }) +
        limb([[CX - 20, A.chestY - 4], [CX - 24, A.shoulderY - 4]], P, 10, 265) +
        limb([[CX + 20, A.chestY - 4], [CX + 24, A.shoulderY - 4]], P, 10, 267) +
        beads([[CX - 56, 300], [CX + 56, 300]], { r: 4, gap: 13, seed: 269, color: P.ink })
      );
    },
  },
  {
    id: 'swan-gown',
    name: 'Swan Gown',
    preview: [10, 96, 220, 340],
    draw: (P) => {
      const skirt = skirtPts(24, 194, 98, 386, 16);
      return (
        loops(skirt, { count: 11, w: 4.2, seed: 1301, color: P.fill, edge: 7, edgeColor: P.ink }) +
        stroke(scallop(CX - 68, CX + 68, 322, 7, 13), { w: 5, seed: 1302, color: P.ink }) +
        stroke(scallop(CX - 96, CX + 96, 390, 9, 14), { w: 5.5, seed: 1303, color: P.ink }) +
        sleeves('lady', 'bell', P, 1304) +
        solid(bodicePts('lady', { top: A.chestY - 26 }), { seed: 1305, color: P.fill }) +
        beads([[CX - 30, A.shoulderY - 2], [CX, A.chestY - 22], [CX + 30, A.shoulderY - 2]], { r: 5, gap: 14, seed: 1306, color: P.ink })
      );
    },
  },
  {
    id: 'harlequin',
    name: 'Harlequin',
    preview: [20, 100, 200, 320],
    draw: (P) => {
      const skirt = skirtPts(23, 196, 84, 382, 14);
      const top = bodicePts('lady', { top: A.shoulderY + 2 });
      return (
        hatch(skirt, { gap: 24, w: 4, angle: 58, seed: 1311, color: P.fill, edge: 7, edgeColor: P.ink }) +
        hatch(skirt, { gap: 24, w: 4, angle: -58, seed: 1312, color: P.fill, edge: 0, base: null }) +
        sleeves('lady', 'puff', P, 1313) +
        hatch(top, { gap: 16, w: 3.6, angle: 58, seed: 1314, color: P.fill, edge: 6, edgeColor: P.ink }) +
        hatch(top, { gap: 16, w: 3.6, angle: -58, seed: 1315, color: P.fill, edge: 0, base: null }) +
        beads(scallop(CX - 82, CX + 82, 386, 6, 9), { r: 4.5, gap: 15, seed: 1316, color: P.ink })
      );
    },
  },
  {
    id: 'winter-coat',
    name: 'Winter Coat',
    preview: [14, 92, 212, 320],
    draw: (P) => {
      const coat = [
        [CX - 44, A.shoulderY - 4],
        [CX - 38, A.waistY],
        [CX - 60, 340],
        [CX + 60, 340],
        [CX + 38, A.waistY],
        [CX + 44, A.shoulderY - 4],
        [CX, A.shoulderY - 12],
      ];
      const fur = [
        [CX - 62, 332],
        [CX + 62, 332],
        [CX + 62, 356],
        [CX - 62, 356],
      ];
      const collar = [
        [CX - 46, A.shoulderY - 16],
        [CX + 46, A.shoulderY - 16],
        [CX + 34, A.shoulderY + 16],
        [CX, A.chestY - 4],
        [CX - 34, A.shoulderY + 16],
      ];
      return (
        solid(coat, { seed: 1321, color: P.fill, edge: 7, edgeColor: P.ink }) +
        sleeves('lady', 'long', P, 1322) +
        beads([[CX, A.chestY + 6], [CX, 326]], { r: 5.5, gap: 24, seed: 1323, color: PAPER }) +
        scribble(fur, { gap: 8, w: 3.6, angle: 30, seed: 1324, color: P.fill, edge: 6, edgeColor: P.ink }) +
        scribble(collar, { gap: 8, w: 3.6, angle: 20, seed: 1325, color: P.fill, edge: 6, edgeColor: P.ink })
      );
    },
  },
  {
    id: 'tulip-dress',
    name: 'Tulip Dress',
    preview: [28, 100, 184, 250],
    draw: (P) => {
      const skirt = [
        [CX - 22, 194],
        [CX - 58, 262],
        [CX - 44, 306],
        [CX, 296],
        [CX + 44, 306],
        [CX + 58, 262],
        [CX + 22, 194],
      ];
      return (
        loops(skirt, { count: 7, w: 4, seed: 1331, color: P.fill, edge: 7, edgeColor: P.ink }) +
        sleeves('lady', 'short', P, 1332) +
        solid(bodicePts('lady', { top: A.shoulderY }), { seed: 1333, color: P.fill }) +
        beads([[CX - 30, 300], [CX, 292], [CX + 30, 300]], { r: 4.5, gap: 13, seed: 1334, color: P.ink })
      );
    },
  },
];

const ladyHead = [
  {
    id: 'spike-crown',
    name: 'Spiky Crown',
    preview: [60, 0, 120, 80],
    draw: (P) => {
      const t = teeth(CX - 32, CX + 32, A.headCy - 26, A.headCy - 62, 5, { wobble: 4 });
      const shape = [...t, [CX + 32, A.headCy - 18], [CX - 32, A.headCy - 18]];
      return solid(shape, { seed: 301, color: P.fill, edge: 5, edgeColor: P.ink }) + beads([[CX - 28, A.headCy - 22], [CX + 28, A.headCy - 22]], { r: 4, gap: 13, seed: 303, color: '#fffdf6' });
    },
  },
  {
    id: 'tiara',
    name: 'Tiara',
    preview: [62, 6, 116, 70],
    draw: (P) => {
      const t = teeth(CX - 26, CX + 26, A.headCy - 24, A.headCy - 48, 3, { wobble: 3 });
      return (
        stroke(t, { w: 6, seed: 305, color: P.ink }) +
        stroke([[CX - 30, A.headCy - 22], [CX + 30, A.headCy - 22]], { w: 7, seed: 307, color: P.fill }) +
        dot(CX, A.headCy - 50, 6, 309, P.ink) +
        dot(CX - 17, A.headCy - 42, 5, 311, P.ink) +
        dot(CX + 17, A.headCy - 42, 5, 313, P.ink)
      );
    },
  },
  {
    id: 'sun-hat',
    name: 'Feather Hat',
    preview: [30, 0, 180, 90],
    draw: (P) => {
      const brim = ellipsePts(CX, A.headCy - 22, 62, 15, 22);
      const crown = [
        [CX - 30, A.headCy - 24],
        [CX - 24, A.headCy - 56],
        [CX + 24, A.headCy - 56],
        [CX + 30, A.headCy - 24],
      ];
      return (
        solid(crown, { seed: 315, color: P.fill, edge: 5, edgeColor: P.ink }) +
        solid(brim, { seed: 317, color: P.fill, edge: 5, edgeColor: P.ink }) +
        scribble(
          [
            [CX + 24, A.headCy - 50],
            [CX + 52, A.headCy - 84],
            [CX + 74, A.headCy - 74],
            [CX + 44, A.headCy - 46],
          ],
          { gap: 7, w: 3.6, angle: 40, seed: 319, color: P.ink, edge: 4, edgeColor: P.ink }
        )
      );
    },
  },
  {
    id: 'cone-hat',
    name: 'Pointy Hat',
    preview: [52, 0, 136, 90],
    draw: (P) => {
      const cone = [
        [CX - 34, A.headCy - 22],
        [CX + 34, A.headCy - 22],
        [CX + 4, A.headCy - 86],
      ];
      return (
        scribble(cone, { gap: 8, w: 4, angle: -60, seed: 321, color: P.fill, edge: 6, edgeColor: P.ink }) +
        stroke([[CX - 40, A.headCy - 20], [CX + 40, A.headCy - 22]], { w: 8, seed: 323, color: P.ink }) +
        beads([[CX + 6, A.headCy - 88], [CX + 34, A.headCy - 108]], { r: 4.5, gap: 12, seed: 325, color: P.ink })
      );
    },
  },
  {
    id: 'flower-band',
    name: 'Flower Band',
    preview: [58, 8, 124, 70],
    draw: (P) => {
      let s = stroke(arcPts(CX, A.headCy - 6, 32, 30, Math.PI + 0.3, Math.PI * 2 - 0.3, 12), { w: 7, seed: 327, color: P.fill });
      [-24, -8, 8, 24].forEach((dx, i) => {
        const x = CX + dx;
        const y = A.headCy - 30 + Math.abs(dx) * 0.16;
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2;
          s += blob(x + Math.cos(a) * 7, y + Math.sin(a) * 7, 4.2, rng(329 + i * 7 + k), P.ink);
        }
      });
      return s;
    },
  },
  {
    id: 'bun-bow',
    name: 'Big Bow',
    preview: [56, 6, 128, 74],
    draw: (P) => {
      const wing = (dir) => [
        [CX, A.headCy - 30],
        [CX + dir * 34, A.headCy - 50],
        [CX + dir * 38, A.headCy - 24],
        [CX + dir * 8, A.headCy - 22],
      ];
      return (
        scribble(wing(-1), { gap: 7, w: 3.6, angle: 30, seed: 331, color: P.fill, edge: 5, edgeColor: P.ink }) +
        scribble(wing(1), { gap: 7, w: 3.6, angle: -30, seed: 333, color: P.fill, edge: 5, edgeColor: P.ink }) +
        blob(CX, A.headCy - 28, 9, rng(335), P.ink)
      );
    },
  },
  {
    id: 'veil',
    name: 'Bridal Veil',
    preview: [44, 0, 152, 170],
    draw: (P) => {
      const veil = [
        [CX - 46, A.headCy - 28],
        [CX - 56, A.headCy + 62],
        [CX + 56, A.headCy + 62],
        [CX + 46, A.headCy - 28],
        [CX, A.headCy - 46],
      ];
      return (
        hatch(veil, { gap: 15, w: 3, angle: 100, seed: 1341, color: P.fill, edge: 5, edgeColor: P.ink, base: null }) +
        beads([[CX - 34, A.headCy - 34], [CX, A.headCy - 48], [CX + 34, A.headCy - 34]], { r: 5, gap: 14, seed: 1342, color: P.ink })
      );
    },
  },
  {
    id: 'bonnet',
    name: 'Bonnet',
    preview: [44, 0, 152, 110],
    draw: (P) => {
      const dome = [
        [CX - 36, A.headCy - 14],
        ...arcPts(CX, A.headCy - 14, 36, 44, Math.PI, Math.PI * 2, 12),
      ];
      return (
        scribble(dome, { gap: 9, w: 3.8, angle: -60, seed: 1351, color: P.fill, edge: 6, edgeColor: P.ink }) +
        solid(
          [
            [CX - 52, A.headCy - 18],
            [CX + 52, A.headCy - 18],
            [CX + 48, A.headCy - 6],
            [CX - 48, A.headCy - 6],
          ],
          { seed: 1352, color: P.fill, edge: 5, edgeColor: P.ink }
        ) +
        beads([[CX - 46, A.headCy - 2], [CX - 54, A.headCy + 30]], { r: 4.5, gap: 13, seed: 1353, color: P.ink })
      );
    },
  },
  {
    id: 'star-crown',
    name: 'Star Crown',
    preview: [50, 0, 140, 100],
    draw: (P) => {
      let s = stroke([[CX - 32, A.headCy - 24], [CX, A.headCy - 30], [CX + 32, A.headCy - 24]], { w: 9, seed: 1361, color: P.fill });
      [[-26, -44], [0, -58], [26, -44]].forEach(([dx, dy], i) => {
        s += stroke([[CX + dx, A.headCy - 26], [CX + dx, A.headCy + dy + 10]], { w: 4, seed: 1362 + i, color: P.ink });
        s += star(CX + dx, A.headCy + dy, 13, 6, 1365 + i, P.ink);
      });
      return s;
    },
  },
];

const ladyNeck = [
  {
    id: 'bead-loop',
    name: 'Bead Loop',
    preview: [60, 100, 120, 90],
    draw: (P) =>
      beads(
        [
          [CX - 26, A.neckY + 2],
          [CX - 22, A.neckY + 34],
          [CX, A.neckY + 48],
          [CX + 22, A.neckY + 34],
          [CX + 26, A.neckY + 2],
        ],
        { r: 6, gap: 15, seed: 341, color: P.fill }
      ),
  },
  {
    id: 'double-beads',
    name: 'Double Strand',
    preview: [56, 100, 128, 100],
    draw: (P) =>
      beads([[CX - 24, A.neckY], [CX, A.neckY + 22], [CX + 24, A.neckY]], { r: 5, gap: 13, seed: 343, color: P.fill }) +
      beads([[CX - 28, A.neckY + 2], [CX, A.neckY + 52], [CX + 28, A.neckY + 2]], { r: 5.5, gap: 15, seed: 345, color: P.fill }),
  },
  {
    id: 'star-pendant',
    name: 'Star Pendant',
    preview: [62, 100, 116, 100],
    draw: (P) =>
      beads([[CX - 24, A.neckY], [CX, A.neckY + 30], [CX + 24, A.neckY]], { r: 4, gap: 12, seed: 347, color: P.fill }) +
      star(CX, A.neckY + 44, 15, 6, 349, P.ink),
  },
  {
    id: 'choker',
    name: 'Choker',
    preview: [70, 96, 100, 56],
    draw: (P) =>
      stroke([[CX - 20, A.chinY + 8], [CX, A.chinY + 14], [CX + 20, A.chinY + 8]], { w: 9, seed: 351, color: P.fill }) +
      dot(CX, A.chinY + 24, 7, 353, P.ink),
  },
  {
    id: 'ruff',
    name: 'Ruff Collar',
    preview: [56, 90, 128, 70],
    draw: (P) => {
      const ring = ellipsePts(CX, A.neckY - 2, 40, 18, 20);
      return scribble(ring, { gap: 7, w: 3.6, angle: 20, seed: 355, color: P.fill, edge: 6, edgeColor: P.ink });
    },
  },
  {
    id: 'ribbon-bow',
    name: 'Ribbon Bow',
    preview: [62, 92, 116, 76],
    draw: (P) => {
      const wing = (dir) => [
        [CX, A.chinY + 16],
        [CX + dir * 28, A.chinY + 4],
        [CX + dir * 30, A.chinY + 30],
      ];
      return (
        stroke([[CX - 22, A.chinY + 10], [CX, A.chinY + 16], [CX + 22, A.chinY + 10]], { w: 8, seed: 1371, color: P.fill }) +
        solid(wing(-1), { seed: 1372, color: P.fill, edge: 5, edgeColor: P.ink }) +
        solid(wing(1), { seed: 1373, color: P.fill, edge: 5, edgeColor: P.ink }) +
        blob(CX, A.chinY + 17, 8, rng(1374), P.ink)
      );
    },
  },
  {
    id: 'pearl-collar',
    name: 'Pearl Collar',
    preview: [56, 92, 128, 80],
    draw: (P) =>
      beads([[CX - 30, A.neckY - 6], [CX, A.neckY + 8], [CX + 30, A.neckY - 6]], { r: 7, gap: 15, seed: 1381, color: P.fill }) +
      beads([[CX - 34, A.neckY + 2], [CX, A.neckY + 24], [CX + 34, A.neckY + 2]], { r: 6, gap: 14, seed: 1382, color: P.fill }) +
      beads([[CX - 38, A.neckY + 10], [CX, A.neckY + 40], [CX + 38, A.neckY + 10]], { r: 5, gap: 13, seed: 1383, color: P.fill }),
  },
];

const ladyHands = [
  {
    id: 'opera-gloves',
    name: 'Opera Gloves',
    preview: [20, 150, 200, 150],
    draw: (P) =>
      gloveShape([A.elbowL[0] + 8, A.elbowL[1] - 26], A.handL, P, 361) +
      gloveShape([A.elbowR[0] - 8, A.elbowR[1] - 26], A.handR, P, 367),
  },
  {
    id: 'short-gloves',
    name: 'Short Gloves',
    preview: [26, 210, 188, 110],
    draw: (P) =>
      gloveShape([A.handL[0] + 6, A.handL[1] - 26], A.handL, P, 371) +
      gloveShape([A.handR[0] - 6, A.handR[1] - 26], A.handR, P, 377),
  },
  {
    id: 'frill-gloves',
    name: 'Frilly Gloves',
    preview: [22, 190, 196, 130],
    draw: (P) =>
      gloveShape([A.handL[0] + 8, A.handL[1] - 34], A.handL, P, 381) +
      gloveShape([A.handR[0] - 8, A.handR[1] - 34], A.handR, P, 383) +
      stroke(scallop(A.handL[0] - 8, A.handL[0] + 24, A.handL[1] - 34, 3, 9), { w: 5, seed: 385, color: P.ink }) +
      stroke(scallop(A.handR[0] - 24, A.handR[0] + 8, A.handR[1] - 34, 3, 9), { w: 5, seed: 387, color: P.ink }),
  },
  {
    id: 'lace-mitts',
    name: 'Lace Mitts',
    preview: [20, 180, 200, 140],
    draw: (P) => {
      const mitt = (from, to, seed, dir) =>
        limb([from, to], P, 18, seed) +
        stroke(scallop(to[0] - 16 + dir * 4, to[0] + 16 + dir * 4, from[1], 3, 9), { w: 5, seed: seed + 2, color: P.ink });
      return (
        mitt([A.elbowL[0] + 6, A.elbowL[1] - 16], [A.handL[0], A.handL[1] + 4], 1391, 1) +
        mitt([A.elbowR[0] - 6, A.elbowR[1] - 16], [A.handR[0], A.handR[1] + 4], 1395, -1)
      );
    },
  },
];

const ladyFeet = [
  { id: 'heels', name: 'Heels', preview: [70, 370, 100, 70], draw: pair((x, y, d, P, s) => shoeShape(x, y, d, P, s, 'heel')) },
  { id: 'lady-boots', name: 'Tall Boots', preview: [64, 330, 112, 110], draw: pair((x, y, d, P, s) => shoeShape(x, y, d, P, s, 'boot')) },
  {
    id: 'bow-flats',
    name: 'Bow Flats',
    preview: [66, 372, 108, 68],
    draw: (P) =>
      shoeShape(A.footLx - 2, A.ankleY + 2, -1, P, 391, 'flat') +
      shoeShape(A.footRx + 2, A.ankleY + 2, 1, P, 393, 'flat') +
      dot(A.footLx - 8, A.ankleY - 4, 6, 395, '#fffdf6') +
      dot(A.footRx + 8, A.ankleY - 4, 6, 397, '#fffdf6'),
  },
  {
    id: 'dot-slippers',
    name: 'Dotty Slippers',
    preview: [66, 372, 108, 68],
    draw: (P) =>
      shoeShape(A.footLx - 2, A.ankleY + 4, -1, P, 401, 'point') +
      shoeShape(A.footRx + 2, A.ankleY + 4, 1, P, 403, 'point') +
      beads([[A.footLx - 18, A.ankleY - 2], [A.footLx + 8, A.ankleY - 6]], { r: 3.4, gap: 10, seed: 405, color: '#fffdf6' }) +
      beads([[A.footRx - 8, A.ankleY - 6], [A.footRx + 18, A.ankleY - 2]], { r: 3.4, gap: 10, seed: 407, color: '#fffdf6' }),
  },
  { id: 'sandals', name: 'Sandals', preview: [66, 372, 108, 68], draw: pair((x, y, d, P, s) => shoeShape(x, y, d, P, s, 'sandal')) },
  { id: 'clogs', name: 'Clogs', preview: [62, 366, 116, 74], draw: pair((x, y, d, P, s) => shoeShape(x, y, d, P, s, 'chunky')) },
];

const ladyExtra = [
  {
    id: 'fan',
    name: 'Lace Fan',
    preview: [140, 190, 100, 110],
    draw: (P) => {
      const h = A.handR;
      const fan = arcPts(h[0] + 6, h[1] + 6, 44, 44, -Math.PI * 0.95, -Math.PI * 0.15, 12);
      const shape = [[h[0] + 6, h[1] + 6], ...fan];
      return (
        hatch(shape, { gap: 10, w: 3.4, angle: 0, seed: 411, color: P.fill, edge: 5, edgeColor: P.ink }) +
        beads(fan, { r: 3.6, gap: 12, seed: 413, color: P.ink })
      );
    },
  },
  {
    id: 'handbag',
    name: 'Handbag',
    preview: [140, 230, 100, 120],
    draw: (P) => {
      const h = A.handR;
      const bx = h[0] + 14;
      const by = h[1] + 46;
      const bag = [
        [bx - 22, by - 16],
        [bx + 22, by - 16],
        [bx + 26, by + 26],
        [bx - 26, by + 26],
      ];
      return (
        stroke(arcPts(bx, by - 18, 18, 24, Math.PI, Math.PI * 2, 10), { w: 6, seed: 415, color: P.ink }) +
        hatch(bag, { gap: 9, w: 3.6, angle: 90, seed: 417, color: P.fill, edge: 6, edgeColor: P.ink }) +
        dot(bx, by + 4, 6, 419, P.ink)
      );
    },
  },
  {
    id: 'parasol',
    name: 'Parasol',
    preview: [136, 110, 104, 190],
    draw: (P) => {
      const h = A.handR;
      const top = [h[0] + 18, h[1] - 96];
      const dome = [
        [top[0] - 46, top[1] + 34],
        ...arcPts(top[0], top[1] + 36, 46, 40, Math.PI, Math.PI * 2, 12),
      ];
      return (
        limb([[h[0] + 6, h[1] + 20], top], P, 7, 421) +
        scribble(dome, { gap: 9, w: 3.6, angle: 70, seed: 423, color: P.fill, edge: 6, edgeColor: P.ink }) +
        stroke(scallop(top[0] - 46, top[0] + 46, top[1] + 36, 5, 9), { w: 5, seed: 425, color: P.ink })
      );
    },
  },
  {
    id: 'bouquet',
    name: 'Bouquet',
    preview: [140, 200, 100, 110],
    draw: (P) => {
      const h = A.handR;
      let s = limb([[h[0] + 6, h[1] + 16], [h[0] + 16, h[1] - 22]], P, 6, 427);
      [[-16, -46], [4, -60], [24, -42], [-2, -32]].forEach(([dx, dy], i) => {
        const x = h[0] + 12 + dx;
        const y = h[1] + dy;
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2;
          s += blob(x + Math.cos(a) * 8, y + Math.sin(a) * 8, 4.6, rng(429 + i * 5 + k), P.ink);
        }
      });
      return s;
    },
  },
  {
    id: 'mask',
    name: 'Party Mask',
    preview: [130, 190, 110, 120],
    draw: (P) => {
      const h = A.handR;
      const cx = h[0] + 10;
      const cy = h[1] - 40;
      const shape = [
        [cx - 34, cy - 6],
        [cx - 26, cy - 22],
        [cx, cy - 16],
        [cx + 26, cy - 22],
        [cx + 34, cy - 6],
        [cx + 22, cy + 18],
        [cx, cy + 10],
        [cx - 22, cy + 18],
      ];
      return (
        limb([[h[0] + 4, h[1] + 14], [cx - 6, cy + 12]], P, 6, 1401) +
        scribble(shape, { gap: 8, w: 3.6, angle: 30, seed: 1402, color: P.fill, edge: 6, edgeColor: P.ink }) +
        solid(ellipsePts(cx - 15, cy - 4, 9, 7, 12), { seed: 1403, color: PAPER }) +
        solid(ellipsePts(cx + 15, cy - 4, 9, 7, 12), { seed: 1404, color: PAPER })
      );
    },
  },
  {
    id: 'wand',
    name: 'Magic Wand',
    preview: [140, 150, 100, 140],
    draw: (P) => {
      const h = A.handR;
      const top = [h[0] + 26, h[1] - 66];
      return limb([[h[0] + 6, h[1] + 14], top], P, 6, 1411) + star(top[0], top[1] - 8, 22, 6, 1412, P.ink);
    },
  },
  {
    id: 'lady-book',
    name: 'Story Book',
    preview: [136, 210, 104, 110],
    draw: (P) => {
      const h = A.handR;
      const bx = h[0] + 4;
      const by = h[1] + 22;
      return (
        solid(
          [
            [bx - 30, by - 20],
            [bx + 30, by - 24],
            [bx + 30, by + 16],
            [bx - 30, by + 20],
          ],
          { seed: 1421, color: P.fill, edge: 6, edgeColor: P.ink }
        ) +
        stroke([[bx, by - 22], [bx, by + 18]], { w: 5, seed: 1422, color: PAPER }) +
        beads([[bx - 22, by - 8], [bx - 6, by - 9]], { r: 3, gap: 9, seed: 1423, color: PAPER })
      );
    },
  },
];

/* ------------------------------------------------------------------- gent */

const gentOutfits = [
  {
    id: 'tailcoat',
    name: 'Tailcoat',
    preview: [24, 100, 192, 320],
    draw: (P) => {
      const tails = [
        [CX - 30, A.waistY - 6],
        [CX + 30, A.waistY - 6],
        [CX + 34, 300],
        [CX + 12, 296],
        [CX, A.hipY + 20],
        [CX - 12, 296],
        [CX - 34, 300],
      ];
      return (
        trousers(P, { seed: 501 }) +
        solid(tails, { seed: 503, color: P.fill, edge: 5, edgeColor: P.ink }) +
        sleeves('gent', 'long', P, 505) +
        solid(bodicePts('gent', { top: A.shoulderY - 2, bottom: A.waistY + 4 }), { seed: 507, color: P.fill }) +
        `<path d="M ${CX - 18} ${A.shoulderY + 2} L ${CX} ${A.chestY + 6} L ${CX + 18} ${A.shoulderY + 2} Z" fill="#fffdf6"/>` +
        beads([[CX, A.chestY + 12], [CX, A.waistY]], { r: 4.5, gap: 16, seed: 509, color: '#fffdf6' })
      );
    },
  },
  {
    id: 'long-coat',
    name: 'Long Coat',
    preview: [18, 100, 204, 330],
    draw: (P) => {
      const coat = [
        [CX - 46, A.shoulderY - 2],
        [CX - 40, A.waistY],
        [CX - 52, 340],
        [CX + 52, 340],
        [CX + 40, A.waistY],
        [CX + 46, A.shoulderY - 2],
        [CX + 20, A.shoulderY - 8],
        [CX - 20, A.shoulderY - 8],
      ];
      return (
        trousers(P, { seed: 511, w: 20 }) +
        hatch(coat, { gap: 14, w: 4, angle: 88, seed: 513, color: P.fill, edge: 7, edgeColor: P.ink }) +
        sleeves('gent', 'long', P, 515) +
        beads([[CX, A.chestY], [CX, 330]], { r: 6, gap: 24, seed: 517, color: P.ink }) +
        stroke([[CX - 30, A.shoulderY], [CX, A.chestY + 10], [CX + 30, A.shoulderY]], { w: 6, seed: 519, color: P.ink })
      );
    },
  },
  {
    id: 'stripe-suit',
    name: 'Stripe Suit',
    preview: [24, 100, 192, 330],
    draw: (P) => {
      const jacket = bodicePts('gent', { top: A.shoulderY - 4, bottom: A.hipY + 8, pad: 6 });
      return (
        hatch(
          [
            [CX - 26, A.hipY - 4],
            [CX + 26, A.hipY - 4],
            [CX + 24, A.ankleY - 8],
            [CX - 24, A.ankleY - 8],
          ],
          { gap: 10, w: 3.4, angle: 92, seed: 521, color: P.fill, edge: 6, edgeColor: P.ink }
        ) +
        sleeves('gent', 'long', P, 523) +
        hatch(jacket, { gap: 10, w: 3.4, angle: 92, seed: 525, color: P.fill, edge: 7, edgeColor: P.ink }) +
        `<path d="M ${CX - 16} ${A.shoulderY} L ${CX} ${A.chestY + 10} L ${CX + 16} ${A.shoulderY} Z" fill="#fffdf6"/>`
      );
    },
  },
  {
    id: 'royal-robe',
    name: 'Royal Robe',
    preview: [10, 96, 220, 340],
    draw: (P) => {
      const cape = [
        [CX - 48, A.shoulderY - 4],
        [CX - 60, 300],
        [CX - 52, 352],
        [CX + 52, 352],
        [CX + 60, 300],
        [CX + 48, A.shoulderY - 4],
        [CX, A.shoulderY - 14],
      ];
      const tunic = [
        [CX - 30, A.shoulderY + 6],
        [CX + 30, A.shoulderY + 6],
        [CX + 28, 300],
        [CX - 28, 300],
      ];
      const collar = [
        [CX - 50, A.shoulderY - 10],
        [CX + 50, A.shoulderY - 10],
        [CX + 40, A.shoulderY + 16],
        [CX, A.shoulderY + 24],
        [CX - 40, A.shoulderY + 16],
      ];
      return (
        trousers(P, { seed: 531, w: 18 }) +
        solid(cape, { seed: 533, color: P.fill, edge: 7, edgeColor: P.ink }) +
        speckle(cape, { count: 20, r: 5, seed: 534, color: PAPER, base: null }) +
        hatch(tunic, { gap: 12, w: 4, angle: 90, seed: 535, color: P.fill, edge: 6, edgeColor: P.ink }) +
        sleeves('gent', 'long', P, 537) +
        beads([[CX, A.chestY + 12], [CX, 292]], { r: 5, gap: 24, seed: 538, color: P.ink }) +
        solid(collar, { seed: 541, color: PAPER, edge: 6, edgeColor: P.ink }) +
        speckle(collar, { count: 12, r: 4, seed: 542, color: P.ink, base: null })
      );
    },
  },
  {
    id: 'vest-shirt',
    name: 'Waistcoat',
    preview: [24, 100, 192, 330],
    draw: (P) => {
      const vest = [
        [CX - 34, A.shoulderY + 2],
        [CX - 30, A.waistY + 10],
        [CX, A.waistY + 22],
        [CX + 30, A.waistY + 10],
        [CX + 34, A.shoulderY + 2],
        [CX + 14, A.shoulderY - 2],
        [CX, A.chestY + 14],
        [CX - 14, A.shoulderY - 2],
      ];
      return (
        trousers(P, { seed: 543, w: 21 }) +
        stroke(bodicePts('gent', { top: A.shoulderY - 2 }), { w: 6, closed: true, seed: 545, color: P.ink }) +
        sleeves('gent', 'none', P) +
        stroke(armPath('gent', 'l'), { w: 15, seed: 547, color: P.ink }) +
        stroke(armPath('gent', 'l'), { w: 10, seed: 548, color: '#fffdf6' }) +
        stroke(armPath('gent', 'r'), { w: 15, seed: 549, color: P.ink }) +
        stroke(armPath('gent', 'r'), { w: 10, seed: 550, color: '#fffdf6' }) +
        speckle(vest, { count: 18, r: 4.4, seed: 551, color: P.fill, edge: 6, edgeColor: P.ink, base: PAPER })
      );
    },
  },
  {
    id: 'sailor-suit',
    name: 'Sailor Suit',
    preview: [26, 100, 188, 300],
    draw: (P) => {
      const top = bodicePts('gent', { top: A.shoulderY - 2, bottom: A.hipY + 10, pad: 5 });
      const collar = [
        [CX - 34, A.shoulderY],
        [CX + 34, A.shoulderY],
        [CX + 26, A.chestY + 6],
        [CX, A.chestY + 20],
        [CX - 26, A.chestY + 6],
      ];
      return (
        solid(
          [
            [CX - 28, A.hipY + 4],
            [CX + 28, A.hipY + 4],
            [CX + 30, 300],
            [CX - 30, 300],
          ],
          { seed: 553, color: P.fill, edge: 5, edgeColor: P.ink }
        ) +
        sleeves('gent', 'short', P, 555) +
        hatch(top, { gap: 13, w: 5, angle: 0, seed: 557, color: P.fill, edge: 6, edgeColor: P.ink }) +
        solid(collar, { seed: 559, color: P.fill, edge: 5, edgeColor: P.ink })
      );
    },
  },
  {
    id: 'scribble-suit',
    name: 'Scribble Suit',
    preview: [24, 100, 192, 330],
    draw: (P) => {
      const jacket = bodicePts('gent', { top: A.shoulderY - 4, bottom: A.hipY + 14, pad: 7 });
      return (
        loops(
          [
            [CX - 28, A.hipY + 6],
            [CX + 28, A.hipY + 6],
            [CX + 26, A.ankleY - 8],
            [CX - 26, A.ankleY - 8],
          ],
          { count: 8, w: 4, seed: 561, color: P.fill, edge: 6, edgeColor: P.ink }
        ) +
        sleeves('gent', 'long', P, 563) +
        loops(jacket, { count: 8, w: 4.2, seed: 565, color: P.fill, edge: 7, edgeColor: P.ink })
      );
    },
  },
  {
    id: 'wizard-robe',
    name: 'Wizard Robe',
    preview: [12, 96, 216, 340],
    draw: (P) => {
      const robe = [
        [CX - 40, A.shoulderY - 6],
        [CX - 50, A.waistY],
        [CX - 74, 396],
        [CX + 74, 396],
        [CX + 50, A.waistY],
        [CX + 40, A.shoulderY - 6],
        [CX, A.shoulderY - 16],
      ];
      return (
        solid(robe, { seed: 1501, color: P.fill, edge: 7, edgeColor: P.ink }) +
        sleeves('gent', 'bell', P, 1502) +
        [
          [CX - 34, 250],
          [CX + 30, 290],
          [CX - 20, 340],
          [CX + 46, 356],
          [CX + 6, 214],
        ]
          .map(([x, y], i) => star(x, y, 15, 6, 1503 + i, PAPER))
          .join('') +
        beads([[CX - 40, A.chestY + 6], [CX, A.chestY + 22], [CX + 40, A.chestY + 6]], { r: 5, gap: 14, seed: 1509, color: PAPER })
      );
    },
  },
  {
    id: 'pirate',
    name: 'Pirate',
    preview: [22, 100, 196, 320],
    draw: (P) => {
      const top = bodicePts('gent', { top: A.shoulderY - 2, bottom: A.hipY + 6, pad: 5 });
      const sash = [
        [CX - 36, A.chestY + 16],
        [CX + 34, A.waistY - 6],
        [CX + 34, A.hipY + 14],
        [CX - 36, A.waistY + 20],
      ];
      return (
        solid(
          [
            [CX - 30, A.hipY + 2],
            [CX + 30, A.hipY + 2],
            [CX + 26, 322],
            [CX - 26, 322],
          ],
          { seed: 1511, color: P.fill, edge: 6, edgeColor: P.ink }
        ) +
        stroke(scallop(CX - 27, CX + 27, 320, 4, 12), { w: 5, seed: 1512, color: P.ink }) +
        sleeves('gent', 'short', P, 1513) +
        hatch(top, { gap: 14, w: 6, angle: 0, seed: 1514, color: P.fill, edge: 6, edgeColor: P.ink }) +
        solid(sash, { seed: 1515, color: P.fill, edge: 5, edgeColor: P.ink }) +
        dot(CX + 30, A.waistY + 10, 8, 1516, PAPER)
      );
    },
  },
  {
    id: 'armour',
    name: 'Armour',
    preview: [20, 96, 200, 330],
    draw: (P) => {
      const chest = bodicePts('gent', { top: A.shoulderY - 6, bottom: A.hipY + 4, pad: 7 });
      let s = trousers(P, { seed: 1521, w: 20 });
      s += sleeves('gent', 'long', P, 1522);
      s += solid(chest, { seed: 1523, color: P.fill, edge: 7, edgeColor: P.ink });
      [A.chestY - 6, A.chestY + 22, A.waistY + 12].forEach((y, i) => {
        s += stroke([[CX - 44, y], [CX, y + 8], [CX + 44, y]], { w: 5, seed: 1524 + i, color: PAPER });
      });
      s += beads([[CX - 42, A.shoulderY + 8], [CX + 42, A.shoulderY + 8]], { r: 4.5, gap: 18, seed: 1527, color: PAPER });
      s += solid(ellipsePts(CX - 48, A.shoulderY + 10, 18, 15, 14), { seed: 1528, color: P.fill, edge: 5, edgeColor: P.ink });
      s += solid(ellipsePts(CX + 48, A.shoulderY + 10, 18, 15, 14), { seed: 1529, color: P.fill, edge: 5, edgeColor: P.ink });
      return s;
    },
  },
  {
    id: 'dungarees',
    name: 'Dungarees',
    preview: [24, 100, 192, 330],
    draw: (P) => {
      const bib = [
        [CX - 28, A.chestY - 2],
        [CX + 28, A.chestY - 2],
        [CX + 30, A.hipY + 4],
        [CX - 30, A.hipY + 4],
      ];
      return (
        stroke(bodicePts('gent', { top: A.shoulderY - 2 }), { w: 6, closed: true, seed: 1531, color: P.ink }) +
        stroke(armPath('gent', 'l'), { w: 15, seed: 1532, color: P.ink }) +
        stroke(armPath('gent', 'l'), { w: 10, seed: 1533, color: PAPER }) +
        stroke(armPath('gent', 'r'), { w: 15, seed: 1534, color: P.ink }) +
        stroke(armPath('gent', 'r'), { w: 10, seed: 1535, color: PAPER }) +
        trousers(P, { seed: 1536, w: 26, flare: 3 }) +
        hatch(bib, { gap: 13, w: 4, angle: 90, seed: 1537, color: P.fill, edge: 6, edgeColor: P.ink }) +
        limb([[CX - 22, A.chestY], [CX - 26, A.shoulderY - 6]], P, 9, 1538) +
        limb([[CX + 22, A.chestY], [CX + 26, A.shoulderY - 6]], P, 9, 1539) +
        dot(CX - 24, A.chestY + 4, 6, 1540, PAPER) +
        dot(CX + 24, A.chestY + 4, 6, 1541, PAPER)
      );
    },
  },
];

const gentHead = [
  {
    id: 'top-hat',
    name: 'Top Hat',
    preview: [50, 0, 140, 90],
    draw: (P) => {
      const crown = [
        [CX - 26, A.headCy - 30],
        [CX - 24, A.headCy - 84],
        [CX + 24, A.headCy - 84],
        [CX + 26, A.headCy - 30],
      ];
      const brim = [
        [CX - 50, A.headCy - 32],
        [CX + 50, A.headCy - 32],
        [CX + 50, A.headCy - 20],
        [CX - 50, A.headCy - 20],
      ];
      return (
        solid(crown, { seed: 601, color: P.fill, edge: 5, edgeColor: P.ink }) +
        solid(brim, { seed: 603, color: P.fill, edge: 5, edgeColor: P.ink }) +
        stroke([[CX - 24, A.headCy - 42], [CX + 24, A.headCy - 42]], { w: 7, seed: 605, color: '#fffdf6' })
      );
    },
  },
  {
    id: 'king-crown',
    name: "King's Crown",
    preview: [58, 0, 124, 84],
    draw: (P) => {
      const t = teeth(CX - 34, CX + 34, A.headCy - 28, A.headCy - 66, 4, { wobble: 5 });
      const shape = [...t, [CX + 34, A.headCy - 16], [CX - 34, A.headCy - 16]];
      return (
        scribble(shape, { gap: 8, w: 4, angle: -70, seed: 607, color: P.fill, edge: 6, edgeColor: P.ink }) +
        beads([[CX - 30, A.headCy - 20], [CX + 30, A.headCy - 20]], { r: 4.5, gap: 14, seed: 609, color: P.ink })
      );
    },
  },
  {
    id: 'tricorn',
    name: 'Tricorn',
    preview: [40, 0, 160, 84],
    draw: (P) => {
      const shape = [
        [CX - 56, A.headCy - 24],
        [CX - 20, A.headCy - 62],
        [CX + 20, A.headCy - 62],
        [CX + 56, A.headCy - 24],
        [CX, A.headCy - 12],
      ];
      return (
        solid(shape, { seed: 611, color: P.fill, edge: 5, edgeColor: P.ink }) +
        beads([[CX - 40, A.headCy - 30], [CX, A.headCy - 52], [CX + 40, A.headCy - 30]], { r: 4, gap: 13, seed: 613, color: '#fffdf6' })
      );
    },
  },
  {
    id: 'flat-cap',
    name: 'Flat Cap',
    preview: [50, 10, 140, 70],
    draw: (P) => {
      const cap = [
        [CX - 34, A.headCy - 22],
        [CX - 26, A.headCy - 50],
        [CX + 26, A.headCy - 50],
        [CX + 36, A.headCy - 24],
      ];
      const peak = [
        [CX + 30, A.headCy - 26],
        [CX + 62, A.headCy - 22],
        [CX + 60, A.headCy - 14],
        [CX + 28, A.headCy - 16],
      ];
      return (
        hatch(cap, { gap: 9, w: 3.6, angle: 30, seed: 615, color: P.fill, edge: 6, edgeColor: P.ink }) +
        solid(peak, { seed: 617, color: P.fill, edge: 5, edgeColor: P.ink })
      );
    },
  },
  {
    id: 'party-cone',
    name: 'Party Cone',
    preview: [58, 0, 124, 88],
    draw: (P) => {
      const cone = [
        [CX - 28, A.headCy - 24],
        [CX + 28, A.headCy - 24],
        [CX, A.headCy - 90],
      ];
      return (
        speckle(cone, { count: 16, r: 4.4, seed: 619, color: P.fill, edge: 6, edgeColor: P.ink, base: PAPER }) +
        blob(CX, A.headCy - 94, 9, rng(621), P.ink)
      );
    },
  },
  {
    id: 'wizard-hat',
    name: 'Wizard Hat',
    preview: [40, 0, 160, 110],
    draw: (P) => {
      const cone = [
        [CX - 34, A.headCy - 24],
        [CX + 34, A.headCy - 24],
        [CX + 30, A.headCy - 66],
        [CX + 46, A.headCy - 104],
        [CX + 8, A.headCy - 78],
      ];
      return (
        solid(cone, { seed: 1551, color: P.fill, edge: 6, edgeColor: P.ink }) +
        solid(
          [
            [CX - 52, A.headCy - 28],
            [CX + 52, A.headCy - 28],
            [CX + 48, A.headCy - 14],
            [CX - 48, A.headCy - 14],
          ],
          { seed: 1552, color: P.fill, edge: 5, edgeColor: P.ink }
        ) +
        star(CX + 6, A.headCy - 44, 12, 6, 1553, PAPER) +
        star(CX + 26, A.headCy - 74, 9, 6, 1554, PAPER)
      );
    },
  },
  {
    id: 'beret',
    name: 'Beret',
    preview: [50, 6, 140, 80],
    draw: (P) => {
      const cap = [
        [CX - 38, A.headCy - 20],
        ...arcPts(CX - 2, A.headCy - 22, 40, 30, Math.PI, Math.PI * 2, 12),
        [CX + 40, A.headCy - 16],
      ];
      return (
        scribble(cap, { gap: 9, w: 3.8, angle: 20, seed: 1561, color: P.fill, edge: 6, edgeColor: P.ink }) +
        stroke([[CX + 6, A.headCy - 52], [CX + 12, A.headCy - 62]], { w: 6, seed: 1562, color: P.ink })
      );
    },
  },
  {
    id: 'helmet',
    name: 'Helmet',
    preview: [48, 0, 144, 110],
    draw: (P) => {
      const dome = [
        [CX - 36, A.headCy - 6],
        ...arcPts(CX, A.headCy - 6, 36, 40, Math.PI, Math.PI * 2, 12),
      ];
      let s = solid(dome, { seed: 1571, color: P.fill, edge: 6, edgeColor: P.ink });
      s += solid(
        [
          [CX - 38, A.headCy - 10],
          [CX + 38, A.headCy - 10],
          [CX + 36, A.headCy + 2],
          [CX - 36, A.headCy + 2],
        ],
        { seed: 1572, color: P.fill, edge: 5, edgeColor: P.ink }
      );
      s += stroke([[CX, A.headCy - 46], [CX, A.headCy - 74]], { w: 5, seed: 1573, color: P.ink });
      s += scribble(
        [
          [CX - 16, A.headCy - 74],
          [CX + 16, A.headCy - 74],
          [CX + 22, A.headCy - 100],
          [CX - 22, A.headCy - 100],
        ],
        { gap: 7, w: 3.4, angle: 80, seed: 1574, color: P.fill, edge: 5, edgeColor: P.ink }
      );
      return s;
    },
  },
];

const gentNeck = [
  {
    id: 'bow-tie',
    name: 'Bow Tie',
    preview: [72, 94, 96, 56],
    draw: (P) => {
      const wing = (dir) => [
        [CX, A.neckY + 6],
        [CX + dir * 26, A.neckY - 6],
        [CX + dir * 26, A.neckY + 20],
      ];
      return (
        solid(wing(-1), { seed: 631, color: P.fill, edge: 5, edgeColor: P.ink }) +
        solid(wing(1), { seed: 633, color: P.fill, edge: 5, edgeColor: P.ink }) +
        blob(CX, A.neckY + 7, 8, rng(635), P.ink)
      );
    },
  },
  {
    id: 'long-tie',
    name: 'Long Tie',
    preview: [86, 96, 68, 110],
    draw: (P) => {
      const tie = [
        [CX - 9, A.neckY + 6],
        [CX + 9, A.neckY + 6],
        [CX + 13, A.waistY - 10],
        [CX, A.waistY],
        [CX - 13, A.waistY - 10],
      ];
      return solid(tie, { seed: 637, color: P.fill, edge: 5, edgeColor: P.ink }) + stroke([[CX - 11, A.neckY + 4], [CX + 11, A.neckY + 4]], { w: 8, seed: 639, color: P.ink });
    },
  },
  {
    id: 'cravat',
    name: 'Cravat',
    preview: [70, 92, 100, 80],
    draw: (P) => {
      const shape = [
        [CX - 26, A.neckY - 4],
        [CX + 26, A.neckY - 4],
        [CX + 18, A.neckY + 34],
        [CX - 18, A.neckY + 34],
      ];
      return scribble(shape, { gap: 7, w: 3.6, angle: 25, seed: 641, color: P.fill, edge: 6, edgeColor: P.ink });
    },
  },
  {
    id: 'medal-chain',
    name: 'Medal Chain',
    preview: [58, 96, 124, 110],
    draw: (P) =>
      beads([[CX - 30, A.neckY], [CX, A.neckY + 44], [CX + 30, A.neckY]], { r: 5.5, gap: 15, seed: 643, color: P.fill }) +
      star(CX, A.neckY + 58, 16, 8, 645, P.ink),
  },
  {
    id: 'scarf',
    name: 'Long Scarf',
    preview: [56, 92, 128, 160],
    draw: (P) => {
      const ring = [
        [CX - 26, A.neckY - 8],
        [CX + 26, A.neckY - 8],
        [CX + 24, A.neckY + 14],
        [CX - 24, A.neckY + 14],
      ];
      const tail = [
        [CX + 6, A.neckY + 10],
        [CX + 26, A.neckY + 10],
        [CX + 34, A.waistY + 22],
        [CX + 12, A.waistY + 26],
      ];
      return (
        hatch(tail, { gap: 12, w: 5, angle: 0, seed: 1581, color: P.fill, edge: 6, edgeColor: P.ink }) +
        hatch(ring, { gap: 12, w: 5, angle: 0, seed: 1582, color: P.fill, edge: 6, edgeColor: P.ink }) +
        beads([[CX + 12, A.waistY + 26], [CX + 34, A.waistY + 22]], { r: 4, gap: 11, seed: 1583, color: P.ink })
      );
    },
  },
  {
    id: 'gent-ruff',
    name: 'Ruff',
    preview: [52, 88, 136, 74],
    draw: (P) =>
      scribble(ellipsePts(CX, A.neckY - 2, 44, 19, 20), { gap: 7, w: 3.6, angle: 20, seed: 1591, color: P.fill, edge: 6, edgeColor: P.ink }),
  },
];

const gentHands = [
  {
    id: 'gent-gloves',
    name: 'White Gloves',
    preview: [26, 210, 188, 110],
    draw: (P) =>
      gloveShape([A.handL[0] + 6, A.handL[1] - 30], A.handL, P, 651) +
      gloveShape([A.handR[0] - 6, A.handR[1] - 30], A.handR, P, 657),
  },
  {
    id: 'cuff-gloves',
    name: 'Cuffed Gloves',
    preview: [22, 190, 196, 130],
    draw: (P) =>
      gloveShape([A.elbowL[0] + 6, A.elbowL[1] - 8], A.handL, P, 661) +
      gloveShape([A.elbowR[0] - 6, A.elbowR[1] - 8], A.handR, P, 663) +
      stroke(teeth(A.elbowL[0] - 10, A.elbowL[0] + 22, A.elbowL[1] - 4, A.elbowL[1] - 22, 3), { w: 5, seed: 665, color: P.ink }) +
      stroke(teeth(A.elbowR[0] - 22, A.elbowR[0] + 10, A.elbowR[1] - 4, A.elbowR[1] - 22, 3), { w: 5, seed: 667, color: P.ink }),
  },
  {
    id: 'mittens',
    name: 'Mittens',
    preview: [24, 200, 192, 130],
    draw: (P) =>
      limb([[A.handL[0] + 6, A.handL[1] - 22], A.handL], P, 22, 1601) +
      solid(ellipsePts(A.handL[0] - 2, A.handL[1] + 12, 16, 17, 14), { seed: 1602, color: P.fill, edge: 5, edgeColor: P.ink }) +
      limb([[A.handR[0] - 6, A.handR[1] - 22], A.handR], P, 22, 1603) +
      solid(ellipsePts(A.handR[0] + 2, A.handR[1] + 12, 16, 17, 14), { seed: 1604, color: P.fill, edge: 5, edgeColor: P.ink }) +
      beads([[A.handL[0] - 14, A.handL[1] - 20], [A.handL[0] + 14, A.handL[1] - 22]], { r: 3.4, gap: 10, seed: 1605, color: PAPER }) +
      beads([[A.handR[0] - 14, A.handR[1] - 22], [A.handR[0] + 14, A.handR[1] - 20]], { r: 3.4, gap: 10, seed: 1606, color: PAPER }),
  },
];

const gentFeet = [
  { id: 'riding-boots', name: 'Riding Boots', preview: [64, 330, 112, 110], draw: pair((x, y, d, P, s) => shoeShape(x, y, d, P, s, 'boot')) },
  {
    id: 'buckle-shoes',
    name: 'Buckle Shoes',
    preview: [66, 372, 108, 68],
    draw: (P) =>
      shoeShape(A.footLx - 2, A.ankleY + 2, -1, P, 671, 'flat') +
      shoeShape(A.footRx + 2, A.ankleY + 2, 1, P, 673, 'flat') +
      stroke(
        [
          [A.footLx - 12, A.ankleY - 4],
          [A.footLx - 2, A.ankleY - 4],
          [A.footLx - 2, A.ankleY + 4],
          [A.footLx - 12, A.ankleY + 4],
        ],
        { w: 4.5, closed: true, seed: 675, color: '#fffdf6' }
      ) +
      stroke(
        [
          [A.footRx + 2, A.ankleY - 4],
          [A.footRx + 12, A.ankleY - 4],
          [A.footRx + 12, A.ankleY + 4],
          [A.footRx + 2, A.ankleY + 4],
        ],
        { w: 4.5, closed: true, seed: 677, color: '#fffdf6' }
      ),
  },
  { id: 'pointy-shoes', name: 'Pointy Shoes', preview: [60, 372, 120, 68], draw: pair((x, y, d, P, s) => shoeShape(x, y, d, P, s, 'point')) },
  { id: 'gent-sandals', name: 'Sandals', preview: [66, 372, 108, 68], draw: pair((x, y, d, P, s) => shoeShape(x, y, d, P, s, 'sandal')) },
  { id: 'work-boots', name: 'Work Boots', preview: [62, 362, 116, 78], draw: pair((x, y, d, P, s) => shoeShape(x, y, d, P, s, 'chunky')) },
];

const gentExtra = [
  {
    id: 'cane',
    name: 'Cane',
    preview: [150, 190, 90, 200],
    draw: (P) => {
      const h = A.handR;
      const top = [h[0] + 20, h[1] - 46];
      return (
        limb([[h[0] + 14, h[1] + 92], top], P, 8, 681) +
        blob(top[0], top[1] - 6, 13, rng(683), P.ink) +
        blob(h[0] + 14, h[1] + 96, 9, rng(685), P.ink)
      );
    },
  },
  {
    id: 'umbrella',
    name: 'Umbrella',
    preview: [132, 100, 108, 200],
    draw: (P) => {
      const h = A.handR;
      const top = [h[0] + 18, h[1] - 100];
      const dome = [[top[0] - 48, top[1] + 36], ...arcPts(top[0], top[1] + 38, 48, 44, Math.PI, Math.PI * 2, 12)];
      return (
        limb([[h[0] + 6, h[1] + 26], top], P, 7, 687) +
        hatch(dome, { gap: 13, w: 4, angle: 70, seed: 689, color: P.fill, edge: 6, edgeColor: P.ink }) +
        stroke(scallop(top[0] - 48, top[0] + 48, top[1] + 38, 4, 10), { w: 5, seed: 691, color: P.ink }) +
        blob(top[0], top[1] - 8, 6, rng(693), P.ink)
      );
    },
  },
  {
    id: 'pocket-watch',
    name: 'Pocket Watch',
    preview: [96, 150, 96, 110],
    draw: (P) => {
      const cx = CX + 26;
      return (
        beads([[CX - 6, A.chestY + 10], [CX + 12, 196], [cx, 176]], { r: 4, gap: 11, seed: 695, color: P.fill }) +
        solid(ellipsePts(cx, 190, 14, 14, 14), { seed: 697, color: '#fffdf6', edge: 6, edgeColor: P.ink }) +
        stroke([[cx, 190], [cx, 181]], { w: 4, seed: 699, color: P.ink }) +
        stroke([[cx, 190], [cx + 7, 193]], { w: 4, seed: 701, color: P.ink })
      );
    },
  },
  {
    id: 'sash',
    name: 'Royal Sash',
    preview: [60, 100, 124, 130],
    draw: (P) => {
      const sash = [
        [CX - 40, A.shoulderY - 2],
        [CX - 24, A.shoulderY - 4],
        [CX + 34, A.waistY + 12],
        [CX + 34, A.hipY + 12],
        [CX + 16, A.hipY + 10],
        [CX - 44, A.chestY - 4],
      ];
      return scribble(sash, { gap: 8, w: 4, angle: 40, seed: 703, color: P.fill, edge: 6, edgeColor: P.ink }) + star(CX + 26, A.hipY - 4, 14, 6, 705, P.ink);
    },
  },
  {
    id: 'monocle',
    name: 'Monocle',
    preview: [78, 20, 110, 120],
    draw: (P) =>
      stroke(ellipsePts(CX + 13, A.headCy - 4, 13, 13, 16), { w: 5, closed: true, seed: 707, color: P.ink }) +
      beads([[CX + 24, A.headCy + 4], [CX + 34, A.headCy + 40]], { r: 3.4, gap: 10, seed: 709, color: P.fill }),
  },
  {
    id: 'sword',
    name: 'Sword',
    preview: [140, 120, 100, 190],
    draw: (P) => {
      const h = A.handR;
      const tip = [h[0] + 44, h[1] - 130];
      return (
        limb([[h[0] + 2, h[1] + 22], tip], P, 9, 1611) +
        stroke([[h[0] - 12, h[1] - 4], [h[0] + 22, h[1] - 18]], { w: 9, seed: 1612, color: P.ink }) +
        blob(h[0] + 1, h[1] + 24, 9, rng(1613), P.ink)
      );
    },
  },
  {
    id: 'gent-book',
    name: 'Big Book',
    preview: [132, 200, 108, 120],
    draw: (P) => {
      const h = A.handR;
      const bx = h[0] + 2;
      const by = h[1] + 24;
      return (
        solid(
          [
            [bx - 34, by - 24],
            [bx + 34, by - 28],
            [bx + 34, by + 18],
            [bx - 34, by + 22],
          ],
          { seed: 1621, color: P.fill, edge: 6, edgeColor: P.ink }
        ) +
        stroke([[bx, by - 26], [bx, by + 20]], { w: 5, seed: 1622, color: PAPER }) +
        star(bx + 18, by - 4, 10, 6, 1623, PAPER)
      );
    },
  },
  {
    id: 'balloon',
    name: 'Balloon',
    preview: [140, 60, 100, 220],
    draw: (P) => {
      const h = A.handR;
      const top = [h[0] + 34, h[1] - 150];
      return (
        stroke([[h[0] + 6, h[1] + 12], [h[0] + 26, h[1] - 70], [top[0], top[1] + 34]], { w: 3.6, seed: 1631, color: P.ink }) +
        scribble(ellipsePts(top[0], top[1], 34, 40, 20), { gap: 9, w: 3.8, angle: -70, seed: 1632, color: P.fill, edge: 6, edgeColor: P.ink })
      );
    },
  },
];

/* ---------------------------------------------------------------- catalog */

export const SLOTS = [
  { id: 'outfit', name: 'Outfits', icon: '👗' },
  { id: 'head', name: 'Hats', icon: '👑' },
  { id: 'neck', name: 'Necks', icon: '📿' },
  { id: 'hands', name: 'Gloves', icon: '🧤' },
  { id: 'feet', name: 'Shoes', icon: '👞' },
  { id: 'extra', name: 'Extras', icon: '🌂' },
];

/** Draw order — later slots paint on top. */
export const SLOT_ORDER = ['feet', 'outfit', 'hands', 'neck', 'head', 'extra'];

function tag(list, slot, kind) {
  return list.map((it) => ({ ...it, slot, kind }));
}

export const CATALOG = {
  lady: {
    outfit: tag(ladyOutfits, 'outfit', 'lady'),
    head: tag(ladyHead, 'head', 'lady'),
    neck: tag(ladyNeck, 'neck', 'lady'),
    hands: tag(ladyHands, 'hands', 'lady'),
    feet: tag(ladyFeet, 'feet', 'lady'),
    extra: tag(ladyExtra, 'extra', 'lady'),
  },
  gent: {
    outfit: tag(gentOutfits, 'outfit', 'gent'),
    head: tag(gentHead, 'head', 'gent'),
    neck: tag(gentNeck, 'neck', 'gent'),
    hands: tag(gentHands, 'hands', 'gent'),
    feet: tag(gentFeet, 'feet', 'gent'),
    extra: tag(gentExtra, 'extra', 'gent'),
  },
};

export function findItem(kind, slot, id) {
  return CATALOG[kind][slot].find((i) => i.id === id) || null;
}
