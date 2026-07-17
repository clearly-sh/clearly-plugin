---
name: codebase-map
description: Walk a code repository and draw a living ARCHITECTURE MAP of it on a Clearly spatial canvas — modules as frames (sized by LOC, colored by layer), key files as nodes, imports/dependencies as arrows — so the big pieces, how they depend on each other, and where the complexity sits all read at a glance. Load this when the user says "map / diagram / visualize this codebase / repo / architecture", "how is this project structured", "draw the dependency graph", "give me an architecture overview", or when you're onboarding to an unfamiliar repo and need to see its shape fast.
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

# Codebase map — repo → spatial architecture diagram

A `tree` dump is 400 files of noise. The thing a dev actually wants is the **shape**: ~8 boxes, sized by weight, wired by who-imports-whom, with the hot, gnarly module obvious. You have host tools (Bash, Read, Grep, Glob) to *inspect* the repo and the Clearly canvas tools to *draw* it. Read `clearly-canvas` for the primitives + the locked tool contract — this skill builds on it (perceive → act → revise; `frame.create`; `canvas.create-node` text/rect/svg; nesting via `parentId`; arrows = `type:"svg"` marker-end; always `compositionId`). Don't re-derive that here.

## 1. Discover the structure (host shell)

Survey before you draw. Run these from the repo root:

```bash
# top-level shape + package boundaries
ls -d */ ; git ls-files | sed 's|/.*||' | sort | uniq -c | sort -rn | head -20
find . -name package.json -o -name go.mod -o -name Cargo.toml -o -name pyproject.toml | grep -v node_modules

# size per module (the LOC that sizes each frame) — cloc if present, else wc
cloc --quiet --json src 2>/dev/null \
  || git ls-files | grep -vE 'node_modules|dist|build|\.lock' | xargs wc -l 2>/dev/null | sort -rn | head

# hotspots: most-churned files (complexity lives where the diffs pile up)
git log --format= --name-only | grep -vE '^$|node_modules' | sort | uniq -c | sort -rn | head -20
```

**Dependencies** (the arrows). Either read declared deps from manifests, or grep the cross-module edges directly:

```bash
# JS/TS — who imports whom across top-level dirs
grep -rhoE "from ['\"](\.\./)+[a-zA-Z0-9_-]+" src | sort | uniq -c | sort -rn | head -30
grep -rhoE "import .* from ['\"]@/[a-zA-Z0-9_-]+" src | sort | uniq -c | sort -rn
# Python: ^import|^from   ·   Go: read go.mod requires   ·   Rust: [dependencies] in Cargo.toml
```

You want, per module: an LOC count, a file count, and its 1–3 heaviest outbound dependencies. That's enough to draw the map.

## 2. Cluster into domains

Collapse dirs into a handful of **logical layers** — the same lens regardless of stack:

| Layer | typical dirs | color |
|---|---|---|
| **ui** | components, pages, app, views | `#3b82f6` blue |
| **api / logic** | routes, handlers, services, lib | `#8b5cf6` violet |
| **data** | db, models, store, repositories | `#10b981` green |
| **infra** | workers, deploy, config, scripts | `#f59e0b` amber |
| **shared** | utils, types, common | `#6b7280` slate |
| **hotspot** | the biggest / most-churned module | `#ef4444` red |

Pick the **~6–12 modules that matter** — never every file. A 40-file `components/` dir is ONE frame, not 40 nodes. Optionally surface 2–4 marquee files *inside* a frame (the entrypoint, the fattest file, the one everything imports).

## 3. Draw it

Get a canvas, then **perceive the background first** so you paint with it (dark board → light ink), and place the map in the user's `gaze`:

```jsonc
clearly_workspace_invoke { "action": "composition-create", "input": { "title": "Architecture map · clearly" } }   // → { id: "c_…" }
clearly_canvas_perceive  { "compositionId": "c_…", "format": "text" }   // read backgroundColor + visibleWorldRect
```

Then batch the whole map in one `clearly_canvas_act`. Capture the frame ids the creates return so you can nest + connect. **Size each frame ~proportional to LOC** (e.g. `w ≈ 160 + LOC/40`, clamp 200–420), **fill by layer color**, lay out on a grid with 40px gutters:

```jsonc
clearly_canvas_act {
  "compositionId": "c_…",
  "batch": [
    { "action": "canvas.create-node", "args": { "type": "text", "name": "map-title",
      "text": "clearly · architecture (12k LOC, 9 modules) — arrows = imports, red = hotspot",
      "x": 0, "y": -56, "size": 22, "fontWeight": 700, "fill": "#e8edf5" } },

    { "action": "frame.create", "args": { "name": "ui/components", "x": 0,   "y": 0,   "w": 360, "h": 220, "fill": "#16223a" } },
    { "action": "frame.create", "args": { "name": "lib/services",  "x": 440, "y": 0,   "w": 300, "h": 200, "fill": "#241a3a" } },
    { "action": "frame.create", "args": { "name": "data/store",    "x": 440, "y": 280, "w": 240, "h": 150, "fill": "#10291f" } },
    { "action": "frame.create", "args": { "name": "infra/worker",  "x": 0,   "y": 300, "w": 280, "h": 160, "fill": "#2a2110" } }
  ]
}
```

Then a second `clearly_canvas_act` once you hold the frame ids — **titles + stats inside each frame** (coords are frame-relative via `parentId`), **key files as nodes**, and **dependency arrows** spanning the gap between frames (use bounds from perceive):

```jsonc
clearly_canvas_act {
  "compositionId": "c_…",
  "batch": [
    { "action": "canvas.create-node", "args": { "type": "text", "name": "ui-title",
      "text": "ui/components", "x": 16, "y": 12, "size": 16, "fontWeight": 700, "fill": "#cfe0ff", "parentId": "<uiFrameId>" } },
    { "action": "canvas.create-node", "args": { "type": "text", "name": "ui-stat",
      "text": "84 files · 4.1k LOC", "x": 16, "y": 36, "size": 12, "fontWeight": 400, "fill": "#8aa0c0", "parentId": "<uiFrameId>" } },
    { "action": "canvas.create-node", "args": { "type": "rect", "name": "ui-key-canvas",
      "text": "DocumentCanvas.tsx", "x": 16, "y": 64, "w": 180, "h": 30, "fill": "#1e2d4d", "stroke": "#3b82f6", "radius": 6, "parentId": "<uiFrameId>" } },

    { "action": "canvas.create-node", "args": {
      "type": "svg", "name": "ui→lib", "x": 360, "y": 90, "w": 80, "h": 24,
      "svg": "<svg viewBox='0 0 80 24'><defs><marker id='a' markerWidth='10' markerHeight='10' refX='8' refY='3' orient='auto'><path d='M0,0 L8,3 L0,6 Z' fill='#7c8497'/></marker></defs><line x1='2' y1='12' x2='72' y2='12' stroke='#7c8497' stroke-width='3' marker-end='url(#a)'/></svg>" } }
  ]
}
```

**Arrow weight = coupling**: `stroke-width:3` for a heavy edge (dozens of imports), `1.5` for a thin one. Curve overlapping arrows with a `<path d=…>` instead of `<line>`. Drop a tiny `text` at an edge's midpoint only when the relationship needs a name.

Finish with a **legend frame** (one colored `rect` + label per layer) tucked in a corner, and confirm the **one-line summary** text sits at the top.

## 4. Reveal, don't dump

The map earns its keep by making structure *jump out*:

- **Hotspot in red.** The biggest or most-churned module gets `fill:"#ef4444"`-family — "here be dragons" at a glance.
- **Size encodes weight.** A 6k-LOC frame should dwarf a 400-LOC one. Don't draw equal boxes.
- **Thicker arrows = heavier coupling.** A glance shows what's load-bearing.
- **Whitespace.** 40px gutters, aligned edges, the legend out of the way. A breathing board reads as designed; a crowded one reads as a dump.

Good map answers three questions instantly: *what are the big pieces, how do they depend on each other, and where's the complexity?*

## 5. Keep it live

This isn't a one-shot render — it's a living diagram. After the repo changes, re-run §1 and `canvas.update-nodes` the frames whose LOC/coupling shifted (resize, recolor, re-arrow) instead of redrawing — the map stays current as the codebase moves. Pairs naturally with **`ship-review`** (the per-change diff map lands *next to* the architecture map) and **`beehaven watch git`** (re-tune the map as commits land).

## The viral bit

A beautiful, auto-generated architecture map — modules sized by weight, layers color-coded, dependency arrows, the hotspot glowing red — is *exactly* the thing devs screenshot and post: "Claude mapped my entire codebase in 30 seconds." Make every map look like that. Clean frames, honest arrows, an obvious "this is the scary part." The screenshot sells the next install.

## Rules of thumb

- **Always pass `compositionId`** — that's what persists the map with no tab open.
- **Perceive the background first**; paint with it (dark board → light ink), drop the map in the user's `gaze`.
- **Draw ~6–12 modules, not every file** — collapse a dir into one frame; surface only marquee files inside.
- **Size by LOC, color by layer**, one module red as the hotspot.
- **Arrows only for REAL dependencies** (A imports B → A→B); thicker = heavier coupling. Don't decorate, inform.
- **`name` is required on every create**; capture returned frame ids to nest + connect.
- **Need an action not listed?** `clearly_canvas_catalog { surface: "all" }` describes every one.
