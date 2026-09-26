# Project plans on a canvas — the real work, laid out

Use this when asked to plan, kick off, roadmap or organise work on a canvas: "make a
project plan", "lay out the launch", "put the roadmap on a board". The deliverable is
a composition where every card is a **live workspace object** — the project, its board
and tickets, the PRD, the checklist sheet, the review deck, the site — arranged so a
person understands the plan at a glance and can open any piece of it.

Do not draw a board out of rectangles or paste a document's text into a text node.
`canvas.place` stores `{refKind, refId}`, so the card *is* the row: edit the ticket
anywhere and the card updates; open the card and you are in the real editor.

## 1. Anchor the plan in a project

```sh
beehaven call project-list '{"limit":50}'                 # reuse the project that owns the work
beehaven call project-create '{"title":"Launch — Q4","description":"…"}'
beehaven call board-list '{"projectId":"<project>"}'      # a project usually has a default board
```

File everything you create into that project (`projectId`). Unfiled agent work is
private to you; filing is how the team sees it.

## 2. Create the objects — each with its own verb

| Primitive | Create | Exact-shape traps |
|---|---|---|
| Document (PRD, brief) | `document-create {title, markdown, projectId}` | `markdown` or `html`, **never** `content` (dropped silently → an empty, unsearchable doc). `ticketId` + `artifactKind:"prd"` files it on a ticket. |
| Sheet (checklist, budget) | `sheet-create {title, columns:[…], rows:[[…]], projectId}` | `rows` are arrays of cells; `columns` is the header row. |
| Slides (review deck) | `deck-create {title, projectId, slides:[{title, bullets:[…]}]}` | Build the whole deck in one call; `layout:"title"` for an opener. |
| Board | `board-create {projectId, title, columns?}` | Needs `projectId` (or `personal:true`). Cards on a board **are tickets**. |
| Ticket | `ticket-create {projectId, boardId, title, body, issueType, status}` | `issueType`, not `type`; `body`, not `description` — both fail silently. |
| Site (one page) | `compose-upload-init` → `file-teleport-inline` (`composition:true`, key `compositions/<id>/build/index.html`) → `compose-upload-finalize` | All three steps, or the site is empty. For a page that only lives on this canvas, `canvas.add-artifact {html}` is simpler. |

Keep every returned `id`. Tickets are placed by **row id**, not by key.

## 3. Lay it out with a builder, then place everything in one batch

```sh
beehaven call composition-create '{"title":"Launch — Q4 plan","projectId":"<project>"}'
```

Think in reading order. A header states the goal. Then two lanes: *why and what* (the
project, PRD, tickets, board) and *how and ship* (the checklist sheet, review deck, site).
Connect only cards that depend on each other. A plan is a composition like any other, so
it meets the studio bar in SKILL.md: one grid, a few type roles, one left edge, and a
`canvas.review` verdict before you hand it over.

Build it **inside one frame** named `plan`. That frame is what `canvas.review` inspects,
what a person moves as one piece, and what gives the page its margin.

```js
// plan.mjs — node plan.mjs <compositionId> > /tmp/plan.json
const [compositionId] = process.argv.slice(2);
const ids = { project: '…', prd: '…', board: '…', tickets: ['…', '…'], sheet: '…', deck: '…', site: '…' };
// The system: margin, gutter (room for an arrow label), three type roles, two inks, one ground.
const M = 96, G = 80;
const type = { title: { size: 72, fontWeight: 700, letterSpacing: -1.5 }, lead: { size: 24 }, label: { size: 16, fontWeight: 600 } };   // a plan is read zoomed out: labels ≥ 1% of the board
const ink = { strong: '#16150f', muted: '#6b6760' };            // both ≥ 4.5:1 on the ground below
const size = { card: [340, 440], wide: [720, 440], ticket: [340, 210], deck: [560, 315], site: [420, 440] };
const row1 = [size.card, size.card, size.card, size.wide].reduce((w, [cw]) => w + cw + G, -G);
const W = M * 2 + row1, LANE1 = 300, CARDS1 = LANE1 + 36, LANE2 = CARDS1 + 440 + G, CARDS2 = LANE2 + 36;
const H = CARDS2 + 440 + M;

const batch = [];
const add = (action, args) => batch.push({ action, args });
// Coordinates below are RELATIVE to the plan frame (parentId), for text and cards alike.
const text = (name, copy, x, y, w, role, fill = ink.strong) => add('canvas.create-node', { name, type: 'text', parentId: 'plan', x, y, w, text: copy, fill, ...type[role] });
const place = (kind, id, name, x, y, [w, h]) => add('canvas.place', { kind, id, name, parentId: 'plan', x, y, w, h });

add('frame.create', { name: 'plan', x: 0, y: 0, w: W, h: H, fill: '#f6f5f1' });
text('plan-title', 'Launch — Q4', M, M, 1400, 'title');
text('plan-goal', 'Ship the new onboarding to every workspace by Nov 30', M, M + 104, 1400, 'lead', ink.muted);

text('lane-1', 'Why and what', M, LANE1, 400, 'label', ink.muted);
let x = M;
place('project', ids.project, 'project', x, CARDS1, size.card); x += 340 + G;
place('document', ids.prd, 'prd', x, CARDS1, size.card); x += 340 + G;
place('ticket', ids.tickets[0], 'ticket-1', x, CARDS1, size.ticket);
place('ticket', ids.tickets[1], 'ticket-2', x, CARDS1 + 230, size.ticket); x += 340 + G;
place('board', ids.board, 'board', x, CARDS1, size.wide);

text('lane-2', 'How and ship', M, LANE2, 400, 'label', ink.muted);
x = M;
place('sheet', ids.sheet, 'checklist', x, CARDS2, size.wide); x += 720 + G;
place('deck', ids.deck, 'review-deck', x, CARDS2, size.deck); x += 560 + G;
place('site', ids.site, 'status-site', x, CARDS2, size.site);

// Connect NEIGHBOURS. An arrow is drawn straight through anything between its ends.
add('arrow.create', { from: 'prd', to: 'ticket-1', label: 'scopes' });
add('arrow.create', { from: 'review-deck', to: 'status-site', label: 'ships' });
console.log(JSON.stringify({ compositionId, batch }));
```

```sh
node plan.mjs <composition-id> > /tmp/plan.json
beehaven call canvas-act @/tmp/plan.json > /tmp/plan-result.json   # check ok, results[].ok, skipped
```

- With `parentId` (a frame id **or** name), `canvas.place` takes `x/y` relative to that
  frame, exactly like `canvas.create-node`, and refuses a parent it cannot find. Results come
  back in world coordinates.
- Give explicit sizes. Unsized cards are born at their kind's size: board and sheet 720×440,
  deck 560×315, document/project 340×440, ticket 340×210, site 420×440. A board shows up to
  five lanes; a sheet its first rows.
- A multi-page document places as a frame of pages; its result `id` is that frame.
- `arrow.create {from,to}` resolves ids **or** layer names, and refuses one that matches
  nothing. Read the error rather than retrying; the name you placed with is the handle.
- Leave ~80px between connected cards so the label fits.

## 4. Review it like any composition

```sh
node <skill-directory>/review.mjs <composition-id> plan /tmp/plan-review/plan
```

Work until the verdict is `clean` or `look` (see the studio bar in SKILL.md), then open the
PNG. Check that each card shows its content:

| Card | Should show | If not |
|---|---|---|
| Board | Lanes named after its columns, ticket cards in each | Empty lanes → no tickets on that board (check `boardId`) |
| Sheet | A table: header row, then rows | One run-on line → an older worker; re-check after deploy |
| Deck | Numbered slide titles | "Untitled slide" → slides were created without titles |
| Any | Its content | "no longer exists" → wrong id or kind; "Loading…" in a headless render → unresolved kind |

Then judge it as a page: does the goal win at thumbnail size, do the lanes read as two
groups, does every card share the left edge and gutter? Fix the layout (cramped lanes,
unreadable arrows, a stray card off the grid) before you finish.

## 5. You are visible while you build

When someone has the composition open, you appear in its collaborator stack with your
name, your face and a live activity line ("Placing board · Q4 roadmap"). Your pointer
travels to each thing a step creates or edits, a click plays where it lands, and the
new node is briefly outlined in your colour. While someone is watching, each step is
paced by a fraction of a second (capped per call) so the build streams in under the
pointer. Nobody watching means no pacing.

- **Order the batch in reading order** — header, then each lane left to right — so the
  build reads as the plan unfolding rather than cards popping up at random.
- **Name every layer** (`name`). The activity line uses titles and names.
- Prefer **one batch per coherent section** over one call per node or one enormous
  call: each call's pacing is capped, and a section is what a watcher follows.
- Presence only ever reflects real steps. Do not issue no-op edits to "show activity".
- Presence is not a status report. For a long task, keep one `canvas-add-claude-comm`
  status block updated as well (see [communications.md](communications.md)).

## 6. Hand it over

```sh
beehaven call agent-nav-open '{"kind":"composition","id":"<composition-id>"}'
```

Report the composition title and link, what each card is, and anything left to do
(unfilled tickets, placeholder copy). Everything should be filed in the project.
