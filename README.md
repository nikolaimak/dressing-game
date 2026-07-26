# The Dressing Game

A dress-up game drawn in the same black-marker style as the original paper sketch:
bell gowns filled with looping scribbles, spiky crowns, top hats, bead necklaces
and gloves. A lady and a gentleman stand together in a room you can decorate and
paint.

**▶ Play: https://nikolaimak.github.io/dressing-game/**

## Run it locally

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
- **Paint anything** — the dashed panel in the tray colours whatever is selected:
  the piece in the current slot, or the decoration you last tapped. 28 swatches
  plus a colour picker for any shade you like. Every item keeps its own colour, so
  the gown, the crown and the shoes can all be different.
- **Room tab** — pick a room theme, or set the wall and floor colours yourself, then
  choose wall and floor patterns and tap decorations to add them. Drag a decoration
  to move it, tap it twice (or press Delete) to take it away.
- **Rainbow** repaints everything at random. **Surprise!** dresses everyone and
  redecorates the room. **Clear** undresses the selected figure, or empties the room.
  **Save** downloads the scene as a PNG.

Dark room themes flip the whole drawing to chalk-on-blackboard so plain ink pieces
stay readable.

Everything is stored in `localStorage`, so your outfits and room are still there
next time.

## What's in the box

| | |
| --- | --- |
| Lady | 11 outfits, 9 hats, 7 necklaces, 4 gloves, 6 shoes, 7 extras |
| Gentleman | 11 outfits, 8 hats, 6 neckwear, 3 gloves, 5 shoes, 8 extras |
| Room | 20 decorations, 12 themes, 5 wall patterns, 4 floor patterns |

## How it is built

| File | Purpose |
| --- | --- |
| `js/marker.js` | Hand-drawn drawing primitives: seeded jitter strokes, solid ink shapes, loop/scribble/hatch/dot fills, bead chains, crown teeth, scallops — plus `recolour()`, which repaints a finished drawing. |
| `js/colours.js` | The 28 paint swatches, the room themes and the light/dark contrast helpers. |
| `js/figures.js` | Shared anatomy (`A`) plus the lady and gentleman base bodies. Every garment is authored against these coordinates. |
| `js/wardrobe.js` | The clothing catalog, built from parameterised gown/sleeve/shoe/glove helpers. |
| `js/decor.js` | Wall and floor patterns and the room decorations. |
| `js/game.js` | Scene assembly, tray UI, dressing, painting, decoration placement and dragging, PNG export, saving. |

There are no image assets — every line is generated SVG, so the art stays crisp at
any size and the marker wobble is reproducible from a seed. A garment is just a
string of SVG drawn with a `{ fill, ink }` pair, and a decoration can be repainted
by swapping its ink token, so every object can carry its own colour.

## Deploying

It is a plain static site, so GitHub Pages serves it as-is from the repository root
(Settings → Pages → Deploy from a branch → `main` / `/`). All paths are relative, so
it works from a project subpath. No build, no bundler, nothing server-side.
