---
name: brand-identity
description: >-
  Build a complete brand identity on a Clearly canvas the way a studio does —
  brief, mark, wordmark, lockups and clear space, palette, type system,
  applications, and a spec board someone else can build from. Use when asked
  for a brand, a logo, an identity, a rebrand, a visual system, brand
  guidelines, or "design a company/product/app called X". Load design-craft
  alongside it for the underlying grid, type and colour craft. Triggers:
  "design a brand", "make me a logo", "brand identity", "visual identity",
  "rebrand", "brand guidelines", "logo and colours", "identity system".
---

# brand-identity — a system, not a picture of a logo

⚠⚠ **THE DELIVERABLE IS A SYSTEM SOMEONE ELSE CAN BUILD WITH.** A single mark on a white
artboard is not an identity; it is a drawing. Pentagram's identity work ships a symbol, a
wordmark, a graphic system, a palette, a type system and the guidelines that let an in-house
team keep it consistent. That is the shape to copy.

Read **`design-craft`** first or alongside — grid, type scale, colour roles and the studio
pass are assumed here.

---

## 1. The brief — five lines, before anything is drawn

You may ask the user, or state your reading and proceed. You may not skip it.

```
WHO      the organisation, in one clause
FOR      the audience, specifically — not "everyone"
UNLIKE   the nearest competitor, and what must NOT be borrowed from them
FEELS    three adjectives, and one the brand is deliberately NOT
LIVES    where it actually appears: app icon? shopfront? 30 pages of PDF? a t-shirt?
```

⚠⚠ **`LIVES` DECIDES THE MARK MORE THAN `FEELS` DOES.** A brand that lives at 24px in a
browser tab cannot have a mark with four internal details. A brand that lives on a building
can. Ask where it is smallest and design for that first.

⚠ **`UNLIKE` is what stops generic output.** Without it, every fintech gets a blue geometric
sans and every studio gets a black wordmark in Helvetica. Name the cliché and refuse it out loud.

---

## 2. The mark — construct it, never freehand it

⚠⚠ **EVERY CURVE AND ANGLE SHOULD BE DERIVABLE.** A mark built from a stated construction —
a circle of radius R, a 30° angle, a stroke of R/6 — survives scaling, redrawing and
handover. A mark of hand-placed béziers does not, and it shows.

**The construction methods that actually work on a canvas:**

| method | how | good for |
|---|---|---|
| **Geometric** | circles/squares/triangles on a shared radius; every measure a fraction of R | tech, finance, infrastructure |
| **Derived letterform** | take the initial, cut or extend one stroke | anything with a strong name |
| **Monoline** | one stroke weight everywhere, round caps and joins | modern, friendly, screen-first |
| **Counter-form** | the shape is the NEGATIVE space between forms | clever marks that survive one colour |
| **Modular** | one unit repeated/rotated on a grid | systems, networks, collectives |

**Build it as an `svg` node with a stated viewBox and derived numbers:**

```jsonc
{"action":"canvas.create-node","args":{"name":"mark","type":"svg","x":120,"y":120,"w":240,"h":240,
 "svg":"<svg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'>…</svg>"}}
```

⚠ **`<text>` inside an `svg` node does NOT render headlessly** — no system fonts are loaded.
Wordmarks are real text nodes, or outlined paths. Never live `<text>` in the mark.

**Test the mark against these before going further. A mark that fails any of them is not done:**

```
□ 24px      Still readable as a distinct shape? (Render it at 24 and LOOK.)
□ 1 colour  Works in solid black? Solid white on dark?
□ Knockout  Works as a hole in a shape — no fill, no gradient carrying it?
□ Square    Sits comfortably in an app-icon square with its own padding?
□ Rotated   Is it accidentally something else at 90°/180°?
□ Unlike    Put it next to the competitor named in the brief. Distinct?
```

⚠⚠ **DESIGN IT IN ONE COLOUR FIRST.** A gradient can make a weak shape look temporarily
good. If it does not work in flat black, the shape is wrong and the gradient is hiding it.

---

## 3. Wordmark and lockups

- **Set the wordmark in real type, then adjust** — do not draw letters from scratch unless
  the brief asks for a custom face.
- ⚠ **A wordmark is always tracked tighter than body text.** At display size, `letterSpacing`
  −1 to −4. Then fix the specific pairs the font gets wrong (an uppercase A next to a V, a
  T next to a lowercase o).
- **Lockups are a fixed set, not an invitation.** Ship exactly these and say so:

```
primary      mark + wordmark, horizontal    ← the default
stacked      mark above wordmark            ← square-ish slots
mark-only    the symbol alone               ← ≥ 24px, when context supplies the name
reversed     the primary on dark
mono         one colour, no exceptions      ← print, engraving, embroidery
```

- **Clear space** = a fraction of the mark, never an absolute px. **¼ of the mark's height**
  on all four sides is a defensible default. Express it in terms of the mark so it scales.
- **Minimum size** — state one, per lockup, and test it: mark-only 24px digital / 10mm print;
  the full lockup needs roughly 2–3× that before the wordmark closes up.

---

## 4. Palette

Follow `design-craft`'s role list — ground, ink, ink-muted, accent, 2–3 support. For an
identity, add:

- ⚠⚠ **ONE colour is the brand.** People remember a single colour. A five-colour identity is
  remembered as no colour. Pick the one, then support it.
- **State a dark-ground variant of every colour.** The same accent needs ~10% more lightness
  on near-black to read the same. An identity without this ships broken dark mode.
- **Give each colour a role sentence**, not just a hex: *"Accent. The one thing that shouts.
  CTAs, the mark, one word in a headline. Never a background."* A palette without roles gets
  used at random.
- **Print values matter if `LIVES` includes print** — state CMYK or Pantone intent, and know
  that a bright screen accent may be unreachable in CMYK. Say so rather than shipping a
  surprise.

---

## 5. Type system

```
DISPLAY   headlines, the mark's neighbour     one face, one or two weights
TEXT      body, UI, long form                 must have real weights + italics
MONO      code, data, captions                only if the brand needs it
```

- **One face in two weights beats two faces.** If you use two, make them different in CLASS.
- ⚠ **Check the face has what the brand needs**: does it have a decent 500? Real italics or
  faked obliques? The numerals you want (lining vs oldstyle, tabular for data)? A missing
  weight is discovered three months in, on a deadline.
- **Publish the scale**, not just the names — the ratio, the base, and the resulting sizes
  (see `design-craft` §2). A type "system" without sizes is a font recommendation.

---

## 6. Applications — this is what makes it believable

⚠⚠ **A mark on a white square convinces nobody. The SAME mark on six real surfaces does.**
This is the single highest-value part of the deliverable and the part agents most often skip.

Pick 4–6 that match the brief's `LIVES`:

```
app icon 512×512      business card 1050×600     social avatar + header
website hero          poster / out-of-home       packaging face
email signature       t-shirt / tote             signage / door vinyl
presentation title    invoice / letterhead       UI screen with the system applied
```

Build each as a real frame at real proportions on the canvas, in a row, with a caption under
each. **Do not fake them as flat rectangles labelled "app icon"** — draw the rounded square,
put the mark in it at the right optical size, show it at 512 and again at 48.

---

## 7. The spec board — hand-off, on the canvas

A titled section, below the applications, that another designer could build from:

```
01 MARK          construction diagram — the circles/angles/ratios, drawn, with the numbers
02 CLEAR SPACE   the ¼-height rule, drawn as a dashed frame with the measure labelled
03 LOCKUPS       all five, at the same optical size, labelled
04 MISUSE        4–6 tiles: stretched, recoloured, rotated, on a busy photo, effects,
                 too small — each with a ✗. This section prevents more damage than any other.
05 PALETTE       swatches + hex + ROLE SENTENCE + dark-ground variant
06 TYPE          the faces, the scale with real numbers, a specimen paragraph
07 GRID          margins, columns, gutter, baseline — the numbers from design-craft §1
08 VOICE         3 lines: how it speaks, one thing it never says
```

⚠ **Section 04 (misuse) is not filler.** Guidelines are read once and then broken; the misuse
tiles are what people actually remember.

---

## 8. Canvas layout for the whole delivery

Lay it out left to right as a narrative, one row per stage, generous gutters (200px+ between
artboards) so each reads as its own object:

```
Row 1   COVER            1080×1350   the mark, big, on the brand ground
Row 2   THE MARK         construction · lockups · clear space
Row 3   PALETTE + TYPE   full-width panels
Row 4   APPLICATIONS     4–6 real-proportion artboards in a row
Row 5   SPEC BOARD       the eight sections above, as titled panels
```

- **Put a caption above every artboard** (`19px/700`, accent, `letterSpacing: 2`) so the
  board reads as a deck rather than a pile.
- **Set the composition background** to a dark neutral (`composition-patch {backgroundColor}`)
  so the artboards read as objects on a desk. ⚠ That patch reaches an open tab now, but if
  the ground is load-bearing, lay a real rect and `canvas.order {op:"back"}` it.
- ⚠ **Build in ONE batch** and check `count` against the number of ops you sent — a batch
  stops at the first failure and lands everything before it.

---

## 9. Verify like a studio

Run `design-craft`'s studio pass, plus these identity-specific ones:

```
□ Rendered the mark at 24px and LOOKED at it
□ Mark works in flat black, flat white, and knocked out
□ Every lockup has stated clear space and minimum size
□ Palette has a dark-ground variant and role sentences
□ Type scale has NUMBERS, not just face names
□ At least 4 real applications, at real proportions
□ Misuse section exists
□ Put the mark beside the competitor named in UNLIKE — still distinct?
□ Can someone build a new asset from this board without asking a question?
```

⚠⚠ **THE LAST ONE IS THE REAL TEST.** If any answer would be "ask the designer", the system
is incomplete — and the whole point of an identity is that it works when the designer has left.

---

## Sources

Pentagram brand-identity practice (symbol, wordmark, graphic system, palette, type system,
guidelines for in-house teams) · Michael Bierut, *How to* (brief → rationale → trade-offs) ·
Paula Scher's Public Theater identity — a system built almost entirely from typography, which
survived because the plays changed constantly and the identity was designed to absorb it ·
Massimo Vignelli, *The Vignelli Canon*.
