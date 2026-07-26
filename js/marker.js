// Hand-drawn "black marker on paper" primitives.
// Everything is deterministic (seeded) so shapes never jiggle between renders.

let _uid = 0;
export const uid = (p = 'm') => `${p}${++_uid}`;

export const INK = '#15151a';
export const PAPER = '#fffdf6';

/**
 * Repaint a generated marker drawing. Every primitive emits the ink colour as a
 * literal, so swapping that one token recolours a whole object while leaving
 * paper-white highlights (eyes, buckles, buttons) alone.
 */
export function recolour(svg, colour) {
  return colour && colour !== INK ? svg.split(INK).join(colour) : svg;
}

export function rng(seed = 1) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function densify(pts, step = 16, closed = false) {
  const out = [];
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const seg = Math.max(1, Math.round(Math.hypot(dx, dy) / step));
    for (let k = 0; k < seg; k++) out.push([a[0] + (dx * k) / seg, a[1] + (dy * k) / seg]);
  }
  if (!closed) out.push(pts[pts.length - 1]);
  return out;
}

export function jitter(pts, amt, rand) {
  if (!amt) return pts;
  return pts.map(([x, y]) => [x + (rand() * 2 - 1) * amt, y + (rand() * 2 - 1) * amt]);
}

const r2 = (n) => Math.round(n * 100) / 100;

export function smoothPath(pts, closed = false) {
  if (pts.length < 3) return `M ${pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join(' L ')}`;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = '';
  if (closed) {
    const m0 = mid(pts[pts.length - 1], pts[0]);
    d = `M ${r2(m0[0])} ${r2(m0[1])}`;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const m = mid(p, pts[(i + 1) % pts.length]);
      d += ` Q ${r2(p[0])} ${r2(p[1])} ${r2(m[0])} ${r2(m[1])}`;
    }
    return d + ' Z';
  }
  d = `M ${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const m = mid(p, pts[i + 1]);
    d += ` Q ${r2(p[0])} ${r2(p[1])} ${r2(m[0])} ${r2(m[1])}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L ${r2(last[0])} ${r2(last[1])}`;
}

/** A marker line / outline through the given points. */
export function stroke(pts, o = {}) {
  const {
    w = 6,
    closed = false,
    jit = 1.4,
    seed = 7,
    passes = 1,
    color = INK,
    opacity = 1,
    step = 18,
    cap = 'round',
  } = o;
  const rand = rng(seed);
  let out = '';
  for (let p = 0; p < passes; p++) {
    const j = jitter(densify(pts, step, closed), jit, rand);
    out += `<path d="${smoothPath(j, closed)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"${
      opacity === 1 ? '' : ` opacity="${opacity}"`
    }/>`;
  }
  return out;
}

/** A saturated, fully inked shape (like the heavy black areas in the drawing). */
export function solid(pts, o = {}) {
  const { seed = 11, jit = 1.1, color = INK, step = 18, edge = 0, edgeColor } = o;
  const rand = rng(seed);
  const j = jitter(densify(pts, step, true), jit, rand);
  const d = smoothPath(j, true);
  return (
    `<path d="${d}" fill="${color}" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>` +
    (edge ? stroke(pts, { w: edge, closed: true, seed: seed + 3, color: edgeColor || INK }) : '')
  );
}

function bbox(pts) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

function clipWrap(pts, body) {
  const id = uid('clip');
  return (
    `<defs><clipPath id="${id}"><path d="${smoothPath(densify(pts, 18, true), true)}"/></clipPath></defs>` +
    `<g clip-path="url(#${id})">${body}</g>`
  );
}

/** Optional opaque under-layer so a garment hides the body beneath it. */
function baseLayer(pts, base, seed) {
  if (!base) return '';
  const rand = rng(seed + 91);
  return `<path d="${smoothPath(jitter(densify(pts, 18, true), 1, rand), true)}" fill="${base}"/>`;
}

/** Horizontal span of a polygon at a given y (null when outside). */
function spanAt(pts, y) {
  const xs = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
      const t = (y - a[1]) / (b[1] - a[1]);
      xs.push(a[0] + t * (b[0] - a[0]));
    }
  }
  if (xs.length < 2) return null;
  xs.sort((p, q) => p - q);
  return [xs[0], xs[xs.length - 1]];
}

/** Tangle of overlapping ink loops — the way the gowns are filled in the drawing. */
export function loops(pts, o = {}) {
  const {
    count = 10,
    w = 4,
    seed = 31,
    color = INK,
    opacity = 0.95,
    jit = 2.2,
    edge = 6,
    edgeColor,
    base = PAPER,
  } = o;
  const rand = rng(seed);
  const b = bbox(pts);
  const H = b.maxY - b.minY;
  let body = '';
  for (let i = 0; i < count; i++) {
    const cy = b.minY + (0.06 + ((i + rand() * 0.9) / count) * 0.88) * H;
    const span = spanAt(pts, cy) || [b.minX, b.maxX];
    const half = Math.max(10, (span[1] - span[0]) / 2);
    const cx = (span[0] + span[1]) / 2 + (rand() - 0.5) * half * 0.7;
    const rx = half * (0.45 + rand() * 0.6);
    const ry = Math.max(9, H * (0.05 + rand() * 0.13));
    const rot = (rand() - 0.5) * 1.1;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const e = ellipsePts(0, 0, rx, ry, 20).map(([x, y]) => [cx + x * cos - y * sin, cy + x * sin + y * cos]);
    body += `<path d="${smoothPath(jitter(densify(e, 16, true), jit, rand), true)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${opacity}"/>`;
  }
  return (
    baseLayer(pts, base, seed) +
    clipWrap(pts, body) +
    (edge ? stroke(pts, { w: edge, closed: true, seed: seed + 5, color: edgeColor || INK }) : '')
  );
}

/** Loopy back-and-forth scribble fill, clipped to a shape. */
export function scribble(pts, o = {}) {
  const {
    gap = 9,
    w = 4,
    seed = 13,
    angle = -72,
    color = INK,
    opacity = 0.95,
    jit = 3,
    edge = 6,
    edgeColor,
    base = PAPER,
  } = o;
  const rand = rng(seed);
  const b = bbox(pts);
  const R = Math.hypot(b.maxX - b.minX, b.maxY - b.minY) / 2 + gap * 2;
  const a = (angle * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const line = [];
  let flip = false;
  for (let v = -R; v <= R; v += gap) {
    const ends = flip ? [R, -R] : [-R, R];
    for (const u of ends) line.push([b.cx + u * cos - v * sin, b.cy + u * sin + v * cos]);
    flip = !flip;
  }
  const body = `<path d="${smoothPath(jitter(densify(line, 22), jit, rand))}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;
  return (
    baseLayer(pts, base, seed) +
    clipWrap(pts, body) +
    (edge ? stroke(pts, { w: edge, closed: true, seed: seed + 5, color: edgeColor || INK }) : '')
  );
}

/** Straight hatch lines clipped to a shape (stripey fabric). */
export function hatch(pts, o = {}) {
  const { gap = 12, w = 4, seed = 17, angle = 80, color = INK, edge = 6, edgeColor, jit = 1.4, base = PAPER } = o;
  const rand = rng(seed);
  const b = bbox(pts);
  const R = Math.hypot(b.maxX - b.minX, b.maxY - b.minY) / 2 + gap;
  const a = (angle * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  let body = '';
  for (let v = -R; v <= R; v += gap) {
    const p1 = [b.cx - R * cos - v * sin, b.cy - R * sin + v * cos];
    const p2 = [b.cx + R * cos - v * sin, b.cy + R * sin + v * cos];
    body += `<path d="${smoothPath(jitter(densify([p1, p2], 26), jit, rand))}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  return (
    baseLayer(pts, base, seed) +
    clipWrap(pts, body) +
    (edge ? stroke(pts, { w: edge, closed: true, seed: seed + 5, color: edgeColor || INK }) : '')
  );
}

export function blob(cx, cy, r, rand = rng(3), color = INK) {
  const pts = [];
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.78 + rand() * 0.45);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return `<path d="${smoothPath(pts, true)}" fill="${color}"/>`;
}

export function dot(cx, cy, r, seed = 5, color = INK) {
  return blob(cx, cy, r, rng(seed), color);
}

/** Blobby dots sprinkled inside a shape. */
export function speckle(pts, o = {}) {
  const { count = 22, r = 4, seed = 19, color = INK, edge = 0, edgeColor, base = null } = o;
  const rand = rng(seed);
  const b = bbox(pts);
  let body = '';
  for (let i = 0; i < count; i++) {
    const x = b.minX + rand() * (b.maxX - b.minX);
    const y = b.minY + rand() * (b.maxY - b.minY);
    body += blob(x, y, r * (0.65 + rand() * 0.7), rand, color);
  }
  return (
    baseLayer(pts, base, seed) +
    clipWrap(pts, body) +
    (edge ? stroke(pts, { w: edge, closed: true, seed: seed + 5, color: edgeColor || INK }) : '')
  );
}

/** Approximate a smoothed curve as a dense polyline. */
export function sampleSmooth(pts, step = 3) {
  const dense = densify(pts, 6);
  const out = [];
  for (let i = 0; i < dense.length - 1; i++) {
    const a = dense[i];
    const b = dense[i + 1];
    const seg = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < seg; k++) out.push([a[0] + ((b[0] - a[0]) * k) / seg, a[1] + ((b[1] - a[1]) * k) / seg]);
  }
  out.push(dense[dense.length - 1]);
  return out;
}

/** Chain of ink beads along a polyline — the necklaces in the drawing. */
export function beads(pts, o = {}) {
  const { r = 5, gap = 14, seed = 23, color = INK, wob = 0.35 } = o;
  const rand = rng(seed);
  const line = sampleSmooth(pts, 2);
  let acc = gap;
  let prev = line[0];
  let out = blob(prev[0], prev[1], r, rand, color);
  for (let i = 1; i < line.length; i++) {
    const p = line[i];
    acc += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    if (acc >= gap) {
      acc = 0;
      out += blob(p[0], p[1], r * (1 - wob / 2 + rand() * wob), rand, color);
    }
    prev = p;
  }
  return out;
}

export function ellipsePts(cx, cy, rx, ry, n = 26, from = 0, to = Math.PI * 2) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = from + ((to - from) * i) / n;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

export function arcPts(cx, cy, rx, ry, from, to, n = 18) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

/** Spiky crown teeth along the top edge, left to right. */
export function teeth(x1, x2, yBase, yTip, count, { wobble = 0 } = {}) {
  const pts = [[x1, yBase]];
  const span = (x2 - x1) / count;
  for (let i = 0; i < count; i++) {
    const lx = x1 + span * i;
    pts.push([lx + span * 0.5, yTip + (i % 2 ? wobble : -wobble)]);
    pts.push([lx + span, yBase]);
  }
  return pts;
}

/** Wavy / scalloped edge, left to right. */
export function scallop(x1, x2, y, count, depth) {
  const pts = [];
  const span = (x2 - x1) / count;
  for (let i = 0; i < count; i++) {
    pts.push([x1 + span * i, y]);
    pts.push([x1 + span * (i + 0.5), y + depth]);
  }
  pts.push([x2, y]);
  return pts;
}

export function group(children, attrs = '') {
  return `<g${attrs ? ' ' + attrs : ''}>${children}</g>`;
}

export function star(cx, cy, r, points = 6, seed = 29, color = INK) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2 + 0.3;
    const rr = r * (0.85 + rand() * 0.3);
    out += stroke(
      [
        [cx - Math.cos(a) * rr, cy - Math.sin(a) * rr],
        [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr],
      ],
      { w: 4, seed: seed + i, color, jit: 0.6 }
    );
  }
  return out + blob(cx, cy, r * 0.3, rand, color);
}
