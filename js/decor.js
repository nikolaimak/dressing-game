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

/* --------------------------------------------------------------- surfaces */

export const WALL_PATTERNS = [
  { id: 'plain', name: 'Plain', draw: () => '' },
  {
    id: 'stripes',
    name: 'Stripes',
    draw: (c = INK) => {
      let s = '';
      for (let x = 40; x < SCENE.w; x += 62) {
        s += stroke([[x, 0], [x + 6, SCENE.floorY]], { w: 5, seed: 800 + x, color: c, opacity: 0.35 });
      }
      return s;
    },
  },
  {
    id: 'dots',
    name: 'Dots',
    draw: (c = INK) => {
      const rand = rng(811);
      let s = '';
      for (let y = 30; y < SCENE.floorY; y += 56) {
        for (let x = 30 + ((y / 56) % 2) * 28; x < SCENE.w; x += 56) {
          s += `<g opacity="0.4">${blob(x, y, 5, rand, c)}</g>`;
        }
      }
      return s;
    },
  },
  {
    id: 'stars',
    name: 'Stars',
    draw: (c = INK) => {
      const rand = rng(813);
      let s = '';
      for (let y = 40; y < SCENE.floorY - 20; y += 90) {
        for (let x = 50 + ((y / 90) % 2) * 45; x < SCENE.w; x += 90) {
          s += `<g opacity="0.35">${star(x, y, 12, 5, 815 + x + y, c)}</g>`;
        }
      }
      return s;
    },
  },
  {
    id: 'bricks',
    name: 'Bricks',
    draw: (c = INK) => {
      let s = '';
      let row = 0;
      for (let y = 40; y < SCENE.floorY; y += 44, row++) {
        s += stroke([[0, y], [SCENE.w, y]], { w: 4, seed: 820 + y, color: c, opacity: 0.3 });
        for (let x = (row % 2) * 60; x < SCENE.w; x += 120) {
          s += stroke([[x, y], [x, y + 44]], { w: 4, seed: 830 + x + y, color: c, opacity: 0.3 });
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
    draw: (c = INK) => {
      let s = '';
      for (let x = -120; x < SCENE.w + 200; x += 96) {
        s += stroke([[x + 100, SCENE.floorY], [x - 30, SCENE.h]], { w: 4, seed: 840 + x, color: c, opacity: 0.4 });
      }
      s += stroke([[0, SCENE.floorY + 46], [SCENE.w, SCENE.floorY + 46]], { w: 4, seed: 845, color: c, opacity: 0.35 });
      return s;
    },
  },
  {
    id: 'checker',
    name: 'Checker',
    draw: (c = INK) => {
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
            { seed: 850 + x + y, color: c }
          )}</g>`;
        }
      }
      return s;
    },
  },
  {
    id: 'tiles',
    name: 'Tiles',
    draw: (c = INK) => {
      let s = '';
      for (let y = SCENE.floorY + 24; y < SCENE.h; y += 34) {
        s += stroke([[0, y], [SCENE.w, y]], { w: 4, seed: 860 + y, color: c, opacity: 0.35 });
      }
      for (let x = 0; x < SCENE.w; x += 90) {
        s += stroke([[x, SCENE.floorY], [x - 40, SCENE.h]], { w: 4, seed: 870 + x, color: c, opacity: 0.3 });
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
  {
    id: 'fireplace',
    name: 'Fireplace',
    at: [480, 436],
    box: [-120, -210, 240, 230],
    draw: () => {
      const outer = [
        [-104, -190],
        [104, -190],
        [104, 12],
        [-104, 12],
      ];
      let s = `<path d="M -104 -190 L 104 -190 L 104 12 L -104 12 Z" fill="${PAPER}"/>`;
      s += stroke(outer, { w: 10, closed: true, seed: 1141 });
      s += solid(
        [
          [-118, -208],
          [118, -208],
          [112, -186],
          [-112, -186],
        ],
        { seed: 1143 }
      );
      const mouth = [
        [-66, -120],
        [66, -120],
        [66, 12],
        [-66, 12],
      ];
      s += solid(mouth, { seed: 1145 });
      // logs and flames
      s += stroke([[-40, -6], [40, -14]], { w: 10, seed: 1147, color: PAPER });
      s += stroke([[-36, -22], [34, -28]], { w: 9, seed: 1149, color: PAPER });
      [[-24, -46], [4, -62], [30, -44]].forEach(([x, y], i) => {
        s += stroke(
          [
            [x, y + 26],
            [x - 14, y],
            [x, y - 24],
            [x + 14, y],
          ],
          { w: 6, closed: true, seed: 1151 + i, color: PAPER }
        );
      });
      for (let x = -96; x <= 84; x += 34) {
        s += stroke([[x, -184], [x, -128]], { w: 4, seed: 1161 + x, opacity: 0.45 });
      }
      s += stroke([[-104, -128], [104, -128]], { w: 5, seed: 1169, opacity: 0.45 });
      return s;
    },
  },
  {
    id: 'armchair',
    name: 'Armchair',
    at: [790, 436],
    box: [-110, -190, 220, 210],
    draw: () => {
      const back = [
        [-74, -172],
        [74, -172],
        [82, -60],
        [-82, -60],
      ];
      let s = scribble(back, { gap: 11, w: 4, angle: -74, seed: 1171, edge: 8 });
      s += solid(
        [
          [-92, -70],
          [92, -70],
          [96, -18],
          [-96, -18],
        ],
        { seed: 1173, edge: 6 }
      );
      s += hatch(
        [
          [-96, -74],
          [-58, -74],
          [-54, -16],
          [-96, -16],
        ],
        { gap: 10, w: 4, angle: 80, seed: 1175, edge: 6 }
      );
      s += hatch(
        [
          [58, -74],
          [96, -74],
          [96, -16],
          [54, -16],
        ],
        { gap: 10, w: 4, angle: 80, seed: 1177, edge: 6 }
      );
      s += stroke([[-76, -18], [-72, 14]], { w: 9, seed: 1179 });
      s += stroke([[76, -18], [72, 14]], { w: 9, seed: 1181 });
      return s;
    },
  },
  {
    id: 'dog',
    name: 'Dog',
    at: [200, 496],
    box: [-90, -90, 180, 120],
    draw: () => {
      let s = solid(
        [
          [-46, -26],
          [-10, -38],
          [30, -24],
          [34, 14],
          [-46, 14],
        ],
        { seed: 1191 }
      );
      s += solid(ellipsePts(-56, -54, 26, 22, 16), { seed: 1193 });
      s += solid(
        [
          [-78, -66],
          [-64, -74],
          [-58, -40],
          [-74, -38],
        ],
        { seed: 1195 }
      );
      s += stroke([[-78, -48], [-88, -44]], { w: 6, seed: 1197 });
      s += dot(-64, -56, 4.5, 1199, PAPER);
      s += dot(-46, -54, 4.5, 1201, PAPER);
      s += stroke([[34, 4], [58, -20], [50, -46]], { w: 8, seed: 1203 });
      s += stroke([[-34, 14], [-34, 28]], { w: 8, seed: 1205 });
      s += stroke([[20, 14], [22, 28]], { w: 8, seed: 1207 });
      return s;
    },
  },
  {
    id: 'birdcage',
    name: 'Bird Cage',
    at: [660, 150],
    box: [-70, -80, 140, 220],
    draw: () => {
      let s = stroke([[0, -76], [0, -40]], { w: 5, seed: 1211 });
      s += stroke(arcPts(0, -40, 22, 18, Math.PI, Math.PI * 2, 10), { w: 6, seed: 1213 });
      const cage = [
        [-44, -34],
        [44, -34],
        [50, 74],
        [-50, 74],
      ];
      s += `<path d="M -44 -34 L 44 -34 L 50 74 L -50 74 Z" fill="${PAPER}"/>`;
      s += stroke(cage, { w: 8, closed: true, seed: 1215 });
      for (let x = -30; x <= 30; x += 20) {
        s += stroke([[x, -32], [x + x * 0.14, 72]], { w: 4, seed: 1217 + x });
      }
      s += stroke([[-47, 26], [47, 26]], { w: 4, seed: 1225 });
      s += solid(ellipsePts(4, 34, 15, 13, 14), { seed: 1227 });
      s += solid(
        [
          [16, 26],
          [30, 22],
          [22, 34],
        ],
        { seed: 1229 }
      );
      s += stroke([[-6, 46], [-6, 58]], { w: 4, seed: 1231 });
      s += beads([[-40, 78], [0, 92], [40, 78]], { r: 4, gap: 13, seed: 1233 });
      return s;
    },
  },
  {
    id: 'floor-lamp',
    name: 'Floor Lamp',
    at: [370, 436],
    box: [-60, -230, 120, 250],
    draw: () => {
      let s = stroke([[0, -170], [0, 6]], { w: 8, seed: 1241 });
      s += stroke([[-34, 14], [34, 14]], { w: 10, seed: 1243 });
      const shade = [
        [-46, -166],
        [46, -166],
        [30, -222],
        [-30, -222],
      ];
      s += hatch(shade, { gap: 11, w: 4, angle: 76, seed: 1245, edge: 8 });
      s += beads([[-44, -160], [0, -150], [44, -160]], { r: 4.5, gap: 13, seed: 1247 });
      return s;
    },
  },
  {
    id: 'book-stack',
    name: 'Book Stack',
    at: [280, 496],
    box: [-70, -100, 140, 120],
    draw: () => {
      let s = '';
      const rows = [
        [-52, -2, 104, 22, true],
        [-44, -26, 92, 22, false],
        [-36, -50, 76, 22, true],
        [-24, -74, 58, 22, false],
      ];
      rows.forEach(([x, y, w, h, filled], i) => {
        const box = [
          [x, y - h],
          [x + w, y - h],
          [x + w, y],
          [x, y],
        ];
        s += filled ? solid(box, { seed: 1251 + i }) : hatch(box, { gap: 8, w: 3.4, angle: 0, seed: 1261 + i, edge: 6 });
      });
      return s;
    },
  },
];

export function findDecor(id) {
  return DECOR.find((d) => d.id === id) || null;
}
