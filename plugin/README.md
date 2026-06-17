# `clearly` — Claude Code plugin

Your **company brain** in Claude Code. Search org context (prompts, docs, decisions, facts), write decisions back so they compound, schedule your own follow-ups, inherit the team's skills — plus projects, boards, tickets, knowledge base, agents, and Shopify stores.

## What's in the box

- **Pre-configured MCP server** pointing at `https://relay.clearly.sh/mcp` — ~48 tools, including the Company Brain (`clearly_context_search` / `_write` / `_map`), self-prompting (`clearly_schedule_wake`), skills (`clearly_skill_list` / `_get`), and the full ~200-action catalog via `clearly_workspace_invoke`.
- **Two skills:**
  - **`clearly-init`** — setup: mint a token, set the env var, verify `/mcp`.
  - **`clearly-workflows`** — usage: how to run the workspace as a company brain (search → write back → schedule).

## Install

The MCP **server is hosted** (`relay.clearly.sh/mcp`) — nothing to publish or run. You only need a token. There are two ways to connect:

### A. Manual — any MCP client, works today (no plugin, no repo)

Mint a token at https://clearly.sh/settings → **Developers**, then either:

```bash
# Claude Code, one line:
claude mcp add --transport http clearly https://relay.clearly.sh/mcp --header "Authorization: Bearer ck_mcp_..."
```

…or paste the JSON into Cursor (`~/.cursor/mcp.json`) / Claude Desktop (`claude_desktop_config.json`):

```json
{ "mcpServers": { "clearly": { "url": "https://relay.clearly.sh/mcp", "headers": { "Authorization": "Bearer ck_mcp_..." } } } }
```

This is the universal path. It does **not** include the skills.

### B. Claude Code plugin — bundles MCP + the skills

The plugin adds `clearly-init` + `clearly-workflows` on top of the MCP server. It installs from a **public git marketplace repo** (Claude Code clones it — so the repo must be public; npm is not involved):

```
export CLEARLY_MCP_TOKEN="ck_mcp_..."          # the plugin's .mcp.json reads this
/plugin marketplace add clearly-sh/clearly-plugin
/plugin install clearly@clearly
/clearly:init
```

Devs with this monorepo checked out can skip the public repo and add the local path instead:

```
/plugin marketplace add /path/to/clearly      # this monorepo (has .claude-plugin/marketplace.json)
/plugin install clearly@clearly
```

> **Publishing note:** external users need a public repo to `marketplace add`. Publish the contents of this folder (`apps/mcp-server/plugin/` — plus a root `.claude-plugin/marketplace.json`) to `clearly-sh/clearly-plugin`. The remote MCP needs nothing published; the optional stdio binary `@clearly/mcp-server` is `private` and only needed for offline/local use.

Then run `/clearly:init` and follow the prompts. The `clearly-workflows` skill loads automatically when you work a connected workspace.

## What you can do once connected

Ask Claude Code things like:

- "What do we know about per-seat billing?" → `clearly_context_search`
- "Search the whole org for prior decisions on pricing." → `clearly_context_search { scope: 'org' }`
- "Write this decision into the brain so the team has it." → `clearly_context_write`
- "Remind me to review the launch metrics next Monday 9am." → `clearly_schedule_wake`
- "What skills does this workspace have for shipping a PRD?" → `clearly_skill_list` → `clearly_skill_get`
- "Create a kanban board / add a ticket / take over the storefront chat." → typed tools + `clearly_workspace_invoke`

Claude picks the right tool from the MCP catalog and dispatches.

## Auth + scopes

Tokens (`ck_mcp_…`) are scoped — `agent:ask`, `rpc:read`, `rpc:write`, `admin`. Mint a least-privilege token (read-only for shared access; read+write for your personal Claude Code).

Mint here: https://clearly.sh/settings → **Developers** → **Create MCP token** (it gives you the ready-to-paste config too). Tokens are shown once, revocable, and rate-limited (120/min).

## What this plugin doesn't ship

- The MCP endpoint itself — that's hosted at `relay.clearly.sh/mcp`. The plugin is just config + skills.
- The Clearly app — sign up at https://clearly.sh.
- The `beehaven` CLI — that ships with the Clearly Dev Mac app.

## Source

Source for the `relay.clearly.sh/mcp` endpoint: `apps/cloudflare/src/hive.ts`. Source for the local stdio fallback binary: `apps/mcp-server/src/index.ts`. Both in the `clearly-sh/clearly` repo.
