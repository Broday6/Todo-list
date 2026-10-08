# Vinyl Shutter Installation Video (built in code)

`vinyl-shutter-install.mp4` is a 1920×1080, 30 fps how-to video. It is rendered entirely
from code: a Three.js scene, captured frame by frame in headless Chromium and
encoded with ffmpeg. The look is based on Ekena Millwork's
[functional shutter hardware video](https://www.youtube.com/watch?v=HUmS6Mr55Go):

- a 3D-rendered front view of a window on lap siding
- soft daylight with leaf shadows
- bold white Poppins titles on the left

## Storyboard (11 clips, 6.5–8.5 s each)

| # | Clip | On-screen text |
|---|------|----------------|
| 01 | Hero push-in on the finished window | HOW TO / Install Vinyl Shutters |
| 02 | Studio: matched pair, then crane down to the supplied hardware | What's Included |
| 03 | Bench top-down: tools drop in with labels | Tools You'll Need |
| 04 | Shutter slides in beside the trim; level check; top/bottom alignment guides | Step 1 — Position Shutter |
| 05 | Shutter on the bench: tape measure, pencil marks at each mount point | Step 2 — Mark Mounting Points |
| 06 | Drill through each mark with the shutter supported on blocks | Step 3 — Drill Mounting Holes |
| 07 | Mark the wall through the holes, remove the shutter, drill the wall | Step 4 — Prepare Mounting Surface |
| 08 | Shutter returns; guide lines connect shutter holes to wall holes | Step 5 — Align Shutter |
| 09 | Colour-matched fasteners driven at the top, then the bottom | Step 6 — Secure Shutter |
| 10 | Right-hand shutter placed and fastened | Repeat on Opposite Side |
| 11 | Cinematic arc to the finished window; space left for a logo | A Simple Upgrade. A Beautiful Finish. |

## Guardrails followed

- No dimensions, hole spacings, drilling depths or fastener counts appear in the text.
  Every step defers to the manufacturer's instructions.
- The shutters are fixed decorative vinyl panels mounted straight to the wall.
  There are no hinges, pintles, tiebacks or holdbacks.
- The same house, window, shutter models, tools and lighting are used in every clip.
- The Ekena logo is **not** drawn. Redrawing a brand mark isn't allowed, so the hero
  and final frames leave clear space for the supplied logo to be added in the edit.

## Rebuild

```bash
npm install                     # three, @fontsource/poppins (playwright must be available)
node render.mjs                 # renders clips/s01.mp4 … s11.mp4
node render.mjs s05             # re-render one clip
node render.mjs --stills s05@2.6,6.8   # review stills → stills/
./assemble.sh                   # joins the clips with 0.5 s dissolves → vinyl-shutter-install.mp4
```

Scene timing, camera moves and copy for each clip live in the `SCENES` table in `scene.js`.
