---
name: design-craft
description: >-
  The craft layer for visual work on a Clearly canvas — how to make something
  that looks like a design studio made it, not like a first draft. Grid
  construction, type scale, colour systems, spacing, hierarchy, optical
  correction, and the pass to run before calling anything finished. Load this
  BEFORE building any poster, deck, identity, landing page, social post, cover,
  report or diagram; clearly-canvas tells you HOW to place a node, this tells
  you WHERE it goes and WHY. Triggers: "design", "make it look good", "make it
  beautiful", "lay this out", "poster", "deck", "landing page", "brand", "this
  looks off", "make it more premium", "art direct this", "clean this up".
---

# design-craft — the difference between placed and designed

`clearly-canvas` teaches the mechanics: node shape, coordinates, verbs. This teaches the
part that makes the result worth looking at.

⚠ **Everything here is expressed as NUMBERS you can put on a node.** A rule you cannot act
on is a rule you will not follow. Where a value is a judgement call, this says so.

---

## 0. The method: decide before you draw

Pentagram — the largest independent design consultancy, partner-led with no house style —
is **idea-led, not style-led**: each partner runs their own team, and the through-line is
that the work answers a brief rather than expressing a signature. Michael Bierut's *How to*
presents 35 case studies as **brief → rationale → trade-offs**, which is the useful shape:
the reasoning is the deliverable, not the artefact.

Massimo Vignelli's *Canon* gives the three questions, in order. Answer them in one line each
before you place a single node:

| | question | if you skip it |
|---|---|---|
| **Semantics** | What does this MEAN, to whom? | a beautiful thing about nothing |
| **Syntactics** | What visual grammar suits it? | borrowed style, arbitrary choices |
| **Pragmatics** | Will they understand it? | clever, unread |

⚠⚠ **THE SINGLE MOST COMMON AGENT FAILURE IS SKIPPING SEMANTICS.** Asked for "a poster for a
jazz night", a weak agent reaches for a typeface and a gradient. A studio asks what the night
IS — basement or concert hall, 40 people or 400, regulars or first-timers — and the answer
picks the type, the palette and the crop. **You can ask the user one sentence, or state your
reading and proceed; you cannot skip it.**

⚠ **Vignelli: "Design is one."** The discipline is above style. A deck, a poster and an app
screen are the same problem — order, hierarchy, restraint — wearing different aspect ratios.

---

## 1. The grid — build it, don't eyeball it

Josef Müller-Brockmann systematised this over two decades of Tonhalle Zürich posters and
codified it in *Grid Systems in Graphic Design* (1981). The grid is not a technical
convenience; it is what makes a composition read as ordered rather than arranged.

**Construct it in this order, every time:**

1. **Canvas** — pick the real output size. 1080×1350 (social 4:5) · 1080×1920 (story 9:16) ·
   1920×1080 (deck/desktop) · 1440×1024 (web) · 2480×3508 (A4 at 300dpi).
2. **Margin** — the single biggest lever on whether it looks professional. Start at
   **6–8% of the short edge**. On 1080 wide that is **72px**. Go bigger for editorial (10%),
   never smaller than 4% except for a deliberate full-bleed.
3. **Columns** — 12 divides by 2, 3, 4 and 6, which is why it is the default. Use 6 for
   simple work, 12 for anything with mixed content, 3–4 for a poster.
4. **Gutter** — 2–3% of the content width. On a 936px content area, **24px**.
5. **Baseline** — an 8pt vertical rhythm. Every y is a multiple of 8; every height is a
   multiple of 4.

**The arithmetic, done for you (1080 canvas):**

```
margin 72 · content 936 · 12 columns · gutter 24
column = (936 − 11×24) / 12 = 56px
column + gutter = 80px          ← every x lands on 72 + n×80
```

⚠ **A column count is a decision about CONTENT, not a default.** Three columns of body copy
at 1080 wide gives a 96-character measure, which is unreadable. Pick the grid the content
needs, then hold it.

⚠⚠ **THE GRID IS A SKELETON, NOT A CAGE.** Müller-Brockmann's own posters break it — one
element crossing the grid is what creates tension. **Break it once, deliberately, and hold
everything else.** Two breaks and there was no grid.

---

## 2. Type — the whole game

**Use a modular scale.** Pick a base and a ratio; every size is the base multiplied or
divided by the ratio. Sizes that share a ratio look related; sizes picked by hand do not.

| ratio | name | use for |
|---|---|---|
| 1.125 | Major second | dense UI, documentation, dashboards |
| 1.250 | Major third | product UI, reports, general purpose |
| 1.333 | Perfect fourth | editorial, marketing pages — the safe default |
| 1.500 | Perfect fifth | posters, covers, decks |
| 1.618 | Golden | display work with very few sizes |

**A perfect-fourth scale from a 16px base** (round to whole pixels, then round to the 4-grid):

```
16 · 21 · 28 · 38 · 50 · 67 · 89 · 119 · 158 · 211
```

**Rules that survive contact with real work:**

- ⚠⚠ **THREE SIZES PER SURFACE.** Display, body, caption. A fourth is almost always a
  hierarchy failure you are papering over. Count them before you finish.
- **ONE typeface, two weights, is a stronger position than two typefaces.** If you use two,
  make them obviously different in class (a grotesque with a serif), never two neighbours.
- **Measure: 45–75 characters.** At 16px in a normal grotesque that is roughly **360–600px**.
  Set the text node's `w` to hold that, not to fill the column.
- **Line height moves INVERSELY to size.** Body 1.4–1.6. Subheads 1.25–1.35. Display
  **0.95–1.05** — big type needs tight leading or it falls apart into stripes.
- ⚠⚠ **TRACK DISPLAY TYPE NEGATIVE.** Type designed at 16px is far too loose at 120px.
  Above ~40px use `letterSpacing: -1` to `-4`; above ~120px, −3 to −6. **Uppercase and small
  labels go the other way: +1 to +3.** This one adjustment does more for perceived quality
  than any other single change.
- **Never centre more than three lines.** Centred text has two ragged edges; the eye needs
  one hard edge to return to.

⚠ **MEASURE, DO NOT GUESS.** `canvas.measure-text {text, size, fontWeight, letterSpacing,
maxWidth}` returns `{width, height, lineCount, fits, overflowBy}` from real font metrics.
Guessing a per-character ratio is how a headline ships bleeding past its margin — a 182px
headline estimated at 867px measured **990**.

---

## 3. Colour — a system, not a mood board

**Build the palette from a role list, not from colours you like:**

```
ground     the surface everything sits on         1 colour
ink        primary text on that ground            1
ink-muted  secondary text                         1
accent     the brand / the one thing that shouts  1
support    2–3 tones for charts, states, depth
```

- ⚠⚠ **ONE ACCENT.** Two accents means neither is one. If the work needs a second bright
  colour, it is a *support* tone and must be visibly quieter.
- **60 / 30 / 10** — ground, secondary surface, accent. If the accent is over ~10% of the
  area it has stopped being emphasis.
- **Contrast is a measurement, not an opinion.** Body text ≥ **4.5:1**, large/display ≥ **3:1**.
  Check it; do not eyeball dark grey on mid grey.
- ⚠ **Avoid pure `#000` on pure `#FFF` for large areas** — the contrast is harsh and reads
  cheap in print and on OLED. `#111` on `#FAFAF8` is the same legibility, better texture.
- ⚠ **A dark UI needs a LIGHTER accent than a light one.** The same green that sings on white
  goes muddy on near-black; lift lightness ~10% for dark grounds.
- **Colour last, or colour first — never in the middle.** Compose in greyscale to prove the
  hierarchy works on VALUE alone, then add colour. If it only works in colour, it does not work.

---

## 4. Space — the cheapest quality signal there is

- **Spacing is a scale**, same as type: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`.
  Never an arbitrary 27.
- ⚠⚠ **PROXIMITY BEATS EVERY OTHER GROUPING DEVICE.** A label 8px from its value and 48px
  from the next pair needs no line, no box and no colour to be understood. **Reach for space
  before you reach for a border.**
- **Space between groups must be visibly larger than space within them** — aim for ≥2×. If
  a card's internal padding is 24, the gap between cards is 48+, not 32.
- ⚠ **Padding is not symmetrical when type is involved.** Text sits optically high in its
  box because of descender space, so a visually centred label usually needs 2–4px more
  padding on top than bottom at body sizes, more at display.
- **Whitespace is not "empty".** The most common studio-vs-draft difference is that the draft
  fills the canvas. **Cutting content is a design move.**

---

## 5. Hierarchy — decide what wins

Rank every element **before** you style it: primary / secondary / tertiary. Then:

- ⚠⚠ **CHANGE ONE VARIABLE AT A TIME.** Size, weight, colour and space each signal
  importance. Using all four at once on the same element is the signature of amateur work —
  a heading that is bigger AND bolder AND coloured AND boxed. **Pick one, maybe two.**
- **One focal point per surface.** Where does the eye land first? If you cannot answer in
  one second, neither can the reader.
- **Scale contrast should be decisive.** A 28px heading over 24px body reads as a mistake;
  38 or 50 over 16 reads as a decision. If two things are nearly the same size, make them
  the same size.
- **Alignment creates order for free.** Every element should align to something else. A
  single unaligned element is read as an error, not as freedom.

---

## 6. Optical correction — where the numbers stop being right

The renderer is mathematically correct and the eye is not. These are the adjustments that
separate work that is *measured* from work that *looks* right.

- **Optical centring**: a thing centred in a frame looks low. Raise it ~2% of the frame
  height. Always true for a mark inside a container.
- **Circles and pointed shapes overshoot**: a circle the same height as a square looks
  smaller. Make round and pointed forms ~2–3% larger to match a flat-sided neighbour.
- **Align on the INK, not the box.** A text node's box includes ascender/descender space.
  To align a heading's cap-height with a rule or an icon, expect to nudge 2–6px.
- **Punctuation hangs.** A quote mark or bullet starting a line should sit slightly OUTSIDE
  the margin, or the text edge reads as ragged.
- ⚠ **Stroke weight does not scale with the box.** Scaling a 2px-stroked icon to 3× gives a
  6px stroke that no longer matches its neighbours. `canvas.scale` scales strokes and fonts
  as a unit — that is right for a whole card, wrong for an icon that must match a set.

---

## 7. THE STUDIO PASS — run this before you say it is done

⚠⚠ **`canvas.audit` reads the DATA. It cannot see that the work is ugly.** Render and LOOK
(`canvas-perceive {includePixels, fitNodeIds}`), then go through this list. On a real build,
looking caught four defects that every automated check called clean.

```
□ MARGINS      Is anything closer to an edge than the margin, unintentionally?
□ MEASURE      Any line of body copy over ~75 characters?
□ SIZES        Count distinct type sizes. More than 3–4? Collapse them.
□ TRACKING     Is display type still at default spacing? Tighten it.
□ ALIGNMENT    Pick any element — what is it aligned to? If nothing, fix it.
□ SPACE        Is between-group space ≥ 2× within-group space?
□ FOCAL        Where does the eye land first? Is that the most important thing?
□ GREYSCALE    Does the hierarchy survive with colour removed?
□ CONTRAST     Body ≥ 4.5:1, display ≥ 3:1 — measured, not guessed.
□ ACCENT       Exactly one? Under ~10% of the area?
□ ORPHANS      Any single word alone on the last line of a heading?
□ CONSISTENCY  Same corner radius, same stroke weight, same gap, everywhere?
□ EDGE         Zoom to 100%. Does anything touch, overlap or clip?
```

**If you change nothing after this pass, you did not really run it.** There is always one.

---

## 8. Canvas recipes — the numbers, ready to use

**A 1080×1350 social post**
```
margin 72 · display 96–140 (weight 800, tracking −3, lineHeight 1.0)
body 20–24 (weight 500, lineHeight 1.5, w ≤ 560)
caption 16 (weight 600, tracking +1.5, uppercase)
rule 2–3px accent · footer block bottom-aligned at 1350 − 72 − blockHeight
```

**A 1920×1080 deck slide**
```
margin 120 · title 72–96 · body 28–32 · caption 20
Never more than ~40 words. A slide is a headline with evidence, not a document.
Content column ≤ 1200 wide even though the slide is 1920 — full width is unreadable.
```

**A 1440 web hero**
```
margin 96 · content max 1200 · headline 64–88 (tracking −2, lineHeight 1.05)
sub 20–24 (muted ink, w ≤ 640) · CTA 48–56 tall, 24–32 horizontal padding, radius 8 or full
```

**A card**
```
padding 24–32 · radius 10–16 · gap between cards ≥ 2× padding
title 20–24/600 · body 15–16/400 muted · one accent element maximum
Background first, THEN the label — later nodes draw over earlier ones.
```

---

## 9. What to do when asked to "make it better"

In order, because the earlier ones are cheaper and do more:

1. **Increase the margins.** Nine times in ten, it is too tight.
2. **Remove a type size.** Collapse the two closest into one.
3. **Track the display type negative.**
4. **Double the space between groups.**
5. **Remove the second accent colour.**
6. **Align one stray element** to the nearest grid line.
7. **Cut 20% of the words.**
8. Only now consider a new typeface, a texture or an effect.

⚠ **Do not answer "make it more premium" with more ornament.** Premium reads as *more space,
fewer elements, tighter type, one accent*. Every ornament added is a step away from it.

---

## Sources

Josef Müller-Brockmann, *Grid Systems in Graphic Design* (1981) · Massimo Vignelli, *The
Vignelli Canon* (semantics / syntactics / pragmatics; "Design is one") · Michael Bierut,
*How to* (Pentagram; brief → rationale → trade-offs) · Paula Scher / Pentagram, The Public
Theater identity (typography as the whole system) · Pentagram's partner-led, idea-led model.
