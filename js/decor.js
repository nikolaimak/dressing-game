// The room: wall / floor styles and the decorations you can hang and place.

import {
  stroke,
  solid,
  scribble,
  hatch,
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
  INK,
} from './marker.js';

export const SCENE = { w: 960, h: 560, floorY: 442 };
const PAPER = '#fffdf6';

export const PALETTES = [
  { id: 'paper', name: 'Paper', wall: '#fdfbf2', floor: '#f1ecdd', tint: '#8a5a25' },
  { id: 'rose', name: 'Rose', wall: '#fce6ea', floor: '#f6d6cf', tint: '#d1467c' },
  { id: 'sky', name: 'Sky', wall: '#e3eefb', floor: '#dbe6f2', tint: '#2b6cb0' },
  { id: 'mint', name: 'Mint', wall: '#e2f3e8', floor: '#d8ead9', tint: '#2f8f60' },
  { id: 'butter', name: 'Butter', wall: '#fcf2d8', floor: '#f3e6c4', tint: '#c98a12' },
  { id: 'lilac', name: 'Lilac', wall: '#eee5f7', floor: '#e3daf0', tint: '#7a4bbd' },
];

/* --------------------------------------------------------------- surfaces */

export const WALL_PATTERNS = [
  { id: 'plain', name: 'Plain', draw: () => '' },
  {
    id: 'stripes',
    name: 'Stripes',
    draw: () => {
      let s = '';
      for (let x = 40; x < SCENE.w; x += 62) {
        s += stroke([[x, 0], [x + 6, SCENE.floorY]], { w: 5, seed: 800 + x, color: INK, opacity: 0.35 });
      }
      return s;
    },
  },
  {
    id: 'dots',
    name: 'Dots',
    draw: () => {
      const rand = rng(811);
      let s = '';
      for (let y = 30; y < SCENE.floorY; y += 56) {
        for (let x = 30 + ((y / 56) % 2) * 28; x < SCENE.w; x += 56) {
          s += `<g opacity="0.4">${blob(x, y, 5, rand, INK)}</g>`;
        }
      }
      return s;
    },
  },
  {
    id: 'stars',
    name: 'Stars',
    draw: () => {
      const rand = rng(813);
      let s = '';
      for (let y = 40; y < SCENE.floorY - 20; y += 90) {
        for (let x = 50 + ((y / 90) % 2) * 45; x < SCENE.w; x += 90) {
          s += `<g opacity="0.35">${star(x, y, 12, 5, 815 + x + y, INK)}</g>`;
        }
      }
      return s;
    },
  },
  {
    id: 'bricks',
    name: 'Bricks',
    draw: () => {
      let s = '';
      let row = 0;
      for (let y = 40; y < SCENE.floorY; y += 44, row++) {
        s += stroke([[0, y], [SCENE.w, y]], { w: 4, seed: 820 + y, color: INK, opacity: 0.3 });
        for (let x = (row % 2) * 60; x < SCENE.w; x += 120) {
          s += stroke([[x, y], [x, y + 44]], { w: 4, seed: 830 + x + y, color: INK, opacity: 0.3 });
        }
      }
      return s;
    },
  },
];

export const FLOOR_PATTERNS = [
  { id: 'plain', name: 'Plain', draw: () => '' },
  {
    id: 'boards',
    name: 'Boards',
    draw: () => {
      let s = '';
      for (let x = -120; x < SCENE.w + 200; x += 96) {
        s += stroke([[x + 100, SCENE.floorY], [x - 30, SCENE.h]], { w: 4, seed: 840 + x, color: INK, opacity: 0.4 });
      }
      s += stroke([[0, SCENE.floorY + 46], [SCENE.w, SCENE.floorY + 46]], { w: 4, seed: 845, color: INK, opacity: 0.35 });
      return s;
    },
  },
  {
    id: 'checker',
    name: 'Checker',
    draw: () => {
      let s = '';
      let row = 0;
      for (let y = SCENE.floorY; y < SCENE.h; y += 40, row++) {
        for (let x = -40 + (row % 2) * 60; x < SCENE.w; x += 120) {
          const w = 60 + row * 6;
          s += `<g opacity="0.45">${solid(
            [
              [x, y],
              [x + w, y],
              [x + w - 8, y + 40],
              [x - 8, y + 40],
            ],
            { seed: 850 + x + y, color: INK }
          )}</g>`;
        }
      }
      return s;
    },
  },
  {
    id: 'tiles',
    name: 'Tiles',
    draw: () => {
      let s = '';
      for (let y = SCENE.floorY + 24; y < SCENE.h; y += 34) {
        s += stroke([[0, y], [SCENE.w, y]], { w: 4, seed: 860 + y, color: INK, opacity: 0.35 });
      }
      for (let x = 0; x < SCENE.w; x += 90) {
        s += stroke([[x, SCENE.floorY], [x - 40, SCENE.h]], { w: 4, seed: 870 + x, color: INK, opacity: 0.3 });
      }
      return s;
    },
  },
];

/* ------------------------------------------------------------ decor items */

function frameBox(x1, y1, x2, y2, seed) {
  return [
    [x1, y1],
    [x2, y1],
    [x2, y2],
    [x1, y2],
  ];
}

export const DECOR = [
  {
    id: 'chandelier',
    name: 'Chandelier',
    at: [480, 0],
    box: [-100, -6, 200, 170],
    draw: () => {
      let s = stroke([[0, 0], [0, 52]], { w: 6, seed: 901 });
      s += stroke(ellipsePts(0, 74, 82, 20, 24), { w: 8, closed: true, seed: 903 });
      s += stroke([[-58, 62], [0, 48], [58, 62]], { w: 5, seed: 904 });
      for (let i = 0; i < 5; i++) {
        const a = Math.PI * (0.12 + (i / 4) * 0.76);
        const x = -82 * Math.cos(a);
        const y = 74 + 20 * Math.sin(a);
        s += solid(
          [
            [x - 8, y - 4],
            [x + 8, y - 4],
            [x + 6, y - 34],
            [x - 6, y - 34],
          ],
          { seed: 911 + i }
        );
        s += stroke(
          [
            [x, y - 34],
            [x - 8, y - 48],
            [x, y - 62],
            [x + 8, y - 48],
          ],
          { w: 5, closed: true, seed: 915 + i }
        );
      }
      [-62, -22, 22, 62].forEach((x, i) => {
        s += beads([[x, 84], [x, 84 + (i % 2 ? 46 : 30)]], { r: 4.5, gap: 13, seed: 921 + i });
      });
      s += beads([[0, 92], [0, 138]], { r: 5, gap: 14, seed: 929 });
      return s;
    },
  },
  {
    id: 'window',
    name: 'Window',
    at: [140, 150],
    box: [-110, -110, 220, 240],
    draw: () => {
      const pane = frameBox(-70, -90, 70, 70);
      let s = `<path d="M -70 -90 L 70 -90 L 70 70 L -70 70 Z" fill="${PAPER}"/>`;
      s += stroke(pane, { w: 9, closed: true, seed: 921 });
      s += stroke([[0, -90], [0, 70]], { w: 6, seed: 923 });
      s += stroke([[-70, -10], [70, -10]], { w: 6, seed: 925 });
      s += star(-38, -56, 13, 5, 927);
      s += stroke(arcPts(34, -52, 20, 20, 0.6, Math.PI * 1.55, 12), { w: 6, seed: 929 });
      // curtains
      s += scribble(
        [
          [-104, -104],
          [-64, -100],
          [-58, 60],
          [-84, 92],
          [-108, 60],
        ],
        { gap: 9, w: 4, angle: -80, seed: 931, edge: 6 }
      );
      s += scribble(
        [
          [104, -104],
          [64, -100],
          [58, 60],
          [84, 92],
          [108, 60],
        ],
        { gap: 9, w: 4, angle: 80, seed: 933, edge: 6 }
      );
      s += stroke([[-114, -104], [114, -104]], { w: 8, seed: 935 });
      return s;
    },
  },
  {
    id: 'portrait',
    name: 'Portrait',
    at: [830, 150],
    box: [-80, -100, 160, 200],
    draw: () => {
      const f = frameBox(-64, -84, 64, 84);
      let s = `<path d="M -64 -84 L 64 -84 L 64 84 L -64 84 Z" fill="${PAPER}"/>`;
      s += stroke(f, { w: 11, closed: true, seed: 941 });
      s += stroke(frameBox(-52, -72, 52, 72), { w: 4, closed: true, seed: 943 });
      s += stroke(ellipsePts(0, -26, 24, 27, 18), { w: 6, closed: true, seed: 945 });
      s += dot(-9, -32, 4, 947);
      s += dot(9, -32, 4, 949);
      s += stroke(arcPts(0, -22, 10, 8, 0.4, Math.PI - 0.4, 8), { w: 4, seed: 951 });
      s += scribble(
        [
          [-34, 56],
          [-24, 6],
          [24, 6],
          [34, 56],
        ],
        { gap: 8, w: 4, angle: -70, seed: 953, edge: 5 }
      );
      s += beads([[-30, -46], [0, -60], [30, -46]], { r: 4, gap: 12, seed: 955 });
      return s;
    },
  },
  {
    id: 'plant',
    name: 'Potted Plant',
    at: [70, 436],
    box: [-70, -140, 140, 160],
    draw: () => {
      let s = '';
      for (let i = -3; i <= 3; i++) {
        const tipX = i * 17;
        const tipY = -120 + Math.abs(i) * 18;
        s += scribble(
          [
            [0, -10],
            [tipX * 0.6 - 8, (tipY - 10) * 0.7],
            [tipX, tipY],
            [tipX * 0.6 + 8, (tipY - 10) * 0.7],
          ],
          { gap: 7, w: 3.4, angle: 40 + i * 10, seed: 961 + i * 3, edge: 4 }
        );
      }
      s += hatch(
        [
          [-34, -12],
          [34, -12],
          [26, 22],
          [-26, 22],
        ],
        { gap: 10, w: 4, angle: 90, seed: 967, edge: 8 }
      );
      return s;
    },
  },
  {
    id: 'rug',
    name: 'Round Rug',
    at: [480, 500],
    box: [-150, -60, 300, 120],
    draw: () => {
      const oval = ellipsePts(0, 0, 140, 48, 26);
      return (
        scribble(oval, { gap: 13, w: 4, angle: -20, seed: 971, edge: 8 }) +
        beads(ellipsePts(0, 0, 128, 40, 26).concat([[128, 0]]), { r: 4.5, gap: 15, seed: 973 })
      );
    },
  },
  {
    id: 'table',
    name: 'Table & Vase',
    at: [770, 434],
    box: [-95, -190, 190, 215],
    draw: () => {
      let s = solid(
        [
          [-70, -60],
          [70, -60],
          [70, -46],
          [-70, -46],
        ],
        { seed: 981 }
      );
      s += stroke([[-52, -46], [-58, 18]], { w: 8, seed: 983 });
      s += stroke([[52, -46], [58, 18]], { w: 8, seed: 985 });
      s += stroke([[-58, 18], [58, 18]], { w: 6, seed: 987 });
      s += hatch(
        [
          [-20, -140],
          [-14, -96],
          [-24, -62],
          [24, -62],
          [14, -96],
          [20, -140],
        ],
        { gap: 9, w: 3.6, angle: 80, seed: 989, edge: 6 }
      );
      [[-30, -158], [0, -170], [26, -156]].forEach(([x, y], i) => {
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2;
          s += blob(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 5, rng(991 + i * 5 + k));
        }
        s += stroke([[x, y + 8], [0, -136]], { w: 4, seed: 995 + i });
      });
      return s;
    },
  },
  {
    id: 'clock',
    name: 'Tall Clock',
    at: [890, 430],
    box: [-60, -260, 120, 280],
    draw: () => {
      const body = [
        [-42, -240],
        [42, -240],
        [42, 4],
        [-42, 4],
      ];
      let s = `<path d="M -42 -240 L 42 -240 L 42 4 L -42 4 Z" fill="${PAPER}"/>`;
      s += stroke(body, { w: 10, closed: true, seed: 1001 });
      s += solid(
        [
          [-52, -258],
          [52, -258],
          [46, -238],
          [-46, -238],
        ],
        { seed: 1003 }
      );
      s += stroke(ellipsePts(0, -186, 30, 30, 18), { w: 7, closed: true, seed: 1005 });
      s += stroke([[0, -186], [0, -208]], { w: 5, seed: 1007 });
      s += stroke([[0, -186], [17, -178]], { w: 5, seed: 1009 });
      s += stroke([[0, -140], [0, -60]], { w: 4, seed: 1011 });
      s += solid(ellipsePts(0, -46, 20, 20, 14), { seed: 1013 });
      return s;
    },
  },
  {
    id: 'mirror',
    name: 'Mirror',
    at: [140, 170],
    box: [-70, -110, 140, 220],
    draw: () => {
      const oval = ellipsePts(0, 0, 52, 90, 24);
      let s = `<path d="M ${oval.map((p) => p.join(' ')).join(' L ')} Z" fill="${PAPER}"/>`;
      s += stroke(oval, { w: 12, closed: true, seed: 1021 });
      s += beads(ellipsePts(0, 0, 40, 76, 24).concat([[40, 0]]), { r: 4, gap: 14, seed: 1023 });
      s += stroke([[-22, 40], [10, -40]], { w: 4, seed: 1025, opacity: 0.5 });
      s += stroke([[2, 44], [26, -16]], { w: 4, seed: 1027, opacity: 0.5 });
      s += solid(teeth(-26, 26, -92, -116, 3, { wobble: 3 }).concat([[26, -86], [-26, -86]]), { seed: 1029 });
      return s;
    },
  },
  {
    id: 'cat',
    name: 'Cat',
    at: [860, 500],
    box: [-70, -80, 150, 110],
    draw: () => {
      let s = solid(
        [
          [-40, -18],
          [-6, -30],
          [30, -16],
          [34, 16],
          [-40, 16],
        ],
        { seed: 1031 }
      );
      s += solid(
        [
          [-58, -48],
          [-46, -72],
          [-36, -52],
          [-24, -70],
          [-14, -46],
          [-18, -20],
          [-52, -22],
        ],
        { seed: 1033 }
      );
      s += dot(-46, -44, 4.5, 1035, PAPER);
      s += dot(-28, -44, 4.5, 1037, PAPER);
      s += stroke([[34, 6], [62, -14], [56, -44]], { w: 8, seed: 1039 });
      s += stroke([[-60, -38], [-84, -44]], { w: 3.4, seed: 1041 });
      s += stroke([[-60, -32], [-84, -28]], { w: 3.4, seed: 1043 });
      return s;
    },
  },
  {
    id: 'balloons',
    name: 'Balloons',
    at: [330, 120],
    box: [-80, -80, 170, 220],
    draw: () => {
      let s = '';
      [[-44, -40, 1045], [4, -62, 1047], [48, -34, 1049]].forEach(([x, y, sd]) => {
        s += scribble(ellipsePts(x, y, 30, 36, 20), { gap: 8, w: 3.6, angle: -70, seed: sd, edge: 6 });
        s += stroke([[x, y + 36], [x + 6, y + 100], [x - 4, y + 130]], { w: 3.4, seed: sd + 1 });
      });
      return s;
    },
  },
  {
    id: 'bunting',
    name: 'Bunting',
    at: [480, 34],
    box: [-330, -30, 660, 110],
    draw: () => {
      let s = stroke([[-320, -10], [0, 40], [320, -10]], { w: 5, seed: 1051 });
      for (let i = -4; i <= 4; i++) {
        const x = i * 66;
        const y = -10 + (1 - Math.abs(i) / 4.6) * 46;
        const flag = [
          [x - 22, y],
          [x + 22, y],
          [x, y + 44],
        ];
        s += i % 2 ? hatch(flag, { gap: 9, w: 3.4, angle: 60, seed: 1053 + i, edge: 5 }) : scribble(flag, { gap: 8, w: 3.4, angle: -60, seed: 1057 + i, edge: 5 });
      }
      return s;
    },
  },
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    at: [100, 436],
    box: [-90, -230, 180, 250],
    draw: () => {
      const body = [
        [-72, -210],
        [72, -210],
        [72, 10],
        [-72, 10],
      ];
      let s = `<path d="M -72 -210 L 72 -210 L 72 10 L -72 10 Z" fill="${PAPER}"/>`;
      s += stroke(body, { w: 10, closed: true, seed: 1061 });
      [-140, -70].forEach((y, i) => {
        s += stroke([[-72, y], [72, y]], { w: 7, seed: 1063 + i });
      });
      const shelfY = [-210, -140, -70];
      shelfY.forEach((top, r) => {
        let x = -62;
        let k = 0;
        while (x < 56) {
          const w = 12 + ((r + k) % 3) * 6;
          const h = 48 + ((k % 2) * 8);
          const book = [
            [x, top + 68 - h],
            [x + w, top + 68 - h],
            [x + w, top + 66],
            [x, top + 66],
          ];
          s += k % 2 ? solid(book, { seed: 1071 + r * 10 + k }) : hatch(book, { gap: 8, w: 3, angle: 0, seed: 1081 + r * 10 + k, edge: 4 });
          x += w + 5;
          k++;
        }
      });
      return s;
    },
  },
  {
    id: 'candles',
    name: 'Candelabra',
    at: [225, 436],
    box: [-60, -200, 120, 220],
    draw: () => {
      let s = stroke([[0, -150], [0, 4]], { w: 9, seed: 1101 });
      s += stroke([[-34, 12], [34, 12]], { w: 9, seed: 1103 });
      s += stroke([[-42, -140], [0, -120], [42, -140]], { w: 7, seed: 1105 });
      [-42, 0, 42].forEach((x, i) => {
        const top = i === 1 ? -178 : -196;
        s += solid(
          [
            [x - 9, i === 1 ? -160 : -140],
            [x + 9, i === 1 ? -160 : -140],
            [x + 7, top + 18],
            [x - 7, top + 18],
          ],
          { seed: 1107 + i }
        );
        s += stroke(
          [
            [x, top + 18],
            [x - 9, top + 2],
            [x, top - 12],
            [x + 9, top + 2],
          ],
          { w: 5, closed: true, seed: 1111 + i }
        );
      });
      return s;
    },
  },
  {
    id: 'moon-lamp',
    name: 'Star Lamp',
    at: [480, 130],
    box: [-70, -60, 140, 190],
    draw: () => {
      let s = stroke([[0, -60], [0, 0]], { w: 5, seed: 1121 });
      s += star(0, 40, 44, 5, 1123);
      s += beads([[-40, 92], [0, 108], [40, 92]], { r: 4.5, gap: 14, seed: 1125 });
      return s;
    },
  },
];

export function findDecor(id) {
  return DECOR.find((d) => d.id === id) || null;
}
