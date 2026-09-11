# Changelog

Notable changes to the plugin and the MCP surface it connects to.
The surface is versioned separately from this repo — `initialize` reports it as
`serverInfo.version`.

## 0.8.0 — 2026-09-11

### MCP surface 1.0

- Replaced the former 18-tool surface with seven safety-classed tools: `clearly_catalog`,
  `clearly_read`, `clearly_write`, `clearly_edit`, `clearly_delete`, `clearly_grep`, and
  `clearly_glob`.
- The four CRUD tools now cover documents, canvases, sheets, decks, projects, boards and tickets
  through one consistent, bounded batch shape. Type- and operation-specific schemas are loaded
  lazily through `clearly_catalog`.
- Composition reads return the lossless scene plus its revision so a read can safely round-trip
  through whole-scene replacement. Archive state is reported consistently across artifact types.
- Fixed MCP lifecycle handling for `notifications/initialized` and agent attribution on document
  archive/removal checkpoints.

### Plugin

- Added native Codex plugin metadata and a Codex marketplace manifest while retaining Claude Code
  packaging.
- Refreshed and validated all 14 bundled skills. Canvas skills now use the live CLI verbs and
  require an authenticated agent; document guidance matches the seven-tool schemas.
- Added the supported agent-bound Codex token path: `beehaven agent login <name>` then
  `beehaven mcp install --client codex`.

## 0.4.0

### MCP surface

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
