---
name: layout-systems
description: >-
  Compose a specific artefact on a Clearly canvas to studio standard — poster,
  social campaign, presentation deck, landing page, editorial spread, report
  cover, one-pager. Gives the composition patterns, the real numbers per format,
  and the failure modes for each. Use after design-craft (which supplies grid,
  type scale and colour) when the job is a named deliverable rather than a
  system. Triggers: "design a poster", "make a deck", "landing page", "social
  campaign", "magazine spread", "report cover", "one-pager", "pitch deck",
  "hero section", "lay out this content", "make these slides".
---

# layout-systems — the named artefacts, with their real numbers

`design-craft` gives you grid, type scale, colour and the studio pass. This gives you the
composition patterns for a specific thing, and the way each one usually fails.

⚠ Load `design-craft` first. Everything here assumes its margins, scale and spacing system.

---

## The five compositions that cover almost everything

Pick one deliberately. Naming the pattern before you place a node is what stops a layout
becoming "things arranged until the space was full".

| pattern | shape | reads as | use for |
|---|---|---|---|
| **Anchored corner** | one heavy element in a corner, the rest quiet | confident, editorial | posters, covers |
| **Stacked bands** | full-width horizontal registers | ordered, calm | landing pages, reports |
| **Split field** | 2 fields, unequal (⅓ / ⅔ or 40/60) | modern, dynamic | heroes, slides, cards |
| **Centred axis** | symmetry about a vertical | formal, ceremonial | titles, invitations, certificates |
| **Field of one** | a single object in a large void | premium, quiet | product, luxury, statements |

⚠⚠ **NEVER 50/50.** An exact half-split has no hierarchy — the eye cannot choose, so it
reads as indecision. Use ⅓/⅔, 40/60 or 38/62. This is the single most common layout failure
in agent-generated work.

⚠ **Odd numbers group better than even.** Three cards read as a set; four read as a grid
that lost one. If you have four items, ask whether one is really a different thing.

---

## Poster / cover — 1080×1350, or A3 3508×4961 at 300dpi

```
margin 8–10% of the short edge      (1080 → 88–108; A3 → 280–350)
display 12–20% of the HEIGHT        (1350 → 160–270px), weight 700–900, tracking −3 to −6,
                                     lineHeight 0.92–1.0
supporting 2–3% of height           credits, date, venue — deliberately small
```

- **The scale jump is the whole poster.** Display to supporting should be **6–10×**. A poster
  whose headline is twice its body is a flyer.
- **One image or one shape. Not both.** If there is a photograph, the type sits ON it or
  BESIDE it — never a third element competing.
- ⚠ **Let something bleed.** A shape cropped by the edge implies a world larger than the
  page. A poster where every element floats inside the margin reads timid. **Bleed exactly
  one thing.**
- **Credits block**: set it small, tracked +1, in 2–4 short lines, bottom-aligned to the
  margin. This block is what makes a poster look like a real poster.

⚠ Paula Scher's Public Theater work is the reference for typographic posters: the type IS the
image — wood-type weights, extreme scale contrast, colour blocks — and it held up for decades
precisely because it did not depend on a photograph that would need replacing.

---

## Social campaign — 1080×1350 feed · 1080×1920 story · 1080×1080 tile

- **Design the feed post first, then cut the story from it** — not the reverse. A 4:5 that
  works crops up cleanly; a 9:16 rarely crops down.
- ⚠⚠ **STORY SAFE ZONES: 250px top and bottom.** Platform UI sits there. Content inside that
  band will be covered. The band should not be empty-looking either — carry a background
  texture or an oversized faint element through it so it reads as reserved, not unfinished.
- **A campaign is a SYSTEM, not one post.** Three posts that share a grid, a type scale and
  one colour move read as a campaign; three beautiful unrelated posts do not. Vary the
  content, hold the structure.
- **Thumb test**: render it and view at ~150px wide. If the headline is unreadable, the
  headline is too long — cut words, do not shrink type.

---

## Presentation deck — 1920×1080

```
margin 120 · title 72–96 · body 28–32 · caption 20
content column ≤ 1200 even though the slide is 1920
```

- ⚠⚠ **≤ 40 words per slide, and one idea.** A slide is a headline with evidence. If it needs
  a paragraph, the paragraph belongs in a document and the slide gets its conclusion.
- **The title is the ARGUMENT, not the topic.** "Revenue" is a label; "Revenue doubled after
  we cut the plan count" is a slide.
- **Slide types, and a deck should use only 5–6:** title · statement · statistic · bullets
  (≤4, and ideally not at all) · quote · image-full · section divider · closing.
- ⚠ **Full-width text at 1920 is unreadable** — that is a ~160-character measure. Hold the
  content column at ≤1200 and let the outer space do the work.
- **A section divider every 4–6 slides.** Decks fail from lack of rhythm more than lack of
  content.

---

## Landing page / hero — 1440 wide (design), content max 1200

```
margin 96 · headline 64–88 (tracking −2, lineHeight 1.05) · sub 20–24 muted, w ≤ 640
CTA 48–56 tall, 24–32 horizontal padding · section spacing 96–160 vertical
```

- **The hero answers three questions in order**: what is it, who is it for, what do I do next.
  If any is missing the hero has failed regardless of how it looks.
- ⚠ **Sub-headline measure ≤ 640px.** A full-width subhead under a big headline is the most
  common hero failure — it turns the strongest element on the page into a wall.
- **One CTA.** A second, equal-weight button halves the first. If a secondary action is
  needed it is a text link, not a button.
- **Vertical rhythm between sections is a scale too**: 96 / 128 / 160. Sections at arbitrary
  distances read as a page assembled from parts.

---

## Editorial spread / report — A4 2480×3508 at 300dpi

```
margin: outer 10%, inner (gutter side) 12–14% — asymmetric, because the binding eats it
columns 2–3 for A4 body · measure 45–75ch · body 10–11pt (≈42–46px at 300dpi), lineHeight 1.45
```

- **Asymmetric margins are the mark of real editorial.** Equal margins all round read as a
  word-processor document.
- **A baseline grid across columns is what makes a spread look typeset.** Every line of body
  copy in every column sits on the same horizontal line.
- **Pull-quotes and captions are the rhythm.** A page of unbroken body copy is a wall; a
  pull-quote every 2–3 columns gives the eye a landing.
- ⚠ **Widows and orphans**: no single word alone on a last line, no single line alone at the
  top of a column. Fix by editing the copy, not by re-tracking the paragraph.

---

## Cards, tables and dense UI

- **Card padding 24–32, radius 10–16, gap between cards ≥ 2× padding.**
- ⚠⚠ **BACKGROUND FIRST, LABEL SECOND.** Later nodes draw over earlier ones — create the
  card rect, THEN its text. Reversed, the opaque fill hides the label and you get the classic
  "grid of cards with no text".
- **In tables, align numbers RIGHT and use tabular figures.** Left-aligned numbers of
  different lengths cannot be compared, which is the only reason the table exists.
- **Zebra striping OR rules, never both.** Ideally neither — space is enough at ≥12px row padding.

---

## Building it on the canvas

```jsonc
// ONE batch. Frames first, then children with parentId (x/y RELATIVE to the frame).
{"action":"frame.create","args":{"name":"poster","x":200,"y":300,"w":1080,"h":1350,"fill":"#111111"}}
{"action":"canvas.create-node","args":{"name":"headline","type":"text","parentId":"poster",
  "x":88,"y":900,"w":904,"text":"…","size":180,"fontWeight":800,"letterSpacing":-5,"lineHeight":0.95}}
```

- ⚠ **Omit `h` on text** — it hugs its wrapped content. Pin `h` only when a later element's
  position is computed from this one's bottom edge.
- ⚠ **`canvas.measure-text` before you place display type.** `{text, size, fontWeight,
  letterSpacing, maxWidth}` → `{width, fits, overflowBy}`. A headline estimated by
  character-count ratio is how type ships past the margin.
- **Caption every artboard** above it (`19/700`, accent, tracking 2) so a multi-artboard board
  reads as a deck.
- **Then LOOK**: `canvas-perceive {includePixels, fitNodeIds:[frameId], pixelScale:2}` and read
  the picture. `canvas.audit` cannot see that it is ugly.

---

## The failure modes, per format

| format | it usually fails because |
|---|---|
| Poster | scale contrast too timid; nothing bleeds; credits block missing |
| Social | headline too long to read at thumb size; story safe zone left visibly empty |
| Deck | too many words; title states the topic instead of the argument; full-width text |
| Landing | subhead runs full width; two competing CTAs; sections evenly spaced |
| Editorial | symmetric margins; no baseline grid; unbroken columns |
| Cards | text created before its background; gaps equal to padding so groups do not read |
| **All** | **an exact 50/50 split, and four type sizes where three would do** |
