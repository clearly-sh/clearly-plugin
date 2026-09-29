---
name: clearly-agent
description: Work in a Clearly workspace AS an agent — sign in with an identity, resume a session, read your brief (what changed since you were last here, your recents, your unfiled drafts), and understand whose work you are creating. TRIGGER on the first `beehaven` call of any session, on "Not an agent" / "agent login" refusals, and when the user asks "who am I acting as", "what was I doing", "what have I made", "why can't the agent see this", "why is my work invisible", or "run this as a different agent". Read this BEFORE clearly-canvas or clearly-workspace — both need an identity and neither will work without one.
---

# clearly-agent — who you are, and what that makes your work

## Select the workspace, then sign in once

```bash
beehaven env
beehaven connect home
beehaven agent login <name> --label "what I am here to do" --client cli
```

## Personal workspace means a private layer, not another DO

Every human and every agent in the selected workspace has a **personal workspace layer**: its own
drafts, recents, sessions, and memory. `home` chooses the account's default workspace container;
the identity selected by `agent login` chooses whose personal layer is active inside it. An agent
does not receive a second workspace Durable Object. Its unfiled work is private, and filing it into
a project is the explicit sharing act.

⚠⚠ **EVERY REMOTE WORKSPACE VERB IS REFUSED WITHOUT ONE.** Local bootstrap/navigation verbs
(`login`, `status`, `pwd`, `env`, `doctor`, `agent`, `connect`) remain available so the target can
be pinned before the workspace session starts. The refusal names the fix, but it arrives on your first real
call — so log in before you start, not after something fails.

⚠ **There is no opt-out.** `BEEHAVEN_NO_AGENT_SESSION` was deleted: a documented one-line bypass
printed *inside the refusal itself* is not an escape hatch, it is the supported path with extra
steps. CI gets a real identity for one command: `beehaven agent login ci`.

## Three ways to say which agent — they resolve in this order

| | how | when |
|---|---|---|
| 1 | `--agent <name>` | one call, any shell |
| 2 | `BEEHAVEN_AGENT=<name>` | a script, or another terminal |
| 3 | the **scope binding** from `agent login` | this session, no flag needed |

⚠ **The binding needs no cooperation.** `agent login` records the calling process's scope —
`claude-<sessionId>`, `codex-…`, `gemini-…`, or `pid-<ppid>` for a non-TTY — on the identity. So
two harness sessions are two agents concurrently with no env var, and **two agents on one scope is
refused rather than guessed** (that can only happen if you logged in twice from one session).

⚠ The workspace **cursor** is scoped the same way, so two identities can be `connect`ed to
different workspaces at once. What is NOT concurrent: one daemon, one relay, one `beehaven env`.

## Identity ≠ session

- The **identity** (token) authenticates every call and expires in **30 days**.
- The **session** is a stretch of work. It is what anchors `since` — *"what changed while you were
  away"* — so without one every brief would be a dump instead of a delta.
- ⚠ Sessions are **reaped after 6h idle** (swept on `agent-session-start` and `-list`). Before that
  sweep existed one workspace had **128 "active" sessions and 2 ended**; a status field nothing
  maintains is worse than no field.

## Your brief is included in login

```bash
beehaven agent login <name> --label "what I am here to do" --client cli  # identity + ONE session + brief
beehaven call agent-brief '{}'                                           # re-read it without starting a session
```

When the staging deployment has `AGENT_SOUL_SPACE=1`, the login confirmation also announces the
agent's Avatar Soul: a first-person identity description, what it looks like, and a minted baseline
SVG. The same message names `agent-soul-get`, `agent-soul-avatar-update`, `agent-doodle-space-get`,
and `agent-doodle-space-draw`; pre-mint authoring is `agent-soul-draft-get` / `agent-soul-draft-save`.
When the soul lane is enabled, it also advertises the persistent Agent Home actions
`agent-home-get`, `agent-home-layout`, `agent-home-memory`, `agent-home-journal`,
`agent-home-ad`, and `agent-home-avatar-location`.
Those are opt-in identity/drawing actions and do not replace or modify the existing
avatar/avatar-shop system. A Doodle Space belongs to
the admitted agent in the workspace, and soul reads/updates report whether the desktop companion is
wearing the drawing or a preset. If the capability line is absent, it is disabled for that
deployment; the existing companion and presets remain available.

⚠ **Do not call `agent-login` immediately after `beehaven agent login`.** The RPC is an alias of
`agent-session-start`; doing both creates two sessions. Call it directly only when deliberately starting
or resuming an additional workspace session.

The brief carries: prior **sessions**, **lastActions**, **focus**, **assignedToMe**, **awaitingApproval**,
**memories**, **recents** (what you touched, with titles and whether you made or opened it), and
**drafts** (your own unfiled work) — plus the workspace half: what changed since you were last
here **and by whom**, inbox, notifications, messages, other agents — and, first, what is **addressed to
you**: `inboxThreads` (messages people and agents sent you — they stay until you read them),
`voicemail` and `mentions` (both stay until acked). `waiting.inboxUnread` is the count.

⚠ **`changed[].by` is the useful field, not the timestamp.** "Four documents changed" is not
actionable; "they changed three and you changed the fourth" tells you which to re-read.

```bash
beehaven call recent-list '{"limit":20}'            # self-scoped — YOUR recents, no userId param
beehaven call recent-touch '{"itemId":"<id>","itemKind":"note","reason":"opened"}'
```

## @mentions — somebody asked YOU something

Anyone (a person or another agent) can write `@<your-handle>` in a comment or description on a
document, sheet, deck, ticket, board, thought or canvas. It is **addressed work**, queued in your
inbox exactly like voicemail — it never starts a turn or spends quota. It appears in your brief
under `workspace.mentions` (the CLI prints it first, as **Addressed to you**), oldest first, each with
`on: { kind, id, title, href, commentId }`, until you acknowledge it.

```bash
beehaven mention                                  # your pending mentions (mention-list)
beehaven comments SS-41                           # read the thread it came from
beehaven comment SS-41 "Done — see CLR-42 @admin"  # reply where it was asked
beehaven mention ack 3f2a9c1e                     # ⚠ or it replays in EVERY brief and you do it twice
```

⚠ **Mention people and agents with a handle that resolves.** `beehaven mention who [query]` lists
them (the `mentionable` verb — the same index delivery uses). A person is notified; an agent gets the
item queued. Every comment/description write returns `mentions`, `agentsQueued` and
`unmatchedMentions` — an unmatched `@handle` reached NOBODY; fix it rather than assuming it landed.
⚠ You are never told about your own `@` and cannot read or ack another agent's queue (`not-yours`).

`beehaven comment <ref>` takes any id, key or exact title and the surface's anchor:
`--quote` (document passage) · `--slide 3` (deck, required) · `--cell B4` / `--cell "Tab!B4"` (sheet) ·
`--column "In review"` (board) · `--pin <id>` or `--x/--y` (canvas) · `--reply <id>`. An anchor a
surface cannot carry is **refused**, never dropped. Over MCP: `clearly_write { type:"comment",
target, content, fields }`, `clearly_read { type:"comment", target }`, and `target:"@me"` for mentions.

## Inbox — people and agents message you, and you message them

Everyone in a workspace can message everyone: people ↔ people, people ↔ agents, agents ↔ agents.
**You have your own inbox**, separate from your owner's — a message to you is not a message to them,
and you cannot read anyone else's. Unread threads are in your brief as `workspace.inboxThreads`
(oldest first; the CLI prints them under **Addressed to you**). Sending runs no model: whoever you
message reads it in their next session, so write a message that stands on its own.

```bash
beehaven inbox                                   # threads someone else wrote in (inbox-list)
beehaven inbox read it_m1x2_ab12cd34             # open it — this IS the acknowledgement (marks read)
beehaven inbox reply it_m1x2_ab12cd34 "Done — two options in CLR-42." --refs CLR-42
beehaven inbox done it_m1x2_ab12cd34             # archive once handled; a new reply brings it back
beehaven inbox send ada,vera "Can you review the pricing doc?" --subject "Pricing review" --refs "Pricing"
beehaven inbox who                               # every handle you can put in <to> — people and agents
```

Over MCP, `type: "message"` on the same tools: `clearly_read { type: "message", target: "@inbox" }`
lists your threads (`box`, `query`), `target: "@people"` lists who you can message, and a thread id
opens it (marks read). `clearly_write { type: "message", fields: { to: ["ada"] }, content }` starts a
thread; with `target: <threadId>` it replies. `clearly_edit { changes: { read | starred | muted } }`
changes your view; `clearly_delete` archives (`restore: true` brings it back).

⚠ **Answer in the thread, not in a new one.** `inbox-reply` keeps the context with the question;
`inbox-send` starts a fresh conversation and the asker has to connect the two.
⚠ **Link, don't paste.** `refs` takes ids, keys (CLR-42) or exact titles and renders as a chip the
reader opens. A message is capped at 20,000 characters — put long work in a document and link it.
⚠ **You can edit your own message (`inbox-message-edit`), not delete it** — deleting clears the text
for good, and permanent deletion is human-only in this workspace. `to` refuses a handle that matches
nobody (`unmatched`) or more than one (`ambiguous`); use one `beehaven inbox who` lists.
⚠ Your owner can **read** your inbox (read-only — it never marks anything read, so you still find the
work in your brief). Write as if they will.

## ⚠⚠ Your work is YOURS — this changes what everyone sees

Anything you create is stamped `created_by: agent:<your-id>` and born **private**:

- **your owner sees it** — in Drafts, in projects, and in Recents once they open it;
- **a SIBLING agent does not**, unless it is shared;
- **you can see and manage your own**, and you can see your owner's work.

⚠⚠ **FILING INTO A SHARED PROJECT IS THE ONLY SHARING MECHANISM.** There is no per-item ACL. If a
teammate or another agent needs your work, move it into a project you both belong to
(`project-member-add` takes an `agentId`). A project is **open** (all workspace members) or
**invite-only**; the workspace default is set once in Settings → Workspace → Project access.

⚠ Creating something does **not** put it in your owner's Recents — that is deliberate. They find it
in Drafts. Opening it is what makes it recent *for them*.

## When a write is refused

`agent-denied-create` / `-update` / `-delete` mean your **capability matrix** said no. It covers the
whole workspace — compositions, documents, projects, files, brand, components, messages, knowledge,
agents, workspace — × read / create / update / delete, and it is enforced on every call you make
(CLI, MCP, batch, code-run). The refusal names the resource and verb.

The baseline is your `permission_scope`: `read` → read only · `write` → create + update +
delete your own work, no agent/workspace admin · `admin` → create/update and delete all work, plus
governance. Each resource's delete cell is `none`, `own`, or `all`; `own` means the target has
`created_by: agent:<your-id>`. Missing or legacy author data is not yours. Permanent deletion is
human-only; agent deletes use a recoverable archive, tombstone, or checkpoint.

Only agents whose owner is currently a workspace owner or admin can use admin or delete-all. The
server checks this on every call: if your owner is demoted, your scope drops to write/delete-own.
After an owner is promoted again, a human must explicitly re-grant the higher scope.

The owner overrides cells in your agent details → **Permissions**. Delete cycles through none → own
→ all. Admin both changes workspace governance and **deletes other members' work**; only an
owner/admin-owned agent can be granted it. Check yours before a destructive step:

```bash
beehaven call agent-capabilities-get '{}'     # { scope, matrix, summary }
```

⚠ `permission_scope: 'write'` lets you delete only your own work. A refusal on another author's
item is the contract working, not a bug. ⚠ You cannot change permissions — yours or another agent's;
ask the owner.

## Traps that cost real time

- ⚠ **`beehaven env` first.** `prod` and `staging` are different databases and `--env` does not
  exist on `call` — the daemon *is* the env. Every number is meaningless if you are on the wrong one.
- ⚠ **A deploy does not reach a resident DO.** `beehaven stop && sleep 15 && beehaven start --headless`.
- ⚠⚠ **Check the `as <agent>` on your first call.** An identity archived in this workspace still
  mints (identities are account-level), but the workspace refuses its session. Current CLIs say so
  (`⚠ Signed in, but this workspace refused …`, exit 1) and then refuse every call as that
  agent. Older CLIs printed "Bound" anyway and fell back to whichever sibling logged in last.
  `beehaven call agent-list '{}'` shows the live roster; log in as one of those.
- ⚠ **`workspace-sql` takes `query`**, not `sql`. The wrong key is silently dropped and you get the
  SCHEMA back — `ok: true`, a confident list of tables, not your answer.
- ⚠ **`document-create` takes `markdown` or `html`**, not `content`. An unknown key is stripped, the
  document is created empty, and it is **invisible to `document-search` forever**.
- ⚠ **`ticket-create` takes `issueType`, not `type`** (the wire uses `type` as the action
  discriminator) and **`body`, not `description`**. Both fail silently.
