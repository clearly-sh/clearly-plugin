# clearly-plugin

The official [Claude Code](https://claude.com/claude-code) plugin for **Clearly** — your company brain over MCP.

It bundles a pre-configured MCP server (`relay.clearly.sh/mcp`) with two skills:
- **`clearly-init`** — setup: mint a token, set the env var, verify.
- **`clearly-workflows`** — usage: run the workspace as a company brain (search → write back → schedule).

## Install

```
/plugin marketplace add clearly-sh/clearly-plugin
/plugin install clearly@clearly
/clearly:init
```

You'll need a token — mint one at <https://clearly.sh/settings> → **Developers**, then
`export CLEARLY_MCP_TOKEN="ck_mcp_..."` before launching Claude Code (the plugin's
`.mcp.json` reads it).

## Don't use Claude Code?

The MCP server is hosted — any MCP client connects with just the endpoint + token, no plugin:

```json
{ "mcpServers": { "clearly": { "url": "https://relay.clearly.sh/mcp", "headers": { "Authorization": "Bearer ck_mcp_..." } } } }
```

See [`plugin/README.md`](./plugin/README.md) for the full tool surface and details.

## License

MIT © Clearly
