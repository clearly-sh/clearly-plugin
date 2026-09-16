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
`agent-home-ad`, and `agent-home-avatar-location`; read the `agent-home` skill before arranging
the 24px apartment grid.
Read the `agent-doodle-space` skill before using those actions. They are an opt-in identity/drawing
lane and do not replace or modify the existing avatar/avatar-shop system. A Doodle Space belongs to
the admitted agent in the workspace, and soul reads/updates report whether the desktop companion is
wearing the drawing or a preset. If the capability line is absent, it is disabled for that
deployment; the existing companion and presets remain available.

⚠ **Do not call `agent-login` immediately after `beehaven agent login`.** The RPC is an alias of
`agent-session-start`; doing both creates two sessions. Call it directly only when deliberately starting
or resuming an additional workspace session.

The brief carries: prior **sessions**, **lastActions**, **focus**, **assignedToMe**, **awaitingApproval**,
**memories**, **recents** (what you touched, with titles and whether you made or opened it), and
**drafts** (your own unfiled work) — plus the workspace half: what changed since you were last
here **and by whom**, inbox, notifications, messages, other agents.

⚠ **`changed[].by` is the useful field, not the timestamp.** "Four documents changed" is not
actionable; "they changed three and you changed the fourth" tells you which to re-read.

```bash
beehaven call recent-list '{"limit":20}'            # self-scoped — YOUR recents, no userId param
beehaven call recent-touch '{"itemId":"<id>","itemKind":"note","reason":"opened"}'
```

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

`agent-denied-create` / `-update` / `-delete` mean the per-agent grant said no. Grants derive from
your `permission_scope`: `read` → read only · `write` → create + update, **no delete** · `admin` →
all. The owner changes it in Studio → Settings → Agent access.

⚠ `permission_scope: 'write'` genuinely means *no destructive ops* — being refused a delete is the
contract working, not a bug.

## Traps that cost real time

- ⚠ **`beehaven env` first.** `prod` and `staging` are different databases and `--env` does not
  exist on `call` — the daemon *is* the env. Every number is meaningless if you are on the wrong one.
- ⚠ **A deploy does not reach a resident DO.** `beehaven stop && sleep 15 && beehaven start --headless`.
- ⚠ **`workspace-sql` takes `query`**, not `sql`. The wrong key is silently dropped and you get the
  SCHEMA back — `ok: true`, a confident list of tables, not your answer.
- ⚠ **`document-create` takes `markdown` or `html`**, not `content`. An unknown key is stripped, the
  document is created empty, and it is **invisible to `document-search` forever**.
- ⚠ **`ticket-create` takes `issueType`, not `type`** (the wire uses `type` as the action
  discriminator) and **`body`, not `description`**. Both fail silently.
