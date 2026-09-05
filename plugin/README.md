# `clearly` — Claude Code plugin

Your **company brain** in Claude Code. Search org context (prompts, docs, decisions, facts), write decisions back so they compound, schedule your own follow-ups, inherit the team's skills — plus projects, boards, tickets, knowledge base, agents, and Shopify stores.

## What's in the box

- **Pre-configured MCP server** pointing at `https://relay.clearly.sh/mcp` — ~48 tools, including the Company Brain (`clearly_context_search` / `_write` / `_map`), the **spatial canvas** (`clearly_canvas_perceive` / `_act` / `_catalog`), skills (`clearly_skill_list` / `_get`), and the full ~200-action catalog via `clearly_workspace_invoke`.
- **Skills:**
  - **`clearly-init`** — setup: sign in over OAuth (browser), verify `/mcp`.
  - **`clearly-workflows`** — company-brain usage: search → write back → schedule.
  - **`design-craft`** — the craft layer: grid construction, modular type scale, colour
    systems, spacing, hierarchy, optical correction, and the studio pass to run before
    calling anything done. Load it before any visual work.
  - **`brand-identity`** — a full identity the way a studio ships one: brief, constructed
    mark, lockups + clear space, palette with roles, type system, real applications, and a
    spec board someone else can build from.
  - **`layout-systems`** — the named artefacts with their real numbers: poster, social
    campaign, deck, landing page, editorial spread, cards — and how each one usually fails.
  - **`clearly-canvas`** — the canvas operating manual: perceive → create frames / text / shapes / vector arrows / diffs that persist headlessly.
  - **`pair-on-canvas`** — the board as mission control for a coding task: read the human's pinned spec, do the repo work, report plan / status / diff / PR as cards they steer by inking.
  - **`ship-review`** — land a code change as a spatial change-map; the human inks notes, you read them back and revise.
  - **`visualize`** — turn any concept or answer into a diagram (flowchart / sequence / ER / architecture / mind-map / matrix).
  - **`codebase-map`** — walk a repo → a living architecture map (modules as frames, dependencies as arrows).
  - **`sticker-pack`** — an idea → a printable die-cut sticker sheet on the canvas.

## Install

The MCP **server is hosted** (`relay.clearly.sh/mcp`) — nothing to publish or run. Auth is **OAuth**: you sign in through the browser, there's no token to mint or paste. There are two ways to connect:

### A. Manual — any MCP client, works today (no plugin, no repo)

Add the endpoint, then sign in through the browser:

```bash
# Claude Code, two lines:
claude mcp add --transport http clearly https://relay.clearly.sh/mcp
claude mcp login clearly     # opens the browser for OAuth sign-in
```

…or paste the JSON (no `headers` — OAuth-capable clients prompt a sign-in) into Cursor (`~/.cursor/mcp.json`) / Claude Desktop (`claude_desktop_config.json`):

```json
{ "mcpServers": { "clearly": { "url": "https://relay.clearly.sh/mcp" } } }
```

This is the universal path. It does **not** include the skills.

### B. Claude Code plugin — bundles MCP + the skills

The plugin adds all the skills above (`clearly-init`, `clearly-workflows`, `clearly-canvas`, `pair-on-canvas`, `ship-review`, `visualize`, `codebase-map`, `sticker-pack`) on top of the MCP server. It installs from a **public git marketplace repo** (Claude Code clones it — so the repo must be public; npm is not involved):

```
/plugin marketplace add clearly-sh/clearly-plugin
/plugin install clearly@clearly
```

Then run `/mcp`, select `clearly`, and choose **Authenticate** — a browser window opens for sign-in. No token.

Devs with this monorepo checked out can skip the public repo and add the local path instead:

```
/plugin marketplace add /path/to/clearly      # this monorepo (has .claude-plugin/marketplace.json)
/plugin install clearly@clearly
```

> **Publishing note:** external users need a public repo to `marketplace add`. Publish the contents of this folder (`apps/mcp-server/plugin/` — plus a root `.claude-plugin/marketplace.json`) to `clearly-sh/clearly-plugin`. The remote MCP needs nothing published.

Run `/clearly:init` to walk through the browser sign-in and verify the connection. The `clearly-workflows` skill loads automatically when you work a connected workspace.

## What you can do once connected

Ask Claude Code things like:

- "What do we know about per-seat billing?" → `clearly_context_search`
- "Search the whole org for prior decisions on pricing." → `clearly_context_search { scope: 'org' }`
- "Write this decision into the brain so the team has it." → `clearly_context_write`
- "What skills does this workspace have for shipping a PRD?" → `clearly_skill_list` → `clearly_skill_get`
- "Create a kanban board / add a ticket / take over the storefront chat." → typed tools + `clearly_workspace_invoke`

…and drive the **spatial canvas**:

- "Work the task on my canvas." / "Take this spec from the board." / "Let's pair on the canvas." → `pair-on-canvas`
- "Put this PR on the canvas so I can review it." → `ship-review` → `clearly_canvas_act { action: 'canvas.add-diff' }`
- "Diagram how our auth flow works." / "Draw this, don't write it." → `visualize`
- "Map this codebase's architecture." → `codebase-map`
- "Make me a sticker pack about shipping code." → `sticker-pack`

Claude picks the right tool from the MCP catalog and dispatches.

## Auth + scopes

Auth is **OAuth** — you sign in through the browser on first connect; there's no token to mint, export, or paste. The sign-in grants scoped access — `agent:ask`, `rpc:read`, `rpc:write`, `admin` — least-privilege by default (read-only for shared access; read+write for your personal Claude Code).

Sign out / revoke anytime with `claude mcp logout clearly` (or Settings → **Developers** in the app). Connections are rate-limited (120/min).

## What this plugin doesn't ship

- The MCP endpoint itself — that's hosted at `relay.clearly.sh/mcp`. The plugin is just config + skills.
- The Clearly app — sign up at https://clearly.sh.
- The `beehaven` CLI — that ships with the Clearly Dev Mac app.

## Source

Source for the `relay.clearly.sh/mcp` endpoint (worker + OAuth): `apps/cloudflare/src/hive.ts`, in the `clearly-sh/clearly` repo.
