---
name: clearly-canvas
description: >-
  Design and revise editable compositions on a Clearly canvas using the beehaven
  CLI: posters, campaigns, decks, page mockups, diagrams, spatial reviews, and
  project plans built from LIVE workspace objects (boards, tickets, documents,
  sheets, slides, sites) placed on the canvas. Use when asked to create, improve
  or inspect visual work on Clearly, lay out a plan or roadmap on a canvas, or
  post progress to a named canvas. Use when someone says "work on my canvas",
  "make a poster", "design a deck", or "put this plan on a canvas". Includes art direction, programmatic
  construction and a render/critique/revise workflow. Requires a shell for canvas
  actions; MCP artifact tools can read/create/replace scenes but are not a canvas
  dispatcher.
---

# Clearly canvas — design, build, look, revise

The deliverable is a composition that communicates a specific idea at its intended
viewing size, with editable, well-named layers. Successful RPCs prove that nodes were
stored. A rendered image you have inspected is the evidence for visual quality.

For a small correction, keep the existing direction and make the smallest useful edit.
For a new composition or substantial redesign, use the workflow below.

Keep the requested scope. A landing concept with a logo needs its page layouts and a usable
logo; add application boards or a full guideline system only when the brief calls for them.
Read only relevant references. Save large tool responses once and print compact summaries.

## The studio bar — what "done" means, every time

Load **`design-craft`** before any new visual work: grid, type scale, colour roles,
spacing, optical correction, the studio pass. It ships beside this skill; `layout-systems`
covers multi-artboard grids. This skill covers the canvas mechanics.

A composition is done when every requested artboard meets all four conditions:

1. **`canvas.review` verdict is `clean` or `look`.** `fix` means a probable defect
   remains: text colliding or covered, contrast under WCAG (4.5:1 body, 3:1 display),
   type below the artboard's legible floor, missing media, text overflowing its box,
   placeholder copy. Fix it. For an intentional finding, use
   `accept:[{check,ids:[node IDs],reason}]`. Accepted findings stay visible and return `look`.
   Legacy `ignore` can suppress multiple checks and is not an unconditional pass.
2. **Every `look` finding was looked at**: type-size and palette sprawl, near-miss
   alignment, copy against the trim, text over imagery. Act on it or say why not.
3. **You inspected the rendered PNG** against design-craft's studio pass, covering what no
   check can see: focal point, greyscale hierarchy, measure, tracking, space ratio,
   one accent, orphans, consistency.
4. **The first read works at delivery size.** At thumbnail size, the thing that should
   win does win.

A new composition almost always needs at least one revision after its first render. If
the pass finds nothing, look again at the thumbnail. If there is still nothing, say what
you checked. Never make a change only to show that a review happened.

## 0. Start from the workspace's brand and component library

A workspace keeps its brand and its components as data. Read them before you draw, and
build from them — redrawing a button the library already has is how designs drift from the
product they describe.

```sh
beehaven call brand-tokens '{"compact":true}'                     # roles without repeated CSS/prose
beehaven call component-list '{"query":"<kind>","compact":true}' # IDs, dimensions and prop names
beehaven call component-instantiate '{"compositionId":"<id>","instances":[
  {"id":"<component>","x":96,"y":200,"variant":"Light"},
  {"id":"<component>","x":96,"y":280,"variant":"Light","props":{"label":"Save changes"}}]}'
```

- `instances` places many parts with ONE scene read and ONE write; never loop single
  placements. `mode:"dark"` resolves brand colours against the brand's dark palette.
- Placed instances are ordinary editable nodes whose root remembers its master
  (`libraryComponentId`). Edit freely; a genuinely new part goes back into the library with
  `component-create` (or `{ fromCompositionId, nodeId }` to save one you drew).
- Component node coordinates are relative to the component ROOT, even under an inner
  frame — the opposite of `canvas.create-node`, where x/y follow `parentId`.
- For Clearly product UI, use its brand kit. For a separate client, use that client's kit
  and supplied assets. A requested new client identity is scoped to that composition;
  it does not change the workspace's default brand.

**UX design before implementation.** When the work is a change to a product's UI, the
composition is the design the code will answer to: show the real states (empty, loading,
error, long content, narrow width, dark theme), review it, and link it to the ticket with
`work-link {"ticketId":"…","kind":"design","refKind":"composition","refId":"<id>"}`
before implementation starts.

## 1. Establish the brief and inspect the material

Read the supplied canvas, copy, brand and references before drawing. Resolve:

- Audience, message, desired action and delivery format.
- Dimensions and actual viewing conditions: phone feed, projected slide, desktop UI,
  printed sheet. A canvas mockup does not implement a responsive website.
- Required content and assets; distinguish real evidence from illustrative material.
- Existing visual language worth preserving.

Infer routine details from the request and state consequential assumptions briefly.
Ask only when missing information changes the design. Do not turn the brief into an
approval gate. A request to design authorizes design and revision, not changes to a
workspace-wide brand or publishing elsewhere.

Read `clearly-agent` before your first workspace call. Pin the intended workspace and
sign in once. Do not switch a user's explicit workspace to `home`.

Your surface: the shell. The `beehaven` examples in this skill are literal commands to
run; they are not shapes to translate into an MCP canvas-action tool. MCP artifact tools
can read and edit artifact records, while canvas-specific actions use the CLI.

```sh
beehaven env
beehaven connect home
beehaven agent login <name> --label "Design <artifact>" --client cli
beehaven call canvas-perceive '{"compositionId":"<id>","format":"json"}'
beehaven call canvas-catalog '{"query":"create-node"}'
```

For a new design task, `design-start {title, projectId?, boardId?, idempotencyKey}` searches before
creating and returns the linked ticket and composition in one call. Keep a stable idempotencyKey
for retries. A partial failure returns recovery IDs; resume it rather than creating replacements.
For an existing task, reuse its ticket/project. Check one unknown action with
`beehaven explain <action>` or a filtered catalog; do not download the entire registry.

Use the composition supplied by the user. If none is named, inspect recent titles and
context; create a clearly titled composition for new work instead of modifying an
arbitrary recent canvas. File shared work into its project.

### A plan is made of real objects

When the brief is a project plan, roadmap or kickoff, the canvas holds the work itself:
create the project's board, tickets, PRD, checklist sheet, review deck and site with
their own verbs, then `canvas.place` each one as a live card — a board draws as lanes
of its tickets, a sheet as a table, a deck as its slide titles, a site as the page.
Follow [project-plans.md](project-plans.md). Never imitate a board with rectangles or
paste a document into a text node; a placed card is the row, not a copy.

People watching the composition see you as a collaborator — your face in the
collaborator stack, your pointer travelling to each step, what you just made outlined.
Order batches in reading order and name every layer; presence reflects only real steps.

## 2. Choose a visual idea

Before generating nodes, write a short working brief in your local build file:

> **Message:** what the viewer should understand. **Visual idea:** how the design
> expresses it. **Hierarchy:** first, second and third reads. **System:** grid,
> typography, palette, image treatment. **Avoid:** conventions unsuitable for this brief.

For substantial work, consider two meaningfully different directions privately or as
small thumbnails. Choose one for a reason tied to the message. The directions should
differ in composition or visual idea, not merely accent colour.

A useful idea changes placement, scale, imagery or sequence. “Clean and modern” does
not decide anything. For example, an archival exhibition might use large catalogue
numbers, carefully cropped objects and compact provenance; a performance report
might use one decisive chart and direct annotations.

Read [composition-patterns.md](composition-patterns.md) for the relevant format.
These are starting points, not mandatory styles. Symmetry, 50/50 splits, four items,
multiple colours and dense pages can all be appropriate. Choose deliberately.

## 3. Define a small design system and code the composition

When §0 found a brand kit and components, they are the system: map the brief onto their
roles, then add only what the brief genuinely needs. Write a local JS/Python builder when
the artifact has repeated elements or several artboards. Use named tokens, helpers, arrays and layout arithmetic as you would in
HTML/CSS. The CLI can submit the complete generated payload. You do not need to
hand-author hundreds of coordinates in a chat message.

- Establish margins, columns, gutters and a spacing scale from the format. Compute
  positions from those values. Reserve a region for the main visual.
- Define text roles with family, size, weight, line height and measure. Start with a
  small set; expand when the content earns it. Measure display type before placement.
- Assign colour by role: ground, ink, muted ink, emphasis and functional states.
  Check contrast on the actual ground. Use the user's real brand assets.
- Choose relevant imagery, a meaningful diagram, a product view or a deliberate
  typographic treatment. Decorative blobs and random stock photos do not prove a
  product claim. Native SVG/paths suit diagrams and vector art; raster generation
  suits imagery when an image tool is available.
- Define repeated components once. Vary composition where the content changes.
  A deck of identical cards has little rhythm even when every card aligns.
- Keep important copy and layers editable. Do not flatten the whole composition
  into a screenshot or a single SVG just to make placement easier.

`canvas.compose` is a convenience for conventional blocks. Use it when its structure
matches the chosen direction, then adapt and inspect it. It is not an art director or
a quality guarantee. Custom compositions should use native nodes and your own builder.

Read [authoring.md](authoring.md) before building. It covers the exact coordinate,
batch, text, image-upload and MCP contracts. For a local image, use
`beehaven canvas add-image <file> --composition <id>` when the installed CLI supports
it; read authoring.md for the current CLI fallback and the MCP URL-only path.
Consult `canvas-catalog` for action schemas
instead of loading an exhaustive reference.

## 4. Build a representative surface, then complete the artifact

For a deck or campaign, develop the most representative artboard first. Check its
type, spacing and image treatment before spreading that system to the rest.
For a single page, establish the complete hierarchy before polishing small details.

Use a batch for each coherent build or revision, with descriptive unique layer names.
Parent content to its artboard. Inspect every operation result and rollback status.
Save your builder and returned IDs so revisions are targeted and reproducible.
Check `ignoredFields`, `rejectedFields`, `warnings`, `outcome` and `canvasChanges` as well as
`ok/count`. `matched` is not `updated`. An unchanged or partly ignored request does not prove
the intended edit happened. Read `composition-detail {includeScene:true}` from its top-level
`nodes`; never treat a missing response field as an empty scene. Keep executed payloads immutable.

⚠ **Batch, never loop.** One `canvas-act` batch of hundreds of steps is one scene read,
persisted every 50 steps, and the workspace stays responsive for everyone in it while it
runs. The same steps sent as hundreds of separate calls each re-read the whole scene. If a
call fails with a dropped connection, read the scene (`composition-detail
{id, includeScene:true}`) before retrying: the work may have landed.

⚠ **One batch per canvas at a time.** A reply that times out ("outcome unknown") or drops does
not stop the batch — it is still running on the workspace. Resending at once used to start a
second, slow, unprotected batch and could half-apply both (CA-43). The workspace now queues a
second writer behind the first and answers `code: "canvas-busy"` (with the running batch's
progress) if it waits too long — nothing from that call was applied. Either way: read the scene,
then send only what is missing. A ~1,100-step build takes about 40 s; the CLI waits 180 s by
default and `--timeout <ms>` (or `BEEHAVEN_RPC_TIMEOUT_MS`) raises it. Never place component
instances after a build whose reply you did not see.

Keep review notes and status outside the delivered artwork. Use
[communications.md](communications.md) only when posting those blocks is useful.

## 5. Render, look, critique, revise

Render each final artboard, not just the board overview. A thumbnail catches hierarchy;
a detail view catches collisions, wrapping, cropping and legibility.

The bundled helper saves pixels directly to disk so base64 does not fill your context:

```sh
node <skill-directory>/review.mjs <composition-id> <frame-id-or-unique-name> /tmp/canvas-review/01
# Open the returned PNG using your image-viewing tool; read the JSON findings.
```

It invokes `canvas.review` on one persisted snapshot and returns:
- a `verdict` (`fix` / `look` / `clean`);
- `craft` findings: collisions, covered text, contrast, legibility floor, missing media,
  type and palette sprawl, near-miss edges, trim crowding, text over imagery;
- the placeholder/overflow audit, measured text fit, and a preview PNG.

For several artboards, write their IDs/names as a JSON array and use:
`node <skill-directory>/review.mjs --many <composition-id> <ids.json> <output-directory>`.
This uses `canvas.review-many`: one scene read, separate findings per artboard and compact
preview handles. Review only artboards changed since their verified snapshot. The helper versions
existing output paths so before/after evidence is retained.

The helper prints the verdict and every finding. Work until the verdict is `clean` or
`look`, as described in the studio bar above. If the installed worker lacks `canvas.review`,
use a real frame ID with `--perceive` for a preview-only check and run the text measurement
and audit separately. A failed or missing render means visual verification is incomplete.

```sh
# A deliberate finding — say why in the handoff:
beehaven call canvas-act '{"compositionId":"<id>","action":"canvas.review","args":{"ids":["<frame>"],"accept":[{"check":"text-over-image","ids":["<text-id>","<image-id>"],"reason":"Intentional type over this photograph; rendered contrast was inspected."}]}}'
```

Asset storage is a reference-aware pipeline: an SVG may have `svgRef` instead of inline markup.
Do not shrink or recreate it just because the inline field is absent. Replace it with
`canvas.update-nodes {ids, patch:{svg:<complete markup>}}`; references are managed by the action.
Use `canvas.fonts` before choosing an unfamiliar family/weight. Fallback metrics are not exact.
Use `canvas.editor-state {requireLive:true,includePixels:true}` to verify the responding editor.
An agent camera and a navigation delivery count do not prove the person's view was framed.

Inspect the actual image and identify concrete defects, not generic praise:

| Lens | What to judge |
|---|---|
| Message | Does the first read communicate the point? Does the visual support it? |
| Hierarchy | Is emphasis intentional at thumbnail size? Is every section equally loud? |
| Typography | Fit, line breaks, line length, weight, contrast, awkward last lines. |
| Composition | Alignment, useful negative space, rhythm, image crop, balanced visual mass. |
| Craft | Accidental tangencies, missing media, obscured text, inconsistent edges or details. |
| Format | Legibility at delivery size; mobile reflow when relevant; full deck/campaign coherence. |

Fix the largest compositional problem before adjusting small decoration. Re-render
changed artboards and inspect them again. Stop when the verdict allows it and you can
point to evidence that the brief is met with no material defects remaining.

Interpret diagnostics: deliberate bleed can be valid; auto-height is estimated until
browser layout; off-grid values are not inherently defects. `exact:false` font metrics
mean a substitute family/weight or an estimate. Preview `renderer`/`fontMode`, when
available, describe its route, not perfect browser parity. Inspect the live editor
for custom fonts, rich text, interactions and media/effects the preview cannot verify.

## 6. Deliver the work and the evidence

Complete every requested page/artboard. Report:
- the title and a usable composition link;
- each artboard's final `canvas.review` verdict, any ignored finding and the reason for it;
- what the first render got wrong and what you changed;
- the views you inspected and any material limitations.

Open the named composition with `agent-nav-open` when the user asked to see it. Keep the
reusable builder and review artifacts available for the next iteration.

Do not call work "studio grade" because the verdict is clean. Clean means that no mechanical
defect was found. Show the finished composition and describe the visual decisions that make it work.
