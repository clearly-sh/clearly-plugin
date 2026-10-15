---
name: social-posts
description: >-
  Instagram feed posts and carousels, stories, reel covers, thumbnails and banners on a Clearly canvas: platform sizes (frame presets), safe zones, phone-readable type, carousel structure, one design rebuilt for every format, and PNG export. Load it for any social post, carousel, story, thumbnail, banner or ad, or to adapt a design to other platform sizes. Needs a terminal with the beehaven CLI; in a chat with only the Clearly connector, use the clearly_* tools.
---

> **Canvas work goes through the CLI.** Every verb below is a `canvas-act` action:
> `beehaven call canvas-act '{"compositionId":"<id>","action":"frame.create","args":{"name":"Launch · IG 4:5","preset":"social-portrait"}}'`,
> or several at once with `{"compositionId":"<id>","batch":[{"action":…,"args":{…}}, …]}`. `image-make`,
> `brand-tokens` and `canvas-perceive` are `beehaven call <name> '{…}'` too. The same text is the
> in-app agent's `social-posts` house skill (apps/cloudflare/src/agent/media-skills.ts); keep them identical.

# social-posts

Social posts on the Clearly canvas: Instagram feed posts and carousels, stories and reels covers, thumbnails and banners, and one design adapted to every format.

SIZES (frame.create { name, preset })
- Feed: "social-portrait" 1080×1350 (4:5, the most screen space; the default for a feed post), "social-post" 1080×1080, "social-grid" 1080×1440 (3:4).
- Story / reel / TikTok cover: "social-story" 1080×1920.
- "youtube-thumbnail" 1280×720, "pinterest-pin" 1000×1500, "linkedin-post" 1200×627, "x-post" 1600×900, "linkedin-banner", "youtube-banner", "facebook-cover".
Name artboards "<campaign> · IG 4:5", "<campaign> · Story".

SAFE ZONES (keep text, logos and faces inside)
- Story/reel 1080×1920: nothing important in the top 250 px or the bottom 340 px (the app's own UI covers them).
- The Instagram profile grid shows a 3:4 centre crop: on a 1:1 post keep key content inside the centre 810 px; on 4:5, inside the centre ~1012 px.
- YouTube thumbnail: the duration badge covers the bottom-right corner.
- Margins: at least 64 px from every edge on 1080-wide formats.

TYPE THAT READS ON A PHONE
A 1080 px post is seen at about a third of its size. Headline 72–120 px, at most about 7 words; supporting line 36–48 px; small print 28 px minimum. One typeface family, two weights. Measure with canvas.measure-text before placing.

LAYOUT
One focal point per slide: a photo or illustration, one headline, one small brand mark. Brand colours from brand-tokens. Text over a photo needs a calm area, a scrim or a plate (photo-editing skill). Leave the logo small, in a corner, never centred.

CAROUSELS
2–10 slides of the same size, built as artboards side by side. Slide 1 is the hook (the claim or the question), the middle slides each carry one idea, the last is the call to action. Repeat the same grid, margins and type sizes on every slide. For continuity, carry one shape or line across a seam: draw its two halves at the matching edge of each slide.

ONE DESIGN, EVERY FORMAT
Design the master first (usually 4:5). For each other format, create its artboard from the preset and REBUILD the layout: same hierarchy and content, re-flowed for the new shape. Do not just scale. Move a photo's focus with cropX/cropY so the subject stays in frame, re-wrap the headline to the new width, and keep sizes relative to the short side. canvas.duplicate { ids, dx, name, toW } only for the same aspect at another size (for example 1080 → 2160).

CHECK AND DELIVER
- canvas.review each artboard until clean or look; open its image and check the safe zones and legibility.
- Export: canvas.export { format:"png", ids:[artboard] } gives a 1080-px file link per artboard (scale:2 for a sharper upload).
- Offer a caption (the first line is the hook), alt text describing the image, and hashtags only if asked.
