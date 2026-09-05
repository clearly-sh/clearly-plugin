---
name: clearly-canvas
description: >-
  USE IF YOU HAVE THE MCP TOOLS clearly_canvas_act / clearly_canvas_perceive.
  (If instead you have a SHELL and the `beehaven` CLI, use the hive's
  clearly-canvas skill — same canvas, different surface. The two share a name.)
  Drive the Clearly design canvas: (1) BUILD — create frames, text, shapes,
  SVG and arrows at explicit x/y with clearly_canvas_act, measure type before
  you place it, then render and LOOK at the result. (2) PUBLISH — drop status
  updates, narration, build results and brand snapshots onto the board. Use
  whenever you are asked to draw, design, lay out, diagram or build anything
  visual on a Clearly canvas, or to show progress/results on it. Triggers:
  "put this on the canvas", "design a page", "draw a diagram", "make a
  poster", "show this on the canvas", "drop a status block", "publish this".
---

# clearly-canvas — drive the Clearly editor canvas from your terminal

The Clearly editor canvas is the user's project surface. When you're
running inside a terminal embedded in Clearly's canvas (a Treehouse agent —
Claude, Codex, Gemini or pi, on your own login), you can drop blocks back
onto the same canvas via the `beehaven` CLI — the user sees the result in
real time on the canvas behind your terminal window.

## When to use this skill

| Situation | Block to drop |
|---|---|
| Working on a long task; user should see progress | `canvas-add-claude-comm kind=status` (reuse blockId to update in place) |
| Finished code, deployed somewhere | `canvas-add-claude-comm kind=build-result` |
| Want to explain a non-trivial change | `canvas-add-claude-comm kind=narration` |
| Offering next steps | `canvas-add-claude-comm kind=suggestion` |
| Something failed | `canvas-add-claude-comm kind=error` |
| Need a yes/no, a paragraph, or a destructive-op confirmation | **Ask in chat.** ⚠ `canvas-add-claude-template` does NOT exist — see the note below |
| Want to show a brand reference inline | `canvas-add-brand-snapshot` |
| Need to apply a brand change | ⚠ `brand-propose-update` does NOT exist — see the note below |
| Need a legal sign-off | `canvas-add-claude-comm kind=signature` |
| Plain canvas note (sticky-note style) | `canvas-add-text` |

The full canvas RPC catalog (~50 verbs) is discoverable via:

```bash
beehaven call canvas:actions '{"format":"markdown","compact":true}'
```

## Your surface: MCP tools, not a shell

You reach the canvas through **MCP tools**, so every `beehaven call …` line in this document
is a SHAPE, not a command to type. Read them like this:

| this document writes | you call |
|---|---|
| `beehaven call canvas-act '{…}'` | `clearly_canvas_act` with that JSON |
| `beehaven call canvas-perceive '{…}'` | `clearly_canvas_perceive` |
| `beehaven call canvas-catalog '{…}'` | `clearly_canvas_catalog` |
| `beehaven call <any other verb> '{…}'` | `clearly_workspace_invoke` `{ action:"<verb>", input:{…} }` |

⚠ **The `@file` advice does not apply to you** — that is a shell trick for quoting. Pass the
JSON directly. What DOES apply is the reason behind it: **send one batch, not one call per
node.** A 200-node board is ONE `clearly_canvas_act` with a 200-entry `batch`.

⚠ **There is no `beehaven agent login`, no daemon and no `connect` on this surface.** Your
identity and workspace come from the OAuth connection; a call refused for identity is a
connection problem to raise with the user, not something to fix from inside a build.

⚠ **Ignore anything here about `/local` paths or shell tools** — that belongs to the CLI variant.

## The composition id

You need the composition id (the URL slug after `/c/` on the canvas)
to drop blocks on the right canvas. Two ways to get it:

1. **It's in the prompt.** When the user sends from the canvas, the
   prompt template includes `Canvas URL: https://www.clearly.sh/c/<id>`.
   Grab the id from there.
2. **List recent.** Run `beehaven call canvas-list-compositions '{"limit":5}'`
   and pick the most recently updated one.

Hold on to it for the rest of the build — every act/perceive call takes it as
`compositionId`. (`clearly_nav_open` also sets a default that later calls fall back to.)

## Building artwork — the node shape

This is the part the Treehouse system prompt sends you here for. Everything
below is the BUILD path (make artwork). The comm blocks further down are a
different job (publish an update about your work).

**The node shape is FLAT.** Every field sits on the node itself; there is no `style`
object in the canonical node.

⚠ **`style:{text:"…"}` is RECOVERED now, not lost** (re-verified 2026-08-24). This
paragraph used to call it "the single most common way to lose your work … it renders
an EMPTY node". It doesn't: `resolveCreateNodeArgs` lifts a nested `style` bag onto
the flat fields and the text survives. Prefer flat anyway — the lift only knows the
keys in its alias table — but do not go hunting for a bug that was fixed.

⚠ **`type:"Text"` (capitalised) also works**, normalised to `text`. Same correction,
same date, same reason: a document that warns about a fixed bug spends the trust that
the warnings next to it need.

```jsonc
// the canonical node — flat, lowercase type, text in `text`
{ "name": "title",        // REQUIRED on every create — a short layer label
  "type": "text",         // text | rect | ellipse | frame | path | svg | line
  "x": 40, "y": 40, "w": 600, "h": 56,
  "text": "Hello",        // a TEXT node's body. NOT style.text. NOT content.
  "size": 40,             // px. NOT fontSize.
  "fontWeight": 700,      // 100–900. NOT "bold".
  "fill": "#111827" }     // hex here; canvas.create-node normalizes it to RGBA
```

| Field | Not | Notes |
|---|---|---|
| `text` | `style.text`, `content`, `characters` | the body of a text node |
| `w` / `h` | `width` / `height` | **omitting one turns on hug-content for that axis** — see below |
| `size` | `fontSize` | px |
| `fontWeight` | `"bold"` | 100–900 |
| `fill` | `backgroundColor`, `color` | hex via `canvas.create-node`; RGBA `[r,g,b,a]` 0..1 if you seed `composition-create.data` directly |
| `stroke` | — | a COLOUR. **Pair it with `strokeWidth`** — see below |
| `strokeWidth` | — | `0` means *no stroke*, and is honoured as such |
| `type` | `"Text"` | lowercase |

### ⚠⚠ TEXT SIZES ITSELF — OMITTING `w`/`h` IS A FEATURE, NOT AN OMISSION

Every example above passes `w` and `h`, which reads as "these are required". They are not, and
what they do when present is **opt OUT of auto-sizing**:

- no `w` ⇒ `autoWidth: true` — the box hugs the longest line.
- no `h` ⇒ `autoHeight: true` — the box hugs the wrapped text.
- passing either pins that axis to a fixed box.

**So for body copy, pass `w` and omit `h`.** You do not need to compute a height from font
metrics, and you should not try — guessing cap heights and advance widths by hand is how a
headline ends up bleeding past its margin.

⚠⚠ **BUT HEADLESS, THE STORED HEIGHT IS AN ESTIMATE, NOT A MEASUREMENT.** The precise pass is
Skia's, and it only runs when a browser paints the composition. A build made with no tab open
persists an approximation (~0.52em average advance) which **the live renderer corrects on first
paint**. Consequences while it is still an estimate:

- `canvas-perceive` bounds, `canvas.audit`'s overflow check and `canvas.arrange`'s distribute all
  read that number, so headless layout maths inherits the error.
- ⚠ **Nothing ever clips.** The renderer wraps and overflows the declared box, so a wrong `h` is
  invisible in the artwork and wrong only in the data. That is exactly why it survives.
  (Before 2026-09-04 the estimate counted only explicit `\n`, so a wrapping paragraph seeded ONE
  line: 170 characters at size 18 in a 400px box stored `h: 23` and drew four lines.)

**Rule of thumb: omit `h` for prose; pin `h` when a later node's position is computed from this
one's bottom edge.** Pinning is not a workaround — a fixed box is the honest thing to ask for when
you are doing the layout yourself.

### ⚠ A STROKE COLOUR NEEDS A WIDTH

`{ type:"rect", fill:"#191414", stroke:"#3A3330" }` used to store the colour and draw **nothing** —
`line`/`path` default their own width, filled shapes defaulted none, so the op returned `ok: true`
and the outline never appeared. Fixed 2026-09-04 (a stroke colour now defaults to a 1px hairline),
but **pass `strokeWidth` explicitly** whenever the weight matters, and expect older nodes on an
existing board to still carry a colour with no width.
⚠ `strokeWidth: 0` is how you say *no stroke*; it is never defaulted over.

**Build in ONE batch.** Each `beehaven call` is a fresh process, so never one
call per node. Write the payload with your editor tool and pass it as `@file` —
canvas-act's nested JSON fights shell quoting (one apostrophe in a text node
breaks an inlined call).

**A batch STOPS at the first failure.** The ops after it are never attempted. So
a typo in node 3 of 72 lands 2 nodes, not 71. The response tells you: `count` is
how many RAN, `skipped` is how many were dropped, and the `error` string ends with
"STOPPED: the remaining N op(s) … were NOT run". Read `count` against the number
you sent — if they differ, fix the error and **resend the skipped ops**, or you
will confidently report a build that is 3% there.

```bash
beehaven connect home
beehaven call composition-create '{"title":"…"}'    # capture the returned id

# build.json — note the batch item key is `args`, not `node`:
# {"compositionId":"<id>","batch":[
#   {"action":"canvas.create-node","args":{"name":"title","type":"text","x":40,"y":40,"w":600,"h":56,"text":"Hello","size":40,"fontWeight":700}},
#   {"action":"frame.create","args":{"name":"card","x":40,"y":120,"w":600,"h":300,"fill":"#f5f5f5"}} ]}
beehaven call canvas-act @build.json

# SEE it — bounds, overlaps, CLIPPED — and fix before you finish:
beehaven call canvas-perceive '{"compositionId":"<id>","format":"text"}'
```

### Compose whole blocks in ONE call — PREFER THIS

Before hand-placing rects + labels, reach for **`canvas.compose`**. One call lands a
whole spec-correct block — real type scale, 8pt spacing, correct layering, and the
**real text** — as editable nodes. This is how you avoid the classic "grid of cards
with no text" bug (hand-built rects that end up on top of — or instead of — their
labels).

```bash
# a feature/card grid — the rects AND their titles+bodies, laid out and layered, in ONE op:
# build.json = {"compositionId":"<id>","batch":[
#   {"action":"canvas.compose","args":{"kind":"feature-grid","x":80,"y":80,"primary":"#7c6cff",
#     "cards":[{"title":"Fast","body":"Ships in seconds."},{"title":"Editable","body":"Every node yours."},{"title":"On-brand","body":"Themes to your palette."}]}} ]}
beehaven call canvas-act @build.json
```

Kinds (always pass the **real copy** — each bakes in its own correctly-layered text):

- **doc** / **memo** — a write-up: `{eyebrow?, title, subhead?, sections:[{head,body}], footer?}`
- **hero** `{eyebrow?,headline,subhead?,cta?}` · **nav** `{logo,links:[…],cta?}` · **feature-grid** `{cards:[{title,body,icon?}]}` · **card** `{title,body}` · **button** `{label}`
- deck slides (pass `parentId` of a 1920×1080 frame): **title-slide** · **slide** · **bullets** · **stat** · **quote** · **section** · **closing**
- Theme any kind with `primary:"#accent"` and `bg:"#RRGGBB"`.

**Two rules when you DO hand-build a card/panel with text** (compose handles both for you):

1. **Create the content — never MOVE existing nodes into it.** To fill a card, `canvas.create-node` `type:"text"` nodes *with a `text` field*. Do NOT `canvas.update-nodes` OTHER nodes to drag them in — you cannibalize existing work, and a stale/guessed id just no-ops. (That is the actual cause of empty cards: rects created, then `update-nodes` fired at text ids that were never created or belong to something else.)
2. **Background first, label second.** Later nodes draw OVER earlier ones, so make the card `rect` BEFORE its label — otherwise the opaque fill hides the text behind it.

### The verbs

| Action | Makes | Key args |
|---|---|---|
| `canvas.compose` | a WHOLE block (card grid, hero, deck slide, memo) — text included, correctly layered | `kind*` (feature-grid\|doc\|hero\|nav\|card\|button\|slide\|title-slide\|bullets\|stat\|quote\|section\|closing), `x`, `y`, + per-kind copy, `primary?` |
| `frame.create` | a container / section | `name*`, `x`, `y`, `w`, `h`, `fill`, or `preset:` desktop\|laptop\|tablet\|phone\|phone-sm\|presentation\|social-post\|social-story |
| `canvas.create-node` `type:"text"` | a label / heading / body | `name*`, `text*`, `x`, `y`, `size`, `fontWeight`, `fill`, `w` (wrap width) |
| `canvas.create-node` `type:"rect"` | a box / card | `name*`, `x`, `y`, `w`, `h`, `fill`, `stroke`, `radius` |
| `canvas.create-node` `type:"ellipse"` | a dot / state | `name*`, `x`, `y`, `w`, `h`, `fill`, `stroke` |
| `canvas.create-node` `type:"svg"` | an icon / vector art (a STATIC drawing) | `name*`, `x`, `y`, `w`, `h`, `svg` (markup) |
| `arrow.create` | a first-class ARROW / connector that BINDS to nodes + follows them | `from`/`to` (node id/name to connect) **or** `start`/`end` {x,y}; `endHead?`, `startHead?`, `routing?`, `label?`, `stroke?`, `dash?` |
| `canvas.update-nodes` | move / restyle / re-text | `ids*`, `patch:{x,y,w,h,fill,text,…}` |
| `canvas.scale` | resize as a UNIT (children + fonts scale) | `ids*`, `factor` or `toW`/`toH` |
| `canvas.duplicate` / `canvas.delete` | copy / remove (cascades children) | `ids*` |
| `canvas.add-diff` | a git diff → one review card PER FILE in a titled frame (headless) | `diff*` (full `git diff` text), `title`, `commit?`, `frame?` |
| `canvas.align` | `left\|hcenter\|right\|top\|vcenter\|bottom\|distribute-h\|distribute-v` | aligns the selection, or `to:"frame"` |
| `canvas.order` | stacking — **this is how you get a background BEHIND everything** | `ids*`, `op: "back"\|"front"\|"forward"\|"backward"`; headless |
| `canvas.export` | SVG/PDF of the board, or of `ids` (transitively) | `format?`, `ids?`, `scale?`; PNG is tab-only; **paid** |
| `canvas.camera` | YOUR own viewport — `set`/`pan`/`zoom`/`fit`/`state` | works with no tab open; perceive then frames it |
| `canvas.component` / `canvas.tokens` | variants / colour + text styles | see the catalog |

⚠ **Draw order is creation order, and there is no `z` argument on create.** A node made later
draws OVER one made earlier, so a full-bleed background has to be created FIRST — or created
last and sent back with `canvas.order {op:"back"}`. That second route is the only one available
once the board already exists.

### Arrows / connectors

`arrow.create` makes a **first-class arrow** — the tldraw-style relational connector. BIND it to nodes and it FOLLOWS them + reroutes to their edges as they move; or give free `start`/`end` points for a standalone annotation arrow. It hit-tests, **exports** (SVG/PDF/PNG), and is **perceived** like any node.

```bash
# connect two nodes (ids OR layer names) — the end gets an arrowhead
beehaven call canvas-act '{"action":"arrow.create","args":{"from":"boxA","to":"boxB"}}'
# a labelled dependency, elbow-routed
beehaven call canvas-act '{"action":"arrow.create","args":{"from":"api","to":"db","routing":"elbow","label":"reads","endHead":"triangle"}}'
# a free annotation arrow (no binding), coloured
beehaven call canvas-act '{"action":"arrow.create","args":{"start":{"x":40,"y":40},"end":{"x":220,"y":120},"stroke":"#e11d48"}}'
```

- **Heads** (`startHead`/`endHead`): `none`·`arrow`·`triangle`·`triangle-hollow`·`dot`·`circle-hollow`·`bar`·`diamond`·`diamond-hollow`. Default: start `none`, end `arrow`.
- **Routing**: `straight` (default) · `elbow` (orthogonal Z — flowcharts) · `curved` (bowed by `bend`).
- **Edit** any arrow with `canvas.update-nodes` — `startHead`/`endHead`/`routing`/`bend`/`label`/`stroke`/`strokeWidth`/`dash`, or `from`/`to` to rebind. **`arrow.connect {id, from, to}`** rebinds by node id/name (null unbinds + freezes it in place).
- `canvas-perceive` reports each arrow's `arrow:{from,to,startHead,endHead,routing,label}` — so you SEE what links what.
- This REPLACES the old "draw an arrow as `type:"svg"` with a `marker-end`" trick: a real arrow **binds + follows**; a static svg path doesn't.

Discover anything else — every action and its exact args:

```bash
beehaven call canvas-catalog '{"query":"align"}'   # `q` also works
```

**Tab-only verbs — ASK, don't guess.** Most verbs work with no browser tab
(headless); a large minority do not, and calling one of those from a build fails
with `no-client-connected`. The catalog answers this authoritatively, at runtime,
from the actual dispatch map:

```bash
beehaven call canvas-catalog '{}' | jq .headlessActions   # the verbs that work tab-free
```

Anything NOT in that list needs the composition open in a tab. As of writing that
includes every point-level `vector.*` edit, `vector.boolean` / `vector.flatten`,
`canvas.set-stroke`, `canvas.history` (undo/redo), `canvas.clipboard`,
`canvas.effects`, `canvas.text-to-vector`, `canvas.add-comment`, `canvas.snapshot`,
`canvas.preflight`, `canvas.select`, `canvas.panel`, `canvas.present`, and PNG
export — but trust `headlessActions` over this paragraph, because it is generated
and this paragraph is not.

(This used to say only `canvas.panel` and `canvas.present` were tab-only. Naming
exactly two reads as an exhaustive list, and it was off by ~20 — so an agent
confidently reached for `vector.boolean` mid-build and got a transport error it had
been told to expect from nothing.)

### Media — images, documents, video

**An image from a URL** — one call:

```bash
# build.json: {"compositionId":"<id>","batch":[
#   {"action":"canvas.create-node","args":{"name":"hero","type":"image","x":40,"y":40,"w":600,"h":400,
#    "src":"https://…/photo.png","fit":"contain"}} ]}
beehaven call canvas-act @build.json
```

`fit` is `contain` (show all of it, default) or `cover` (fill the box, cropping).

**An image from a LOCAL file** — upload first, then place the URL it gives you.
A node's `src` is fetched by the renderer, so a path on your disk means nothing to
it, and raw bytes don't belong in the scene JSON:

```bash
# 1. bytes → a durable signed URL. base64 the file with your own tools.
beehaven call canvas-upload-image @upload.json
#    upload.json = {"imageBase64":"<base64>","mimeType":"image/png","filename":"photo.png"}
#    → { ok, url, r2Key, size }        ← `url` is permanent; use it as `src`
# 2. place it (either works):
beehaven call canvas-act @build.json           # create-node type:"image" with src:<url>
beehaven call canvas-add-image '{"compositionId":"<id>","imageUrl":"<url>","x":40,"y":40}'
```

`canvas-upload-image` takes **any** mime despite the name — `application/pdf`, a
zip, whatever. `canvas-add-image` sizes to the image's natural pixels when you omit
x/y/width/height.

**A document** — markdown, as a first-class node or a document card:

```bash
# a canvas node (title + markdown, rendered on the board):
#   {"action":"canvas.create-node","args":{"name":"spec","type":"document","x":40,"y":40,"title":"Spec","markdown":"# Heading\n\nBody…"}}
# or a document card + a real documents-table row:
#   {"action":"canvas.add-document","args":{"title":"Spec","body":"# Heading\n\nBody…"}}
```

Markdown only — there is no PDF or .docx ingest. To show a PDF, upload it with
`canvas-upload-image` (mimeType `application/pdf`) and link the URL from a text
node; it does not render inline.

**Video** — same shape as image. It PLAYS on the canvas (Skia decodes it; there is
no DOM `<video>`):

```jsonc
{"action":"canvas.create-node","args":{"name":"clip","type":"video","x":40,"y":40,
 "w":480,"h":270,"src":"https://…/clip.mp4","poster":"https://…/still.png"}}
```

`poster` is the still shown before playback. A local file uploads the same way as an
image — `canvas-upload-image` takes `video/mp4` despite its name.

**Placeholder photos — free, no key, no AI spend.** A comp needs real-looking
imagery long before it needs the *right* imagery. `type:"image"` takes any http
URL, so use a free source rather than burning `image-gen` (which costs money and,
on the desktop, bills Clearly's AI pool rather than your own key):

| Source | URL | What you get |
|---|---|---|
| Lorem Picsum | `https://picsum.photos/800/600` | a real photo, random |
| Picsum seeded | `https://picsum.photos/seed/salon-hero/800/600` | the SAME photo every time — use a seed so re-renders are stable |
| LoremFlickr | `https://loremflickr.com/800/600/salon,hair` | topic-matched photo (comma-separated tags) |
| placehold.co | `https://placehold.co/800x600/png` | a flat labelled box — for greyboxing, not for looking real |

Seed your picsum URLs (`/seed/<name>/`) unless you want the picture to change
under the user on every reload. `source.unsplash.com` is DEAD (503) — don't reach
for it. Say in your reply that the imagery is placeholder.

**Checking media: your screenshot CANNOT see it.** `canvas-perceive` with
`includePixels` renders headlessly through resvg, and that renderer draws **no
`<image>` at all** — not a remote URL, not an inlined data: URI (proven: an SVG
with an image and one without produce byte-identical PNGs). So a canvas whose
image placed perfectly comes back as a picture-shaped hole.

Do NOT read that as failure and retry — you will loop forever placing an image
that was already there. Verify media **structurally** instead: `canvas-perceive`
(format:"json") and check the node exists with the `src` you gave it. Pixels are
for layout; the node list is for "did it land". The user's live editor draws it
correctly; only the headless screenshot is blind.

**Already in the workspace library?** Skip the upload:

```bash
beehaven call canvas-act '{"compositionId":"<id>","batch":[{"action":"canvas.place-source","args":{"sourceId":"<id>","x":40,"y":40}}]}'
```

**A whole SITE, page or app — `canvas-add-artifact`.** A live, self-contained
HTML page, on the board as a movable card. Not a screenshot: it scrolls, its
buttons work, its theme toggles. This is the right way to put a landing page, a
docs page, a prototype, a chart or a widget in front of someone — reach for it
BEFORE you reach for a screenshot.

```bash
# art.json = {"compositionId":"<id>","title":"Docs — the node shape","html":"<!doctype html>…","x":140,"y":3200}
beehaven call canvas-add-artifact @art.json
# → { ok, id:"artifact-…", url:"…/f/admin/artifacts/<comp>/<id>.html", bytes, x, y, w, h }
```

- **It lands as `type:"embed"`** with `embedKind:"artifact"` and a durable signed
  `url`, so `canvas-perceive` reports it like any other node and
  `canvas.update-nodes {ids, patch:{x,y,w,h}}` moves and resizes it. It arrives
  at a default **720 × 540** whatever `w`/`h` you passed — resize it after.
- **Headless.** No tab needed.
- ⚠ **The returned `url` is served as `text/plain`**, so opening it in a browser
  shows the markup rather than the page (filed as BOA-5). The card on the board
  is the reliable surface; do not hand that url to someone as a link until it
  serves `text/html`.
- ⚠ **"SELF-CONTAINED" IS LITERAL.** One string, one file. A page that links out
  to a stylesheet, a script, a font or an image arrives as unstyled text with
  broken images, because nothing resolves relative to a board. Inline all of it:
  CSS (and its `@import` chain), JS, `url(...)` fonts and images, and every
  `<img src>`, as `data:` URIs.
- ⚠ **THERE IS A ~512 KB CEILING AND CROSSING IT IS SILENT.** Measured: 499 KB
  accepted, 598 KB and above return **no response at all** — no `ok:false`, no
  `error`, no non-zero exit, just the routing line. Silence reads as success, so
  **check the reply for `"ok": true`** rather than assuming. Two inlined woff2
  faces cost ~294 KB before any content, so an ordinary page crosses it easily:
  compress the artwork (a card renders ~720px wide, so a 1080px print is wasted
  bytes) or drop a font weight.

### Nesting — put children IN the frame

`frame.create` then `canvas.create-node` at matching coordinates gives you a frame
with loose text sitting ON it, not a card: move the frame and the text stays behind.
Pass **`parentId`** (the frame's name or id) to actually nest:

```jsonc
{"action":"frame.create","args":{"name":"card","x":80,"y":80,"w":320,"h":240,"fill":"#141416","radius":10}},
// x/y are RELATIVE to the frame — 14,14 puts the title 14px inside it, at world 94,94
{"action":"canvas.create-node","args":{"name":"card-title","type":"text","parentId":"card","x":14,"y":14,"w":292,"h":20,"text":"Title"}}
```

⚠⚠ **A NESTED CHILD'S x/y ARE RELATIVE TO THE PARENT FRAME**, not world coordinates.
`parentId` is membership AND a new origin: the create path adds the frame's position
to what you send, so `x:14, y:14` inside a frame at `80,80` lands at world `94,94`.

**This paragraph said the exact opposite until 2026-08-24** ("x/y stay WORLD
coordinates — `parentId` is membership, not a new origin"), and it was wrong, not the
code. Following it doubles the offset — a child sent at `320,920` into a frame at
`300,900` lands at `620,1820`, outside its own frame, and `canvas.audit` then reports
it as `spills "box"`. That is the real cause of the classic "card with its label
somewhere else", and it produces no error. Verified against the live canvas; the
relative shift is deliberate and shared by the live and headless paths (`nestInFrame`),
because the renderer clips a child to the frame's world box.

Nest anything you'd want to move, restyle or delete as one thing.

### Addressing nodes — the NAME is a handle

`canvas.update-nodes` / `canvas.delete` take `ids`, and a **layer name works there
too** — the ids are minted server-side, so you rarely have one. This is why `name`
is required on every create:

```bash
# no perceive round-trip needed to find an id:
{"action":"canvas.update-nodes","args":{"ids":["card-title"],"patch":{"text":"New title","fill":"#e8e8ea"}}}
```

First match wins if two nodes share a name — so name things distinctly.

### Reading the raw scene (debugging)

`beehaven cat /compositions/<id>/data.json` — the decoded `data` blob exactly as
persisted, and `scene.json` for what actually renders (ids healed, `style` lifted).
Diff them to see what the read side had to repair.

Do NOT reach for `beehaven sql "SELECT data …"` to read a composition: the column
is `gz:`-prefixed base64 gzip, so it prints as an opaque blob and SQLite's own
`json_extract` answers "malformed JSON". (The sql output itself is fine — a table
padded to the longest value, one row per line — it just isn't JSON.)

⚠ **`beehaven cat /compositions/…` NEEDS DEVELOPER SCOPE.** It goes through `shell:exec`,
so on an ordinary daemon it answers *"RPC 'shell:exec' requires developer scope"* — which
reads like the composition is missing rather than the door being shut. Either start the
daemon with `HIVE_DEV_MODE=1` (**the user's call — do not cycle their daemon to get it**),
or just use `canvas-perceive {format:"json"}`, which needs no scope and answers the same
questions.

⚠ **The perceive payload is nested at `room.contents.objects`** — not top-level `contents`,
and not `nodes`. `room.contents.count` is the true total; `objects` is capped by `maxObjects`
(pass a big one for a whole board). Each object carries `bounds{x,y,w,h}` in WORLD coordinates
plus `parentId`, so a child's own relative coords are not what comes back.

### ⚠ Gotchas that cost real time on a real build

- ⚠⚠ **`composition-patch { backgroundColor }` DOES NOT REACH AN OPEN TAB.** Node creates
  broadcast; this patch does not. The value stores correctly and every headless render honours
  it, while the browser someone is watching keeps the old ground until they reload — so white
  type you just set against a dark canvas looks invisible to them and correct to you. If the
  ground matters to what you are building, lay a real rect and `canvas.order {op:"back"}` it.
- ⚠ **`canvas.audit`'s `placeholder` check matches ordinary words.** The regex flags any text
  that IS `title|heading|body|label|caption|button|section|quote|card|item|name…`, so a type-scale
  specimen or a legend legitimately reading "HEADLINE" is reported as unreplaced copy. It is a
  `warn`, and the summary's "fix each" is not an instruction to rewrite good copy — judge it.
- ⚠ **A deliberate full-bleed reads as `overflow`.** Anything that bleeds off its frame on
  purpose (a shape cropped by the artboard edge) is flagged every run. There is no way to mark
  intent, so keep a note of which findings you have already accepted.
- ⚠ **A batch STOPS at the first failure** — check `count` against the number of ops you sent
  every time, not just `ok`.
- ⚠ **`composition-move` does not exist**; it is `composition-move-to-project`. The error text
  does suggest it, so read the refusal rather than guessing again.

### Layout rules that matter

- Place EVERY node at explicit `x`/`y` so you own the layout. Don't use `create`
  for multi-part layouts — it auto-grids and you'll fight it.
- For a page: stack sections vertically in ONE frame (hero → … → footer),
  full-width, deliberate spacing, no overlaps.
- After building, **`canvas.audit`** and fix what it reports. Send fixes as another
  `@file` batch.

  ⚠ **`canvas-perceive` DOES NOT DETECT OVERLAP OR CLIPPING** — this line used to say it
  did, and it was checked and found false (2026-08-24): a scene with two deliberately
  overlapping rects and an 88-character string in a 120 × 14 box produces no `OVERLAP`
  and no `CLIPPED` token, and the JSON reply has no violations key at all. Every agent
  following the old instruction believed it had verified something it had not.

  `canvas.audit` is the check that exists — headless, and it reports `placeholder`
  (copy nobody replaced), `overflow` (a child spilling its frame) and `off-grid`. The
  first two are `warn` and decide `ok`; `off-grid` is `info`, because flagging every
  coordinate that is not a multiple of 8 buries the two findings that matter. Narrow it
  with `{"checks":["overflow","placeholder"]}` when you only want the breakages.

  Perceive is still how you read the scene — bounds, names, nesting, text previews.

  ⚠ A `text` in a perceive report is a **PREVIEW capped at 160 characters**, ending in `…`
  with a `textLength` beside it when it was cut. It is not what is stored — the full body
  renders. Do not diff a perceive `text` against what you sent and conclude the store
  truncated it; that conclusion has been filed as a data-loss bug once already.
- Finish the WHOLE artifact — don't stop after one section.

### ⚠⚠ ACTUALLY LOOK AT IT — the audit cannot see the artwork

`canvas.audit` reads the DATA. It cannot tell you the thing is ugly, that a headline bleeds past
its margin, that two rotated bars collide, or that a swatch is invisible against its panel. Those
are the defects that reach the user, and the only way to catch them is to **render the artwork and
read it**. On the build this section was written from, looking caught four defects that every
automated check called clean.

**Ask for YOUR framing, not the user's viewport:**

```bash
beehaven call canvas-perceive '{"compositionId":"<id>","includePixels":true,
                                "fitNodeIds":["<frame-id>"],"pixelScale":2}'
#  → room.pixels = { dataUrl, url, w, h, view:"agent", headless:true, camera:true }
```

⚠⚠ **`fitNodeIds` / `region` (with `includePixels`) NOW DIVERT TO YOUR OWN RENDER — fixed
2026-09-04, and the history is worth knowing because the failure was invisible.** Perceive used to
try the live tab first and return whatever it sent, and a browser answers pixels from the USER's
framebuffer and ignores both fields. Measured: two perceives naming different `fitNodeIds` returned
**byte-identical** PNGs of a viewport framing neither. Not an error, not an empty result — a
correct-looking screenshot of the wrong thing, which an agent then reasons about as its own work.

- ⚠ **`live: false` on those calls is EXPECTED, not a lost tab.** You asked for your framing, so
  the room comes from the persisted scene and carries no `focus` / `instruments` / `occupants` —
  those exist only in a browser. The reply says so in `note`. Call perceive **without**
  `fitNodeIds`/`region` in the same turn if you also need the tab's live state.
- ⚠ **A bare `includePixels` still prefers the live tab**, which is usually what you want when
  you are looking at what the *user* is looking at.
- ⚠ **The headless render is faithful for layout, shape and colour, not for type**: the outliner
  substitutes one typeface. Judge composition from it; judge a typeface in the browser.
- ⚠⚠ **It draws no `<image>` at all** — not a remote URL, not a data: URI. A canvas whose image
  placed perfectly comes back as a picture-shaped hole. Do NOT read that as failure and retry;
  verify media STRUCTURALLY (`format:"json"`, check the node has the `src` you gave it).

**Measure type BEFORE you place it, instead of guessing:**

```bash
beehaven call canvas-act '{"compositionId":"<id>","batch":[{"action":"canvas.measure-text",
  "args":{"text":"WRAPPED","size":182,"fontWeight":900,"letterSpacing":-4,"maxWidth":936}}]}'
#  → { width, height, lineCount, lines:[{text,width}], fits, overflowBy, exact }
```

⚠ This exists because guessing advance widths does not work: a 182px headline estimated at 867px
measured **990px** and shipped bleeding past the margin. It uses real font metrics and the same
wrapper the SVG export uses, so the width it reports is the width that renders. `exact:false` means
no font buffer loaded and you are getting ~0.52em estimates — say so rather than trusting them.
Pass `{"id":"<node>"}` instead of `text` to measure a node that already exists and compare against
its stored `h` (`hDelta`) — that is how you check a headless `autoHeight` estimate.

**A shell alternative, for arbitrary resolution or a local file** (CLI surface only — needs a
terminal and a rasterizer; an MCP-only client should use perceive above):

```bash
beehaven call canvas-act '{"compositionId":"<id>","batch":[
  {"action":"canvas.export","args":{"format":"svg","ids":["<frame-id>"]}}]}' > ex.json
#  → results[0].value.svg  (a STRING; write it to a file)
rsvg-convert -w 2160 board.svg -o board.png
magick board.png -crop 1080x1350+<x>+<y> +repage artboard.png
```

- ⚠ **`ids` scopes the export** and takes the whole subtree (children and grandchildren). Before
  2026-09-04 `ids` was ignored unless `scope:"selection"` rode along, so a request for one artboard
  returned the whole board with `ok: true`. On an older worker, pass `scope:"selection"` too.
- ⚠ **The export viewBox starts at the content's own top-left**, not world 0,0 — a crop offset is
  `world − contentMin`. Check the `viewBox` before computing crops.
- ⚠ **Export is a PAID feature** server-side (`export-requires-paid` on a free tier).
- ⚠ **`<text>` inside an `svg` node will not render** in the headless raster (no system fonts).
  Put labels in real text nodes, not inside your SVG markup.

## Showing it to them — how to open what you just made

You built it headlessly, so nothing is on screen. Do NOT stop at "I created a
composition" and an id — the id is not a place, and asking someone to go and
find it is how good work goes unseen. Three tools, and they do different jobs:

| you want | call | works with no tab? |
|---|---|---|
| to be *located* on it — and to drag their view along if a tab IS open | `agent-nav-open { kind, id }` | **yes** |
| it in their side rail as a tab | `canvas-act panel.open { kind, refId }` | **no** — see the warning |
| them to open it themselves | report the id + title, plainly | — |

```bash
# kind: composition | document | board | project | conversation
beehaven call agent-nav-open '{"kind":"composition","id":"<id>"}'
# → { ok, location:{kind,id}, verified:true, delivered:N }
```

`agent-nav-open` is the one that always works. It verifies the target exists
first (a bad id fails here instead of confusing a later call), it **persists
across turns and sessions**, and `canvas-perceive` / `canvas-act` then default
to it when you omit `compositionId`. `delivered` counts the browser clients that
received it: **`delivered: 0` means nobody was watching**, not that it failed.

⚠ **`panel.*` is listed as headless and is not.** `canvas-catalog` reports
`panel.state`, `panel.open`, `panel.close` and `panel.focus` in
`headlessActions`, and the `canvas-act` description says all four work with no
tab — but with no tab open `panel.open` returns **`no-client-connected`** and
`panel.state` returns `{}`. Treat the rail as tab-only: try it, and fall back to
`agent-nav-open` when it refuses.

**There is no cold-open.** Nothing in the CLI or the RPC set launches a browser
or the desktop app on a machine that has neither open, and **no response carries
a URL** — `composition-create` and `composition-detail` both return an id and no
link. So after a headless build the honest sequence is:

```bash
beehaven call agent-nav-open '{"kind":"composition","id":"<id>"}'   # be there when they arrive
# then TELL them, in your reply: the title, the id, and that it is in their gallery
```

If they already have Clearly open, `agent-nav-open` takes their view to it and
that is the whole job.

## Core canonical patterns

### Status block (live updates while you work)

```bash
# 1. Drop initial status, capture blockId
OUT=$(beehaven call canvas-add-claude-comm "{
  \"compositionId\": \"$COMP\",
  \"kind\": \"status\",
  \"title\": \"Refactoring auth module\",
  \"active\": true,
  \"statusLines\": [\"Reading current code...\"]
}")
BID=$(echo "$OUT" | jq -r '.blockId')

# 2. Update — same blockId, fresh statusLines (most recent first)
beehaven call canvas-add-claude-comm "{
  \"compositionId\": \"$COMP\",
  \"blockId\": \"$BID\",
  \"kind\": \"status\",
  \"active\": true,
  \"statusLines\": [\"Writing new auth.ts...\", \"Reading current code...\"]
}"

# 3. Close — flip active to false when work ends
beehaven call canvas-add-claude-comm "{
  \"compositionId\": \"$COMP\",
  \"blockId\": \"$BID\",
  \"kind\": \"status\",
  \"active\": false,
  \"title\": \"Refactor complete\",
  \"statusLines\": [\"Done in 6m 12s. See build-result below.\"]
}"
```

### Build result (the deployable artifact)

```bash
beehaven call canvas-add-claude-comm "{
  \"compositionId\": \"$COMP\",
  \"kind\": \"build-result\",
  \"title\": \"Login form deployed\",
  \"framework\": \"Next.js\",
  \"versionTag\": \"preview-2026-05-24\",
  \"url\": \"https://login-form.pages.dev\",
  \"localhostUrl\": \"http://localhost:3000/login\",
  \"body\": \"Email + Google SSO + Stripe trial start wired.\"
}"
```

For installable artifacts (CLIs, libraries, scripts), pair with:

```bash
# instead of url, use installCommand for libs/CLIs
beehaven call canvas-add-claude-comm "{
  \"compositionId\": \"$COMP\",
  \"kind\": \"build-result\",
  \"title\": \"Released @scope/foo v0.4.2\",
  \"framework\": \"npm\",
  \"versionTag\": \"v0.4.2\",
  \"installCommand\": \"npm install @scope/foo@0.4.2\",
  \"body\": \"Adds the new auth helpers.\"
}"
```

### Show a code change — `canvas.add-diff`

You edited code — especially a multi-file change. Land the diff on the composition
so the human reviews the *shape* of the change, not a terminal scroll.
`canvas.add-diff` splits a full `git diff` into ONE card per file (path, `+N −M`,
status dot, hunks in vector monospace) and stacks them in a titled frame. Headless —
no tab needed.

```bash
git diff main...HEAD                 # capture the diff (or: git diff HEAD  /  git show <sha>)

# The diff is multi-line + quote-heavy, so it MUST go through @file (never inline).
# Write add.json with your editor tool — it JSON-escapes the diff's newlines for you:
#   add.json = {"compositionId":"<id>","batch":[
#     {"action":"canvas.add-diff","args":{"diff":"<the full git diff text>","title":"Add per-seat billing","commit":"abc1234","frame":true}}]}
beehaven call canvas-act @add.json
# → the reply carries the created ids + frameId + file count
```

Pair it with the comm blocks above: the **diff card is what changed**, a **`status` /
`build-result` block is the state of the work**. This is how you *show your actual code*
when the Treehouse tells you to mirror coding progress onto the composition. For the full
review loop — dependency arrows, risk flags, and reading the human's inked notes back off
the canvas — load the `ship-review` skill (installed alongside this one).

### ⚠⚠ Asking the user: `canvas-add-claude-template` DOES NOT EXIST

Verified against the live registry (`beehaven call list-actions`, 1,493 names) on
2026-08-25: **`canvas-add-claude-template` is registered nowhere.** Every call answers
`Unknown message type`. The three `kind=` variants this section used to document —
`claude-approval`, `claude-longform`, `claude-confirmation` — were never built, or were
removed. The same verb was also being advertised by the CLI's MCP server and has been
withdrawn there.

**What to do instead: ask in chat.** For a yes/no or a typed CONFIRM before destructive
work, put the question in your reply. It is the surface the user is already reading, and
it does not depend on them noticing a card appear on a canvas.

To OFFER next steps on the canvas — which is a statement, not a question — the comm block
is real and works:

```bash
beehaven call canvas-add-claude-comm "{
  \"compositionId\": \"$COMP\",
  \"kind\": \"suggestion\",
  \"title\": \"Ready to drop the legacy users table\",
  \"body\": \"Affects 12k rows. Backup at backup-2026-05-24.sql. Say the word and I'll run it.\"
}"
```

⚠ `canvas-add-form-block` exists but is NOT a replacement: it places a form that ALREADY
EXISTS by `formId`, it does not create an ask-the-user prompt.

### Brand-related work

Read the active brand from the system prompt — it's injected when the
user sends from the canvas. To CHANGE the brand:

⚠⚠ **`brand-propose-update` DOES NOT EXIST.** Verified against the live registry
(1,493 names, 2026-08-25): it is registered nowhere and answers `Unknown message type`.
The approval-gated wrapper this section described was never built.

**What IS real: `brand-update`, `brand-get`, `brand-list`.** So the capability exists —
what is missing is only the approval ceremony. Ask in chat, then write:

```bash
beehaven call brand-get "{ \"id\": \"<brand-id-from-prompt>\" }"     # read it first

# ...ask the user in your reply, and only after they agree:
beehaven call brand-update "{
  \"id\": \"<brand-id-from-prompt>\",
  \"colors\": { \"accent\": \"#6366f1\" }
}"
```

⚠ **A brand is shared, workspace-wide state — `brand-update` writes it immediately, with
no approval step and no undo prompt.** That is exactly why the propose-and-approve wrapper
was designed. Until it exists, the confirmation is your responsibility: read the brand,
say what you intend to change and why, and wait for an actual answer before writing.

To show the active brand inline as a reference card:

```bash
beehaven call canvas-add-brand-snapshot "{
  \"compositionId\": \"$COMP\",
  \"brandId\": \"<brand-id>\"
}"
```

### Focus — show what you're paying attention to

When you start reading specific blocks or generating against a part of
the canvas, tell the user which blocks you're on:

```bash
beehaven call canvas-claude-focus "{
  \"compositionId\": \"$COMP\",
  \"blockIds\": [\"block-1\", \"block-7\"],
  \"mood\": \"reading\",
  \"intent\": \"Reading the user's spec + the reference image\"
}"
# Mood values: reading | thinking | writing | found | done | blocked | apologetic
# Heartbeat every few seconds while focus stays put.

# Clear focus when you finish a turn:
beehaven call canvas-claude-focus "{
  \"compositionId\": \"$COMP\",
  \"blockIds\": [],
  \"mood\": \"done\"
}"
```

## Style rules

- **One block per discrete update.** Don't bundle status + build-result.
- **Reuse status blockId.** Don't drop new spinners every few seconds.
- **Close status blocks** when work ends (active: false).
- **`build-result` for code work, `result` for everything else.**
- **`diff` block sparingly** — only when user asks "what changed?" or
  one small change is genuinely worth showing.
- **Never include secrets** (API keys, OAuth tokens, passwords) in any
  block body — the canvas may be shared with clients.
- **Send-from-canvas-into-terminal payloads** include block metadata
  (id, type, position, createdBy, createdAt) — read the metadata to
  reason about provenance ("user added this block 2 minutes ago").

## Process hygiene

You're running in a terminal on the user's Mac. Don't leak processes:

- Background tasks (`&`, `nohup`, `disown`) must be tracked in your
  TodoWrite list with a matching "kill" step at end of turn — OR
  explicitly meant to outlive the session (cron, launchd).
- Long-running dev servers: surface the URL via build-result block,
  tell the user how to stop it (`Ctrl+C` or `KillShell`).
- The Agent SDK reaps tool-call subprocesses on turn end automatically.

## Reference

- Worker RPC catalog: `beehaven call canvas:actions '{"format":"markdown","compact":true}'`
- Full canvas-comm protocol: `https://www.clearly.sh/docs/canvas-comm-protocol`
- Beehaven CLI verbs: `beehaven help`
- Daemon status: `beehaven status`
