---
name: clearly-docs
description: >-
  Read, search, edit and recover a company's documents in a Clearly workspace.
  Use the seven-tool MCP filesystem for ordinary work; use the `beehaven` CLI
  only for document history, diffs, and restore. Load this whenever the answer
  depends on what the company has written down, or when you are about to write
  something down for it. Triggers: "what do our docs say", "find the doc about
  X", "update the spec", "write this up", "add it to the docs", "has this
  changed", "what did they edit", "search the wiki", "company knowledge", "our
  documentation", "the PRD", "the runbook".
---

> **Tool names below are written UNPREFIXED** (`clearly_read`). Your runtime may expose them
> with a server prefix — e.g. `mcp__plugin_clearly_clearly__clearly_read`. **Match by suffix,
> not by exact name**: a skill written against the bare name resolves to nothing otherwise, and
> the failure looks like "the tool doesn't exist" rather than "the name is decorated".
>
> **If no such tool is callable at all**, the Clearly MCP server isn't authorised in this
> session — these skills still LIST when it isn't, so you find out by firing a dead call.
> Authorise it (`/mcp`, or `claude mcp`).

## What this is

The workspace is a **filesystem**, not a chat surface with a search box.

```
~/                       every document
~/clearly.md             what is settled for the whole workspace
~/<Folder>/              one directory per project
~/<Folder>/clearly.md    what is settled for that folder
~/.archive/              put away — hidden, readable, read-only, still searched
```

Folders are projects. Documents are `.md` files named `<KEY> <Title>.md` — e.g.
`CLR-42 Pricing.md`. The key is an address: `cat ~/CLR-42.md` works from anywhere, and so does
the full name and the bare title.

## The loop

**Find it, then open it.** `clearly_glob` answers "what is it called", `clearly_grep` answers
"where is this mentioned", and `clearly_read` opens what either one returned.

```
clearly_glob  { pattern: "~/**/*.md" }
clearly_grep  { pattern: "pricing", limit: 5 }
clearly_read  { target: "~/Prepress/CLR-42 Pricing.md" }
```

⚠ **`clearly_grep` takes a REGEX, unparsed** — `|`, `(`, `$` and quotes mean what they mean in a
regular expression. Nothing shells out, so nothing eats them as syntax first.

⚠ **Archived documents are excluded from both.** When any matched, the result carries
`archivedHidden` saying how many — mention that rather than reporting a clean miss. Search the
archive by naming it: `clearly_grep { pattern: …, path: "~/.archive" }`.

**Structural questions — a date range, a null body, counts — have no keyword to search for**, so
they go to SQL over the workspace's own tables. That is a CLI job, not an MCP tool:

```
beehaven call bash '{"command":"sql SELECT title, updated_at FROM notes WHERE project_id IS NULL LIMIT 20"}'
```

Read-only, one statement, credential columns redacted.

## ⚠⚠ Read before you write, and check what changed

This is the part that makes documentation stay true, and it is the part agents skip.

The MCP read/edit/write tools cover the current body. Document history is a separate CLI surface:

- **`beehaven call document-status '{"limit":20}'`** lists recent changes. `mine: true` is the
  certain signal that the active agent made the latest change. `by: "unknown"` means the log has
  no author; it may be a browser edit or an older unstamped agent write, so do not claim a person
  made it.
- **`beehaven call document-diff '{"id":"<documentId>"}'`** follows up with added and removed
  lines. Pass a `versionId` from status to compare against a specific checkpoint.

Run status when you resume a conversation, and whenever they say something implying the document
has moved — *"I rewrote that"*, *"take another look"*.

⚠ **Their edit wins, always.** If a document now disagrees with something you concluded
earlier, your conclusion is the stale one. You are keeping their documents, not defending your
own record. Never quietly restore what they took out.

## Editing

**`clearly_edit` (find/replace) is the default. `clearly_write` REPLACES the whole document.**

To change one line of a 12,000-character document, `write` makes you reproduce all 12,000 — and
anything you fail to retype is gone with no error. It is also a lost-update machine: it writes
whatever you last read, overwriting anything the human changed in between.

- `clearly_edit` requires the `find` text to match **exactly once**. Ambiguity is REFUSED with a
  count, never guessed — an agent that edits the first of three matches has changed something
  nobody looked at.
- Several independent document edits can be sent in one tool call with `batch`, but each batch
  row is still one exact `{ target, find, replace, all? }` operation. There is no `multi_edit`
  field and the batch is not transactional; inspect the per-item results and retry only failures.
- `clearly_write` does not accept `expected_content` or a commit-message field. If you must replace
  a whole existing document, re-read it immediately before writing and verify the returned body.
  Prefer `clearly_edit` whenever a precise passage change can express the job.

## `clearly.md` — what is settled

Not a document like the others. It holds what this place IS (the work, the constraints, the
vocabulary, the decisions that stopped moving) and **how this person wants to be worked with** —
length, tone, format, and what irritates them, which is said once in passing and worth more than
anything they praise.

Fold a conclusion into it once it has stopped moving. Reach for `edit`, never `write`.

## Report what MOVED

*"You added a paragraph about the 12-hour window to Pricing and removed the line about three
credits"* is a report. *"I've updated the note"* is not — it costs a turn and says nothing they
could not have assumed.

## What not to do

- **Do not tidy unasked.** A document that looks redundant or superseded is still theirs. If two
  say the same thing, say so and let them choose.
- **`delete` archives, it does not erase** — the document moves to `~/.archive/`, stays readable
  and comes back. Report it as **archived**; "deleted" makes someone believe something is gone
  that is not.
- **Do not invent a media line.** `![caption](url)` renders a photo, audio or video by file
  extension. You cannot upload, so never write one pointing at a URL you guessed — it renders
  broken, which reads as their photo being lost. Move existing lines; never fabricate one.
