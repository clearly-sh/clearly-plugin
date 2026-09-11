# Setup — connect the Clearly workspace

The plugin ships the MCP server pre-configured in `.mcp.json`, pointing at
`https://relay.clearly.sh/mcp`. Browser OAuth is the default. An agent-bound bearer token is also
available for clients or automation that cannot complete OAuth; the `beehaven` installer writes it
without printing it.

**Do this once per machine.**

## 1. Authenticate

Run `/mcp`, select **clearly**, choose **Authenticate**. A browser window opens; sign in and
approve. It closes itself.

From a shell instead: `claude mcp login clearly`. In Codex, run `codex mcp login clearly` (or add
the server first with `codex mcp add clearly --url https://relay.clearly.sh/mcp`).

The consent screen asks for two things, and both matter:

- **Which workspace.** A client stores one credential per server entry, so one entry holds one
  workspace. To work in two, add a second entry at `https://relay.clearly.sh/mcp/w/<workspaceId>`.
- **Which agent.** Every credential belongs to an agent — that is what makes the activity log say
  *who* did something rather than just *what happened*. The default is offered; picking
  deliberately is better.

Grant **`rpc:write`** unless you only want reads. Without it the workspace is read-only and every
write is refused with a message naming the missing scope.

## 2. Check it worked

`/mcp` should list **clearly** as **Authenticated** with **7 tools**.

Then ask, in plain language:

> "List my Clearly workspace with the clearly MCP."

A working connection answers with real folders and documents. If it answers with an error, or with
nothing, go to the next section.

## 3. If something is wrong

| What you see | What it means |
|---|---|
| `Authorization required` | Not signed in, or the session expired. Re-run `/mcp` → **Authenticate**. |
| `Missing scope "rpc:write"` | You granted read only. `claude mcp logout clearly`, authenticate again, approve write. |
| `This credential is not bound to an agent` | A token minted before agent binding existed. Reconnect; OAuth will ask which agent. |
| Listed but **not** Authenticated | The plugin wires the endpoint; the browser sign-in is still yours to complete. |
| No `clearly_*` tool exists at all | The server is not authorised in this session. `/mcp`, or `claude mcp`. |

For an agent-bound Codex install instead of OAuth:

```bash
beehaven agent login <agent-name>
beehaven connect home
beehaven mcp install --client codex
```

Restart Codex after installation. The installer keeps the credential out of terminal output.
It reuses a live token only when it is bound to the active identity; use `--rotate` to replace one
deliberately.

For anything beyond this — verifying the connection in depth, working in more than one workspace,
or reconnecting after a revocation — run **`/clearly:clearly-init`**, which is the same job with
the checks written out.

## What you get

**Seven tools**, split by what they do rather than by what they act on:

| tool | does |
|---|---|
| `clearly_catalog` | optional type/operation-scoped schemas and capability discovery |
| `clearly_read` | read one artifact — document, canvas, sheet, deck, board, ticket or project |
| `clearly_write` | create one, or replace one whole |
| `clearly_edit` | change part of one |
| `clearly_delete` | archive (recoverable) or, with `permanent: true`, destroy |
| `clearly_grep` | search content by regex, across notes and code |
| `clearly_glob` | find things by name |

Everything is addressed by `target` — a path (`~/Q1/Plan.md`), a key (`CLR-42`) or an id. The path
extension names the type; pass `type` when it does not. Read, write, edit and delete each take a
uniform same-operation `batch`; catalog does not.

Read and delete directly. Before a type-specific write or edit, call
`clearly_catalog { type, operation }` for that one lazy machine-readable schema.

The workspace has roughly a thousand further actions — the spatial canvas, the Company Brain,
skills, scheduling. They are reached with the **`beehaven` CLI**, not as tools:
`beehaven call canvas-act '{"action":"canvas.add-text",…}'`, `beehaven actions` to list them.
That split is deliberate: a single tool that dispatches whatever the caller names spans safe and
unsafe operations at once, which is a connector-directory rejection criterion — so the generic
door is the shell, where Claude Code already lives.
