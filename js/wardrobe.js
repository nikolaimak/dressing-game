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
