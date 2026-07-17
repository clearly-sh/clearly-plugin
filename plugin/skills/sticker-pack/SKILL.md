---
name: sticker-pack
description: Turn an idea into a printable, die-cut STICKER SHEET on a Clearly canvas — Clearly's own sticker-vending-machine pipeline surfaced as an agent skill. Generates a cohesive SET of transparent stickers, lays them out as a sheet (frame + gridded stickers + a vector kiss-cut cutline layer), and hands back a print-ready bundle. Load this when the user says "make me stickers / a sticker pack / a sticker sheet about X", "turn this into stickers", "design stickers for my brand / startup / cat", or "I want die-cut stickers". The fun, inherently-shareable corner of the canvas skill set.
---

> **Tool names below are written UNPREFIXED** (`clearly_canvas_act`). Your runtime may
> expose them with a server prefix — e.g.
> `mcp__plugin_clearly_clearly-staging__clearly_canvas_act`. **Match by suffix, not by
> exact name**: a skill written against the bare name resolves to nothing otherwise, and
> the failure looks like "the tool doesn't exist" rather than "the name is decorated".
>
> **If no such tool is callable at all**, the Clearly MCP server isn't authorised in this
> session — note that these skills still LIST when it isn't, so you find out by firing a
> dead call. Authorise it (`/mcp`, or `claude mcp`), or if you have a shell, use the
> `beehaven` CLI and its own `clearly-canvas` skill instead.

# Sticker pack — idea → printable die-cut sheet

Stickers are the most organically viral thing Clearly makes: a generated die-cut pack someone actually prints and slaps on a laptop *is* the share. This skill drives Clearly's real sticker-vending pipeline — the same one behind the studio — straight onto a canvas.

Read `clearly-canvas` first for the primitives + the perceive→act→revise loop. This skill adds the **generation** step on top of it.

## The one core tool (and a heads-up)

The sticker pipeline runs through **`sticker-sheet-gen`**, a real workspace action. It is NOT (yet) a dedicated MCP tool, so you call it through the generic dispatcher:

```jsonc
clearly_workspace_invoke { "action": "sticker-sheet-gen", "input": { … } }
```

> Needs a first-class `clearly_sticker_generate` MCP tool to be fully turnkey (autocomplete + schema). Until then `clearly_workspace_invoke` is the honest, working path — the action itself is production code, the same pipeline the paid studio uses.

**It is slow (30–90s), async, and costs the user a sheet credit.** Pass a `compositionId` and the pipeline does the canvas work for you: when the art lands, it places a **transparent parent frame ("Sticker sheet")**, every cut-out sticker nested as its own `image` node (drag one out!), and the **die-cut contour as a nested vector `svg` layer ("Cutline (kiss-cut)")**. The cutline is true vector — exported as the spot cut layer, never rasterized.

The call awaits the pipeline (racing a 90s timeout) so you usually get the **full result back** — `{ ok, sheetId, stickerCount, sheetUrl, placed }`. If it ran long you get `{ sessionId, timedOut: true }`; then perceive until the frame appears (see step 2).

## 1. Brief — turn the idea into a cohesive set

Don't just forward the user's sentence. Shape it into a **set with a through-line**: one subject family, one style, one palette, consistent line weight. Then list the concepts back before spending the credit.

> *"Stickers for your plant shop — I'm thinking a cohesive 9-sticker set, flat-color cottagecore, sage + terracotta palette, chunky outlines: 1) monstera leaf, 2) watering can, 3) 'plant mom' badge, 4) terracotta pot, 5) snail, 6) sun, 7) 'grow' lettering, 8) seed packet, 9) trowel. Generate this sheet?"*

A sticker sheet is ONE generation, not N — the model draws the whole cohesive grid. So the brief = the `prompt` (subject + vibe + palette), plus `style` and `stickerCount`.

## 2. Generate — one call, drop on the canvas

Make a canvas first (or reuse one), then fire the gen with `compositionId` so it lands:

```jsonc
clearly_workspace_invoke { "action": "composition-create", "input": { "title": "Plant shop stickers" } }
// → { "id": "c_…" }

clearly_workspace_invoke {
  "action": "sticker-sheet-gen",
  "input": {
    "compositionId": "c_…",
    "prompt": "cottagecore plant-shop stickers: monstera leaf, watering can, terracotta pot, snail, sun, seed packet — flat color, chunky outlines, sage green + terracotta palette",
    "style": "cottagecore",
    "stickerCount": 9,
    "bleedStyle": "halo",
    "aspectRatio": "2:3"
  }
}
// → { ok:true, sheetId:"sht_…", stickerCount:9, sheetUrl:"https://…", placed:{ stickers:9, cutline:true } }
```

Input shape (all optional except `prompt`):

| Field | Meaning |
|---|---|
| `prompt`* | what the stickers depict — subject, vibe, palette |
| `compositionId` | **pass it** — the canvas to drop the sheet onto (placeholder + frame + cutline) |
| `style` | preset: `kawaii`, `planner`, `cottagecore`, `doodle`, … (omit → inferred) |
| `stickerCount` | stickers on the sheet (e.g. 9, 16, 30). Default 30 |
| `bleedStyle` | `halo` (default — white sticker outline) or `full-bleed` |
| `aspectRatio` | sheet ratio: `1:1` `2:3` `3:2` `3:4` `4:3` `9:16` `16:9` |
| `quality` | `standard` (default, 4K) or `premium` |
| `seed` | reproducibility |

**Handle the async/loading case.** If the response is `{ sessionId, timedOut: true }` (no `placed`), the gen is still running — the ⏳ placeholder is already on the canvas. Poll until the real frame lands:

```jsonc
clearly_canvas_perceive { "compositionId": "c_…", "format": "text" }
// look in `contents` for a frame named "Sticker sheet" with image children
// + an svg layer "Cutline (kiss-cut)". When it's there, the sheet is done.
```

On a hard failure the response carries an `error` (`no_exports_remaining` → user needs to buy a sheet; `rate_limit_exceeded` → back off `retryAfter`s) and the credit is auto-refunded — relay that plainly, don't retry blindly.

## 3. The sheet is already laid out — make it presentable

The pipeline placed the frame, the cut-out stickers (gridded, native pixel size), and the cutline layer in ONE write. Your job is polish, via `clearly_canvas_act` (see `clearly-canvas`):

- **Perceive first**, read the `backgroundColor`, then drop a `text` title over the frame: "Plant shop · 9 stickers · kiss-cut".
- A tiny caption noting the **"Cutline (kiss-cut)"** layer is the spot cut path (vector) — toggle it to preview the die-cut.
- If the grid is cramped, `canvas.update-nodes` to nudge the frame into the user's `gaze`.

Don't rebuild the grid by hand — the pipeline already nested everything correctly. Only add labels + framing context.

## 4. Export — the printable bundle

When they're happy, pull the print kit:

```jsonc
clearly_workspace_invoke { "action": "sticker-sheet-export", "input": { "sheetId": "sht_…" } }
// → { zipUrl, pdfUrl, sheetUrl, stickerUrls:[…], stickerCount, hasCutFile:true }
```

- `zipUrl` — the FULL kit: print-ready **PDF** + **cut-file SVG** (the spot cut layer) + every individual sticker PNG + the composited sheet.
- `pdfUrl` — drop straight into a Cricut / Roland / Stickermule flow.
- Omit `sheetId` to export their most recent sheet.

Hand the user the `pdfUrl` / `zipUrl` and tell them the SVG cut file is what a plotter reads for the die-cut contour.

## 5. Keep the human in the loop

The whole point of the canvas is steering by gesture. After the sheet lands: *"It's on your canvas — tell me 'more like #2', 'swap to a blue palette', or 'add a cat'."* Then re-run `sticker-sheet-gen` with the revised `prompt`/`style`/`seed` (reuse `seed` to keep a look, change it to re-roll), and re-perceive. Iterate until they love it, *then* export.

## The viral bit

A real die-cut pack — transparent stickers, a visible kiss-cut contour, a print-ready PDF the user actually sends to a sticker printer — is the single most shareable output Clearly has. People post the laptop, not the prompt. So make every sheet land clean: cohesive set, honest cutline, one screenshot that reads as "I generated these and printed them." The sticker IS the share.

## Single-sticker fallback

For ONE sticker (not a sheet) use `studio-image-generate` (raster or `format:'svg'` for a cut-ready vector) and place it with `clearly_canvas_act`. If `sticker-sheet-gen` is ever unavailable, the manual sheet = `studio-image-generate` per concept (transparent), then `clearly_canvas_act` → `frame.create` + one `canvas.create-node {type:'image'}` per sticker on a grid + a `canvas.create-node {type:'svg'}` cutline outline. But that's the cold path — the pipeline above is the real, supported one.

## Rules of thumb

- **One gen = one whole sheet.** Don't loop the call per sticker; the model draws the cohesive grid in a single pass.
- **Always pass `compositionId`** — that's what lands the placeholder, frame, stickers, and cutline. No `compositionId` = no canvas output.
- **It's slow + costs a credit.** Confirm the brief BEFORE generating; relay `no_exports_remaining` / `rate_limit_exceeded` plainly (credit auto-refunds on failure).
- **`timedOut:true` ≠ failed** — the gen is still running; `clearly_canvas_perceive` until the "Sticker sheet" frame appears.
- **The cutline is vector** ("Cutline (kiss-cut)" svg layer) — it's the spot cut path; the export SVG/PDF is what a plotter cuts.
- **Iterate by re-genning**, reuse `seed` to hold a look, then **export last**.
- **Reach `sticker-sheet-gen` / `sticker-sheet-export` via `clearly_workspace_invoke`** (not a dedicated MCP tool yet).
