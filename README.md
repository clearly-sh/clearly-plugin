# clearly-plugin

The official [Claude Code](https://claude.com/claude-code) plugin for **Clearly** — your company brain + spatial canvas over MCP.

It bundles a pre-configured MCP server (`relay.clearly.sh/mcp`, plus a `clearly-staging` connector) with eight skills:
- **`clearly-init`** — setup: sign in over OAuth (browser), verify `/mcp`.
- **`clearly-workflows`** — company-brain usage: search → write back → schedule.
- **`clearly-canvas`** — the canvas operating manual: perceive → create frames / text / shapes / vector arrows / diffs that persist headlessly.
- **`pair-on-canvas`** — the board as mission control for a coding task: read the human's pinned spec, do the repo work, report plan / status / diff / PR as cards.
- **`ship-review`** — land a code change as a spatial change-map; the human inks notes, you read them back and revise.
- **`visualize`** — turn any concept or answer into a diagram.
- **`codebase-map`** — walk a repo → a living architecture map.
- **`sticker-pack`** — an idea → a printable die-cut sticker sheet.

## Install

```
/plugin marketplace add clearly-sh/clearly-plugin
/plugin install clearly@clearly
/clearly:init
```

Auth is **OAuth** — run `/mcp`, pick `clearly`, choose **Authenticate**, and sign in through the browser. No token to mint or paste. Sign out / revoke anytime with `claude mcp logout clearly` (or Settings → **Developers** in the app).

## Don't use Claude Code?

The MCP server is hosted — any MCP client connects with just the endpoint (OAuth-capable clients prompt a browser sign-in), no plugin:

```json
{ "mcpServers": { "clearly": { "url": "https://relay.clearly.sh/mcp" } } }
```

See [`plugin/README.md`](./plugin/README.md) for the full tool surface, per-client setup, and scopes.

## License

MIT © Clearly
