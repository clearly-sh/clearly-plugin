---
name: clearly-workflows
description: >-
  Use the Clearly workspace as a COMPANY BRAIN — search the org's accumulated
  context (decisions, facts, prompts, docs), write conclusions back so the next
  agent inherits them instead of re-deriving them, and inherit the team's
  skills. Use when a question is about what this company already decided or
  knows, and after you work something out that the next person would otherwise
  rediscover. Triggers: "what did we decide", "why did we do it this way", "has
  anyone looked at this", "remember this", "write that down", "what do we know
  about X", "company context", "our decisions", "prior art", "institutional
  knowledge", "so nobody has to work this out again".
---

> **Tool names below are written UNPREFIXED** (`clearly_canvas_act`). Your runtime may
> expose them with a server prefix — e.g.
> `mcp__plugin_clearly_clearly-staging__clearly_canvas_act`. **Match by suffix, not by
> exact name**: a skill written against the bare name resolves to nothing otherwise, and
> the failure looks like "the tool doesn't exist" rather than "the name is decorated".
>
> **If no such tool is callable at all**, the Clearly MCP server isn't authorised in this
> session — note that these skills still LIST when it isn't, so you find out by firing a
> dead call. Authorise it (`/mcp`, or `claude mcp`), or if you have a shell, use the
> `beehaven` CLI and its own `clearly-canvas` skill instead.

# Working a Clearly workspace (Company Brain)

Clearly is a **company brain over MCP**: every prompt + agent response is auto-cataloged into a searchable, ranked archive, with documents, decisions, and durable facts alongside. Treat it the way you'd treat a repo — read before you write, and write so the next agent inherits your work.

If the `clearly` server isn't connected yet, run the `clearly-init` skill first.

## 1. Orient before you act

Call `clearly_context_map` once at the start. It returns the brain's size (prompts / responses / facts), the recurring topics, and the org/teams it can federate across. Use it to decide whether the answer already exists.

## 2. Retrieve context (don't re-derive it)

`clearly_context_search { query, scope?, kinds?, limit? }` is ONE ranked search across prompts, agent responses, documents/PRDs, and facts — use it instead of guessing or asking the user what they already decided.

- `scope: "workspace"` (default) searches this workspace.
- `scope: "org"` **federates across every workspace in the org**, merges + re-ranks by relevance, and excludes private artifacts + personal facts. Use it for "what has anyone on the team decided/built about X".
- `kinds`: narrow to `["document"]`, `["prompt"]`, etc.

Each hit carries `kind`, `ref` (the id to fetch in full), `title`, `snippet`, `score`, and `meta` (intent, tags, `sourceWorkspace`).

**Always search before writing** — it prevents duplicate PRDs/decisions and surfaces prior context you'd otherwise miss.

## 3. Write context BACK so it compounds

When you produce something durable — a PRD, a decision, a spec, a research summary — file it with `clearly_context_write`:

```jsonc
clearly_context_write {
  "title": "Per-seat billing decision",
  "body":  "We charge per seat; usage is per-seat with shared top-up overflow. Rationale: …",
  "kind":  "decision",          // doc | note | decision | prd
  "tags":  ["billing","pricing"],
  "fact":  "Billing is per-seat with shared top-up",   // optional one-line takeaway
  "private": false               // true → workspace-local, never federated across the org
}
```

It creates the document AND files a searchable catalog entry, so the very next `clearly_context_search` finds it. Mark anything sensitive `private: true`.

## 4. Inherit the team's skills

The workspace has its own skills (procedures the team grew). Before improvising a multi-step task, check whether one exists:

- `clearly_skill_list { includeWorkspace: true }` → the skill cards (name + when-to-use).
- `clearly_skill_get { id }` → the full step-by-step instructions for the one whose trigger matches.

Follow the loaded procedure rather than inventing your own — that's how you work *the way this workspace works*.

## Anything else

`clearly_workspace_catalog` lists all ~200 workspace actions with schemas; `clearly_workspace_invoke { action, input }` runs any of them. Reach for these when the typed tools above don't cover what you need.

## Rules of thumb

- **Read → act → write back.** Search first; file durable outcomes so they persist.
- **`scope:"org"`** for cross-team questions; **`private:true`** for sensitive writes.

<!-- A "Schedule your future self" section documenting `clearly_schedule_wake` was removed on
     2026-08-02: the tool is in ZERO entries of mcp-server.ts's tool list and `schedule-wake` is
     not a registered RPC, so every example here failed. Restore only when it is in tools/list. -->

- **Check `clearly_skill_list`** before hand-rolling a known procedure.
