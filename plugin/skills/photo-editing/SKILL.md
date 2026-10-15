---
name: photo-editing
description: >-
  Choosing, cropping, cleaning up and treating photos on a Clearly canvas: focal-point crops (cropX/cropY), background removal, described edits and upscales (canvas.image-op), tints, duotones and scrims with blend-mode layers, and text over photos. Load it when placing, cropping, retouching or styling a photo or a product cut-out. Needs a terminal with the beehaven CLI; in a chat with only the Clearly connector, use the clearly_* tools.
---

> **Canvas work goes through the CLI.** Every verb below is a `canvas-act` action:
> `beehaven call canvas-act '{"compositionId":"<id>","action":"frame.create","args":{"name":"Launch · IG 4:5","preset":"social-portrait"}}'`,
> or several at once with `{"compositionId":"<id>","batch":[{"action":…,"args":{…}}, …]}`. `image-make`,
> `brand-tokens` and `canvas-perceive` are `beehaven call <name> '{…}'` too. The same text is the
> in-app agent's `photo-editing` house skill (apps/cloudflare/src/agent/media-skills.ts); keep them identical.

# photo-editing

Photo editing and art direction on the Clearly canvas: choosing, cropping, cleaning up and treating photos for posts, ads and layouts.

SOURCE
- The person's own photo (attached, or a file placed with canvas.place-source) beats a generated one for products, people and places they own.
- Generate with image-make: subject, setting, light, lens or angle, palette and mood, with no text in the image. Generate one, review it, then the next.
- Check generated photos for wrong hands, faces, text and logos before using them.

CROP AND FOCUS
An image covers its box (fit:"cover"). Choose the box for the format, then set cropX/cropY (0–1; 0 = left/top, 1 = right/bottom) so the subject sits on a third and keeps room in the direction it faces. Never crop through joints or the top of a head unless it is a deliberate close-up. fit:"contain" shows the whole picture with margins.

CLEAN UP (canvas.image-op { id, op, prompt? }, AI credits, up to a minute)
- "remove-bg": a product or person cut out; put it on a brand-colour background with a soft shadow (effects: drop-shadow y 24, blur 48, 15% black).
- "edit": one described change ("remove the cup on the left; keep everything else identical"). Say what must not change.
- "upscale": before print, or when the source is small.
- It replaces the image and returns previousSrc; keep:true puts the result beside the original for comparison.

TREATMENT (non-destructive: the original file never changes)
- One grade for a whole set: canvas.look { ids: [the frame, or the images], look } with "clean", "warm", "cool", "matte", "fade", "vivid", "high-contrast", "mono", "film" or "brand-duotone" (the brand's dark and light colours); "normal" clears. A frame applies it to every image inside, so a carousel looks like one shoot.
- Correct first: canvas.look { ids, look: "auto" } fixes each photo from its own pixels (exposure, contrast, black and white points, colour cast; a good photo is left alone). Photos from different sources: { ids: [the frame], look: "film", auto: true } puts the look on top of each correction, so the set matches.
- Fine-tune: canvas.update-nodes { ids, patch: { adjust: { highlights, shadows, whites, blacks, exposure, contrast, saturation, temperature, tint (each -100..100), fade, vignette, sharpen, grain (0..100), grayscale: true, duotone: { dark, light } } } }. Keys merge into the current grade; 0 resets one. Recover a bright sky with highlights below 0, open dark faces with shadows above 0. Moves of 5–25 read as natural; past 40 is a style. The review image shows the result.
- Darken under type: a gradient scrim from transparent to 60% black, or a black rect at 20–40%.
- A one-off colour wash: a rect over the photo in a brand colour with blendMode "color" or "multiply".
- Fade a photo into the background (a soft mask): canvas.update-nodes { ids, patch: { fadeOut: { edge: "bottom", from: 55, to: 100 } } }; edge "top", "left", "right" or "outside" (from the centre); fadeOut: null removes it. Not the same as adjust.fade, which lifts the blacks.
- A photo in a shape: put the shape BELOW the photo in one group (canvas.group), then canvas.arrange { ids: [shape, photo], op: "mask" }. The bottom layer clips the photo to its circle, rounded rectangle or path. A photo inside a word: big bold text below the photo, then mask; the photo shows through the letters and the text stays editable. Move or scale the photo so its richest part (the subject, the strongest colour) sits behind the letters, not a plain wall or cloth; check the review.
- Texture: sharpen 15–35 crisps a soft photo (more halos edges); grain 10–25 gives a film or print feel and helps flat AI renders. The "film" look includes grain 20.
Custom curves do not exist yet; do not claim them.

TEXT OVER PHOTOS
Place text on the calmest area, never over a face. If the area is busy, add a scrim or a solid plate. Check the review image: the text must read at a third of its size.

CHECK
canvas.review the artboard; use pixelScale 2 to inspect detail. Report what you changed in each photo and what still needs a real retouch.
