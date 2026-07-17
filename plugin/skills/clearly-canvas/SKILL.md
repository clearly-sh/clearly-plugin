---
name: clearly-canvas
description: >-
  USE IF YOU HAVE A SHELL and the `beehaven` CLI. (If instead you have MCP tools
  named *clearly_canvas_act / *clearly_canvas_perceive, use the plugin's
  clearly-canvas skill — same canvas, different surface. The two share a name.)
  Drive the Clearly design canvas from a terminal via the beehaven CLI. TWO
  jobs: (1) BUILD — create frames, text, shapes and SVG at explicit x/y with
  canvas-act, then canvas-perceive to check the layout; the canonical node
  shape is documented here. (2) PUBLISH — drop status updates, narration,
  build results, brand snapshots and approval forms as comm blocks. Use
  whenever you are asked to draw, design, lay out, diagram or build anything
  visual on a Clearly canvas, or to show progress/results on it. Triggers:
  "put this on the canvas", "design a page", "draw a diagram", "make a
  poster", "show this on the canvas", "drop a status block", "publish this".
---

# clearly-canvas — drive the Clearly editor canvas from your terminal

The Clearly editor canvas is the user's project surface. When you (Claude)
are running inside a terminal embedded in Clearly's canvas, you can drop
blocks back onto the same canvas via the `beehaven` CLI — the user sees
the result in real time on the canvas behind your terminal window.

## When to use this skill

| Situation | Block to drop |
|---|---|
| Working on a long task; user should see progress | `canvas-add-claude-comm kind=status` (reuse blockId to update in place) |
| Finished code, deployed somewhere | `canvas-add-claude-comm kind=build-result` |
| Want to explain a non-trivial change | `canvas-add-claude-comm kind=narration` |
| Offering next steps | `canvas-add-claude-comm kind=suggestion` |
| Something failed | `canvas-add-claude-comm kind=error` |
| Need a yes/no | `canvas-add-claude-template kind=claude-approval` |
| Need a paragraph answer | `canvas-add-claude-template kind=claude-longform` |
| About to do something destructive | `canvas-add-claude-template kind=claude-confirmation` |
| Want to show a brand reference inline | `canvas-add-brand-snapshot` |
| Need to apply a brand change | `brand-propose-update` (approval-gated; user approves on canvas) |
| Need a legal sign-off | `canvas-add-claude-comm kind=signature` |
| Plain canvas note (sticky-note style) | `canvas-add-text` |

The full canvas RPC catalog (~50 verbs) is discoverable via:

```bash
beehaven call canvas:actions '{"format":"markdown","compact":true}'
```

## Setting up the connection

You're already connected to the user's home workspace because the
terminal was opened from inside a composition. Confirm with:

```bash
beehaven status                              # daemon + relay health
beehaven pwd                                 # what target am I on?
# Should show: home (personal workspace)
```

If `pwd` shows something else, reconnect:

```bash
beehaven connect home
```

**Always pin the target — don't skip this as redundant.** `home` is the default in
the address grammar, so `connect home` looks like a no-op. It isn't. With no target
pinned, `beehaven call` falls back to the DAEMON's last connection, which is
machine-global: another agent, the desktop app, or a human's terminal may have
pointed it at a team or a store, and you would silently call against that instead
of the workspace you meant. Pinning costs one command and removes the whole class.

Pin once at the start of a build. If you need a different DO for one call, pass
`--building <type>:<id>` rather than re-pointing the target — an explicit flag
can't leak into anyone else's next command, and it can't be clobbered by theirs.

## The composition id

You need the composition id (the URL slug after `/c/` on the canvas)
to drop blocks on the right canvas. Two ways to get it:

1. **It's in the prompt.** When the user sends from the canvas, the
   prompt template includes `Canvas URL: https://www.clearly.sh/c/<id>`.
   Grab the id from there.
2. **List recent.** Run `beehaven call canvas-list-compositions '{"limit":5}'`
   and pick the most recently updated one.

Save it as a shell variable for the session:

```bash
COMP="<id>"
```

## Building artwork — the node shape

This is the part the Treehouse system prompt sends you here for. Everything
below is the BUILD path (make artwork). The comm blocks further down are a
different job (publish an update about your work).

**The node shape is FLAT.** Every field sits on the node itself. There is **no
`style` object** — `style:{text:"…"}` is the single most common way to lose your
work: it persists without error and renders an EMPTY node, because the seed path
stores what you send verbatim.

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
| `w` / `h` | `width` / `height` | |
| `size` | `fontSize` | px |
| `fontWeight` | `"bold"` | 100–900 |
| `fill` | `backgroundColor`, `color` | hex via `canvas.create-node`; RGBA `[r,g,b,a]` 0..1 if you seed `composition-create.data` directly |
| `type` | `"Text"` | lowercase |

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
| `canvas.create-node` `type:"svg"` | an arrow / icon / vector art | `name*`, `x`, `y`, `w`, `h`, `svg` (markup) |
| `canvas.update-nodes` | move / restyle / re-text | `ids*`, `patch:{x,y,w,h,fill,text,…}` |
| `canvas.scale` | resize as a UNIT (children + fonts scale) | `ids*`, `factor` or `toW`/`toH` |
| `canvas.duplicate` / `canvas.delete` | copy / remove (cascades children) | `ids*` |
| `canvas.align` | `left\|hcenter\|right\|top\|vcenter\|bottom\|distribute-h\|distribute-v` | aligns the selection, or `to:"frame"` |
| `canvas.camera` | YOUR own viewport — `set`/`pan`/`zoom`/`fit`/`state` | works with no tab open; perceive then frames it |
| `canvas.component` / `canvas.tokens` | variants / colour + text styles | see the catalog |

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

### Nesting — put children IN the frame

`frame.create` then `canvas.create-node` at matching coordinates gives you a frame
with loose text sitting ON it, not a card: move the frame and the text stays behind.
Pass **`parentId`** (the frame's name or id) to actually nest:

```jsonc
{"action":"frame.create","args":{"name":"card","x":80,"y":80,"w":320,"h":240,"fill":"#141416","radius":10}},
{"action":"canvas.create-node","args":{"name":"card-title","type":"text","parentId":"card","x":94,"y":94,"w":292,"h":20,"text":"Title"}}
```

A nested child's x/y stay WORLD coordinates — `parentId` is membership, not a new
origin. Nest anything you'd want to move, restyle or delete as one thing.

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

### Layout rules that matter

- Place EVERY node at explicit `x`/`y` so you own the layout. Don't use `create`
  for multi-part layouts — it auto-grids and you'll fight it.
- For a page: stack sections vertically in ONE frame (hero → … → footer),
  full-width, deliberate spacing, no overlaps.
- After building, `canvas-perceive` (`format:"text"`) and FIX any overlap or
  CLIPPED before you finish. Send fixes as another `@file` batch.
- Finish the WHOLE artifact — don't stop after one section.

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

### Ask the user for approval before destructive work

```bash
beehaven call canvas-add-claude-template "{
  \"compositionId\": \"$COMP\",
  \"kind\": \"claude-approval\",
  \"titleOverride\": \"Drop the legacy users table?\",
  \"descriptionOverride\": \"Affects 12k rows. Backup at backup-2026-05-24.sql.\"
}"
# → drops a form on the canvas; user picks approve / deny.
# You'll receive their response as a fresh prompt — handle accordingly.
```

For confirm-with-typed-CONFIRM destructive ops:

```bash
beehaven call canvas-add-claude-template "{
  \"compositionId\": \"$COMP\",
  \"kind\": \"claude-confirmation\",
  \"titleOverride\": \"Delete 47 SVGs in /assets — type CONFIRM\"
}"
```

### Brand-related work

Read the active brand from the system prompt — it's injected when the
user sends from the canvas. To CHANGE the brand:

```bash
beehaven call brand-propose-update "{
  \"brandId\": \"<brand-id-from-prompt>\",
  \"compositionId\": \"$COMP\",
  \"patch\": { \"colors\": { \"accent\": \"#6366f1\" } },
  \"rationale\": \"Indigo reads better against the new dark background\"
}"
# → drops a brand-update-approval form. User approves, then you call
#   brand-update with the patch (the approval flow's prompt template
#   instructs you to do this).
```

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
