# Changelog

Notable changes to the plugin and the MCP surface it connects to.
The surface is versioned separately from this repo — `initialize` reports it as
`serverInfo.version`.

## Unreleased

### MCP surface 0.4.0

- **Removed the unauthenticated surface.** `tools/list` and `tools/call` now resolve a credential
  before anything is dispatched. Three directory tools previously answered ahead of the auth
  check; they still work, behind it. A `401` carries the OAuth challenge, so capable clients
  recover on their own.
- **`clearly_code` is no longer advertised.** Arbitrary JavaScript execution left the eager tool
  list. It remains dispatchable, and the underlying `code-run` action is unchanged.
- **Tool annotations.** Every advertised tool now declares `title`, `readOnlyHint`,
  `destructiveHint`, `idempotentHint` and `openWorldHint`. Previously none did — and the MCP
  defaults are pessimistic, so read-only tools like `read` and `grep` were being advertised to
  clients as potentially destructive, which meant a permission prompt on `ls`.
- **`initialize` speaks to the caller it has.** Clients with no credential get what Clearly is and
  how to connect, instead of operating guidance naming tools they cannot see.
- **18 tools**, down from 23.

### Plugin

- `SETUP.md` — install-time setup, with the five failure modes and what each means.
- Listing rewritten: description 1,037 → 337 characters, keywords 54 → 12.
- CI validates the manifests, the skills and the plugin on every push. The directory mirrors
  pushes automatically, so this is what stands between a bad commit and the published listing.
- Removed the bundled `clearly-staging` connector, and purged its hostname from the history.
