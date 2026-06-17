---
name: clearly-init
description: Walk the user through getting their Clearly workspace connected to Claude Code — mint an MCP token, set the env var, verify the server shows up in /mcp.
---

# `/clearly:init` — connect a Clearly workspace to Claude Code

Run this once per machine to get the Clearly MCP server reachable from Claude Code. The plugin's `.mcp.json` already points at `https://relay.clearly.sh/mcp`; this skill just handles the auth + verification.

## Steps

### 1. Mint a token

Tell the user to either:

- **Web (recommended)**: open https://clearly.sh/settings → **Developers** → **Create MCP token**. Pick **Read-only** (`rpc:read`) or **Read & write** (`rpc:read` + `rpc:write` — lets Claude write documents, schedule wakes, create boards/tickets). Copy the `ck_mcp_…` value (shown once). The same screen has the ready-to-paste Claude Code command + Cursor/Desktop JSON.
- **CLI** (if they have the `beehaven` CLI from the Clearly Dev Mac app):
  ```bash
  beehaven call create-mcp-token '{"label":"Claude Code","scopes":["agent:ask","rpc:read","rpc:write"]}'
  ```

### 2. Export the token in their shell

Have them paste this in `~/.zshrc` (or `~/.bashrc`) so it persists across sessions:

```bash
export CLEARLY_MCP_TOKEN="ck_mcp_..."
```

Then `source ~/.zshrc` to pick it up in the current shell.

### 3. Restart Claude Code

The plugin's `.mcp.json` resolves `${CLEARLY_MCP_TOKEN}` at MCP server startup, so the env var has to be set before Claude Code launches.

### 4. Verify

Run `/mcp` in Claude Code. You should see `clearly` listed with ~48 tools. The ones that matter most:

- **Company brain** — `clearly_context_search` (one ranked search across prompts, docs, decisions + facts; `scope:"org"` federates across the org), `clearly_context_write` (write a doc/PRD/decision back in), `clearly_context_map` (orient).
- **Self-prompting** — `clearly_schedule_wake` (write a prompt for your future self + schedule a wake, one-shot or recurring).
- **Skills** — `clearly_skill_list` / `clearly_skill_get` (discover + load this workspace's procedures).
- **Catch-all** — `clearly_workspace_catalog` (list all ~200 actions), `clearly_workspace_invoke` (run any by name), `clearly_workspace_ask` (talk to the Omni agent).
- **Discovery** (no auth) — search public projects, ask a public agent, capture a lead.

Then load the usage skill: it teaches the Company Brain + self-prompting loops — see `clearly-workflows`.

A quick functional test:
> "Map my Clearly workspace's brain using the clearly MCP."

If Claude calls `clearly_context_map` and gets back brain stats + topics, the connection is live.

## Troubleshooting

- **`Token missing scope "rpc:write"`** — mint a new token with `rpc:write` in the scope list.
- **`Invalid token`** — token revoked or rotated. Re-mint and update the env var.
- **MCP server doesn't show up in `/mcp`** — Claude Code needs to be restarted after setting the env var. Check `echo $CLEARLY_MCP_TOKEN` returns the token before launch.
- **`Network error reaching ...`** — relay.clearly.sh might be down (rare); check https://clearly.sh status page.
