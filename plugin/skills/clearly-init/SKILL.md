---
name: clearly-init
description: >-
  Connect a Clearly workspace to this client over OAuth and prove it worked —
  sign in through the browser, confirm the server is listed, and check the
  connection actually answers. Use FIRST whenever a Clearly tool is refused for
  auth, returns nothing on a workspace that should have content, or the user has
  never connected. Triggers: "connect Clearly", "set up Clearly", "sign in to
  Clearly", "authenticate", "it says unauthorized", "no workspace", "the tools
  are not showing up", "/mcp shows nothing", "which workspace am I in".
---

> **Tool names below are written UNPREFIXED** (`clearly_canvas_act`). Your runtime may
> expose them with a server prefix — e.g.
> `mcp__plugin_clearly_clearly-staging__clearly_canvas_act`. **Match by suffix, not by
> exact name**: a skill written against the bare name resolves to nothing otherwise, and
> the failure looks like "the tool doesn't exist" rather than "the name is decorated".
>
> **If no such tool is callable at all**, the Clearly MCP server isn't authorised in this
> session — note that these skills still LIST when it isn't, so you find out by firing a
> dead call. Authorise it (`/mcp`, or `claude mcp`), or if you have a shell, use the
> `beehaven` CLI and its own `clearly-canvas` skill instead.

# `/clearly:init` — connect a Clearly workspace to Claude Code

Run this once per machine to get the Clearly MCP server reachable from Claude Code. The plugin's `.mcp.json` already points at `https://relay.clearly.sh/mcp`; this skill just handles the OAuth sign-in + verification. Auth is **OAuth** — the user signs in through the browser, there's no token to mint, export, or paste.

## Steps

### 1. Authenticate (OAuth — browser sign-in)

The plugin already wired the MCP server; the user just has to sign in. Tell them to either:

- **In Claude Code (recommended)**: run `/mcp`, select `clearly`, and choose **Authenticate**. A browser window opens for sign-in; approve and it closes itself. No token.
- **From the shell**: `claude mcp login clearly` — same browser sign-in flow.

The sign-in grants scoped access (`rpc:read` for search + read; add `rpc:write` to let Claude write documents, schedule wakes, create boards/tickets). Sign out / revoke anytime with `claude mcp logout clearly` (or Settings → **Developers** in the app).

> **Staging/dev:** point at the staging relay by setting `CLEARLY_MCP_URL=https://bee-relay-staging.throbbing-unit-1b3f.workers.dev/mcp` before launching Claude Code.

### 2. Verify

Run `/mcp` in Claude Code. You should see `clearly` listed (as **Authenticated**) with ~48 tools. The ones that matter most:

- **Company brain** — `clearly_context_search` (one ranked search across prompts, docs, decisions + facts; `scope:"org"` federates across the org), `clearly_context_write` (write a doc/PRD/decision back in), `clearly_context_map` (orient).
- **Skills** — `clearly_skill_list` / `clearly_skill_get` (discover + load this workspace's procedures).
- **Catch-all** — `clearly_workspace_catalog` (list all ~200 actions), `clearly_workspace_invoke` (run any by name), `clearly_workspace_ask` (talk to the Omni agent).
- **Discovery** (no auth) — search public projects, ask a public agent, capture a lead.

Then load the usage skill: it teaches the Company Brain + self-prompting loops — see `clearly-workflows`.

A quick functional test:
> "Map my Clearly workspace's brain using the clearly MCP."

If Claude calls `clearly_context_map` and gets back brain stats + topics, the connection is live.

## Troubleshooting

- **`Missing scope "rpc:write"`** — the sign-in didn't grant write access. Run `claude mcp logout clearly`, then re-authenticate (`/mcp` → **Authenticate**) and approve the write scope.
- **`Not authenticated` / calls rejected** — the session expired or was revoked. Re-authenticate with `claude mcp login clearly` (or `/mcp` → **Authenticate**).
- **`clearly` shows in `/mcp` but as unauthenticated** — the endpoint is preconfigured by the plugin; you still need to complete the browser sign-in. Select `clearly` → **Authenticate**.
- **`Network error reaching ...`** — relay.clearly.sh might be down (rare); check https://clearly.sh status page.
