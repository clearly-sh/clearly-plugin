# `clearly` — Claude Code + Codex plugin

Your **company brain** in Claude Code and Codex. Search org context, write durable decisions back,
inherit the team's skills, and work with projects, boards, tickets, documents, canvases, sheets and
decks.

## What's in the box

- **Pre-configured MCP server** pointing at `https://relay.clearly.sh/mcp` — **7 tools**, split by what they do to the workspace: `clearly_catalog` (optional type/operation-scoped schemas), `clearly_read` / `clearly_write` / `clearly_edit` / `clearly_delete` over documents, canvases, sheets, decks, boards, tickets and projects alike, and `clearly_grep` / `clearly_glob` to find things. Each CRUD verb takes a `batch`. Everything requires a credential; there is no anonymous access.
- **The other ~1,000 workspace actions are reached with the `beehaven` CLI** — `beehaven call <action> '<json>'`. They are deliberately not MCP tools: one tool that dispatches whatever the caller names spans safe and unsafe operations at once, which is a connector-directory rejection criterion. The CLI is the right door for a client that has a shell, and it attributes every call to your agent.
- **Skills:**
  - **`clearly-agent`** — sign in as a named agent identity and resume its session.
  - **`clearly-init`** — setup: sign in over OAuth (browser), verify `/mcp`.
  - **`clearly-workspace`** — survey and audit the workspace before repair or migration.
  - **`clearly-docs`** — document search, precise edits, history and recovery.
  - **`clearly-workflows`** — company-brain usage: search → write back.
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

The MCP **server is hosted** (`relay.clearly.sh/mcp`) — nothing to publish or run. Browser OAuth
is the default. Agent-bound bearer tokens are available through `beehaven mcp install` for clients
or automation that cannot complete OAuth.

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

### B. Plugin — bundles MCP + all 14 skills

The plugin adds all 14 bundled skills on top of the MCP server. Claude Code installs it from the
public Git marketplace repo:

```
/plugin marketplace add clearly-sh/clearly-plugin
/plugin install clearly@clearly
```

Then run `/mcp`, select `clearly`, and choose **Authenticate** — a browser window opens for sign-in. No token.

For Codex, add the Clearly marketplace and install the `clearly` plugin from it, then run
`codex mcp login clearly`. Start a fresh thread after install or upgrade so Codex reloads the skills
and MCP definition.

```bash
codex plugin marketplace add clearly-sh/clearly-plugin
codex plugin add clearly@clearly
codex mcp login clearly
```

Devs with this monorepo checked out can skip the public repo and add the local path instead:

```
/plugin marketplace add /path/to/clearly      # this monorepo (has .claude-plugin/marketplace.json)
/plugin install clearly@clearly
```

> **Publishing note:** external users need a public repo to `marketplace add`. Publish the contents of this folder (`apps/mcp-server/plugin/` — plus a root `.claude-plugin/marketplace.json`) to `clearly-sh/clearly-plugin`. The remote MCP needs nothing published.

Run `/clearly:clearly-init` to walk through the browser sign-in and verify the connection (or read [SETUP.md](./SETUP.md)). The `clearly-workflows` skill loads automatically when you work a connected workspace.

## What you can do once connected

Ask Claude Code things like:

- "Find the pricing doc and open it." → `clearly_grep` → `clearly_read`
- "What do we know about per-seat billing?" → `beehaven call context-search '{"query":"per-seat billing"}'`
- "Search the whole org for prior decisions on pricing." → `beehaven call context-search '{"query":"pricing","scope":"org"}'`
- "Write this decision into the brain so the team has it." → `beehaven call context-write '{…}'`
- "What skills does this workspace have for shipping a PRD?" → `beehaven call skill-list` → `beehaven call skill-get '{"id":"…"}'`
- "Create a kanban board / add a ticket." → `clearly_write { type: 'board' | 'ticket' }`

…and drive the **spatial canvas**:

- "Work the task on my canvas." / "Take this spec from the board." / "Let's pair on the canvas." → `pair-on-canvas`
- "Put this PR on the canvas so I can review it." → `ship-review` → `beehaven call canvas-act '{"action":"canvas.add-diff",…}'`
- "Diagram how our auth flow works." / "Draw this, don't write it." → `visualize`
- "Map this codebase's architecture." → `codebase-map`
- "Make me a sticker pack about shipping code." → `sticker-pack`

Your coding agent picks the right typed tool; it calls the catalog only when it needs a precise
type-specific schema.

## Auth + scopes

OAuth grants `agent:ask`, `rpc:read`, and `rpc:write`. `rpc:admin` is never granted through browser
OAuth and is reserved for configured platform admins. Static agent-bound tokens normally carry
`rpc:read` and `rpc:write` and can be installed without exposing the raw credential by running
`beehaven agent login <name>` followed by `beehaven mcp install --client codex`. Add `--rotate`
only when you deliberately want to replace an existing credential.

Sign out / revoke anytime with `claude mcp logout clearly` (or Settings → **Developers** in the app). Connections are rate-limited (120/min).

## What this plugin doesn't ship

- The MCP endpoint itself — that's hosted at `relay.clearly.sh/mcp`. The plugin is just config + skills.
- The Clearly app — sign up at https://clearly.sh.
- The `beehaven` CLI — install it with `curl -fsSL https://clearly.sh/install.sh | sh`, or use the
  copy bundled with the Clearly Dev Mac app.

## Source

Source for the `relay.clearly.sh/mcp` endpoint: `apps/cloudflare/src/mcp-server.ts` and
`apps/cloudflare/src/mcp-oauth.ts` in the `clearly-sh/clearly` repo.
