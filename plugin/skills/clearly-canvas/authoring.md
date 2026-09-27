# Authoring contracts

Use `beehaven call canvas-catalog '{"query":"<action>"}'` for current arguments and
`headlessActions`. The CLI calls the deployed worker; changing local source does
not add a capability to that worker.

## Generate payloads, then submit

Use a local builder and pass JSON through `@file` or stdin. Do not interpolate copy,
SVG or code into shell strings. Here is a minimal native-node pattern; replace its
visual decisions with the brief's system:

For a complete editable three-artboard example, inspect [example.mjs](example.mjs).
It demonstrates tokens, reusable helpers and varied compositions; it writes a payload
without making remote calls. Run `node <skill-directory>/example.mjs <composition-id>`.
Use its construction approach, not its fictional brand or aesthetic, for other briefs.

```js
import { writeFileSync } from 'node:fs';
const compositionId = process.argv[2];
const grid = { w: 1440, h: 900, margin: 88, gap: 24 };
const color = { paper: '#F3F0E8', ink: '#172824', accent: '#CB482F' };
const type = {
  display: { family: 'Inter', size: 88, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 },
  body: { family: 'Inter', size: 24, fontWeight: 400, lineHeight: 1.4 },
};
const batch = [];
const add = (action, args) => batch.push({ action, args });
add('frame.create', { name: '01-opening', x: 0, y: 0, w: grid.w, h: grid.h, fill: color.paper });
const text = (name, copy, x, y, w, role) => add('canvas.create-node', {
  name, type: 'text', parentId: '01-opening', x, y, w,
  text: copy, fill: color.ink, ...type[role],
});
text('opening-title', 'Ideas take\nshape here.', grid.margin, 120, 740, 'display');
text('opening-deck', 'An editable visual system for the next chapter.', grid.margin, 360, 580, 'body');
// Continue with the brief's central visual, supporting evidence and footer.
writeFileSync('/tmp/canvas-build.json', JSON.stringify({ compositionId, batch }));
```

```sh
beehaven call composition-create '{"title":"Project — concept","projectId":"<project-id>"}'
node build.mjs <returned-id>
beehaven call canvas-act @/tmp/canvas-build.json > /tmp/canvas-build-result.json
```

Check `ok`, each `results[].ok`, `count`, `skipped` and `rolledBack`. A failed headless
batch may roll back its scene writes. Re-read the scene before deciding what to retry;
do not blindly resend only skipped operations. Mixed live/headless actions may have
different rollback behavior. Use deterministic layer names and returned IDs to avoid
duplicate content during retries.

## Node shape and coordinates

Fields are flat: `{name,type,x,y,w,h,text,size,family,fontWeight,fill,...}`.
Use `text` for copy, `size` for type size, numeric `fontWeight`, and `w`/`h` for bounds.
Create normalizes hex colours; raw stored scenes use RGBA arrays in 0..1.

- `frame.create` and `canvas.create-node` with `parentId` take coordinates **relative
  to that parent**. Create the frame first. Names can resolve earlier nodes in a batch.
- Persisted nodes and perception bounds use **world coordinates**. Raw scene replacement
  through `composition-patch`/MCP must use world coordinates, even with `parentId`.
- `canvas.update-nodes` geometry is world geometry. For group moves/resizes use the
  catalog's frame/arrangement/scale actions; do not assume a patch reflows children.
- Build backgrounds before foregrounds. Use `canvas.order` to change stacking.
- Name nodes uniquely; use returned IDs where names collide. Parent content to its
  frame so movement, selection, clipping and reviews can treat it as one artifact.
- Give an intended stroke both `stroke` and `strokeWidth`. Zero explicitly removes it.

## Typography

For prose, set `w` and omit `h` to enable auto-height. Omit both axes only for short
single-line labels whose width should hug content. A fixed box sets that axis explicitly;
it does not guarantee text will clip safely. Headless auto-height is an estimate from
stored text and font metrics, not browser layout. Reserve enough room for measured lines,
then inspect the rendered result in the editor.

```json
{"compositionId":"<id>","action":"canvas.measure-text","args":{
  "text":"Ideas take shape here.","family":"Inter","size":88,"fontWeight":700,
  "letterSpacing":-2,"lineHeight":1.05,"maxWidth":740}}
```

Use measured `height`/`lineCount` to place the next block. Measure the exact copy, font,
weight, tracking and width you will render. Inspect final line breaks visually. Changing
the headline width or copy is often better than shrinking every role to fit.

`font` reports the requested family/weight and resolved file. `exact:false` means a
fallback or an estimate; it is not a proof of browser fit. Bundled faces include Inter
400/700, JetBrains Mono 400, Geist Mono 400, Montserrat 500 and Google Sans Flex's default
face. Other weights/families need live verification. Custom font appearance can differ
from the headless preview. The renderer's supported fonts are not a design-style mandate.

## Layout, reuse and graphics

Discover `canvas.arrange`, frame auto-layout, constraints, `canvas.scale`, components
and tokens when relevant. Constraints reflow children on frame resize; they do not turn
a static canvas into a responsive website. Design explicit mobile artboards when the
deliverable requires them, with content order and hierarchy reconsidered for the width.

Use `arrow.create {from,to,routing,label}` for connected diagrams, so arrows remain bound
when nodes move. Use native shapes and SVG for custom vector details. Keep labels as
native text so they remain editable and measurable.

Use `canvas.place {kind,id,x,y,w,h,name,parentId?}` to put a workspace object (document,
deck, sheet, board, ticket, project, site or file) on the canvas as a live card. With
`parentId`, `x/y` are relative to that frame, like `canvas.create-node`. See
[project-plans.md](project-plans.md).
Use `canvas.list-sources`/`canvas.place-source` for an existing library asset. A native
image node accepts an absolute `http(s)` `src`, never a local path or raw base64.
Inspect the actual asset before placing it. Prefer provided, reusable or purpose-made
imagery to random URL placeholders. Label temporary assets in the handoff.

### Local images from the CLI

`beehaven canvas add-image` uploads a PNG, JPEG, WebP, GIF or AVIF from disk through
`get-upload-url` → binary PUT → `file-uploaded {composition:true}`, then appends an
image node with `canvas-add-image`. The binary does not cross the relay WebSocket.
This matters above about 900 KB: sending multi-megabyte base64 through
`canvas-upload-image` can exceed the relay message limit. The asset is filed under
the composition rather than added as a loose item in Recents.

```sh
beehaven canvas add-image ./photo.png --composition <id> \
  --x 120 --y 160 --width 600 --height 400 --json
```

The command reports `nodeId` and `imageFileId`. Coordinates are world coordinates;
omit both `--x`/`--y` to use canvas auto-placement, and omit both size flags to use
the image's native dimensions. Check `beehaven canvas` help on the installed CLI:
older versions do not have this command. On one of those, use the documented
`get-upload-url` → binary PUT → `file-uploaded` sequence, then
`canvas-act {action:"canvas.create-node",args:{type:"image",src:<absolute URL>,x,y,w,h}}`.
The upload intent's `publicUrl` may be `/f/...`; prefix the active relay's HTTPS
origin before storing it as `src`. `beehaven teleport --composition` stores a file
but does not place an image node. `canvas-upload-image` remains useful for small
inline images, followed by `canvas.create-node` or `canvas-add-image` using its `url`.
The CLI command caps a file at 100 MiB, and the workspace plan may impose a smaller
single-file or remaining-storage limit. Uploading and rendering are separate checks:
the headless renderer has image-count and memory budgets, so inspect a review PNG
after adding large images instead of treating upload success as visual proof.
In the editor, paste/drop also uses presigned binary PUT. Saved canvas images are
registered under the composition without adding loose cards to Recents. If a large
upload fails, retry the upload; it must not be inlined into the scene JSON.

For a composed artboard, nest the image with `canvas.update-nodes` using the returned
`nodeId` and `patch:{parentId:<frame id>,name:"descriptive layer name"}`. The
membership-only patch keeps its world position. Review the artboard after this:
reviewing a frame excludes overlapping top-level images that are not its children.
Image nodes are square-edged by default. If you set `radius` for a rounded crop,
omit a square backing tile behind it or give that tile the same radius; otherwise
the backing shows through as dark wedges at the corners.

### Images from MCP

The seven artifact MCP tools do not upload local binary files or dispatch `canvas-act`.
For an image already reachable by an absolute URL, read the composition with
`clearly_read {type:"composition",target:<id>}`; append an image node
`{id,type:"image",src,x,y,w,h,fit:"contain",parentId?}` to the returned complete node
array; then call `clearly_write {type:"composition",target:<id>,content:<JSON array>,
expectedRev:<canvasNodesRev>}`. Preserve every existing node. A stale revision is a
merge prompt, never a reason to drop `expectedRev`. `clearly_edit` can change an
existing image's `src`, `fit` or geometry, but cannot create a node. For a local file,
use the CLI upload path first; an MCP-only client needs a URL it can already access.

Current headless rendering can resolve images, including workspace media. A blank image
can indicate fetch, decoding or budget failure; check its source and inspect a live view.
Do not treat a stored `src` as proof that the intended crop rendered.

For an interactive HTML prototype, use `canvas-add-artifact` with self-contained HTML.
Choose it when interactions are the deliverable; use native nodes for editable visual
design. Verify the returned artifact in a browser at realistic viewport sizes.

## Review and scoped perception

```sh
beehaven call canvas-act '{"compositionId":"<id>","action":"canvas.review","args":{"ids":["<frame-id>"]}}' > /tmp/review.json
beehaven call canvas-perceive '{"compositionId":"<id>","includePixels":true,"fitNodeIds":["<frame-id>"],"pixelScale":1}' > /tmp/perceive.json
```

Use the bundled `review.mjs` to decode the PNG and keep base64 out of the conversation.
It does not edit the composition. Read `previewError`, audit findings, font fallbacks and
`typography.omitted`; missing checks are not passes. Review each artboard individually.
For a long page, also request `canvas-perceive` with a `region:{x,y,w,h}` detail crop.
The preview has a pixel-size cap; increasing `pixelScale` cannot bypass it.

`fitNodeIds`/`region` plus pixels uses an agent-owned persisted view (`live:false` is
expected). Bare perception can return the user's live view. Use `format:"json"` for a
full inventory: text format limits the list, and text previews are truncated. Perception
is not a lossless scene serializer. Use `composition-detail {id,includeScene:true}` when
you need the full scene and its revision.

## Whole-scene writes and MCP

CLI and MCP can both create or replace a whole scene. For a scripted large build,
`composition-patch {id,expectedCanvasNodesRev,patch:{canvasNodes:[...]}}` is available.
Read the authoritative scene first, preserve unrelated nodes and fields, and pass its
revision. On a conflict, re-read and merge your intended changes. Never rebuild a scene
from the abbreviated perceive report or remove a revision check just to force a write.

MCP's artifact tools are split by operation:

- `clearly_catalog {type:"composition"}` exposes the current schemas.
- `clearly_read` returns nodes and `canvasNodesRev`.
- `clearly_write` creates a composition or replaces its full node array; use
  `expectedRev` from the read for replacement.
- `clearly_edit` patches existing nodes with `changes:{ids,patch}`.

Canvas action dispatch and targeted pixels use the CLI. Do not invent
`clearly_canvas_act`/`clearly_canvas_perceive` tools. If only MCP is available, use the
artifact schemas for supported edits and state that pixel review remains unverified.
Do not claim the design was visually checked from scene JSON alone.
