# Clearly for Claude Code

[![validate](https://github.com/clearly-sh/clearly-plugin/actions/workflows/validate.yml/badge.svg)](https://github.com/clearly-sh/clearly-plugin/actions/workflows/validate.yml)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![MCP](https://img.shields.io/badge/MCP-2025--06--18-6E56CF.svg)](https://clearly.sh/docs/mcp)

Your workspace — documents, projects, tickets and a spatial canvas — addressed by your agent as a
filesystem. Every change is versioned and revertable, and `document-status` tells the agent what
**the human** changed since it last looked, so it re-reads instead of answering from a stale body.

<img src="./docs/what-it-is.svg" alt="Your agent connects over MCP to a Clearly workspace: documents, projects and tickets addressed as a filesystem, plus a spatial canvas. Your team sees the same workspace live." width="880">

## Install

```
/plugin marketplace add clearly-sh/clearly-plugin
/plugin install clearly@clearly
/clearly:clearly-init
```

Authentication is **OAuth** — run `/mcp`, pick `clearly`, choose **Authenticate**. The browser
does the rest; there is no token to mint or paste. You'll be asked **which workspace** and **which
agent**, because every credential belongs to a named agent — that is what makes the activity log
say *who* did something rather than only *what happened*.

Grant `rpc:write` unless you want the workspace read-only.

## Any other MCP client

The server is hosted. An OAuth-capable client needs only the endpoint:

```json
{ "mcpServers": { "clearly": { "url": "https://relay.clearly.sh/mcp" } } }
```

Working in more than one workspace? A client stores one credential per server entry, so add a
second at `https://relay.clearly.sh/mcp/w/<workspaceId>`.

> **There is no anonymous access.** `tools/list` and `tools/call` both require a credential and
> answer `401` without one — carrying a `WWW-Authenticate` challenge, so a capable client starts
> the sign-in flow by itself. See [SECURITY.md](./SECURITY.md).

## The tool surface — 18

| | |
|---|---|
| **Shell** | `bash` `grep` `glob` `read` `edit` `write` `delete` — folders are projects, documents are `.md`, canvases are `.scene.json` |
| **Dispatch** | `workspace_catalog` `workspace_invoke` `describe_action` `batch` — roughly a thousand further actions by name |
| **Canvas** | `canvas_perceive` `canvas_act` `canvas_catalog` |
| **Semantic** | `context_search` `thought_search` `thought_record` |
| **Start here** | `guide` — one call, explains the rest |

Names are prefixed `clearly_`. Full reference: [`plugin/README.md`](./plugin/README.md) ·
[setup](./plugin/SETUP.md) · [docs](https://clearly.sh/docs/mcp).

## The 14 skills

Each is a slash command the moment the plugin installs.

**Working in the workspace** — `clearly-init` (connect and verify) · `clearly-workspace` ·
`clearly-docs` · `clearly-workflows` (search → write back, so context compounds) · `clearly-agent`

**On the canvas** — `clearly-canvas` (the operating manual) · `pair-on-canvas` (the board as
mission control for a coding task) · `ship-review` (land a change as a spatial change-map the
human inks back) · `visualize` · `codebase-map`

**Design craft** — `design-craft` (grid construction, modular type scale, colour systems, optical
correction, a verify-before-done pass) · `brand-identity` (brief → mark → lockups → palette →
spec board) · `layout-systems` (poster, deck, landing page, editorial, social — with the real
numbers per format) · `sticker-pack`

## Repositories

| | |
|---|---|
| **clearly-sh/clearly-plugin** | this one — the plugin, its skills, and the marketplace manifest |
| [clearly-sh/clearly](https://github.com/clearly-sh/clearly) | issues, release notes and security reports for the MCP server and the `beehaven` CLI |

## License

MIT © [Clearly](https://clearly.sh)
