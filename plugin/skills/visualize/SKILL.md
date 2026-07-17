---
name: visualize
description: Turn any concept, answer, or described system into a clean DIAGRAM on a Clearly spatial canvas instead of a wall of text. Load this when the user asks to "diagram / draw / sketch / map / visualize / explain visually / show me how X works / flowchart this / make a diagram" — AND proactively whenever YOUR OWN answer would be clearer as a picture than a paragraph (a flow with branches, who-calls-whom, a schema, an architecture, options on axes). Picks the right diagram type for the content and builds it with the canvas primitives.
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

# Visualize — draw it, don't write it

Some answers are paragraphs. Many are **pictures pretending to be paragraphs**: a flow with branches, a request hopping between services, a schema, a tradeoff matrix. The moment relationships matter, prose makes the reader rebuild the shape in their head. A diagram hands them the shape — spatial layout *is* the explanation, it's glanceable, and it's screenshot-shareable in a way a wall of text never is.

So: when you catch yourself about to write three paragraphs explaining how something connects, **draw it on the canvas instead** (and you can still say the one-line version in chat).

Prereq: the `clearly` MCP is connected (run `clearly-init` if not). **Read `clearly-canvas` for the tool contract** — `perceive` / `act` / `catalog`, `frame.create`, `canvas.create-node` (text/rect/ellipse/svg/line), arrows-as-vector-SVG, nesting via `parentId` with frame-relative coords. This skill is the *diagram cookbook* on top of those primitives; it does not repeat them.

## Pick the type (1-line heuristic each)

| If the content is… | Draw a… |
|---|---|
| an answer you'd write as multiple paragraphs | **Explain-an-answer** (boxes + arrows) |
| steps, especially with branches | **Flowchart** (boxes + decision diamonds) |
| who-talks-to-whom over time | **Sequence diagram** (lifelines + message arrows) |
| services / data stores and their calls | **Architecture** (frames + cylinders + arrows) |
| things and the relationships between them | **ER / schema** (entity boxes + cardinality lines) |
| one idea exploding outward into subtopics | **Mind-map** (central node + radial branches) |
| options scored on a few criteria | **Comparison matrix** (grid of cells) |

When unsure, ask: *is the story "then" (flowchart), "who" (sequence), "what's-related" (ER), or "which-is-better" (matrix)?*

## The build loop (every diagram)

1. **Get a canvas + perceive.** `clearly_canvas_perceive { compositionId, format:"text" }` → read `backgroundColor` (design WITH it — light ink on dark, dark ink on light) and `gaze.visibleWorldRect` (place work where the user is looking).
2. **Batch the skeleton.** One `clearly_canvas_act` with a `batch` of frames + boxes on a grid. Capture every returned `{ id }`.
3. **Wire the arrows** using the boxes' bounds (arrows are `type:"svg"` with a `marker-end` — see clearly-canvas §5).
4. **Label** edges/branches with small `text` nodes at arrow midpoints.
5. **Re-perceive** so the user can ink notes; read them back; revise with `canvas.update-nodes`.

Grid discipline matters more than anything: equal gutters (24–40px), aligned edges, generous whitespace. A diagram that breathes reads as designed.

---

## Recipe: Explain-an-answer

Your default upgrade from prose. **Layout:** 3–6 labelled boxes left→right (or top→down) in the order you'd say them, one arrow per "and then / because / leads to", a title text on top.

```jsonc
clearly_canvas_act { "compositionId": "c_…", "batch": [
  { "action": "canvas.create-node", "args": { "type":"text", "name":"title", "text":"How a request gets billed", "x":0, "y":-40, "size":24, "fontWeight":700, "fill":"#fff" } },
  { "action": "canvas.create-node", "args": { "type":"rect", "name":"b1", "x":0,   "y":0, "w":180, "h":72, "fill":"#1b2230", "stroke":"#3a465c", "radius":10 } },
  { "action": "canvas.create-node", "args": { "type":"text", "name":"b1t", "text":"Member acts", "x":16, "y":26, "size":15, "fontWeight":600, "fill":"#e8edf5" } },
  { "action": "canvas.create-node", "args": { "type":"rect", "name":"b2", "x":260, "y":0, "w":180, "h":72, "fill":"#1b2230", "stroke":"#3a465c", "radius":10 } },
  { "action": "canvas.create-node", "args": { "type":"text", "name":"b2t", "text":"Debit seat budget", "x":276, "y":26, "size":15, "fontWeight":600, "fill":"#e8edf5" } },
  { "action": "canvas.create-node", "args": { "type":"svg", "name":"b1→b2", "x":180, "y":24, "w":80, "h":24,
    "svg":"<svg viewBox='0 0 80 24'><defs><marker id='a' markerWidth='10' markerHeight='10' refX='8' refY='3' orient='auto'><path d='M0,0 L8,3 L0,6 Z' fill='#7c8497'/></marker></defs><line x1='2' y1='12' x2='72' y2='12' stroke='#7c8497' stroke-width='2' marker-end='url(#a)'/></svg>" } }
]}
```

Chain more boxes at `x += 260` per step. Branch (e.g. "budget exhausted → top-up") with a second arrow going down to an offset box.

## Recipe: Flowchart / process

**Layout:** boxes top→down (or left→right), **rounded rect = action**, **diamond = decision**. Draw a diamond as a `type:"svg"` rhombus; give it two outgoing arrows labelled **Yes / No**.

```jsonc
clearly_canvas_act { "compositionId":"c_…", "batch":[
  { "action":"canvas.create-node", "args":{ "type":"rect", "name":"start", "x":120, "y":0, "w":160, "h":56, "fill":"#173a2a", "stroke":"#2f6b4d", "radius":28 } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"startt", "text":"Invite sent", "x":156, "y":18, "size":14, "fontWeight":600, "fill":"#d6f5e4" } },
  { "action":"canvas.create-node", "args":{ "type":"svg", "name":"decide", "x":120, "y":110, "w":160, "h":100,
    "svg":"<svg viewBox='0 0 160 100'><polygon points='80,4 156,50 80,96 4,50' fill='#2a2410' stroke='#6b5a2f' stroke-width='2'/></svg>" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"decidet", "text":"Seat free?", "x":138, "y":50, "size":13, "fontWeight":600, "fill":"#f5ead6" } },
  { "action":"canvas.create-node", "args":{ "type":"svg", "name":"yes", "x":188, "y":56, "w":24, "h":54,
    "svg":"<svg viewBox='0 0 24 54'><defs><marker id='y' markerWidth='9' markerHeight='9' refX='7' refY='3' orient='auto'><path d='M0,0 L7,3 L0,6 Z' fill='#7c8497'/></marker></defs><line x1='12' y1='2' x2='12' y2='48' stroke='#7c8497' stroke-width='2' marker-end='url(#y)'/></svg>" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"yesl", "text":"yes", "x":216, "y":74, "size":12, "fontWeight":600, "fill":"#7c8497" } }
]}
```

Rules: one entry, decisions are the only nodes with >1 exit, **every arrow labelled at branches**, keep the happy path straight and push error/No branches to the side.

## Recipe: Sequence diagram

**Layout:** each actor is a column — a header box at top + a vertical lifeline (`type:"line"`) running down. Messages are **horizontal arrows** between lifelines; **time flows down**, so each later message sits at a larger `y`.

```jsonc
clearly_canvas_act { "compositionId":"c_…", "batch":[
  { "action":"canvas.create-node", "args":{ "type":"rect", "name":"a1", "x":0,   "y":0, "w":120, "h":40, "fill":"#1b2230", "stroke":"#3a465c", "radius":8 } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"a1t", "text":"Web", "x":48, "y":12, "size":14, "fontWeight":600, "fill":"#e8edf5" } },
  { "action":"canvas.create-node", "args":{ "type":"line", "name":"a1life", "x":60, "y":40, "w":0, "h":300, "stroke":"#3a465c" } },
  { "action":"canvas.create-node", "args":{ "type":"rect", "name":"a2", "x":280, "y":0, "w":120, "h":40, "fill":"#1b2230", "stroke":"#3a465c", "radius":8 } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"a2t", "text":"Home DO", "x":312, "y":12, "size":14, "fontWeight":600, "fill":"#e8edf5" } },
  { "action":"canvas.create-node", "args":{ "type":"line", "name":"a2life", "x":340, "y":40, "w":0, "h":300, "stroke":"#3a465c" } },
  { "action":"canvas.create-node", "args":{ "type":"svg", "name":"m1", "x":60, "y":70, "w":280, "h":20,
    "svg":"<svg viewBox='0 0 280 20'><defs><marker id='s' markerWidth='9' markerHeight='9' refX='7' refY='3' orient='auto'><path d='M0,0 L7,3 L0,6 Z' fill='#7c8497'/></marker></defs><line x1='2' y1='10' x2='272' y2='10' stroke='#7c8497' stroke-width='2' marker-end='url(#s)'/></svg>" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"m1t", "text":"check-quota(userId)", "x":120, "y":52, "size":12, "fontWeight":500, "fill":"#aab3c2" } }
]}
```

Place the message text just above its arrow. A return/response arrow points back left (flip `x1`/`x2`). Keep columns evenly spaced (~280px) so long labels fit.

## Recipe: Architecture / system diagram

**Layout:** each service is a `frame` (so it can hold a label + sub-parts); **data stores are cylinders** drawn as `type:"svg"`; arrows are calls. Cluster by tier — a row of frames per tier (client / edge / data), with a faint heading text per row.

```jsonc
clearly_canvas_act { "compositionId":"c_…", "batch":[
  { "action":"frame.create", "args":{ "name":"Worker", "x":0, "y":80, "w":200, "h":110, "fill":"#141a24" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"wl", "text":"CF Worker", "x":14, "y":12, "size":14, "fontWeight":700, "fill":"#e8edf5", "parentId":"<WorkerFrameId>" } },
  { "action":"canvas.create-node", "args":{ "type":"svg", "name":"do-store", "x":320, "y":80, "w":140, "h":110,
    "svg":"<svg viewBox='0 0 140 110'><ellipse cx='70' cy='16' rx='60' ry='14' fill='#1d2a22' stroke='#2f6b4d'/><path d='M10,16 V94 a60,14 0 0 0 120,0 V16' fill='#1d2a22' stroke='#2f6b4d'/><ellipse cx='70' cy='16' rx='60' ry='14' fill='none' stroke='#2f6b4d'/></svg>" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"do-l", "text":"DO + SQLite", "x":350, "y":126, "size":13, "fontWeight":600, "fill":"#d6f5e4" } },
  { "action":"canvas.create-node", "args":{ "type":"svg", "name":"w→do", "x":200, "y":120, "w":120, "h":24,
    "svg":"<svg viewBox='0 0 120 24'><defs><marker id='c' markerWidth='10' markerHeight='10' refX='8' refY='3' orient='auto'><path d='M0,0 L8,3 L0,6 Z' fill='#7c8497'/></marker></defs><line x1='2' y1='12' x2='112' y2='12' stroke='#7c8497' stroke-width='2' marker-end='url(#c)'/></svg>" } }
]}
```

Rules: one box per service (not per file), label every arrow with the call/protocol if non-obvious, keep tiers as aligned rows so dataflow reads in one direction.

## Recipe: ER / schema

**Layout:** each entity is a `frame` with a bold title row + a `text` node per field (stack fields at `y += 20`). Relationships are lines between frames with a **cardinality label** (`1`, `N`, `1..*`) near each end.

```jsonc
clearly_canvas_act { "compositionId":"c_…", "batch":[
  { "action":"frame.create", "args":{ "name":"User", "x":0, "y":0, "w":180, "h":120, "fill":"#141a24" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"u-h", "text":"User", "x":12, "y":10, "size":15, "fontWeight":700, "fill":"#fff", "parentId":"<UserFrameId>" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"u-f1", "text":"id  PK", "x":12, "y":40, "size":13, "fontWeight":400, "fill":"#aab3c2", "parentId":"<UserFrameId>" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"u-f2", "text":"email", "x":12, "y":60, "size":13, "fontWeight":400, "fill":"#aab3c2", "parentId":"<UserFrameId>" } },
  { "action":"frame.create", "args":{ "name":"Seat", "x":300, "y":0, "w":180, "h":120, "fill":"#141a24" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"s-h", "text":"Seat", "x":12, "y":10, "size":15, "fontWeight":700, "fill":"#fff", "parentId":"<SeatFrameId>" } },
  { "action":"canvas.create-node", "args":{ "type":"line", "name":"u—s", "x":180, "y":40, "w":120, "h":0, "stroke":"#7c8497" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"card1", "text":"1", "x":188, "y":24, "size":12, "fontWeight":700, "fill":"#7c8497" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"cardN", "text":"N", "x":284, "y":24, "size":12, "fontWeight":700, "fill":"#7c8497" } }
]}
```

Rules: PK/FK noted in the field text, one relationship line per FK, cardinality at BOTH ends so the reader knows which side is the "many".

## Recipe: Mind-map

**Layout:** one central node (an `ellipse` or pill `rect`), child topics radiating out, each connected by a **curved** branch (a `<path>` inside a `type:"svg"`, not a straight line). Place children evenly around the center; second-level topics hang off their parent.

```jsonc
clearly_canvas_act { "compositionId":"c_…", "batch":[
  { "action":"canvas.create-node", "args":{ "type":"ellipse", "name":"core", "x":220, "y":160, "w":160, "h":80, "fill":"#2a1f3a", "stroke":"#7b5cc4" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"coret", "text":"Company Brain", "x":250, "y":190, "size":15, "fontWeight":700, "fill":"#e9defb" } },
  { "action":"canvas.create-node", "args":{ "type":"rect", "name":"c1", "x":480, "y":60, "w":150, "h":48, "fill":"#1b2230", "stroke":"#3a465c", "radius":24 } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"c1t", "text":"Org context", "x":500, "y":76, "size":13, "fontWeight":600, "fill":"#e8edf5" } },
  { "action":"canvas.create-node", "args":{ "type":"svg", "name":"core→c1", "x":380, "y":84, "w":100, "h":110,
    "svg":"<svg viewBox='0 0 100 110'><path d='M2,108 C50,108 50,8 98,8' fill='none' stroke='#7b5cc4' stroke-width='2'/></svg>" } }
]}
```

Rules: keep the center visually heaviest, ~4–7 first-level branches (more → it's really a tree, use a frame layout), curve the branches so it reads organic not boxy.

## Recipe: Comparison matrix

Perfect for **"X vs Y vs Z"**. **Layout:** a grid of `rect` cells — top row = options, left column = criteria, body cells = the values. Tint the header row/column so the axes pop; fill body cells (green/amber/red) to make the winner obvious at a glance.

```jsonc
clearly_canvas_act { "compositionId":"c_…", "batch":[
  { "action":"canvas.create-node", "args":{ "type":"rect", "name":"h-free", "x":160, "y":0, "w":120, "h":40, "fill":"#222b3a", "stroke":"#3a465c" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"h-freet", "text":"Free", "x":196, "y":12, "size":14, "fontWeight":700, "fill":"#fff" } },
  { "action":"canvas.create-node", "args":{ "type":"rect", "name":"h-pro", "x":280, "y":0, "w":120, "h":40, "fill":"#222b3a", "stroke":"#3a465c" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"h-prot", "text":"Pro", "x":322, "y":12, "size":14, "fontWeight":700, "fill":"#fff" } },
  { "action":"canvas.create-node", "args":{ "type":"rect", "name":"r-agents", "x":0, "y":40, "w":160, "h":40, "fill":"#222b3a", "stroke":"#3a465c" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"r-agentst", "text":"Agents", "x":14, "y":52, "size":13, "fontWeight":600, "fill":"#cfd6e2" } },
  { "action":"canvas.create-node", "args":{ "type":"rect", "name":"cell-free-agents", "x":160, "y":40, "w":120, "h":40, "fill":"#3a2417", "stroke":"#3a465c" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"cell-free-agentst", "text":"1", "x":214, "y":52, "size":13, "fontWeight":600, "fill":"#f0c9a8" } },
  { "action":"canvas.create-node", "args":{ "type":"rect", "name":"cell-pro-agents", "x":280, "y":40, "w":120, "h":40, "fill":"#173a2a", "stroke":"#3a465c" } },
  { "action":"canvas.create-node", "args":{ "type":"text", "name":"cell-pro-agentst", "text":"10", "x":332, "y":52, "size":13, "fontWeight":600, "fill":"#a8f0c9" } }
]}
```

Keep cells a uniform `w`/`h` and snap every cell to the grid (column `x`, row `y`); the alignment is what makes it read as a table, not scattered boxes.

## The viral bit

A clean diagram is **instantly screenshot-shareable** in a way a paragraph never is. Every text answer you convert into a tidy flowchart or architecture map is a tiny ad for the canvas — someone drops it in Slack and the reply is "wait, the AI just *drew* that?". So make each one frame-worthy: aligned grid, honest arrows, one clear read direction, a title. The diagram sells the next person on the surface.

## Rules of thumb

- **Prose smell test:** about to write 3+ paragraphs about how things connect? Draw it instead.
- **Pick by the question:** "then" → flowchart, "who/when" → sequence, "what's related" → ER, "which is better" → matrix, "one idea outward" → mind-map.
- **Skeleton in one `batch`**, then arrows, then labels — capture every returned `id`.
- **Arrows = `type:"svg"` with a `marker-end`** (curves = `<path>`); always pass `compositionId`; `name` on every create.
- **Grid or it's a dump:** equal gutters, aligned edges, one read direction, generous whitespace.
- **Perceive first** (design with `backgroundColor`, place in `gaze`); **re-perceive after** to read the human's ink and revise.
- **Need an action not in clearly-canvas?** `clearly_canvas_catalog { surface:"all" }` — don't invent action names.
