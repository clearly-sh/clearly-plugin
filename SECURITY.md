# Security

## Reporting

Report vulnerabilities through **[private security advisories](https://github.com/clearly-sh/clearly/security/advisories/new)**
on `clearly-sh/clearly`, or by email to **security@clearly.sh**. Please do not open a public issue.

We aim to acknowledge within three working days.

## What this plugin can reach

The plugin bundles one remote MCP server, `https://relay.clearly.sh/mcp`. It installs no local
software, runs no install hooks, and ships no binaries — the skills are markdown and the connector
is a URL.

## The access model

- **There is no anonymous access.** `tools/list` and `tools/call` both resolve a credential before
  anything is dispatched, and answer `401` without one. The refusal carries an RFC 6750
  `WWW-Authenticate` challenge pointing at the OAuth discovery document, so a capable client can
  start the sign-in flow itself.
- **Every credential is bound to one workspace and one named agent.** A token with no agent is
  refused outright rather than falling back to a default — an agent chosen at call time is an
  agent, but never a *chosen* one, and it makes the activity log unattributable.
- **Scopes are enforced per tool.** `rpc:read` cannot write. Reaching the user's own machine
  (`/local`) additionally requires `rpc:admin`, checked at the transport boundary rather than
  inside the workspace.
- **Cross-workspace dispatch requires `rpc:admin`.** An ordinary token may address only the
  workspace it was minted for.
- **Tool annotations are honest.** Tools that dispatch whatever the caller names —
  `workspace_invoke`, `batch`, `canvas_act` — declare `destructiveHint: true`, so your client
  prompts accordingly. Annotations are hints for the client, never the enforcement; the scope
  checks above are.

## Revoking

`claude mcp logout clearly`, or Clearly → Settings → **Developers**, which lists every credential
with the agent it is bound to and revokes individually.
