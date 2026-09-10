---
name: clearly-workspace
description: Understand and audit a Clearly workspace from the terminal — what it holds (documents, projects, boards, tickets, thoughts, files, agents), who authored what, and which known data defects are present. Run `survey.mjs` for the whole picture in one command. TRIGGER when the user asks "what is in this workspace", "how big is this workspace", "audit / survey / check the workspace", "what have my agents made", "is anything broken in here", "who created these", or before any cleanup, migration or backfill — the survey is what tells you whether a repair is needed and whether it worked. NOT for editing documents (use `document-*`) or drawing on a canvas (use clearly-canvas).
---

# clearly-workspace — know what you are standing in

## ⚠ FIRST: sign in as an agent

Every `beehaven` verb except a short bootstrap list is refused without an agent identity.

```bash
beehaven agent login <name>      # mints it if it does not exist
beehaven status                  # daemon + relay + which env
```

⚠ **Check `beehaven env` before reading anything.** `prod` and `staging` are different
databases, and every number below is meaningless if you are on the one you did not mean.

## The whole workspace in one command

```bash
node ~/.claude/skills/clearly-workspace/survey.mjs          # human-readable
node ~/.claude/skills/clearly-workspace/survey.mjs --json   # for further processing
```

It prints the workspace name, its key prefix, counts of every content kind, a
**needs-attention** block, and documents-by-author.

⚠⚠ **PREFER THIS OVER HAND-WRITTEN SQL.** The same survey by hand is ~15 `workspace-sql`
round trips, and three of the coercions are traps that fail *silently*:

- **SQLite folder booleans are TEXT.** `is_archived != 1` misses every row storing the
  string `'true'`, so "live projects" quietly includes archived ones.
- **Archived rows still satisfy most defect queries.** Counting body-less documents without
  a live filter reports problems that were already resolved by archiving.
- **An unreadable table and an empty table both return 0** unless you check for the error.
  The script prints `?` plus the reason instead.

Every one of those produced a wrong number on this workspace before the script existed.

## What the needs-attention flags mean

| flag | what it is | fix |
|---|---|---|
| documents with no body | no `note-content` row → **invisible to `document-search` forever** | archive them, or seed a body; the create path is fixed forward |
| boards with no project | reachable from nothing in the UI — a board is found through its project | file them, or archive if empty |
| many 'active' agent sessions | sessions are reaped after 6h idle, so a high count means the sweep is not running | call `agent-session-list` once (it sweeps on read) |

## Reading it deeper

```bash
# who authored what — `agent:<id>` is an AGENT principal, not a person
beehaven call workspace-sql '{"query":"SELECT COALESCE(created_by,'\''(unstamped)'\'') AS who, COUNT(*) AS n FROM notes GROUP BY who ORDER BY n DESC"}'

# what a specific agent has been doing
beehaven call recent-list '{"limit":20}'          # self-scoped: YOUR recents
beehaven call agent-brief '{}'                    # your session brief, incl. recents + unfiled drafts
```

⚠ **`(unstamped)` is the ordinary case, not a defect.** `created_by` was added long after most
rows, and an unstamped row is treated as legacy-visible by design.

⚠ **`agent:<id>` in `created_by` is an AGENT.** Its work is visible to its owner and invisible
to a SIBLING agent unless filed into a shared project — filing IS the sharing mechanism.

## Repairs — all operator verbs, all `dryRun` by default

```bash
beehaven call keys-repair-prefix '{}'        # workspace renamed but keys still say the old prefix
beehaven call boards-repair-authors '{}'     # boards authored by a workspace id instead of a person
beehaven call notes-backfill-keys '{}'       # documents with no CLR-42 style key
beehaven call thought-vacuum '{}'            # thought vectors whose map is gone
```

⚠⚠ **EVERY ONE IS BOUNDED AND REPORTS `remaining` — LOOP UNTIL IT READS 0.** A single call is
not a finished job. `keys-repair-prefix` once flipped a counter after re-keying only 500 of
1,219 artifacts and then reported "nothing to do" while 719 rows were stranded. Re-run the
survey afterwards; that is what tells you the repair actually landed.
