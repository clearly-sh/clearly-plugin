---
name: clearly-workflows
description: How to actually USE a connected Clearly workspace as a company brain — retrieve org context, write decisions back so they compound, schedule your own follow-ups, and inherit the team's skills. Use whenever you're working in a repo/task that has the `clearly` MCP server connected and you need company context or want your work to persist for the next agent.
---

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

## 4. Schedule your future self

`clearly_schedule_wake` lets you write a prompt for a later invocation and fire it on a schedule:

```jsonc
// one-shot
clearly_schedule_wake { "prompt": "Check the launch metrics and summarize", "runAt": 1751000000000 }
// recurring
clearly_schedule_wake { "prompt": "Triage new tickets", "cronExpr": "0 9 * * 1" }
```

Best pattern — keep the prompt in the brain so edits take effect:
1. `clearly_context_write` the follow-up task (get back its id).
2. `clearly_schedule_wake { "promptRef": { "source": "document", "id": "<id>" }, "runAt": … }` — resolved fresh at fire time.

The wake re-invokes the agent with that prompt; its output is cataloged, so the loop compounds.

## 5. Inherit the team's skills

The workspace has its own skills (procedures the team grew). Before improvising a multi-step task, check whether one exists:

- `clearly_skill_list { includeWorkspace: true }` → the skill cards (name + when-to-use).
- `clearly_skill_get { id }` → the full step-by-step instructions for the one whose trigger matches.

Follow the loaded procedure rather than inventing your own — that's how you work *the way this workspace works*.

## Anything else

`clearly_workspace_catalog` lists all ~200 workspace actions with schemas; `clearly_workspace_invoke { action, input }` runs any of them. Reach for these when the typed tools above don't cover what you need.

## Rules of thumb

- **Read → act → write back.** Search first; file durable outcomes so they persist.
- **`scope:"org"`** for cross-team questions; **`private:true`** for sensitive writes.
- **`promptRef` over inline** for scheduled prompts, so the latest version fires.
- **Check `clearly_skill_list`** before hand-rolling a known procedure.
