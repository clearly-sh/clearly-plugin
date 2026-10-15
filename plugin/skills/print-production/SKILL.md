---
name: print-production
description: >-
  Print-ready flyers, posters, postcards, business cards and A-series pages on a Clearly canvas: 150 px/in print presets, margins and bleed, print type sizes, image resolution, RGB-to-CMYK risks and PDF/300 dpi export. Load it for anything that will be printed. Needs a terminal with the beehaven CLI; in a chat with only the Clearly connector, use the clearly_* tools.
---

> **Canvas work goes through the CLI.** Every verb below is a `canvas-act` action:
> `beehaven call canvas-act '{"compositionId":"<id>","action":"frame.create","args":{"name":"Launch · IG 4:5","preset":"social-portrait"}}'`,
> or several at once with `{"compositionId":"<id>","batch":[{"action":…,"args":{…}}, …]}`. `image-make`,
> `brand-tokens` and `canvas-perceive` are `beehaven call <name> '{…}'` too. The same text is the
> in-app agent's `print-production` house skill (apps/cloudflare/src/agent/media-skills.ts); keep them identical.

# print-production

Print production on the Clearly canvas: flyers, posters, postcards, business cards and A-series pages that print correctly.

SIZE AND SCALE
Print presets are 150 px per inch: "a4" 1240×1754, "a5", "a3", "flyer" (US Letter) 1275×1650, "poster-18x24" 2700×3600, "postcard" 900×600, "business-card" 525×300. At this scale 1 pt = 2.08 px and 1 mm = 5.9 px. A 2× export is 300 dpi.

MARGINS AND BLEED
- Keep text and logos at least 0.25 in (38 px) inside the trim; 0.125 in (19 px) is the absolute minimum.
- Colour and photos that touch the edge must run to the artboard edge.
- Printers usually want 3 mm (1/8 in) bleed. Canvas exports are trim size: when the printer needs bleed, say so and offer to enlarge the artboard by 19 px a side with trim marks drawn as thin lines outside the design area, or export from the editor with Bleed set.

TYPE
Body 9–12 pt (19–25 px), captions no smaller than 7 pt (15 px), headlines sized for the viewing distance (a poster headline is read from 2–3 m). Lines no thinner than 0.25 pt (1 px at this scale).

IMAGES
A photo prints sharp when its source has at least 2 pixels for every canvas pixel it covers (300 dpi at 2× export). When a photo is small or soft, run canvas.image-op { id, op:"upscale" } before export.

COLOUR
Canvas colour is RGB; the printer converts to CMYK. Neon and electric RGB colours print duller: warn when the brand relies on one. Large black areas print richer as a rich black; small text stays pure black. Ask whether the job has spot colours or a printer's spec, and follow it.

CHECK AND DELIVER
- canvas.review the artboard; check margins with canvas.measure { frame }.
- canvas.export { format:"pdf", ids:[artboard] } for vector type and shapes; canvas.export { format:"png", ids:[artboard], scale:2 } for a 300 dpi image.
- In your reply state the trim size, whether bleed is included, the export resolution and any colour risk.
