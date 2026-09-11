---
name: clearly-init
description: >-
  Connect a Clearly workspace to Claude Code or Codex and prove both the MCP and
  CLI paths work. Prefer browser OAuth for remote HTTP clients; when an agent-bound
  bearer credential is required, mint and install it with the active `beehaven`
  identity. Use FIRST whenever a Clearly tool is refused for auth, returns nothing
  on a workspace that should have content, or the user has never connected.
  Triggers: "connect Clearly", "set up Clearly", "sign in to Clearly",
  "authenticate", "install the MCP", "add the MCP token", "it says unauthorized",
  "the tools are not showing up", "/mcp shows nothing", "which workspace am I in".
---

> **Tool names below are written UNPREFIXED** (`clearly_read`). Your runtime may
> expose them with a server prefix — e.g.
> `mcp__plugin_clearly_clearly-staging__clearly_read`. **Match by suffix, not by
> exact name**: a skill written against the bare name resolves to nothing otherwise, and
> the failure looks like "the tool doesn't exist" rather than "the name is decorated".
>
> **If no such tool is callable at all**, the Clearly MCP server isn't authorised in this
> session — note that these skills still LIST when it isn't, so you find out by firing a
> dead call. Authorise it (`/mcp`, or `claude mcp`), or if you have a shell, use the
> `beehaven` CLI and its own `clearly-canvas` skill instead.

# `/clearly:init` — connect a Clearly workspace to Claude Code or Codex

Run this once per machine. The plugin's `.mcp.json` points at
`https://relay.clearly.sh/mcp`; complete authentication and verify the connection before doing
workspace work.

## Steps

### 1. Authenticate (OAuth — browser sign-in)

The plugin already wires the MCP server. Prefer browser OAuth:

- **In Claude Code (recommended)**: run `/mcp`, select `clearly`, and choose **Authenticate**. A browser window opens for sign-in; approve and it closes itself. No token.
- **From the shell**: `claude mcp login clearly` — same browser sign-in flow.
- **In Codex**: `codex mcp login clearly`. If the server was added outside the plugin first, run
  `codex mcp add clearly --url https://relay.clearly.sh/mcp`, then log in.

The sign-in grants scoped access (`rpc:read` for search and read; add `rpc:write` to let the
agent write documents and create boards or tickets). Sign out or revoke with the client's MCP
logout command, or from Settings → **Developers** in the app.

### Agent-bound token path (CLI and automation)

Use this when the client cannot complete OAuth or when the credential must act as a specific agent
identity. Sign in and select the identity first:

```bash
beehaven agent login <agent-name>
beehaven connect home
beehaven agent whoami
beehaven mcp install --client codex
```

The installer writes through the client's own config command and never prints the token. Restart
the client afterward. A static token normally carries `rpc:read` and `rpc:write`; `agent:ask` is
OAuth-only and `rpc:admin` is reserved for configured platform admins. Never paste a bearer token
into a document, ticket, canvas, log, or chat response.

> **Working in more than one workspace?** A client stores one credential per server entry, so two
> workspaces behind a single entry collide. Use `https://relay.clearly.sh/mcp/w/<workspaceId>` as a
> second entry — see [the MCP docs](https://clearly.sh/docs/mcp).

### 2. Verify

Run `/mcp` in Claude Code, or `codex mcp list` in Codex. You should see `clearly` authenticated
with **7 tools**:

**Seven MCP tools, split by what they DO rather than by what they act on.** The four CRUD tools
cover every artifact type — document, canvas, sheet, deck, board, ticket, project — so the tool fixes
whether it reads or writes and `type` says what it touches.

- **`clearly_catalog`** — optional, lazy machine-readable schemas. Use `{ type, operation }` before a type-specific write/edit; omit both for the compact capability overview.
- **`clearly_read` / `clearly_write` / `clearly_edit` / `clearly_delete`** — open one, create or replace one, change part of one, archive one. Each takes a uniform same-operation `batch`.
- **`clearly_grep` / `clearly_glob`** — find by content, find by name. Both span notes and code.

Addressed by `target`: a path (`~/Q1/Plan.md`), a key (`CLR-42`) or an id. Folders are projects,
documents are `.md`, canvases are `.scene.json` — the extension names the type, and you pass `type`
when it does not.

**Everything else is the `beehaven` CLI**, by action name — the canvas, the Company Brain, skills,
scheduling, stickers, billing. `beehaven actions` lists them; `beehaven call <action> '<json>'` runs
one:

```bash
beehaven call context-search '{"query":"per-seat billing","scope":"org"}'
beehaven call canvas-act '{"compositionId":"c_…","batch":[…]}'
```

⚠ **That split is deliberate, not a gap.** A single tool that runs whatever action the caller names
spans safe and unsafe operations at once — a connector-directory rejection criterion, and one the
criteria explicitly refuse to let a description paper over. So the generic door is the shell, where
Claude Code already lives and where every call is attributed to your agent.

> ⚠ **Everything requires authentication.** There is no anonymous surface: as of 2026-09-11 both
> `tools/list` and `tools/call` resolve a credential first, and every credential is bound to an
> agent. A 401 carries an OAuth challenge, so a capable client can recover from it by itself —
> but a caller with no token sees no catalog, by design.

## Install the CLI — the other half of the surface

The seven MCP tools cover reading, writing and searching artifacts. **Everything else — the canvas,
the Company Brain, skills, stickers — is reached with `beehaven`**, and the skills in this plugin
assume it is on PATH. Claude Code has a shell, so this is one command:

```bash
curl -fsSL https://clearly.sh/install.sh | sh
beehaven login          # once, opens a browser
beehaven status         # daemon + relay, both should read UP
```

⚠ **`beehaven: command not found` is the failure to expect**, and it does not look like a missing
install — it looks like the skill being wrong. If a `beehaven call …` line fails that way, install
it rather than reaching for an MCP tool that does not exist.

⚠ **Do not restart the user's daemon to fix something.** It is theirs; `beehaven status` tells you
what is wrong and the message says which command fixes it.

Then load the usage skill: it teaches the Company Brain + self-prompting loops — see `clearly-workflows`.

A quick functional test:
> "Map my Clearly workspace's brain using the clearly MCP."

If Claude calls `clearly_catalog` and gets back the artifact types with their capabilities, the connection is live. It is a connection check and schema lookup, not a required preflight for ordinary reads/deletes.

## Troubleshooting

- **`Missing scope "rpc:write"`** — the sign-in didn't grant write access. Run `claude mcp logout clearly`, then re-authenticate (`/mcp` → **Authenticate**) and approve the write scope.
- **`Not authenticated` / calls rejected** — the session expired or was revoked. Re-authenticate with `claude mcp login clearly` (or `/mcp` → **Authenticate**).
- **`clearly` shows in `/mcp` but as unauthenticated** — the endpoint is preconfigured by the plugin; you still need to complete the browser sign-in. Select `clearly` → **Authenticate**.
- **`Network error reaching ...`** — relay.clearly.sh might be down (rare); check https://clearly.sh status page.
