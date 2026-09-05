---
name: clearly-docs
description: >-
  Read, search, edit and version a company's documents in a Clearly workspace
  over MCP — the workspace mounts as a FILESYSTEM, every change carries a commit
  message and is revertable, and `document-status` tells you what the HUMAN
  changed since you last looked so you re-read instead of answering from a stale
  body. Use whenever the answer depends on what the company has written down, or
  when you are about to write something down for it. Triggers: "what do our docs
  say", "find the doc about X", "update the spec", "write this up", "add it to
  the docs", "has this changed", "what did they edit", "search the wiki",
  "company knowledge", "our documentation", "the PRD", "the runbook".
---

> **Tool names below are written UNPREFIXED** (`clearly_bash`). Your runtime may expose them
> with a server prefix — e.g. `mcp__plugin_clearly_clearly__clearly_bash`. **Match by suffix,
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

**`clearly_bash` is a real shell over `~`** — `ls`, `cd`, `cat`, `grep`, `find`, `tree`, `head`,
`tail`, `wc`, `sort`, `jq`, pipes and redirects. The working directory persists between calls.

```
clearly_bash  ls ~
clearly_bash  grep -ril pricing ~ | head -5
clearly_bash  cat "~/Prepress/CLR-42 Pricing.md"
```

⚠ **A pattern containing `|`, `(`, `$`, `>` or a quote goes to `clearly_grep`, not to the
shell.** The shell parses your string before grep sees it, so those become pipes, groups and
redirects and match nothing — which looks exactly like a workspace that has nothing in it.

**Structural questions go to SQL**, because they have no keyword to search for:

```
clearly_bash  sql SELECT title, updated_at FROM notes WHERE project_id IS NULL LIMIT 20
```

Read-only, one statement, credential columns redacted.

## ⚠⚠ Read before you write, and check what THEY changed

This is the part that makes documentation stay true, and it is the part agents skip.

Every edit **you** make returns a diff. The human's edits return nothing — so without asking,
you know exactly what you did and nothing about what they did, and you will answer from a body
you read an hour ago as though it were still on screen.

- **`document-status`** is `git status` for their documents: which changed, and **`by: you` vs
  `by: them`**. That distinction is the whole point — "four documents changed" is not
  actionable; "you changed three and they changed the fourth" tells you exactly which one to
  re-read.
- **`document-diff <doc>`** is the follow-up: the lines added and removed.

Run `document-status` when you resume a conversation, and whenever they say something implying
they have been working — *"I rewrote that"*, *"take another look"*.

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
- Several changes to one document is **one `multi_edit`**, not three edits. Three edits is three
  versions, three reindexes and three redraws for one change — and if the third is refused the
  document is left half-done with nothing on screen saying so.
- Overwriting an existing document? Pass `expected_content` (the body as you last read it). If
  it moved underneath you the write is refused and you get a diff. Their version wins; redo your
  change on top of it.

**Every mutation takes a `message`** — a commit message, imperative, a few words: *"Cut the
three-credit line"*, *"Add the 12-hour window"*. Not *"updated the note"*, which says nothing.
It is the only part of your work that outlives the conversation in words rather than bytes.

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
