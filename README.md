# The Dressing Game

A dress-up game drawn in the same black-marker style as the original paper sketch:
bell gowns filled with looping scribbles, spiky crowns, top hats, bead necklaces
and gloves. A lady and a gentleman stand together in a room you can decorate.

## Play

No build step, no dependencies. Serve the folder and open it:

```bash
python3 -m http.server 8777
# then visit http://127.0.0.1:8777/
```

(Opening `index.html` straight from disk will not work — the game uses ES modules,
which browsers only load over http.)

## How to play

- **Lady / Gentleman tabs** — pick a slot (Outfits, Hats, Necks, Gloves, Shoes, Extras)
  and tap a piece to put it on. Tap it again to take it off.
- Tap a figure in the scene to switch to them. You can also drag a piece from the
  tray onto the scene.
- **Room tab** — choose a colour scheme, a wall pattern and a floor pattern, then tap
  decorations to add them. Drag a decoration to move it, double-tap it to take it away.
- **Colour** tints the clothes with the current room palette; off is the original
  black-marker look.
- **Surprise!** dresses everyone and decorates the room at random.
- **Clear** undresses the selected figure, or empties the room on the Room tab.
- **Save** downloads the scene as a PNG.

Everything is stored in `localStorage`, so your outfits and room are still there
next time.

## How it is built

| File | Purpose |
| --- | --- |
| `js/marker.js` | Hand-drawn drawing primitives: seeded jitter strokes, solid ink shapes, loop/scribble/hatch/dot fills, bead chains, crown teeth, scallops. |
| `js/figures.js` | Shared anatomy (`A`) plus the lady and gentleman base bodies. Every garment is authored against these coordinates. |
| `js/wardrobe.js` | The catalog: 7 outfits, 6 hats, 5 necklaces, 3 gloves, 4 shoes and 4 extras for the lady; 7 outfits, 5 hats, 4 neckwear, 2 gloves, 3 shoes and 5 extras for the gentleman. |
| `js/decor.js` | Room palettes, wall/floor patterns and 14 decorations. |
| `js/game.js` | Scene assembly, tray UI, dressing, decoration placement and dragging, PNG export, saving. |

There are no image assets — every line is generated SVG, so the art stays crisp at
any size and the marker wobble is reproducible from a seed.
