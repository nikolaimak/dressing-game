// Shared anatomy + the two base figures, drawn in the same marker style.
// Every wardrobe item is authored against these coordinates (viewBox 240 x 460).

import { stroke, solid, blob, dot, rng, ellipsePts, arcPts, scribble } from './marker.js';

export const VB = { w: 240, h: 460 };

export const A = {
  cx: 120,
  headCy: 60,
  headR: 30,
  chinY: 90,
  neckY: 112,
  shoulderY: 118,
  chestY: 150,
  waistY: 198,
  hipY: 218,
  kneeY: 310,
  ankleY: 396,
  soleY: 414,
  handL: [56, 254],
  handR: [184, 254],
  elbowL: [72, 188],
  elbowR: [168, 188],
  legLx: 106,
  legRx: 134,
  footLx: 100,
  footRx: 140,
};

export const SHOULDER = { lady: 32, gent: 42 };
export const WAIST_HALF = { lady: 21, gent: 28 };

/** Arm polyline from shoulder to hand for a given side. */
export function armPath(kind, side) {
  const sh = SHOULDER[kind];
  const sx = side === 'l' ? A.cx - sh + 4 : A.cx + sh - 4;
  const elbow = side === 'l' ? A.elbowL : A.elbowR;
  const hand = side === 'l' ? A.handL : A.handR;
  return [[sx, A.shoulderY + 4], elbow, hand];
}

/** Torso outline polygon (used by tops / bodices). */
export function torsoPts(kind, { top = A.shoulderY, bottom = A.hipY, pad = 0 } = {}) {
  const sh = SHOULDER[kind] + pad;
  const wh = WAIST_HALF[kind] + pad;
  return [
    [A.cx - sh, top],
    [A.cx - sh + 2, A.chestY],
    [A.cx - wh, A.waistY],
    [A.cx - wh - 2, bottom],
    [A.cx + wh + 2, bottom],
    [A.cx + wh, A.waistY],
    [A.cx + sh - 2, A.chestY],
    [A.cx + sh, top],
  ];
}

function legs(kind) {
  const spread = kind === 'gent' ? 4 : 0;
  let s = '';
  s += stroke(
    [
      [A.cx - 8, A.hipY - 6],
      [A.legLx - 2 - spread, A.kneeY],
      [A.footLx - spread, A.ankleY],
    ],
    { w: 9, seed: 31 }
  );
  s += stroke(
    [
      [A.cx + 8, A.hipY - 6],
      [A.legRx + 2 + spread, A.kneeY],
      [A.footRx + spread, A.ankleY],
    ],
    { w: 9, seed: 33 }
  );
  // bare feet
  s += stroke(
    [
      [A.footLx - spread, A.ankleY],
      [A.footLx - 12 - spread, A.soleY - 2],
    ],
    { w: 9, seed: 35 }
  );
  s += stroke(
    [
      [A.footRx + spread, A.ankleY],
      [A.footRx + 12 + spread, A.soleY - 2],
    ],
    { w: 9, seed: 37 }
  );
  return s;
}

function arms(kind) {
  let s = '';
  s += stroke(armPath(kind, 'l'), { w: 9, seed: 41 });
  s += stroke(armPath(kind, 'r'), { w: 9, seed: 43 });
  s += blob(A.handL[0] - 2, A.handL[1] + 8, 8, rng(45));
  s += blob(A.handR[0] + 2, A.handR[1] + 8, 8, rng(47));
  return s;
}

function head(kind) {
  let s = '';
  const face = ellipsePts(A.cx, A.headCy, A.headR, A.headR + 3, 24);
  s += `<path d="${pathOf(face)}" fill="#fffdf6"/>`;
  s += stroke(face, { w: 6, closed: true, seed: 51 });
  // neck
  s += stroke(
    [
      [A.cx - 7, A.chinY - 2],
      [A.cx - 6, A.neckY + 4],
    ],
    { w: 7, seed: 53 }
  );
  s += stroke(
    [
      [A.cx + 7, A.chinY - 2],
      [A.cx + 6, A.neckY + 4],
    ],
    { w: 7, seed: 55 }
  );
  // face
  s += dot(A.cx - 11, A.headCy - 4, 4.2, 57);
  s += dot(A.cx + 11, A.headCy - 4, 4.2, 59);
  s += stroke(arcPts(A.cx, A.headCy + 4, 12, 10, 0.35, Math.PI - 0.35, 10), { w: 4.5, seed: 61 });
  if (kind === 'lady') {
    // long wavy hair around the face
    s += scribble(
      [
        [A.cx - 34, A.headCy - 16],
        [A.cx - 30, A.headCy - 34],
        [A.cx, A.headCy - 42],
        [A.cx + 30, A.headCy - 34],
        [A.cx + 34, A.headCy - 16],
        [A.cx + 22, A.headCy - 22],
        [A.cx, A.headCy - 26],
        [A.cx - 22, A.headCy - 22],
      ],
      { gap: 7, w: 4, seed: 63, edge: 0, base: null }
    );
    s += stroke(
      [
        [A.cx - 30, A.headCy - 18],
        [A.cx - 40, A.headCy + 14],
        [A.cx - 34, A.headCy + 44],
      ],
      { w: 7, seed: 65 }
    );
    s += stroke(
      [
        [A.cx + 30, A.headCy - 18],
        [A.cx + 40, A.headCy + 14],
        [A.cx + 34, A.headCy + 44],
      ],
      { w: 7, seed: 67 }
    );
  } else {
    s += scribble(
      [
        [A.cx - 30, A.headCy - 12],
        [A.cx - 26, A.headCy - 32],
        [A.cx, A.headCy - 40],
        [A.cx + 26, A.headCy - 32],
        [A.cx + 30, A.headCy - 12],
        [A.cx + 16, A.headCy - 20],
        [A.cx - 16, A.headCy - 20],
      ],
      { gap: 6, w: 4, seed: 69, edge: 0, base: null }
    );
    // moustache
    s += stroke(
      [
        [A.cx - 14, A.headCy + 12],
        [A.cx, A.headCy + 9],
        [A.cx + 14, A.headCy + 12],
      ],
      { w: 6, seed: 71 }
    );
  }
  return s;
}

function pathOf(pts) {
  return (
    'M ' +
    pts.map((p) => `${Math.round(p[0] * 10) / 10} ${Math.round(p[1] * 10) / 10}`).join(' L ') +
    ' Z'
  );
}

/** Underwear so an undressed figure still looks decent. */
function undies(kind) {
  const pts = [
    [A.cx - 24, A.waistY + 6],
    [A.cx + 24, A.waistY + 6],
    [A.cx + 22, A.hipY + 18],
    [A.cx - 22, A.hipY + 18],
  ];
  let s = solid(pts, { seed: 73, color: '#2c2c33' });
  if (kind === 'lady') {
    s +=
      stroke(
        [
          [A.cx - 26, A.chestY + 2],
          [A.cx, A.chestY + 10],
          [A.cx + 26, A.chestY + 2],
        ],
        { w: 8, seed: 75, color: '#2c2c33' }
      );
  }
  return s;
}

export function body(kind) {
  return legs(kind) + arms(kind) + torsoLine(kind) + undies(kind) + head(kind);
}

function torsoLine(kind) {
  const pts = torsoPts(kind);
  return `<path d="${pathOf(pts)}" fill="#fffdf6"/>` + stroke(pts, { w: 6, closed: true, seed: 77 });
}
