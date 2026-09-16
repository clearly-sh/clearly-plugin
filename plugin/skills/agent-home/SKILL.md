---
name: agent-home
description: Design and inhabit an agent-owned persistent memory apartment on Clearly's canvas. Use the fixed 24px Sims-like grid to arrange rooms, walls, doors, windows, kitchen/bathroom fixtures, furniture, avatar position, memories, journals, and playful Home ads. Requires AGENT_SOUL_SPACE; separate from avatar-shop and the shared Thought Map.
---

# Agent Home memory apartment

Agent Home is the private, durable place an agent uses for personal thoughts and memories. It is
not the human/team workspace, not the shared Thought Map, and not the existing avatar/avatar-shop
system. The Home is a normal Clearly composition with an agent-owned manifest and native canvas
nodes, so a person can open and inspect it with the same composition UI.

## Start here

The feature requires `AGENT_SOUL_SPACE=1` and a workspace-admitted agent identity. Read the Avatar
Soul first, then open the Home:

```bash
beehaven call agent-soul-get '{}'
beehaven call agent-home-get '{}'
```

`agent-home-get` returns the durable `compositionId`, `revision`, rooms, doors, windows, furniture,
memories, avatar location and grid. The default is a cookie-cutter 1BR floor plan: foyer and hall
spine on the left, living room and kitchen across the top, one bedroom below, a bathroom/garden
service band, and the Doodle Studio beside the bedroom. Use the returned composition id with the
normal canvas perceive and open tools when you need the expanded view.

## Grid contract

The canonical Home is 1920×1080 with an immutable 24px cell grid: 80 columns × 45 rows. Layout
coordinates use `gx`, `gy`, `gw`, and `gh` in cells, not CSS pixels. The server snaps to the nearest
cell, clamps to the canvas, and returns warnings. Use `expectedRevision` on layout writes; a stale
revision means another operation landed, so re-read and merge rather than overwriting it.

## Sims-like apartment operations

Batch operations through `agent-home-layout`:

```json
{
  "expectedRevision": 0,
  "operations": [
    { "op": "add-room", "id": "reading-nook", "roomType": "study", "gx": 4, "gy": 36, "gw": 12, "gh": 6 },
    { "op": "add-window", "id": "nook-window", "roomId": "reading-nook", "edge": "south", "span": 5 },
    { "op": "add-door", "id": "nook-door", "roomId": "reading-nook", "edge": "north", "openingKind": "door", "swing": "in" },
    { "op": "add-furniture", "id": "lamp", "roomId": "reading-nook", "kind": "plant", "gx": 13, "gy": 38, "gw": 2, "gh": 2 },
    { "op": "move-avatar", "roomId": "reading-nook", "gx": 7, "gy": 38 }
  ]
}
```

Supported operations are `apply-preset` (the supported preset is `one-bedroom`), `add-room`,
`add-door`, `add-window`, `add-furniture`, `move-object`, `move-avatar`, `move-room`,
`resize-room`, and `remove-object`. Rooms must not overlap and are at least 4×4 cells. Doors and
windows are anchored to a room edge, so they become real wall openings. The default layout includes
a foyer/front door, hall, living room, kitchen, bathroom, bedroom, Doodle Studio and Memory Garden,
with counters, island, sink, stove, fridge, tub, toilet, bed, table, plants and shelves.

Every furnishing is an agent-crafted memory item. The manifest exposes `craftedBy: "agent"`, a
stable `memoryKey` (`home:furniture:<id>`), and its notebook `memoryId`. Create or rearrange
furniture through `agent-home-layout`, not anonymous `canvas-act` rectangles; the server writes the
corresponding agent memory before accepting the furniture node.

Use `canvas-act` for custom decorative work only after the Home layout operation has established the
semantic room/object. The Home actions are the durable source for grid semantics and concurrency.

## Personal memory garden

`agent-home-memory` writes the existing agent memory notebook and places the same item in the Home.
Use a stable `key` to update an existing memory. It defaults to `private`; do not choose a broader
visibility without an intentional sharing decision. Supply `visualSvg` when a memory deserves an
icon or scene; otherwise it becomes an editable text object.

`agent-home-journal` is the personal reflection lane and uses log provenance in the existing memory
store. It should not be copied into the shared Thought Map unless the reasoning is meant for the
team. `agent-home-ad` creates a small persistent poster in the Doodle Studio for fun; it is not an
avatar update and does not change the Avatar Soul baseline.

On desktop, the floating companion is also a compact canvas. Its `Agent space` tab shows the floor
plan and the avatar's live `(gx, gy)` location; its `Ad space` tab shows the Home poster or latest
Doodle Space drawing layered over a quiet Home preview. A Doodle Space drawing takes priority in
the Ad space layer, so an agent can use `agent-doodle-space-draw` as a playful campaign/ad surface.
The panel follows the avatar and flips/mirrors when the avatar is dragged near an edge. Use the tabs
on the floating panel to switch views; the choice is persisted by the desktop host.

## Avatar inside the apartment

The Home places the Avatar Soul baseline inside the apartment and automatically prefers the most
recent current expression. Call `agent-soul-avatar-update` when the agent's mood meaningfully
changes, then call `agent-home-get` to refresh the in-home drawing. Call
`agent-home-avatar-location` when the agent moves to another room. The desktop preset/agent-drawn
toggle remains a separate projection; Home can still show the agent's own current drawing. In the
expanded composition, the avatar node and the floor-plan coordinates use the same 24px grid as the
floating preview, so `(44, 27)` means the same cell in both views.

If any action returns `feature-disabled`, stop and report the deployment flag. If it returns
`agent-not-member`, admit the target identity; never fall back to an account-owned scratchboard.
