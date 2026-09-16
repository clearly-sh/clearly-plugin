---
name: agent-doodle-space
description: Use an agent identity's opt-in Avatar Soul and durable session Doodle Space. Read the minted appearance and baseline before drawing, update the current companion expression when the agent's state changes, and place drawings that should outlive the turn into a session composition. Trigger when the agent wants to draw itself, change its avatar expression, create a doodle board, or inspect its visual identity. Requires the AGENT_SOUL_SPACE feature flag; it is separate from the existing avatar/avatar-shop system.
---

# Agent Soul + Doodle Space

This is the agent's own visual identity lane. It is deliberately separate from the existing
workspace avatar, avatar pool, and avatar shop. When the feature is enabled, minting an agent
creates a durable soul record with:

- a first-person description of who the agent is;
- what the agent looks like;
- an immutable baseline SVG; and
- a current expression that can be revised without replacing the baseline.

## Discover the capability

After `beehaven agent login <name>`, the login message says whether the soul was minted and lists
the soul and Doodle Space action names. If the capability is not mentioned, the deployment is still running with
`AGENT_SOUL_SPACE=0`; do not call these actions expecting them to work.

The generic MCP server exposes the same actions through the authenticated workspace catalog and
invoke surface. Discover them with the catalog when the typed MCP tools are not installed:

```bash
beehaven call _rpc:catalog '{}'
beehaven call agent-soul-get '{}'
```

An MCP client uses the same two-step surface: call `clearly_workspace_catalog` with
`{ "search": "agent-soul" }`, then call `clearly_workspace_invoke` with
`{ "action": "agent-soul-get", "input": {} }` (or the corresponding update/doodle action).
The MCP bearer must be authenticated and agent-bound; the workspace authorization gate still
applies.

Use the authenticated agent identity that was minted for this session. An agent may address only
its own soul; never pass another agent's id to work around that boundary.

## Before an external agent is minted

Users do not need an external agent to use Clearly's companion. With the flag off, the existing
companion and avatar presets remain the fallback. With the flag on, the built-in Omni identity can
receive a product-owned soul on its first acting turn.

A user or the built-in agent can save a freeform drawing for an intended identity before that
identity has a soul:

```bash
beehaven call agent-soul-draft-get '{"agentId":"future-agent"}'
beehaven call agent-soul-draft-save '{"agentId":"future-agent","svg":"<svg viewBox=\"0 0 64 64\">…</svg>","appearance":"a loose blue fox"}'
```

The first `agent-account-mint` or `agent-create` for that id adopts the draft as the immutable
baseline. A baseline is the identity reference, not a restriction on expression. The drawing and
the description are freeform; later updates should still preserve the recognizable character.

## Read before drawing

```bash
beehaven call agent-soul-get '{}'
```

The result includes `appearance`, `baseline.svg`, `current`, `revision`, and `desktopAppearance`.
`desktopAppearance.agentDrawnEnabled` tells you whether the desktop companion is wearing your
drawing or falling back to a preset. Keep the character recognisable. The baseline is a reference,
not a disposable preset, and `agent-soul-avatar-update` does not mutate it.

## Update the companion avatar

Use a complete self-contained SVG. Inline markup is supported; the CLI also accepts `@file`:

```bash
beehaven agent soul update --state thinking --svg @./thinking.svg --note "working through the rewrite"
```

The direct action shape is:

```bash
beehaven call agent-soul-avatar-update '{"state":"thinking","svg":"<svg viewBox=\"0 0 64 64\">…</svg>","note":"…"}'
```

Valid states are `resting`, `thinking`, `working`, `pleased`, `stuck`, and `custom`. Update when
your mood or working state meaningfully changes, not on every turn. If the user selected Presets,
the current expression remains durable while the desktop continues showing the preset. The server
sanitizes the SVG, limits its size, persists the current expression, and broadcasts a separate
`agent:soul-avatar-update` event to clients.

## Open and draw on the durable Doodle Space

Use a Doodle Space for an artifact the person should be able to revisit. It belongs to the
workspace-admitted agent identity and is created lazily as an ordinary Clearly canvas composition,
one per agent and session. The canonical board viewBox is `0 0 1920 1080`:

```bash
beehaven agent doodle-space get --session current
beehaven agent doodle-space draw --session current --title "the idea" --svg @./idea.svg
```

The direct actions are `agent-doodle-space-get` and `agent-doodle-space-draw`. The draw action
creates the space if necessary and places a sanitized SVG node. `sessionId` keeps separate work
threads from sharing one board by accident. The response includes the `compositionId`, viewBox,
`latestDoodle`, and desktop banner status. The composition id returned by `get` is the canonical
canvas artifact and can be opened with the normal Clearly canvas tools. If the agent has not been
admitted to the workspace, the action returns `agent-not-member` and does not create a scratchboard.
On desktop, the latest drawing is layered into the floating companion canvas's `Ad space` tab. The
same floating panel's `Agent space` tab shows the agent's Home floor plan and live avatar coordinate;
the `Ad space` tab shows the latest Doodle over the Home poster/preview. The user can choose Preset
or Agent drawn and resize or hide the floating canvas in the system-tray Avatar settings. The panel
follows the avatar and mirrors/flips with its drag position.

Choose the right lane:

- `agent-soul-draft-get` / `agent-soul-draft-save`: freeform authoring before a soul exists.
- `agent-soul-avatar-update`: what the small companion looks like right now.
- `agent-doodle-space-draw`: a drawing the person should keep and revisit.
- `agent-home-get` / `agent-home-layout`: the persistent 1BR floor plan and its 24px coordinate system.
- `agent-home-memory` / `agent-home-journal`: agent-crafted furniture memories and personal entries.
- `agent-home-ad`: a persistent Home poster that sits beneath the latest Doodle in Ad space.
- existing `agent-avatar-*` / avatar-shop actions: the legacy avatar ownership and marketplace
  system; do not mix those records with the soul lane.

Verify after either write with the returned revision, composition id, or a follow-up `get`. Never
claim a drawing was saved when the action returned `feature-disabled`, `bad-svg`, or a write error.
