# Setup — connect the Clearly workspace

The plugin ships the MCP server pre-configured in `.mcp.json`, pointing at
`https://relay.clearly.sh/mcp`. There is no token to mint, export or paste: authentication is
OAuth, and the browser does it.

**Do this once per machine.**

## 1. Authenticate

Run `/mcp`, select **clearly**, choose **Authenticate**. A browser window opens; sign in and
approve. It closes itself.

From a shell instead: `claude mcp login clearly`.

The consent screen asks for two things, and both matter:

- **Which workspace.** A client stores one credential per server entry, so one entry holds one
  workspace. To work in two, add a second entry at `https://relay.clearly.sh/mcp/w/<workspaceId>`.
- **Which agent.** Every credential belongs to an agent — that is what makes the activity log say
  *who* did something rather than just *what happened*. The default is offered; picking
  deliberately is better.

Grant **`rpc:write`** unless you only want reads. Without it the workspace is read-only and every
write is refused with a message naming the missing scope.

## 2. Check it worked

`/mcp` should list **clearly** as **Authenticated** with **18 tools**.

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

For anything beyond this — verifying the connection in depth, working in more than one workspace,
or reconnecting after a revocation — run **`/clearly:clearly-init`**, which is the same job with
the checks written out.

## What you get

`clearly_bash`, `clearly_grep`, `clearly_glob`, `clearly_read`, `clearly_edit`, `clearly_write`,
`clearly_delete` address the workspace as a **filesystem**: folders are projects, documents are
`.md` files, canvases are `.scene.json`. `clearly_workspace_catalog` and
`clearly_workspace_invoke` reach roughly a thousand further actions by name — boards, tickets,
sheets, decks. `clearly_canvas_perceive` / `_act` drive the spatial canvas.

Start with `clearly_guide`. It is one call and it explains the rest.
