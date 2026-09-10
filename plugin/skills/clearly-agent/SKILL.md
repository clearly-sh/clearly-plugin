---
name: clearly-agent
description: Work in a Clearly workspace AS an agent — sign in with an identity, resume a session, read your brief (what changed since you were last here, your recents, your unfiled drafts), and understand whose work you are creating. TRIGGER on the first `beehaven` call of any session, on "Not an agent" / "agent login" refusals, and when the user asks "who am I acting as", "what was I doing", "what have I made", "why can't the agent see this", "why is my work invisible", or "run this as a different agent". Read this BEFORE clearly-canvas or clearly-workspace — both need an identity and neither will work without one.
---

# clearly-agent — who you are, and what that makes your work

## Sign in first. Nothing else works.

```bash
beehaven agent login <name>     # mints the identity if it does not exist
```

⚠⚠ **EVERY VERB IS REFUSED WITHOUT ONE**, except a short bootstrap list (`login`, `status`,
`pwd`, `env`, `doctor`, `agent`). The refusal names the fix, but it arrives on your first real
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

## Read your brief — do this at the start of every session

```bash
beehaven call agent-login '{"label":"what I am here to do","client":"cli"}'   # session + brief
beehaven call agent-brief '{}'                                                # brief, standalone
```

It carries: prior **sessions**, **lastActions**, **focus**, **assignedToMe**, **awaitingApproval**,
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
